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

export async function analyzeFacialFeatures(base64Image: string): Promise<FacialAnalysis> {
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
              text: `As a dermatologist, analyze this facial image and provide a detailed skin assessment. Format your response exactly as follows (replace text in brackets):

Skin Type: [dry/oily/combination/normal]
Concerns:
- [concern 1]
- [concern 2]
...

Features:
Moisture: [description]
Acne: [description]
Dark Spots: [description]
Pores: [description]
Wrinkles: [description]
Texture: [description]
Redness: [description]
Elasticity: [description]

Recommendations:
1. Category: [type]
   Product Type: [specific product]
   Reason: [why needed]
   Priority: [1-5]
   Key Ingredients:
   - [ingredient 1]
   - [ingredient 2]
   ...`
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
      console.error('No content in OpenAI response');
      throw new Error("No analysis generated");
    }

    console.log('Parsing OpenAI response into JSON...');

    // Parse the formatted string into JSON
    const lines = result.split('\n');
    const analysisData: FacialAnalysis = {
      skinType: '',
      concerns: [],
      features: {
        moisture: '',
        acne: '',
        darkSpots: '',
        pores: '',
        wrinkles: '',
        texture: '',
        redness: '',
        elasticity: ''
      },
      recommendations: []
    };

    let currentSection = '';
    let currentRecommendation: any = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('Skin Type:')) {
        analysisData.skinType = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine === 'Concerns:') {
        currentSection = 'concerns';
      } else if (trimmedLine === 'Features:') {
        currentSection = 'features';
      } else if (trimmedLine === 'Recommendations:') {
        currentSection = 'recommendations';
      } else if (trimmedLine.startsWith('-') && currentSection === 'concerns') {
        analysisData.concerns.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'features') {
        const [key, value] = trimmedLine.split(':').map(s => s.trim());
        if (value && key.toLowerCase() in analysisData.features) {
          (analysisData.features as any)[key.toLowerCase()] = value;
        }
      } else if (currentSection === 'recommendations') {
        if (trimmedLine.startsWith('Category:')) {
          if (currentRecommendation) {
            analysisData.recommendations.push(currentRecommendation);
          }
          currentRecommendation = {
            category: trimmedLine.split(':')[1].trim(),
            productType: '',
            reason: '',
            priority: 1,
            ingredients: []
          };
        } else if (currentRecommendation) {
          if (trimmedLine.startsWith('Product Type:')) {
            currentRecommendation.productType = trimmedLine.split(':')[1].trim();
          } else if (trimmedLine.startsWith('Reason:')) {
            currentRecommendation.reason = trimmedLine.split(':')[1].trim();
          } else if (trimmedLine.startsWith('Priority:')) {
            currentRecommendation.priority = parseInt(trimmedLine.split(':')[1].trim(), 10);
          } else if (trimmedLine.startsWith('-')) {
            currentRecommendation.ingredients.push(trimmedLine.substring(1).trim());
          }
        }
      }
    }

    // Add the last recommendation if exists
    if (currentRecommendation) {
      analysisData.recommendations.push(currentRecommendation);
    }

    // Validate required fields
    if (!analysisData.skinType || !analysisData.concerns.length || !Object.values(analysisData.features).every(v => v) || !analysisData.recommendations.length) {
      console.error('Invalid response structure:', analysisData);
      throw new Error("Invalid response format: missing required fields");
    }

    return analysisData;
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Failed to analyze facial features. Please try again.');
  }
}