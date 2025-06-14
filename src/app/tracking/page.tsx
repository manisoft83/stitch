
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import Link from 'next/link'; // Added Link
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, MapPin, CheckCircle, Truck, HomeIcon, Hourglass, Users, XCircle, CalendarDays, FileText } from "lucide-react"; // Added FileText for View Details
import { mockOrders, type Order } from '@/lib/mockData'; 
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrackingStep {
  status: string;
  date: string;
  location?: string;
  icon: React.ElementType;
  isCompleted: boolean;
}

// Mock function to simulate fetching tracking info
const getMockTrackingData = (orderId: string, order: Order | undefined): TrackingStep[] => {
  if (!order) {
    return [];
  }

  const steps: TrackingStep[] = [];
  const orderDate = new Date(order.date);

  steps.push({ 
    status: "Order Placed", 
    date: format(orderDate, "PPPp"), 
    icon: CheckCircle, 
    isCompleted: true 
  });

  if (order.status === "Pending Assignment" || order.status === "Assigned" || order.status === "Processing" || order.status === "Shipped" || order.status === "Delivered") {
    steps.push({ 
      status: "Processing", 
      date: format(new Date(Math.max(orderDate.getTime(), new Date(order.dueDate || order.date).getTime() - 5 * 24 * 60 * 60 * 1000)), "PPP"), // Approx
      icon: Hourglass, 
      isCompleted: order.status !== "Pending Assignment" && order.status !== "Assigned" 
    });
  }
  
  if (order.status === "Assigned" && order.assignedTailorName) {
     steps.push({ 
      status: `Assigned to ${order.assignedTailorName}`, 
      date: format(new Date(Math.max(orderDate.getTime(), new Date(order.dueDate || order.date).getTime() - 4 * 24 * 60 * 60 * 1000)), "PPP"), // Approx
      icon: Users, 
      isCompleted: true
    });
  }


  if (order.status === "Shipped" || order.status === "Delivered") {
    steps.push({ 
      status: "Shipped from Warehouse", 
      date: format(new Date(Math.max(orderDate.getTime(), new Date(order.dueDate || order.date).getTime() - 2 * 24 * 60 * 60 * 1000)), "PPP"), // Approx
      location: "StitchStyle Central Hub", 
      icon: Truck, 
      isCompleted: true 
    });
    steps.push({ 
      status: "Out for Delivery", 
      date: format(new Date(Math.max(orderDate.getTime(), new Date(order.dueDate || order.date).getTime() - 1 * 24 * 60 * 60 * 1000)), "PPP"), // Approx
      location: `Local delivery partner, ${order.shippingAddress?.city || 'your city'}`, 
      icon: MapPin, 
      isCompleted: order.status === "Delivered" 
    });
  }

  if (order.status === "Delivered") {
    steps.push({ 
      status: "Delivered", 
      date: format(new Date(order.dueDate || order.date), "PPP"), // Approx. Use due date as delivered date for mock
      location: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`, 
      icon: HomeIcon, 
      isCompleted: true 
    });
  }
  
  if (order.status === "Cancelled") {
    steps.push({ status: "Order Cancelled", date: format(new Date(order.date), "PPP"), icon: XCircle, isCompleted: true});
  }


  // Add a future estimated delivery if not shipped or delivered yet
  if (order.status !== "Shipped" && order.status !== "Delivered" && order.status !== "Cancelled" && order.dueDate) {
      steps.push({
          status: "Estimated Delivery",
          date: format(new Date(order.dueDate), "PPP"),
          icon: CalendarDays,
          isCompleted: false
      })
  }


  return steps;
};


function TrackingPageContent() {
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get('orderId');

  const [orderIdInput, setOrderIdInput] = useState(orderIdFromQuery || "");
  const [trackingInfo, setTrackingInfo] = useState<TrackingStep[]>([]);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = (idToTrack: string) => {
    if (!idToTrack.trim()) {
      setError("Please enter an Order ID.");
      setTrackingInfo([]);
      setSearchedOrder(null);
      return;
    }
    const foundOrder = mockOrders.find(o => o.id.toLowerCase() === idToTrack.toLowerCase().trim());
    if (foundOrder) {
      setTrackingInfo(getMockTrackingData(idToTrack, foundOrder));
      setSearchedOrder(foundOrder);
      setError(null);
    } else {
      setError(`Order ID "${idToTrack}" not found. Please check the ID and try again.`);
      setTrackingInfo([]);
      setSearchedOrder(null);
    }
  };

  useEffect(() => {
    if (orderIdFromQuery) {
      setOrderIdInput(orderIdFromQuery);
      handleTrackOrder(orderIdFromQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTrackOrder(orderIdInput);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center mb-3">
            <PackageSearch className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Track Your Order</CardTitle>
          <CardDescription>
            Enter your order ID to see its current status and estimated delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter Order ID (e.g., ORD001)" 
              className="flex-grow" 
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
            />
            <Button type="submit">Track</Button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md text-center">
              <p>{error}</p>
            </div>
          )}

          {searchedOrder && trackingInfo.length > 0 && !error && (
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-primary">Order #{searchedOrder.id}</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${searchedOrder.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Current Status: <Badge variant={
                searchedOrder.status === "Delivered" ? "default" : 
                searchedOrder.status === "Cancelled" ? "destructive" : "secondary"
                } className={
                searchedOrder.status === "Delivered" ? "bg-green-100 text-green-700 border-green-300" :
                searchedOrder.status === "Shipped" ? "bg-blue-100 text-blue-700 border-blue-300" :
                searchedOrder.status === "Processing" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                "" // Add more status colors if needed
              }>{searchedOrder.status}</Badge></p>
              
              <div className="space-y-4 relative">
                {/* Vertical line */}
                {trackingInfo.length > 1 && (
                     <div className="absolute left-[13px] top-[10px] bottom-[10px] w-0.5 bg-border -z-10"></div>
                )}

                {trackingInfo.map((step, index) => (
                  <div key={index} className="flex items-start relative pl-8">
                     <div className={`absolute left-0 top-[1px] flex items-center justify-center h-7 w-7 rounded-full border-2 ${step.isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'}`}>
                        <step.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${step.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.status}</p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                      {step.location && <p className="text-xs text-muted-foreground">Location: {step.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <p className="text-sm text-muted-foreground text-center">
                This is mock tracking data. Notifications for actual processing and shipping updates would be sent.
              </p>
            </div>
          )}
           {!searchedOrder && !error && !orderIdFromQuery && (
            <div className="mt-6 text-center text-muted-foreground">
              <p>Enter your order ID above to begin tracking.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Loading tracking information...</div>}>
      <TrackingPageContent />
    </Suspense>
  )
}
    

    