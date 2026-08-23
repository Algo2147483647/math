import type { AiProvider } from "./types";

export interface AiProviderPreset {
  label: string;
  logoSrc: string;
  baseUrl: string;
  model: string;
}

export const AI_PROVIDER_PRESETS: Record<AiProvider, AiProviderPreset> = {
  "openai-compatible": { label: "OpenAI compatible", logoSrc: "/assets/providers/openai.png", baseUrl: "https://api.openai.com/v1", model: "gpt-4.1-mini" },
  deepseek: { label: "DeepSeek", logoSrc: "/assets/providers/deepseek-icon.png", baseUrl: "https://api.deepseek.com", model: "deepseek-v4-flash" },
  anthropic: { label: "Anthropic", logoSrc: "/assets/providers/anthropic.png", baseUrl: "https://api.anthropic.com", model: "claude-3-5-sonnet-latest" },
  gemini: { label: "Gemini", logoSrc: "/assets/providers/gemini.svg", baseUrl: "https://generativelanguage.googleapis.com", model: "gemini-1.5-flash" },
  ollama: { label: "Ollama", logoSrc: "/assets/providers/ollama.png", baseUrl: "http://localhost:11434", model: "llama3.1" },
};

export const AI_PROVIDER_ENTRIES = Object.entries(AI_PROVIDER_PRESETS) as Array<[AiProvider, AiProviderPreset]>;
