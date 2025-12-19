"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Plus, Clock, Bookmark, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"digest" | "deep">("digest")

  const topics = [
    {
      id: 1,
      title: "Quantum Physics",
      description: "Exploring the fundamental nature of matter and energy at the quantum scale",
      icon: "/quantum-physics-abstract.jpg",
      subscribers: "12.4k",
      articles: 24,
      color: "primary",
    },
    {
      id: 2,
      title: "Modern Literature",
      description: "Contemporary narratives and the evolution of storytelling in the 21st century",
      icon: "/modern-literature-books.jpg",
      subscribers: "8.2k",
      articles: 18,
      color: "secondary",
    },
    {
      id: 3,
      title: "Machine Learning",
      description: "Understanding AI algorithms and their applications in solving complex problems",
      icon: "/machine-learning-neural-network.jpg",
      subscribers: "15.8k",
      articles: 32,
      color: "accent",
    },
  ]

  const articles = [
    {
      id: 1,
      topic: "Quantum Physics",
      title: "The Double-Slit Experiment: A Window into Wave-Particle Duality",
      excerpt:
        "One of the most fascinating experiments in physics reveals the dual nature of light and matter. Discover how observation affects quantum behavior.",
      readTime: "8 min read",
      date: "2 days ago",
      image: "/quantum-physics-experiment.jpg",
    },
    {
      id: 2,
      topic: "Modern Literature",
      title: "Narrative Innovation in Contemporary Fiction",
      excerpt:
        "Exploring how modern authors are breaking traditional storytelling boundaries with experimental structures and perspectives.",
      readTime: "12 min read",
      date: "5 days ago",
      image: "/modern-books-writing.jpg",
    },
    {
      id: 3,
      topic: "Machine Learning",
      title: "Understanding Neural Networks: From Basics to Deep Learning",
      excerpt:
        "A comprehensive guide to how artificial neural networks mimic human brain function to solve complex pattern recognition problems.",
      readTime: "15 min read",
      date: "1 week ago",
      image: "/neural-network-visualization.png",
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
              <h1 className="text-xl font-semibold text-foreground">Knowledge Feed</h1>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Subscribe to Topic
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Curated Knowledge</h2>
                <p className="text-muted-foreground">
                  Subscribe to topics and receive insights like a premium magazine
                </p>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "digest" | "deep")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="digest">Daily Digest</TabsTrigger>
              <TabsTrigger value="deep">Deep Dive</TabsTrigger>
            </TabsList>

            <TabsContent value="digest" className="mt-8 space-y-8">
              {/* Subscribed Topics Grid */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground">Your Subscriptions</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {topics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="border-border/50 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={topic.icon || "/placeholder.svg"}
                            alt={topic.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                              {topic.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {topic.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{topic.articles} articles</span>
                            <span>{topic.subscribers} subscribers</span>
                          </div>
                          <Button variant="secondary" className="w-full gap-2">
                            <Bookmark className="h-4 w-4" />
                            Subscribed
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Latest Articles */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground">Latest Articles</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-6">
                  {articles.map((article) => (
                    <Card
                      key={article.id}
                      className="border-border/50 bg-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-80 aspect-video md:aspect-auto relative overflow-hidden bg-muted">
                            <img
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 p-6 space-y-4">
                            <div className="space-y-3">
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {article.topic}
                              </Badge>
                              <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors text-balance">
                                {article.title}
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">{article.excerpt}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{article.readTime}</span>
                              </div>
                              <span>•</span>
                              <span>{article.date}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deep" className="mt-8 space-y-8">
              {/* Deep Dive Articles */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Deep Dive Collections</h3>
                  <p className="text-muted-foreground">Comprehensive explorations of complex topics</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-border/50 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-8 space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          The Quantum Revolution
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          A multi-part series exploring quantum mechanics from first principles to cutting-edge
                          applications in quantum computing.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>8 articles</span>
                          <span>•</span>
                          <span>2 hours total</span>
                        </div>
                      </div>
                      <Button className="w-full">Start Reading</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-8 space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">
                          Literary Modernism
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          An in-depth exploration of modernist literature, from stream of consciousness to experimental
                          narrative structures.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>6 articles</span>
                          <span>•</span>
                          <span>90 min total</span>
                        </div>
                      </div>
                      <Button className="w-full" variant="secondary">
                        Start Reading
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recommendation Section */}
          <Card className="border-border/50 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="text-xl font-semibold text-foreground">Discover new topics</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Based on your reading history, you might enjoy exploring topics in Astrophysics and Cognitive
                    Science.
                  </p>
                </div>
                <Button variant="outline" className="flex-shrink-0 bg-transparent">
                  Explore Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
