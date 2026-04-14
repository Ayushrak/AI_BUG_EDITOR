"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bug,
  GitPullRequest,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardCheck,
  ScanLine,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Code Scan", href: "/scan", icon: <ScanLine className="h-5 w-5" /> },
  { name: "Pull Requests", href: "/pr-list", icon: <GitPullRequest className="h-5 w-5" />, badge: "3" },
  { name: "Bug Registry", href: "/bugs", icon: <Bug className="h-5 w-5" /> },
  { name: "Developers", href: "/developers", icon: <Users className="h-5 w-5" /> },
  { name: "Review Log", href: "/reviews", icon: <ClipboardCheck className="h-5 w-5" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card border-border"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Bug className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">CodeGuardian</h1>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium group",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <span className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-destructive rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 text-primary/60" />}
                    </button>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-border px-4 py-4">
            <div className="mb-4 p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2 border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
