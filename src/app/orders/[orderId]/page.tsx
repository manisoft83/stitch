
"use client";

import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockOrders, type Order } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, User, Users, MapPinIcon, Tag, DollarSign, Info, Edit3 } from "lucide-react";
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

// Helper to get status badge color, can be moved to utils if used elsewhere too
const getStatusBadgeColor = (status: Order['status']) => {
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
  const orderId = params.orderId as string;

  // In a real app, you'd fetch this data. For now, find in mock data.
  const order = mockOrders.find(o => o.id === orderId);

  if (!order) {
    notFound(); // Or redirect to a custom not found page
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Order Details: #{order.id}</CardTitle>
            <CardDescription>
              Detailed view of your order.
            </CardDescription>
          </div>
           <Badge className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
              {order.status}
           </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/30 dark:bg-muted/20 p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Info className="mr-2 h-5 w-5 text-primary" />Order Information</CardTitle>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Order Date:</strong> <span className="ml-2">{format(new Date(order.date), "PPPp")}</span></p>
                    <p className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Total Amount:</strong> <span className="ml-2">{order.total}</span></p>
                    {order.customerName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Customer:</strong> <span className="ml-2">{order.customerName}</span></p>}
                </div>
            </Card>
            <Card className="bg-muted/30 dark:bg-muted/20 p-4">
                <CardTitle className="text-lg mb-2 flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Tailor &amp; Production</CardTitle>
                 <div className="space-y-2 text-sm">
                    {order.assignedTailorName && <p className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Assigned Tailor:</strong> <span className="ml-2">{order.assignedTailorName}</span></p>}
                    {order.dueDate && <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Due Date:</strong> <span className="ml-2">{format(new Date(order.dueDate), "PPP")}</span></p>}
                    {!order.assignedTailorName && order.status === "Pending Assignment" && <p className="text-muted-foreground">Awaiting tailor assignment.</p>}
                 </div>
            </Card>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" />Items Ordered</h3>
            <ul className="space-y-1 list-disc list-inside pl-2">
              {order.items.map((item, index) => (
                <li key={index} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>

          {order.shippingAddress && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><MapPinIcon className="mr-2 h-5 w-5 text-primary" />Shipping Address</h3>
                <address className="text-sm not-italic text-muted-foreground">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </address>
              </div>
            </>
          )}

          {order.notes && (
             <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" />Order Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
              </div>
            </>
          )}

        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button variant="secondary" asChild>
                 <Link href={`/tracking?orderId=${order.id}`}>
                    Track This Order
                 </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
