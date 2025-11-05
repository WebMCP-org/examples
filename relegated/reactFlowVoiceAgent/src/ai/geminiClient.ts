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

import type { Content, GenerativeContentBlob, Part } from "@google/generative-ai";
import { EventEmitter } from "eventemitter3";
import { difference } from "lodash";
import {
  type ClientContentMessage,
  isInterrupted,
  isModelTurn,
  isServerContentMessage,
  isSetupCompleteMessage,
  isToolCallCancellationMessage,
  isToolCallMessage,
  isTurnComplete,
  type LiveIncomingMessage,
  type RealtimeInputMessage,
  type SetupMessage,
  type ToolCall,
  type ToolCallCancellation,
  type ToolResponseMessage,
  type ShellCommandMessage,
  type LiveConfig,
  type ShellResponseMessage,
} from "../lib/clientTypes";

import { blobToJSON, base64ToArrayBuffer } from "../lib/utils";

/**
 * the events that this client will emit
 */
interface MultimodalLiveClientEventTypes {
  open: () => void;
  close: (reason: string) => void;
  setupcomplete: () => void;
  audio: (data: ArrayBuffer) => void;
  toolcall: (toolCall: ToolCall) => void;
  turncomplete: (fullResponse: string) => void;
  toolcallcancellation: (toolcallCancellation: ToolCallCancellation) => void;
  interrupted: () => void;
}

export type MultimodalLiveAPIClientConnection = {
  apiKey: string;
};


let fullResponse = ""


export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
  public ws: WebSocket | null = null;
  protected config: LiveConfig | null = null;
  public url: string = "";
  public getConfig() {
    return { ...this.config };
  }


  constructor({ apiKey }: MultimodalLiveAPIClientConnection) {
    super();
    this.url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    this.send = this.send.bind(this);
  }


  connect(config: LiveConfig): Promise<boolean> {
    this.config = config;

    const ws = new WebSocket(this.url);

    ws.addEventListener("message", async (evt: MessageEvent) => {
      if (evt.data instanceof Blob) {
        this.receive(evt.data);
      } else {
        console.log("non blob message", evt);
      }
    });

    return new Promise((resolve, reject) => {
      const onError = (ev: Event) => {
        this.disconnect(ws);
        const message = `Could not connect to "${this.url}"`;
        reject(new Error(message));
      };
      ws.addEventListener("error", onError);
      ws.addEventListener("open", (ev: Event) => {
        if (!this.config) {
          reject("Invalid config sent to `connect(config)`");
          return;
        }
        this.emit("open");

        this.ws = ws;

        const setupMessage: SetupMessage = {
          setup: this.config,
        };
        this._sendDirect(setupMessage);

        ws.removeEventListener("error", onError);
        ws.addEventListener("close", (ev: CloseEvent) => {
          this.disconnect(ws);
          let reason = ev.reason || "";
          if (reason.toLowerCase().includes("error")) {
            const prelude = "ERROR]";
            const preludeIndex = reason.indexOf(prelude);
            if (preludeIndex > 0) {
              reason = reason.slice(
                preludeIndex + prelude.length + 1,
                Infinity,
              );
            }
          }

          this.emit("close", reason);
        });
        resolve(true);
      });
    });
  }

  
  disconnect(ws?: WebSocket) {
    if ((!ws || this.ws === ws) && this.ws) {
      this.ws.close();
      this.ws = null;
      return true;
    }
    return false;
  }


  /**
   * send realtimeInput, this is base64 chunks of "audio/pcm" and/or "image/jpg"
   */
  sendRealtimeInput(chunks: GenerativeContentBlob[]) {
    let hasAudio = false;
    let hasVideo = false;
    for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i];
      if (ch.mimeType.includes("audio")) {
        hasAudio = true;
      }
      if (ch.mimeType.includes("image")) {
        hasVideo = true;
      }
      if (hasAudio && hasVideo) {
        break;
      }
    }

    const data: RealtimeInputMessage = {
      realtimeInput: {
        mediaChunks: chunks,
      },
    };
    this._sendDirect(data);
  }

  /**
   *  send a response to a function call and provide the id of the functions you are responding to
   */
  sendToolResponse(toolResponse: ToolResponseMessage["toolResponse"]) {
    const message: ToolResponseMessage = {
      toolResponse,
    };

    this._sendDirect(message);
  }


  /**
   * send normal content parts such as { text }
   */
  send(parts: Part | Part[], turnComplete: boolean = true) {
    parts = Array.isArray(parts) ? parts : [parts];
    const content: Content = {
      role: "user",
      parts,
    };

    const clientContentRequest: ClientContentMessage = {
      clientContent: {
        turns: [content],
        turnComplete,
      },
    };

    this._sendDirect(clientContentRequest);
  }


  /**
   *  used internally to send all messages
   *  don't use directly unless trying to send an unsupported message type
   */
  _sendDirect(request: SetupMessage | ClientContentMessage | ToolResponseMessage | RealtimeInputMessage | ShellCommandMessage | ShellResponseMessage) {
    if (!this.ws) {
      throw new Error("WebSocket is not connected");
    }
    const str = JSON.stringify(request);
    this.ws.send(str);
  }



  // THE MODEL'S RESPONSE HANDLER
  async receive(blob: Blob) {
    // console.log("receive", blob);

    const response: LiveIncomingMessage = (await blobToJSON(
      blob,
    )) as LiveIncomingMessage;

    
    if (isToolCallMessage(response)) {
      fullResponse = "";
      this.emit("toolcall", response.toolCall);
      return;
    }

    if (isToolCallCancellationMessage(response)) {
      this.emit("toolcallcancellation", response.toolCallCancellation);
      return;
    }

    if (isSetupCompleteMessage(response)) {
      this.emit("setupcomplete");
      return;
    }

    if (isServerContentMessage(response)) {
      const { serverContent } = response;
      if (isInterrupted(serverContent)) {
        this.emit("interrupted");
        return;
      }
      if (isTurnComplete(serverContent)) {
        this.emit("turncomplete", fullResponse);
        fullResponse = "";
      }

      if (isModelTurn(serverContent)) {
        let parts: Part[] = serverContent.modelTurn.parts;

        // when its audio that is returned for modelTurn
        const audioParts = parts.filter(
          (p) => p.inlineData && p.inlineData.mimeType.startsWith("audio/pcm"),
        );

        // strip the audio parts out of the modelTurn
        let textParts = parts

        if (audioParts.length > 0) {
          const base64s = audioParts.map((p) => p.inlineData?.data);

          base64s.forEach((b64) => {
            if (b64) {
              const data = base64ToArrayBuffer(b64);
              this.emit("audio", data);
            }
          });

          textParts = difference(parts, audioParts);
        }

        if (!textParts.length) {
          return;
        }
 
        const part = textParts.map((p) => p.text).join("");
        fullResponse += part;
      }
    } else {
      console.log("received unmatched message", response);
    }
  }
}