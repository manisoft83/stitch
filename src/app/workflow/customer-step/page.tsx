
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { mockCustomers, type Customer } from '@/lib/mockData'; 
import { UserPlus, Users, Edit3, ArrowRight } from 'lucide-react';

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
  
  // Determine initial customerType based on currentCustomer
  const initialCustomerType = currentCustomer ? 'existing' : 'new';
  const [customerType, setCustomerType] = useState<'new' | 'existing'>(initialCustomerType);
  
  // Set initial selectedCustomerId if currentCustomer exists
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || '');

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { 
      name: currentCustomer && customerType === 'existing' ? currentCustomer.name : '', 
      email: currentCustomer && customerType === 'existing' ? currentCustomer.email : '', 
      phone: currentCustomer && customerType === 'existing' ? currentCustomer.phone : '' 
    },
  });

  // Effect to populate form when an existing customer is selected
  useEffect(() => {
    if (customerType === 'existing' && selectedCustomerId) {
      const customer = mockCustomers.find(c => c.id === selectedCustomerId);
      if (customer) {
        reset({ name: customer.name, email: customer.email, phone: customer.phone });
      }
    } else if (customerType === 'new') {
      // Clear form if switching to New Customer, unless it's the initial load with a new type
      if(selectedCustomerId !== '' || (currentCustomer && initialCustomerType === 'existing') ) {
         reset({ name: '', email: '', phone: '' });
      }
      setSelectedCustomerId(''); // Clear selected customer ID
    }
  }, [customerType, selectedCustomerId, reset, currentCustomer, initialCustomerType]);
  
  // Effect to handle initial load if currentCustomer exists (e.g. navigating back)
  useEffect(() => {
    if (currentCustomer) {
      setCustomerType('existing');
      setSelectedCustomerId(currentCustomer.id);
      reset({ name: currentCustomer.name, email: currentCustomer.email, phone: currentCustomer.phone });
    }
  }, [currentCustomer, reset]);


  const handleFormSubmit = (data: CustomerFormValues) => {
    let customerToSet: Customer | null = null;
    let toastMessage = {};

    if (customerType === 'existing' && selectedCustomerId) {
      // Update existing customer
      const customerIndex = mockCustomers.findIndex(c => c.id === selectedCustomerId);
      if (customerIndex !== -1) {
        customerToSet = {
          ...mockCustomers[customerIndex],
          ...data, // Update with form data
        };
        mockCustomers[customerIndex] = customerToSet;
        toastMessage = { title: "Customer Updated", description: `${customerToSet.name}'s details have been updated.` };
      } else {
         toast({ title: "Error", description: "Could not find customer to update.", variant: "destructive" });
         return;
      }
    } else {
      // Create new customer
      const newCustId = `CUST${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
      customerToSet = {
        id: newCustId,
        ...data,
      };
      mockCustomers.push(customerToSet); // Add to mock data for prototype
      toastMessage = { title: "New Customer Registered", description: `${customerToSet.name} has been registered.` };
    }

    if (customerToSet) {
      setCustomer(customerToSet);
      toast(toastMessage);
      router.push('/workflow/measurement-step');
    }
  };
  
  const handleSelectExistingAndProceed = () => {
     if (selectedCustomerId) {
        const customer = mockCustomers.find(c => c.id === selectedCustomerId);
        if (customer) {
            setCustomer(customer); // Set this customer with their current (potentially unedited form) details
            toast({ title: "Customer Selected", description: `Proceeding with ${customer.name}. Current details loaded for editing if needed.` });
            router.push('/workflow/measurement-step');
        } else {
            toast({ title: "Error", description: "Selected customer not found.", variant: "destructive" });
        }
     } else {
        toast({ title: "Error", description: "Please select an existing customer.", variant: "destructive" });
     }
  }


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Details</CardTitle>
          <CardDescription>
            {customerType === 'existing' && selectedCustomerId 
              ? "Review or update the selected customer's details below, or proceed with current information." 
              : "Start by identifying the customer for this order. Choose 'New' or 'Existing'."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={customerType}
            onValueChange={(value: 'new' | 'existing') => {
              setCustomerType(value);
              // setSelectedCustomerId(''); // Let useEffect handle reset based on new customerType
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

          {/* Form for New or Editing Existing Customer */}
          {(customerType === 'new' || (customerType === 'existing' && selectedCustomerId)) && (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 border-t pt-6 mt-6 border-dashed">
              <h3 className="text-lg font-medium text-foreground mb-3">
                {customerType === 'existing' && selectedCustomerId ? (
                  <span className="flex items-center"><Edit3 className="mr-2 h-5 w-5"/>Edit Details for {mockCustomers.find(c=>c.id===selectedCustomerId)?.name || 'Selected Customer'}</span>
                ) : (
                  <span className="flex items-center"><UserPlus className="mr-2 h-5 w-5"/>Register New Customer</span>
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
          
          {/* Selector for Existing Customer - shown when 'existing' is chosen AND form is not yet active for editing specific user */}
          {customerType === 'existing' && (
            <div className="space-y-4 pt-6 border-t border-dashed">
                 <Label htmlFor="customer-select" className="block mb-1">Select Existing Customer</Label>
                 <Select 
                    value={selectedCustomerId} 
                    onValueChange={(id) => {
                        setSelectedCustomerId(id);
                        // Form population is handled by useEffect
                    }}
                  >
                    <SelectTrigger id="customer-select">
                        <SelectValue placeholder="Choose an existing customer..." />
                    </SelectTrigger>
                    <SelectContent>
                        {mockCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* This button is less relevant if form populates for edit, but can be a "proceed without editing" option */}
                {selectedCustomerId && !(customerType === 'existing' && selectedCustomerId) /* Hide if edit form is active */ && (
                    <Button onClick={handleSelectExistingAndProceed} className="w-full" disabled={!selectedCustomerId}>
                        Proceed with Selected Customer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
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

