
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { type Order, allOrderStatuses, type OrderStatus, type Customer, allPossibleMeasurements } from '@/lib/mockData';
import { getOrderDetailsAction, updateOrderStatusAction, updateOrderPriceAction } from '@/app/orders/actions';
import { getCustomerById } from '@/lib/server/dataService';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays, User, Users, MapPinIcon, Tag, DollarSign, Info, Edit3, Shuffle, ImageIcon, Ruler, Palette, FileText, Shirt, Pencil } from "lucide-react"; // Added Shirt, Pencil
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { useAuth } from '@/hooks/use-auth'; // Added useAuth
import { generateDesignSummary } from '@/lib/mockData';
import type { DesignDetails } from '@/contexts/order-workflow-context';


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
  const { role } = useAuth(); // Get user role
  const orderId = params.orderId as string;

  const [currentOrder, setCurrentOrder] = useState<Order | null | undefined>(undefined);
  const [customerForOrder, setCustomerForOrder] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceInput, setPriceInput] = useState<string>(""); // For admin price input

  const { loadOrderForEditing } = useOrderWorkflow();


  useEffect(() => {
    const fetchOrderAndCustomer = async () => {
      if (!orderId) return;
      setIsLoading(true);
      const { order: fetchedOrder, error: orderError } = await getOrderDetailsAction(orderId);

      if (orderError || !fetchedOrder) {
        toast({ title: "Error", description: orderError || "Order not found.", variant: "destructive" });
        setCurrentOrder(null);
        setIsLoading(false);
        return;
      }

      setCurrentOrder(fetchedOrder);
      setPriceInput(fetchedOrder.total === "Pricing TBD" ? "" : fetchedOrder.total.replace('$', '')); // Initialize price input

      if (fetchedOrder.customerId) {
        const customer = await getCustomerById(fetchedOrder.customerId);
        setCustomerForOrder(customer);
      } else {
        setCustomerForOrder(null);
      }
      setIsLoading(false);
    };

    fetchOrderAndCustomer();
  }, [orderId, toast]);

  useEffect(() => {
    // Update priceInput if currentOrder.total changes (e.g., after successful update)
    if (currentOrder) {
      setPriceInput(currentOrder.total === "Pricing TBD" ? "" : currentOrder.total.replace('$', ''));
    }
  }, [currentOrder?.total]);


  if (isLoading || currentOrder === undefined) {
    return <div className="container mx-auto py-8 text-center">Loading order details...</div>;
  }

  if (!currentOrder) {
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
        description: `Order #${currentOrder.orderNumber} status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error Updating Status",
        description: result.error || "Could not update order status.",
        variant: "destructive"
      });
    }
  };

  const handlePriceUpdate = async () => {
    if (!currentOrder || !priceInput.trim()) {
      toast({ title: "Invalid Price", description: "Please enter a valid price.", variant: "destructive" });
      return;
    }
    // Basic validation: ensure it's a number (allowing for decimals)
    if (isNaN(parseFloat(priceInput))) {
        toast({ title: "Invalid Price", description: "Price must be a valid number.", variant: "destructive" });
        return;
    }

    const formattedPrice = priceInput.startsWith('$') ? priceInput : `$${parseFloat(priceInput).toFixed(2)}`;

    const result = await updateOrderPriceAction(currentOrder.id, formattedPrice);
    if (result.success) {
      setCurrentOrder(prev => prev ? { ...prev, total: formattedPrice } : null);
      toast({
        title: "Order Price Updated",
        description: `Order #${currentOrder.orderNumber} price changed to ${formattedPrice}.`,
      });
    } else {
      toast({
        title: "Error Updating Price",
        description: result.error || "Could not update order price.",
        variant: "destructive"
      });
    }
  };


  const handleEditOrder = () => {
    if (customerForOrder && currentOrder && currentOrder.detailedItems) {
      loadOrderForEditing(currentOrder, customerForOrder);
      router.push('/workflow/customer-step');
    } else {
       toast({
            title: "Cannot Edit Order",
            description: "Missing customer or detailed item designs to start editing.",
            variant: "destructive"
        });
    }
  };

  const getMeasurementLabel = (id: string) => {
    return allPossibleMeasurements.find(m => m.id === id)?.label || id;
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Order Details: #{currentOrder.orderNumber}</CardTitle>
            <CardDescription>
              Detailed view of your order from Firestore. This order has {currentOrder.detailedItems?.length || 0} item(s).
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
                    <div className="flex items-center gap-2">
                        <DollarSign className="mr-0 h-4 w-4 text-muted-foreground" />
                        <strong>Total Amount:</strong>
                        <span className="ml-1">{currentOrder.total}</span>
                    </div>
                    {customerForOrder && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <Link href={`/customers?edit=${customerForOrder.id}`} className="ml-2 text-primary hover:underline">{customerForOrder.name}</Link></p>}
                    {!customerForOrder && currentOrder.customerName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <span className="ml-2">{currentOrder.customerName} (Details might load separately)</span></p>}
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

          {role === 'admin' && (
            <>
              <Separator />
              <Card className="bg-secondary/20 p-4 rounded-lg">
                <CardTitle className="text-lg mb-3 flex items-center"><Pencil className="mr-2 h-5 w-5 text-primary" />Update Order Price (Admin)</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-grow">
                    <Label htmlFor="order-price" className="text-sm font-medium">Set New Price (e.g., 150.75)</Label>
                    <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="order-price"
                        type="number"
                        step="0.01"
                        placeholder="Enter price..."
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="pl-8 w-full"
                        />
                    </div>
                  </div>
                  <Button onClick={handlePriceUpdate} className="w-full sm:w-auto shadow-sm">Update Price</Button>
                </div>
              </Card>
            </>
          )}

          <Separator />

          {currentOrder.detailedItems && currentOrder.detailedItems.length > 0 && (
             <>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Ordered Item Designs</h3>
                    </div>
                    <div className="space-y-4">
                        {currentOrder.detailedItems.map((design, index) => (
                            <Card key={index} className="bg-background/50 p-4 rounded-md text-sm space-y-1">
                                <h4 className="font-medium text-md flex items-center gap-1.5"><Shirt className="h-4 w-4 text-muted-foreground"/>Item {index + 1}: {generateDesignSummary(design)}</h4>
                                
                                {design.measurements && Object.keys(design.measurements).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-muted/50 text-xs">
                                        <p className="font-medium text-xs text-foreground">Measurements:</p>
                                        <ul className="list-disc list-inside pl-4 text-muted-foreground grid grid-cols-2 gap-x-2">
                                            {Object.entries(design.measurements).map(([key, value]) => value ? (
                                                <li key={key}><strong>{getMeasurementLabel(key)}:</strong> {value}</li>
                                            ) : null)}
                                        </ul>
                                    </div>
                                )}

                                {design.notes && <p className="mt-2"><strong>Notes:</strong> <span className="whitespace-pre-wrap">{design.notes}</span></p>}
                                
                                {design.referenceImages && design.referenceImages.length > 0 && (
                                    <div className="mt-2">
                                        <strong className="flex items-center gap-1 text-xs"><ImageIcon className="h-3 w-3" />Reference Images:</strong>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                        {design.referenceImages.map((src, imgIdx) => (
                                            <Image
                                                key={imgIdx}
                                                src={src}
                                                alt={`Ref Image ${index + 1}-${imgIdx + 1}`}
                                                width={60}
                                                height={60}
                                                className="rounded border object-cover shadow-sm"
                                                data-ai-hint="design reference thumbnail"
                                            />
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
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


          {currentOrder.notes && ( // General Order notes if any
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
