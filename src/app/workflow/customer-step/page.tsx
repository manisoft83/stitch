
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
import { getCustomers as fetchAllCustomers, type CustomerFormInput } from '@/lib/server/dataService';
import { saveCustomerAction, type SaveCustomerActionResult } from '@/app/customers/actions';
import { UserPlus, Users, Edit3, ArrowRight, Search, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  street: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomerStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    setCustomer: setWorkflowCustomer, 
    resetWorkflow, 
    editingOrderId // Get editingOrderId from context
  } = useOrderWorkflow();
  
  // If currentCustomer exists AND we are editing an order, default to 'existing'
  const initialCustomerType = currentCustomer && editingOrderId ? 'existing' : (currentCustomer ? 'existing' : 'new');
  const [customerType, setCustomerType] = useState<'new' | 'existing'>(initialCustomerType);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || '');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: currentCustomer 
      ? { 
          name: currentCustomer.name, 
          email: currentCustomer.email, 
          phone: currentCustomer.phone,
          street: currentCustomer.address?.street || '',
          city: currentCustomer.address?.city || '',
          zipCode: currentCustomer.address?.zipCode || '',
          country: currentCustomer.address?.country || '',
        }
      : { name: '', email: '', phone: '', street: '', city: '', zipCode: '', country: '' },
  });

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

    if (customerType === 'existing' || (!currentCustomer && !editingOrderId) ) { 
      loadCustomers();
    }
    
    if (currentCustomer) {
        // If editingOrderId is present, this implies we are in an edit flow.
        // The customerType should already be 'existing' if currentCustomer came from loadOrderForEditing.
        // If it was 'new' and currentCustomer just got set (e.g. after creating one), then switch to 'existing'.
        if (customerType === 'new' || (editingOrderId && customerType !== 'existing')) {
            setCustomerType('existing');
        }
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
        if (customerType === 'existing' && !allCustomers.find(c => c.id === currentCustomer.id)) {
            if (!isLoadingCustomers) loadCustomers(); 
        }
    } else if (!editingOrderId) { // Only fully reset to new if not editing an order
        if (customerType === 'new' && (selectedCustomerId !== '' || initialCustomerType === 'existing')) {
          reset({ name: '', email: '', phone: '', street: '', city: '', zipCode: '', country: '' });
        }
        setSelectedCustomerId(''); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerType, currentCustomer, reset, toast, initialCustomerType, editingOrderId]); // Added editingOrderId

 useEffect(() => {
    if (customerType === 'existing' && selectedCustomerId) {
      const customer = allCustomers.find(c => c.id === selectedCustomerId);
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
    }
  }, [selectedCustomerId, customerType, allCustomers, reset]);

  const filteredCustomers = allCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  const handleFormSubmit = async (data: CustomerFormValues) => {
    let customerToSetInWorkflow: Customer | null = null;
    // If editing an order, customerIdToUpdate should be the currentCustomer's ID from the workflow context,
    // unless the user has explicitly chosen to create a new customer or selected a *different* existing one.
    // For simplicity, if `editingOrderId` is set, we assume the `saveCustomerAction` is for the `currentCustomer.id`.
    // If the user wants to change the customer FOR an existing order, that's a more complex flow.
    // Here, `selectedCustomerId` will be set to `currentCustomer.id` if editing.
    const customerIdToUpdate = (customerType === 'existing' && selectedCustomerId) ? selectedCustomerId : undefined;

    try {
      const actionResult: SaveCustomerActionResult = await saveCustomerAction(data, customerIdToUpdate);

      if (actionResult.success && actionResult.customer) {
        customerToSetInWorkflow = actionResult.customer;
        toast({
          title: customerIdToUpdate ? "Customer Updated" : "New Customer Registered",
          description: `${actionResult.customer.name}'s details have been ${customerIdToUpdate ? 'updated' : 'registered'} in Firestore.`
        });
        setWorkflowCustomer(customerToSetInWorkflow); // This will update currentCustomer and currentMeasurements
        router.push('/workflow/measurement-step');
      } else {
        console.error("Client: saveCustomerAction failed.", actionResult.error);
        toast({
          title: "Error Saving Customer",
          description: actionResult.error || "Failed to save customer details. Check server logs.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Client: Error in handleFormSubmit:", error);
      toast({
        title: "Client Error",
        description: (error instanceof Error ? error.message : "An unexpected error occurred while trying to save."),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Customer Details & Address</CardTitle>
          <CardDescription>
            {editingOrderId ? `Editing order for ${currentCustomer?.name || 'customer'}. ` : ""}
            Manage customer information. Data is stored in Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={customerType}
            onValueChange={(value: 'new' | 'existing') => {
              if (customerType !== value && !editingOrderId) { // Only reset workflow if NOT editing an existing order
                resetWorkflow(); 
              }
              setCustomerType(value);
              if (value === 'new') {
                setSelectedCustomerId(''); 
                reset({ name: '', email: '', phone: '', street: '', city: '', zipCode: '', country: '' });
                // If not editing an order, also clear the customer from the workflow context.
                // If editing, keep the original customer in context for now.
                if(!editingOrderId) {
                  setWorkflowCustomer(null); 
                }
              } else if (value === 'existing' && editingOrderId && currentCustomer) {
                // If switching back to existing while editing, re-select the original customer.
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
                    if (customer && !editingOrderId) { // If not editing, set customer in workflow
                        setWorkflowCustomer(customer);
                    } else if (customer && editingOrderId && currentCustomer && customer.id !== currentCustomer.id) {
                        // If editing an order and selecting a *different* customer.
                        // This is a more complex scenario. For now, we'll update the form,
                        // and the save action will associate the order with this new customer.
                        // The OrderWorkflow context might need adjustment if this becomes a primary use case.
                        // For now, setting the workflow customer here will change currentMeasurements etc.
                         setWorkflowCustomer(customer);
                    } else if (customer && editingOrderId && currentCustomer && customer.id === currentCustomer.id) {
                        // Re-selecting the same customer, ensure workflow reflects this.
                        setWorkflowCustomer(customer);
                    }
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
                  No customers match your search criteria or none found in the database.
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
              
              <Button 
                type="submit" 
                className="w-full mt-6 !mb-2" 
                disabled={ (customerType === 'existing' && !selectedCustomerId && !currentCustomer ) || isSubmitting}
              >
                {(customerType === 'existing' && selectedCustomerId) || (editingOrderId && currentCustomer) ? "Update Details & Proceed" : "Register & Proceed"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
                Customer data is stored in Firestore. {editingOrderId ? "Order context is preserved." : ""}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    