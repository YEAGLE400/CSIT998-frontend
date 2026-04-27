"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CameraOff, Loader2, Mic, MonitorSpeaker, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type SpeakState = "loading" | "listening" | "processing" | "speaking" | "error"
type Role = "user" | "assistant"

type Message = {
  id: string
  role: Role
  text: string
  meta?: string
  pending?: boolean
}

type SpeakServerMessage =
  | { type: "text"; text: string; transcription?: string; llm_time?: number }
  | { type: "audio_start"; sample_rate?: number; sentence_count?: number }
  | { type: "audio_chunk"; audio: string; index: number }
  | { type: "audio_end"; tts_time?: number }

declare global {
  interface Window {
    vad?: {
      MicVAD: {
        new: (options: Record<string, unknown>) => Promise<{
          start: () => void
          destroy?: () => void
          setOptions?: (options: Record<string, unknown>) => void
        }>
      }
    }
  }
}

const speakWsUrl =
  process.env.NEXT_PUBLIC_SPEAK_WS_URL ||
  (typeof window === "undefined" ? "ws://localhost:8000/ws" : "ws://localhost:8000/ws")

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function float32ToWavBase64(samples: Float32Array) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, 16000, true)
  view.setUint32(28, 32000, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, samples.length * 2, true)

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export default function SpeakPage() {
  const [state, setState] = useState<SpeakState>("loading")
  const [status, setStatus] = useState("Loading voice assistant...")
  const [messages, setMessages] = useState<Message[]>([])
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState("")

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const waveformRef = useRef<HTMLCanvasElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const vadRef = useRef<Awaited<ReturnType<NonNullable<typeof window.vad>["MicVAD"]["new"]>> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const streamSampleRateRef = useRef(24000)
  const streamNextTimeRef = useRef(0)
  const ignoreIncomingAudioRef = useRef(false)
  const stateRef = useRef<SpeakState>("loading")
  const cameraEnabledRef = useRef(true)
  const speakingStartedAtRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)

  const updateState = useCallback((next: SpeakState, nextStatus?: string) => {
    stateRef.current = next
    setState(next)
    if (nextStatus) setStatus(nextStatus)

    if (vadRef.current?.setOptions) {
      vadRef.current.setOptions({ positiveSpeechThreshold: next === "speaking" ? 0.92 : 0.5 })
    }

    if (next === "listening" && mediaStreamRef.current && audioCtxRef.current && analyserRef.current) {
      if (!micSourceRef.current) {
        micSourceRef.current = audioCtxRef.current.createMediaStreamSource(mediaStreamRef.current)
      }
      try {
        micSourceRef.current.connect(analyserRef.current)
      } catch {}
    } else if (micSourceRef.current && analyserRef.current) {
      try {
        micSourceRef.current.disconnect(analyserRef.current)
      } catch {}
    }
  }, [])

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
      analyserRef.current = audioCtxRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.75
    }
    if (audioCtxRef.current.state === "suspended") void audioCtxRef.current.resume()
  }, [])

  const stopPlayback = useCallback(() => {
    streamSourcesRef.current.forEach((source) => {
      try {
        source.stop()
      } catch {}
    })
    streamSourcesRef.current = []
    streamNextTimeRef.current = 0
  }, [])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!cameraEnabledRef.current || !video?.videoWidth) return null

    const canvas = document.createElement("canvas")
    const scale = 320 / video.videoWidth
    canvas.width = 320
    canvas.height = video.videoHeight * scale
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1]
  }, [])

  const addMessage = useCallback((message: Omit<Message, "id">) => {
    setMessages((current) => [...current, { ...message, id: crypto.randomUUID() }])
  }, [])

  const updateLastPendingUserMessage = useCallback((text: string) => {
    setMessages((current) => {
      const next = [...current]
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "user" && next[i].pending) {
          next[i] = { ...next[i], text, pending: false }
          break
        }
      }
      return next
    })
  }, [])

  const appendTtsMeta = useCallback((ttsTime?: number) => {
    if (!ttsTime) return
    setMessages((current) => {
      const next = [...current]
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant") {
          next[i] = { ...next[i], meta: `${next[i].meta || ""} · TTS ${ttsTime}s` }
          break
        }
      }
      return next
    })
  }, [])

  const queueAudioChunk = useCallback(
    (base64Pcm: string) => {
      ensureAudioContext()
      const audioCtx = audioCtxRef.current
      if (!audioCtx) return

      const binary = atob(base64Pcm)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

      const int16 = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(int16.length)
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768

      const audioBuffer = audioCtx.createBuffer(1, float32.length, streamSampleRateRef.current)
      audioBuffer.getChannelData(0).set(float32)

      const source = audioCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioCtx.destination)
      if (analyserRef.current) source.connect(analyserRef.current)

      const startAt = Math.max(streamNextTimeRef.current, audioCtx.currentTime)
      source.start(startAt)
      streamNextTimeRef.current = startAt + audioBuffer.duration
      streamSourcesRef.current.push(source)

      source.onended = () => {
        streamSourcesRef.current = streamSourcesRef.current.filter((item) => item !== source)
        if (streamSourcesRef.current.length === 0 && stateRef.current === "speaking") {
          updateState("listening", "Connected")
        }
      }
    },
    [ensureAudioContext, updateState],
  )

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(speakWsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError("")
      updateState("listening", "Connected")
    }

    ws.onclose = () => {
      setConnected(false)
      setStatus("Speak backend disconnected")
      reconnectTimerRef.current = window.setTimeout(connectWebSocket, 2000)
    }

    ws.onerror = () => {
      setError("Cannot connect to the Speak backend. Start it on port 8000, then refresh this page.")
      updateState("error", "Backend unavailable")
    }

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data) as SpeakServerMessage

      if (msg.type === "text") {
        if (msg.transcription) updateLastPendingUserMessage(msg.transcription)
        addMessage({ role: "assistant", text: msg.text, meta: msg.llm_time ? `LLM ${msg.llm_time}s` : undefined })
        return
      }

      if (msg.type === "audio_start") {
        if (ignoreIncomingAudioRef.current) return
        streamSampleRateRef.current = msg.sample_rate || 24000
        stopPlayback()
        ensureAudioContext()
        streamNextTimeRef.current = (audioCtxRef.current?.currentTime || 0) + 0.05
        speakingStartedAtRef.current = Date.now()
        updateState("speaking", "Speaking")
        return
      }

      if (msg.type === "audio_chunk") {
        if (!ignoreIncomingAudioRef.current) queueAudioChunk(msg.audio)
        return
      }

      if (msg.type === "audio_end") {
        if (ignoreIncomingAudioRef.current) {
          ignoreIncomingAudioRef.current = false
          stopPlayback()
          updateState("listening", "Connected")
          return
        }
        appendTtsMeta(msg.tts_time)
      }
    }
  }, [addMessage, appendTtsMeta, ensureAudioContext, queueAudioChunk, stopPlayback, updateLastPendingUserMessage, updateState])

  const handleSpeechStart = useCallback(() => {
    if (stateRef.current !== "speaking") return
    if (Date.now() - speakingStartedAtRef.current < 800) return

    stopPlayback()
    ignoreIncomingAudioRef.current = true
    wsRef.current?.send(JSON.stringify({ type: "interrupt" }))
    updateState("listening", "Connected")
  }, [stopPlayback, updateState])

  const handleSpeechEnd = useCallback(
    (audio: Float32Array) => {
      if (stateRef.current !== "listening" || wsRef.current?.readyState !== WebSocket.OPEN) return

      const payload: { audio: string; image?: string } = { audio: float32ToWavBase64(audio) }
      const image = captureFrame()
      if (image) payload.image = image

      updateState("processing", "Thinking...")
      addMessage({ role: "user", text: "Listening...", meta: image ? "with camera" : undefined, pending: true })
      wsRef.current.send(JSON.stringify(payload))
    },
    [addMessage, captureFrame, updateState],
  )

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        await Promise.all([
          loadScript("https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.min.js"),
          loadScript("https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/bundle.min.js"),
        ])

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        mediaStreamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream

        connectWebSocket()

        vadRef.current = await window.vad!.MicVAD.new({
          getStream: async () => new MediaStream(stream.getAudioTracks()),
          positiveSpeechThreshold: 0.5,
          negativeSpeechThreshold: 0.25,
          redemptionMs: 600,
          minSpeechMs: 300,
          preSpeechPadMs: 300,
          onSpeechStart: handleSpeechStart,
          onSpeechEnd: handleSpeechEnd,
          onVADMisfire: () => undefined,
          onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
          baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",
        })

        vadRef.current.start()
        ensureAudioContext()
        updateState("listening", "Connected")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize Speak"
        setError(message)
        updateState("error", "Setup failed")
      }
    }

    void start()

    return () => {
      cancelled = true
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      vadRef.current?.destroy?.()
      wsRef.current?.close()
      stopPlayback()
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      void audioCtxRef.current?.close()
    }
  }, [connectWebSocket, ensureAudioContext, handleSpeechEnd, handleSpeechStart, stopPlayback, updateState])

  useEffect(() => {
    function draw() {
      const canvas = waveformRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)
      const data = new Uint8Array(analyserRef.current?.frequencyBinCount || 128)
      analyserRef.current?.getByteFrequencyData(data)

      const barCount = 40
      const gap = 3
      const barWidth = (rect.width - (barCount - 1) * gap) / barCount
      const fill = stateRef.current === "speaking" ? "#818cf8" : stateRef.current === "processing" ? "#f59e0b" : "#4ade80"
      ctx.fillStyle = fill

      for (let i = 0; i < barCount; i++) {
        const bin = data[Math.floor((i / barCount) * data.length * 0.6)] || 0
        const idle = 0.05 + Math.sin(Date.now() / 900 + i * 0.55) * 0.025
        const amplitude = Math.max(bin / 255, idle)
        const height = Math.max(3, amplitude * (rect.height - 8))
        const x = i * (barWidth + gap)
        const y = (rect.height - height) / 2
        ctx.globalAlpha = 0.35 + amplitude * 0.65
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, height, 4)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const toggleCamera = () => {
    const next = !cameraEnabled
    cameraEnabledRef.current = next
    setCameraEnabled(next)
    mediaStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next
    })
  }

  const stateLabel = {
    loading: "Loading",
    listening: "Listening",
    processing: "Thinking",
    speaking: "Speaking",
    error: "Error",
  }[state]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">Speak</h1>
              <p className="text-xs text-muted-foreground">On-device English conversation practice</p>
            </div>
          </div>
          <Badge variant={connected ? "secondary" : "outline"}>{connected ? "Connected" : "Backend"}</Badge>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="relative aspect-video bg-muted">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {!cameraEnabled && (
                <div className="absolute inset-0 grid place-items-center bg-background/80">
                  <CameraOff className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-sm backdrop-blur">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    state === "listening"
                      ? "bg-green-400"
                      : state === "processing"
                        ? "bg-amber-400"
                        : state === "speaking"
                          ? "bg-indigo-400"
                          : "bg-muted-foreground"
                  }`}
                />
                {stateLabel}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{status}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Speak naturally. The assistant listens when you finish and you can interrupt it by talking.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={toggleCamera} title={cameraEnabled ? "Camera off" : "Camera on"}>
                  {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    ensureAudioContext()
                    if (state === "speaking") {
                      stopPlayback()
                      wsRef.current?.send(JSON.stringify({ type: "interrupt" }))
                      updateState("listening", "Connected")
                    }
                  }}
                  title="Audio"
                >
                  {state === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <canvas ref={waveformRef} className="mt-5 h-20 w-full" />
            {error && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold">Conversation</h2>
              <p className="text-xs text-muted-foreground">Live transcript and coaching replies</p>
            </div>
            <MonitorSpeaker className="h-5 w-5 text-primary" />
          </div>

          <div className="max-h-[calc(100vh-220px)] space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <Mic className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium">Start speaking when the status is Listening</p>
                  <p className="mt-2 text-sm text-muted-foreground">Your transcript and AI response will appear here.</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[86%] rounded-lg border px-4 py-3 ${
                      message.role === "user" ? "border-primary/20 bg-primary/10" : "border-border bg-muted/40"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{message.role === "user" ? "You" : "AI Coach"}</p>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    {message.meta && <p className="mt-2 text-xs text-muted-foreground">{message.meta}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
