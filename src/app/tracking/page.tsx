
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageSearch, MapPin, CheckCircle, Truck, HomeIcon, Hourglass, Users, XCircle, CalendarDays, FileText } from "lucide-react"; 
import type { Order } from '@/lib/mockData'; 
import { getOrderDetailsAction } from '@/app/orders/actions'; // Use server action
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrackingStep {
  status: string;
  date: string;
  location?: string;
  icon: React.ElementType;
  isCompleted: boolean;
}

// Function to generate tracking steps based on order status and dates
const generateTrackingSteps = (order: Order | undefined | null): TrackingStep[] => {
  if (!order || !order.date) {
    return [];
  }

  const steps: TrackingStep[] = [];
  const orderDate = parseISO(order.date); // Assuming order.date is an ISO string
  const dueDate = order.dueDate ? parseISO(order.dueDate) : null;

  steps.push({ 
    status: "Order Placed", 
    date: format(orderDate, "PPPp"), 
    icon: CheckCircle, 
    isCompleted: true 
  });

  // Add processing step if applicable
  if (["Processing", "Assigned", "Shipped", "Delivered"].includes(order.status)) {
    steps.push({ 
      status: "Processing", 
      // Estimate processing start slightly after order date, or based on actual data if available
      date: format(new Date(Math.max(orderDate.getTime(), dueDate ? dueDate.getTime() - 5 * 24 * 60 * 60 * 1000 : orderDate.getTime() + 12*60*60*1000 )), "PPP"), 
      icon: Hourglass, 
      isCompleted: order.status !== "Pending Assignment" && order.status !== "Assigned"
    });
  }
  
  if (order.status === "Assigned" && order.assignedTailorName) {
     steps.push({ 
      status: `Assigned to ${order.assignedTailorName}`, 
      // Estimate assignment date
      date: format(new Date(Math.max(orderDate.getTime(), dueDate ? dueDate.getTime() - 4 * 24 * 60 * 60 * 1000 : orderDate.getTime() + 24*60*60*1000)), "PPP"),
      icon: Users, 
      isCompleted: true
    });
  }

  if (order.status === "Shipped" || order.status === "Delivered") {
    steps.push({ 
      status: "Shipped from Warehouse", 
      // Estimate ship date
      date: format(new Date(Math.max(orderDate.getTime(), dueDate ? dueDate.getTime() - 2 * 24 * 60 * 60 * 1000 : orderDate.getTime() + 2*24*60*60*1000)), "PPP"),
      location: "StitchStyle Central Hub", 
      icon: Truck, 
      isCompleted: true 
    });
    steps.push({ 
      status: "Out for Delivery", 
      // Estimate out for delivery date
      date: format(new Date(Math.max(orderDate.getTime(), dueDate ? dueDate.getTime() - 1 * 24 * 60 * 60 * 1000 : orderDate.getTime() + 3*24*60*60*1000)), "PPP"),
      location: `Local delivery partner, ${order.shippingAddress?.city || 'your city'}`, 
      icon: MapPin, 
      isCompleted: order.status === "Delivered" 
    });
  }

  if (order.status === "Delivered" && dueDate) {
    steps.push({ 
      status: "Delivered", 
      date: format(dueDate, "PPP"), 
      location: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}`, 
      icon: HomeIcon, 
      isCompleted: true 
    });
  }
  
  if (order.status === "Cancelled") {
    steps.push({ status: "Order Cancelled", date: format(orderDate, "PPP"), icon: XCircle, isCompleted: true});
  }

  if (order.status !== "Shipped" && order.status !== "Delivered" && order.status !== "Cancelled" && dueDate) {
      steps.push({
          status: "Estimated Delivery",
          date: format(dueDate, "PPP"),
          icon: CalendarDays,
          isCompleted: false
      })
  }

  return steps.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()); // Sort by date
};


function TrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdFromQuery = searchParams.get('orderId');

  const [orderIdInput, setOrderIdInput] = useState(orderIdFromQuery || "");
  const [trackingInfo, setTrackingInfo] = useState<TrackingStep[]>([]);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async (idToTrack: string) => {
    if (!idToTrack.trim()) {
      setError("Please enter an Order ID.");
      setTrackingInfo([]);
      setSearchedOrder(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { order: foundOrder, error: fetchError } = await getOrderDetailsAction(idToTrack.trim());
    
    if (fetchError || !foundOrder) {
      setError(fetchError || `Order ID "${idToTrack}" not found. Please check the ID and try again.`);
      setTrackingInfo([]);
      setSearchedOrder(null);
    } else {
      setTrackingInfo(generateTrackingSteps(foundOrder));
      setSearchedOrder(foundOrder);
      setError(null);
    }
    setIsLoading(false);
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
    router.push(`/tracking?orderId=${orderIdInput.trim()}`); // Update URL to trigger useEffect if ID changes
    // handleTrackOrder(orderIdInput); // Direct call also works, URL update provides better UX for refresh/sharing
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
            Enter your order ID to see its current status and estimated delivery. Data from Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter Order ID (e.g., from My Orders)" 
              className="flex-grow" 
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Tracking..." : "Track"}
            </Button>
          </form>
          
          {error && !isLoading && (
            <div className="mt-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-md text-center">
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && (
             <div className="mt-6 text-center text-muted-foreground">
              <p>Fetching tracking details...</p>
            </div>
          )}


          {searchedOrder && trackingInfo.length > 0 && !error && !isLoading && (
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-primary">Order #{searchedOrder.id}</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${searchedOrder.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> View Full Details
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
                "" 
              }>{searchedOrder.status}</Badge></p>
              
              <div className="space-y-4 relative">
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
                Tracking information is illustrative. Order data from Firestore.
              </p>
            </div>
          )}
           {!searchedOrder && !error && !orderIdFromQuery && !isLoading && (
            <div className="mt-6 text-center text-muted-foreground">
              <p>Enter your order ID above to begin tracking.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Loading tracking page...</div>}>
      <TrackingPageContent />
    </Suspense>
  )
}
