"use client";

import { useState } from 'react';
import type { StyleRecommendationsOutput } from '@/ai/flows/generate-style-recommendations';
import { RecommendationForm } from './recommendation-form';
import { RecommendationDisplay } from './recommendation-display';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export function RecommendationEngine() {
  const [recommendations, setRecommendations] = useState<StyleRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewRecommendations = (data: StyleRecommendationsOutput | null, errorMsg?: string) => {
    setRecommendations(data);
    setError(errorMsg || null);
  };

  return (
    <div className="space-y-8">
      <RecommendationForm 
        onRecommendationsFetched={handleNewRecommendations} 
        setIsLoading={setIsLoading}
        currentData={recommendations}
      />
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Generating your style profile...</p>
        </div>
      )}
      {error && !isLoading && (
        <div className="text-center py-4">
          <p className="text-destructive font-semibold">Error: {error}</p>
        </div>
      )}
      {recommendations && !isLoading && !error && (
        <>
          <Separator className="my-6" />
          <RecommendationDisplay data={recommendations} />
        </>
      )}
    </div>
  );
}
