
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { MeasurementForm } from '@/components/measurements/measurement-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { MeasurementFormValues } from '@/lib/schemas';
import { mockCustomers } from '@/lib/mockData'; 
import { ArrowLeft, ArrowRight, Ruler } from 'lucide-react';

export default function MeasurementStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentCustomer, currentMeasurements, setMeasurements, setCustomer } = useOrderWorkflow();

  useEffect(() => {
    if (!currentCustomer) {
      toast({
        title: "No Customer Selected",
        description: "Please select or register a customer first.",
        variant: "destructive",
      });
      router.replace('/workflow/customer-step');
    }
  }, [currentCustomer, router, toast]);

  // data is MeasurementFormValues, which includes 'name' for the profile name
  const handleSaveMeasurements = (data: MeasurementFormValues) => { 
    setMeasurements(data); // data already matches MeasurementFormValues

    // Mock: Update customer in mockCustomers array
    if (currentCustomer) {
      const customerIndex = mockCustomers.findIndex(c => c.id === currentCustomer.id);
      if (customerIndex !== -1) {
        const updatedCustomer = {
          ...mockCustomers[customerIndex],
          measurements: data, // Save data (which is MeasurementFormValues) directly
        };
        mockCustomers[customerIndex] = updatedCustomer;
        setCustomer(updatedCustomer); 
      }
    }

    toast({
      title: "Measurements Saved",
      description: `${currentCustomer?.name}'s measurements ${data.name ? "for profile '" + data.name + "'" : ""} have been updated.`,
    });
    // Navigate to the next step (e.g., design/order step)
    router.push('/workflow/design-step'); 
  };

  if (!currentCustomer) {
    return (
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p>Redirecting to customer selection...</p>
        </div>
    );
  }
  
  // currentMeasurements or currentCustomer.measurements are of type MeasurementFormValues | null/undefined
  // MeasurementFormValues includes 'name' for the profile name.
  const initialFormValues: Partial<MeasurementFormValues> = 
    currentMeasurements || 
    currentCustomer?.measurements || 
    { name: '', bust: undefined, waist: undefined, hips: undefined, height: undefined };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">Customer Measurements</CardTitle>
          </div>
          <CardDescription>
            Enter or update measurements for <span className="font-semibold text-foreground">{currentCustomer.name}</span>.
            These will be used for the current order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementForm
            initialValues={initialFormValues} // Pass the correctly structured initial values
            onSave={handleSaveMeasurements}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/workflow/customer-step')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
          </Button>
          {/* The submit button is inside MeasurementForm, text changes to "Save & Continue" via onSave prop */}
        </CardFooter>
      </Card>
    </div>
  );
}
