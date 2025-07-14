"use client";

import { PageHeader } from "@/components/page-header";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage("timeflow-notes", "");

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="ملاحظات" />
      <Card>
        <CardHeader>
          <CardTitle>ملاحظات وأفكار</CardTitle>
          <CardDescription>
            هنا يمكنك كتابة أي ملاحظات أو أفكار أو أهداف طويلة المدى. سيتم حفظ كل شيء تلقائيًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب أفكارك هنا..."
            className="min-h-[400px] w-full rounded-lg border bg-background p-4 text-base focus:ring-2 focus:ring-primary"
          />
        </CardContent>
      </Card>
    </main>
  );
}
