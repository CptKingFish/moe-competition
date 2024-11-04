import { Card, CardContent } from "@/components/ui/card";
import { Banner } from "./_components/banner";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div>
      <div className="w-full">
        <Banner />
      </div>
      <Separator className="mt-8 mb-6"/>
      <div className="w-full">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Featured Projects
          </h1>
          <p className="text-muted-foreground">
            Fun and Exciting Projects for you to play with!
          </p>
        </div>
      </div>
    </div>
  );
}
