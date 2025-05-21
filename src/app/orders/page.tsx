import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, PackagePlus } from "lucide-react";

export default function OrdersPage() {
  // Mock data for orders - replace with actual data fetching
  const orders = [
    { id: "ORD001", date: "2024-07-15", status: "Processing", total: "$125.00", items: ["Custom A-Line Dress", "Silk Scarf"] },
    { id: "ORD002", date: "2024-07-10", status: "Shipped", total: "$75.00", items: ["Fitted Blouse"] },
    { id: "ORD003", date: "2024-06-28", status: "Delivered", total: "$210.00", items: ["Wide-Leg Trousers", "Linen Shirt"] },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <ShoppingCart className="mr-3 h-7 w-7" /> My Orders
        </h1>
        <Button asChild>
          <Link href="/design">
            <PackagePlus className="mr-2 h-4 w-4" /> Create New Order
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>You haven't placed any orders. Start designing your custom piece today!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/design">Design Your First Item</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">Order #{order.id}</CardTitle>
                    <CardDescription>Date: {order.date} | Total: {order.total}</CardDescription>
                  </div>
                  <span 
                    className={`px-3 py-1 text-xs font-semibold rounded-full
                      ${order.status === "Processing" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" : ""}
                      ${order.status === "Shipped" ? "bg-blue-100 text-blue-700 border border-blue-300" : ""}
                      ${order.status === "Delivered" ? "bg-green-100 text-green-700 border border-green-300" : ""}`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-1">Items:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {order.items.map(item => <li key={item}>{item}</li>)}
                </ul>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  {order.status !== "Delivered" && <Button variant="ghost" size="sm" className="text-primary">Track Order</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Secure Payments</CardTitle>
        <CardDescription className="mt-2">
            All transactions are processed securely. We accept major credit cards and PayPal.
            (Payment gateway integration is a future feature).
        </CardDescription>
      </Card>
    </div>
  );
}
