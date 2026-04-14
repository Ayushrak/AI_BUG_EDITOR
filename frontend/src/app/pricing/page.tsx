"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic code review.",
    features: [
      "1,000 lines per scan",
      "Basic bug detection",
      "Syntax analysis",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
    gradient: "",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Full AI review for individual developers.",
    features: [
      "Unlimited code scans",
      "AI edge case detection",
      "Business logic validation",
      "Security scanner",
      "GitHub integration",
      "AI Chat with code",
      "Priority email support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
    badge: "Most Popular",
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams that ship fast and safe.",
    features: [
      "Everything in Pro",
      "Team analytics dashboard",
      "CI/CD integration",
      "Architecture validation",
      "Multi-agent review",
      "Priority support",
      "SSO",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlight: false,
    gradient: "",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 animated-gradient-bg">
      <AppHeader />

      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Floating orbs */}
        <div className="floating-orb w-72 h-72 bg-indigo-200 -top-10 -right-20" />
        <div className="floating-orb w-56 h-56 bg-purple-200 bottom-20 -left-20" style={{ animationDelay: "3s" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <Badge className="mb-4 bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-1.5">
            💰 Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Plans that <span className="gradient-text">scale with you</span>
          </h1>
          <p className="text-lg text-slate-500 mb-4">
            No surprise fees. Cancel anytime. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 relative z-10"
        >
          {PLANS.map((plan, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card
                className={`h-full transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlight
                    ? "border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 md:scale-105"
                    : "hover:shadow-lg hover:shadow-indigo-500/5"
                }`}
              >
                <CardHeader>
                  {plan.badge && (
                    <Badge className="w-fit mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-400">{plan.period}</span>
                    </div>
                  </div>

                  <Link href="/signup" className="block">
                    <Button
                      className={`w-full rounded-xl py-5 transition-all duration-300 ${
                        plan.highlight
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30"
                          : ""
                      }`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Do you offer annual discounts?",
                a: "Yes! Contact our sales team and we can discuss annual billing options with discounts.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
              },
              {
                q: "Is there a free trial?",
                a: "All paid plans include a 14-day free trial. No credit card required to start.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 transition-colors"
              >
                <h3 className="font-semibold mb-2 text-slate-900">{item.q}</h3>
                <p className="text-slate-500 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">
            Ready to <span className="gradient-text">get started</span>?
          </h2>
          <Link href="/signup">
            <Button size="lg" className="gap-2 rounded-xl px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02]">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
