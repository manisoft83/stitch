
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Ruler, Wand2, ShoppingCart, Users, PackageSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Ruler className="h-10 w-10 text-primary" />,
      title: "Precise Measurements",
      description: "Input your measurements for a perfect fit. Our guides ensure accuracy.",
      link: "/measurements",
      actionText: "Enter Measurements",
    },
    {
      icon: <Palette className="h-10 w-10 text-primary" />,
      title: "Custom Design Studio",
      description: "Unleash your creativity. Choose fabrics, colors, and styles.",
      link: "/design",
      actionText: "Design Now",
    },
    {
      icon: <Wand2 className="h-10 w-10 text-primary" />,
      title: "AI Style Advisor",
      description: "Get personalized style recommendations based on your profile.",
      link: "/recommendations",
      actionText: "Get Style Advice",
    },
    {
      icon: <ShoppingCart className="h-10 w-10 text-primary" />,
      title: "Order Management",
      description: "Track your custom orders from creation to delivery.",
      link: "/orders",
      actionText: "View Your Orders",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50 dark:bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  StitchStyle: Your Vision, Perfectly Tailored.
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl dark:text-foreground/70">
                  Design unique women's clothing that fits you flawlessly. Input your measurements, customize your style, and let our AI assist you.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/design">Start Designing</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/recommendations">Get Recommendations</Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Fashion Design Hero"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
              data-ai-hint="fashion design elegant"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm dark:bg-muted/50">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary">
                Craft Your Unique Style
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground/70">
                From precise measurements to AI-powered style advice, StitchStyle offers everything you need to create clothing that's uniquely yours.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none xl:grid-cols-4 pt-12">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
                <CardHeader className="items-center">
                  {feature.icon}
                  <CardTitle className="mt-4 text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
                <CardContent className="mt-auto text-center">
                   <Button asChild variant="link" className="text-primary">
                     <Link href={feature.link}>{feature.actionText}</Link>
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-primary">
              Ready to Express Your Style?
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground/70">
              Join StitchStyle today and start creating clothing that truly represents you.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <Button asChild size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow">
              <Link href="/design">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
