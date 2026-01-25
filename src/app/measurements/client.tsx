
"use client";

import { useState, useMemo } from 'react';
import type { Customer, GarmentStyle } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MeasurementForm } from '@/components/measurements/measurement-form';
import { saveCustomerMeasurementsAction } from '@/app/customers/actions';
import { useToast } from '@/hooks/use-toast';
import { Ruler, User, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MeasurementsClientPageProps {
  initialCustomers: Customer[];
  initialStyles: GarmentStyle[];
}

export default function MeasurementsClientPage({ initialCustomers, initialStyles }: MeasurementsClientPageProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [styleIdToAdd, setStyleIdToAdd] = useState<string>('');

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setStyleIdToAdd(''); // Reset the "add new" dropdown when customer changes
  };
  
  const handleSaveMeasurements = async (styleId: string, measurements: { [key: string]: string | number | undefined }) => {
    if (!selectedCustomerId) {
      toast({ title: "Error", description: "No customer selected.", variant: "destructive" });
      return;
    }

    // Filter out undefined/null/empty string values before saving
    const cleanedMeasurements = Object.entries(measurements).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string | number });

    const result = await saveCustomerMeasurementsAction(selectedCustomerId, styleId, cleanedMeasurements);
    if (result.success) {
      toast({ title: "Measurements Saved", description: "The customer's profile has been updated." });
      // Optimistically update the local customer state
      setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.id === selectedCustomerId) {
          return {
            ...c,
            savedMeasurements: {
              ...c.savedMeasurements,
              [styleId]: cleanedMeasurements,
            }
          };
        }
        return c;
      }));
      // Reset the "add" form if we were adding a new style
      if(styleId === styleIdToAdd) {
        setStyleIdToAdd('');
      }
    } else {
      toast({ title: "Error", description: result.error || "Failed to save measurements.", variant: "destructive" });
    }
  };

  const savedStylesForCustomer = useMemo(() => {
    if (!selectedCustomer?.savedMeasurements) return [];
    return initialStyles.filter(style => selectedCustomer.savedMeasurements![style.id]);
  }, [selectedCustomer, initialStyles]);
  
  const availableStylesToAdd = useMemo(() => {
    if (!selectedCustomer) return [];
    const savedStyleIds = Object.keys(selectedCustomer.savedMeasurements || {});
    return initialStyles.filter(style => !savedStyleIds.includes(style.id));
  }, [selectedCustomer, initialStyles]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Ruler className="mr-3 h-7 w-7" /> Customer Measurement Profiles
        </h1>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Select a Customer</CardTitle>
          <CardDescription>Choose a customer to view or edit their saved measurement profiles for different garment styles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleCustomerChange} value={selectedCustomerId}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Select a customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.name} ({customer.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <div className="mt-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Saved Profiles for {selectedCustomer.name}</CardTitle>
              <CardDescription>Click on a style to view or edit the saved measurements.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedStylesForCustomer.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {savedStylesForCustomer.map(style => (
                    <AccordionItem value={style.id} key={style.id}>
                      <AccordionTrigger className="text-lg">{style.name}</AccordionTrigger>
                      <AccordionContent>
                        <MeasurementForm
                          key={`${selectedCustomer.id}-${style.id}`} // Force re-render on change
                          style={style}
                          initialValues={selectedCustomer.savedMeasurements?.[style.id] || {}}
                          onSave={(measurements) => handleSaveMeasurements(style.id, measurements)}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-4">This customer has no saved measurement profiles yet.</p>
              )}
            </CardContent>
          </Card>
          
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> Add New Measurement Profile</CardTitle>
              <CardDescription>Create a new measurement profile for {selectedCustomer.name} for a style they haven't used before.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={setStyleIdToAdd} value={styleIdToAdd}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue placeholder="Choose a style to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStylesToAdd.map(style => (
                    <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {styleIdToAdd && initialStyles.find(s => s.id === styleIdToAdd) && (
                <div className="pt-4 border-t">
                   <h3 className="mb-4 font-medium">Enter measurements for: <span className="text-primary">{initialStyles.find(s => s.id === styleIdToAdd)?.name}</span></h3>
                   <MeasurementForm
                     style={initialStyles.find(s => s.id === styleIdToAdd)!}
                     initialValues={{}}
                     onSave={(measurements) => handleSaveMeasurements(styleIdToAdd, measurements)}
                    />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
