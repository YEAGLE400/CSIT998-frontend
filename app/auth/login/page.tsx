"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex">
      {/* Left side - Animated 3D organic shape */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-muted via-background to-secondary/20 items-center justify-center p-12 relative overflow-hidden">
        {/* Organic blob shape with animation */}
        <div className="relative w-full max-w-lg aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/40 to-accent/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl animate-blob" />
          <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 via-primary/30 to-accent/40 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute inset-0 bg-gradient-to-bl from-accent/30 via-secondary/30 to-primary/40 rounded-[30%_70%_50%_50%/50%_60%_30%_60%] blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Floating text */}
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-2xl font-light text-foreground/80 leading-relaxed">Start your journey to mastery.</p>
          <p className="mt-4 text-sm text-muted-foreground">Join thousands learning at their own pace</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-10">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Continue your learning journey</p>
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-normal border-border/50 hover:bg-muted/50 bg-transparent"
            >
              <Github className="w-5 h-5 mr-3 text-muted-foreground" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-normal border-border/50 hover:bg-muted/50 bg-transparent"
            >
              <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password form */}
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-light text-muted-foreground">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-border/50 focus:border-primary py-3 px-0 text-base outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-light text-muted-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-border/50 focus:border-primary py-3 px-0 text-base outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border/50" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-normal bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              Sign in
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
