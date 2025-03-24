import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

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
              text: `As a dermatologist, analyze this facial image and provide a detailed skin assessment. Format your response as follows:

Skin Type: [dry/oily/combination/normal]

Concerns:
- [List main skin concerns]

Features Analysis:
- Moisture: [Describe hydration level]
- Acne: [Describe any breakouts or acne concerns]
- Dark Spots: [Describe pigmentation]
- Pores: [Describe pore condition]
- Wrinkles: [Describe fine lines]
- Texture: [Describe skin texture]
- Redness: [Describe inflammation]
- Elasticity: [Describe skin firmness]

Recommended Products:
1. [Product Category]
   - Type: [specific product type]
   - Why: [reason for recommendation]
   - Priority: [1-5]
   - Key Ingredients:
     * [ingredient 1]
     * [ingredient 2]
`
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

    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}