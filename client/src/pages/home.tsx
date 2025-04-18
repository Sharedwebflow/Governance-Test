import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LoadingAnalysis from "@/components/loading-analysis";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { 
  allProducts, 
  foundations, 
  concealers, 
  blushes, 
  eyeshadows, 
  skincare, 
  getFoundationsBySkinTone,
  getProductsByCategory,
  type Product
} from "@/lib/product-database";
import { 
  Sparkles, 
  Scan, 
  Heart, 
  Star, 
  Youtube, 
  ShoppingBag, 
  Palette, 
  CircleUser,
  ChevronRight
} from "lucide-react";

// Define interfaces for our analysis data
interface AnalysisFeatures {
  moisture?: string;
  acne?: string;
  darkSpots?: string;
  pores?: string;
  wrinkles?: string;
  texture?: string;
  redness?: string;
  elasticity?: string;
  [key: string]: string | undefined;
}

interface AnalysisRecommendation {
  category: string;
  productType: string;
  reason: string;
  priority: number;
  ingredients: string[];
}

interface AnalysisData {
  skinType: string;
  concerns: string[];
  features: AnalysisFeatures;
  recommendations: AnalysisRecommendation[];
  undertone?: string;
  skinTone?: string;
  [key: string]: any;
}

// Product data interface
interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  price: string;
  shadeFamily?: string;
  undertone?: string;
  videoUrl?: string;
  productUrl: string; // Official product page URL
}

// Foundation shade family visual guide
const shadeGuide = {
  "Fair": "linear-gradient(to right, #f8d5c2, #f3cfbd)",
  "Light": "linear-gradient(to right, #f0c5a7, #e5b897)",
  "Medium": "linear-gradient(to right, #e5b897, #d5a278)",
  "Tan": "linear-gradient(to right, #d5a278, #c18e63)",
  "Deep": "linear-gradient(to right, #b67b4f, #9e6b47)",
  "Dark": "linear-gradient(to right, #8d5b3d, #6d4832)",
  "Very Deep": "linear-gradient(to right, #6d4832, #513524)"
};

// Undertone visual guide
const undertoneGuide = {
  "Cool": "#f0d2d2", // Slightly pink
  "Neutral": "#e5d2b8", // Perfect middle
  "Warm": "#ecd5b0", // Slightly yellow
  "Olive": "#d2d2b8"  // Slightly green
};

