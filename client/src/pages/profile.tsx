import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { type User, type Analysis, type Product } from "@shared/schema";
import { 
  AlertCircle, 
  User as UserIcon, 
  Calendar, 
  Star, 
  Camera, 
  Palette, 
  Droplet,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading: authLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const analysesQuery = useQuery<Analysis[]>({
    queryKey: ["/api/user/analyses"],
    enabled: !!user,
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ["/api/user/products"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  if (authLoading || analysesQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to view your profile and analysis history.
            </p>
            <Button onClick={() => setLocation("/auth")}>
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { name, email, createdAt, skinTone, undertone } = user;
  const analyses = analysesQuery.data || [];
  const recommendedProducts = productsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Beauty Profile</h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* User Info */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  <p className="text-muted-foreground">{email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Member since {format(new Date(createdAt), 'MMMM d, yyyy')}</span>
                </div>
                
                {skinTone && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Palette className="h-4 w-4 flex-shrink-0" />
                    <span>Skin Tone: <Badge variant="outline">{skinTone}</Badge></span>
                  </div>
                )}
                
                {undertone && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Droplet className="h-4 w-4 flex-shrink-0" />
                    <span>Undertone: <Badge variant="outline">{undertone}</Badge></span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Your Recommended Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {recommendedProducts.slice(0, 6).map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          <Separator className="my-8" />

          {/* Analysis History */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Beauty Analysis History</h2>
            {analyses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't done any beauty analysis yet.
                  </p>
                  <Button onClick={() => setLocation("/")}>
                    Try Your First Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {analyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full overflow-hidden">
                            <img
                              src={analysis.imageUrl}
                              alt="Analysis"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(analysis.createdAt), 'MMMM d, yyyy')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-primary" />
                              <p className="font-medium">Skin Type: {analysis.skinType}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.undertone && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Undertone</h4>
                            <Badge variant="secondary">{analysis.undertone}</Badge>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Concerns</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.concerns.map((concern, i) => (
                              <Badge key={i} variant="outline">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              // Handle recommendations in different formats
                              try {
                                // If it's a string, try to parse it
                                const recommendations = typeof analysis.recommendations === 'string' 
                                  ? JSON.parse(analysis.recommendations) 
                                  : analysis.recommendations;
                                
                                if (Array.isArray(recommendations)) {
                                  return (
                                    <>
                                      {recommendations.slice(0, 3).map((rec: any, i) => (
                                        <Badge key={i} variant="secondary">
                                          {rec.productType || rec.category || "Product"}
                                        </Badge>
                                      ))}
                                      {recommendations.length > 3 && (
                                        <Badge variant="secondary">+{recommendations.length - 3} more</Badge>
                                      )}
                                    </>
                                  );
                                }
                              } catch (e) {
                                console.error('Error parsing recommendations:', e);
                              }
                              
                              // Fallback if there's an error or it's not an array
                              return (
                                <Badge variant="outline">View details</Badge>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    {/* CardFooter removed as requested */}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}