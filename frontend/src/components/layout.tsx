"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/app-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <AppHeader />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:ml-64">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
