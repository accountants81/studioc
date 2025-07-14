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
} from "@/components/ui/sidebar";
import { TimeFlowLogo } from "./logo";
import {
  LayoutDashboard,
  CalendarRange,
  Calendar,
  Repeat,
  Notebook,
  Mic,
} from "lucide-react";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/weekly", label: "مهام الأسبوع", icon: CalendarRange },
  { href: "/monthly", label: "مهام الشهر", icon: Calendar },
  { href: "/ongoing", label: "مهام مستمرة", icon: Repeat },
  { href: "/notes", label: "ملاحظات", icon: Notebook },
  { href: "/voice-memos", label: "مذكراتي الصوتية", icon: Mic },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <>
      <SidebarHeader>
        <TimeFlowLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={handleLinkClick} legacyBehavior={false}>
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
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
