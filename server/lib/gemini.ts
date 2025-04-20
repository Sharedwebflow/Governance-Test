// This file acts as a re-export of OpenAI functions for compatibility
// We're using OpenAI but keeping the Gemini naming for backward compatibility
import { FacialAnalysis, analyzeFacialFeatures } from "./openai";

export { FacialAnalysis };
export { analyzeFacialFeatures };