export default function Home() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisData | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Updated tutorial videos with verified working YouTube embed links
  const tutorialVideos = {
    // Using direct iframe-friendly embed URLs with verified working videos
    "foundation": "https://www.youtube.com/embed/ZD92D2qQW8U", // Fenty foundation tutorial by Rihanna
    "concealer": "https://www.youtube.com/embed/n5YbJ8LzI2M", // NARS concealer tutorial
    "blush": "https://www.youtube.com/embed/BHdpCHFL0GQ", // Rare Beauty blush tutorial
    "eyeshadow": "https://www.youtube.com/embed/qEQq1wx_4Ro", // Urban Decay Naked palette tutorial
    "lipstick": "https://www.youtube.com/embed/Ow0Jr-0qzZs" // Charlotte Tilbury lipstick application
  };

  const analyzeMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await apiRequest("POST", "/api/analyze", { image: base64Image });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to analyze image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
      
      try {
        // Try to parse the analysis data
        let parsedData: AnalysisData;
        if (typeof data.analysis === 'string') {
          // For simplicity, extract key information using regex with improved pattern matching
          // This is specifically for foundation shade matching
          // First try the new format with cleaner labels
          const newFormatSkinTone = data.analysis.match(/Skin\s+Tone:\s+([A-Za-z]+)/i);
          const newFormatUndertone = data.analysis.match(/Undertone:\s+([A-Za-z]+)/i);
          
          // Fallback to older formats if needed
          const skinToneMatch = newFormatSkinTone || 
                         data.analysis.match(/skin tone[:\s]+([^\n.,]+)/i) || 
                         data.analysis.match(/shade description[:\s]+([^\n.,]+)/i);
          const undertoneMatch = newFormatUndertone || 
                          data.analysis.match(/undertone[:\s]+([^\n.,]+)/i);
          
          // Clean up any formatting and extract just the core value
          // Extract just the first word for undertone to get just Warm/Cool/Neutral
          const undertoneFullText = undertoneMatch ? undertoneMatch[1].trim() : 'Neutral';
          const cleanUndertone = undertoneFullText.split(/\s+/)[0].replace(/\*\*/g, '');
          
          // Extract the simple skin tone descriptor for consistency
          const skinToneFullText = skinToneMatch ? skinToneMatch[1].trim() : 'Medium';
          const simpleSkinTone = skinToneFullText.split(/\s+/)[0].replace(/\*\*/g, '');
          
          console.log('Extracted skin tone:', simpleSkinTone, 'Undertone:', cleanUndertone);
          
          parsedData = {
            skinType: data.skinType || 'Normal',
            concerns: data.concerns || [],
            features: {},
            recommendations: [],
            skinTone: simpleSkinTone,
            undertone: cleanUndertone
          };
          
          // Set structured data for the UI
          setParsedAnalysis(parsedData);
          
          // Generate sample product recommendations based on the analysis
          generateProductRecommendations(parsedData);
        } else if (typeof data.analysis === 'object') {
          setParsedAnalysis(data.analysis);
          generateProductRecommendations(data.analysis);
        }
      } catch (e) {
        console.error("Failed to parse analysis:", e);
        // We still have the raw analysis text, so the user will see something
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Use our curated product database for recommendations
  const generateProductRecommendations = (analysis: AnalysisData) => {
    // Get the skin tone and undertone from the analysis
    const skinTone = analysis.skinTone || 'Medium';
    const undertone = analysis.undertone || 'Neutral';
    
    console.log(`Finding products for ${skinTone} skin tone with ${undertone} undertone`);
    
    // Use getFoundationsBySkinTone from our product database to find matches
    const dbFoundations = getFoundationsBySkinTone(skinTone, undertone);
    
    // Ensure all foundations have video URLs
    const enhancedFoundations = dbFoundations.map(foundation => {
      if (!foundation.videoUrl) {
        return {
          ...foundation,
          videoUrl: tutorialVideos.foundation
        };
      }
      return foundation;
    });
    
    // Select products from other categories based on skin concerns
    const selectedProducts: Product[] = [];
    
    // Add 1-2 foundations
    selectedProducts.push(...enhancedFoundations.slice(0, 2));
    
    // Add a concealer
    const matchedConcealers = concealers.filter(concealer => {
      return (concealer.shadeFamily && 
              concealer.shadeFamily.toLowerCase().includes(skinTone.toLowerCase())) ||
             (concealer.undertone && 
              concealer.undertone.toLowerCase().includes(undertone.toLowerCase()));
    });
    
    if (matchedConcealers.length > 0) {
      const concealer = matchedConcealers[0];
      if (!concealer.videoUrl) {
        concealer.videoUrl = tutorialVideos.concealer;
      }
      selectedProducts.push(concealer);
    } else if (concealers.length > 0) {
      const concealer = concealers[0];
      if (!concealer.videoUrl) {
        concealer.videoUrl = tutorialVideos.concealer;
      }
      selectedProducts.push(concealer);
    }
    
    // Add a blush based on skin tone
    const matchedBlushes = blushes.filter(blush => {
      // Look for blushes whose name or description matches the undertone
      return blush.description.toLowerCase().includes(undertone.toLowerCase()) ||
             (blush.name.toLowerCase().includes(undertone.toLowerCase()));
    });
    
    if (matchedBlushes.length > 0) {
      const blush = matchedBlushes[0];
      if (!blush.videoUrl) {
        blush.videoUrl = tutorialVideos.blush;
      }
      selectedProducts.push(blush);
    } else if (blushes.length > 0) {
      // If no specific match, add a popular blush
      const blush = blushes[0];
      if (!blush.videoUrl) {
        blush.videoUrl = tutorialVideos.blush;
      }
      selectedProducts.push(blush);
    }
    
    // Add an eyeshadow palette based on undertone
    const matchedEyeshadows = eyeshadows.filter(eyeshadow => {
      return eyeshadow.undertone && 
             eyeshadow.undertone.toLowerCase().includes(undertone.toLowerCase());
    });
    
    if (matchedEyeshadows.length > 0) {
      const eyeshadow = matchedEyeshadows[0];
      if (!eyeshadow.videoUrl) {
        eyeshadow.videoUrl = tutorialVideos.eyeshadow;
      }
      selectedProducts.push(eyeshadow);
    } else if (eyeshadows.length > 0) {
      const eyeshadow = eyeshadows[0];
      if (!eyeshadow.videoUrl) {
        eyeshadow.videoUrl = tutorialVideos.eyeshadow;
      }
      selectedProducts.push(eyeshadow);
    }
    
    // Add a skincare product based on concerns
    if (analysis.concerns && analysis.concerns.length > 0) {
      let concernMatch = null;
      
      // Try to find a skincare product for a specific concern
      for (const concern of analysis.concerns) {
        const lowerConcern = concern.toLowerCase();
        
        // Check for specific concerns in skincare product descriptions
        const matchesForConcern = skincare.filter(product => {
          return product.description.toLowerCase().includes(lowerConcern);
        });
        
        if (matchesForConcern.length > 0) {
          concernMatch = matchesForConcern[0];
          break;
        }
      }
      
      // If we found a match, add it
      if (concernMatch) {
        selectedProducts.push(concernMatch);
      } else if (skincare.length > 0) {
        // Otherwise, add a general skincare product
        selectedProducts.push(skincare[0]);
      }
    } else if (skincare.length > 0) {
      // If no concerns, add a general skincare product
      selectedProducts.push(skincare[0]);
    }
    
    // Set the recommendations
    setRecommendedProducts(selectedProducts);
    if (skinTone.toLowerCase().includes('fair') || skinTone.toLowerCase().includes('light')) {
      if (undertone.toLowerCase().includes('cool')) {
        foundationMatches = [
          {
            id: 201,
            name: "Luminous Silk Foundation - Fair 002",
            brand: "Armani Beauty",
            category: "Foundation",
            description: "Buildable medium coverage for fair skin tones with cool pink undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
            price: "$42.99",
            shadeFamily: "Fair",
            undertone: "Cool",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
          }
        ];
      } else if (undertone.toLowerCase().includes('warm')) {
        foundationMatches = [
          {
            id: 202,
            name: "Luminous Silk Foundation - Fair 003",
            brand: "Armani Beauty",
            category: "Foundation",
            description: "Buildable medium coverage for fair skin tones with warm yellow undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
            price: "$42.99",
            shadeFamily: "Fair",
            undertone: "Warm",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
          }
        ];
      } else {
        foundationMatches = [
          {
            id: 200,
            name: "Luminous Silk Foundation - Fair 001",
            brand: "Armani Beauty",
            category: "Foundation",
            description: "Buildable medium coverage for the fairest skin tones with neutral undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
            price: "$42.99",
            shadeFamily: "Fair",
            undertone: "Neutral",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
          }
        ];
      }
    } else if (skinTone.toLowerCase().includes('medium')) {
      if (undertone.toLowerCase().includes('cool')) {
        foundationMatches = [
          {
            id: 221,
            name: "Double Wear Stay-in-Place Foundation - Medium Cool",
            brand: "Estée Lauder",
            category: "Foundation",
            description: "24-hour wear, flawless foundation for medium skin tones with cool pink undertones",
            imageUrl: "https://www.esteelauder.com/media/export/cms/products/640x640/el_sku_GM5F01_640x640_0.jpg",
            price: "$49.00",
            shadeFamily: "Medium",
            undertone: "Cool",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
          }
        ];
      } else if (undertone.toLowerCase().includes('warm')) {
        foundationMatches = [
          {
            id: 222,
            name: "Double Wear Stay-in-Place Foundation - Sand",
            brand: "Estée Lauder",
            category: "Foundation",
            description: "24-hour wear, flawless foundation for medium skin tones with warm golden undertones",
            imageUrl: "https://www.esteelauder.com/media/export/cms/products/640x640/el_sku_GM5F01_640x640_0.jpg",
            price: "$49.00",
            shadeFamily: "Medium",
            undertone: "Warm",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
          }
        ];
      } else {
        foundationMatches = [
          {
            id: 223,
            name: "Double Wear Stay-in-Place Foundation - Neutral",
            brand: "Estée Lauder",
            category: "Foundation",
            description: "24-hour wear, flawless foundation for medium skin tones with neutral undertones",
            imageUrl: "https://www.esteelauder.com/media/export/cms/products/640x640/el_sku_GM5F01_640x640_0.jpg",
            price: "$49.00",
            shadeFamily: "Medium",
            undertone: "Neutral",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
          }
        ];
      }
    } else if (skinTone.toLowerCase().includes('tan') || skinTone.toLowerCase().includes('deep') || skinTone.toLowerCase().includes('dark')) {
      if (undertone.toLowerCase().includes('cool')) {
        foundationMatches = [
          {
            id: 241,
            name: "Pro Filt'r Soft Matte Foundation - 390",
            brand: "Fenty Beauty",
            category: "Foundation",
            description: "Long-wear, light-as-air foundation for deep skin tones with cool undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
            price: "$39.00",
            shadeFamily: "Deep",
            undertone: "Cool",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
          }
        ];
      } else if (undertone.toLowerCase().includes('warm')) {
        foundationMatches = [
          {
            id: 242,
            name: "Pro Filt'r Soft Matte Foundation - 420",
            brand: "Fenty Beauty",
            category: "Foundation",
            description: "Long-wear, light-as-air foundation for deep skin tones with warm undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
            price: "$39.00",
            shadeFamily: "Deep",
            undertone: "Warm",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
          }
        ];
      } else {
        foundationMatches = [
          {
            id: 243,
            name: "Pro Filt'r Soft Matte Foundation - 445",
            brand: "Fenty Beauty",
            category: "Foundation",
            description: "Long-wear, light-as-air foundation for deep skin tones with neutral undertones",
            imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
            price: "$39.00",
            shadeFamily: "Deep",
            undertone: "Neutral",
            videoUrl: tutorialVideos.foundation,
            productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
          }
        ];
      }
    }
    
    // Add complementary products based on skin tone and undertone
    // We'll create collections for different skin tones and undertones
    const blushProducts = {
      light: {
        cool: {
          id: 305,
          name: "Cloud Paint - Puff",
          brand: "Glossier",
          category: "Blush",
          description: "Seamless, buildable gel-cream blush that's a lightweight, pillowy formula for a soft, natural-looking flush",
          imageUrl: "https://www.glossier.com/products/cloud-paint",
          price: "$20.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.glossier.com/products/cloud-paint"
        },
        warm: {
          id: 306,
          name: "Soft Pinch Liquid Blush - Joy",
          brand: "Rare Beauty",
          category: "Blush",
          description: "Weightless, long-lasting liquid blush that blends beautifully for a peachy flush on fair warm skin",
          imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
          price: "$23.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
        },
        neutral: {
          id: 307,
          name: "Cheek Pop - Nude Pop",
          brand: "Clinique",
          category: "Blush",
          description: "Silky powder blush with a natural-looking stain for fair neutral skin tones",
          imageUrl: "https://www.sephora.com/productimages/sku/s1971779-main-zoom.jpg",
          price: "$27.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.sephora.com/product/cheek-pop-P384566"
        }
      },
      medium: {
        cool: {
          id: 308,
          name: "Blush Subtil - Rose Fresque",
          brand: "Lancôme",
          category: "Blush",
          description: "Oil-free powder blush that delivers bold color with a hint of shimmer",
          imageUrl: "https://www.lancome-usa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lancome-us-master-catalog/default/dwd5a3f5ac/3605971586453_Blush_Subtil_ROSE_FRESQUE.jpg",
          price: "$33.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.lancome-usa.com/makeup/face-makeup/blush/blush-subtil/100001089.html"
        },
        warm: {
          id: 300,
          name: "Soft Pinch Liquid Blush - Bliss",
          brand: "Rare Beauty",
          category: "Blush",
          description: "Weightless, long-lasting liquid blush that blends beautifully for a soft coral flush",
          imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
          price: "$23.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
        },
        neutral: {
          id: 309,
          name: "Cheek Palette - NARS Orgasm X",
          brand: "NARS",
          category: "Blush",
          description: "Iconic, universally flattering blush with subtle golden shimmer",
          imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw0173e731/hi-res/ORGASM-X-CHEEK-PALETTE/0607845081081_orgasmxcheekpalette_a.jpg",
          price: "$42.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.narscosmetics.com/USA/orgasm-x-cheek-palette/0607845081081.html"
        }
      },
      deep: {
        cool: {
          id: 310,
          name: "Soft Pinch Liquid Blush - Love",
          brand: "Rare Beauty",
          category: "Blush",
          description: "Weightless, long-lasting liquid blush in a deep berry shade for rich complexions",
          imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
          price: "$23.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
        },
        warm: {
          id: 311,
          name: "Blush Divine - Sunset Dream",
          brand: "Pat McGrath Labs",
          category: "Blush",
          description: "Richly pigmented powder blush that builds from sheer to intense color",
          imageUrl: "https://www.patmcgrath.com/products/skin-fetish-divine-powder-blush?_pos=1&_sid=c35ef3e20&_ss=r",
          price: "$39.00",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.patmcgrath.com/products/skin-fetish-divine-powder-blush"
        },
        neutral: {
          id: 312,
          name: "Cheek Heat Gel-Cream Blush - Berry Flame",
          brand: "Maybelline",
          category: "Blush",
          description: "Lightweight, water-based gel blush that delivers a natural flush of color",
          imageUrl: "https://www.maybelline.com/~/media/mny/us/face-makeup/blush/cheek-heat/maybelline-cheek-heat-berry-flame-041554577815-o.jpg",
          price: "$7.99",
          videoUrl: tutorialVideos.blush,
          productUrl: "https://www.maybelline.com/face-makeup/blush/cheek-heat-gel-cream-blush"
        }
      }
    };
    
    const concealerProducts = {
      light: {
        cool: {
          id: 320,
          name: "Radiant Creamy Concealer - Vanilla",
          brand: "NARS",
          category: "Concealer",
          description: "Award-winning concealer with buildable coverage for fair skin with pink undertones",
          imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwbf5fc2a2/hi-res/0607845016229.jpg",
          price: "$32.00",
          shadeFamily: "Light",
          undertone: "Cool",
          videoUrl: tutorialVideos.concealer,
          productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
        },
        warm: {
          id: 321,
          name: "Radiant Creamy Concealer - Custard",
          brand: "NARS",
          category: "Concealer",
          description: "Award-winning concealer with buildable coverage for fair skin with yellow undertones",
          imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwbf5fc2a2/hi-res/0607845016229.jpg",
          price: "$32.00",
          shadeFamily: "Light",
          undertone: "Warm",
          videoUrl: tutorialVideos.concealer,
          productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
        }
      },
      medium: {
        neutral: {
          id: 301,
          name: "Radiant Creamy Concealer - Ginger",
          brand: "NARS",
          category: "Concealer",
          description: "Buildable, medium-coverage concealer that brightens, corrects, and perfects",
          imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwbf5fc2a2/hi-res/0607845016229.jpg",
          price: "$32.00",
          shadeFamily: "Medium",
          undertone: "Neutral",
          videoUrl: tutorialVideos.concealer,
          productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
        }
      },
      deep: {
        warm: {
          id: 325,
          name: "Pro Filt'r Instant Retouch Concealer - 420",
          brand: "Fenty Beauty",
          category: "Concealer",
          description: "Creamy, long-wear, crease-proof liquid concealer for deeper skin tones",
          imageUrl: "https://www.sephora.com/productimages/sku/s2212579-main-zoom.jpg",
          price: "$29.00",
          shadeFamily: "Deep",
          undertone: "Warm",
          videoUrl: tutorialVideos.concealer,
          productUrl: "https://www.sephora.com/product/pro-filtr-instant-retouch-concealer-P90773711"
        }
      }
    };
    
    // Select the appropriate blush and concealer based on skin tone and undertone
    const skinToneCategory = skinTone.toLowerCase().includes('fair') || skinTone.toLowerCase().includes('light') 
      ? 'light'
      : skinTone.toLowerCase().includes('medium')
        ? 'medium'
        : 'deep';
    
    const undertoneCategory = undertone.toLowerCase().includes('cool')
      ? 'cool'
      : undertone.toLowerCase().includes('warm')
        ? 'warm'
        : 'neutral';
    
    // Get blush recommendation (fallback to neutral if specific undertone not available)
    const blushRec = blushProducts[skinToneCategory]?.[undertoneCategory] 
      || blushProducts[skinToneCategory]?.neutral 
      || blushProducts.medium.neutral;
    
    // Get concealer recommendation (fallback to closest match if specific combo not available)
    const concealerRec = concealerProducts[skinToneCategory]?.[undertoneCategory]
      || concealerProducts[skinToneCategory]?.neutral
      || concealerProducts.medium.neutral;
    
    // Skin concerns based beauty recommendations
    const skinCareRecs = {
      dryness: {
        id: 330,
        name: "Intensive Overnight Moisture Cream",
        brand: "Tatcha",
        category: "Moisturizer",
        description: "Rich overnight cream that nourishes dry skin with Japanese purple rice and hyaluronic acid",
        imageUrl: "https://www.sephora.com/productimages/sku/s2181006-main-zoom.jpg",
        price: "$89.00",
        productUrl: "https://www.sephora.com/product/the-dewy-skin-cream-P441101"
      },
      oiliness: {
        id: 331,
        name: "Oil-Free Water Cream",
        brand: "Tatcha",
        category: "Moisturizer",
        description: "Oil-free, water-light cream that controls sebum production with Japanese wild rose",
        imageUrl: "https://www.sephora.com/productimages/sku/s1932920-main-zoom.jpg",
        price: "$70.00",
        productUrl: "https://www.sephora.com/product/the-water-cream-P418218"
      },
      acne: {
        id: 332,
        name: "Clearing Treatment",
        brand: "Paula's Choice",
        category: "Treatment",
        description: "Targeted treatment with 2% salicylic acid to clear and prevent breakouts",
        imageUrl: "https://www.paulaschoice.com/dw/image/v2/BBNX_PRD/on/demandware.static/-/Sites-pc-catalog/default/dw7952a8b2/images/products/skin-perfecting-2-percent-bha-liquid-2010-L.png",
        price: "$32.00",
        productUrl: "https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html"
      },
      aging: {
        id: 333,
        name: "Retinol Serum",
        brand: "The Ordinary",
        category: "Serum",
        description: "Anti-aging serum with 1% retinol to reduce fine lines and improve skin texture",
        imageUrl: "https://www.sephora.com/productimages/sku/s2315042-main-zoom.jpg",
        price: "$14.00",
        productUrl: "https://www.sephora.com/product/the-ordinary-deciem-retinol-1-in-squalane-P427420"
      },
      hyperpigmentation: {
        id: 334,
        name: "Vitamin C Serum",
        brand: "SkinCeuticals",
        category: "Serum",
        description: "Potent vitamin C serum that brightens skin and reduces dark spots",
        imageUrl: "https://www.skinceuticals.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-skinceuticals-master-catalog/default/dw61b11d26/2016%20Website%20Relaunch%20Products/Product%20SKU%20Update%20665-028-635025/d34dc0df-ce56-4355-97cb-6cc60c59d6b0.jpg",
        price: "$166.00",
        productUrl: "https://www.skinceuticals.com/c-e-ferulic-635494263008.html"
      },
      sensitivity: {
        id: 335,
        name: "Calm Redness Relief Moisturizer",
        brand: "Paula's Choice",
        category: "Moisturizer",
        description: "Gentle, soothing moisturizer with anti-inflammatory ingredients for sensitive skin",
        imageUrl: "https://www.paulaschoice.com/dw/image/v2/BBNX_PRD/on/demandware.static/-/Sites-pc-catalog/default/dwd3c30ca7/images/products/calm-redness-relief-moisturizer-normal-to-oily-9160-L.png",
        price: "$31.00",
        productUrl: "https://www.paulaschoice.com/calm-redness-relief-moisturizer---normal-to-oily/9160.html"
      }
    };
    
    // Determine skincare needs from analysis data
    let skincareNeeds = 'dryness'; // Default
    
    if (analysis.concerns && analysis.concerns.length > 0) {
      if (analysis.concerns.some(c => c.toLowerCase().includes('oil') || c.toLowerCase().includes('shine'))) {
        skincareNeeds = 'oiliness';
      } else if (analysis.concerns.some(c => c.toLowerCase().includes('acne') || c.toLowerCase().includes('breakout'))) {
        skincareNeeds = 'acne';
      } else if (analysis.concerns.some(c => c.toLowerCase().includes('age') || c.toLowerCase().includes('wrinkle') || c.toLowerCase().includes('fine line'))) {
        skincareNeeds = 'aging';
      } else if (analysis.concerns.some(c => c.toLowerCase().includes('spot') || c.toLowerCase().includes('pigment') || c.toLowerCase().includes('dark'))) {
        skincareNeeds = 'hyperpigmentation';
      } else if (analysis.concerns.some(c => c.toLowerCase().includes('sensitive') || c.toLowerCase().includes('redness') || c.toLowerCase().includes('irritat'))) {
        skincareNeeds = 'sensitivity';
      }
    }
    
    // Eye makeup recommendations based on undertone
    const eyePalettes = {
      cool: {
        id: 340,
        name: "Naked3 Eyeshadow Palette",
        brand: "Urban Decay",
        category: "Eyeshadow",
        description: "Rose-toned neutral eyeshadow palette ideal for cool undertones",
        imageUrl: "https://www.sephora.com/productimages/sku/s1782937-main-zoom.jpg",
        price: "$54.00",
        videoUrl: tutorialVideos.eyeshadow,
        productUrl: "https://www.sephora.com/product/naked3-P384099"
      },
      warm: {
        id: 341,
        name: "Soft Glam Eyeshadow Palette",
        brand: "Anastasia Beverly Hills",
        category: "Eyeshadow",
        description: "Warm-toned neutral eyeshadow palette with gold and bronze shades",
        imageUrl: "https://www.sephora.com/productimages/sku/s2018232-main-zoom.jpg",
        price: "$45.00",
        videoUrl: tutorialVideos.eyeshadow,
        productUrl: "https://www.sephora.com/product/soft-glam-eye-shadow-palette-P04207901"
      },
      neutral: {
        id: 302,
        name: "Naked Palette",
        brand: "Urban Decay",
        category: "Eyeshadow",
        description: "Versatile eyeshadow palette with 12 neutral shades in matte, shimmer, and sparkle textures",
        imageUrl: "https://www.sephora.com/productimages/sku/s2319820-main-zoom.jpg",
        price: "$54.00",
        videoUrl: tutorialVideos.eyeshadow,
        productUrl: "https://www.sephora.com/product/naked-reloaded-eyeshadow-palette-P441302"
      }
    };
    
    // Add other complementary products that match skin tone and concerns
    const complementaryProducts = [
      blushRec,
      concealerRec,
      eyePalettes[undertoneCategory] || eyePalettes.neutral,
      skinCareRecs[skincareNeeds] || skinCareRecs.dryness,
      {
        id: 303,
        name: "Photo Finish Primer",
        brand: "Smashbox",
        category: "Primer",
        description: "Award-winning primer that helps makeup last all day while minimizing pores",
        imageUrl: "https://www.sephora.com/productimages/sku/s1349968-main-zoom.jpg",
        price: "$39.00",
        productUrl: "https://www.sephora.com/product/the-photo-finish-foundation-primer-P9889"
      }
    ];
    
    // Combine foundation matches with complementary products
    const allRecommendations = [...foundationMatches, ...complementaryProducts];
    
    setRecommendedProducts(allRecommendations);
  };

  const handleAnalyze = () => {
    if (image) {
      analyzeMutation.mutate(image);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-medium text-primary mb-2">AI-Powered Beauty Advice</p>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent sm:text-6xl">
            Your Personal Beauty Expert
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get personalized skincare and makeup recommendations powered by advanced AI technology.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="max-w-xl mx-auto" data-section="upload">
          <CardContent className="p-6">
            {analyzeMutation.isPending ? (
              <LoadingAnalysis />
            ) : (
              <>
                <ImageUpload
                  value={image}
                  onChange={(base64) => setImage(base64)}
                  className="w-full aspect-square"
                />
                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={!image}
                  onClick={handleAnalyze}
                >
                  Analyze My Features
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {(analysisResult || parsedAnalysis) && (
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <CardHeader>
              <h2 className="text-2xl font-bold">Your Personalized Beauty Analysis</h2>
            </CardHeader>
            
            <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="shade">Shade Match</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                </TabsList>
              </div>
                
              {/* Overview Tab */}
              <TabsContent value="overview" className="px-6 pb-6">
                <div className="space-y-6">
                  {parsedAnalysis ? (
                    <>
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Badge className="px-3 py-1 text-base">
                          {parsedAnalysis.skinType || "Normal"} Skin
                        </Badge>
                        {parsedAnalysis.undertone && (
                          <Badge variant="outline" className="px-3 py-1 text-base">
                            {parsedAnalysis.undertone} Undertone
                          </Badge>
                        )}
                        {parsedAnalysis.skinTone && (
                          <Badge variant="secondary" className="px-3 py-1 text-base">
                            {parsedAnalysis.skinTone} Tone
                          </Badge>
                        )}
                      </div>
                      
                      {parsedAnalysis.concerns && parsedAnalysis.concerns.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-2">Skin Concerns</h3>
                          <div className="flex flex-wrap gap-2">
                            {parsedAnalysis.concerns.map((concern, idx) => (
                              <Badge key={idx} variant="outline">{concern}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Key Recommendations</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 mt-0.5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Palette className="h-3 w-3 text-primary" />
                            </div>
                            <span>
                              Best foundation shade: <strong>{parsedAnalysis.skinTone || "Medium"}</strong> with 
                              <strong> {parsedAnalysis.undertone || "Neutral"}</strong> undertones
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 mt-0.5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Star className="h-3 w-3 text-primary" />
                            </div>
                            <span>
                              Recommended routine: Lightweight foundation, cream blush, and neutral eyeshadow tones
                            </span>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-base">
                      {analysisResult}
                    </pre>
                  )}
                  
                  <div className="bg-muted/40 p-4 rounded-lg mt-6">
                    <h3 className="font-medium mb-2">What's Next?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check out your personalized shade match, product recommendations, and 
                      application tutorials using the tabs above.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('shade')}>
                        View Shade Match
                      </Button>
                      <Button size="sm" onClick={() => setActiveTab('products')}>
                        Shop Products
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Shade Match Tab */}
              <TabsContent value="shade" className="px-6 pb-6">
                <div className="space-y-6">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Your Perfect Shade Match</h3>
                    <p className="text-muted-foreground mb-6">
                      Based on your skin analysis, we've identified your ideal foundation shade and undertone.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Skin Tone: {parsedAnalysis?.skinTone || "Medium"}</h4>
                        <div 
                          className="h-16 rounded-md border" 
                          style={{ 
                            background: shadeGuide[parsedAnalysis?.skinTone as keyof typeof shadeGuide] || shadeGuide.Medium
                          }}
                        />
                        <div className="grid grid-cols-7 gap-1 mt-2">
                          {Object.keys(shadeGuide).map(shade => (
                            <div key={shade} className="text-center">
                              <div 
                                className={`h-6 rounded-sm border ${shade === parsedAnalysis?.skinTone ? 'ring-2 ring-primary' : ''}`}
                                style={{ background: shadeGuide[shade as keyof typeof shadeGuide] }}
                              />
                              <span className="text-[10px] mt-1 block overflow-hidden text-ellipsis">{shade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Undertone: {parsedAnalysis?.undertone || "Neutral"}</h4>
                        <div 
                          className="h-16 rounded-md border" 
                          style={{ 
                            background: undertoneGuide[parsedAnalysis?.undertone as keyof typeof undertoneGuide] || undertoneGuide.Neutral
                          }}
                        />
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          {Object.keys(undertoneGuide).map(tone => (
                            <div key={tone} className="text-center">
                              <div 
                                className={`h-6 rounded-sm border ${tone === parsedAnalysis?.undertone ? 'ring-2 ring-primary' : ''}`} 
                                style={{ background: undertoneGuide[tone as keyof typeof undertoneGuide] }}
                              />
                              <span className="text-xs mt-1 block">{tone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Foundation Matching Tips</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Test foundation on your jawline for the most accurate match</li>
                      <li>• In between two shades? Choose the lighter one for winter and darker for summer</li>
                      <li>• Your foundation should disappear into your skin when blended properly</li>
                      <li>• Natural light is best for testing foundation shades</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              {/* Products Tab */}
              <TabsContent value="products" className="px-6 pb-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-4">Recommended Products for You</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedProducts.map(product => (
                      <Card key={product.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden bg-muted">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge className="mb-2">{product.category}</Badge>
                          <h4 className="font-semibold text-base mb-1">{product.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="font-medium">{product.price}</span>
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={product.productUrl || "https://www.sephora.com/search?keyword=" + encodeURIComponent(product.name)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ChevronRight className="h-4 w-4 mr-1" />
                                View Product
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Tutorials Tab */}
              <TabsContent value="tutorials" className="px-6 pb-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-2">Application Tutorials</h3>
                  <p className="text-muted-foreground mb-6">
                    Learn how to apply your recommended products with these helpful tutorial videos.
                  </p>
                  
                  <div className="space-y-8">
                    {recommendedProducts
                      .filter(product => product.videoUrl)
                      .map(product => (
                        <div key={product.id} className="space-y-4">
                          <h4 className="font-medium flex items-center">
                            <Youtube className="h-5 w-5 mr-2 text-red-500" />
                            How to Apply: {product.name}
                          </h4>
                          <div className="aspect-video w-full rounded-md overflow-hidden border bg-muted">
                            <YouTubeEmbed 
                              url={product.videoUrl || ''}
                              title={`Tutorial for ${product.name}`}
                              category={product.category.toLowerCase()}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Perfect your {product.category.toLowerCase()} application with this step-by-step tutorial.
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* Key Features */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Personalized Advice</h3>
              <p className="text-sm text-muted-foreground">
                Get tailored recommendations based on your unique skin type and concerns.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI technology analyzes your skin conditions and needs.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Product Matching</h3>
              <p className="text-sm text-muted-foreground">
                Find the perfect products that match your skin type and preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Results</h3>
              <p className="text-sm text-muted-foreground">
                Achieve professional-level results with AI-powered guidance.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Take the Quiz</h3>
              <p className="text-sm text-muted-foreground">
                Upload your photo for AI analysis of your facial features and skin.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get Your Plan</h3>
              <p className="text-sm text-muted-foreground">
                Receive a personalized beauty routine tailored to your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">See Results</h3>
              <p className="text-sm text-muted-foreground">
                Follow your custom plan and watch your skin transform.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Beauty Routine?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of satisfied users who have discovered their perfect beauty routine with our AI advisor.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              const uploadSection = document.querySelector('[data-section="upload"]');
              uploadSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}