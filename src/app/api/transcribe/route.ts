import { NextRequest, NextResponse } from 'next/server'
import { MODEL_IDS } from '@/lib/constants'

export const runtime = 'edge'

// Groq is OpenAI-compatible for Whisper
interface TranscriptionResponse {
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    
    // Create a proper FormData for Groq API
    const groqFormData = new FormData()
    groqFormData.append('file', audioFile, 'audio.webm')
    groqFormData.append('model', MODEL_IDS.WHISPER)
    groqFormData.append('response_format', 'json')
    
    // Call Groq API (OpenAI-compatible endpoint)
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
    }
    
    const data = await response.json() as TranscriptionResponse
    
    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}