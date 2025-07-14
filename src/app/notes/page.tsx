"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, X, Notebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const translations = {
  ar: {
    pageTitle: "ملاحظاتي",
    addNote: "إضافة ملاحظة",
    newNoteTitle: "ملاحظة جديدة",
    newNoteDesc: "اكتب عنوان ومحتوى ملاحظتك الجديدة.",
    noteTitlePlaceholder: "عنوان الملاحظة",
    noteContentPlaceholder: "اكتب أفكارك هنا...",
    cancel: "إلغاء",
    saveNote: "حفظ الملاحظة",
    noNotes: "لا توجد ملاحظات بعد",
    noNotesDesc: "ابدأ بإضافة ملاحظتك الأولى.",
    save: "حفظ",
    deleteConfirm: "هل أنت متأكد؟",
    deleteDesc: "سيتم حذف هذه الملاحظة نهائيًا.",
    delete: "حذف",
    noContent: "لا يوجد محتوى.",
  },
  en: {
    pageTitle: "My Notes",
    addNote: "Add Note",
    newNoteTitle: "New Note",
    newNoteDesc: "Write the title and content for your new note.",
    noteTitlePlaceholder: "Note Title",
    noteContentPlaceholder: "Write your thoughts here...",
    cancel: "Cancel",
    saveNote: "Save Note",
    noNotes: "No notes yet",
    noNotesDesc: "Start by adding your first note.",
    save: "Save",
    deleteConfirm: "Are you sure?",
    deleteDesc: "This note will be permanently deleted.",
    delete: "Delete",
    noContent: "No content.",
  },
};

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("timeflow-notes-v2", []);
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
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle}>
        {!isCreating && !editingNote && (
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{t.addNote}</span>
          </Button>
        )}
      </PageHeader>

      {isCreating && (
        <Card className="mb-8 bg-card/80 border-primary/50">
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
            <Card key={note.id} className="bg-card/80 border-primary/50">
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
            <Card key={note.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  {new Date(note.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
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
    </main>
  );
}
