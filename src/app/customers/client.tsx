
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Customer } from '@/lib/mockData'; // Customer type now from mockData after refactor
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { useAuth } from '@/hooks/use-auth';
import { Users, PlusCircle, Edit3, Search, Phone, Mail, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { deleteCustomerAction } from './actions'; // Import server action

interface CustomersClientPageProps {
  initialCustomers: Customer[];
}

export default function CustomersClientPage({ initialCustomers }: CustomersClientPageProps) {
  const router = useRouter();
  const { setCustomer, setWorkflowReturnPath, resetWorkflow } = useOrderWorkflow();
  const { role } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setCustomers(
      initialCustomers.filter( // Filter from initialCustomers to ensure fresh list on search term change
        (customer) =>
          customer.name.toLowerCase().includes(lowerSearchTerm) ||
          customer.email.toLowerCase().includes(lowerSearchTerm) ||
          (customer.phone && customer.phone.toLowerCase().includes(lowerSearchTerm))
      )
    );
  }, [searchTerm, initialCustomers]);

  const handleEditCustomer = (customer: Customer) => {
    resetWorkflow();
    setCustomer(customer);
    setWorkflowReturnPath('/customers');
    router.push('/workflow/customer-step');
  };
  
  const handleAddNewCustomer = () => {
    resetWorkflow();
    setWorkflowReturnPath('/customers');
    router.push('/workflow/customer-step');
  };

  const handleDeleteCustomer = async (customerId: string) => {
    const success = await deleteCustomerAction(customerId);
    if (success) {
      // Optimistically update UI or rely on revalidation + new initialCustomers prop
      setCustomers(prev => prev.filter(c => c.id !== customerId)); 
      toast({
        title: "Customer Deleted",
        description: `Customer (ID: ${customerId}) has been removed.`,
      });
    } else {
      toast({
        title: "Error Deleting Customer",
        description: `Could not delete customer (ID: ${customerId}). They might have related data or an issue occurred.`,
        variant: "destructive"
      });
    }
    setDeletingCustomerId(null);
  };


  if (role !== 'admin') {
    return (
        <div className="container mx-auto py-8 text-center">
            <p>You are not authorized to view this page.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-7 w-7" /> Customer Management
        </h1>
        <Button onClick={handleAddNewCustomer} className="shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            View, search, and manage your customer records. Data is now sourced from Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="customer-search" className="sr-only">Search Customers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="customer-search"
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-1/2 lg:w-1/3"
              />
            </div>
          </div>

          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-10 w-10">
                           <AvatarImage src={`https://placehold.co/100x100.png?text=${customer.name.substring(0,1)}`} alt={customer.name} data-ai-hint="person initial"/>
                          <AvatarFallback>{customer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground"/>
                            {customer.email}
                        </div>
                        </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground"/>
                            {customer.phone || 'N/A'}
                        </div>
                        </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setDeletingCustomerId(customer.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          {deletingCustomerId === customer.id && ( 
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the customer "{customer.name}".
                                  Any associated orders will remain but may lose their direct customer link if not handled elsewhere.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingCustomerId(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                No customers found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search term or " : ""}
                <Button variant="link" className="p-0 h-auto" onClick={handleAddNewCustomer}>
                    add a new customer
                </Button>.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Showing {customers.length} of {initialCustomers.length} total customers from the database.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
