
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, PackagePlus, Users, UserCog, CalendarClock, Tag, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type OrderStatus = "Pending Assignment" | "Assigned" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface Order {
  id: string;
  date: string; // Order creation date
  status: OrderStatus;
  total: string;
  items: string[];
  customerName?: string;
  assignedTailorId?: string | null;
  assignedTailorName?: string | null;
  dueDate?: string | null; // Assignment due date
}

const mockOrders: Order[] = [
  { 
    id: "ORD001", date: "2024-07-15", status: "Processing", total: "$125.00", 
    items: ["Custom A-Line Dress", "Silk Scarf"], customerName: "Eleanor Vance",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: "2024-07-25"
  },
  { 
    id: "ORD002", date: "2024-07-10", status: "Shipped", total: "$75.00", 
    items: ["Fitted Blouse"], customerName: "Marcus Green",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: "2024-07-18"
  },
  { 
    id: "ORD003", date: "2024-06-28", status: "Delivered", total: "$210.00", 
    items: ["Wide-Leg Trousers", "Linen Shirt"], customerName: "Sarah Miller",
    assignedTailorId: "T001", assignedTailorName: "Alice Wonderland", dueDate: "2024-07-05"
  },
  { 
    id: "ORD101", date: "2024-07-18", status: "Assigned", total: "$95.00", 
    items: ["Custom Silk Blouse"], customerName: "John Doe",
    assignedTailorId: "T003", assignedTailorName: "Carol Danvers", dueDate: "2024-08-10"
  },
   { 
    id: "ORD102", date: "2024-07-19", status: "Pending Assignment", total: "$150.00", 
    items: ["Evening Gown Alteration"], customerName: "Jane Smith",
    assignedTailorId: null, assignedTailorName: null, dueDate: null
  },
  { 
    id: "ORD104", date: "2024-07-20", status: "Processing", total: "$180.00", 
    items: ["Summer Dress"], customerName: "Emily White",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: "2024-08-01" 
  },
  { 
    id: "ORD105", date: "2024-07-21", status: "Pending Assignment", total: "$250.00", 
    items: ["Formal Suit"], customerName: "Robert Brown",
    assignedTailorId: null, assignedTailorName: null, dueDate: null
  },
  { 
    id: "ORD106", date: "2024-07-22", status: "Assigned", total: "$80.00", 
    items: ["Skirt Alteration"], customerName: "Linda Davis",
    assignedTailorId: "T002", assignedTailorName: "Bob The Builder", dueDate: "2024-07-30"
  },
];

const mockTailors = [
  { id: "T001", name: "Alice Wonderland" },
  { id: "T002", name: "Bob The Builder" },
  { id: "T003", name: "Carol Danvers" },
];

const allOrderStatuses: OrderStatus[] = ["Pending Assignment", "Assigned", "Processing", "Shipped", "Delivered", "Cancelled"];


