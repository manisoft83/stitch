import { MeasurementForm } from '@/components/measurements/measurement-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MeasurementsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Your Measurements</CardTitle>
          <CardDescription>
            Provide your body measurements for a perfectly tailored fit. 
            Follow our tips for accuracy. All measurements are in inches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementForm />
        </CardContent>
      </Card>
    </div>
  );
}
