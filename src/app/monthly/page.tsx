import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function MonthlyPage() {
  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="المهام الشهرية" />
      <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-96">
        <CardHeader>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4 mx-auto">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>قيد الإنشاء</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">هذه الصفحة قيد التطوير حاليًا. عد قريبًا!</p>
        </CardContent>
      </Card>
    </main>
  );
}
