
"use client";

import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow, type DesignDetails } from '@/contexts/order-workflow-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockOrders, type Order, mockCustomers } from '@/lib/mockData';
import { format, addDays } from 'date-fns';
import { ArrowLeft, CheckCircle, User, Ruler, Palette, Info, ImageIcon } from 'lucide-react';

const fabricOptions = [
  { id: 'cotton', name: 'Cotton' },
  { id: 'silk', name: 'Silk' },
  { id: 'linen', name: 'Linen' },
  { id: 'wool', name: 'Wool' },
];

const colorOptions = [
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'blue', name: 'Blue', hex: '#0000FF' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
];

const styleOptions = [
  { id: 'a-line-dress', name: 'A-Line Dress' },
  { id: 'fitted-blouse', name: 'Fitted Blouse' },
  { id: 'wide-leg-trousers', name: 'Wide-Leg Trousers' },
  { id: 'pencil-skirt', name: 'Pencil Skirt' },
];


export default function SummaryStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    currentMeasurements, 
    currentDesign, 
    resetWorkflow,
    editingOrderId, 
    workflowReturnPath 
  } = useOrderWorkflow();

  const [isSubmitted, setIsSubmitted] = useState(false); // Flag to prevent effect on submission

  useEffect(() => {
    if (isSubmitted) return; // Don't run redirection logic if order was just submitted

    if (!currentCustomer) {
      toast({ title: "Missing Customer", description: "Please start from the customer step.", variant: "destructive" });
      router.replace('/workflow/customer-step');
    } else if (!currentMeasurements) {
      toast({ title: "Missing Measurements", description: "Please complete the measurement step.", variant: "destructive" });
      router.replace('/workflow/measurement-step');
    } else if (!currentDesign) {
      toast({ title: "Missing Design", description: "Please complete the design step.", variant: "destructive" });
      router.replace('/workflow/design-step');
    }
  }, [currentCustomer, currentMeasurements, currentDesign, router, toast, isSubmitted]);

  const getDetailName = (id: string | null, options: Array<{id: string, name: string}>): string => {
    if (!id) return 'Not selected';
    return options.find(opt => opt.id === id)?.name || 'Unknown';
  };

  const handleConfirmOrder = () => {
    if (!currentCustomer || !currentMeasurements || !currentDesign) {
      toast({ title: "Error", description: "Missing order information.", variant: "destructive" });
      return;
    }

    // Capture the return path BEFORE resetting the workflow
    const pathAfterConfirm = workflowReturnPath || '/orders'; 
    setIsSubmitted(true); // Set submitted flag before resetting and navigating

    const itemsOrdered = [
        `${getDetailName(currentDesign.style, styleOptions)} (${getDetailName(currentDesign.fabric, fabricOptions)}, ${getDetailName(currentDesign.color, colorOptions)})`
    ];
    
    let orderNotes = `Design Notes: ${currentDesign.notes || 'N/A'}
Measurements Profile: ${currentMeasurements.name || 'Default'}
Bust: ${currentMeasurements.bust}, Waist: ${currentMeasurements.waist}, Hips: ${currentMeasurements.hips}, Height: ${currentMeasurements.height}`;

    if (currentDesign.referenceImages && currentDesign.referenceImages.length > 0) {
        orderNotes += `\nReference Images: ${currentDesign.referenceImages.length} provided.`;
    }

    if (editingOrderId) {
        const orderIndex = mockOrders.findIndex(o => o.id === editingOrderId);
        if (orderIndex !== -1) {
            mockOrders[orderIndex] = {
                ...mockOrders[orderIndex],
                items: itemsOrdered,
                notes: orderNotes,
                referenceImageUrls: currentDesign.referenceImages || [],
            };
             toast({
                title: "Order Updated!",
                description: `Order #${editingOrderId} has been successfully updated.`,
            });
        } else {
            toast({ title: "Error", description: `Could not find order #${editingOrderId} to update.`, variant: "destructive" });
            setIsSubmitted(false); // Reset submitted flag on error
            return;
        }
    } else {
        const newOrderId = `ORD${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`;
        const defaultDueDate = format(addDays(new Date(), 5), "yyyy-MM-dd");

        const newOrder: Order = {
          id: newOrderId,
          date: format(new Date(), "yyyy-MM-dd"),
          status: "Pending Assignment",
          total: "$0.00", 
          items: itemsOrdered,
          customerId: currentCustomer.id,
          customerName: currentCustomer.name,
          assignedTailorId: null,
          assignedTailorName: null,
          dueDate: defaultDueDate,
          shippingAddress: { 
            street: "123 Workflow Ln",
            city: "Context City",
            zipCode: "98765",
            country: "USA",
          },
          notes: orderNotes,
          referenceImageUrls: currentDesign.referenceImages || [],
        };
        mockOrders.unshift(newOrder);
        toast({
            title: "Order Placed!",
            description: `Your order #${newOrderId} has been successfully submitted.`,
        });
    }

    const customerIndex = mockCustomers.findIndex(c => c.id === currentCustomer.id);
    if (customerIndex !== -1) {
        mockCustomers[customerIndex] = {
            ...mockCustomers[customerIndex],
            measurements: currentMeasurements, 
        };
    }

    resetWorkflow(); 
    router.push(pathAfterConfirm);
  };

  if (!currentCustomer || !currentMeasurements || !currentDesign) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Loading workflow state or redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">
              {editingOrderId ? `Review Updated Order #${editingOrderId}` : "Order Summary & Confirmation"}
            </CardTitle>
          </div>
          <CardDescription>
            Please review all details before {editingOrderId ? "updating" : "placing"} your custom order for {currentCustomer.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Name:</strong> {currentCustomer.name}</p>
              <p><strong>Email:</strong> {currentCustomer.email}</p>
              <p><strong>Phone:</strong> {currentCustomer.phone}</p>
            </CardContent>
          </Card>
          
          <Separator />

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Ruler className="h-5 w-5 text-primary"/>Measurement Profile: {currentMeasurements.name || "Default"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>Bust:</strong> {currentMeasurements.bust} inches</p>
              <p><strong>Waist:</strong> {currentMeasurements.waist} inches</p>
              <p><strong>Hips:</strong> {currentMeasurements.hips} inches</p>
              <p><strong>Height:</strong> {currentMeasurements.height} inches</p>
            </CardContent>
          </Card>

          <Separator />

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Design Specifications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Style:</strong> {getDetailName(currentDesign.style, styleOptions)}</p>
              <p><strong>Fabric:</strong> {getDetailName(currentDesign.fabric, fabricOptions)}</p>
              <p><strong>Color:</strong> {getDetailName(currentDesign.color, colorOptions)}</p>
              {currentDesign.notes && <p><strong>Notes:</strong> <span className="whitespace-pre-wrap">{currentDesign.notes}</span></p>}
              
              {currentDesign.referenceImages && currentDesign.referenceImages.length > 0 && (
                <div>
                  <strong className="flex items-center gap-1"><ImageIcon className="h-4 w-4 text-muted-foreground" />Reference Images:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentDesign.referenceImages.map((src, index) => (
                      <Image
                        key={index}
                        src={src}
                        alt={`Reference ${index + 1}`}
                        width={60}
                        height={60}
                        className="rounded-md border object-cover shadow-sm"
                        data-ai-hint="design reference thumbnail"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />
           <Card className="border-primary/50 bg-primary/5">
             <CardHeader>
                <CardTitle className="text-md flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Next Steps</CardTitle>
             </CardHeader>
             <CardContent className="text-sm">
                <p>
                  Upon confirmation, your order will be {editingOrderId ? "updated" : "submitted and will appear in 'My Orders'"}.
                  {editingOrderId ? "" : " It will then await assignment to one of our skilled tailors."} You can track its progress from there.
                  {!editingOrderId && currentDesign && <span className="block mt-1">The estimated due date will be {format(addDays(new Date(), 5), "PPP")}.</span>}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Note: This is a prototype. Order {editingOrderId ? "updates are" : "placement is"} simulated and payment is not processed.</p>
             </CardContent>
           </Card>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/workflow/design-step')} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Design
          </Button>
          <Button onClick={handleConfirmOrder} className="w-full sm:w-auto shadow-md hover:shadow-lg">
            <CheckCircle className="mr-2 h-4 w-4" /> 
            {editingOrderId ? "Confirm & Update Order" : "Confirm & Place Order"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

