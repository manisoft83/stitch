
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow, type DesignDetails, initialSingleDesignState } from '@/contexts/order-workflow-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Order as FullOrderType } from '@/lib/mockData';
import { format, addDays } from 'date-fns';
import { ArrowLeft, CheckCircle, User, Ruler, Palette, Info, ImageIcon, MapPin, PackagePlus, Shirt } from 'lucide-react';
import { saveOrderAction, type SaveOrderActionResult } from '@/app/orders/actions';
import { getDetailNameById, styleOptionsForDisplay, generateDesignSummary } from '@/lib/mockData';


export default function SummaryStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    currentCustomer,
    currentMeasurements,
    orderItems,
    resetWorkflow,
    editingOrderId,
    workflowReturnPath,
  } = useOrderWorkflow();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingAfterSuccess, setIsNavigatingAfterSuccess] = useState(false);

  useEffect(() => {
    if (isNavigatingAfterSuccess || isSubmitting) {
      return;
    }

    let message = '';
    let redirectTo = '';

    if (!currentCustomer) {
      message = "Missing Customer. Please start from the customer step.";
      redirectTo = '/workflow/customer-step';
    } else if (!currentMeasurements) {
      message = "Missing Measurements. Please complete the measurement step.";
      redirectTo = '/workflow/measurement-step';
    } else if (!orderItems || orderItems.length === 0) {
      message = "No items in order. Please add items in the design step.";
      redirectTo = '/workflow/design-step';
    }

    if (redirectTo) {
      toast({ title: "Workflow Incomplete", description: message, variant: "destructive" });
      router.replace(redirectTo);
      return;
    }
  }, [currentCustomer, currentMeasurements, orderItems, router, toast, isSubmitting, workflowReturnPath, isNavigatingAfterSuccess]);


  const handleConfirmOrder = async () => {
    if (!currentCustomer || !currentMeasurements || !orderItems || orderItems.length === 0) {
      toast({ title: "Error", description: "Missing order information or no items to submit.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const itemsSummaryList: string[] = orderItems.map(item => generateDesignSummary(item));
    
    const measurementsSummaryText: string = `Bust: ${currentMeasurements.bust}, Waist: ${currentMeasurements.waist}, Hips: ${currentMeasurements.hips}, Height: ${currentMeasurements.height}`;

    const generalOrderNotes = orderItems.map((item, idx) => item.notes ? `Item ${idx+1} Notes: ${item.notes}`: '').filter(Boolean).join('\n') || `Custom order for ${currentCustomer.name}. Includes ${orderItems.length} item(s).`;
    
    const orderStatusToSet: FullOrderType['status'] = editingOrderId && orderItems[0]?.status ? orderItems[0].status : "Pending Assignment";
    const orderDueDateToSet: string = editingOrderId && orderItems[0]?.dueDate 
                                      ? orderItems[0].dueDate 
                                      : format(addDays(new Date(), 7), "yyyy-MM-dd");

    const orderDataForSave: Omit<FullOrderType, 'id' | 'createdAt' | 'updatedAt'> = {
      date: format(new Date(), "yyyy-MM-dd"),
      status: orderStatusToSet,
      total: "Pricing TBD", // Updated placeholder
      items: itemsSummaryList,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      measurementsSummary: measurementsSummaryText,
      detailedItems: orderItems,
      assignedTailorId: editingOrderId && orderItems[0]?.assignedTailorId ? orderItems[0].assignedTailorId : null,
      assignedTailorName: editingOrderId && orderItems[0]?.assignedTailorName ? orderItems[0].assignedTailorName : null,
      dueDate: orderDueDateToSet,
      shippingAddress: currentCustomer.address || undefined,
      notes: generalOrderNotes,
    };
    
    try {
      const result: SaveOrderActionResult = await saveOrderAction(orderDataForSave as FullOrderType, editingOrderId || undefined);

      if (result.success && result.order) {
        setIsNavigatingAfterSuccess(true); 
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

  if (!isSubmitting && !isNavigatingAfterSuccess) {
    if (!currentCustomer || !currentMeasurements || !orderItems || orderItems.length === 0) {
        return (
            <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
                <p className="text-muted-foreground">Loading workflow state or redirecting...</p>
            </div>
        );
    }
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
            Please review all details before {editingOrderId ? "updating" : "placing"} your custom order for {currentCustomer?.name || 'the customer'}.
            This order contains {orderItems.length} item(s).
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
                <CardTitle className="text-lg flex items-center gap-2"><Ruler className="h-5 w-5 text-primary"/>Measurements</CardTitle>
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

          {orderItems && orderItems.length > 0 && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><PackagePlus className="h-5 w-5 text-primary"/>Order Items ({orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((itemDesign, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                     <h4 className="text-md font-semibold mb-1 flex items-center gap-2"><Shirt className="h-4 w-4 text-muted-foreground"/>Item {index + 1}: {generateDesignSummary(itemDesign)}</h4>
                    <div className="text-xs space-y-0.5 pl-2">
                        <p><strong>Style:</strong> {itemDesign.style ? getDetailNameById(itemDesign.style, styleOptionsForDisplay) : 'N/A'}</p>
                        {itemDesign.notes && <p><strong>Notes:</strong> <span className="whitespace-pre-wrap">{itemDesign.notes}</span></p>}
                        
                        {itemDesign.style === 'fitted-blouse' && itemDesign.blouseDetails && Object.keys(itemDesign.blouseDetails).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-muted/50">
                                <p className="font-medium text-xs text-foreground">Blouse Specifics:</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    {itemDesign.blouseDetails.type && <li>Type: {itemDesign.blouseDetails.type}</li>}
                                    {itemDesign.blouseDetails.length && <li>Length: {itemDesign.blouseDetails.length}"</li>}
                                    {itemDesign.blouseDetails.upperChest && <li>Upper Chest: {itemDesign.blouseDetails.upperChest}"</li>}
                                    {itemDesign.blouseDetails.waist && <li>Waist: {itemDesign.blouseDetails.waist}"</li>}
                                    {itemDesign.blouseDetails.shoulder && <li>Shoulder: {itemDesign.blouseDetails.shoulder}"</li>}
                                    {itemDesign.blouseDetails.sleeve && <li>Sleeve: {itemDesign.blouseDetails.sleeve}"</li>}
                                    {itemDesign.blouseDetails.frontNeck && <li>Front Neck: {itemDesign.blouseDetails.frontNeck}"</li>}
                                    {itemDesign.blouseDetails.backNeck && <li>Back Neck: {itemDesign.blouseDetails.backNeck}"</li>}
                                    {itemDesign.blouseDetails.dt && <li>DT: {itemDesign.blouseDetails.dt}"</li>}
                                </ul>
                            </div>
                        )}
                        
                        {itemDesign.referenceImages && itemDesign.referenceImages.length > 0 && (
                        <div className="mt-1">
                            <strong className="flex items-center gap-1 text-xs"><ImageIcon className="h-3 w-3" />Ref Images:</strong>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                            {itemDesign.referenceImages.map((src, imgIdx) => (
                                <Image
                                key={imgIdx}
                                src={src}
                                alt={`Ref ${index + 1}-${imgIdx + 1}`}
                                width={30}
                                height={30}
                                className="rounded border object-cover shadow-sm"
                                data-ai-hint="design reference thumbnail"
                                />
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                  </div>
                ))}
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
                <p className="mt-2 text-xs text-muted-foreground">Order {editingOrderId ? "updates are" : "placement is"} saved to Firestore. The total displayed is currently a placeholder.</p>
             </CardContent>
           </Card>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/workflow/design-step')} className="w-full sm:w-auto" disabled={isSubmitting || isNavigatingAfterSuccess}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Design
          </Button>
          <Button 
            onClick={handleConfirmOrder} 
            className="w-full sm:w-auto shadow-md hover:shadow-lg" 
            disabled={isSubmitting || isNavigatingAfterSuccess || !currentCustomer || !currentMeasurements || !orderItems || orderItems.length === 0}
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
