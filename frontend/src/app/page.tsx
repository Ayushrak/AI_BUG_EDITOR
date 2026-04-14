"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert, Bug, Zap, Layers, MessageSquare, ScanLine,
  ArrowRight, Star, Sparkles, Code2, Lock, BarChart3,
} from "lucide-react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } } as const;
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } } as const;
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5 } } } as const;

const FEATURES = [
  { icon: ShieldAlert, title: "Security Scanning", desc: "Detect SQL injection, XSS, hardcoded secrets, and 50+ vulnerability patterns.", color: "text-chart-4" },
  { icon: Bug, title: "AI Bug Detection", desc: "Unhandled errors, null references, race conditions caught automatically.", color: "text-chart-3" },
  { icon: Zap, title: "Performance Analysis", desc: "O(n²) loops, blocking I/O, memory leaks identified with optimization tips.", color: "text-chart-3" },
  { icon: Layers, title: "Architecture Review", desc: "SOLID violations, god functions, tight coupling and anti-patterns flagged.", color: "text-chart-1" },
  { icon: MessageSquare, title: "AI Code Chat", desc: "Ask about any code in plain English. Get explanations and refactoring suggestions.", color: "text-chart-5" },
  { icon: ScanLine, title: "Instant Code Scan", desc: "Paste or upload any file — get comprehensive analysis in seconds.", color: "text-chart-2" },
];

const STATS = [
  { value: "4.2M+", label: "Lines analyzed", icon: Code2 },
  { value: "98K+", label: "Bugs caught", icon: Bug },
  { value: "12.4K+", label: "Security issues", icon: Lock },
  { value: "99.7%", label: "Uptime SLA", icon: BarChart3 },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "show" : "hidden"} variants={container} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="floating-orb w-96 h-96 bg-primary/50 top-10 -right-20" />
        <div className="floating-orb w-72 h-72 bg-chart-5/40 -bottom-10 -left-20" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-Powered Code Review Platform
            </Badge>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
            Catch bugs before<br />they cost you <span className="gradient-text">millions</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop reviewing code line-by-line. CodeGuardian&apos;s multi-agent AI finds security issues, performance problems, and logic errors your team will miss.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8 py-6 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:scale-[1.02]">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base border-border hover:border-primary/30 hover:bg-accent transition-all">
                Try Instant Scan
              </Button>
            </Link>
          </motion.div>

          {/* Code preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 max-w-3xl mx-auto">
            <div className="code-block p-6 text-left animate-float">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-chart-4" />
                <div className="w-3 h-3 rounded-full bg-chart-3" />
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">analysis-report.ts</span>
              </div>
              <pre className="text-sm font-mono leading-relaxed">
                <code>
                  <span className="text-primary">const</span> <span className="text-chart-2">report</span> = <span className="text-primary">await</span> <span className="text-chart-3">codeguardian</span>.scan({"{\n"}
                  {"  "}<span className="text-chart-2">code</span>: userInput,{"\n"}
                  {"  "}<span className="text-chart-2">agents</span>: [<span className="text-chart-3">&apos;security&apos;</span>, <span className="text-chart-3">&apos;bugs&apos;</span>, <span className="text-chart-3">&apos;performance&apos;</span>],{"\n"}
                  {"}"});{"\n\n"}
                  <span className="text-muted-foreground">{"// ✅ 3 critical issues found"}</span>{"\n"}
                  <span className="text-muted-foreground">{"// ✅ 2 performance suggestions"}</span>{"\n"}
                  <span className="text-muted-foreground">{"// ✅ Quality Score: 87/100"}</span>
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <AnimatedSection className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="stat-card text-center p-8 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <AnimatedSection className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything you need to <span className="gradient-text">ship safe code</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our multi-agent AI system analyzes your code with 5 specialized agents working in parallel.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="h-full bg-card/50 backdrop-blur border-border hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <AnimatedSection className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Three steps to safer code</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload or Paste", desc: "Drop your code files or paste directly into the editor. Supports 20+ languages.", icon: "📄" },
              { step: "02", title: "AI Analyzes", desc: "5 specialized agents scan for security, bugs, performance, architecture, and logic issues.", icon: "🤖" },
              { step: "03", title: "Get Results", desc: "Receive detailed findings with severity ratings, line-by-line explanations, and fix suggestions.", icon: "✅" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative">
                <div className="text-center p-8 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-primary mb-2 tracking-widest uppercase">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"><ArrowRight className="w-5 h-5 text-primary/40" /></div>}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <AnimatedSection className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Loved by <span className="gradient-text-warm">engineering teams</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Chen", role: "Staff Engineer @ Stripe", text: "CodeGuardian caught a critical SQL injection in our payments API. Worth every penny.", avatar: "SC" },
              { name: "Marcus Webb", role: "CTO @ Finflow", text: "We cut our post-deploy bug rate by 60% in the first month. The AI agents are incredibly thorough.", avatar: "MW" },
              { name: "Priya Nair", role: "Lead Dev @ Shopstack", text: "The business requirements validation is a game changer. No other tool does this.", avatar: "PN" },
            ].map((t, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className="h-full bg-card/50 backdrop-blur border-border hover:border-primary/20 transition-all hover:-translate-y-1">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-chart-3 text-chart-3" />))}</div>
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{t.avatar}</div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-3xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-accent/50 rounded-3xl -m-8" />
            <div className="relative z-10 py-16 px-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to ship <span className="gradient-text">safer code</span>?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Join hundreds of teams catching bugs before production.</p>
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-8 py-6 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]">
                  Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-primary-foreground" /></div>
            <span className="font-bold text-foreground">CodeGuardian</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 CodeGuardian. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
