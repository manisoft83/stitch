import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PackageSearch, MapPin } from "lucide-react";

export default function TrackingPage() {
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
          <form className="flex gap-2">
            <Input type="text" placeholder="Enter Order ID (e.g., ORD001)" className="flex-grow" />
            <Button type="submit">Track</Button>
          </form>
          
          {/* Placeholder for tracking results */}
          <div className="mt-6 border-t pt-6 hidden"> {/* Hidden by default, show when tracking info is available */}
            <h3 className="text-lg font-semibold mb-3 text-primary">Order ORD001 - Status: Shipped</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">July 15, 2024 - 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-muted-foreground">July 16, 2024 - 02:00 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Shipped from Warehouse</p>
                  <p className="text-sm text-muted-foreground">July 17, 2024 - 09:00 AM - Tracking #123XYZ</p>
                </div>
              </div>
               <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Out for Delivery</p>
                  <p className="text-sm text-muted-foreground">Estimated: July 19, 2024</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Notifications will be sent for processing and shipping updates.
            </p>
          </div>
           <div className="mt-6 text-center text-muted-foreground">
            <p>Real-time order tracking is a feature currently in development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
