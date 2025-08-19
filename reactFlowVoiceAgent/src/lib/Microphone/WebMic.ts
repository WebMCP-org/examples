/**
 * Copyright 2024 Google LLC
 * Copyright 2025 Akhil Gogineni
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventEmitter } from 'eventemitter3';

interface AudioRecorderEvents {
  data: (base64: string) => void;
  error: (error: Error) => void;
  start: () => void;
  stop: () => void;
}

const webWorkletCode = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  buffer = new Int16Array(2048);
  bufferWriteIndex = 0;

  process(inputs) {
    if (inputs[0].length) {
      const channel0 = inputs[0][0];
      this.processChunk(channel0);
    }
    return true;
  }

  sendAndClearBuffer(){
    this.port.postMessage({
      event: "chunk",
      data: {
        int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
      },
    });
    this.bufferWriteIndex = 0;
  }

  processChunk(float32Array) {
    const l = float32Array.length;
    for (let i = 0; i < l; i++) {
      const int16Value = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
      this.buffer[this.bufferWriteIndex++] = int16Value;
      if (this.bufferWriteIndex >= this.buffer.length) {
        this.sendAndClearBuffer();
      }
    }
  }
}
registerProcessor('audio-recorder-worklet', AudioProcessingWorklet);`;


function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class WebMic extends EventEmitter<AudioRecorderEvents> {
  private isRecording = false;
  private audioContext?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private stream?: MediaStream;
  private workletNode?: AudioWorkletNode;
  private workletUrl?: string;

  async start(): Promise<this> {
    if (this.isRecording) return this;

    try {
      await this.startRecording();
      this.isRecording = true;
      this.emit('start');
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }

    return this;
  }

  private async startRecording(): Promise<void> {
    // Request microphone access
    this.stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    });

    // Create audio context with desired sample rate
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // Create worklet URL and add module
    this.workletUrl = URL.createObjectURL(
      new Blob([webWorkletCode], { type: 'application/javascript' })
    );
    await this.audioContext.audioWorklet.addModule(this.workletUrl);

    // Create and configure worklet node
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-recorder-worklet');

    this.workletNode.port.onmessage = (event) => {
      const buffer = event.data.data.int16arrayBuffer;
      const base64 = arrayBufferToBase64(buffer);
      this.emit('data', base64);
    };

    this.workletNode.port.onmessageerror = (error) => {
      this.emit('error', new Error('Worklet message error: ' + error));
    };

    // Connect the audio graph
    this.source.connect(this.workletNode);
  }

  stop(): this {
    if (!this.isRecording) return this;

    try {
      // Disconnect audio nodes
      if (this.source && this.workletNode) {
        this.source.disconnect(this.workletNode);
      }

      // Stop all media tracks
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }

      // Clean up worklet URL
      if (this.workletUrl) {
        URL.revokeObjectURL(this.workletUrl);
      }

      // Reset references
      this.audioContext = undefined;
      this.source = undefined;
      this.stream = undefined;
      this.workletNode = undefined;
      this.workletUrl = undefined;

      this.isRecording = false;
      this.emit('stop');
    } catch (error) {
      this.emit('error', error as Error);
    }

    return this;
  }

  destroy(): void {
    this.stop();
    this.removeAllListeners();
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  // Utility method to check if Web Audio API is supported
  static isSupported(): boolean {
    return !!(
      window.AudioContext || 
      (window as any).webkitAudioContext
    ) && !!navigator.mediaDevices?.getUserMedia;
  }

  // Get current audio context state
  getAudioContextState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }

  // Resume audio context if suspended (useful for handling autoplay policies)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export default WebMic;