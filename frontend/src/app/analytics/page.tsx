"use client";

import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { getAnalyticsOverview } from "@/lib/api";
import type { AnalyticsOverview } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Bug, AlertTriangle, GitPullRequest, BarChart3 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setData(await getAnalyticsOverview());
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const metrics = data?.metrics;

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Team Analytics
          </h1>
          <p className="text-slate-500">
            Overview of your team&apos;s code quality metrics and trends
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Code Quality Score", value: `${metrics?.codeQualityScore ?? 0}%`, change: "live", changeColor: "text-emerald-500", icon: <BarChart3 className="h-6 w-6" />, bg: "bg-blue-50" },
            { title: "Bugs Detected", value: `${metrics?.bugsDetected ?? 0}`, change: "live", changeColor: "text-emerald-500", icon: <Bug className="h-6 w-6" />, bg: "bg-red-50" },
            { title: "Security Issues", value: `${metrics?.securityIssues ?? 0}`, change: "live", changeColor: "text-amber-500", icon: <AlertTriangle className="h-6 w-6" />, bg: "bg-orange-50" },
            { title: "Code Scans", value: `${metrics?.codeScans ?? 0}`, change: "live", changeColor: "text-emerald-500", icon: <GitPullRequest className="h-6 w-6" />, bg: "bg-emerald-50" },
          ].map((metric, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="stat-card hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">{metric.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                      <p className={`text-xs mt-2 font-medium ${metric.changeColor}`}>{metric.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${metric.bg}`}>
                      {metric.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Score Trend</CardTitle>
                <CardDescription>Your team&apos;s code quality over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2">
                  {(data?.qualityTrend.map((p) => p.qualityScore) ?? [65, 68, 70, 72, 71, 73, 75, 76, 77, 78]).map((score, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 space-y-2"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <motion.div
                        className="bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg w-full transition-all hover:from-indigo-600 hover:to-purple-500 cursor-pointer group relative"
                        style={{ height: `${(score / 100) * 80}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        whileHover={{ scaleY: 1.05 }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {score}%
                        </div>
                      </motion.div>
                      {i % 2 === 0 && (
                        <div className="text-xs text-center text-slate-400">
                          Day {i + 1}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Issue Breakdown */}
          <motion.div variants={fadeUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Breakdown</CardTitle>
                <CardDescription>By severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {(data?.issueBreakdown ?? [
                    { label: "Critical", count: 8, pct: 15 },
                    { label: "High", count: 45, pct: 42 },
                    { label: "Medium", count: 89, pct: 65 },
                    { label: "Low", count: 205, pct: 100 },
                  ]).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <Badge variant={i === 0 ? "destructive" : i === 2 ? "secondary" : "default"}>{item.count}</Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className={`${i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-amber-500" : "bg-blue-500"} h-2 rounded-full`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Team Performance */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Performance</CardTitle>
              <CardDescription>Code quality by team member (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {(data?.teamPerformance ?? [
                  { name: "John Developer", score: 92, scans: 156 },
                  { name: "Jane Smith", score: 85, scans: 132 },
                  { name: "Bob Wilson", score: 78, scans: 98 },
                  { name: "Alice Johnson", score: 89, scans: 164 },
                  { name: "Charlie Brown", score: 71, scans: 87 },
                ]).map((member, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between group hover:bg-slate-50/50 -mx-2 px-2 py-2 rounded-xl transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-400">{member.scans} scans</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${member.score}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.15 }}
                        />
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <p className="font-bold text-lg text-slate-900">{member.score}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      {loading && <div className="text-sm text-muted-foreground">Loading analytics...</div>}
    </AppLayout>
  );
}
