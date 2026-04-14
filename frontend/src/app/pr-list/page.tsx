"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitPullRequest,
  MessageSquare,
  Check,
  AlertCircle,
  Clock,
  Search,
} from "lucide-react";

interface PR {
  id: number;
  title: string;
  author: string;
  status: "open" | "approved" | "changes-requested" | "merged";
  issues: number;
  reviews: number;
  createdAt: string;
}

const PRs: PR[] = [
  { id: 1, title: "feat: Add user authentication flow", author: "John Developer", status: "open", issues: 3, reviews: 2, createdAt: "2 hours ago" },
  { id: 2, title: "fix: Resolve memory leak in WebSocket handler", author: "Jane Smith", status: "approved", issues: 1, reviews: 3, createdAt: "5 hours ago" },
  { id: 3, title: "refactor: Optimize database queries", author: "Bob Wilson", status: "changes-requested", issues: 5, reviews: 2, createdAt: "1 day ago" },
  { id: 4, title: "docs: Update API documentation", author: "Alice Johnson", status: "merged", issues: 0, reviews: 1, createdAt: "2 days ago" },
  { id: 5, title: "feat: Add dark mode support", author: "John Developer", status: "open", issues: 2, reviews: 1, createdAt: "3 days ago" },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "open": return "bg-blue-50 text-blue-600 border-blue-200";
    case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "changes-requested": return "bg-amber-50 text-amber-600 border-amber-200";
    case "merged": return "bg-purple-50 text-purple-600 border-purple-200";
    default: return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open": return <Clock className="h-3.5 w-3.5" />;
    case "approved": return <Check className="h-3.5 w-3.5" />;
    case "changes-requested": return <AlertCircle className="h-3.5 w-3.5" />;
    case "merged": return <GitPullRequest className="h-3.5 w-3.5" />;
    default: return null;
  }
};

const getStatusLabel = (status: string) => {
  return status.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PRListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredPRs = PRs.filter((pr) => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) || pr.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || pr.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Pull Requests
          </h1>
          <p className="text-slate-500">
            Review and manage code review processes
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "All", value: null },
                    { label: "Open", value: "open" },
                    { label: "Approved", value: "approved" },
                    { label: "Changes Requested", value: "changes-requested" },
                    { label: "Merged", value: "merged" },
                  ].map((filter) => (
                    <Button
                      key={filter.label}
                      variant={filterStatus === filter.value ? "default" : "outline"}
                      onClick={() => setFilterStatus(filter.value)}
                      size="sm"
                      className={`rounded-lg transition-all duration-200 ${
                        filterStatus === filter.value
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shadow-sm"
                          : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                      }`}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PR List */}
        <div className="space-y-3">
          {filteredPRs.length > 0 ? (
            filteredPRs.map((pr, index) => (
              <motion.div
                key={pr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="hover:border-indigo-200/60 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 group">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <GitPullRequest className="h-5 w-5 text-indigo-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                              {pr.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>by <span className="text-slate-600">{pr.author}</span></span>
                              <span>{pr.createdAt}</span>
                              <span className="text-slate-300">#{pr.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-1.5 text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{pr.issues}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-500">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm font-medium">{pr.reviews}</span>
                        </div>
                        <Badge className={`${getStatusStyles(pr.status)} border`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(pr.status)}
                            {getStatusLabel(pr.status)}
                          </span>
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <GitPullRequest className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pull requests found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
