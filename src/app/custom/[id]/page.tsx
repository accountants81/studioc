"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, X, Notebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type CustomSection = {
  id: string;
  name: string;
};

const translations = {
  ar: {
    pageTitle: "قسم مخصص",
    addNote: "إضافة تدوينة",
    newNoteTitle: "تدوينة جديدة",
    newNoteDesc: "اكتب عنوان ومحتوى التدوينة الجديدة.",
    noteTitlePlaceholder: "عنوان التدوينة",
    noteContentPlaceholder: "اكتب أفكارك هنا...",
    cancel: "إلغاء",
    saveNote: "حفظ التدوينة",
    noNotes: "لا يوجد شيء هنا بعد",
    noNotesDesc: "ابدأ بإضافة تدوينتك الأولى في هذا القسم.",
    save: "حفظ",
    deleteConfirm: "هل أنت متأكد؟",
    deleteDesc: "سيتم حذف هذه التدوينة نهائيًا.",
    delete: "حذف",
    noContent: "لا يوجد محتوى.",
  },
  en: {
    pageTitle: "Custom Section",
    addNote: "Add Note",
    newNoteTitle: "New Note",
    newNoteDesc: "Write the title and content for your new note.",
    noteTitlePlaceholder: "Note Title",
    noteContentPlaceholder: "Write your thoughts here...",
    cancel: "Cancel",
    saveNote: "Save Note",
    noNotes: "Nothing here yet",
    noNotesDesc: "Start by adding your first note in this section.",
    save: "Save",
    deleteConfirm: "Are you sure?",
    deleteDesc: "This note will be permanently deleted.",
    delete: "Delete",
    noContent: "No content.",
  },
};

export default function CustomSectionPage() {
  const params = useParams();
  const sectionId = params.id as string;
  
  // The key for localStorage is now dynamically generated based on the sectionId.
  // This is a placeholder for the setNotes function, as we'll get the real one from the hook.
  const [notes, setNotes] = useLocalStorage<Note[]>(`custom-section-notes-${sectionId}`, []);
  const [customSections] = useLocalStorage<CustomSection[]>("timeflow-custom-sections", []);
  
  const [sectionName, setSectionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  // We use a key for the main content to force a re-mount when the sectionId changes.
  // This ensures that the useLocalStorage hook is re-initialized with the new key.
  const [componentKey, setComponentKey] = useState(sectionId);

  useEffect(() => {
    setIsLoading(true);
    const currentSection = customSections.find(s => s.id === sectionId);
    if (currentSection) {
      setSectionName(currentSection.name);
    }
    // Change the key to force re-mounting of children components that depend on sectionId
    setComponentKey(sectionId); 
    setIsLoading(false);
  }, [sectionId, customSections]);


  if (isLoading) {
      return (
        <main className="container mx-auto py-4 sm:py-6 lg:py-8">
            <header className="flex items-center justify-between gap-4 mb-8">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-60 w-full rounded-lg" />
                <Skeleton className="h-60 w-full rounded-lg" />
                <Skeleton className="h-60 w-full rounded-lg" />
            </div>
        </main>
      )
  }

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={sectionName || t.pageTitle}>
        <CustomSectionContent key={componentKey} sectionId={sectionId} />
      </PageHeader>
    </main>
  );
}

// We move the logic that depends on the dynamic localStorage key to a child component.
function CustomSectionContent({ sectionId }: { sectionId: string }) {
  const [notes, setNotes] = useLocalStorage<Note[]>(`custom-section-notes-${sectionId}`, []);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

   const handleSaveNote = () => {
    if (!newNoteTitle.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsCreating(false);
  };
  
  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.title.trim()) return;
    setNotes(notes.map(note => note.id === editingNote.id ? editingNote : note));
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEditing = (note: Note) => {
    setEditingNote({ ...note });
  };
  
  const cancelEditing = () => {
    setEditingNote(null);
  };

  const cancelCreation = () => {
    setIsCreating(false);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  return (
    <>
        <div className="w-full">
            <div className="flex justify-end mb-8">
                 {!isCreating && !editingNote && (
                    <Button onClick={() => setIsCreating(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>{t.addNote}</span>
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="mb-8 bg-card/80 border-primary/50 transition-shadow hover:shadow-lg">
                <CardHeader>
                    <CardTitle>{t.newNoteTitle}</CardTitle>
                    <CardDescription>{t.newNoteDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                    placeholder={t.noteTitlePlaceholder}
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="text-lg font-semibold"
                    />
                    <Textarea
                    placeholder={t.noteContentPlaceholder}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[200px]"
                    />
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={cancelCreation}>
                    <X className="mr-2 h-4 w-4" />
                    {t.cancel}
                    </Button>
                    <Button onClick={handleSaveNote}>
                    <Save className="mr-2 h-4 w-4" />
                    {t.saveNote}
                    </Button>
                </CardFooter>
                </Card>
            )}

            {notes.length === 0 && !isCreating && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Notebook className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{t.noNotes}</h3>
                    <p className="text-muted-foreground mt-2">{t.noNotesDesc}</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                editingNote?.id === note.id ? (
                    <Card key={note.id} className="bg-card/80 border-primary/50 transition-shadow hover:shadow-lg">
                        <CardHeader>
                            <Input
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                            className="text-lg font-semibold"
                            />
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={editingNote.content}
                                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                className="min-h-[150px]"
                            />
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={cancelEditing}>
                                <X className="mr-1 h-4 w-4" /> {t.cancel}
                            </Button>
                            <Button size="sm" onClick={handleUpdateNote}>
                                <Save className="mr-1 h-4 w-4" /> {t.save}
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card key={note.id} className="flex flex-col transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <CardTitle>{note.title}</CardTitle>
                        <CardDescription>
                        {new Date(note.createdAt).toLocaleDateString(lang === 'ar' ? "ar-EG" : "en-US", {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground whitespace-pre-wrap">{note.content || t.noContent}</p>
                    </CardContent>
                    <CardFooter className="justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditing(note)}>
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
                            <AlertDialogDescription>
                                {t.deleteDesc}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">
                                {t.delete}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                    </Card>
                )
                ))}
            </div>
      </div>
    </>
  );
}
