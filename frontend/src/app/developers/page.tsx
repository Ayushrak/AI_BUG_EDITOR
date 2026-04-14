"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDeveloper, listDevelopers } from "@/lib/api";
import type { Developer, DeveloperRole } from "@/lib/types";
import { Users, Plus, TrendingUp, TrendingDown, ChevronRight, Search } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "lead": return "bg-primary/20 text-primary border-primary/30";
    case "senior": return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    case "mid": return "bg-chart-5/20 text-chart-5 border-chart-5/30";
    case "junior": return "bg-chart-3/20 text-chart-3 border-chart-3/30";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function DeveloperListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "mid" as DeveloperRole,
  });

  const refreshDevelopers = async () => {
    try {
      setLoading(true);
      const data = await listDevelopers();
      setDevelopers(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDevelopers();
  }, []);

  const filteredDevs = useMemo(
    () =>
      developers.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.role.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [developers, searchTerm],
  );

  const handleAddDeveloper = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      await createDeveloper(form);
      setForm({ name: "", email: "", role: "mid" });
      setIsAdding(false);
      await refreshDevelopers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add developer");
    }
  };

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" /> Team Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Code quality metrics and growth trends per developer.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAdding((v) => !v)}>
            <Plus className="w-4 h-4 mr-2" /> Add Developer
          </Button>
        </motion.div>
        {isAdding && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-border rounded-lg bg-card/40">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as DeveloperRole }))}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
            <Button onClick={handleAddDeveloper}>Save</Button>
          </motion.div>
        )}

        {/* Search */}
        <motion.div variants={fadeUp}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search developers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary"
            />
          </div>
        </motion.div>

        {/* Developer Cards */}
        {error && (
          <div className="text-sm text-destructive border border-destructive/30 rounded-lg px-4 py-3">{error}</div>
        )}
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading developers...</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevs.map((dev) => (
            <motion.div key={dev.id} variants={fadeUp}>
              <Link href={`/developers/${dev.id}`}>
                <Card className="bg-card/50 backdrop-blur border-border hover:border-primary/30 transition-all cursor-pointer group h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold text-sm">
                          {dev.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{dev.name}</h3>
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wider px-1.5 py-0 h-4 ${getRoleBadgeColor(dev.role)}`}>
                            {dev.role}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Avg Quality</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-foreground">{dev.avgQualityScore.toFixed(1)}</span>
                          {dev.avgQualityScore > 7 ? <TrendingUp className="w-4 h-4 text-chart-2" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">PRs Reviewed</p>
                        <span className="text-lg font-bold text-foreground">{dev.totalPrs}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Bugs Fixed</p>
                        <span className="text-lg font-bold text-chart-2">{dev.bugsFixed}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Bugs Intro</p>
                        <span className="text-lg font-bold text-destructive">{dev.bugsIntroduced}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        )}

        {filteredDevs.length === 0 && (
          <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-lg">
            No developers found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
