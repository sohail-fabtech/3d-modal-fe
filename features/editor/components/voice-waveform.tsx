"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface VoiceWaveformProps {
  isRecording: boolean
  className?: string
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording, className }) => {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    if (!isRecording) {
      setAnimationPhase(0)
      return
    }

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4)
    }, 200)

    return () => clearInterval(interval)
  }, [isRecording])

  const bars = Array.from({ length: 5 }, (_, i) => {
    const height = isRecording 
      ? Math.random() * 8 + 4 // Random height between 4-12px when recording
      : 4 // Static height when not recording
    
    const delay = i * 0.1 // Stagger animation for each bar
    
    return (
      <div
        key={i}
        className={cn(
          "bg-white rounded-full transition-all duration-200 ease-in-out",
          isRecording && "animate-pulse"
        )}
        style={{
          height: `${height}px`,
          width: "3px",
          animationDelay: `${delay}s`,
          animationDuration: "0.4s",
        }}
      />
    )
  })

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {bars}
    </div>
  )
}

export default VoiceWaveform
