
"use client";

import { usePathname, useRouter } from "next/navigation";
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
  Trash2,
  Languages,
  Shield,
  Trophy,
  Target,
  LineChart,
  Bot,
  Cloud,
  Lightbulb,
  Camera,
  Moon,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Input } from "./ui/input";
import React from "react";
import { Button } from "./ui/button";
import { DigitalClock } from "./digital-clock";

const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    weekly: "مهام الأسبوع",
    monthly: "مهام الشهر",
    ongoing: "مهام مستمرة",
    analytics: "التحليلات",
    notes: "ملاحظاتي",
    voiceMemos: "مذكراتي الصوتية",
    aiAssistant: "المساعد الذكي",
    challenges: "التحديات",
    goals: "الأهداف",
    dreams: "أحلامي",
    ideas: "أفكاري المجنونة",
    vault: "الخزنة الخاصة",
    memories: "الذكريات",
    prayers: "العبادات اليومية",
    addSection: "إضافة قسم جديد",
    deleteSectionTitle: 'هل أنت متأكد من حذف قسم "{sectionName}"؟',
    deleteSectionDesc: "سيتم حذف هذا القسم وجميع الملاحظات الموجودة بداخله نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    delete: "حذف",
    addSectionTitle: "إضافة قسم جديد",
    addSectionDesc: "أدخل اسمًا للقسم الجديد (مثل: أهدافي، مشاريع، أفكار).",
    sectionNamePlaceholder: "اسم القسم",
    add: "إضافة",
    changeLang: "Change Language",
    customSections: "أقسامي الخاصة",
    tasks: "المهام",
    personal: "شخصي",
    growth: "النمو والإلهام",
    worship: "العبادات والتزكية"
  },
  en: {
    dashboard: "Dashboard",
    weekly: "Weekly Tasks",
    monthly: "Monthly Tasks",
    ongoing: "Ongoing Tasks",
    analytics: "Analytics",
    notes: "My Notes",
    voiceMemos: "Voice Memos",
    aiAssistant: "AI Assistant",
    challenges: "Challenges",
    goals: "Goals",
    dreams: "My Dreams",
    crazyIdeas: "Crazy Ideas",
    vault: "Private Vault",
    memories: "Memories",
    prayers: "Daily Worship",
    addSection: "Add New Section",
    deleteSectionTitle: 'Are you sure you want to delete "{sectionName}"?',
    deleteSectionDesc: "This section and all its notes will be permanently deleted. This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    addSectionTitle: "Add New Section",
    addSectionDesc: "Enter a name for the new section (e.g., My Goals, Projects, Ideas).",
    sectionNamePlaceholder: "Section Name",
    add: "Add",
    changeLang: "تغيير اللغة",
    customSections: "My Sections",
    tasks: "Tasks",
    personal: "Personal",
    growth: "Growth & Inspiration",
    worship: "Worship & Purity"
  },
};

type CustomSection = {
  id: string;
  name: string;
};

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [customSections, setCustomSections] = useLocalStorage<CustomSection[]>("timeflow-custom-sections", []);
  const [newSectionName, setNewSectionName] = React.useState("");
  const [lang, setLang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');

  const t = translations[lang];

  const mainNavItems = [
    { href: "/", label: t.dashboard, icon: LayoutDashboard },
    { href: "/analytics", label: t.analytics, icon: LineChart },
  ];
  
  const taskNavItems = [
    { href: "/weekly", label: t.weekly, icon: CalendarRange },
    { href: "/monthly", label: t.monthly, icon: Calendar },
    { href: "/ongoing", label: t.ongoing, icon: Repeat },
  ];

  const worshipNavItems = [
      { href: "/prayers", label: t.prayers, icon: Moon },
  ];

  const personalNavItems = [
      { href: "/notes", label: t.notes, icon: Notebook },
      { href: "/voice-memos", label: t.voiceMemos, icon: Mic },
      { href: "/memories", label: t.memories, icon: Camera },
      { href: "/vault", label: t.vault, icon: Shield },
  ];
  
  const growthNavItems = [
      { href: "/challenges", label: t.challenges, icon: Trophy },
      { href: "/goals", label: t.goals, icon: Target },
      { href: "/dreams", label: t.dreams, icon: Cloud },
      { href: "/ideas", label: t.ideas, icon: Lightbulb },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: CustomSection = {
        id: crypto.randomUUID(),
        name: newSectionName.trim(),
      };
      const updatedSections = [...customSections, newSection];
      setCustomSections(updatedSections);
      router.push(`/custom/${newSection.id}`);
      handleLinkClick();
      setNewSectionName("");
    }
  };
  
  const handleDeleteSection = (id: string) => {
    setCustomSections(customSections.filter(section => section.id !== id));
    localStorage.removeItem(`custom-section-notes-${id}`);
    if (pathname === `/custom/${id}`) {
        router.push('/');
    }
  }

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    if (typeof window !== 'undefined') {
        document.documentElement.lang = newLang;
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const renderNavSection = (items: {href: string, label: string, icon: React.ElementType}[]) => (
      items.map((item) => (
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
          ))
  );

  return (
    <>
      <SidebarHeader>
        <TimeFlowLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {renderNavSection(mainNavItems)}
          <SidebarMenuItem className="px-2 pt-2 text-xs font-semibold text-muted-foreground tracking-wider">{t.tasks}</SidebarMenuItem>
          {renderNavSection(taskNavItems)}
          <SidebarMenuItem className="px-2 pt-2 text-xs font-semibold text-muted-foreground tracking-wider">{t.worship}</SidebarMenuItem>
          {renderNavSection(worshipNavItems)}
          <SidebarMenuItem className="px-2 pt-2 text-xs font-semibold text-muted-foreground tracking-wider">{t.personal}</SidebarMenuItem>
          {renderNavSection(personalNavItems)}
          <SidebarMenuItem className="px-2 pt-2 text-xs font-semibold text-muted-foreground tracking-wider">{t.growth}</SidebarMenuItem>
          {renderNavSection(growthNavItems)}

          {customSections.length > 0 && (
             <SidebarMenuItem className="px-2 pt-2 text-xs font-semibold text-muted-foreground tracking-wider">{t.customSections}</SidebarMenuItem>
          )}
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
                     <Button variant="ghost" size="icon" className="absolute right-1 rtl:right-auto rtl:left-1 top-1.5 h-6 w-6 opacity-0 group-hover/item:opacity-100">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.deleteSectionTitle.replace('{sectionName}', section.name)}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t.deleteSectionDesc}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSection(section.id)} className="bg-destructive hover:bg-destructive/90">
                        {t.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex-col !items-start gap-1">
        <DigitalClock />
         <Button variant="ghost" className="w-full justify-start" onClick={toggleLanguage}>
            <Languages className="mr-2 h-4 w-4" />
            <span>{t.changeLang}</span>
        </Button>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>{t.addSection}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t.addSectionTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                   {t.addSectionDesc}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    placeholder={t.sectionNamePlaceholder}
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        (document.getElementById('add-section-confirm') as HTMLButtonElement)?.click();
                      }
                    }}
                />
                <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction id="add-section-confirm" onClick={handleAddSection} disabled={!newSectionName.trim()}>{t.add}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </>
  );
}
