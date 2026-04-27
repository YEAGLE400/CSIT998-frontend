"use client"

import { useState, useRef, ChangeEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Lightbulb, FileImage, Loader2, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

interface Step {
  title: string;
  equation: string;
  description: string;
}

export default function SolverPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setShowSteps(false)
    }
  }

  const handleStartSolving = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;
  
      const response = await fetch('/solver/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, imageBase64 })
      });
  
      const data = await response.json();
      if (data.success) {
        setSteps(data.steps);
        setShowSteps(true);
        setCurrentStep(0);
      } else {
        alert("推理失败: " + data.error);
      }
    } catch (error) {
      console.error("连接异常", error);
      alert("服务器连接失败，请检查终端 3002 端口是否正常。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
            <h1 className="text-lg font-bold">Smart Solver</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* 上传区 */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Upload Your Problem</h2>
            <Card className={`border-2 border-dashed ${preview ? 'border-blue-500' : 'border-gray-200'}`} onClick={() => fileInputRef.current?.click()}>
              <CardContent className="p-0 flex items-center justify-center min-h-[400px]">
                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                {preview ? <img src={preview} className="max-h-80 rounded-xl" /> : <div className="text-center opacity-40"><FileImage className="h-12 w-12 mx-auto" /><p>Click to upload image</p></div>}
              </CardContent>
            </Card>
            <Button onClick={handleStartSolving} className="w-full h-16 text-xl bg-blue-600 font-bold" disabled={loading || !preview}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Lightbulb className="mr-2" />} Start Solving
            </Button>
          </div>

          {/* 展示区 */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Solution Workspace</h2>
            {!showSteps ? (
              <Card className="h-[500px] flex items-center justify-center opacity-20"><Lightbulb className="h-20 w-20" /></Card>
            ) : (
              <div className="space-y-6">
                <Card className="shadow-2xl rounded-3xl overflow-hidden border-none">
                  <div className="bg-blue-600 p-8 text-white">
                    <p className="text-xs uppercase opacity-70">Step {currentStep + 1} of {steps.length}</p>
                    <h3 className="text-2xl font-bold">{steps[currentStep].title}</h3>
                  </div>
                  <CardContent className="p-10 space-y-8">
                    <div className="bg-gray-50 py-10 rounded-2xl flex justify-center text-2xl">
                      <BlockMath math={steps[currentStep].equation} />
                    </div>
                    <p className="p-6 bg-blue-50 rounded-xl italic text-gray-700">{steps[currentStep].description}</p>
                    <div className="flex gap-4">
                      <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>Previous</Button>
                      <Button className="flex-1 bg-black text-white" onClick={() => currentStep < steps.length - 1 && setCurrentStep(s => s + 1)}>
                        {currentStep === steps.length - 1 ? "Complete" : "Next Step"}
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