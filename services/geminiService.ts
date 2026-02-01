
import { GoogleGenAI, Type } from "@google/genai";
import { LoveLetterConfig } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMoodVibe = async (userMood: string): Promise<string> => {
  const ai = getAI();
  const prompt = `The user is feeling: "${userMood}". Provide a concise, poetic vibe check for a media pairing (60 words max).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Aura AI, a professional mood curator.",
        temperature: 0.8,
      },
    });
    return response.text || "Connection lost in the nebula.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The stars are quiet tonight.";
  }
};

// 为 Pro 用户生成情绪艺术图
export const generateMoodImage = async (userMood: string): Promise<string | null> => {
  const ai = getAI();
  const prompt = `A high-end, cinematic, abstract digital art representing the emotion: "${userMood}". 
  Style: Minimalist, ethereal, deep lighting, 4K, trending on ArtStation, futuristic aura.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const generateLoveLetter = async (config: LoveLetterConfig): Promise<string> => {
  const ai = getAI();
  const prompt = `Write a ${config.tone} love letter to ${config.recipientName} for ${config.occasion}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a master of emotion.",
        temperature: 0.9,
      },
    });
    return response.text || "My words fail me.";
  } catch (error) {
    return "The ink has run dry.";
  }
};
