
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderWorkflow, type DesignDetails } from '@/contexts/order-workflow-context';
import { DesignTool } from '@/components/design/design-tool';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Palette } from 'lucide-react';

export default function DesignStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCustomer, currentMeasurements, currentDesign, setDesign } = useOrderWorkflow();

  useEffect(() => {
    if (!currentCustomer) {
      toast({
        title: "No Customer Selected",
        description: "Please select or register a customer first.",
        variant: "destructive",
      });
      router.replace('/workflow/customer-step');
    } else if (!currentMeasurements) {
      toast({
        title: "No Measurements Found",
        description: "Please provide measurements before designing.",
        variant: "destructive",
      });
      router.replace('/workflow/measurement-step');
    }
  }, [currentCustomer, currentMeasurements, router, toast]);

  const handleSaveDesign = (data: DesignDetails) => {
    setDesign(data);
    toast({
      title: "Design Saved",
      description: `Design details for ${currentCustomer?.name}'s order have been saved.`,
    });
    // Navigate to the next step (e.g., summary/confirmation)
    router.push('/workflow/summary-step');
  };

  if (!currentCustomer || !currentMeasurements) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading workflow state or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">Create Your Custom Design</CardTitle>
          </div>
          <CardDescription>
            Select fabric, color, style, and add any custom notes for <span className="font-semibold text-foreground">{currentCustomer.name}</span>'s order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesignTool initialDesign={currentDesign} onSaveDesign={handleSaveDesign} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/workflow/measurement-step')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Measurements
          </Button>
          {/* The "Save Design & Proceed" button is inside DesignTool */}
        </CardFooter>
      </Card>
    </div>
  );
}
