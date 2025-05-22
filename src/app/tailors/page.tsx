
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarClock, Check, PackageCheck, ListTodo } from "lucide-react";
import { AssignTailorDialog } from '@/components/tailors/assign-tailor-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Expanded Order type
export interface Order {
  id: string;
  item: string;
  dueDateRequested: string; // Original requested due date
  assignedTailorId?: string;
  assignedTailorName?: string;
  actualDueDate?: string; // Due date set during assignment
  status?: 'Pending Assignment' | 'Assigned' | 'In Progress' | 'Completed';
}

export interface Tailor {
  id: string;
  name: string;
  expertise: string[];
  availability: "Available" | "Busy";
  avatar: string;
  dataAiHint: string;
}

// Mock data for tailors - replace with actual data
const initialTailors: Tailor[] = [
  { id: "T001", name: "Alice Wonderland", expertise: ["Dresses", "Evening Wear"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=AW", dataAiHint: "woman portrait" },
  { id: "T002", name: "Bob The Builder", expertise: ["Suits", "Formal Trousers"], availability: "Busy", avatar: "https://placehold.co/100x100.png?text=BB", dataAiHint: "man portrait" },
  { id: "T003", name: "Carol Danvers", expertise: ["Casual Wear", "Alterations"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=CD", dataAiHint: "woman professional" },
];

// Mock data for orders needing assignment
const initialUnassignedOrders: Order[] = [
    { id: "ORD101", item: "Custom Silk Blouse", dueDateRequested: "2024-08-15", status: "Pending Assignment" },
    { id: "ORD102", item: "Evening Gown Alteration", dueDateRequested: "2024-08-10", status: "Pending Assignment" },
    { id: "ORD103", item: "Wedding Dress Design", dueDateRequested: "2024-09-01", status: "Pending Assignment" },
];

export default function TailorsPage() {
  const [tailors, setTailors] = useState<Tailor[]>(initialTailors);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>(initialUnassignedOrders);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]); // To display assigned orders on this page
  
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<Order | null>(null);
  const { toast } = useToast();

  const openAssignDialog = (order: Order) => {
    setSelectedOrderForAssignment(order);
    setIsAssignDialogOpen(true);
  };

  const handleAssignOrder = (orderId: string, tailorId: string, tailorName: string, dueDate: Date) => {
    const orderToAssign = unassignedOrders.find(o => o.id === orderId);
    if (orderToAssign) {
      const updatedOrder: Order = {
        ...orderToAssign,
        assignedTailorId: tailorId,
        assignedTailorName: tailorName,
        actualDueDate: format(dueDate, "yyyy-MM-dd"),
        status: "Assigned",
      };
      
      setUnassignedOrders(prev => prev.filter(o => o.id !== orderId));
      setAssignedOrders(prev => [...prev, updatedOrder]);

      // Optional: Update tailor availability (mock)
      setTailors(prev => prev.map(t => t.id === tailorId ? {...t, availability: "Busy"} : t));
      
      toast({
        title: "Order Assigned!",
        description: `${updatedOrder.item} (Order #${updatedOrder.id}) assigned to ${tailorName}. Due: ${format(dueDate, "PPP")}`,
      });
    }
    setSelectedOrderForAssignment(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary mb-6 flex items-center">
        <Users className="mr-3 h-7 w-7" /> Tailor Hub & Order Assignment
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Unassigned Orders Section */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center"><ListTodo className="mr-2 h-5 w-5"/>Orders Awaiting Assignment</CardTitle>
            <CardDescription>Assign these orders to available tailors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unassignedOrders.length > 0 ? unassignedOrders.map(order => (
              <Card key={order.id} className="p-4 bg-secondary/30 dark:bg-secondary/20">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{order.item} (Order #{order.id})</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                            <CalendarClock className="h-4 w-4 mr-1"/> Requested by: {order.dueDateRequested}
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openAssignDialog(order)}>Assign</Button>
                </div>
              </Card>
            )) : <p className="text-muted-foreground">No orders currently need assignment.</p>}
          </CardContent>
        </Card>

        {/* Tailor List Section */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Available Tailors</CardTitle>
            <CardDescription>View tailor profiles, expertise, and availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tailors.map(tailor => (
              <Card key={tailor.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tailor.avatar} alt={tailor.name} data-ai-hint={tailor.dataAiHint} />
                  <AvatarFallback>{tailor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{tailor.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Expertise: {tailor.expertise.join(", ")}
                  </div>
                  <Badge 
                    variant={tailor.availability === "Available" ? "default" : "secondary"}
                    className={`mt-1 ${tailor.availability === "Available" ? "bg-green-100 text-green-700 border border-green-300" : "bg-yellow-100 text-yellow-700 border border-yellow-300"}`}
                  >
                    {tailor.availability}
                  </Badge>
                </div>
                {/* Selection logic might be part of the dialog now */}
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Recently Assigned Orders Section */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center"><PackageCheck className="mr-2 h-5 w-5"/>Recently Assigned Orders</CardTitle>
            <CardDescription>Orders that have been assigned to tailors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignedOrders.length > 0 ? assignedOrders.map(order => (
              <Card key={order.id} className="p-4 bg-green-50 dark:bg-green-900/30 border-green-200">
                <p className="font-semibold">{order.item} (Order #{order.id})</p>
                <p className="text-sm text-muted-foreground">
                  Assigned to: {order.assignedTailorName}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1"/> Due: {order.actualDueDate ? format(new Date(order.actualDueDate), "PPP") : 'N/A'}
                </p>
                 <Badge className="mt-1 bg-blue-100 text-blue-700 border border-blue-300">{order.status}</Badge>
              </Card>
            )) : <p className="text-muted-foreground">No orders assigned yet via this session.</p>}
          </CardContent>
        </Card>
      </div>

      <AssignTailorDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        order={selectedOrderForAssignment}
        tailors={tailors}
        onAssign={handleAssignOrder}
      />
      
      <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Assignment Module Notes</CardTitle>
        <CardDescription className="mt-2">
            The assignment functionality above is a mock implementation updating local state. 
            In a real application, this would involve API calls and database updates.
            Preferred tailor selection and automatic assignment are future enhancements.
        </CardDescription>
      </Card>
    </div>
  );
}
