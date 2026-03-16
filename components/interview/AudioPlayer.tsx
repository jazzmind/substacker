'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  audioData: ArrayBuffer | null;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
}

export function AudioPlayer({ audioData, autoPlay = true, onPlaybackComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const play = useCallback(async (data: ArrayBuffer) => {
    try {
      setIsLoading(true);

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBuffer = await ctx.decodeAudioData(data.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        setIsPlaying(false);
        onPlaybackComplete?.();
      };

      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Audio playback failed:', err);
      setIsLoading(false);
      setIsPlaying(false);
      onPlaybackComplete?.();
    }
  }, [onPlaybackComplete]);

  useEffect(() => {
    if (audioData && autoPlay) {
      play(audioData);
    }
  }, [audioData, autoPlay, play]);

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* already stopped */ }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!audioData) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Volume2 className="w-4 h-4 animate-pulse text-blue-600" />
      ) : (
        <button
          onClick={() => play(audioData)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Replay
        </button>
      )}
    </div>
  );
}
