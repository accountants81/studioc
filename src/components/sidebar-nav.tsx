"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { MomentumFlowLogo } from "./logo";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Repeat,
  Notebook,
} from "lucide-react";

const navItems = [
  { href: "/", label: "المهام اليومية", icon: CalendarDays },
  { href: "/weekly", label: "المهام الأسبوعية", icon: CalendarRange },
  { href: "/monthly", label: "المهام الشهرية", icon: Calendar },
  { href: "/ongoing", label: "المهام المستمرة", icon: Repeat },
  { href: "/notes", label: "مهام عامة", icon: Notebook },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <MomentumFlowLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{
                    children: item.label,
                    className: "text-xs",
                  }}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
