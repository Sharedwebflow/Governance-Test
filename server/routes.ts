import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFacialFeatures } from "./lib/openai";
import { setupAuth } from "./auth";

// Add middleware to check if user is authenticated
function requireAuth(req: Request, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized - Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  app.post("/api/analyze", async (req, res) => {
    try {
      console.log('Received analyze request');
      const { image } = req.body;
      let userId = req.isAuthenticated() ? (req.user as any).id : null;

      if (!image) {
        return res.status(400).json({ message: "Please upload an image to analyze" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      // Validate base64 format
      if (!/^[A-Za-z0-9+/=]+$/.test(image)) {
        console.error('Invalid base64 format received');
        return res.status(400).json({ 
          message: "Invalid image format. Please ensure you're uploading a valid image." 
        });
      }

      console.log('Image validation passed, starting analysis...');

      try {
        console.log('Starting facial analysis...');
        const analysisText = await analyzeFacialFeatures(image);
        console.log('Analysis completed successfully');

        // Parse the analysis text to extract key information
        const skinType = extractValue(analysisText, "Skin Type") || "Normal";
        const undertone = extractValue(analysisText, "Undertone") || null;
        
        // Extract foundation shades if mentioned
        const foundationLines = analysisText.split('\n').filter(line => 
          line.includes("Foundation") || line.includes("Shade"));
        const foundationShades = foundationLines.length > 0 
          ? { suggestions: foundationLines } 
          : {};
          
        // Extract concerns from the text
        const concerns = extractConcerns(analysisText);
        
        // Create recommendations object from the analysis text
        const recommendations = extractRecommendations(analysisText);
        
        // If user is authenticated, save the analysis to their account
        let savedAnalysis = null;
        if (userId) {
          savedAnalysis = await storage.createAnalysis({
            userId,
            imageUrl: `data:image/jpeg;base64,${image.substring(0, 100)}...`, // Only store a truncated version
            skinType,
            undertone,
            concerns,
            recommendations,
            foundationShades,
            features: {}
          });
        }

        return res.json({ 
          analysis: analysisText,
          savedAnalysis
        });
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        return res.status(500).json({ 
          message: analysisError instanceof Error ? analysisError.message : "Analysis failed. Please try again.",
          code: 500
        });
      }
    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ 
        message: "An unexpected error occurred. Please try again.",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch products by category",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  });

  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysisId = Number(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }

      const analysis = await storage.getAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      return res.json(analysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  app.get("/api/analysis/:id/recommendations", async (req, res) => {
    try {
      const analysis = await storage.getAnalysis(Number(req.params.id));
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      const recommendedProducts = await storage.getRecommendedProducts(analysis);
      return res.json(recommendedProducts);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return res.status(500).json({ 
        message: "Failed to fetch product recommendations",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // User-related routes
  app.get("/api/user/analyses", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const analyses = await storage.getUserAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      res.status(500).json({ 
        message: "Failed to fetch user analyses",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.get("/api/user/products", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const products = await storage.getUserProducts(userId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
      res.status(500).json({ 
        message: "Failed to fetch user products",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.post("/api/user/products", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const userProduct = await storage.addUserProduct({ 
        userId,
        productId: Number(productId),
        isFavorite: 0
      });
      
      res.status(201).json(userProduct);
    } catch (error) {
      console.error('Error adding user product:', error);
      res.status(500).json({ 
        message: "Failed to add product to user account",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.post("/api/user/products/:productId/favorite", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const productId = Number(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const userProduct = await storage.toggleFavorite(userId, productId);
      res.json(userProduct);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ 
        message: "Failed to toggle favorite status",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.delete("/api/user/products/:productId", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const productId = Number(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      await storage.removeUserProduct(userId, productId);
      res.status(204).end();
    } catch (error) {
      console.error('Error removing user product:', error);
      res.status(500).json({ 
        message: "Failed to remove product from user account",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { skinTone, undertone, name } = req.body;
      
      // Only allow certain fields to be updated
      const updateData: any = {};
      if (skinTone) updateData.skinTone = skinTone;
      if (undertone) updateData.undertone = undertone;
      if (name) updateData.name = name;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ 
        message: "Failed to update user profile",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions to extract information from the analysis text
function extractValue(text: string, key: string): string | null {
  const regex = new RegExp(`${key}\\s*:\\s*([^\\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractConcerns(text: string): string[] {
  const concerns: string[] = [];
  
  // Look for concerns in the text
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('concern') || 
        line.toLowerCase().includes('issue') || 
        line.toLowerCase().includes('problem')) {
      const potentialConcern = line.split(':').pop()?.trim();
      if (potentialConcern && !concerns.includes(potentialConcern)) {
        concerns.push(potentialConcern);
      }
    }
  }
  
  // If no explicit concerns found, extract common skin concerns
  if (concerns.length === 0) {
    const commonConcerns = ['dryness', 'oiliness', 'acne', 'aging', 'wrinkles',
                           'dark spots', 'pigmentation', 'redness', 'sensitive'];
    for (const concern of commonConcerns) {
      if (text.toLowerCase().includes(concern)) {
        concerns.push(concern.charAt(0).toUpperCase() + concern.slice(1));
      }
    }
  }
  
  // Always return at least one concern
  if (concerns.length === 0) {
    concerns.push('General Skin Care');
  }
  
  return concerns;
}

function extractRecommendations(text: string): any[] {
  const recommendations: any[] = [];
  
  // Extract different product type sections
  const sections = [
    { type: 'Foundation', category: 'foundation' },
    { type: 'Concealer', category: 'concealer' },
    { type: 'Blush', category: 'blush' },
    { type: 'Eyeshadow', category: 'eyeshadow' },
    { type: 'Eyeliner', category: 'eyeliner' },
    { type: 'Lipstick', category: 'lipstick' },
    { type: 'Lip', category: 'lip' },
    { type: 'Moisturizer', category: 'moisturizer' },
    { type: 'Serum', category: 'serum' },
    { type: 'Cleanser', category: 'cleanser' }
  ];
  
  for (const section of sections) {
    const sectionRegex = new RegExp(`${section.type}[\\s\\S]*?(?=\\n\\n|$)`, 'i');
    const match = text.match(sectionRegex);
    
    if (match) {
      const sectionText = match[0];
      const shadeMatch = sectionText.match(/Shade[s]?:?\s*([^\n]+)/i);
      const colorMatch = sectionText.match(/Color[s]?:?\s*([^\n]+)/i);
      const ingredientsMatch = sectionText.match(/Ingredient[s]?:?\s*([^\n]+)/i);
      
      const recommendation = {
        category: section.category,
        productType: section.type,
        reason: `Recommended for your ${section.category} needs`,
        priority: recommendations.length + 1,
        ingredients: []
      };
      
      if (shadeMatch) {
        recommendation.reason += ` - ${shadeMatch[1].trim()}`;
      }
      
      if (colorMatch) {
        recommendation.reason += ` - ${colorMatch[1].trim()}`;
      }
      
      if (ingredientsMatch) {
        const ingredientsText = ingredientsMatch[1].trim();
        const ingredients = ingredientsText.split(/,|\band\b/).map(i => i.trim());
        recommendation.ingredients = ingredients;
      }
      
      recommendations.push(recommendation);
    }
  }
  
  // If no specific product recommendations found, add a generic one
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'foundation',
      productType: 'Foundation',
      reason: 'Recommended for your skin tone and type',
      priority: 1,
      ingredients: ['Hydrating formula']
    });
  }
  
  return recommendations;
}