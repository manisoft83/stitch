import { RecommendationEngine } from "@/components/recommendations/recommendation-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">AI Style Advisor</CardTitle>
          </div>
          <CardDescription>
            Get personalized style recommendations based on your measurements and preferences. 
            Our AI will help you discover looks that flatter and express your unique style.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecommendationEngine />
        </CardContent>
      </Card>
    </div>
  );
}
