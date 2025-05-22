
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockOrders, type Order, allOrderStatuses, type OrderStatus } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays, User, Users, MapPinIcon, Tag, DollarSign, Info, Edit3, Shuffle } from "lucide-react";
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

// Helper to get status badge color
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

  const [currentOrder, setCurrentOrder] = useState<Order | null | undefined>(undefined); // undefined initially, null if not found

  useEffect(() => {
    const foundOrder = mockOrders.find(o => o.id === orderId);
    if (foundOrder) {
      setCurrentOrder(foundOrder);
    } else {
      setCurrentOrder(null); // Mark as not found
    }
  }, [orderId]);

  if (currentOrder === undefined) {
    // Still loading or orderId not processed yet
    return <div className="container mx-auto py-8 text-center">Loading order details...</div>;
  }

  if (!currentOrder) {
    notFound(); 
  }
  
  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!currentOrder) return;

    const orderIndex = mockOrders.findIndex(o => o.id === currentOrder.id);
    if (orderIndex !== -1) {
      // Create a new object for the updated order to ensure React state updates correctly
      const updatedOrder = { ...mockOrders[orderIndex], status: newStatus };
      mockOrders[orderIndex] = updatedOrder; // Update the mock data array
      setCurrentOrder(updatedOrder); // Update local state to re-render

      toast({
        title: "Order Status Updated",
        description: `Order #${currentOrder.id} status changed to ${newStatus}.`,
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Order Details: #{currentOrder.id}</CardTitle>
            <CardDescription>
              Detailed view of your order.
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
                    <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Order Date:</strong> <span className="ml-2">{format(new Date(currentOrder.date), "PPPp")}</span></p>
                    <p className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Total Amount:</strong> <span className="ml-2">{currentOrder.total}</span></p>
                    {currentOrder.customerName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <span className="ml-2">{currentOrder.customerName}</span></p>}
                </div>
            </Card>
            <Card className="bg-muted/30 dark:bg-muted/20 p-4 rounded-lg">
                <CardTitle className="text-lg mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Tailor &amp; Production</CardTitle>
                 <div className="space-y-2 text-sm">
                    {currentOrder.assignedTailorName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Assigned Tailor:</strong> <span className="ml-2">{currentOrder.assignedTailorName}</span></p>}
                    {currentOrder.dueDate && <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Due Date:</strong> <span className="ml-2">{format(new Date(currentOrder.dueDate), "PPP")}</span></p>}
                    {!currentOrder.assignedTailorName && currentOrder.status === "Pending Assignment" && <p className="text-muted-foreground">Awaiting tailor assignment.</p>}
                 </div>
            </Card>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" />Items Ordered</h3>
            <ul className="space-y-1 list-disc list-inside pl-2">
              {currentOrder.items.map((item, index) => (
                <li key={index} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>

          {currentOrder.shippingAddress && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><MapPinIcon className="mr-2 h-5 w-5 text-primary" />Shipping Address</h3>
                <address className="text-sm not-italic text-muted-foreground">
                  {currentOrder.shippingAddress.street}<br />
                  {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.zipCode}<br />
                  {currentOrder.shippingAddress.country}
                </address>
              </div>
            </>
          )}

          {currentOrder.notes && (
             <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" />Order Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentOrder.notes}</p>
              </div>
            </>
          )}

        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between items-center">
            <Button variant="secondary" asChild>
                 <Link href={`/tracking?orderId=${currentOrder.id}`}>
                    Track This Order
                 </Link>
            </Button>
             <Button variant="outline" onClick={() => router.push('/orders')}>
                View All Orders
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

