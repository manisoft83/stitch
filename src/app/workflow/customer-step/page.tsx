
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// Removed Select imports as it's being replaced for existing customer selection
import { useToast } from '@/hooks/use-toast';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { mockCustomers, type Customer } from '@/lib/mockData'; 
import { UserPlus, Users, Edit3, ArrowRight, Search } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setCustomer, currentCustomer } = useOrderWorkflow();
  
  const initialCustomerType = currentCustomer ? 'existing' : 'new';
  const [customerType, setCustomerType] = useState<'new' | 'existing'>(initialCustomerType);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || '');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { 
      name: currentCustomer && customerType === 'existing' ? currentCustomer.name : '', 
      email: currentCustomer && customerType === 'existing' ? currentCustomer.email : '', 
      phone: currentCustomer && customerType === 'existing' ? currentCustomer.phone : '' 
    },
  });

  useEffect(() => {
    if (customerType === 'existing' && selectedCustomerId) {
      const customer = mockCustomers.find(c => c.id === selectedCustomerId);
      if (customer) {
        reset({ name: customer.name, email: customer.email, phone: customer.phone });
      }
    } else if (customerType === 'new') {
      if(selectedCustomerId !== '' || (currentCustomer && initialCustomerType === 'existing') ) {
         reset({ name: '', email: '', phone: '' });
      }
      setSelectedCustomerId(''); 
      setCustomerSearchTerm(''); // Clear search term when switching to new
    }
  }, [customerType, selectedCustomerId, reset, currentCustomer, initialCustomerType]);
  
  useEffect(() => {
    if (currentCustomer) {
      setCustomerType('existing');
      setSelectedCustomerId(currentCustomer.id);
      reset({ name: currentCustomer.name, email: currentCustomer.email, phone: currentCustomer.phone });
    }
  }, [currentCustomer, reset]);

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleFormSubmit = (data: CustomerFormValues) => {
    let customerToSet: Customer | null = null;
    let toastMessage = {};

    if (customerType === 'existing' && selectedCustomerId) {
      const customerIndex = mockCustomers.findIndex(c => c.id === selectedCustomerId);
      if (customerIndex !== -1) {
        customerToSet = {
          ...mockCustomers[customerIndex],
          ...data, 
        };
        mockCustomers[customerIndex] = customerToSet;
        toastMessage = { title: "Customer Updated", description: `${customerToSet.name}'s details have been updated.` };
      } else {
         toast({ title: "Error", description: "Could not find customer to update.", variant: "destructive" });
         return;
      }
    } else { // New customer
      const newCustId = `CUST${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
      customerToSet = {
        id: newCustId,
        ...data,
      };
      mockCustomers.push(customerToSet); 
      toastMessage = { title: "New Customer Registered", description: `${customerToSet.name} has been registered.` };
    }

    if (customerToSet) {
      setCustomer(customerToSet);
      toast(toastMessage);
      router.push('/workflow/measurement-step');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Details</CardTitle>
          <CardDescription>
            {customerType === 'new' ? "Register a new customer or " : "Select an existing customer or "}
            {customerType === 'existing' && selectedCustomerId 
              ? "review/update their details below. " 
              : "search and select from the list. "}
            You can also switch to register a new customer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={customerType}
            onValueChange={(value: 'new' | 'existing') => {
              setCustomerType(value);
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="new" id="type-new" className="peer sr-only" />
              <Label
                htmlFor="type-new"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <UserPlus className="mb-2 h-6 w-6" />
                New Customer
              </Label>
            </div>
            <div>
              <RadioGroupItem value="existing" id="type-existing" className="peer sr-only" />
              <Label
                htmlFor="type-existing"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Users className="mb-2 h-6 w-6" />
                Existing Customer
              </Label>
            </div>
          </RadioGroup>

          {customerType === 'existing' && (
            <div className="space-y-4 pt-6 border-t border-dashed">
              <Label htmlFor="customer-search" className="flex items-center text-md font-medium">
                <Search className="mr-2 h-5 w-5 text-primary"/> Search Existing Customers
              </Label>
              <Input
                id="customer-search"
                placeholder="Filter by name, email, or phone..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="mb-4"
              />
              {filteredCustomers.length > 0 ? (
                <RadioGroup
                  value={selectedCustomerId}
                  onValueChange={(id) => {
                    setSelectedCustomerId(id);
                    // Form population for edit is handled by useEffect watching selectedCustomerId
                  }}
                  className="space-y-1 max-h-60 overflow-y-auto border p-3 rounded-md bg-muted/30"
                >
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center space-x-3 p-2.5 rounded-md hover:bg-accent/20 transition-colors">
                      <RadioGroupItem value={customer.id} id={`cust-${customer.id}`} />
                      <Label htmlFor={`cust-${customer.id}`} className="font-normal cursor-pointer w-full">
                        <div className="flex justify-between items-center">
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground">{customer.email} | {customer.phone}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No customers match your search criteria.
                </p>
              )}
            </div>
          )}

          {(customerType === 'new' || (customerType === 'existing' && selectedCustomerId)) && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 border-t pt-6 mt-6 border-dashed">
              <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
                {customerType === 'existing' && selectedCustomerId ? (
                  <><Edit3 className="mr-2 h-5 w-5"/>Edit Details for {mockCustomers.find(c=>c.id===selectedCustomerId)?.name || 'Selected Customer'}</>
                ) : (
                  <><UserPlus className="mr-2 h-5 w-5"/>Register New Customer</>
                )}
              </h3>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g., Jane Doe" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} placeholder="e.g., jane.doe@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" {...register("phone")} placeholder="e.g., (555) 123-4567" />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
              </div>
              <Button type="submit" className="w-full">
                {customerType === 'existing' && selectedCustomerId ? "Update Details & Proceed" : "Register & Proceed"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Customer data is mocked and managed locally for this prototype.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
