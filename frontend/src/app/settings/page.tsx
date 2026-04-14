"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Key, Bell, Moon, Trash2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = React.useState({
    email: user?.email || "",
    name: user?.name || "",
    apiKey: "sk-***",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Settings</h1>
          <p className="text-slate-500">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Settings */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/10 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled
                  className="border-slate-200 rounded-xl opacity-60"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-sm shadow-indigo-500/20">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" />
                <CardTitle className="text-lg">API Keys</CardTitle>
              </div>
              <CardDescription>
                Manage your API keys for integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">Production API Key</p>
                  <p className="text-sm text-slate-400 font-mono mt-1">
                    {formData.apiKey}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg border-slate-200">
                    Reveal
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg border-slate-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <Bell className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive alerts for critical issues</p>
                  </div>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Moon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Dark Mode</p>
                    <p className="text-sm text-slate-500">Automatic based on system settings</p>
                  </div>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeUp}>
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <CardTitle className="text-red-900 text-lg">Danger Zone</CardTitle>
              </div>
              <CardDescription className="text-red-600">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="rounded-xl">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
