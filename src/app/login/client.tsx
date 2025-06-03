
// src/app/login/client.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Tailor } from '@/lib/mockData'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn } from 'lucide-react';

interface LoginClientPageProps {
  initialTailors: Tailor[];
}

export default function LoginClientPage({ initialTailors }: LoginClientPageProps) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"admin" | "tailor">("admin");
  const [selectedTailorId, setSelectedTailorId] = useState<string>("");

  const [availableTailors, setAvailableTailors] = useState<Tailor[]>(initialTailors);
  useEffect(() => {
    setAvailableTailors(initialTailors);
  }, [initialTailors]);


  const handleLogin = () => {
    if (selectedRole === "admin") {
      login("admin");
    } else if (selectedRole === "tailor" && selectedTailorId) {
      const tailor = availableTailors.find(t => t.id === selectedTailorId);
      if (tailor) {
        login("tailor", tailor);
      } else {
        console.error("Selected tailor not found");
        alert("Error: Selected tailor not found. Please select a valid tailor.");
      }
    } else if (selectedRole === "tailor" && !selectedTailorId) {
        alert("Please select a tailor profile to log in as Tailor.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-primary">
              <path d="M12 2l-4.5 4.5L3 12l4.5 4.5L12 22l4.5-4.5L21 12l-4.5-4.5L12 2zM12 7.5v9M7.5 12h9"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome to StitchStyle</CardTitle>
          <CardDescription>Please select your role to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="role-selector" className="text-base font-medium">Select Role</Label>
            <RadioGroup
              id="role-selector"
              value={selectedRole}
              onValueChange={(value: "admin" | "tailor") => setSelectedRole(value)}
              className="mt-2 grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="admin" id="role-admin" className="peer sr-only" />
                <Label
                  htmlFor="role-admin"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Admin
                </Label>
              </div>
              <div>
                <RadioGroupItem value="tailor" id="role-tailor" className="peer sr-only" />
                <Label
                  htmlFor="role-tailor"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Tailor
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedRole === "tailor" && (
            <div className="space-y-2">
              <Label htmlFor="tailor-select" className="text-base font-medium">Select Tailor Profile</Label>
              <Select value={selectedTailorId} onValueChange={setSelectedTailorId}>
                <SelectTrigger id="tailor-select" className="w-full">
                  <SelectValue placeholder="Choose your tailor profile..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTailors.map((tailor) => (
                    <SelectItem key={tailor.id} value={tailor.id}>
                      {tailor.name} ({tailor.expertise.join(", ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full text-lg py-6 shadow-md hover:shadow-lg" 
            onClick={handleLogin}
            disabled={(selectedRole === 'tailor' && !selectedTailorId)}
          >
            <LogIn className="mr-2 h-5 w-5" /> Login as {selectedRole === "admin" ? "Admin" : "Tailor"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
