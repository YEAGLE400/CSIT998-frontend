"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, Lightbulb, Eye, ChevronRight, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SolverPage() {
  const [showSteps, setShowSteps] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Identify the equation structure",
      content: "This is a quadratic equation in standard form: $$ax^2 + bx + c = 0$$",
      explanation: "We have $$a = 2$$, $$b = -8$$, and $$c = 6$$",
    },
    {
      title: "Apply the quadratic formula",
      content: "Use: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
      explanation: "This formula works for all quadratic equations",
    },
    {
      title: "Calculate the discriminant",
      content: "$$b^2 - 4ac = (-8)^2 - 4(2)(6) = 64 - 48 = 16$$",
      explanation: "A positive discriminant means two real solutions",
    },
    {
      title: "Solve for x",
      content: "$$x = \\frac{8 \\pm \\sqrt{16}}{4} = \\frac{8 \\pm 4}{4}$$",
      explanation: "This gives us $$x = 3$$ or $$x = 1$$",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-xl font-semibold text-foreground">Smart Solver</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Problem Input */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Upload Your Problem</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Upload an image of your problem or type it directly below
                </p>
              </div>

              {/* Upload Area */}
              <Card className="border-2 border-dashed border-border/50 bg-muted/20 hover:border-primary/50 transition-colors">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Drop your image here</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Problem Display */}
              <Card className="border-border/50 bg-card">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Sample Problem</h3>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Original
                      </Button>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-6 text-center">
                      <p className="text-xl text-foreground font-medium">Solve for x:</p>
                      <p className="text-2xl font-bold text-foreground mt-2">$$2x^2 - 8x + 6 = 0$$</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSteps(true)
                    setCurrentStep(0)
                  }}
                  className="flex-1 gap-2"
                  disabled={showSteps}
                >
                  <Lightbulb className="h-4 w-4" />
                  Start Solving
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Ask for a Hint
                </Button>
              </div>
            </div>

            {/* Right Side - Solution Workspace */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Solution Workspace</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Follow along as we illuminate the path to the answer
                </p>
              </div>

              {!showSteps ? (
                <Card className="border-border/50 bg-muted/20">
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <Lightbulb className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Ready to solve?</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Start Solving" to see step-by-step guidance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          index <= currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Current Step */}
                  <Card className="border-border/50 bg-card shadow-lg">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                {currentStep + 1}
                              </div>
                              <h3 className="text-xl font-semibold text-foreground">{steps[currentStep].title}</h3>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-muted/30 rounded-xl p-6 text-center">
                            <p className="text-lg text-foreground">{steps[currentStep].content}</p>
                          </div>

                          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <span className="font-medium text-accent">Deep Dive:</span>{" "}
                              {steps[currentStep].explanation}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="bg-transparent"
                          >
                            Previous
                          </Button>
                          {currentStep < steps.length - 1 ? (
                            <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 gap-2">
                              Next Step
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button className="flex-1" variant="secondary">
                              Solution Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs for Additional Context */}
                  <Tabs defaultValue="similar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="similar">Similar Problems</TabsTrigger>
                      <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="similar" className="mt-4">
                      <Card className="border-border/50 bg-card">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Try these related problems:</p>
                            <div className="space-y-2">
                              <div className="p-3 bg-muted/20 rounded-lg text-sm text-foreground hover:bg-muted/40 transition-colors cursor-pointer">
                                $$3x^2 - 12x + 9 = 0$$
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg text-sm text-foreground hover:bg-muted/40 transition-colors cursor-pointer">
                                $$x^2 - 5x + 6 = 0$$
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="concepts" className="mt-4">
                      <Card className="border-border/50 bg-card">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Related concepts:</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                Quadratic Formula
                              </span>
                              <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full">
                                Discriminant
                              </span>
                              <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">Factoring</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
