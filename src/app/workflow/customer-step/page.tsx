
"use client";

import { useState } from 'react';
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
import { mockCustomers, type Customer } from '@/lib/mockData'; // Assuming mockCustomers is mutable for prototype
import { UserPlus, Users, ArrowRight } from 'lucide-react';

const newCustomerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
});

type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;

export default function CustomerStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setCustomer, currentCustomer } = useOrderWorkflow();
  const [customerType, setCustomerType] = useState<'new' | 'existing'>(currentCustomer ? 'existing' : 'new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || '');

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const handleProceed = (data?: NewCustomerFormValues) => {
    let customerToSet: Customer | null = null;

    if (customerType === 'new' && data) {
      const newCustId = `CUST${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
      customerToSet = {
        id: newCustId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
      // For prototype: directly add to mockCustomers. In real app, this would be an API call.
      mockCustomers.push(customerToSet);
      toast({ title: "New Customer Registered", description: `${customerToSet.name} has been registered.` });
    } else if (customerType === 'existing' && selectedCustomerId) {
      customerToSet = mockCustomers.find(c => c.id === selectedCustomerId) || null;
      if (customerToSet) {
        toast({ title: "Customer Selected", description: `Proceeding with ${customerToSet.name}.` });
      }
    }

    if (customerToSet) {
      setCustomer(customerToSet);
      // Navigate to the next step (measurement step, to be created)
      router.push('/workflow/measurement-step');
    } else if (customerType === 'existing' && !selectedCustomerId) {
      toast({ title: "Error", description: "Please select an existing customer.", variant: "destructive" });
    }
  };
  
  const onNewCustomerSubmit = (data: NewCustomerFormValues) => {
    handleProceed(data);
  };

  const onExistingCustomerProceed = () => {
    handleProceed();
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Details</CardTitle>
          <CardDescription>
            Start by identifying the customer for this order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={customerType}
            onValueChange={(value: 'new' | 'existing') => {
              setCustomerType(value);
              if (value === 'new') setSelectedCustomerId(''); else reset();
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

          {customerType === 'new' && (
            <form onSubmit={handleSubmit(onNewCustomerSubmit)} className="space-y-4">
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
                Register & Proceed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {customerType === 'existing' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer-select">Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
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
              </div>
              <Button onClick={onExistingCustomerProceed} className="w-full" disabled={!selectedCustomerId}>
                Select Customer & Proceed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
