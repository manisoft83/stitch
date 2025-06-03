
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { type Order, allOrderStatuses, type OrderStatus, type Customer } from '@/lib/mockData'; 
import { getOrderDetailsAction, updateOrderStatusAction } from '@/app/orders/actions';
import { getCustomerById } from '@/lib/server/dataService'; 

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays, User, Users, MapPinIcon, Tag, DollarSign, Info, Edit3, Shuffle, ImageIcon, Ruler, Palette, FileText } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { getDetailNameById, fabricOptionsForDisplay, colorOptionsForDisplay, styleOptionsForDisplay } from '@/lib/mockData';


const getStatusBadgeColor = (status: OrderStatus | undefined) => {
    if (!status) return "bg-gray-100 text-gray-700 border border-gray-300";
    switch (status) {
      case "Pending Assignment": return "bg-orange-100 text-orange-700 border border-orange-300";
      case "Assigned": return "bg-cyan-100 text-cyan-700 border border-cyan-300";
      case "Processing": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Shipped": return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Delivered": return "bg-green-100 text-green-700 border border-green-300";
      case "Cancelled": return "bg-red-100 text-red-700 border border-red-300";
      default: return "bg-gray-100 text-gray-700 border border-gray-300";
    }
};


export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.orderId as string;

  const [currentOrder, setCurrentOrder] = useState<Order | null | undefined>(undefined); // undefined for loading state
  const [customerForOrder, setCustomerForOrder] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    setCustomer,
    setMeasurements,
    setDesign,
    setWorkflowReturnPath,
    setEditingOrderId
  } = useOrderWorkflow();


  useEffect(() => {
    const fetchOrderAndCustomer = async () => {
      if (!orderId) return;
      setIsLoading(true);
      const { order: fetchedOrder, error: orderError } = await getOrderDetailsAction(orderId);
      
      if (orderError || !fetchedOrder) {
        toast({ title: "Error", description: orderError || "Order not found.", variant: "destructive" });
        setCurrentOrder(null); // Explicitly set to null on error/not found
        setIsLoading(false);
        // notFound(); // Could call notFound() here if desired
        return;
      }
      
      setCurrentOrder(fetchedOrder);

      if (fetchedOrder.customerId) {
        const customer = await getCustomerById(fetchedOrder.customerId); // This is a server function, ensure it's callable or use an action
        setCustomerForOrder(customer);
      } else {
        setCustomerForOrder(null);
      }
      setIsLoading(false);
    };

    fetchOrderAndCustomer();
  }, [orderId, toast]);

  if (isLoading || currentOrder === undefined) { // Show loading if isLoading or currentOrder is still undefined
    return <div className="container mx-auto py-8 text-center">Loading order details...</div>;
  }

  if (!currentOrder) { // If loading is false and currentOrder is null, then it was not found or an error occurred
    // notFound(); // This will render the not-found.tsx page
    return (
        <div className="container mx-auto py-8 text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Order Not Found</CardTitle>
                    <CardDescription>The order you are looking for could not be found or an error occurred.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    const result = await updateOrderStatusAction(currentOrder.id, newStatus);
    if (result.success) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: "Order Status Updated",
        description: `Order #${currentOrder.id} status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error Updating Status",
        description: result.error || "Could not update order status.",
        variant: "destructive"
      });
    }
  };

  const handleEditOrder = () => {
    if (customerForOrder && currentOrder && currentOrder.designDetails && customerForOrder.measurements) {
      setCustomer(customerForOrder);
      setMeasurements(customerForOrder.measurements); // Measurements are on customer
      setDesign({ // Reconstruct DesignDetails from Order's designDetails
        fabric: currentOrder.designDetails.fabric,
        color: currentOrder.designDetails.color,
        style: currentOrder.designDetails.style,
        notes: currentOrder.designDetails.notes || '',
        referenceImages: currentOrder.designDetails.referenceImageUrls || [],
      });
      setEditingOrderId(currentOrder.id);
      setWorkflowReturnPath(`/orders/${currentOrder.id}`);
      router.push('/workflow/customer-step'); // Start workflow from customer step to allow changes
    } else {
       toast({
            title: "Cannot Edit Order",
            description: "Missing customer, measurements, or design details to start editing.",
            variant: "destructive"
        });
    }
  };


  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Order Details: #{currentOrder.id}</CardTitle>
            <CardDescription>
              Detailed view of your order from Firestore.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
             <div className="w-full sm:w-auto">
                <Label htmlFor="status-select" className="text-xs font-medium text-muted-foreground sr-only">Order Status</Label>
                <Select value={currentOrder.status} onValueChange={(value: OrderStatus) => handleStatusChange(value)}>
                    <SelectTrigger id="status-select" className="w-full sm:w-[200px] h-11 text-sm font-semibold">
                        <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                        {allOrderStatuses.map(status => (
                        <SelectItem key={status} value={status} className="text-sm">
                            {status}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             <Badge className={`px-3 py-1.5 text-sm font-semibold rounded-md h-11 flex items-center whitespace-nowrap ${getStatusBadgeColor(currentOrder.status)}`}>
                Current: {currentOrder.status}
             </Badge>
           </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg">
                <CardTitle className="text-lg mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-primary" />Order Information</CardTitle>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Order Date:</strong> <span className="ml-2">{currentOrder.date ? format(parseISO(currentOrder.date), "PPPp") : 'N/A'}</span></p>
                    <p className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Total Amount:</strong> <span className="ml-2">{currentOrder.total}</span></p>
                    {customerForOrder && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <Link href={`/customers?edit=${customerForOrder.id}`} className="ml-2 text-primary hover:underline">{customerForOrder.name}</Link></p>}
                    {!customerForOrder && currentOrder.customerName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <span className="ml-2">{currentOrder.customerName} (Loading details...)</span></p>}
                </div>
            </Card>
            <Card className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg">
                <CardTitle className="text-lg mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Tailor &amp; Production</CardTitle>
                 <div className="space-y-2 text-sm">
                    {currentOrder.assignedTailorName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Assigned Tailor:</strong> <span className="ml-2">{currentOrder.assignedTailorName}</span></p>}
                    {currentOrder.dueDate && <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Due Date:</strong> <span className="ml-2">{format(parseISO(currentOrder.dueDate), "PPP")}</span></p>}
                    {!currentOrder.assignedTailorName && currentOrder.status === "Pending Assignment" && <p className="text-muted-foreground">Awaiting tailor assignment.</p>}
                 </div>
            </Card>
          </div>
          
          <Separator />

          {customerForOrder?.measurements && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold flex items-center"><Ruler className="mr-2 h-5 w-5 text-primary" />Customer Measurements</h3>
                    {/* Edit measurements is now part of full order edit */}
                </div>
                <Card className="bg-background/50 p-4 rounded-md text-sm">
                    <p><strong>Profile:</strong> {customerForOrder.measurements.name || "Default"}</p>
                    <p><strong>Bust:</strong> {customerForOrder.measurements.bust} inches</p>
                    <p><strong>Waist:</strong> {customerForOrder.measurements.waist} inches</p>
                    <p><strong>Hips:</strong> {customerForOrder.measurements.hips} inches</p>
                    <p><strong>Height:</strong> {customerForOrder.measurements.height} inches</p>
                </Card>
              </div>
              <Separator />
            </>
          )}


          {currentOrder.designDetails && (
             <>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Design Details</h3>
                    </div>
                     <Card className="bg-background/50 p-4 rounded-md text-sm space-y-1">
                        <p><strong>Style:</strong> {getDetailNameById(currentOrder.designDetails.style, styleOptionsForDisplay)}</p>
                        <p><strong>Fabric:</strong> {getDetailNameById(currentOrder.designDetails.fabric, fabricOptionsForDisplay)}</p>
                        <p><strong>Color:</strong> {getDetailNameById(currentOrder.designDetails.color, colorOptionsForDisplay)}</p>
                        {currentOrder.designDetails.notes && <p><strong>Notes:</strong> <span className="whitespace-pre-wrap">{currentOrder.designDetails.notes}</span></p>}
                     </Card>
                </div>
             </>
          )}
          
          {currentOrder.items && currentOrder.items.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold flex items-center mb-2"><Tag className="mr-2 h-5 w-5 text-primary" />Items Ordered</h3>
                <ul className="space-y-1 list-disc list-inside pl-2">
                  {currentOrder.items.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          
          {currentOrder.designDetails?.referenceImageUrls && currentOrder.designDetails.referenceImageUrls.length > 0 && (
            <>
              <Separator />
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Reference Images</h3>
                 </div>
                <div className="flex flex-wrap gap-3 mt-2">
                    {currentOrder.designDetails.referenceImageUrls.map((src, index) => (
                        <Image
                            key={index}
                            src={src}
                            alt={`Reference Image ${index + 1}`}
                            width={100}
                            height={100}
                            className="rounded-md border object-cover shadow-sm"
                            data-ai-hint="design clothing reference"
                        />
                    ))}
                </div>
                 <p className="text-xs text-muted-foreground mt-1">Note: Images are currently stored as Data URLs. For production, use Firebase Storage.</p>
              </div>
            </>
          )}

          {customerForOrder?.address && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><MapPinIcon className="mr-2 h-5 w-5 text-primary" />Shipping Address</h3>
                <address className="text-sm not-italic text-muted-foreground">
                  {customerForOrder.address.street}<br />
                  {customerForOrder.address.city}, {customerForOrder.address.zipCode}<br />
                  {customerForOrder.address.country}
                </address>
              </div>
            </>
          )}


          {currentOrder.notes && (
             <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />General Order Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentOrder.notes}</p>
              </div>
            </>
          )}

        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-wrap justify-between items-center gap-3">
            <Button variant="secondary" asChild>
                 <Link href={`/tracking?orderId=${currentOrder.id}`}>
                    Track This Order
                 </Link>
            </Button>
             <Button variant="outline" onClick={handleEditOrder} className="shadow-sm">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Full Order
            </Button>
             <Button variant="default" onClick={() => router.push('/orders')} className="shadow-md">
                View All Orders
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
