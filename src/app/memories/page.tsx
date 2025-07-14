
"use client";

import { useState } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, X, Camera, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Memory = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
};

const translations = {
  ar: {
    pageTitle: "الذكريات",
    addMemory: "إضافة ذكرى",
    newMemoryTitle: "ذكرى جديدة",
    newMemoryDesc: "أضف صورة وبعض التفاصيل لهذه اللحظة.",
    memoryTitlePlaceholder: "عنوان الذكرى",
    memoryDescPlaceholder: "صف هذه اللحظة...",
    imageUrlPlaceholder: "رابط الصورة (URL)",
    cancel: "إلغاء",
    saveMemory: "حفظ الذكرى",
    noMemories: "لا توجد ذكريات بعد",
    noMemoriesDesc: "أضف صورة للحظة لا تُنسى!",
    save: "حفظ",
    deleteConfirm: "هل أنت متأكد؟",
    deleteDesc: "سيتم حذف هذه الذكرى نهائيًا.",
    delete: "حذف",
    noContent: "لا يوجد وصف.",
    invalidUrl: "رابط صورة غير صالح",
  },
  en: {
    pageTitle: "Memories",
    addMemory: "Add Memory",
    newMemoryTitle: "New Memory",
    newMemoryDesc: "Add a photo and some details for this moment.",
    memoryTitlePlaceholder: "Memory Title",
    memoryDescPlaceholder: "Describe this moment...",
    imageUrlPlaceholder: "Image URL",
    cancel: "Cancel",
    saveMemory: "Save Memory",
    noMemories: "No memories yet",
    noMemoriesDesc: "Add a photo of an unforgettable moment!",
    save: "Save",
    deleteConfirm: "Are you sure?",
    deleteDesc: "This memory will be permanently deleted.",
    delete: "Delete",
    noContent: "No description.",
    invalidUrl: "Invalid Image URL",
  },
};

export default function MemoriesPage() {
  const [memories, setMemories] = useLocalStorage<Memory[]>("momentum-memories-v1", []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];
  
  const [newMemory, setNewMemory] = useState({ title: "", description: "", imageUrl: "" });

  const handleSaveNewMemory = () => {
    if (!newMemory.title.trim() || !newMemory.imageUrl.trim()) return;
    const newMemoryItem: Memory = {
      id: crypto.randomUUID(),
      title: newMemory.title,
      description: newMemory.description,
      imageUrl: newMemory.imageUrl,
      createdAt: new Date().toISOString(),
    };
    setMemories([newMemoryItem, ...memories]);
    setNewMemory({ title: "", description: "", imageUrl: "" });
    setIsCreating(false);
  };
  
  const handleUpdateMemory = () => {
    if (!editingMemory || !editingMemory.title.trim() || !editingMemory.imageUrl.trim()) return;
    setMemories(memories.map(memory => memory.id === editingMemory.id ? editingMemory : memory));
    setEditingMemory(null);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter(memory => memory.id !== id));
  };
  
  const startEditing = (memory: Memory) => {
    setEditingMemory({ ...memory });
  };
  
  const cancelEditing = () => {
    setEditingMemory(null);
  };

  const cancelCreation = () => {
    setIsCreating(false);
    setNewMemory({ title: "", description: "", imageUrl: "" });
  };
  
  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle}>
        {!isCreating && !editingMemory && (
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{t.addMemory}</span>
          </Button>
        )}
      </PageHeader>
      
      {isCreating && (
        <Card className="mb-8 bg-card/80 border-primary/50">
          <CardHeader>
            <CardTitle>{t.newMemoryTitle}</CardTitle>
            <CardDescription>{t.newMemoryDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t.memoryTitlePlaceholder}
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            />
            <Input
              placeholder={t.imageUrlPlaceholder}
              value={newMemory.imageUrl}
              onChange={(e) => setNewMemory({ ...newMemory, imageUrl: e.target.value })}
            />
            <Textarea
              placeholder={t.memoryDescPlaceholder}
              value={newMemory.description}
              onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" onClick={cancelCreation}><X className="mr-2 h-4 w-4" />{t.cancel}</Button>
            <Button onClick={handleSaveNewMemory}><Save className="mr-2 h-4 w-4" />{t.saveMemory}</Button>
          </CardFooter>
        </Card>
      )}

      {memories.length === 0 && !isCreating && (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Camera className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{t.noMemories}</h3>
            <p className="text-muted-foreground mt-2">{t.noMemoriesDesc}</p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memories.map((memory) => (
          editingMemory?.id === memory.id ? (
            <Card key={memory.id} className="bg-card/80 border-primary/50">
              <CardHeader>
                <Input
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                 <Input
                  value={editingMemory.imageUrl}
                  onChange={(e) => setEditingMemory({ ...editingMemory, imageUrl: e.target.value })}
                />
                <Textarea
                  value={editingMemory.description}
                  onChange={(e) => setEditingMemory({ ...editingMemory, description: e.target.value })}
                />
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEditing}><X className="mr-1 h-4 w-4" /> {t.cancel}</Button>
                <Button size="sm" onClick={handleUpdateMemory}><Save className="mr-1 h-4 w-4" /> {t.save}</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card key={memory.id} className="flex flex-col">
                <CardHeader>
                    {memory.imageUrl ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                        <Image
                            src={memory.imageUrl}
                            alt={memory.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform hover:scale-105"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <ImageIcon className="h-10 w-10 text-white" />
                        </div>
                        </div>
                    ) : (
                        <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center mb-4">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                    )}
                    <CardTitle>{memory.title}</CardTitle>
                    <CardDescription>
                    {new Date(memory.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    </CardDescription>
                </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground whitespace-pre-wrap">{memory.description || t.noContent}</p>
              </CardContent>
              <CardFooter className="justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(memory)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
                      <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteMemory(memory.id)} className="bg-destructive hover:bg-destructive/90">{t.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          )
        ))}
      </div>
    </main>
  );
}
