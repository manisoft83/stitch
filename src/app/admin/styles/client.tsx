
// src/app/admin/styles/client.tsx
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Tag, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { allPossibleMeasurements, type GarmentStyle } from '@/lib/mockData';
import { StyleFormDialog, type StyleFormData } from '@/components/admin/style-form-dialog';
import { saveStyleAction, deleteStyleAction } from './actions';
import { useAuth } from '@/hooks/use-auth';

interface StylesClientPageProps {
  initialStyles: GarmentStyle[];
}

export default function StylesClientPage({ initialStyles }: StylesClientPageProps) {
  const [styles, setStyles] = useState<GarmentStyle[]>(initialStyles);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<GarmentStyle | null>(null);
  const [deletingStyleId, setDeletingStyleId] = useState<string | null>(null);
  const { role } = useAuth();
  const { toast } = useToast();

  const handleOpenAddDialog = () => {
    setEditingStyle(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (style: GarmentStyle) => {
    setEditingStyle(style);
    setIsFormOpen(true);
  };

  const handleSaveStyle = async (data: StyleFormData) => {
    const result = await saveStyleAction(data, editingStyle?.id);
    if (result.success && result.style) {
      if (editingStyle) {
        setStyles(prev => prev.map(s => s.id === editingStyle.id ? result.style! : s));
        toast({ title: "Style Updated", description: `${result.style.name} has been updated.` });
      } else {
        setStyles(prev => [...prev, result.style!]);
        toast({ title: "Style Added", description: `${result.style.name} has been created.` });
      }
      setIsFormOpen(false);
    } else {
      toast({ title: "Error", description: result.error || "Could not save style.", variant: "destructive" });
    }
  };

  const handleDeleteStyle = async (styleId: string) => {
    const result = await deleteStyleAction(styleId);
    if (result.success) {
      setStyles(prev => prev.filter(s => s.id !== styleId));
      toast({ title: "Style Deleted", description: `Style (ID: ${styleId}) has been removed.` });
    } else {
      toast({ title: "Error", description: result.error || "Could not delete style.", variant: "destructive" });
    }
    setDeletingStyleId(null);
  };
  
  if (role !== 'admin') {
    return (
        <div className="container mx-auto py-8 text-center">
            <p>You are not authorized to view this page.</p>
        </div>
    );
  }

  const getMeasurementLabel = (id: string) => {
    return allPossibleMeasurements.find(m => m.id === id)?.label || id;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Tag className="mr-3 h-7 w-7" /> Garment Style Management
        </h1>
        <Button onClick={handleOpenAddDialog} className="shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Style
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Garment Styles</CardTitle>
          <CardDescription>
            Create, edit, and manage the garment styles available in the order workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {styles.length > 0 ? styles.map(style => (
            <Card key={style.id} className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{style.name}</h3>
                <div className="mt-2">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground"><Ruler className="h-4 w-4" />Required Measurements:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {style.requiredMeasurements.length > 0 ? style.requiredMeasurements.map(m => (
                      <Badge key={m} variant="secondary">{getMeasurementLabel(m)}</Badge>
                    )) : <p className="text-xs text-muted-foreground">None specified.</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 self-start sm:self-center shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(style)}>
                  <Edit className="mr-1.5 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingStyleId(style.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  {deletingStyleId === style.id && ( 
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the style "{style.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingStyleId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStyle(style.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
              </div>
            </Card>
          )) : (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No styles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <Button variant="link" className="p-0 h-auto" onClick={handleOpenAddDialog}>
                  Create a new style
                </Button> to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <StyleFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        styleToEdit={editingStyle}
        onSave={handleSaveStyle}
      />
    </div>
  );
}
