
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow, type DesignDetails } from '@/contexts/order-workflow-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/mockData';
import { format, addDays } from 'date-fns';
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
  } = useOrderWorkflow();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      return; // Don't redirect if currently submitting
    }

    let message = '';
    let redirectTo = '';

    if (!currentCustomer) {
      message = "Missing Customer. Please start from the customer step.";
      redirectTo = '/workflow/customer-step';
    } else if (!currentMeasurements) {
      message = "Missing Measurements. Please complete the measurement step.";
      redirectTo = '/workflow/measurement-step';
    } else if (!currentDesign) {
      message = "Missing Design. Please complete the design step.";
      redirectTo = '/workflow/design-step';
    }

    if (redirectTo) {
      toast({ title: "Workflow Incomplete", description: message, variant: "destructive" });
      router.replace(redirectTo);
    }
  }, [currentCustomer, currentMeasurements, currentDesign, router, toast, isSubmitting]);


  const handleConfirmOrder = async () => {
    if (!currentCustomer || !currentMeasurements || !currentDesign) {
      toast({ title: "Error", description: "Missing order information to submit.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const designStyleName = currentDesign.style ? getDetailNameById(currentDesign.style, styleOptionsForDisplay) : 'N/A';
    const designFabricName = currentDesign.fabric ? getDetailNameById(currentDesign.fabric, fabricOptionsForDisplay) : 'N/A';
    const designColorName = currentDesign.color ? getDetailNameById(currentDesign.color, colorOptionsForDisplay) : 'N/A';

    const itemsOrdered: string[] = [`${designStyleName} (${designFabricName}, ${designColorName})`];

    const measurementsSummaryText: string = `Profile: ${currentMeasurements.name || "Default"}. Bust: ${currentMeasurements.bust}, Waist: ${currentMeasurements.waist}, Hips: ${currentMeasurements.hips}, Height: ${currentMeasurements.height}`;

    let orderNotesForSave: string = currentDesign.notes || '';
    if (orderNotesForSave.trim() === '') {
        orderNotesForSave = `Custom order for ${currentCustomer.name}. Style: ${designStyleName}. Fabric: ${designFabricName}. Color: ${designColorName}.`;
    }

    const newOrderDate: string = format(new Date(), "yyyy-MM-dd");
    
    const orderStatusToSet = editingOrderId && currentDesign.status ? currentDesign.status : "Pending Assignment";
    
    const orderDueDateToSet: string = editingOrderId && currentDesign.dueDate 
                                      ? currentDesign.dueDate 
                                      : format(addDays(new Date(), 7), "yyyy-MM-dd");

    const orderDesignDetailsToSave = {
        fabric: currentDesign.fabric,
        color: currentDesign.color,
        style: currentDesign.style,
        notes: currentDesign.notes || '',
        referenceImageUrls: currentDesign.referenceImages || [],
    };

    const orderDataForSave = {
      date: newOrderDate,
      status: orderStatusToSet,
      total: "$0.00", 
      items: itemsOrdered,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      measurementsSummary: measurementsSummaryText,
      designDetails: orderDesignDetailsToSave,
      assignedTailorId: editingOrderId && currentDesign.assignedTailorId ? currentDesign.assignedTailorId : null,
      assignedTailorName: editingOrderId && currentDesign.assignedTailorName ? currentDesign.assignedTailorName : null,
      dueDate: orderDueDateToSet,
      shippingAddress: currentCustomer.address || undefined,
      notes: orderNotesForSave,
    };
    
    try {
      const result: SaveOrderActionResult = await saveOrderAction(orderDataForSave as Order, editingOrderId || undefined);

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
          title: "Error Submitting Order",
          description: result.error || `Failed to ${editingOrderId ? 'update' : 'place'} order.`,
          variant: "destructive",
        });
      }
    } catch (e: unknown) { 
       toast({
        title: "Submission Error",
        description: e instanceof Error ? e.message : "An unexpected error occurred during submission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }; 

  // This early return handles cases where essential data is missing,
  // preventing the main JSX from rendering until data is ready or redirected.
  if (!currentCustomer || !currentMeasurements || !currentDesign) {
    // The useEffect hook should handle redirection.
    // This return is a safeguard if the component tries to render before redirection.
    if (!isSubmitting) { // Only render loading/redirecting if not in the middle of a submission
        return (
            <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
                <p className="text-muted-foreground">Loading workflow state or redirecting...</p>
            </div>
        );
    }
  }
  // All JavaScript logic before this point must be syntactically correct.
  // The error "Unexpected token div" indicates a JS syntax error above.
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
            Please review all details before {editingOrderId ? "updating" : "placing"} your custom order for {currentCustomer?.name || 'the customer'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentCustomer && (
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
          )}

          {currentCustomer?.address && (currentCustomer.address.street || currentCustomer.address.city) && (
            <>
              <Separator />
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1 not-italic">
                  {currentCustomer.address.street && <p>{currentCustomer.address.street}</p>}
                  {(currentCustomer.address.city || currentCustomer.address.zipCode) && <p>{currentCustomer.address.city}{currentCustomer.address.city && currentCustomer.address.zipCode ? ", " : ""}{currentCustomer.address.zipCode}</p>}
                  {currentCustomer.address.country && <p>{currentCustomer.address.country}</p>}
                </CardContent>
              </Card>
            </>
          )}
          
          <Separator />

          {currentMeasurements && (
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
          )}

          <Separator />

          {currentDesign && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Design Specifications</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Style:</strong> {currentDesign.style ? getDetailNameById(currentDesign.style, styleOptionsForDisplay) : 'N/A'}</p>
                <p><strong>Fabric:</strong> {currentDesign.fabric ? getDetailNameById(currentDesign.fabric, fabricOptionsForDisplay) : 'N/A'}</p>
                <p><strong>Color:</strong> {currentDesign.color ? getDetailNameById(currentDesign.color, colorOptionsForDisplay) : 'N/A'}</p>
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
                    <p className="text-xs text-muted-foreground mt-1">Note: Images are stored as Data URLs. For production, consider Firebase Storage.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Separator />

           <Card className="border-primary/50 bg-primary/5">
             <CardHeader>
                <CardTitle className="text-md flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Next Steps</CardTitle>
             </CardHeader>
             <CardContent className="text-sm">
                <p>
                  Upon confirmation, your order will be {editingOrderId ? "updated" : "submitted to Firestore and will appear in 'My Orders'"}.
                  {editingOrderId ? "" : " It will then await assignment to one of our skilled tailors."} You can track its progress from there.
                  {!editingOrderId && <span className="block mt-1">The estimated due date will be {format(addDays(new Date(), 7), "PPP")}.</span>}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Order {editingOrderId ? "updates are" : "placement is"} saved to Firestore.</p>
             </CardContent>
           </Card>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/workflow/design-step')} className="w-full sm:w-auto" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Design
          </Button>
          <Button 
            onClick={handleConfirmOrder} 
            className="w-full sm:w-auto shadow-md hover:shadow-lg" 
            disabled={isSubmitting || !currentCustomer || !currentMeasurements || !currentDesign}
          >
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

    