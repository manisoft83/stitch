import type { StyleRecommendationsOutput } from "@/ai/flows/generate-style-recommendations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface RecommendationDisplayProps {
  data: StyleRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  return (
    <Card className="bg-secondary/30 dark:bg-secondary/20 shadow-inner">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Your Personalized Style Insights</CardTitle>
        <CardDescription>
          Based on your profile, here are some styles and tips we think you'll love:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">Recommendations:</h3>
          {data.recommendations && data.recommendations.length > 0 ? (
            <ul className="list-none space-y-3 pl-0">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start p-3 bg-background rounded-md shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific recommendations generated. Try adjusting your preferences.</p>
          )}
        </div>
        
        {data.reasoning && (
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Reasoning:</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap p-3 bg-background rounded-md shadow-sm">
              {data.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
