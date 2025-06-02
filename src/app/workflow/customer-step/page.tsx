
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
import { useToast } from '@/hooks/use-toast';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { mockCustomers, type Customer, type Address } from '@/lib/mockData'; 
import { UserPlus, Users, Edit3, ArrowRight, Search, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  street: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
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
      phone: currentCustomer && customerType === 'existing' ? currentCustomer.phone : '',
      street: currentCustomer && customerType === 'existing' ? currentCustomer.address?.street : '',
      city: currentCustomer && customerType === 'existing' ? currentCustomer.address?.city : '',
      zipCode: currentCustomer && customerType === 'existing' ? currentCustomer.address?.zipCode : '',
      country: currentCustomer && customerType === 'existing' ? currentCustomer.address?.country : '',
    },
  });

  useEffect(() => {
    if (customerType === 'existing' && selectedCustomerId) {
      const customer = mockCustomers.find(c => c.id === selectedCustomerId);
      if (customer) {
        reset({ 
          name: customer.name, 
          email: customer.email, 
          phone: customer.phone,
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          zipCode: customer.address?.zipCode || '',
          country: customer.address?.country || '',
        });
      }
    } else if (customerType === 'new') {
      if(selectedCustomerId !== '' || (currentCustomer && initialCustomerType === 'existing') ) {
         reset({ name: '', email: '', phone: '', street: '', city: '', zipCode: '', country: '' });
      }
      setSelectedCustomerId(''); 
      setCustomerSearchTerm('');
    }
  }, [customerType, selectedCustomerId, reset, currentCustomer, initialCustomerType]);
  
  useEffect(() => {
    if (currentCustomer) {
      setCustomerType('existing');
      setSelectedCustomerId(currentCustomer.id);
      reset({ 
        name: currentCustomer.name, 
        email: currentCustomer.email, 
        phone: currentCustomer.phone,
        street: currentCustomer.address?.street || '',
        city: currentCustomer.address?.city || '',
        zipCode: currentCustomer.address?.zipCode || '',
        country: currentCustomer.address?.country || '',
      });
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

    const customerAddress: Address | undefined = (data.street && data.city && data.zipCode && data.country)
      ? { street: data.street, city: data.city, zipCode: data.zipCode, country: data.country }
      : undefined;

    if (customerType === 'existing' && selectedCustomerId) {
      const customerIndex = mockCustomers.findIndex(c => c.id === selectedCustomerId);
      if (customerIndex !== -1) {
        customerToSet = {
          ...mockCustomers[customerIndex],
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: customerAddress, 
        };
        mockCustomers[customerIndex] = customerToSet;
        toastMessage = { title: "Customer Updated", description: `${customerToSet.name}'s details have been updated.` };
      } else {
         toast({ title: "Error", description: "Could not find customer to update.", variant: "destructive" });
         return;
      }
    } else { 
      const newCustId = `CUST${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
      customerToSet = {
        id: newCustId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: customerAddress,
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
          <CardTitle className="text-2xl font-bold text-primary">Customer Details & Address</CardTitle>
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

              <Separator className="my-6"/>
              <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary"/> Address (Optional)
              </h3>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" {...register("street")} placeholder="e.g., 123 Main St" />
                {errors.street && <p className="text-sm text-destructive mt-1">{errors.street.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} placeholder="e.g., Anytown" />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>
                <div>
                    <Label htmlFor="zipCode">Zip / Postal Code</Label>
                    <Input id="zipCode" {...register("zipCode")} placeholder="e.g., 12345" />
                    {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} placeholder="e.g., USA" />
                {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
              </div>
              
              <Button type="submit" className="w-full mt-6 !mb-2">
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
