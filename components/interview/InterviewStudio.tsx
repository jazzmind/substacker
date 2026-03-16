'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Mic, Send, Loader2, Download } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { AudioPlayer } from './AudioPlayer';
import { textToSpeech, speechToText } from '@/lib/audio-client';

interface TranscriptEntry {
  role: 'interviewer' | 'expert';
  text: string;
  timestamp: string;
}

interface InterviewStudioProps {
  stackId: string;
  interviewId: string;
  agentToken: string;
  agentId?: string;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
}

export function InterviewStudio({
  stackId,
  interviewId,
  agentToken,
  agentId = 'interview-conductor',
  onTranscriptUpdate,
}: InterviewStudioProps) {
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [ttsAudio, setTtsAudio] = useState<ArrayBuffer | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    onTranscriptUpdate?.(transcript);
  }, [transcript, onTranscriptUpdate]);

  const addEntry = useCallback((role: TranscriptEntry['role'], text: string) => {
    setTranscript((prev) => [
      ...prev,
      { role, text, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const sendToAgent = useCallback(async (message: string): Promise<string> => {
    const metadata = { stackId, interviewId, mode: 'interview' };

    const body: Record<string, unknown> = {
      message,
      agent_name: agentId,
      metadata,
    };
    if (conversationId) {
      body.conversation_id = conversationId;
    }

    const response = await fetch(`${basePath}/api/agent/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Agent error: ${response.status}`);
    }

    const data = await response.json();
    if (data.conversation_id && !conversationId) {
      setConversationId(data.conversation_id);
    }
    return data.response || data.message || '';
  }, [agentToken, agentId, stackId, interviewId, conversationId, basePath]);

  const handleTextSend = useCallback(async () => {
    if (!inputText.trim() || isWaiting) return;
    const message = inputText.trim();
    setInputText('');
    addEntry('expert', message);
    setIsWaiting(true);

    try {
      const response = await sendToAgent(message);
      addEntry('interviewer', response);

      if (mode === 'audio') {
        try {
          const audio = await textToSpeech(response);
          setTtsAudio(audio);
        } catch (err) {
          console.error('TTS failed, falling back to text:', err);
        }
      }
    } catch (err) {
      console.error('Agent call failed:', err);
      addEntry('interviewer', 'Sorry, I had trouble processing that. Could you repeat?');
    } finally {
      setIsWaiting(false);
    }
  }, [inputText, isWaiting, addEntry, sendToAgent, mode]);

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const text = await speechToText(blob);
      addEntry('expert', text);

      setIsWaiting(true);
      const response = await sendToAgent(text);
      addEntry('interviewer', response);

      try {
        const audio = await textToSpeech(response);
        setTtsAudio(audio);
      } catch (err) {
        console.error('TTS failed:', err);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      addEntry('interviewer', 'I couldn\'t hear that clearly. Could you try again?');
    } finally {
      setIsTranscribing(false);
      setIsWaiting(false);
    }
  }, [addEntry, sendToAgent]);

  const startInterview = useCallback(async () => {
    setIsWaiting(true);
    try {
      const response = await sendToAgent(
        'Start the interview. Please introduce yourself and ask the first question.'
      );
      addEntry('interviewer', response);

      if (mode === 'audio') {
        try {
          const audio = await textToSpeech(response);
          setTtsAudio(audio);
        } catch (err) {
          console.error('TTS failed:', err);
        }
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsWaiting(false);
    }
  }, [sendToAgent, addEntry, mode]);

  const downloadTranscript = useCallback(() => {
    const text = transcript
      .map((e) => `[${e.role === 'interviewer' ? 'AI' : 'Expert'}] ${e.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${interviewId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, interviewId]);

  return (
    <div className="flex flex-col h-full">
      {/* Mode Toggle & Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mode === 'text'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setMode('audio')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              mode === 'audio'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            Audio
          </button>
        </div>
        <div className="flex items-center gap-2">
          {transcript.length > 0 && (
            <button
              onClick={downloadTranscript}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Mic className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Ready to Interview</p>
            <p className="text-sm mb-4">
              {mode === 'audio'
                ? 'The AI will ask questions via voice. Record your answers.'
                : 'The AI will ask questions. Type your answers.'}
            </p>
            <button
              onClick={startInterview}
              disabled={isWaiting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isWaiting ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        )}

        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.role === 'expert' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                entry.role === 'expert'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-xs opacity-70 mb-1">
                {entry.role === 'interviewer' ? 'AI Interviewer' : 'Expert'}
              </p>
              <p className="whitespace-pre-wrap">{entry.text}</p>
            </div>
          </div>
        ))}

        {isWaiting && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* TTS Playback */}
      {mode === 'audio' && ttsAudio && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <AudioPlayer
            audioData={ttsAudio}
            autoPlay
            onPlaybackComplete={() => setTtsAudio(null)}
          />
        </div>
      )}

      {/* Input Area */}
      {transcript.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {mode === 'audio' ? (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isTranscribing || isWaiting}
              disabled={isWaiting}
            />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTextSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your answer..."
                disabled={isWaiting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isWaiting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
