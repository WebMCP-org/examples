import { type LiveConfig } from "../lib/clientTypes";

export const LLM_CONFIG: LiveConfig = 
{
  model: "models/gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: "text"
    // responseModalities: "audio", // Ensure this is one of the allowed types
    // speechConfig: {
    //   voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
    // },
  },
  systemInstruction: {
    parts: [{
      text: `You are a multi-tool assistant capable of multiple things
        Choose the appropriate tool based on the user's request. When you get the tool response,
        return the response to the user. Don't remove information that would be valuable to the user.

        MAKE SURE YOU ALWAYS ANSWER IN ENGLISH NO MATTER WHAT!!
        `,
    }],
  },
  tools: [
  ],
};