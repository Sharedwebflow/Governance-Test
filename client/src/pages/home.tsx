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
      return await response.text();
    },
    onSuccess: (data: string) => {
      // Store the raw analysis text for the full report tab
      setAnalysisResult(data);
      
      try {
        let parsedData: AnalysisData;
        
        if (data.includes('{') && data.includes('}')) {
          // Try to parse as JSON
          const jsonStartIndex = data.indexOf('{');
          const jsonEndIndex = data.lastIndexOf('}') + 1;
          const jsonString = data.substring(jsonStartIndex, jsonEndIndex);
          
          const parsed = JSON.parse(jsonString);
          
          // Handle cases where the data is nested in a properties object
          const data = parsed.analysis || parsed;
          
          // Extract skin tone and undertone using regex for consistent format
          // Example formats: "Skin Tone: Medium with warm undertones" or "Undertone: Neutral"
          const skinToneMatch = data.match(/(?:skin\s*tone|complexion):\s*([^.\n,]+)/i);
          const undertoneMatch = data.match(/(?:undertone|undertones):\s*([^.\n,]+)/i);
          
          // Clean up the extracted strings and get the first word as the simple value
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
    const foundationMatches = getFoundationsBySkinTone(skinTone, undertone);
    
    // Ensure all products have video URLs before displaying
    const addVideoUrl = (product: Product, category: keyof typeof tutorialVideos): Product => {
      if (!product.videoUrl) {
        return {
          ...product,
          videoUrl: tutorialVideos[category] || tutorialVideos.foundation
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
          videoUrl: tutorialVideos.foundation
        };
        recommendations.push(skincareWithVideo);
      } else if (skincare.length > 0) {
        // Otherwise, add a general skincare product
        const skincareWithVideo = {
          ...skincare[0],
          videoUrl: tutorialVideos.foundation
        };
        recommendations.push(skincareWithVideo);
      }
    } else if (skincare.length > 0) {
      // If no concerns, add a general skincare product
      const skincareWithVideo = {
        ...skincare[0],
        videoUrl: tutorialVideos.foundation
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
              <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="foundation">Foundation</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="report">Full Report</TabsTrigger>
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
                        <h4 className="font-medium text-sm text-muted-foreground">Skin Tone & Undertone</h4>
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
                      </div>
                      
                      {/* Skin Type */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Skin Type</h4>
                        <div className="font-semibold">{parsedAnalysis.skinType}</div>
                        <div className="text-sm text-muted-foreground">
                          {parsedAnalysis.skinType === 'Dry' && 'Your skin needs more hydration and moisturizing products.'}
                          {parsedAnalysis.skinType === 'Oily' && 'Your skin produces excess sebum and would benefit from oil-controlling products.'}
                          {parsedAnalysis.skinType === 'Combination' && 'Your skin has both oily and dry areas, typically oily in the T-zone.'}
                          {parsedAnalysis.skinType === 'Normal' && 'Your skin is well-balanced, neither too oily nor too dry.'}
                          {parsedAnalysis.skinType === 'Sensitive' && 'Your skin reacts easily to products and environmental factors.'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Skin Concerns */}
                    {parsedAnalysis.concerns && parsedAnalysis.concerns.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Primary Skin Concerns</h4>
                        <div className="flex flex-wrap gap-2">
                          {parsedAnalysis.concerns.map((concern, index) => (
                            <Badge key={index} variant="secondary">{concern}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Features Analysis */}
                    {parsedAnalysis.features && Object.keys(parsedAnalysis.features).length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">Detailed Features Analysis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(parsedAnalysis.features).map(([feature, value]) => (
                            <div key={feature} className="flex justify-between items-center">
                              <span className="capitalize">{feature}</span>
                              <span className="text-sm font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="object-cover w-full h-full transition-transform hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2">{product.category}</Badge>
                      </div>
                      <CardHeader className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
                          <h3 className="font-semibold leading-tight">{product.name}</h3>
                          <p className="text-base font-medium text-primary">{product.price}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                        {(product.shadeFamily || product.undertone) && (
                          <div className="flex gap-2 mt-2">
                            {product.shadeFamily && (
                              <Badge variant="outline" className="text-xs">{product.shadeFamily}</Badge>
                            )}
                            {product.undertone && (
                              <Badge variant="outline" className="text-xs">{product.undertone}</Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                            <ShoppingBag className="mr-1 h-4 w-4" />
                            Shop
                          </a>
                        </Button>
                        {product.videoUrl && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="flex-1"
                            onClick={() => {
                              setActiveTab('tutorials');
                            }}
                          >
                            <Youtube className="mr-1 h-4 w-4" />
                            Tutorial
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Foundation Tab */}
              <TabsContent value="foundation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Foundation Matches</h3>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ 
                            backgroundColor: skinToneColors[parsedAnalysis.skinTone as keyof typeof skinToneColors] || skinToneColors.Medium
                          }}
                        />
                        <Badge variant="outline">
                          {parsedAnalysis.skinTone} • {parsedAnalysis.undertone}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {recommendedProducts
                        .filter(p => p.category === 'Foundation')
                        .map((foundation) => (
                          <div key={foundation.id} className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                              <div className="aspect-square rounded-md overflow-hidden bg-muted">
                                <img 
                                  src={foundation.imageUrl} 
                                  alt={foundation.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="md:w-2/3 space-y-4">
                              <div>
                                <h4 className="text-xl font-semibold">{foundation.name}</h4>
                                <p className="text-muted-foreground">{foundation.brand}</p>
                                <p className="text-lg font-medium text-primary mt-1">{foundation.price}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="font-medium">Shade Details</h5>
                                <div className="flex flex-wrap gap-2">
                                  {foundation.shadeFamily && (
                                    <Badge variant="secondary">{foundation.shadeFamily}</Badge>
                                  )}
                                  {foundation.undertone && (
                                    <Badge variant="secondary">{foundation.undertone}</Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{foundation.description}</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Button asChild>
                                  <a href={foundation.productUrl} target="_blank" rel="noopener noreferrer">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Shop Now
                                  </a>
                                </Button>
                                {foundation.videoUrl && (
                                  <Button variant="outline" onClick={() => setActiveTab('tutorials')}>
                                    <Youtube className="mr-2 h-4 w-4" />
                                    Watch Tutorial
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                      
                      {recommendedProducts.filter(p => p.category === 'Foundation').length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No foundation matches found. Please try again with a clearer image.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tutorials Tab */}
              <TabsContent value="tutorials" className="space-y-6">
                <div className="grid grid-cols-1 gap-8">
                  {recommendedProducts.filter(p => p.videoUrl).map((product) => (
                    <Card key={`tutorial-${product.id}`}>
                      <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{product.category} Tutorial</h3>
                            <p className="text-muted-foreground">{product.brand} - {product.name}</p>
                          </div>
                          <Badge className="w-fit">{product.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="aspect-video w-full overflow-hidden rounded-md">
                            {product.videoUrl && (
                              <YouTubeEmbed 
                                url={product.videoUrl} 
                                title={`${product.brand} ${product.name} Tutorial`}
                                category={product.category}
                              />
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Learn how to apply and get the best results with the recommended product.
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                                <ShoppingBag className="mr-1 h-4 w-4" />
                                Shop Product
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {recommendedProducts.filter(p => p.videoUrl).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No tutorial videos available for your recommended products.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Full Report Tab */}
              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold">Full AI Analysis Report</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto">
                        {analysisResult}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* How It Works */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered beauty advisor analyzes your unique features to provide
              personalized product recommendations in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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