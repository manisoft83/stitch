import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Ban } from "lucide-react";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Ban className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="flex items-center justify-center gap-2 mb-2 mt-4">
            <Wand2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">AI Style Advisor</CardTitle>
          </div>
          <CardDescription>
            This feature is currently not available.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">The AI Style Advisor required customer measurements, which have been removed from the application.</p>
        </CardContent>
      </Card>
    </div>
  );
}
