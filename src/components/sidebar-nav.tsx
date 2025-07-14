"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TimeFlowLogo } from "./logo";
import {
  LayoutDashboard,
  CalendarRange,
  Calendar,
  Repeat,
  Notebook,
  Mic,
  PlusCircle,
  NotebookText,
  Trash2
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import React from "react";
import { Button } from "./ui/button";

const staticNavItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/weekly", label: "مهام الأسبوع", icon: CalendarRange },
  { href: "/monthly", label: "مهام الشهر", icon: Calendar },
  { href: "/ongoing", label: "مهام مستمرة", icon: Repeat },
  { href: "/notes", label: "ملاحظات", icon: Notebook },
  { href: "/voice-memos", label: "مذكراتي الصوتية", icon: Mic },
];

type CustomSection = {
  id: string;
  name: string;
};

export default function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [customSections, setCustomSections] = useLocalStorage<CustomSection[]>("timeflow-custom-sections", []);
  const [newSectionName, setNewSectionName] = React.useState("");

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: CustomSection = {
        id: crypto.randomUUID(),
        name: newSectionName.trim(),
      };
      setCustomSections([...customSections, newSection]);
      setNewSectionName("");
    }
  };
  
  const handleDeleteSection = (id: string) => {
    setCustomSections(customSections.filter(section => section.id !== id));
    // Also remove notes associated with this section
    localStorage.removeItem(`custom-section-notes-${id}`);
  }

  return (
    <>
      <SidebarHeader>
        <TimeFlowLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {staticNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                    className: "text-xs",
                  }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
           {customSections.map((section) => (
            <SidebarMenuItem key={section.id} className="group/item">
              <Link href={`/custom/${section.id}`} onClick={handleLinkClick}>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === `/custom/${section.id}`}
                  tooltip={{
                    children: section.name,
                    className: "text-xs",
                  }}
                >
                  <NotebookText />
                  <span>{section.name}</span>
                </SidebarMenuButton>
              </Link>
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="absolute right-1 top-1.5 h-6 w-6 opacity-0 group-hover/item:opacity-100">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>هل أنت متأكد من حذف قسم "{section.name}"؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم حذف هذا القسم وجميع الملاحظات الموجودة بداخله نهائيًا. لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSection(section.id)} className="bg-destructive hover:bg-destructive/90">
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    <span>إضافة قسم جديد</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>إضافة قسم جديد</AlertDialogTitle>
                <AlertDialogDescription>
                    أدخل اسمًا للقسم الجديد (مثل: أهدافي، مشاريع، أفكار).
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    placeholder="اسم القسم" 
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('add-section-confirm')?.click();
                      }
                    }}
                />
                <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction id="add-section-confirm" onClick={handleAddSection} disabled={!newSectionName.trim()}>إضافة</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </>
  );
}
