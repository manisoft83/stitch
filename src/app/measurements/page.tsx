import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Ban } from 'lucide-react';

export default function MeasurementsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Ban className="h-12 w-12 text-muted-foreground mx-auto" />
          <CardTitle className="text-2xl font-bold text-primary">Feature Not Available</CardTitle>
          <CardDescription>
            The measurements feature has been disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-center text-muted-foreground">This component of the application is no longer in use.</p>
        </CardContent>
      </Card>
    </div>
  );
}
