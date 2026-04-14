"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, Bug, AlertTriangle, CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const metrics = [
  { title: "Active Scans", value: "12", change: "+2 this week", icon: <Bug className="h-6 w-6" />, trend: "up" as const },
  { title: "Critical Issues", value: "3", change: "-1 since yesterday", icon: <AlertTriangle className="h-6 w-6" />, trend: "down" as const },
  { title: "Code Quality", value: "78%", change: "+5% average", icon: <CheckCircle className="h-6 w-6" />, trend: "up" as const },
  { title: "Bugs Blocked", value: "47", change: "+12 this month", icon: <TrendingUp className="h-6 w-6" />, trend: "up" as const },
];

const recentActivity = [
  { id: 1, message: "Scanned repository: ProductAPI", time: "2 hours ago", status: "completed" },
  { id: 2, message: "Critical bug found in authentication module", time: "4 hours ago", status: "critical" },
  { id: 3, message: "Scanned repository: WebApp", time: "1 day ago", status: "completed" },
  { id: 4, message: "Security vulnerability detected in dependencies", time: "2 days ago", status: "alert" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <Badge variant="secondary"><Sparkles className="w-3 h-3 mr-1" /> Live</Badge>
          </div>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your code analysis overview.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="stat-card bg-card/50 backdrop-blur border-border hover:border-primary/20 transition-all hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{m.title}</p>
                      <p className="text-3xl font-bold text-foreground mb-2">{m.value}</p>
                      <div className="flex items-center gap-1">
                        <ArrowUp className={`h-4 w-4 ${m.trend === "down" ? "rotate-180" : ""} ${m.trend === "up" ? "text-chart-2" : "text-destructive"}`} />
                        <span className={`text-xs font-medium ${m.trend === "up" ? "text-chart-2" : "text-destructive"}`}>{m.change}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-accent">{m.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest scans and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-accent/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
                      <div className="mt-1.5">
                        {a.status === "completed" && <div className="h-2.5 w-2.5 rounded-full bg-chart-2 ring-4 ring-chart-2/10" />}
                        {a.status === "critical" && <div className="h-2.5 w-2.5 rounded-full bg-destructive ring-4 ring-destructive/10 animate-pulse" />}
                        {a.status === "alert" && <div className="h-2.5 w-2.5 rounded-full bg-chart-3 ring-4 ring-chart-3/10" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{a.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Link href="/scan"><Button className="w-full justify-start bg-primary hover:bg-primary/90 mb-2"><Sparkles className="w-4 h-4 mr-2" />New Scan</Button></Link>
                <Link href="/pr-list"><Button className="w-full justify-start" variant="outline">View All PRs</Button></Link>
                <Link href="/developers"><Button className="w-full justify-start" variant="outline">Team Analytics</Button></Link>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader><CardTitle className="text-base">This Week</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Scans Completed</span>
                    <span className="font-semibold text-foreground">8/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div className="bg-primary h-2 rounded-full" initial={{ width: "0%" }} animate={{ width: "80%" }} transition={{ duration: 1, delay: 0.5 }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Issues Fixed</span>
                    <span className="font-semibold text-foreground">5/12</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div className="bg-chart-2 h-2 rounded-full" initial={{ width: "0%" }} animate={{ width: "42%" }} transition={{ duration: 1, delay: 0.7 }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
