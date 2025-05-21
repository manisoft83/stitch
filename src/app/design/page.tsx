import { DesignTool } from '@/components/design/design-tool';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DesignPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Custom Design Studio</CardTitle>
          <CardDescription>
            Bring your vision to life. Select fabrics, colors, and style details to create your unique garment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesignTool />
        </CardContent>
      </Card>
    </div>
  );
}
