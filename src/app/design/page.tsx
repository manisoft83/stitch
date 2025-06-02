
import { DesignTool } from '@/components/design/design-tool';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DesignPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Garment Design Tool</CardTitle>
          <CardDescription>
            Use this interface to select fabrics, colors, and style details for a garment. This tool can be part of a larger order workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesignTool />
        </CardContent>
      </Card>
    </div>
  );
}
