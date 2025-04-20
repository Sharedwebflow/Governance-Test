import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export async function analyzeFacialFeatures(base64Image: string): Promise<string> {
  try {
    console.log('Starting OpenAI analysis with base64 image...');

    // Validate image first
    const validation = validateImage(base64Image);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid image format");
    }

    // Ensure the base64 image is properly formatted
    const formattedImageUrl = base64Image.startsWith('data:image')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;

    console.log('Image validated, preparing OpenAI API request...');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert makeup artist specializing in foundation shade matching with 20 years of experience. You must always provide a confident assessment of skin tone and undertone, even when image quality is less than perfect."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this selfie to determine skin tone, undertone, and provide foundation matching recommendations.

EXTREMELY IMPORTANT:
1. For UNDERTONE, you must choose EXACTLY ONE option: Warm, Cool, or Neutral. 
2. For SKIN TONE, you must choose EXACTLY ONE option: Fair, Light, Medium, Tan, Deep, or Dark.
3. Never use phrases like "I think" or "appears to be" - always make direct, confident assertions.
4. Be extremely concise and direct in your assessment.

Your response must follow this exact format:

Foundation Recommendation:
Undertone: [Warm/Cool/Neutral] – Determine based on visible skin characteristics.

Skin Tone: [EXACTLY ONE choice from: Fair, Light, Medium, Tan, Deep, or Dark]

Suggested Foundation: [ONE specific recommendation, e.g., "MAC Studio Fix in NC30"]

Complementary Products:
Concealer

Shade: [Specific recommendation that complements the foundation]

Best For: [Under eyes, spot coverage, brightening, etc.]

Blush

Color Family: [Coral, pink, mauve, etc., based on skin tone]

Finish: [Matte, shimmer, satin]

Suggested Shades: [1-2 specific product recommendations]

Eye Products

Eyeshadow Palette: [Specific recommendation suited to the individual’s eye color and skin tone]

Complementary Colors: [List 2-3 shades that enhance the person’s features]

Eyeliner: [Type (gel, liquid, pencil) and color recommendation]

Lip Products

Color Family: [Nude, pink, berry, etc.]

Finish: [Matte, gloss, satin]

Suggested Shades: [1-2 specific product recommendations]

Application Tips:
[Provide 2-3 expert makeup tips based on the individual's features, such as blending techniques, placement strategies, or product layering for long wear.]

Ensure the response remains focused on makeup recommendations only—do not analyze skin conditions or provide medical advice. The recommendations should be tailored to enhance the person’s natural beauty while considering undertones and facial structure. DO NOT start the response with "I'm unable to analyze the image for makeup recommendations. However, I can offer general advice on how to choose and apply makeup based on common skin tones and preferences." or any similar phrases`
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.5
    });

    console.log('OpenAI API response received');

    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error("No analysis generated");
    }

    // For backwards compatibility, try to extract undertone and skin tone from text response
    // but don't throw an error if we can't find it - we'll use defaults instead
    const undertoneMatch = result.match(/Undertone:\s+([A-Za-z]+)/i);
    const skinToneMatch = result.match(/Skin\s+Tone:\s+([A-Za-z]+)/i);
    
    if (result.includes('NO_FACE_DETECTED')) {
      console.error('Analysis failed: No face detected in image');
      throw new Error('No face detected in the image. Please upload a clear photo showing a face.');
    }

    if (!undertoneMatch && !skinToneMatch) {
      console.error('Analysis failed with response:', result);
      console.log("Could not extract undertone or skin tone from response, using defaults");
      // Don't throw an error - we'll use default values on the client side
    }

    // Just return the full response - we'll parse it on the client side
    console.log("Analysis completed successfully");
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateImage(base64String: string): { isValid: boolean; error?: string } {
  try {
    // Check if it's a valid base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(base64String)) {
      return { isValid: false, error: "Invalid base64 format" };
    }

    // Check file size (20MB limit)
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 20) {
      return { isValid: false, error: "Image size exceeds 20MB limit" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Failed to validate image" };
  }
}

export interface FacialAnalysis {
  skinType: string;
  concerns: string[];
  features: {
    moisture: string;
    acne: string;
    darkSpots: string;
    pores: string;
    wrinkles: string;
    texture: string;
    redness: string;
    elasticity: string;
  };
  recommendations: {
    category: string;
    productType: string;
    reason: string;
    priority: number;
    ingredients: string[];
  }[];
}