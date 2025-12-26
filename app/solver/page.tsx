"use client"

import { useState, useRef, ChangeEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Lightbulb, FileImage, Loader2, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// 必须确保已安装: npm install react-katex katex
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

// 1. 定义清晰的步骤接口，将公式与文字说明分离以修复排版错误
interface Step {
  title: string;
  equation: string;   // 仅存放数学公式 (LaTeX)
  description: string; // 存放纯文字描述
}

export default function SolverPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理图片选择与预览
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setShowSteps(false)
    }
  }

  // 核心解题逻辑：包含模拟 AI 生成及数据库入库
  const handleStartSolving = async () => {
    if (!preview) return
    
    setLoading(true)
    try {
      // 模拟 AI 推理延迟
      await new Promise(resolve => setTimeout(resolve, 1500)) 
      
      // 结构化的解题数据
      const mockResponse: Step[] = [
        {
          title: "Identify the equation",
          equation: "2x^2 - 8x + 6 = 0",
          description: "This is a quadratic equation. We identify the coefficients: a = 2, b = -8, c = 6."
        },
        {
          title: "Calculate Discriminant",
          equation: "\\Delta = b^2 - 4ac = 16",
          description: "The discriminant is positive (16), which means there are two distinct real roots."
        },
        {
          title: "Final Solution",
          equation: "x = 3, \\quad x = 1",
          description: "After solving, we find the values for x that satisfy the equation."
        }
      ]
      
      setSteps(mockResponse)
      setShowSteps(true)
      setCurrentStep(0)

      // --- hshan, 此处调用后端 API 将数据存入你的数据库表 ---
      // 路径必须匹配文件夹结构 /app/solver/api/route.ts
      const response = await fetch('/solver/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // 关联 users 表的 id
          questionText: "Solve: 2x^2 - 8x + 6 = 0",
          solutionJson: mockResponse,
        })
      });

      if (response.ok) {
        console.log("hshan, 数据已成功同步至服务器数据库！");
      }

    } catch (error) {
      console.error("Solver Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      {/* 顶部导航 */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </Link>
            <h1 className="text-lg font-bold">Smart Solver</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          
          {/* 左侧：题目上传面板 */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Upload Your Problem</h2>
              <p className="text-gray-500 italic">Welcome back, hshan! Upload an image to start.</p>
            </div>

            <Card 
              className={`border-2 border-dashed transition-all cursor-pointer ${
                preview ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50 hover:border-blue-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="p-0 flex items-center justify-center min-h-[350px]">
                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                {preview ? (
                  <div className="relative p-4">
                    <img src={preview} alt="Preview" className="max-h-72 rounded-lg shadow-md" />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <FileImage className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">Click or drag problem image here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleStartSolving} 
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100" 
              disabled={loading || !preview}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Lightbulb className="h-5 w-5 mr-2" />}
              Start Solving
            </Button>
          </div>

          {/* 右侧：解题展示区 */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Solution Workspace</h2>
            
            {!showSteps ? (
              <Card className="border-none bg-white h-[450px] flex items-center justify-center shadow-sm">
                <div className="text-center space-y-4 opacity-30">
                  <Lightbulb className="h-16 w-16 mx-auto" />
                  <p className="font-medium tracking-wide">Waiting for analysis...</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* 进度指示 */}
                <div className="flex gap-2">
                  {steps.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                  ))}
                </div>

                <Card className="border-none shadow-2xl shadow-blue-900/5 overflow-hidden">
                  <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Step {currentStep + 1} of {steps.length}</p>
                      <h3 className="text-2xl font-bold">{steps[currentStep].title}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-black">
                      {currentStep + 1}
                    </div>
                  </div>
                  
                  <CardContent className="p-8 space-y-8">
                    {/* 数学公式展示区 - 已修复排版问题 */}
                    <div className="bg-gray-50 py-10 px-6 rounded-3xl border border-gray-100 flex justify-center">
                      <div className="text-2xl font-medium text-gray-800">
                        <BlockMath math={steps[currentStep].equation} />
                      </div>
                    </div>

                    {/* 文字描述区 - 放置在公式下方独立框内 */}
                    <div className="p-6 bg-blue-50/50 rounded-2xl border-l-4 border-blue-600 shadow-sm">
                      <p className="text-gray-700 leading-relaxed italic">
                        {steps[currentStep].description}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        variant="ghost" 
                        className="flex-1 h-12"
                        onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        className="flex-1 h-12 bg-gray-900 hover:bg-black text-white shadow-md"
                        onClick={() => {
                          if (currentStep < steps.length - 1) setCurrentStep(s => s + 1)
                        }}
                      >
                        {currentStep === steps.length - 1 ? "Analysis Complete" : "Next Step"}
                        {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}