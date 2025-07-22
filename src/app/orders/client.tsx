
// src/app/orders/client.tsx
"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, PackagePlus, Users, UserCog, CalendarClock, Tag, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns"; // Added parseISO
import { cn } from "@/lib/utils";
import { statusFilterOptions, type Order, type OrderStatus, type StatusFilterValue, type Tailor } from "@/lib/mockData"; // Removed mockOrders
import { useAuth } from "@/hooks/use-auth";

const NO_TAILOR_SELECTED_VALUE = "__NO_TAILOR__";

interface OrdersClientPageProps {
  initialTailors: Tailor[];
  initialOrders: Order[]; // Added initialOrders prop
}

export default function OrdersClientPage({ initialTailors, initialOrders }: OrdersClientPageProps) {
  const auth = useAuth();
  const [viewMode, setViewMode] = useState<"admin" | "tailor">("admin"); 
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null); 
  
  const [orders, setOrders] = useState<Order[]>(initialOrders); // Initialize with prop

  const [adminTailorFilterId, setAdminTailorFilterId] = useState<string | "all">("all"); 
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("active_default");
  const [customerNameFilter, setCustomerNameFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const [availableTailors, setAvailableTailors] = useState<Tailor[]>(initialTailors);
  
  useEffect(() => {
    setAvailableTailors(initialTailors);
  }, [initialTailors]);

  // This effect ensures that if the server sends new data (e.g., after a revalidation),
  // the component's state is updated to reflect it.
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders]; // Use local 'orders' state for filtering
    const { role, tailorId: loggedInUserTailorId } = auth;

    if (role === 'tailor' && loggedInUserTailorId) {
      tempOrders = tempOrders.filter(order => order.assignedTailorId === loggedInUserTailorId);
    } else if (role === 'admin') {
      if (viewMode === 'admin') { 
        if (adminTailorFilterId !== "all") {
          tempOrders = tempOrders.filter(order => order.assignedTailorId === adminTailorFilterId);
        }
      } else if (viewMode === 'tailor') { 
        if (selectedTailorId) { 
          tempOrders = tempOrders.filter(order => order.assignedTailorId === selectedTailorId);
        } else {
          tempOrders = []; 
        }
      }
    } else {
      tempOrders = [];
    }

    if (statusFilter === "active_default") {
      const defaultActiveStatuses: OrderStatus[] = ["Pending Assignment", "Assigned", "Processing"];
      tempOrders = tempOrders.filter(order => defaultActiveStatuses.includes(order.status));
    } else if (statusFilter !== "all") { 
      tempOrders = tempOrders.filter(order => order.status === statusFilter);
    }

    if (customerNameFilter.trim() !== "") {
      const searchTerm = customerNameFilter.toLowerCase().trim();
      tempOrders = tempOrders.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm)
      );
    }

    if (dateRange.from) { 
      const rangeStart = startOfDay(dateRange.from);
      const rangeEnd = dateRange.to ? endOfDay(dateRange.to) : endOfDay(new Date()); 

      tempOrders = tempOrders.filter(order => {
        if (!order.date) return false;
        const orderDate = startOfDay(parseISO(order.date)); // Parse ISO string date from Firestore
        return orderDate >= rangeStart && orderDate <= rangeEnd;
      });
    } else if (!dateRange.from && !dateRange.to && statusFilter === "active_default") { 
      const fifteenDaysAgo = startOfDay(subDays(new Date(), 15));
      const today = endOfDay(new Date());
      tempOrders = tempOrders.filter(order => {
        if (!order.date) return false;
        const orderDate = startOfDay(parseISO(order.date)); // Parse ISO string date
        return orderDate >= fifteenDaysAgo && orderDate <= today;
      });
    }
    return tempOrders;
  }, [orders, auth, viewMode, selectedTailorId, adminTailorFilterId, statusFilter, customerNameFilter, dateRange]);

  // Reset page if filtered orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);


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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrdersToDisplay = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <ShoppingCart className="mr-3 h-7 w-7" /> My Orders
        </h1>
        <Button asChild>
          <Link href="/workflow/customer-step">
            <PackagePlus className="mr-2 h-4 w-4" /> Create New Order
          </Link>
        </Button>
      </div>

      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary"/>
            {auth.role === 'admin' ? "Filter & View Options" : "Filter Your Orders"}
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {auth.role === 'admin' && (
            <>
              <div>
                <label htmlFor="viewModeSelect" className="block text-sm font-medium text-muted-foreground mb-1">View Mode</label>
                <Select 
                  value={viewMode} 
                  onValueChange={(value: "admin" | "tailor") => {
                    setViewMode(value);
                    if (value === "admin") {
                        setSelectedTailorId(null); 
                    } else {
                        setAdminTailorFilterId("all"); 
                    }
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
                  <label htmlFor="tailorSelect" className="block text-sm font-medium text-muted-foreground mb-1">Select Tailor Profile (Admin)</label>
                  <Select 
                    value={selectedTailorId || NO_TAILOR_SELECTED_VALUE} 
                    onValueChange={(value) => {
                      setSelectedTailorId(value === NO_TAILOR_SELECTED_VALUE ? null : value);
                    }}
                  >
                    <SelectTrigger id="tailorSelect" className="w-full">
                      <SelectValue placeholder="Select Tailor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TAILOR_SELECTED_VALUE}>None</SelectItem>
                      {availableTailors.map(tailor => (
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
                      {availableTailors.map(tailor => (
                        <SelectItem key={tailor.id} value={tailor.id}>{tailor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Status</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

           <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-muted-foreground mb-1">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="fromDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-muted-foreground mb-1">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="toDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  disabled={(date) =>
                    dateRange.from ? date < dateRange.from : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
           <Button 
            variant="outline" 
            onClick={() => setDateRange({ from: undefined, to: undefined })}
            className="md:col-span-2 lg:col-span-1" 
            disabled={!dateRange.from && !dateRange.to}
            >
            Clear Dates
          </Button>
        </CardContent>
      </Card>

      {currentOrdersToDisplay.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CardTitle>
              {auth.role === 'admin' && viewMode === 'tailor' && !selectedTailorId 
                ? "Select a Tailor" 
                : "No Orders Found"}
            </CardTitle>
            <CardDescription>
              {auth.role === 'tailor' 
                ? "You have no orders matching the current filter criteria." 
                : auth.role === 'admin' && viewMode === 'tailor' && !selectedTailorId
                ? "Please select a tailor to view their assigned orders."
                : "There are no orders matching the current filter criteria. Try adjusting filters or clearing the date range."}
            </CardDescription>
          </CardHeader>
          { (auth.role === 'admin' || (auth.role === 'tailor' && auth.tailorId)) && (
             filteredOrders.length === 0 && orders.length === 0 && ( // Show CTA if no orders *at all* and filters are clear
                <CardContent>
                <Button asChild size="lg">
                    <Link href="/workflow/customer-step">Design Your First Item</Link>
                </Button>
                </CardContent>
            )
          )}
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrdersToDisplay.map(order => (
              <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-primary">Order #{order.id}</CardTitle>
                      <CardDescription>Date: {order.date ? format(parseISO(order.date), "PPP") : "N/A"} | Total: {order.total}</CardDescription>
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
                      {order.items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </div>
                  {order.assignedTailorName && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Users className="mr-1 h-4 w-4 text-primary/70"/> Assigned to: <span className="font-medium text-foreground/80 ml-1">{order.assignedTailorName}</span>
                    </p>
                  )}
                  {order.dueDate && (
                    <p className="text-sm text-muted-foreground flex items-center">
                       <CalendarClock className="mr-1 h-4 w-4 text-primary/70"/> Due: <span className="font-medium text-foreground/80 ml-1">{format(parseISO(order.dueDate), "PPP")}</span>
                    </p>
                  )}
                </CardContent>
                <CardFooter className="mt-auto">
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                    </Button>
                    {(order.status === "Processing" || order.status === "Shipped" || order.status === "Assigned") && 
                      <Button variant="ghost" size="sm" className="text-primary flex-1" asChild>
                        <Link href={`/tracking?orderId=${order.id}`}>Track Order</Link>
                      </Button>
                    }
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
       <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Secure Payments &amp; Order System</CardTitle>
        <CardDescription className="mt-2">
            All transactions are processed securely. Order data is now sourced from Firestore.
            Tailor assignment and status updates here reflect a simulated system.
        </CardDescription>
      </Card>
    </div>
  );
}
