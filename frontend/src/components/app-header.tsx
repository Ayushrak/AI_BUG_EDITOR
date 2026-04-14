"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="bg-primary p-1.5 rounded-lg group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              CodeGuardian
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              AI
            </Badge>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
          {user && (
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                  Start Free <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
