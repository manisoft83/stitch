
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarClock, PackageCheck, ListTodo, PlusCircle, Edit2, Trash2, Phone } from "lucide-react";
import { AssignTailorDialog } from '@/components/tailors/assign-tailor-dialog';
import { TailorFormDialog, type TailorFormData } from '@/components/tailors/tailor-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { mockTailors as initialMockTailors, type Tailor } from '@/lib/mockData'; // Import centralized mock data

export interface Order { // This Order interface is specific to this page's needs for assignment
  id: string;
  item: string;
  dueDateRequested: string;
  assignedTailorId?: string;
  assignedTailorName?: string;
  actualDueDate?: string;
  status?: 'Pending Assignment' | 'Assigned' | 'In Progress' | 'Completed';
}


const initialUnassignedOrders: Order[] = [
    { id: "ORD101", item: "Custom Silk Blouse", dueDateRequested: "2024-08-15", status: "Pending Assignment" },
    { id: "ORD102", item: "Evening Gown Alteration", dueDateRequested: "2024-08-10", status: "Pending Assignment" },
    { id: "ORD103", item: "Wedding Dress Design", dueDateRequested: "2024-09-01", status: "Pending Assignment" },
];

export default function TailorsPage() {
  const [tailors, setTailors] = useState<Tailor[]>(initialMockTailors); // Use centralized mock tailors
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>(initialUnassignedOrders);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<Order | null>(null);
  
  const [isTailorFormDialogOpen, setIsTailorFormDialogOpen] = useState(false);
  const [editingTailor, setEditingTailor] = useState<Tailor | null>(null);
  const [deletingTailorId, setDeletingTailorId] = useState<string | null>(null);


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
      setTailors(prev => prev.map(t => t.id === tailorId ? {...t, availability: "Busy"} : t));
      
      toast({
        title: "Order Assigned!",
        description: `${updatedOrder.item} (Order #${updatedOrder.id}) assigned to ${tailorName}. Due: ${format(dueDate, "PPP")}`,
      });
    }
    setSelectedOrderForAssignment(null);
  };

  const handleOpenAddTailorDialog = () => {
    setEditingTailor(null);
    setIsTailorFormDialogOpen(true);
  };

  const handleOpenEditTailorDialog = (tailor: Tailor) => {
    setEditingTailor(tailor);
    setIsTailorFormDialogOpen(true);
  };

  const handleDeleteTailor = (tailorId: string) => {
    setTailors(prev => prev.filter(t => t.id !== tailorId));
    setAssignedOrders(prev => prev.map(o => 
        o.assignedTailorId === tailorId 
        ? { ...o, assignedTailorId: undefined, assignedTailorName: undefined, status: "Pending Assignment" as Order['status'] } 
        : o
    ));

    toast({
      title: "Tailor Deleted",
      description: `Tailor (ID: ${tailorId}) has been removed.`,
      variant: "destructive"
    });
    setDeletingTailorId(null); 
  };

  const handleSaveTailor = (data: TailorFormData) => {
    const expertiseArray = data.expertise.split(',').map(e => e.trim()).filter(e => e);
    if (editingTailor) { 
      setTailors(prev => prev.map(t => t.id === editingTailor.id ? { ...t, ...data, expertise: expertiseArray } : t));
      toast({ title: "Tailor Updated", description: `${data.name}'s details have been updated.` });
    } else { 
      const newTailor: Tailor = {
        id: `T${Date.now().toString().slice(-3)}${Math.floor(Math.random()*100)}`,
        ...data,
        expertise: expertiseArray,
        availability: "Available", 
        avatar: `https://placehold.co/100x100.png?text=${data.name.substring(0,2).toUpperCase()}`,
        dataAiHint: "person portrait" 
      };
      setTailors(prev => [...prev, newTailor]);
      toast({ title: "Tailor Added", description: `${newTailor.name} has been added to the roster.` });
    }
    setIsTailorFormDialogOpen(false);
    setEditingTailor(null);
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-7 w-7" /> Tailor Hub &amp; Order Assignment
        </h1>
        <Button onClick={handleOpenAddTailorDialog} className="shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Tailor
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
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

        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Manage Tailors</CardTitle>
            <CardDescription>View, edit, or delete tailor profiles. Add new tailors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tailors.map(tailor => (
              <Card key={tailor.id} className="p-4 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={tailor.avatar} alt={tailor.name} data-ai-hint={tailor.dataAiHint} />
                    <AvatarFallback>{tailor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{tailor.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 mr-1.5"/> {tailor.mobile}
                    </div>
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
                </div>
                <div className="flex gap-2 self-end">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditTailorDialog(tailor)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setDeletingTailorId(tailor.id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    {deletingTailorId === tailor.id && ( 
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tailor "{tailor.name}" 
                            and unassign them from any orders.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingTailorId(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTailor(tailor.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    )}
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

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
                  Assigned to: {order.assignedTailorName || 'N/A'}
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

      <TailorFormDialog
        isOpen={isTailorFormDialogOpen}
        onOpenChange={setIsTailorFormDialogOpen}
        tailorToEdit={editingTailor}
        onSave={handleSaveTailor}
      />
      
      <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Assignment Module Notes</CardTitle>
        <CardDescription className="mt-2">
            The assignment and tailor management functionalities above update local state for demonstration. 
            In a real application, this would involve API calls and database updates.
        </CardDescription>
      </Card>
    </div>
  );
}
