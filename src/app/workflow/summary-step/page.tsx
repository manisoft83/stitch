
"use client";

import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Order, Address } from '@/lib/mockData'; 
import { format, addDays, parseISO } from 'date-fns';
import { ArrowLeft, CheckCircle, User, Ruler, Palette, Info, ImageIcon, MapPin } from 'lucide-react';
import { saveOrderAction, type SaveOrderActionResult } from '@/app/orders/actions';
import { getDetailNameById, fabricOptionsForDisplay, colorOptionsForDisplay, styleOptionsForDisplay } from '@/lib/mockData';


export default function SummaryStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    currentMeasurements, 
    currentDesign, 
    resetWorkflow,
    editingOrderId, 
    workflowReturnPath,
    setWorkflowReturnPath, 
    setEditingOrderId
  } = useOrderWorkflow();

  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (isSubmitting) return; 

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
  }, [currentCustomer, currentMeasurements, currentDesign, router, toast, isSubmitting]);

  const handleConfirmOrder = async () => {
    if (!currentCustomer || !currentMeasurements || !currentDesign) {
      toast({ title: "Error", description: "Missing order information.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const itemsOrdered = [
        `${getDetailNameById(currentDesign.style, styleOptionsForDisplay)} (${getDetailNameById(currentDesign.fabric, fabricOptionsForDisplay)}, ${getDetailNameById(currentDesign.color, colorOptionsForDisplay)})`
    ];
    
    const measurementsSummaryText = `Profile: ${currentMeasurements.name || "Default"}. Bust: ${currentMeasurements.bust}, Waist: ${currentMeasurements.waist}, Hips: ${currentMeasurements.hips}, Height: ${currentMeasurements.height}`;

    const orderToSave: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = { // Omit fields Firestore will generate/manage
      date: format(new Date(), "yyyy-MM-dd"), // Or parseISO if you expect ISO from somewhere
      status: editingOrderId ? currentDesign.status || "Pending Assignment" : "Pending Assignment", // Preserve status if editing, else default
      total: "$0.00", // Placeholder, pricing logic to be added
      items: itemsOrdered,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      measurementsSummary: measurementsSummaryText,
      designDetails: { // Storing design details structured
        fabric: currentDesign.fabric,
        color: currentDesign.color,
        style: currentDesign.style,
        notes: currentDesign.notes || '',
        // TODO: Refactor referenceImageUrls to store Firebase Storage URLs instead of Data URLs
        referenceImageUrls: currentDesign.referenceImages || [],
      },
      assignedTailorId: null, // To be assigned later
      assignedTailorName: null,
      dueDate: format(addDays(new Date(), 7), "yyyy-MM-dd"), // Default due date
      shippingAddress: currentCustomer.address || undefined,
      notes: currentDesign.notes || `Order for ${currentCustomer.name}. Style: ${getDetailNameById(currentDesign.style, styleOptionsForDisplay)}. Fabric: ${getDetailNameById(currentDesign.fabric, fabricOptionsForDisplay)}. Color: ${getDetailNameById(currentDesign.color, colorOptionsForDisplay)}.`,
    };

    if (editingOrderId) {
      // If editing, we need to fetch the original order to preserve fields not covered by the workflow.
      // This is simplified here; a real app might merge more carefully or fetch original order.
      // For now, we assume the orderToSave structure is what we want to update.
    }
    
    const result: SaveOrderActionResult = await saveOrderAction(orderToSave as Order, editingOrderId || undefined);

    if (result.success && result.order) {
      toast({
        title: editingOrderId ? "Order Updated!" : "Order Placed!",
        description: `Order #${result.order.id} has been successfully ${editingOrderId ? 'updated' : 'submitted'}.`,
      });
      const pathAfterConfirm = workflowReturnPath || `/orders/${result.order.id}`;
      resetWorkflow();
      router.push(pathAfterConfirm);
    } else {
      toast({
        title: "Error",
        description: result.error || `Failed to ${editingOrderId ? 'update' : 'place'} order.`,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
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

          {currentCustomer.address && (
            <>
              <Separator />
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Shipping Address</CardTitle>
                </Header>
                <CardContent className="text-sm space-y-1 not-italic">
                  <p>{currentCustomer.address.street}</p>
                  <p>{currentCustomer.address.city}, {currentCustomer.address.zipCode}</p>
                  <p>{currentCustomer.address.country}</p>
                </CardContent>
              </Card>
            </>
          )}
          
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
              <p><strong>Style:</strong> {getDetailNameById(currentDesign.style, styleOptionsForDisplay)}</p>
              <p><strong>Fabric:</strong> {getDetailNameById(currentDesign.fabric, fabricOptionsForDisplay)}</p>
              <p><strong>Color:</strong> {getDetailNameById(currentDesign.color, colorOptionsForDisplay)}</p>
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
                   {/* TODO: Note about Data URLs */}
                  <p className="text-xs text-muted-foreground mt-1">Note: Images are stored as Data URLs. For production, use Firebase Storage.</p>
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
                  Upon confirmation, your order will be {editingOrderId ? "updated" : "submitted to Firestore and will appear in 'My Orders'"}.
                  {editingOrderId ? "" : " It will then await assignment to one of our skilled tailors."} You can track its progress from there.
                  {!editingOrderId && currentDesign && <span className="block mt-1">The estimated due date will be {format(addDays(new Date(), 7), "PPP")}.</span>}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Order {editingOrderId ? "updates are" : "placement is"} now saved to Firestore.</p>
             </CardContent>
           </Card>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/workflow/design-step')} className="w-full sm:w-auto" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Design
          </Button>
          <Button onClick={handleConfirmOrder} className="w-full sm:w-auto shadow-md hover:shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? (editingOrderId ? "Updating..." : "Placing Order...") : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> 
                {editingOrderId ? "Confirm & Update Order" : "Confirm & Place Order"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
