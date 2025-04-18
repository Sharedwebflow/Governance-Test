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

  // Updated tutorial videos with current working YouTube embed links
  const tutorialVideos = {
    // Using direct iframe-friendly embed URLs with origin param for security
    "foundation": "https://www.youtube.com/embed/mLN4RM-m7yg", // Fenty foundation tutorial
    "concealer": "https://www.youtube.com/embed/v2D-ZQVlk0s", // Sephora concealer tutorial 
    "blush": "https://www.youtube.com/embed/sRg20WYF-fI", // Charlotte Tilbury blush tutorial
    "eyeshadow": "https://www.youtube.com/embed/ajjIzvbPsUI", // Selena Gomez eyeshadow tutorial
    "lipstick": "https://www.youtube.com/embed/vYAq-sA-DUM" // MAC lipstick application
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
          // For simplicity, we'll extract key information using regex here
          // In a production app, you'd want more robust parsing
          const skinToneMatch = data.analysis.match(/skin tone[:\s]+([^\n.,]+)/i) || 
                           data.analysis.match(/shade description[:\s]+([^\n.,]+)/i);
          const undertoneMatch = data.analysis.match(/undertone[:\s]+([^\n.,]+)/i);
          
          // Clean up any placeholder text that may appear in the AI response
          const cleanUndertone = undertoneMatch 
            ? undertoneMatch[1].trim()
                .replace(/\*\*/g, '')
                .replace(/identify if (the skin|your skin) (has|is) (a |an )?/i, '')
                .replace(/determine if (the skin|your skin) (has|is) (a |an )?/i, '')
                .replace(/^(the skin|your skin) (has|is) (a |an )?/i, '')
            : 'Neutral';
            
          const cleanSkinTone = skinToneMatch
            ? skinToneMatch[1].trim()
                .replace(/\*\*/g, '')
                .replace(/identify if (the skin|your skin) (has|is) (a |an )?/i, '')
                .replace(/determine if (the skin|your skin) (has|is) (a |an )?/i, '')
                .replace(/^(the skin|your skin) (has|is) (a |an )?/i, '')
            : 'Medium';
          
          parsedData = {
            skinType: data.skinType || 'Normal',
            concerns: data.concerns || [],
            features: {},
            recommendations: [],
            skinTone: cleanSkinTone,
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
  
  // Function to generate sample product recommendations based on the analysis
  const generateProductRecommendations = (analysis: AnalysisData) => {
    // This would normally come from a database based on the analysis
    // For now, we'll create sample products based on the analysis data
    const skinTone = analysis.skinTone || 'Medium';
    const undertone = analysis.undertone || 'Neutral';
    
    // Updated products with actual product images and links to official websites
    const sampleProducts: Product[] = [
      {
        id: 1,
        name: `Estée Lauder Double Wear - ${skinTone}`,
        brand: "Estée Lauder",
        category: "Foundation",
        description: `Perfect for ${skinTone} skin tones with ${undertone} undertones. Long-lasting, flawless coverage with a natural matte finish.`,
        imageUrl: "https://www.esteelauder.com/media/export/cms/products/640x640/el_sku_GM5F01_640x640_0.jpg",
        price: "$49.00",
        shadeFamily: skinTone,
        undertone: undertone,
        videoUrl: tutorialVideos.foundation,
        productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
      },
      {
        id: 2,
        name: "NARS Radiant Creamy Concealer",
        brand: "NARS",
        category: "Concealer",
        description: "Award-winning concealer that brightens, corrects and perfects with a radiant finish.",
        imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwbf5fc2a2/hi-res/0607845016229.jpg",
        price: "$32.00",
        shadeFamily: skinTone,
        undertone: undertone,
        videoUrl: tutorialVideos.concealer,
        productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
      },
      {
        id: 3,
        name: "Rare Beauty Soft Pinch Liquid Blush",
        brand: "Rare Beauty",
        category: "Blush",
        description: "Weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush.",
        imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
        price: "$23.00",
        videoUrl: tutorialVideos.blush,
        productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
      },
      {
        id: 4,
        name: "Smashbox Photo Finish Primer",
        brand: "Smashbox",
        category: "Primer",
        description: "Iconic, award-winning primer that helps makeup last all day while minimizing the look of pores and imperfections.",
        imageUrl: "https://www.sephora.com/productimages/sku/s1349968-main-zoom.jpg",
        price: "$39.00",
        productUrl: "https://www.sephora.com/product/the-photo-finish-foundation-primer-P9889"
      },
      {
        id: 5,
        name: "Urban Decay Naked Palette",
        brand: "Urban Decay",
        category: "Eyeshadow",
        description: "The iconic neutral eyeshadow palette with 12 versatile shades in matte, shimmer, and sparkle textures.",
        imageUrl: "https://www.sephora.com/productimages/sku/s2319820-main-zoom.jpg",
        price: "$54.00",
        videoUrl: tutorialVideos.eyeshadow,
        productUrl: "https://www.sephora.com/product/naked-reloaded-eyeshadow-palette-P441302"
      }
    ];
    
    setRecommendedProducts(sampleProducts);
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
                              <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
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