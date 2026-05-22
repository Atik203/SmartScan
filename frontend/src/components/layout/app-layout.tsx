"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";

export function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
