"use client"

import { useState, useEffect } from "react"
import { X, Lightbulb, TrendingUp, BookOpen, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MentorNotification {
  id: string
  type: "suggestion" | "insight" | "resource" | "encouragement"
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
}

const sampleNotifications: MentorNotification[] = [
  {
    id: "1",
    type: "suggestion",
    title: "Struggling with quadratics?",
    message: "I noticed you're working on quadratic equations. Want to try a quick visualization to help understand?",
    action: {
      label: "Show Visualization",
      href: "/solver?topic=quadratics",
    },
  },
  {
    id: "2",
    type: "insight",
    title: "Pattern detected",
    message: "You've solved 5 algebra problems in a row! Consider exploring calculus to build on this momentum.",
    action: {
      label: "Explore Calculus",
      href: "/practice?subject=calculus",
    },
  },
  {
    id: "3",
    type: "resource",
    title: "New resource available",
    message: "Based on your interest in physics, we've curated a collection on Newton's Laws of Motion.",
    action: {
      label: "View Collection",
      href: "/library?topic=physics",
    },
  },
]

export function MentorBubble() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<MentorNotification | null>(null)

  useEffect(() => {
    // Simulate mentor notification appearing after a delay
    const timer = setTimeout(() => {
      setCurrentNotification(sampleNotifications[0])
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible || !currentNotification) return null

  const getIcon = () => {
    switch (currentNotification.type) {
      case "suggestion":
        return <Lightbulb className="h-5 w-5" />
      case "insight":
        return <TrendingUp className="h-5 w-5" />
      case "resource":
        return <BookOpen className="h-5 w-5" />
      case "encouragement":
        return <MessageCircle className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="w-80 border-accent/30 bg-card shadow-2xl">
        <CardContent className="p-0">
          <div className="flex items-start gap-3 p-4">
            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
              {getIcon()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">{currentNotification.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentNotification.message}</p>
              {currentNotification.action && (
                <Button size="sm" className="w-full mt-3 bg-accent hover:bg-accent/90 text-accent-foreground">
                  {currentNotification.action.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
