
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
import { ArrowLeft, CalendarDays, User, Users, MapPin, Tag, IndianRupee, Info, Edit3, Palette, FileText, Shirt, Pencil, Truck, Hash, Key, Images, Ruler, Settings2 } from "lucide-react";
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
      setPriceInput(fetchedOrder.total === "Pricing TBD" ? "" : fetchedOrder.total.replace('₹', ''));

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
    const priceValue = parseFloat(priceInput);
    if (isNaN(priceValue)) {
        toast({ title: "Invalid Price", description: "Please enter a valid numeric price.", variant: "destructive" });
        return;
    }
    const formattedPrice = `₹${priceValue.toFixed(2)}`;
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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Hash className="h-6 w-6" /> Order #{currentOrder.orderNumber}
                </CardTitle>
                {currentOrder.isCourier && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5">
                        <Truck className="h-3.5 w-3.5" /> Courier
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
                <Key className="h-3 w-3" /> Record Key: {currentOrder.id}
            </div>
          </div>
          <Badge className={`px-4 py-2 text-sm font-bold shadow-sm ${getStatusBadgeColor(currentOrder.status)}`}>
              {currentOrder.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-muted/30 p-4 border-none shadow-none">
                <CardTitle className="text-md mb-3 flex items-center gap-2 text-primary"><Info className="h-4 w-4" /> Order Info</CardTitle>
                <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><strong>Date:</strong> <span>{currentOrder.date ? format(parseISO(currentOrder.date), "PPP") : 'N/A'}</span></p>
                    <p className="flex justify-between"><strong>Price:</strong> <span className="text-primary font-bold">{currentOrder.total}</span></p>
                    {customerForOrder && (
                        <p className="flex justify-between">
                            <strong>Customer:</strong> 
                            <Link href={`/customers`} className="text-primary hover:underline font-medium">{customerForOrder.name}</Link>
                        </p>
                    )}
                </div>
            </Card>
            <Card className="bg-muted/30 p-4 border-none shadow-none">
                <CardTitle className="text-md mb-3 flex items-center gap-2 text-primary"><Users className="h-4 w-4" /> Production</CardTitle>
                 <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><strong>Tailor:</strong> <span>{currentOrder.assignedTailorName || 'Pending Assignment'}</span></p>
                    <p className="flex justify-between"><strong>Due Date:</strong> <span>{currentOrder.dueDate ? format(parseISO(currentOrder.dueDate), "PPP") : 'TBD'}</span></p>
                 </div>
            </Card>
            <Card className="bg-muted/30 p-4 border-none shadow-none">
                <CardTitle className="text-md mb-3 flex items-center gap-2 text-primary"><MapPin className="h-4 w-4" /> {currentOrder.isCourier ? 'Delivery' : 'Pickup'} Address</CardTitle>
                {currentOrder.shippingAddress?.street ? (
                    <address className="text-sm not-italic text-muted-foreground leading-relaxed">
                        {currentOrder.shippingAddress.street}<br />
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.zipCode}<br />
                        {currentOrder.shippingAddress.country}
                    </address>
                ) : <p className="text-sm italic text-muted-foreground">No address provided.</p>}
            </Card>
          </div>

          {role === 'admin' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-primary/5 p-5 border-dashed border-primary/30">
                  <CardTitle className="text-md mb-4 flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4 text-primary" /> Order Management</CardTitle>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Status Update</Label>
                      <Select value={currentOrder.status} onValueChange={(value: OrderStatus) => handleStatusChange(value)}>
                          <SelectTrigger className="w-full h-10 bg-background">
                              <SelectValue placeholder="Change status..." />
                          </SelectTrigger>
                          <SelectContent>
                              {allOrderStatuses.map(status => (
                                  <SelectItem key={status} value={status}>
                                      {status}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                  </div>
              </Card>

              <Card className="bg-primary/5 p-5 border-dashed border-primary/30">
                  <CardTitle className="text-md mb-4 flex items-center gap-2 font-bold"><IndianRupee className="h-4 w-4 text-primary" /> Financial Details</CardTitle>
                  <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Set Order Price</Label>
                      <div className="flex gap-2">
                          <div className="relative flex-grow">
                              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="Enter amount"
                                  value={priceInput} 
                                  onChange={(e) => setPriceInput(e.target.value)} 
                                  className="pl-8 bg-background" 
                              />
                          </div>
                          <Button onClick={handlePriceUpdate}>Update</Button>
                      </div>
                  </div>
              </Card>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                <Palette className="h-5 w-5" /> Detailed Order Items
            </h3>
            <div className="space-y-6">
                {currentOrder.detailedItems?.map((design, index) => (
                    <Card key={index} className="overflow-hidden border-2 border-muted shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="bg-muted/50 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-md font-bold flex items-center gap-2">
                                <Shirt className="h-5 w-5 text-primary"/>
                                Item #{index + 1}: {generateDesignSummary(design)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 text-primary/70">
                                            <Ruler className="h-3.5 w-3.5"/> Measurements Details
                                        </h5>
                                        {design.measurements && Object.keys(design.measurements).length > 0 ? (
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-muted/20 p-4 rounded-lg border">
                                                {Object.entries(design.measurements).map(([k, v]) => (
                                                    v ? (
                                                        <div key={k} className="flex justify-between border-b border-muted/50 py-1.5 last:border-0">
                                                            <span className="text-muted-foreground">{getMeasurementLabel(k)}</span>
                                                            <span className="font-semibold text-foreground">{v}</span>
                                                        </div>
                                                    ) : null
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg border border-dashed">No measurements recorded for this item.</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 text-primary/70">
                                            <FileText className="h-3.5 w-3.5"/> Tailoring Instructions
                                        </h5>
                                        <div className="text-sm text-foreground bg-accent/5 p-4 rounded-lg min-h-[80px] border leading-relaxed">
                                            {design.notes || "No special instructions provided for this garment."}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3 text-primary/70">
                                        <Images className="h-3.5 w-3.5"/> Reference & Inspiration Images
                                    </h5>
                                    {design.referenceImages && design.referenceImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {design.referenceImages.map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm group">
                                                    <Image 
                                                        src={img} 
                                                        alt={`Item ${index+1} Reference ${imgIdx+1}`} 
                                                        fill 
                                                        className="object-cover transition-transform group-hover:scale-110" 
                                                        data-ai-hint="clothing design photo"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/5 text-muted-foreground">
                                            <Images className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-xs font-medium">No visual references uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between gap-4 bg-muted/10">
            <Button variant="outline" onClick={handleEditOrder} className="w-full sm:w-auto">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Order Details
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="ghost" asChild className="flex-1 sm:flex-none">
                    <Link href="/orders">Back to Orders</Link>
                </Button>
                <Button asChild className="flex-1 sm:flex-none shadow-md">
                    <Link href={`/tracking?orderId=${currentOrder.id}`}>
                        <Truck className="mr-2 h-4 w-4" /> Track Status
                    </Link>
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
