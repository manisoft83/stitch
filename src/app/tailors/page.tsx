import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarClock, Check } from "lucide-react";

// Mock data for tailors - replace with actual data
const tailors = [
  { id: "T001", name: "Alice Wonderland", expertise: ["Dresses", "Evening Wear"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=AW", dataAiHint: "woman portrait" },
  { id: "T002", name: "Bob The Builder", expertise: ["Suits", "Formal Trousers"], availability: "Busy", avatar: "https://placehold.co/100x100.png?text=BB", dataAiHint: "man portrait" },
  { id: "T003", name: "Carol Danvers", expertise: ["Casual Wear", "Alterations"], availability: "Available", avatar: "https://placehold.co/100x100.png?text=CD", dataAiHint: "woman professional" },
];

// Mock data for orders needing assignment
const unassignedOrders = [
    { id: "ORD101", item: "Custom Silk Blouse", dueDateRequested: "2024-08-15" },
    { id: "ORD102", item: "Evening Gown Alteration", dueDateRequested: "2024-08-10" },
];

export default function TailorsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-primary mb-6 flex items-center">
        <Users className="mr-3 h-7 w-7" /> Tailor Hub & Order Assignment
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Unassigned Orders Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Orders Awaiting Assignment</CardTitle>
            <CardDescription>Assign these orders to available tailors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unassignedOrders.length > 0 ? unassignedOrders.map(order => (
              <Card key={order.id} className="p-4 bg-secondary/30 dark:bg-secondary/20">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{order.item} (Order #{order.id})</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                            <CalendarClock className="h-4 w-4 mr-1"/> Due: {order.dueDateRequested}
                        </p>
                    </div>
                    <Button size="sm" variant="outline">Assign Tailor</Button>
                </div>
              </Card>
            )) : <p className="text-muted-foreground">No orders currently need assignment.</p>}
          </CardContent>
        </Card>

        {/* Tailor List Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Available Tailors</CardTitle>
            <CardDescription>View tailor profiles, expertise, and availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tailors.map(tailor => (
              <Card key={tailor.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tailor.avatar} alt={tailor.name} data-ai-hint={tailor.dataAiHint} />
                  <AvatarFallback>{tailor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{tailor.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Expertise: {tailor.expertise.join(", ")}
                  </div>
                  <Badge 
                    variant={tailor.availability === "Available" ? "default" : "secondary"}
                    className={`mt-1 ${tailor.availability === "Available" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}
                  >
                    {tailor.availability}
                  </Badge>
                </div>
                {tailor.availability === "Available" && (
                    <Button variant="ghost" size="sm" className="text-primary">
                        <Check className="h-4 w-4 mr-1"/> Select
                    </Button>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8 p-6 text-center bg-secondary/30 dark:bg-secondary/20">
        <CardTitle className="text-lg">Feature Under Development</CardTitle>
        <CardDescription className="mt-2">
            The tailor assignment module, including preferred tailor selection, automatic assignment, and due date management, is currently under development.
        </CardDescription>
      </Card>
    </div>
  );
}
