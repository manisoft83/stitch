"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import type { Customer } from '@/lib/mockData';
import { getCustomers as fetchAllCustomers } from '@/lib/server/dataService';
import { saveCustomerAction, type SaveCustomerActionResult } from '@/app/customers/actions';
import { UserPlus, Users, Edit3, ArrowRight, Search, MapPin, Truck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  isCourier: z.boolean().default(false),
  street: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
}).refine((data) => {
    if (data.isCourier) {
        return !!data.street && !!data.city && !!data.zipCode && !!data.country;
    }
    return true;
}, {
    message: "Full address is required for courier delivery.",
    path: ["street"] 
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomerStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    setCustomer: setWorkflowCustomer, 
    resetWorkflow, 
    editingOrderId,
    isCourier: workflowIsCourier,
    setIsCourier
  } = useOrderWorkflow();
  
  const initialCustomerType = currentCustomer && editingOrderId ? 'existing' : (currentCustomer ? 'existing' : 'new');
  const [customerType, setCustomerType] = useState<'new' | 'existing'>(initialCustomerType);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || '');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: currentCustomer 
      ? { 
          name: currentCustomer.name, 
          email: currentCustomer.email, 
          phone: currentCustomer.phone,
          isCourier: workflowIsCourier,
          street: currentCustomer.address?.street || '',
          city: currentCustomer.address?.city || '',
          zipCode: currentCustomer.address?.zipCode || '',
          country: currentCustomer.address?.country || '',
        }
      : { name: '', email: '', phone: '', isCourier: false, street: '', city: '', zipCode: '', country: '' },
  });

  const isCourierChecked = watch("isCourier");

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const fetchedCustomers = await fetchAllCustomers();
        setAllCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast({ title: "Error", description: "Could not load existing customers.", variant: "destructive" });
      }
      setIsLoadingCustomers(false);
    };

    if (customerType === 'existing' || (!currentCustomer && !editingOrderId)) { 
      loadCustomers();
    }
    
    if (currentCustomer) {
        if (customerType === 'new' || (editingOrderId && customerType !== 'existing')) {
            setCustomerType('existing');
        }
        setSelectedCustomerId(currentCustomer.id);
        reset({
            name: currentCustomer.name,
            email: currentCustomer.email,
            phone: currentCustomer.phone,
            isCourier: workflowIsCourier,
            street: currentCustomer.address?.street || '',
            city: currentCustomer.address?.city || '',
            zipCode: currentCustomer.address?.zipCode || '',
            country: currentCustomer.address?.country || '',
        });
    } else if (!editingOrderId) {
        if (customerType === 'new' && (selectedCustomerId !== '' || initialCustomerType === 'existing')) {
          reset({ name: '', email: '', phone: '', isCourier: false, street: '', city: '', zipCode: '', country: '' });
        }
        setSelectedCustomerId(''); 
    }
  }, [customerType, currentCustomer, reset, toast, initialCustomerType, editingOrderId, workflowIsCourier]);

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  const handleFormSubmit = async (data: CustomerFormValues) => {
    const customerIdToUpdate = (customerType === 'existing' && selectedCustomerId) ? selectedCustomerId : undefined;

    try {
      const { isCourier, ...customerData } = data;
      const actionResult: SaveCustomerActionResult = await saveCustomerAction(customerData, customerIdToUpdate);

      if (actionResult.success && actionResult.customer) {
        toast({
          title: customerIdToUpdate ? "Customer Updated" : "New Customer Registered",
          description: `${actionResult.customer.name}'s details have been updated.`
        });
        setIsCourier(isCourier);
        setWorkflowCustomer(actionResult.customer);
        router.push('/workflow/design-step');
      } else {
        toast({
          title: "Error Saving Customer",
          description: actionResult.error || "Failed to save customer details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Client Error",
        description: (error instanceof Error ? error.message : "An unexpected error occurred."),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Details & Options</CardTitle>
          <CardDescription>
            {editingOrderId ? `Editing order for ${currentCustomer?.name || 'customer'}. ` : ""}
            Manage customer information and delivery preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={customerType}
            onValueChange={(value: 'new' | 'existing') => {
              if (customerType !== value && !editingOrderId) {
                resetWorkflow(); 
              }
              setCustomerType(value);
              if (value === 'new') {
                setSelectedCustomerId(''); 
                reset({ name: '', email: '', phone: '', isCourier: false, street: '', city: '', zipCode: '', country: '' });
                if(!editingOrderId) setWorkflowCustomer(null); 
              } else if (value === 'existing' && editingOrderId && currentCustomer) {
                setSelectedCustomerId(currentCustomer.id);
              }
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
                disabled={isLoadingCustomers}
              />
              {isLoadingCustomers ? <p>Loading customers...</p> : 
                filteredCustomers.length > 0 ? (
                <RadioGroup
                  value={selectedCustomerId}
                  onValueChange={(id) => {
                    setSelectedCustomerId(id);
                    const customer = allCustomers.find(c => c.id === id);
                    if (customer) setWorkflowCustomer(customer);
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
                  <><Edit3 className="mr-2 h-5 w-5"/>Edit Details for {allCustomers.find(c=>c.id===selectedCustomerId)?.name || currentCustomer?.name || 'Selected Customer'}</>
                ) : (
                  <><UserPlus className="mr-2 h-5 w-5"/>Register New Customer</>
                )}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name")} placeholder="e.g., Jane Doe" />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" {...register("phone")} placeholder="e.g., (555) 123-4567" />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} placeholder="e.g., jane.doe@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="flex items-center space-x-2 py-4 bg-muted/20 p-4 rounded-lg">
                <Checkbox 
                    id="isCourier" 
                    checked={isCourierChecked}
                    onCheckedChange={(checked) => setValue("isCourier", !!checked)}
                />
                <Label htmlFor="isCourier" className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                    <Truck className="h-5 w-5 text-primary" /> Courier Delivery Requested
                </Label>
              </div>

              {isCourierChecked && (
                <div className="space-y-4 border-t pt-6 mt-6 border-dashed animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-lg font-medium text-foreground mb-3 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary"/> Delivery Address (Required)
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
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={(customerType === 'existing' && !selectedCustomerId && !currentCustomer) || isSubmitting}
              >
                {(customerType === 'existing' && selectedCustomerId) || (editingOrderId && currentCustomer) ? "Update Details & Proceed" : "Register & Proceed"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                {isCourierChecked ? "Full address is required for courier delivery." : "Address capture is enabled for courier services."}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
