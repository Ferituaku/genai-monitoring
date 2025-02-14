// app/admin/layout.tsx (Admin Layout)
"use client";
import NavBar from "@/components/NavBar/NavBar";
import Sidebar from "@/components/Sidebar/AppSidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar onSidebarToggle={setSidebarOpen} defaultOpen={true} />
        <div className="flex flex-col flex-1">
          <NavBar />
          <main
            className={cn(
              "flex-1 p-4 transition-all duration-300 overflow-y-auto",
              "lg:ml-2",
              isSidebarOpen ? "ml-60" : "ml-20"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
