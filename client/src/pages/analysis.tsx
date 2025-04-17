import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingAnalysis from "@/components/loading-analysis";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useEffect } from "react";

// Define TypeScript interfaces for our analysis data
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
  [key: string]: any;
}

export default function Analysis() {
  const { id } = useParams();

  const analysisQuery = useQuery({
    queryKey: ["/api/analysis", id],
    enabled: !!id
  });

  // This will log any errors to help with debugging
  useEffect(() => {
    if (analysisQuery.error) {
      console.error("Analysis query error:", analysisQuery.error);
    }
  }, [analysisQuery.error]);

  // This will help debug the data structure
  useEffect(() => {
    if (analysisQuery.data) {
      console.log("Analysis data:", analysisQuery.data);
    }
  }, [analysisQuery.data]);

  if (analysisQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingAnalysis />
      </div>
    );
  }

  if (analysisQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Analysis</h2>
            <p className="text-muted-foreground">
              {analysisQuery.error instanceof Error ? analysisQuery.error.message : "Failed to load analysis"}
            </p>
          </CardContent>
          <CardFooter className="justify-center pt-0 pb-6">
            <Button variant="outline" asChild>
              <Link href="/profile">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!analysisQuery.data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
            <p className="text-muted-foreground">
              The analysis you're looking for could not be found.
            </p>
          </CardContent>
          <CardFooter className="justify-center pt-0 pb-6">
            <Button variant="outline" asChild>
              <Link href="/profile">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" className="mr-4" asChild>
            <Link href="/profile">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Your Beauty Analysis</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {(() => {
              try {
                // First check if we have the analysis data in the right format
                const rawData = analysisQuery.data;
                let analysisData: AnalysisData | null = null;
                
                // Determine what format the data is in and convert accordingly
                if (rawData.analysis) {
                  // If it's in the raw text format, we need to handle it
                  let analysis = rawData.analysis;
                  
                  // If analysis is a string that looks like JSON, try to parse it
                  if (typeof analysis === 'string') {
                    try {
                      if (analysis.trim().startsWith('{') || analysis.trim().startsWith('[')) {
                        analysisData = JSON.parse(analysis);
                      } else {
                        // It's not JSON, so display as plain text
                        return (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <Badge>Analysis Date: {new Date(rawData.createdAt).toLocaleDateString()}</Badge>
                              {rawData.skinType && <Badge variant="outline">Skin Type: {rawData.skinType}</Badge>}
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-base bg-muted/30 p-4 rounded-md">
                              {analysis}
                            </pre>
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error("Failed to parse analysis JSON:", e);
                      // Fallback to text display
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <Badge>Analysis Date: {new Date(rawData.createdAt).toLocaleDateString()}</Badge>
                            {rawData.skinType && <Badge variant="outline">Skin Type: {rawData.skinType}</Badge>}
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-base bg-muted/30 p-4 rounded-md">
                            {analysis}
                          </pre>
                        </div>
                      );
                    }
                  }
                } else {
                  // The data might be directly in the format we want
                  analysisData = rawData;
                }
                
                // Now that we have the parsed data, display it appropriately
                if (analysisData) {
                  return (
                    <div className="space-y-8">
                      {/* Skin Type Section */}
                      {analysisData.skinType && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Skin Type</h2>
                          <p className="text-lg">{analysisData.skinType}</p>
                        </div>
                      )}
                      
                      {/* Skin Concerns Section */}
                      {analysisData.concerns && Array.isArray(analysisData.concerns) && analysisData.concerns.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Skin Concerns</h2>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.concerns.map((concern: string, i: number) => (
                              <Badge key={i} className="px-3 py-1 text-base">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Features Section */}
                      {analysisData.features && typeof analysisData.features === 'object' && Object.keys(analysisData.features).length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Skin Features</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(analysisData.features).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-sm text-muted-foreground capitalize">{key}</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Recommendations Section */}
                      {analysisData.recommendations && Array.isArray(analysisData.recommendations) && analysisData.recommendations.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Product Recommendations</h2>
                          <div className="space-y-4">
                            {analysisData.recommendations.map((rec: AnalysisRecommendation, i: number) => (
                              <div key={i} className="bg-muted/40 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {rec.category || 'Product'} {rec.productType ? `- ${rec.productType}` : ''}
                                    </h3>
                                    {rec.priority && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Priority Level: {rec.priority}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {rec.reason && <p className="mt-2">{rec.reason}</p>}
                                {rec.ingredients && Array.isArray(rec.ingredients) && rec.ingredients.length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-sm font-medium">Key Ingredients:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rec.ingredients.map((ingredient: string, idx: number) => (
                                        <Badge key={idx} variant="outline">
                                          {ingredient}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // If we haven't returned by now, display the raw data in a pre block
                return (
                  <pre className="whitespace-pre-wrap font-sans text-base bg-muted/30 p-4 rounded-md">
                    {JSON.stringify(rawData, null, 2)}
                  </pre>
                );
                
              } catch (error) {
                console.error("Error rendering analysis:", error);
                // If anything goes wrong, fall back to a simple error message
                return (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Could not display analysis</h3>
                    <p className="text-muted-foreground mb-4">
                      There was an error formatting this analysis.
                    </p>
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-md text-left">
                      {error instanceof Error ? error.message : "Unknown error"}
                    </pre>
                  </div>
                );
              }
            })()}
          </CardContent>
          <CardFooter className="justify-center pt-0 pb-6">
            <Button variant="outline" asChild>
              <Link href="/profile">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}