export default function OrdersPage() {
  const [viewMode, setViewMode] = useState<"admin" | "tailor">("admin");
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null); // For Tailor View
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>(mockOrders);

  // New filter states
  const [adminTailorFilterId, setAdminTailorFilterId] = useState<string | "all">("all"); // For Admin View Tailor Filter
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [customerNameFilter, setCustomerNameFilter] = useState<string>("");

  useEffect(() => {
    let filtered = [...mockOrders];

    // View Mode specific primary filtering
    if (viewMode === 'admin') {
      // If in admin view, reset the tailor view's selectedTailorId, apply admin-specific tailor filter
      setSelectedTailorId(null); 
      if (adminTailorFilterId && adminTailorFilterId !== "all") {
        filtered = filtered.filter(order => order.assignedTailorId === adminTailorFilterId);
      }
    } else { // viewMode === 'tailor'
      if (selectedTailorId) {
        filtered = filtered.filter(order => order.assignedTailorId === selectedTailorId);
      } else {
        filtered = []; // No tailor selected in tailor view, show no orders initially
      }
    }

    // Apply status filter (common for both views, applied to the already view-mode-filtered list)
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply customer name filter (common for both views)
    if (customerNameFilter.trim() !== "") {
      const searchTerm = customerNameFilter.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(searchTerm)
      );
    }

    setDisplayedOrders(filtered);
  }, [viewMode, selectedTailorId, adminTailorFilterId, statusFilter, customerNameFilter]);


  const getStatusBadgeColor = (status: OrderStatus) => {
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
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <ShoppingCart className="mr-3 h-7 w-7" /> My Orders
        </h1>
        <Button asChild>
          <Link href="/design">
            <PackagePlus className="mr-2 h-4 w-4" /> Create New Order
          </Link>
        </Button>
      </div>

      {/* Filter Controls */}
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="viewModeSelect" className="block text-sm font-medium text-muted-foreground mb-1">View Mode</label>
            <Select 
              value={viewMode} 
              onValueChange={(value: "admin" | "tailor") => {
                setViewMode(value);
                if (value === "admin") setAdminTailorFilterId("all"); // Reset admin tailor filter when switching to admin
              }}
            >
              <SelectTrigger id="viewModeSelect" className="w-full">
                <SelectValue placeholder="Select View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin"><UserCog className="mr-2 h-4 w-4 inline-block"/>Admin View</SelectItem>
                <SelectItem value="tailor"><Users className="mr-2 h-4 w-4 inline-block"/>Tailor View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'tailor' && (
            <div>
              <label htmlFor="tailorSelect" className="block text-sm font-medium text-muted-foreground mb-1">Select Your Tailor Profile</label>
              <Select value={selectedTailorId || ""} onValueChange={(value) => setSelectedTailorId(value || null)}>
                <SelectTrigger id="tailorSelect" className="w-full">
                  <SelectValue placeholder="Select Tailor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {mockTailors.map(tailor => (
                    <SelectItem key={tailor.id} value={tailor.id}>{tailor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {viewMode === 'admin' && (
             <div>
              <label htmlFor="adminTailorFilter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Tailor (Admin)</label>
              <Select value={adminTailorFilterId} onValueChange={(value: string) => setAdminTailorFilterId(value as string | "all")}>
                <SelectTrigger id="adminTailorFilter" className="w-full">
                  <SelectValue placeholder="Filter by Tailor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tailors</SelectItem>
                  {mockTailors.map(tailor => (
                    <SelectItem key={tailor.id} value={tailor.id}>{tailor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Status</label>
            <Select value={statusFilter} onValueChange={(value: OrderStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {allOrderStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="customerNameFilter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Customer Name</label>
            <Input
              id="customerNameFilter"
              type="text"
              placeholder="Enter customer name..."
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>


      {displayedOrders.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CardTitle>
              {viewMode === 'tailor' && !selectedTailorId 
                ? "Select a Tailor" 
                : "No Orders Found"}
            </CardTitle>
            <CardDescription>
              {viewMode === 'tailor' && !selectedTailorId
                ? "Please select a tailor to view their assigned orders."
                : "There are no orders matching the current filter criteria."}
            </CardDescription>
          </CardHeader>
          { (viewMode === 'admin' || (viewMode === 'tailor' && selectedTailorId)) && (
            <CardContent>
              <Button asChild size="lg">
                <Link href="/design">Design Your First Item</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOrders.map(order => (
            <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">Order #{order.id}</CardTitle>
                    <CardDescription>Date: {format(new Date(order.date), "PPP")} | Total: {order.total}</CardDescription>
                    {order.customerName && <CardDescription>Customer: {order.customerName}</CardDescription>}
                  </div>
                  <Badge className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div>
                  <p className="font-medium mb-1 text-sm text-muted-foreground flex items-center"><Tag className="mr-1 h-4 w-4"/>Items:</p>
                  <ul className="list-disc list-inside text-sm text-foreground/90">
                    {order.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                {order.assignedTailorName && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Users className="mr-1 h-4 w-4 text-primary/70"/> Assigned to: <span className="font-medium text-foreground/80 ml-1">{order.assignedTailorName}</span>
                  </p>
                )}
                {order.dueDate && (
                  <p className="text-sm text-muted-foreground flex items-center">
                     <CalendarClock className="mr-1 h-4 w-4 text-primary/70"/> Due: <span className="font-medium text-foreground/80 ml-1">{format(new Date(order.dueDate), "PPP")}</span>
                  </p>
                )}
              </CardContent>
              <CardFooter className="mt-auto">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                  {(order.status === "Processing" || order.status === "Shipped" || order.status === "Assigned") && 
                    <Button variant="ghost" size="sm" className="text-primary flex-1">Track Order</Button>}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Secure Payments & Order System</CardTitle>
        <CardDescription className="mt-2">
            All transactions are processed securely. Order data displayed is currently mock data.
            Tailor assignment and status updates here reflect a simulated system.
        </CardDescription>
      </Card>
    </div>
  );
}

