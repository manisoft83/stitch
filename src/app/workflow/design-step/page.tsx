
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOrderWorkflow, type DesignDetails, initialSingleDesignState } from '@/contexts/order-workflow-context';
import { DesignTool } from '@/components/design/design-tool';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, PlusCircle, Trash2, Edit3, Package, Shirt } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getDetailNameById, fabricOptionsForDisplay, colorOptionsForDisplay, styleOptionsForDisplay, generateDesignSummary } from '@/lib/mockData';

export default function DesignStepPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    currentCustomer, 
    currentMeasurements, 
    activeDesign, 
    setActiveDesign,
    clearActiveDesign,
    orderItems, 
    addOrUpdateItemInOrder,
    removeOrderItem,
    startEditingOrderItem,
    editingItemIndex,
  } = useOrderWorkflow();

  useEffect(() => {
    if (!currentCustomer) {
      toast({ title: "No Customer Selected", description: "Please select or register a customer first.", variant: "destructive" });
      router.replace('/workflow/customer-step');
    } else if (!currentMeasurements) {
      toast({ title: "No Measurements Found", description: "Please provide measurements before designing.", variant: "destructive" });
      router.replace('/workflow/measurement-step');
    } else if (!activeDesign && orderItems.length === 0 && editingItemIndex === null) {
      // If no active design, no items, and not editing, initialize a new design
      setActiveDesign({ ...initialSingleDesignState });
    }
  }, [currentCustomer, currentMeasurements, router, toast, activeDesign, orderItems.length, editingItemIndex, setActiveDesign]);

  const handleSaveCurrentItem = (configuredDesign: DesignDetails) => {
    addOrUpdateItemInOrder(configuredDesign);
    toast({
      title: editingItemIndex !== null ? "Item Updated" : "Item Added to Order",
      description: `The item design has been ${editingItemIndex !== null ? 'updated' : 'added'}. You can add more items or proceed to summary.`,
    });
    // Active design is cleared by addOrUpdateItemInOrder, ready for new item or explicit selection
  };

  const handleDesignNewItem = () => {
    clearActiveDesign(); // This sets activeDesign to initialSingleDesignState and editingItemIndex to null
  };
  
  const handleEditItem = (index: number) => {
    startEditingOrderItem(index);
  };

  const handleRemoveItem = (index: number) => {
    removeOrderItem(index);
    toast({ title: "Item Removed", description: "The item has been removed from your order." });
  };

  const canProceedToSummary = orderItems.length > 0;

  if (!currentCustomer || !currentMeasurements) {
    return <div className="container mx-auto py-8 flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading workflow state or redirecting...</p></div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Shirt className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">
              {editingItemIndex !== null ? `Editing Item ${editingItemIndex + 1}` : (activeDesign ? 'Configure New Item' : 'Design Items')}
            </CardTitle>
          </div>
          <CardDescription>
            Use the tool below to configure design details for an item. Add multiple items to your order.
            Customer: <span className="font-semibold text-foreground">{currentCustomer.name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDesign ? (
            <DesignTool initialDesign={activeDesign} onSaveDesign={handleSaveCurrentItem} submitButtonText={editingItemIndex !== null ? "Update Item in Order" : "Add Item to Order"} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No item is currently being designed.</p>
              <Button onClick={handleDesignNewItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Start Designing a New Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {orderItems.length > 0 && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-primary"><Package className="h-6 w-6"/>Items in Your Order ({orderItems.length})</CardTitle>
            <CardDescription>Review items added so far. You can edit or remove them before proceeding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item, index) => (
              <Card key={index} className="p-4 bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-grow">
                  <h4 className="font-semibold text-md">Item {index + 1}: {generateDesignSummary(item)}</h4>
                  {item.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {item.notes.substring(0, 100)}{item.notes.length > 100 ? '...' : ''}</p>}
                   {item.referenceImages && item.referenceImages.length > 0 && (
                    <div className="mt-2 flex gap-2">
                        {item.referenceImages.slice(0,3).map((src, imgIdx) => (
                             <Image key={imgIdx} src={src} alt={`Ref ${imgIdx+1}`} width={30} height={30} className="rounded border object-cover" data-ai-hint="thumbnail design reference"/>
                        ))}
                        {item.referenceImages.length > 3 && <span className="text-xs self-end text-muted-foreground">+{item.referenceImages.length - 3} more</span>}
                    </div>
                   )}
                </div>
                <div className="flex gap-2 self-start sm:self-center shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleEditItem(index)} disabled={editingItemIndex === index || activeDesign === null}>
                    <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                  </Button>
                </div>
              </Card>
            ))}
             <Separator className="my-4"/>
             <div className="flex justify-end">
                <Button onClick={handleDesignNewItem} variant="outline" disabled={activeDesign === null && editingItemIndex === null}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Item
                </Button>
             </div>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/workflow/measurement-step')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Measurements
        </Button>
        <Button onClick={() => router.push('/workflow/summary-step')} disabled={!canProceedToSummary} className="shadow-md hover:shadow-lg">
          Proceed to Order Summary <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
