
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { MeasurementForm } from '@/components/measurements/measurement-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { MeasurementFormValues } from '@/lib/schemas';
// import { mockCustomers } from '@/lib/mockData'; // No longer directly modifying mockCustomers
import { updateCustomerMeasurements } from '@/lib/server/dataService'; // To save measurements to Firestore
import { ArrowLeft, Ruler } from 'lucide-react';

export default function MeasurementStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    currentMeasurements, 
    setMeasurements: setWorkflowMeasurements, // Renamed for clarity
    setCustomer: setWorkflowCustomer, // To update customer in context after DB update
    workflowReturnPath,
    setWorkflowReturnPath 
  } = useOrderWorkflow();

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

  const handleSaveMeasurements = async (data: MeasurementFormValues) => { 
    if (!currentCustomer || !currentCustomer.id) {
        toast({ title: "Error", description: "No customer selected to save measurements for.", variant: "destructive" });
        return;
    }

    const success = await updateCustomerMeasurements(currentCustomer.id, data); 

    if (success) {
        setWorkflowMeasurements(data); // Update measurements in workflow context

        // Update customer in context with new measurements
        const updatedCustomer = { ...currentCustomer, measurements: data };
        setWorkflowCustomer(updatedCustomer);

        toast({
          title: "Measurements Saved",
          description: `${currentCustomer?.name}'s measurements have been updated in Firestore.`,
        });
        
        if (workflowReturnPath) {
          router.push(workflowReturnPath);
          setWorkflowReturnPath(null); 
        } else {
          router.push('/workflow/design-step'); 
        }
    } else {
        toast({
            title: "Error Saving Measurements",
            description: "Could not save measurements to the database. Please try again.",
            variant: "destructive",
        });
    }
  };

  if (!currentCustomer) {
    return (
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p>Redirecting to customer selection...</p>
        </div>
    );
  }
  
  const initialFormValues: Partial<MeasurementFormValues> = 
    currentMeasurements ||
    currentCustomer?.measurements ||
    { bust: undefined, waist: undefined, hips: undefined, height: undefined };

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
            These will be saved to Firestore and used for the current order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementForm
            initialValues={initialFormValues} 
            onSave={handleSaveMeasurements}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            if (workflowReturnPath) { 
                router.push(workflowReturnPath);
                setWorkflowReturnPath(null);
            } else { 
                router.push('/workflow/customer-step');
            }
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
