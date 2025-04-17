import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingAnalysis from "@/components/loading-analysis";
import { AlertCircle } from "lucide-react";

export default function Analysis() {
  const { id } = useParams();

  const analysisQuery = useQuery({
    queryKey: ["/api/analysis", id],
    enabled: !!id
  });

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
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Beauty Analysis</h1>
        <Card>
          <CardContent className="pt-6">
            {(() => {
              // Try to see if the analysis data is structured (JSON)
              try {
                let analysisData = analysisQuery.data.analysis;
                
                // If it's a string that looks like JSON, try to parse it
                if (typeof analysisData === 'string' && 
                   (analysisData.startsWith('{') || analysisData.startsWith('['))) {
                  try {
                    analysisData = JSON.parse(analysisData);
                  } catch (e) {
                    // If parsing fails, we'll just treat it as a string
                    console.log('Could not parse analysis as JSON:', e);
                  }
                }
                
                // Display differently based on the data type
                if (typeof analysisData === 'object') {
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
                      {analysisData.concerns && analysisData.concerns.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Skin Concerns</h2>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.concerns.map((concern, i) => (
                              <Badge key={i} className="px-3 py-1 text-base">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Features Section */}
                      {analysisData.features && Object.keys(analysisData.features).length > 0 && (
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
                      {analysisData.recommendations && Array.isArray(analysisData.recommendations) && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3">Product Recommendations</h2>
                          <div className="space-y-4">
                            {analysisData.recommendations.map((rec, i) => (
                              <div key={i} className="bg-muted/40 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {rec.category} - {rec.productType}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Priority Level: {rec.priority}
                                    </p>
                                  </div>
                                </div>
                                <p className="mt-2">{rec.reason}</p>
                                {rec.ingredients && rec.ingredients.length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-sm font-medium">Key Ingredients:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rec.ingredients.map((ingredient, idx) => (
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
                
                // Fallback to plain text display
                return (
                  <pre className="whitespace-pre-wrap font-sans text-base">
                    {analysisQuery.data.analysis}
                  </pre>
                );
              } catch (error) {
                console.error("Error rendering analysis:", error);
                // If anything goes wrong, fall back to the original display
                return (
                  <pre className="whitespace-pre-wrap font-sans text-base">
                    {analysisQuery.data.analysis}
                  </pre>
                );
              }
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}