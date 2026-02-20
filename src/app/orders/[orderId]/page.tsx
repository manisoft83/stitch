
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, CalendarDays, User, Users, MapPinIcon, Tag, DollarSign, Info, Edit3, Palette, FileText, Shirt, Pencil, Truck } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { useAuth } from '@/hooks/use-auth';
import { generateDesignSummary } from '@/lib/mockData';

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
  const { role } = useAuth();
  const orderId = params.orderId as string;

  const [currentOrder, setCurrentOrder] = useState<Order | null | undefined>(undefined);
  const [customerForOrder, setCustomerForOrder] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priceInput, setPriceInput] = useState<string>("");

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
      setPriceInput(fetchedOrder.total === "Pricing TBD" ? "" : fetchedOrder.total.replace('$', ''));

      if (fetchedOrder.customerId) {
        const customer = await getCustomerById(fetchedOrder.customerId);
        setCustomerForOrder(customer);
      }
      setIsLoading(false);
    };

    fetchOrderAndCustomer();
  }, [orderId, toast]);

  if (isLoading || currentOrder === undefined) {
    return <div className="container mx-auto py-8 text-center">Loading order details...</div>;
  }

  if (!currentOrder) {
    return (
        <div className="container mx-auto py-8 text-center">
            <Card>
                <CardHeader><CardTitle>Order Not Found</CardTitle></CardHeader>
                <CardContent><Button onClick={() => router.push('/orders')}>Back to Orders</Button></CardContent>
            </Card>
        </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    const result = await updateOrderStatusAction(currentOrder.id, newStatus);
    if (result.success) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast({ title: "Status Updated", description: `Order status changed to ${newStatus}.` });
    } else {
      toast({ title: "Error", description: result.error || "Failed to update status.", variant: "destructive" });
    }
  };

  const handlePriceUpdate = async () => {
    const formattedPrice = priceInput.startsWith('$') ? priceInput : `$${parseFloat(priceInput).toFixed(2)}`;
    const result = await updateOrderPriceAction(currentOrder.id, formattedPrice);
    if (result.success) {
      setCurrentOrder(prev => prev ? { ...prev, total: formattedPrice } : null);
      toast({ title: "Price Updated", description: `Order price set to ${formattedPrice}.` });
    } else {
      toast({ title: "Error", description: result.error || "Failed to update price.", variant: "destructive" });
    }
  };

  const handleEditOrder = () => {
    if (customerForOrder && currentOrder?.detailedItems) {
      loadOrderForEditing(currentOrder, customerForOrder);
      router.push('/workflow/customer-step');
    }
  };

  const getMeasurementLabel = (id: string) => allPossibleMeasurements.find(m => m.id === id)?.label || id;

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-primary">Order #{currentOrder.orderNumber}</CardTitle>
                {currentOrder.isCourier && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Courier
                    </Badge>
                )}
            </div>
            <CardDescription>Order details and status tracking.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
             <Select value={currentOrder.status} onValueChange={(value: OrderStatus) => handleStatusChange(value)}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                    {allOrderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
             </Select>
             <Badge className={`px-3 py-1.5 ${getStatusBadgeColor(currentOrder.status)}`}>{currentOrder.status}</Badge>
           </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-muted/30 p-4">
                <CardTitle className="text-md mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Info</CardTitle>
                <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {currentOrder.date ? format(parseISO(currentOrder.date), "PPP") : 'N/A'}</p>
                    <p><strong>Total:</strong> {currentOrder.total}</p>
                    {customerForOrder && <p><strong>Customer:</strong> <Link href={`/customers`} className="text-primary hover:underline">{customerForOrder.name}</Link></p>}
                </div>
            </Card>
            <Card className="bg-muted/30 p-4">
                <CardTitle className="text-md mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Production</CardTitle>
                 <div className="space-y-2 text-sm">
                    <p><strong>Tailor:</strong> {currentOrder.assignedTailorName || 'Pending Assignment'}</p>
                    <p><strong>Due Date:</strong> {currentOrder.dueDate ? format(parseISO(currentOrder.dueDate), "PPP") : 'TBD'}</p>
                 </div>
            </Card>
            <Card className="bg-muted/30 p-4">
                <CardTitle className="text-md mb-3 flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-primary" /> {currentOrder.isCourier ? 'Delivery' : 'Pickup'} Address</CardTitle>
                {currentOrder.shippingAddress?.street ? (
                    <address className="text-sm not-italic text-muted-foreground">
                        {currentOrder.shippingAddress.street}<br />
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.zipCode}<br />
                        {currentOrder.shippingAddress.country}
                    </address>
                ) : <p className="text-sm italic text-muted-foreground">No address provided.</p>}
            </Card>
          </div>

          {role === 'admin' && (
            <Card className="bg-secondary/10 p-4 border-dashed border-primary/20">
                <CardTitle className="text-md mb-3 flex items-center gap-2"><Pencil className="h-4 w-4" /> Update Price (Admin)</CardTitle>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="pl-8" />
                    </div>
                    <Button onClick={handlePriceUpdate}>Update</Button>
                </div>
            </Card>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Ordered Items</h3>
            <div className="space-y-4">
                {currentOrder.detailedItems?.map((design, index) => (
                    <Card key={index} className="p-4 bg-background/50">
                        <h4 className="font-medium flex items-center gap-2 mb-3"><Shirt className="h-4 w-4"/>Item {index + 1}: {generateDesignSummary(design)}</h4>
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                            {design.measurements && (
                                <div>
                                    <p className="font-semibold mb-1 flex items-center gap-1"><Tag className="h-3 w-3"/>Measurements:</p>
                                    <ul className="grid grid-cols-2 gap-x-2">
                                        {Object.entries(design.measurements).map(([k, v]) => v ? <li key={k}><strong>{getMeasurementLabel(k)}:</strong> {v}</li> : null)}
                                    </ul>
                                </div>
                            )}
                            {design.notes && (
                                <div>
                                    <p className="font-semibold mb-1 flex items-center gap-1"><FileText className="h-3 w-3"/>Notes:</p>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{design.notes}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
            <Button variant="outline" onClick={handleEditOrder}><Edit3 className="mr-2 h-4 w-4" /> Edit Order</Button>
            <Button asChild><Link href="/orders">Back to List</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}
