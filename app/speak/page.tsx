"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mic, Square, Volume2, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SpeakPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const vocabularyNotes = [
    { word: "ephemeral", definition: "lasting for a very short time", context: "Used in sentence about memories" },
    { word: "resilient", definition: "able to recover quickly", context: "Describing character traits" },
    { word: "enigmatic", definition: "mysterious and difficult to understand", context: "Describing a person" },
  ]

  const transcript = [
    { speaker: "AI", text: "Let's practice describing your favorite place. Can you tell me about it?" },
    {
      speaker: "You",
      text: "I love going to the beach. The sound of waves is very calming and the sunset is beautiful.",
    },
    {
      speaker: "AI",
      text: "That's wonderful! I noticed you used 'very calming' - you could also try 'soothing' or 'tranquil' to add more variety.",
    },
  ]

  const handleToggleRecording = () => {
    setIsRecording(!isRecording)
    if (!hasStarted) setHasStarted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Voice Training</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                English Practice
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Practice Through Conversation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A minimalist voice interface that feels natural and conversational
            </p>
          </div>

          {/* Main Voice Interface */}
          <Card className="border-border/50 bg-card shadow-2xl">
            <CardContent className="p-12">
              <div className="flex flex-col items-center space-y-8">
                {/* Waveform Visualization */}
                <div className="relative w-full h-48 flex items-center justify-center">
                  {isRecording ? (
                    <div className="flex items-center gap-2">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-primary rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 80 + 40}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.8 + Math.random() * 0.4}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : hasStarted ? (
                    <div className="flex items-center gap-2">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-1.5 h-6 bg-muted/50 rounded-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Volume2 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Click the microphone to begin speaking</p>
                    </div>
                  )}
                </div>

                {/* Recording Button */}
                <Button
                  size="lg"
                  onClick={handleToggleRecording}
                  className={`h-24 w-24 rounded-full transition-all duration-300 ${
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90 shadow-2xl scale-110"
                      : "bg-primary hover:bg-primary/90 shadow-lg"
                  }`}
                >
                  {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>

                {/* Status Text */}
                <div className="text-center space-y-1">
                  <p className="text-lg font-medium text-foreground">
                    {isRecording ? "Listening..." : hasStarted ? "Paused" : "Ready to practice"}
                  </p>
                  {isRecording && <p className="text-sm text-muted-foreground">Speak naturally, I'm following along</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Transcript */}
          {hasStarted && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Conversation</h3>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary text-xs">
                      Real-time
                    </Badge>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {transcript.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.speaker === "You" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            message.speaker === "You"
                              ? "bg-primary/10 text-foreground"
                              : "bg-muted/50 text-foreground border border-border/50"
                          }`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">{message.speaker}</p>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vocabulary Notes Sidebar */}
          {hasStarted && vocabularyNotes.length > 0 && (
            <Card className="border-border/50 bg-gradient-to-br from-accent/5 to-secondary/5">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Vocabulary Notes</h3>
                  </div>

                  <div className="grid gap-4">
                    {vocabularyNotes.map((note, index) => (
                      <div key={index} className="bg-card rounded-xl p-4 border border-border/50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-primary">{note.word}</span>
                            <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                              New
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.definition}</p>
                          <p className="text-xs text-muted-foreground/70 italic">{note.context}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Practice Time</p>
                  <p className="text-3xl font-bold text-foreground">24 min</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Words Learned</p>
                  <p className="text-3xl font-bold text-foreground">18</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fluency Score</p>
                  <p className="text-3xl font-bold text-foreground">87%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
