// import { Platform, NativeModules, NativeEventEmitter } from 'react-native-web';
// import { EventEmitter } from 'eventemitter3';
// import AudioRecord from 'react-native-audio-record';

// interface AudioRecorderEvents {
//   data: (base64: string) => void;
//   error: (error: Error) => void;
//   start: () => void;
//   stop: () => void;
// }

// const webWorkletCode = `
// class AudioProcessingWorklet extends AudioWorkletProcessor {
//   buffer = new Int16Array(2048);
//   bufferWriteIndex = 0;

//   process(inputs) {
//     if (inputs[0].length) {
//       const channel0 = inputs[0][0];
//       this.processChunk(channel0);
//     }
//     return true;
//   }

//   sendAndClearBuffer(){
//     this.port.postMessage({
//       event: "chunk",
//       data: {
//         int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
//       },
//     });
//     this.bufferWriteIndex = 0;
//   }

//   processChunk(float32Array) {
//     const l = float32Array.length;
//     for (let i = 0; i < l; i++) {
//       const int16Value = float32Array[i] * 32768;
//       this.buffer[this.bufferWriteIndex++] = int16Value;
//       if (this.bufferWriteIndex >= this.buffer.length) {
//         this.sendAndClearBuffer();
//       }
//     }
//     if (this.bufferWriteIndex >= this.buffer.length) {
//       this.sendAndClearBuffer();
//     }
//   }
// }
// registerProcessor('audio-recorder-worklet', AudioProcessingWorklet);
// `;

// function arrayBufferToBase64(buffer: ArrayBuffer) {
//   const bytes = new Uint8Array(buffer);
//   let binary = '';
//   for (let i = 0; i < bytes.byteLength; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return btoa(binary);
// }

// export class UnifiedAudioRecorder extends EventEmitter<AudioRecorderEvents> {
//   private isRecording = false;
//   private audioContext?: AudioContext;
//   private source?: MediaStreamAudioSourceNode;
//   private stream?: MediaStream;
//   private nativeSubscription?: any;

//   async start(): Promise<this> {
//     if (this.isRecording) return this;

//     if (Platform.OS === 'web') {
//       await this.startWeb();
//     } else {
//       await this.startNative();
//     }

//     this.isRecording = true;
//     this.emit('start');
//     return this;
//   }

//   private async startWeb() {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     this.stream = stream;

//     const context = new AudioContext({ sampleRate: 16000 });
//     this.audioContext = context;
//     const source = context.createMediaStreamSource(stream);
//     this.source = source;

//     const workletUrl = URL.createObjectURL(new Blob([webWorkletCode], { type: 'application/javascript' }));
//     await context.audioWorklet.addModule(workletUrl);

//     const node = new AudioWorkletNode(context, 'audio-recorder-worklet');

//     node.port.onmessage = (e) => {
//       const buf = e.data.data.int16arrayBuffer;
//       const base64 = arrayBufferToBase64(buf);
//       this.emit('data', base64);
//     };

//     source.connect(node);
//   }

//   private async startNative() {
//     AudioRecord.init({
//       sampleRate: 16000,
//       channels: 1,
//       bitsPerSample: 16,
//       audioSource: 6, // VOICE_RECOGNITION
//       wavFile: 'test.wav'
//     });

//     const emitter = new NativeEventEmitter(NativeModules.AudioRecord);
//     this.nativeSubscription = emitter.addListener('data', (chunk) => {
//       this.emit('data', chunk); // Already base64 PCM16
//     });

//     AudioRecord.start();
//   }

//   stop(): this {
//     if (!this.isRecording) return this;

//     if (Platform.OS === 'web') {
//       this.source?.disconnect();
//       this.stream?.getTracks().forEach((t) => t.stop());
//       this.audioContext?.close();
//       this.audioContext = undefined;
//     } else {
//       AudioRecord.stop();
//       this.nativeSubscription?.remove();
//       this.nativeSubscription = null;
//     }

//     this.isRecording = false;
//     this.emit('stop');
//     return this;
//   }

//   destroy(): void {
//     this.stop();
//     this.removeAllListeners();
//   }

//   getIsRecording(): boolean {
//     return this.isRecording;
//   }
// }

// export default UnifiedAudioRecorder;
