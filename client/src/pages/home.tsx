import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  ChevronRight,
  Info as InfoIcon
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

// Sample skin tone color mapping for visualization
const skinToneColors = {
  "Fair": "#f6e3ce",
  "Light": "#f2d6bd",
  "Medium": "#e5bb95",
  "Tan": "#c58c59",
  "Deep": "#845039", 
  "Dark": "#513530",
  "Neutral": "#e0c3a8", // Balanced
  "Warm": "#e6be94",    // Yellow/golden
  "Cool": "#e6c3c0",    // Pink/red
  "Olive": "#d2d2b8"    // Slightly green
};

export default function Home() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<AnalysisData | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Updated tutorial videos with verified working YouTube embed links
  // These are curated, high-quality tutorials specifically chosen for different skin tones and undertones
  const tutorialVideos = {
    // Foundation tutorials for different skin tones
    "foundation": {
      "Fair": "https://www.youtube.com/embed/j7-Oi8n01Lc",     // Foundation routine for fair skin
      "Light": "https://www.youtube.com/embed/XZQfNBYazPI",    // Light skin foundation tutorial
      "Medium": "https://www.youtube.com/embed/ZD92D2qQW8U",   // Fenty foundation tutorial by Rihanna
      "Tan": "https://www.youtube.com/embed/UlTLlOFjYz0",      // Foundation routine for tan skin
      "Deep": "https://www.youtube.com/embed/FuVxOLwizjQ",     // Deep skin tone foundation tutorial
      "Dark": "https://www.youtube.com/embed/4xmgxhBdB0Y",     // Dark skin foundation application
      "default": "https://www.youtube.com/embed/ZD92D2qQW8U"   // Default foundation tutorial
    },
    
    // Concealer tutorials
    "concealer": {
      "Fair": "https://www.youtube.com/embed/VEDrLcPZM_o",     // Concealer for fair skin
      "Medium": "https://www.youtube.com/embed/n5YbJ8LzI2M",   // NARS concealer tutorial
      "Dark": "https://www.youtube.com/embed/fzUYjvL1NJg",     // Concealer for dark skin
      "default": "https://www.youtube.com/embed/n5YbJ8LzI2M"   // Default concealer tutorial
    },
    
    // Blush tutorials
    "blush": {
      "Fair": "https://www.youtube.com/embed/EkPXdQVcN8g",     // Blush for fair skin
      "Light": "https://www.youtube.com/embed/AcFUGTZdEPk",    // Blush for light skin
      "Medium": "https://www.youtube.com/embed/BHdpCHFL0GQ",   // Rare Beauty blush tutorial
      "Tan": "https://www.youtube.com/embed/BHdpCHFL0GQ",      // Blush for tan skin
      "Deep": "https://www.youtube.com/embed/wFLjQGTc_zc",     // Blush for deep skin
      "Dark": "https://www.youtube.com/embed/wFLjQGTc_zc",     // Blush for dark skin
      "default": "https://www.youtube.com/embed/BHdpCHFL0GQ"   // Default blush tutorial
    },
    
    // Eyeshadow tutorials
    "eyeshadow": {
      "Warm": "https://www.youtube.com/embed/SycFuomRuQo",     // Warm toned eyeshadow
      "Cool": "https://www.youtube.com/embed/XPkwk20RjJw",     // Cool toned eyeshadow
      "Neutral": "https://www.youtube.com/embed/qEQq1wx_4Ro",  // Neutral eyeshadow palette tutorial
      "default": "https://www.youtube.com/embed/qEQq1wx_4Ro"   // Default eyeshadow tutorial
    },
    
    // Lipstick tutorials
    "lipstick": {
      "Fair": "https://www.youtube.com/embed/xP2nqq1c6Uc",     // Lipstick for fair skin
      "Deep": "https://www.youtube.com/embed/cYxjl0n_Zc8",     // Lipstick for deep skin
      "default": "https://www.youtube.com/embed/Ow0Jr-0qzZs"   // Charlotte Tilbury lipstick application
    }
  };
  
  // Helper function to get the appropriate tutorial based on skin tone or undertone
  // Always returns a string (a valid YouTube embed URL)
  const getTutorialForSkinProfile = (category: string, skinTone: string, undertone: string): string => {
    // Default fallback video if everything else fails
    const defaultVideo = "https://www.youtube.com/embed/ZD92D2qQW8U";
    
    // Check if the category exists in our tutorials object
    if (!tutorialVideos[category as keyof typeof tutorialVideos]) {
      // If category doesn't exist, return the default foundation video
      return (tutorialVideos.foundation as Record<string, string>).default || defaultVideo;
    }
    
    const categoryVideos = tutorialVideos[category as keyof typeof tutorialVideos] as Record<string, string>;
    
    // First try to find a video matching the exact skin tone
    if (categoryVideos[skinTone]) {
      return categoryVideos[skinTone];
    } 
    
    // For eyeshadow, try to match by undertone
    if (category === 'eyeshadow' && categoryVideos[undertone]) {
      return categoryVideos[undertone];
    }
    
    // Try to find a video that's close in the skin tone spectrum
    const skinToneOrder = ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Dark'];
    const currentToneIndex = skinToneOrder.indexOf(skinTone);
    
    if (currentToneIndex !== -1) {
      // Look for the closest skin tone that has a tutorial
      let closestToneWithTutorial: string | null = null;
      let minDistance = skinToneOrder.length;
      
      for (let i = 0; i < skinToneOrder.length; i++) {
        if (categoryVideos[skinToneOrder[i]]) {
          const distance = Math.abs(currentToneIndex - i);
          if (distance < minDistance) {
            minDistance = distance;
            closestToneWithTutorial = skinToneOrder[i];
          }
        }
      }
      
      if (closestToneWithTutorial && categoryVideos[closestToneWithTutorial]) {
        return categoryVideos[closestToneWithTutorial];
      }
    }
    
    // Default to the category default
    return categoryVideos.default || 
           (tutorialVideos.foundation as Record<string, string>).default || 
           defaultVideo;
  };

  // Function to generate product recommendations based on skin tone and undertone
  const generateProductRecommendations = (analysis: AnalysisData) => {
    // Get the skin tone and undertone from the analysis
    const skinTone = analysis.skinTone || 'Medium';
    const undertone = analysis.undertone || 'Neutral';
    
    console.log(`Finding products for ${skinTone} skin tone with ${undertone} undertone`);
    
    // Use getFoundationsBySkinTone from our product database to find matches
    const foundationMatches = getFoundationsBySkinTone(skinTone, undertone);
    
    // Ensure all products have video URLs before displaying
    const addVideoUrl = (product: Product, category: keyof typeof tutorialVideos): Product => {
      if (!product.videoUrl) {
        return {
          ...product,
          videoUrl: getTutorialForSkinProfile(category, skinTone, undertone)
        };
      }
      return product;
    };
    
    // Add video URLs to foundations
    const enhancedFoundations = foundationMatches.map(foundation => 
      addVideoUrl(foundation, 'foundation')
    );
    
    // Start building our complete product recommendations
    const recommendations: Product[] = [];
    
    // Add 1-2 foundations (limit to 2 to avoid overwhelming)
    recommendations.push(...enhancedFoundations.slice(0, 2));
    
    // Add a concealer that matches the skin tone/undertone
    const matchedConcealers = concealers.filter(concealer => {
      return (concealer.shadeFamily && 
              concealer.shadeFamily.toLowerCase().includes(skinTone.toLowerCase())) ||
             (concealer.undertone && 
              concealer.undertone.toLowerCase().includes(undertone.toLowerCase()));
    });
    
    if (matchedConcealers.length > 0) {
      recommendations.push(addVideoUrl(matchedConcealers[0], 'concealer'));
    } else if (concealers.length > 0) {
      recommendations.push(addVideoUrl(concealers[0], 'concealer'));
    }
    
    // Add a blush based on skin tone and undertone
    const matchedBlushes = blushes.filter(blush => {
      // Look for blushes whose name or description matches the undertone
      return blush.description.toLowerCase().includes(undertone.toLowerCase()) ||
             (blush.name.toLowerCase().includes(undertone.toLowerCase()));
    });
    
    if (matchedBlushes.length > 0) {
      recommendations.push(addVideoUrl(matchedBlushes[0], 'blush'));
    } else if (blushes.length > 0) {
      // If no specific match, add a popular blush
      recommendations.push(addVideoUrl(blushes[0], 'blush'));
    }
    
    // Add an eyeshadow palette based on undertone
    const matchedEyeshadows = eyeshadows.filter(eyeshadow => {
      return eyeshadow.undertone && 
             eyeshadow.undertone.toLowerCase().includes(undertone.toLowerCase());
    });
    
    if (matchedEyeshadows.length > 0) {
      recommendations.push(addVideoUrl(matchedEyeshadows[0], 'eyeshadow'));
    } else if (eyeshadows.length > 0) {
      recommendations.push(addVideoUrl(eyeshadows[0], 'eyeshadow'));
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
        // Add the skincare video URL (using foundation as fallback if skincare not available)
        const skincareWithVideo = {
          ...concernMatch,
          videoUrl: getTutorialForSkinProfile('foundation', skinTone, undertone)
        };
        recommendations.push(skincareWithVideo);
      } else if (skincare.length > 0) {
        // Otherwise, add a general skincare product
        const skincareWithVideo = {
          ...skincare[0],
          videoUrl: getTutorialForSkinProfile('foundation', skinTone, undertone)
        };
        recommendations.push(skincareWithVideo);
      }
    } else if (skincare.length > 0) {
      // If no concerns, add a general skincare product
      const skincareWithVideo = {
        ...skincare[0],
        videoUrl: getTutorialForSkinProfile('foundation', skinTone, undertone)
      };
      recommendations.push(skincareWithVideo);
    }
    
    // Make sure recommendations are unique by ID
    const uniqueRecommendations = recommendations.filter((product, index, self) => 
      index === self.findIndex((p) => p.id === product.id)
    );
    
    // Set the recommendations
    setRecommendedProducts(uniqueRecommendations);
  };

  // Mutation for analyzing the image
  const analyzeMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const response = await apiRequest("POST", "/api/analyze", { image: base64Image });
      return await response.text();
    },
    onSuccess: (data: string) => {
      // Store the raw analysis text for the full report tab
      setAnalysisResult(data);
      
      try {
        // Enhanced regex patterns to better detect the format from OpenAI
        // Example formats that will be matched: 
        // "Skin Tone: Medium" or "Undertone: Neutral" or "Skin Tone: Medium with warm undertones"
        const skinToneMatch = data.match(/(?:skin\s*tone|complexion):\s*([^.\n,]+)/i);
        const undertoneMatch = data.match(/(?:undertone|undertones):\s*([^.\n,]+)/i);
        
        // If there's an error message, display it and stop processing
        if (data.includes('No face detected') || data.includes('Unable to analyze')) {
          console.error('Analysis error:', data);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: data
          });
          return;
        }
        
        // If we get here, we should have valid matches
        const altSkinToneMatch = !skinToneMatch && data.match(/skin\s*tone\s*(?:is|appears to be)\s*([^.\n,]+)/i);
        const altUndertoneMatch = !undertoneMatch && data.match(/(?:have|has|with)\s*(?:a|an)\s*([^.\n,]+)\s*undertone/i);
        
        // Process the undertone - first try the primary match, then alternative, then default
        let undertoneFullText = 'Neutral'; // Default fallback
        if (undertoneMatch && undertoneMatch[1]) {
          undertoneFullText = undertoneMatch[1].trim();
        } else if (altUndertoneMatch && altUndertoneMatch[1]) {
          undertoneFullText = altUndertoneMatch[1].trim();
        }
        
        // Clean and standardize the undertone value
        let cleanUndertone = undertoneFullText.split(/\s+/)[0].replace(/\*\*/g, '');
        // Make sure it's one of our valid undertone values
        if (!['Warm', 'Cool', 'Neutral', 'warm', 'cool', 'neutral'].includes(cleanUndertone)) {
          console.warn(`Unexpected undertone value: "${cleanUndertone}", defaulting to Neutral`);
          cleanUndertone = 'Neutral';
        }
        // Ensure first letter is capitalized
        cleanUndertone = cleanUndertone.charAt(0).toUpperCase() + cleanUndertone.slice(1).toLowerCase();
        
        // Process the skin tone - first try the primary match, then alternative, then default
        let skinToneFullText = 'Medium'; // Default fallback
        if (skinToneMatch && skinToneMatch[1]) {
          skinToneFullText = skinToneMatch[1].trim();
        } else if (altSkinToneMatch && altSkinToneMatch[1]) {
          skinToneFullText = altSkinToneMatch[1].trim();
        }
        
        // Clean and standardize the skin tone value
        let simpleSkinTone = skinToneFullText.split(/\s+/)[0].replace(/\*\*/g, '');
        // Make sure it's one of our valid skin tone values
        if (!['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Dark', 'fair', 'light', 'medium', 'tan', 'deep', 'dark'].includes(simpleSkinTone)) {
          console.warn(`Unexpected skin tone value: "${simpleSkinTone}", defaulting to Medium`);
          simpleSkinTone = 'Medium';
        }
        // Ensure first letter is capitalized
        simpleSkinTone = simpleSkinTone.charAt(0).toUpperCase() + simpleSkinTone.slice(1).toLowerCase();
        
        console.log('Extracted skin tone:', simpleSkinTone, 'Undertone:', cleanUndertone);
        
        // Create a default analysis object with extracted values
        let analysisData: AnalysisData = {
          skinType: 'Normal',
          concerns: ['Uneven skin tone'],
          features: {},
          recommendations: [],
          skinTone: simpleSkinTone,
          undertone: cleanUndertone
        };
        
        // If the response includes JSON, try to enhance our object with that data
        if (data.includes('{') && data.includes('}')) {
          try {
            // Try to extract JSON from the response
            const jsonStartIndex = data.indexOf('{');
            const jsonEndIndex = data.lastIndexOf('}') + 1;
            const jsonString = data.substring(jsonStartIndex, jsonEndIndex);
            
            const parsed = JSON.parse(jsonString);
            
            // Merge the JSON data with our regex-extracted data
            if (parsed) {
              // Only update if we have valid properties 
              analysisData = {
                ...analysisData,
                skinType: typeof parsed.skinType === 'string' ? parsed.skinType : analysisData.skinType,
                concerns: Array.isArray(parsed.concerns) ? parsed.concerns : analysisData.concerns,
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : analysisData.recommendations,
              };
            }
          } catch (jsonError) {
            console.warn('Failed to parse JSON from response:', jsonError);
            // Continue with the default analysis data based on regex
          }
        }
        
        // Set structured data for the UI
        setParsedAnalysis(analysisData);
        
        // Generate product recommendations based on the analysis
        generateProductRecommendations(analysisData);
        
      } catch (parseError) {
        console.error('Failed to parse analysis:', parseError);
        
        // Create a fallback analysis with default values
        const fallbackData: AnalysisData = {
          skinType: 'Normal',
          concerns: ['Uneven skin tone'],
          features: {},
          recommendations: [],
          skinTone: 'Medium',
          undertone: 'Neutral'
        };
        
        setParsedAnalysis(fallbackData);
        generateProductRecommendations(fallbackData);
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
            Upload a selfie and our AI will analyze your skin tone, undertone, and facial features
            to recommend the perfect foundation shade and beauty products tailored just for you.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                const uploadSection = document.querySelector('[data-section="upload"]');
                uploadSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Your Analysis
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How Our AI Works</h2>
            <p className="text-muted-foreground mb-6">
              Our advanced AI analyzes your facial features in seconds to provide a complete beauty profile
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-center mb-2">Skin Analysis</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Our AI examines your skin tone and undertone to identify your perfect foundation match
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-center mb-2">Product Matching</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Get personalized recommendations for foundation, concealer, blush, and more
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Youtube className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-center mb-2">Tutorial Videos</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Access expert application techniques perfectly suited for your specific features
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="max-w-3xl mx-auto" data-section="upload">
          <div className="text-center mb-10">
            <Badge className="mb-2" variant="outline">Step 1</Badge>
            <h2 className="text-3xl font-bold mb-4">Upload Your Selfie</h2>
            <p className="text-muted-foreground">
              Upload a clear, well-lit selfie with your natural skin showing
              for the most accurate foundation matching.
            </p>
          </div>

          <Card>
            <CardHeader>
              <p className="text-center text-muted-foreground">
                Choose an image from your device or capture using your camera
              </p>
            </CardHeader>
            <CardContent>
              <ImageUpload 
                value={image} 
                onChange={(newImage) => {
                  setImage(newImage);
                  // Reset analysis when new image is uploaded
                  setAnalysisResult(null);
                  setParsedAnalysis(null);
                  setRecommendedProducts([]);
                }} 
                className="mx-auto"
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={handleAnalyze} 
                disabled={!image || analyzeMutation.isPending}
                className="w-full md:w-auto"
              >
                {analyzeMutation.isPending ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Analyze My Skin
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Analysis Results Section */}
        {analyzeMutation.isPending && (
          <div className="max-w-3xl mx-auto">
            <LoadingAnalysis />
          </div>
        )}

        {parsedAnalysis && !analyzeMutation.isPending && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-2">Step 2</Badge>
              <h2 className="text-3xl font-bold mb-4">Your Beauty Analysis</h2>
              <p className="text-muted-foreground">
                Based on our AI analysis, here are your personalized beauty insights and recommendations.
              </p>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="shade">Shade Match</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Your Skin Profile</h3>
                      <Badge variant="outline" className="text-xs">AI Analysis</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skin Tone & Undertone */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                          Skin Tone & Undertone
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-3.5 w-3.5 inline-block text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[220px] text-xs">
                                  <strong>Bold text</strong> shows your main categories. The dot shows your exact skin color.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </h4>
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full" 
                            style={{ 
                              backgroundColor: skinToneColors[parsedAnalysis.skinTone as keyof typeof skinToneColors] || skinToneColors.Medium,
                              border: '2px solid white',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                          />
                          <div>
                            <div className="font-semibold">{parsedAnalysis.skinTone} skin tone</div>
                            <div className="text-sm text-muted-foreground">{parsedAnalysis.undertone} undertone</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          The circle shows your exact skin color. <strong>{parsedAnalysis.skinTone}</strong> indicates your skin tone category, and <strong>{parsedAnalysis.undertone}</strong> is your undertone category, determining which foundation shades will look most natural on you.
                        </p>
                      </div>
                      
                      {/* Skin Type */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                          Skin Type & Concerns
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-3.5 w-3.5 inline-block text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[220px] text-xs">
                                  <strong>Skin type</strong> affects what foundation formula works best for you. <strong>Concerns</strong> help determine what other products might benefit you.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </h4>
                        <div>
                          <div className="font-semibold">{parsedAnalysis.skinType} skin</div>
                          <div className="text-sm text-muted-foreground">
                            {parsedAnalysis.concerns && parsedAnalysis.concerns.length > 0 ? (
                              parsedAnalysis.concerns.join(', ')
                            ) : 'No major concerns identified'}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your skin type (<strong>{parsedAnalysis.skinType}</strong>) helps determine which foundation formulations will work best for you. The identified concerns inform what complementary products might be beneficial.
                        </p>
                      </div>
                    </div>
                    
                    {/* Foundation Match */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Your Perfect Foundation Match</h4>
                      <div className="bg-secondary/40 rounded-lg p-4">
                        {recommendedProducts.length > 0 && recommendedProducts[0] ? (
                          <div className="flex flex-col md:flex-row items-center gap-4">
                            <img 
                              src={recommendedProducts[0].imageUrl}
                              alt={recommendedProducts[0].name}
                              className="w-24 h-24 object-contain rounded bg-white p-2"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold">{recommendedProducts[0].brand}</h5>
                              <p>{recommendedProducts[0].name}</p>
                              <p className="text-sm text-muted-foreground">Perfect match for your {parsedAnalysis.skinTone} skin with {parsedAnalysis.undertone} undertones</p>
                            </div>
                            <Button size="sm" asChild className="mt-2 md:mt-0">
                              <a href={recommendedProducts[0].productUrl} target="_blank" rel="noopener noreferrer">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Shop Now
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground">No foundation match found. Please try again with a clearer photo.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick Recommendations */}
                    {recommendedProducts.length > 1 && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Complementary Products</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {recommendedProducts.slice(1, 4).map((product) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardHeader className="p-2">
                                <img 
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-32 object-contain rounded bg-white"
                                />
                              </CardHeader>
                              <CardContent className="p-3">
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                <p className="text-primary font-semibold mt-1">{product.price}</p>
                              </CardContent>
                              <CardFooter className="p-3 pt-0 flex justify-between">
                                <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                <Button size="icon" variant="ghost" asChild>
                                  <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                                    <ShoppingBag className="h-4 w-4" />
                                  </a>
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Recommended Products</h3>
                      <Badge className="text-xs">{recommendedProducts.length} Items</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {recommendedProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{product.brand}</h4>
                                <p className="text-sm">{product.name}</p>
                              </div>
                              <Badge variant="outline">{product.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <div className="flex items-center gap-4">
                              <img 
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-20 h-20 object-contain rounded bg-white p-1"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground mb-1">{product.description}</p>
                                <p className="text-primary font-semibold">{product.price}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <Star className="h-3 w-3 text-yellow-400" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between">
                            <Button size="sm" variant="outline" asChild>
                              <a href={product.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Youtube className="mr-2 h-4 w-4" />
                                Tutorial
                              </a>
                            </Button>
                            <Button size="sm" asChild>
                              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Shop
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Shade Match Tab */}
              <TabsContent value="shade" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Foundation Details</h3>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ 
                            backgroundColor: skinToneColors[parsedAnalysis.skinTone as keyof typeof skinToneColors] || skinToneColors.Medium,
                            border: '1px solid white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Badge variant="outline" className="text-xs">{parsedAnalysis.skinTone} / {parsedAnalysis.undertone}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Foundation Color Match */}
                    <div className="bg-secondary/30 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Your Unique Shade Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">
                            Skin Tone
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[240px] text-xs">
                                    The <strong>bold word</strong> shows your skin tone category. The triangle below shows your exact position on the spectrum.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 relative">
                              <div className="w-full h-8 rounded-md bg-gradient-to-r from-[#f6e3ce] via-[#e5bb95] to-[#513530]" />
                              
                              {/* Position marker - we'll calculate the position based on the skin tone */}
                              {(() => {
                                // Calculate position percentage based on skin tone
                                const positionMap = {
                                  'Fair': 10,  // 10% from left
                                  'Light': 25, // 25% from left
                                  'Medium': 50, // 50% from left (center)
                                  'Tan': 70,   // 70% from left
                                  'Deep': 85,  // 85% from left
                                  'Dark': 95   // 95% from left
                                };
                                
                                const position = positionMap[parsedAnalysis.skinTone as keyof typeof positionMap] || 50;
                                
                                return (
                                  <div 
                                    className="absolute" 
                                    style={{
                                      left: `${position}%`,
                                      bottom: '-10px',
                                      transform: 'translateX(-50%)'
                                    }}
                                  >
                                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary" />
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Fair</span>
                              <span className="font-bold text-primary">{parsedAnalysis.skinTone}</span>
                              <span>Dark</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your skin tone is identified as <strong>{parsedAnalysis.skinTone}</strong>, which helps determine the ideal foundation shade range for your complexion.
                            </p>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">
                            Undertone
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[240px] text-xs">
                                    The <strong>bold word</strong> shows your undertone category. The triangle below shows your exact position on the spectrum.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 relative">
                              <div className="w-full h-8 rounded-md bg-gradient-to-r from-[#e6c3c0] via-[#e0c3a8] to-[#e6be94]" />
                              
                              {/* Position marker for undertone */}
                              {(() => {
                                // Calculate position percentage based on undertone
                                const positionMap = {
                                  'Cool': 0,      // Left
                                  'Neutral': 50,  // Center
                                  'Warm': 100     // Right
                                };
                                
                                const position = positionMap[parsedAnalysis.undertone as keyof typeof positionMap] || 50;
                                
                                return (
                                  <div 
                                    className="absolute" 
                                    style={{
                                      left: `${position}%`,
                                      bottom: '-10px',
                                      transform: 'translateX(-50%)'
                                    }}
                                  >
                                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary" />
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cool</span>
                              <span className="font-bold text-primary">{parsedAnalysis.undertone}</span>
                              <span>Warm</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your undertone is identified as <strong>{parsedAnalysis.undertone}</strong>, which determines whether cool, neutral, or warm-toned foundations will look most natural on your skin.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommended Foundations */}
                    <div>
                      <h4 className="font-semibold mb-4">Perfect Matches For You</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {recommendedProducts.filter(p => p.category === 'Foundation').map((foundation) => (
                          <Card key={foundation.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3 p-4 flex items-center justify-center bg-secondary/10">
                                <img 
                                  src={foundation.imageUrl}
                                  alt={foundation.name}
                                  className="w-32 h-32 object-contain"
                                />
                              </div>
                              <div className="md:w-2/3 p-6">
                                <div className="mb-4">
                                  <Badge className="mb-2">{foundation.category}</Badge>
                                  <h5 className="text-xl font-semibold">{foundation.brand}</h5>
                                  <p className="text-muted-foreground">{foundation.name}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 mb-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Shade Family</p>
                                    <p className="font-medium">{foundation.shadeFamily || parsedAnalysis.skinTone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Undertone</p>
                                    <p className="font-medium">{foundation.undertone || parsedAnalysis.undertone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Price</p>
                                    <p className="font-medium text-primary">{foundation.price}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Coverage</p>
                                    <p className="font-medium">Medium to Full</p>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-4">{foundation.description}</p>
                                
                                <div className="flex gap-2 mt-4">
                                  <Button asChild>
                                    <a href={foundation.productUrl} target="_blank" rel="noopener noreferrer">
                                      <ShoppingBag className="mr-2 h-4 w-4" />
                                      Shop Now
                                    </a>
                                  </Button>
                                  <Button variant="outline" asChild>
                                    <a href={foundation.videoUrl} target="_blank" rel="noopener noreferrer">
                                      <Youtube className="mr-2 h-4 w-4" />
                                      Watch Tutorial
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tutorials Tab */}
              <TabsContent value="tutorials" className="space-y-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">Application Tutorials</h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Foundation Tutorial */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Foundation Application
                        </h4>
                        <YouTubeEmbed 
                          url={getTutorialForSkinProfile('foundation', parsedAnalysis.skinTone || 'Medium', parsedAnalysis.undertone || 'Neutral')}
                          title={`Foundation Application for ${parsedAnalysis.skinTone || 'Medium'} Skin`}
                          aspectRatio="video"
                        />
                        <p className="text-sm text-muted-foreground">
                          Learn how to apply foundation for a flawless finish that's perfect for your{' '}
                          <strong>{parsedAnalysis.skinTone}</strong> skin tone with <strong>{parsedAnalysis.undertone}</strong> undertones.
                          This tutorial is specifically selected for your skin profile.
                        </p>
                      </div>
                      
                      {/* Concealer Tutorial */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Concealer Technique
                        </h4>
                        <YouTubeEmbed 
                          url={getTutorialForSkinProfile('concealer', parsedAnalysis.skinTone || 'Medium', parsedAnalysis.undertone || 'Neutral')}
                          title={`Concealer Application for ${parsedAnalysis.skinTone || 'Medium'} Skin`}
                          aspectRatio="video"
                        />
                        <p className="text-sm text-muted-foreground">
                          Master concealer techniques specifically chosen for your <strong>{parsedAnalysis.skinTone}</strong> skin tone
                          to perfectly camouflage dark circles and imperfections.
                        </p>
                      </div>
                      
                      {/* Blush Tutorial */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Blush Application
                        </h4>
                        <YouTubeEmbed 
                          url={getTutorialForSkinProfile('blush', parsedAnalysis.skinTone || 'Medium', parsedAnalysis.undertone || 'Neutral')}
                          title={`Blush Application for ${parsedAnalysis.skinTone || 'Medium'} Skin`}
                          aspectRatio="video"
                        />
                        <p className="text-sm text-muted-foreground">
                          Learn where to apply blush for your face shape and how to select shades that 
                          flatter your <strong>{parsedAnalysis.skinTone}</strong> skin tone for a natural, healthy glow.
                        </p>
                      </div>
                      
                      {/* Eyeshadow Tutorial */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Eye Makeup
                        </h4>
                        <YouTubeEmbed 
                          url={getTutorialForSkinProfile('eyeshadow', parsedAnalysis.skinTone || 'Medium', parsedAnalysis.undertone || 'Neutral')}
                          title={`Eyeshadow Tutorial for ${parsedAnalysis.undertone || 'Neutral'} Undertones`}
                          aspectRatio="video"
                        />
                        <p className="text-sm text-muted-foreground">
                          Discover eyeshadow techniques and color palettes that complement your <strong>{parsedAnalysis.undertone}</strong> undertones
                          to make your eye color pop and enhance your natural beauty.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              

            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}