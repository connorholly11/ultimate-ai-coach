'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/constants'

interface MicButtonProps {
  onTranscription: (text: string) => void
  disabled?: boolean
}

export function MicButton({ onTranscription, disabled }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  useEffect(() => {
    // Check if MediaRecorder is supported
    if (typeof window !== 'undefined' && !window.MediaRecorder) {
      setIsSupported(false)
    }
  }, [])
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Determine the best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/wav'
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        await processAudio(audioBlob)
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Failed to access microphone. Please check your permissions.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }
  
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      
      const response = await fetch(API_ENDPOINTS.TRANSCRIBE, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }
      
      const data = await response.json()
      if (data.text) {
        onTranscription(data.text)
      }
    } catch (error) {
      console.error('Failed to process audio:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (!isSupported) {
    return null // Hide the button if not supported
  }
  
  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  return (
    <Button
      type="button"
      size="icon"
      variant={isRecording ? "destructive" : "secondary"}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className="h-10 w-10"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  )
}