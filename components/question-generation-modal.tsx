"use client"

import { useState } from "react"
import { X, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KnowledgeNode } from "@/lib/knowledge-graph"

interface QuestionGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  availableKnowledgePoints: KnowledgeNode[]
  selectedNodeId?: string
  onGenerate: (config: QuestionGenerationConfig) => void
}

export interface QuestionGenerationConfig {
  knowledgePoints: string[]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  quantity: number
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Basic concepts and simple problems' },
  { value: 'medium', label: 'Medium', description: 'Moderate difficulty with some complexity' },
  { value: 'hard', label: 'Hard', description: 'Advanced problems requiring deep understanding' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of all difficulty levels' },
]

const quantityOptions = [
  { value: 5, label: '5 Questions', description: 'Quick practice session' },
  { value: 10, label: '10 Questions', description: 'Standard practice session' },
  { value: 15, label: '15 Questions', description: 'Extended practice session' },
  { value: 20, label: '20 Questions', description: 'Comprehensive practice session' },
]

export function QuestionGenerationModal({
  isOpen,
  onClose,
  availableKnowledgePoints,
  selectedNodeId,
  onGenerate
}: QuestionGenerationModalProps) {
  // Sort knowledge points by weakness level (weakest first)
  const sortedKnowledgePoints = [...availableKnowledgePoints].sort(
    (a, b) => b.weaknessLevel - a.weaknessLevel
  )

  const [selectedKnowledgePoints, setSelectedKnowledgePoints] = useState<string[]>(
    selectedNodeId ? [selectedNodeId] : []
  )
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium')
  const [quantity, setQuantity] = useState<number>(10)

  const handleKnowledgePointToggle = (pointId: string) => {
    setSelectedKnowledgePoints(prev =>
      prev.includes(pointId)
        ? prev.filter(id => id !== pointId)
        : [...prev, pointId]
    )
  }

  const handleGenerate = () => {
    if (selectedKnowledgePoints.length === 0) return

    onGenerate({
      knowledgePoints: selectedKnowledgePoints,
      difficulty,
      quantity
    })
    onClose()
  }

  const getWeaknessColor = (weaknessLevel: number) => {
    if (weaknessLevel >= 70) return "bg-red-500/10 text-red-500 border-red-500/20"
    if (weaknessLevel >= 50) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    if (weaknessLevel >= 30) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-green-500/10 text-green-500 border-green-500/20"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Generate Personalized Questions
          </DialogTitle>
          <DialogDescription>
            Select knowledge points, difficulty, and quantity to generate a personalized practice session
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 flex flex-col gap-6 py-4">
          {/* Knowledge Points Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Select Knowledge Points</Label>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Sorted by weakness
              </Badge>
            </div>
            <ScrollArea className="h-48 border border-border rounded-lg p-3">
              <div className="space-y-2">
                {sortedKnowledgePoints.map((point) => (
                  <div
                    key={point.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedKnowledgePoints.includes(point.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-border hover:bg-accent'
                    }`}
                    onClick={() => handleKnowledgePointToggle(point.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedKnowledgePoints.includes(point.id)}
                        onChange={() => handleKnowledgePointToggle(point.id)}
                        className="h-4 w-4 rounded border-border"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{point.name}</div>
                        <div className="text-xs text-muted-foreground">{point.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getWeaknessColor(point.weaknessLevel)}>
                        {point.weaknessLevel}% weak
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {point.correctRate}% correct
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              {selectedKnowledgePoints.length} knowledge point{selectedKnowledgePoints.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Difficulty</Label>
            <RadioGroup value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <div className="grid grid-cols-2 gap-3">
                {difficultyOptions.map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem
                      value={option.value}
                      id={`difficulty-${option.value}`}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`difficulty-${option.value}`}
                      className="flex flex-col p-4 rounded-lg border border-border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-accent"
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Quantity</Label>
            <RadioGroup value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
              <div className="grid grid-cols-2 gap-3">
                {quantityOptions.map((option) => (
                  <div key={option.value} className="relative">
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`quantity-${option.value}`}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`quantity-${option.value}`}
                      className="flex flex-col p-4 rounded-lg border border-border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-accent"
                    >
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedKnowledgePoints.length === 0}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate {quantity} Questions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
