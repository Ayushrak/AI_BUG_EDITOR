"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signup as signupAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Eye, EyeOff, ArrowRight } from "lucide-react";


interface FormErrors { name?: string; email?: string; password?: string; confirmPassword?: string; general?: string; }

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!acceptedTerms) newErrors.general = "You must accept the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await signupAPI({ name: formData.name, email: formData.email, password: formData.password });
      login(response.token, response.user);
      router.push("/scan");
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "An error occurred during signup" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const passwordStrength = () => {
    const pwd = formData.password;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const sColors = ["bg-destructive", "bg-chart-3", "bg-chart-3", "bg-chart-2"];
  const sLabels = ["Weak", "Fair", "Good", "✓ Strong"];
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb w-80 h-80 bg-chart-5/30 -top-1/4 -left-1/4" />
        <div className="floating-orb w-96 h-96 bg-primary/40 -bottom-1/4 -right-1/4" style={{ animationDelay: "3s" }} />
      </div>
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity group">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <ShieldAlert className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">CodeGuardian</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight">Create account</h1>
          <p className="text-muted-foreground">Join thousands of developers using CodeGuardian.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card mb-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg border border-destructive/30 bg-destructive/10">
                <p className="text-destructive font-medium text-sm">⚠️ {errors.general}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Full name</label>
              <input type="text" name="name" placeholder="Jane Developer" value={formData.name} onChange={handleInputChange} disabled={loading}
                className={`input-field ${errors.name ? "border-destructive/50" : ""}`} />
              {errors.name && <p className="text-destructive text-sm mt-2">× {errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
              <input type="email" name="email" placeholder="jane@company.com" value={formData.email} onChange={handleInputChange} disabled={loading}
                className={`input-field ${errors.email ? "border-destructive/50" : ""}`} />
              {errors.email && <p className="text-destructive text-sm mt-2">× {errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleInputChange} disabled={loading}
                  className={`input-field pr-11 ${errors.password ? "border-destructive/50" : ""}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
                    {[0, 1, 2, 3].map((i) => (<div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < strength ? sColors[strength - 1] : "bg-muted"}`} />))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{strength > 0 ? sLabels[strength - 1] : "Too short"} password</p>
                </div>
              )}
              {errors.password && <p className="text-destructive text-sm mt-2">× {errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Confirm password</label>
              <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} disabled={loading}
                className={`input-field ${errors.confirmPassword ? "border-destructive/50" : ""}`} />
              {errors.confirmPassword && <p className="text-destructive text-sm mt-2">× {errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} disabled={loading}
                className="mt-1 rounded border-border text-primary focus:ring-primary cursor-pointer" />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the <a href="#" className="text-primary hover:text-primary/80 font-medium">Terms of Service</a> and{" "}
                <a href="#" className="text-primary hover:text-primary/80 font-medium">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (<><span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>) : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
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
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">Sign in</Link>
        </motion.p>
      </div>
    </div>
  );
}
