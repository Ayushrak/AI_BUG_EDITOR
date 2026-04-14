"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { login as loginAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Eye, EyeOff, ArrowRight } from "lucide-react";


interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await loginAPI({ email: formData.email, password: formData.password });
      login(response.token, response.user);
      router.push("/scan");
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "An error occurred during login" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-96 h-96 bg-primary/40 -top-1/4 -right-1/4" />
        <div className="floating-orb w-80 h-80 bg-chart-5/30 -bottom-1/4 -left-1/4" style={{ animationDelay: "3s" }} />
      </div>
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity group">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">CodeGuardian</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue analyzing code.</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="card mb-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                <p className="text-destructive font-medium text-sm flex items-center gap-2"><span>⚠️</span>{errors.general}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
              <input type="email" name="email" placeholder="jane@company.com" value={formData.email} onChange={handleInputChange} disabled={loading}
                className={`input-field ${errors.email ? "border-destructive/50 bg-destructive/5" : ""}`} />
              {errors.email && <p className="text-destructive text-sm mt-2">× {errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} disabled={loading}
                  className={`input-field pr-11 ${errors.password ? "border-destructive/50 bg-destructive/5" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-2">× {errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (<><span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>) : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 bg-card text-muted-foreground">or continue with</span></div>
            </div>

            <button type="button" disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg border border-border hover:border-primary/30 text-foreground hover:bg-accent transition-all flex items-center justify-center gap-3 font-medium disabled:opacity-50">
              <ShieldAlert className="w-5 h-5" /> Continue with GitHub
            </button>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">Sign up free</Link>
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-3">🔒 Secured with enterprise-grade encryption</p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><span className="text-chart-2">✓</span> ISO 27001</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><span className="text-chart-2">✓</span> SOC 2 Type II</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1"><span className="text-chart-2">✓</span> GDPR</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
