
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow, type DesignDetails } from '@/contexts/order-workflow-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { type Order as FullOrderType, generateDesignSummary, allPossibleMeasurements } from '@/lib/mockData';
import { format, addDays } from 'date-fns';
import { ArrowLeft, CheckCircle, User, Ruler, Palette, Info, ImageIcon, MapPin, PackagePlus, Shirt, Truck } from 'lucide-react';
import { saveOrderAction, type SaveOrderActionResult } from '@/app/orders/actions';
import { Badge } from '@/components/ui/badge';

export default function SummaryStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    currentCustomer,
    orderItems,
    resetWorkflow,
    editingOrderId,
    workflowReturnPath,
    isCourier
  } = useOrderWorkflow();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingAfterSuccess, setIsNavigatingAfterSuccess] = useState(false);

  useEffect(() => {
    if (isNavigatingAfterSuccess || isSubmitting) return;

    let message = '';
    let redirectTo = '';

    if (!currentCustomer) {
      message = "Missing Customer. Please start from the customer step.";
      redirectTo = '/workflow/customer-step';
    } else if (!orderItems || orderItems.length === 0) {
      message = "No items in order. Please add items in the design step.";
      redirectTo = '/workflow/design-step';
    }

    if (redirectTo) {
      toast({ title: "Workflow Incomplete", description: message, variant: "destructive" });
      router.replace(redirectTo);
    }
  }, [currentCustomer, orderItems, router, toast, isSubmitting, isNavigatingAfterSuccess]);


  const handleConfirmOrder = async () => {
    if (!currentCustomer || !orderItems || orderItems.length === 0) {
      toast({ title: "Error", description: "Missing order information.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const itemsSummaryList: string[] = orderItems.map(item => generateDesignSummary(item));
    
    const generalOrderNotes = orderItems.map((item, idx) => item.notes ? `Item ${idx+1} Notes: ${item.notes}`: '').filter(Boolean).join('\n') || `Custom order for ${currentCustomer.name}.`;
    
    const orderStatusToSet: FullOrderType['status'] = editingOrderId && orderItems[0]?.status ? orderItems[0].status : "Pending Assignment";
    const orderDueDateToSet: string = editingOrderId && orderItems[0]?.dueDate 
                                      ? orderItems[0].dueDate 
                                      : format(addDays(new Date(), 7), "yyyy-MM-dd");

    const orderDataForSave: Omit<FullOrderType, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'> = {
      date: format(new Date(), "yyyy-MM-dd"),
      status: orderStatusToSet,
      total: "Pricing TBD",
      items: itemsSummaryList,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      detailedItems: orderItems,
      assignedTailorId: editingOrderId && orderItems[0]?.assignedTailorId ? orderItems[0].assignedTailorId : null,
      assignedTailorName: editingOrderId && orderItems[0]?.assignedTailorName ? orderItems[0].assignedTailorName : null,
      dueDate: orderDueDateToSet,
      shippingAddress: currentCustomer.address || undefined,
      isCourier: isCourier,
      notes: generalOrderNotes,
    };
    
    try {
      const result: SaveOrderActionResult = await saveOrderAction(orderDataForSave as Omit<FullOrderType, "orderNumber">, editingOrderId || undefined);

      if (result.success && result.order) {
        setIsNavigatingAfterSuccess(true); 
        toast({
          title: editingOrderId ? "Order Updated!" : "Order Placed!",
          description: `Order #${result.order.orderNumber} successfully ${editingOrderId ? 'updated' : 'submitted'}.`,
        });
        const pathAfterConfirm = workflowReturnPath || `/orders/${result.order.id}`;
        resetWorkflow();
        router.push(pathAfterConfirm);
      } else {
        toast({
          title: "Error Submitting Order",
          description: result.error || "Failed to process order.",
          variant: "destructive",
        });
      }
    } catch (e: unknown) { 
       toast({
        title: "Submission Error",
        description: e instanceof Error ? e.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }; 
  
  const getMeasurementLabel = (id: string) => {
    return allPossibleMeasurements.find(m => m.id === id)?.label || id;
  }

  if ((!isSubmitting && !isNavigatingAfterSuccess) && (!currentCustomer || !orderItems || orderItems.length === 0)) {
    return <div className="container mx-auto py-8 text-center">Redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-7 w-7 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary">
                {editingOrderId ? `Review Updated Order #${editingOrderId}` : "Order Summary"}
                </CardTitle>
            </div>
            {isCourier && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-3">
                    <Truck className="h-4 w-4" /> Courier Delivery
                </Badge>
            )}
          </div>
          <CardDescription>
            Please review all details for {currentCustomer?.name}.
            Contains {orderItems.length} item(s).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center gap-2"><User className="h-4 w-4 text-primary"/>Customer</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <p className="font-semibold">{currentCustomer?.name}</p>
                    <p>{currentCustomer?.email}</p>
                    <p>{currentCustomer?.phone}</p>
                </CardContent>
              </Card>

              <Card className={`bg-muted/30 ${isCourier ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/>{isCourier ? 'Delivery Address (Required)' : 'Address (Optional)'}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {currentCustomer?.address?.street ? (
                    <address className="not-italic">
                      {currentCustomer.address.street}<br />
                      {currentCustomer.address.city}, {currentCustomer.address.zipCode}<br />
                      {currentCustomer.address.country}
                    </address>
                  ) : (
                    <p className="text-muted-foreground italic">No address provided.</p>
                  )}
                </CardContent>
              </Card>
          </div>
          
          <Separator />

          {orderItems.map((itemDesign, index) => {
            const hasMeasurementsToShow = itemDesign.measurements && Object.values(itemDesign.measurements).some(v => v !== undefined && v !== null && v !== '');
            return (
            <Card key={index} className="bg-muted/10 border-muted/50">
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><Shirt className="h-4 w-4 text-muted-foreground"/>Item {index + 1}: {generateDesignSummary(itemDesign)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pb-4">
                    {hasMeasurementsToShow && (
                        <div>
                            <p className="font-medium text-xs text-muted-foreground mb-1">Measurements:</p>
                            <ul className="grid grid-cols-2 gap-x-4 text-xs">
                                {Object.entries(itemDesign.measurements).map(([key, value]) => {
                                    if (value) return <li key={key}><strong>{getMeasurementLabel(key)}:</strong> {String(value)}</li>;
                                    return null;
                                })}
                            </ul>
                        </div>
                    )}
                    {itemDesign.notes && <p className="text-xs"><strong>Notes:</strong> {itemDesign.notes}</p>}
                    {itemDesign.referenceImages && itemDesign.referenceImages.length > 0 && (
                        <div className="flex gap-2">
                            {itemDesign.referenceImages.slice(0, 5).map((src, i) => (
                                <Image key={i} src={src} alt="Ref" width={40} height={40} className="rounded border bg-background" />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
          )})}
          
          <Separator />

           <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-sm">
                <p className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Upon confirmation, your order will be submitted to Firestore. 
                    {isCourier ? " Our courier team will use the address provided for delivery." : " The order will be held for pickup at our facility unless updated."}
                  </span>
                </p>
           </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/workflow/design-step')} className="w-full sm:w-auto" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Design
          </Button>
          <Button 
            onClick={handleConfirmOrder} 
            className="w-full sm:w-auto shadow-md" 
            disabled={isSubmitting || !currentCustomer || orderItems.length === 0}
          >
            {isSubmitting ? "Processing..." : (editingOrderId ? "Update Order" : "Place Order")}
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
