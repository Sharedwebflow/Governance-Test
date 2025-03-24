import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
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
            <pre className="whitespace-pre-wrap font-sans text-base">
              {analysisQuery.data.analysis}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}