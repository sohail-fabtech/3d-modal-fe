"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSpeechRecognition } from "react-speech-recognition"

interface UseVoiceInputOptions {
  onTranscriptionComplete?: (text: string) => void
  onError?: (error: string) => void
}

interface UseVoiceInputReturn {
  isRecording: boolean
  isSupported: boolean
  transcript: string
  startRecording: () => void
  stopRecording: () => void
  toggleRecording: () => void
  error: string | null
}

export function useVoiceInput({
  onTranscriptionComplete,
  onError,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finalTranscript, setFinalTranscript] = useState("")
  const recognitionRef = useRef<any>(null)

  const {
    transcript,
    interimTranscript,
    finalTranscript: speechFinalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  // Check if browser supports speech recognition
  const isSupported = browserSupportsSpeechRecognition

  // Handle speech recognition errors
  useEffect(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser")
      onError?.("Speech recognition is not supported in this browser")
    }
  }, [isSupported, onError])

  // Update recording state based on listening status
  useEffect(() => {
    setIsRecording(listening)
  }, [listening])

  // Handle final transcript updates
  useEffect(() => {
    if (speechFinalTranscript && speechFinalTranscript !== finalTranscript) {
      setFinalTranscript(speechFinalTranscript)
      const fullText = speechFinalTranscript.trim()
      if (fullText) {
        onTranscriptionComplete?.(fullText)
      }
    }
  }, [speechFinalTranscript, finalTranscript, onTranscriptionComplete])

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported")
      onError?.("Speech recognition is not supported")
      return
    }

    setError(null)
    resetTranscript()
    setFinalTranscript("")
    
    // Start listening with continuous mode and interim results
    try {
      // The actual start listening will be handled by react-speech-recognition
      // We just need to trigger it through the SpeechRecognition API
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = SpeechRecognition ? new SpeechRecognition() : null
      
      if (recognition) {
        // Store the recognition instance in ref for later use
        recognitionRef.current = recognition
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onstart = () => {
          setIsRecording(true)
        }
        
        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            onTranscriptionComplete?.(finalTranscript.trim())
            setIsRecording(false)
            recognition.stop()
          }
        }
        
        recognition.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`)
          onError?.(`Speech recognition error: ${event.error}`)
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
          recognitionRef.current = null
        }
        
        recognition.start()
      }
    } catch (err) {
      setError("Failed to start speech recognition")
      onError?.("Failed to start speech recognition")
      setIsRecording(false)
    }
  }, [isSupported, onTranscriptionComplete, onError])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    // Stop any active recognition using the stored instance
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    isSupported,
    transcript: transcript || interimTranscript,
    startRecording,
    stopRecording,
    toggleRecording,
    error,
  }
}
