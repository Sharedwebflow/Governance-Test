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
          role: "user",
          content: [
            {
              type: "text",
              text: `As a professional makeup artist, analyze this image and provide personalized makeup recommendations tailored to the individual's features. Focus on foundation shade matching and complementary makeup products. Ensure the recommendations are detailed, practical, and aligned with current beauty trends.

EXTREMELY IMPORTANT: You must make direct assertions rather than using phrases like "Identify if" or "Determine if". For example, instead of "Determine if the skin has a warm Undertone", say simply "Warm". Instead of "Identify if the skin is light Tone", say simply "Light". 

CRITICAL: For undertone, choose ONLY ONE of these options: Warm, Cool, or Neutral. 
CRITICAL: For skin tone, choose ONLY ONE of these options: Fair, Light, Medium, Tan, Deep, or Dark.

DO NOT include additional descriptors or instructional language in your responses. Format your response as follows:

Foundation Recommendation:
Undertone: [Warm/Cool/Neutral] – Determine based on visible skin characteristics.

Shade Description: [Light/Medium/Deep with distinguishing features like golden, olive, pink, etc.]

Suggested Foundation Shade: [Provide ONLY ONE specific shade recommendation from a well-known brand (e.g., Fenty Beauty, NARS, MAC, etc.)]

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

    // Look for the start of actual recommendations
    const startMarker = "Foundation Recommendation:";
    const startIndex = result.indexOf(startMarker);
    
    if (startIndex === -1) {
      throw new Error("Analysis does not contain makeup recommendations");
    }

    // Add the length of the marker to skip it in the output
    return result.substring(startIndex + startMarker.length);
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