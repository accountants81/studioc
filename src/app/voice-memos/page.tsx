"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mic, StopCircle, Trash2, Edit, Play, Pause, Save, Wand2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { transcribeAudio } from '@/ai/flows/transcribe-flow';
import { Skeleton } from '@/components/ui/skeleton';

type Recording = {
  id: string;
  name: string;
  audioUrl: string;
  date: string;
  duration: number;
  transcription?: string;
};

const translations = {
    ar: {
        pageTitle: "مذكراتي الصوتية",
        newRecording: "تسجيل جديد",
        newRecordingDesc: "اضغط على الزر لبدء تسجيل ملاحظة صوتية جديدة.",
        startRecording: "ابدأ التسجيل",
        stopRecording: "إيقاف التسجيل",
        save: "حفظ",
        delete: "حذف",
        recordingsList: "قائمة التسجيلات",
        noRecordings: "لا توجد تسجيلات",
        noRecordingsDesc: "ابدأ بتسجيل ملاحظتك الصوتية الأولى!",
        rename: "إعادة تسمية",
        cancel: "إلغاء",
        deleteConfirmTitle: "هل أنت متأكد؟",
        deleteConfirmDesc: "سيتم حذف هذا التسجيل نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
        transcribe: "تحويل إلى نص",
        transcribing: "جاري التحويل...",
        transcriptionFailed: "فشل تحويل الصوت إلى نص.",
        noTranscription: "لم يتم العثور على نص.",
        duration: "المدة",
        defaultName: "تسجيل",
    },
    en: {
        pageTitle: "My Voice Memos",
        newRecording: "New Recording",
        newRecordingDesc: "Press the button to start recording a new voice note.",
        startRecording: "Start Recording",
        stopRecording: "Stop Recording",
        save: "Save",
        delete: "Delete",
        recordingsList: "Recordings List",
        noRecordings: "No recordings",
        noRecordingsDesc: "Start by recording your first voice memo!",
        rename: "Rename",
        cancel: "Cancel",
        deleteConfirmTitle: "Are you sure?",
        deleteConfirmDesc: "This recording will be permanently deleted. This action cannot be undone.",
        transcribe: "Transcribe",
        transcribing: "Transcribing...",
        transcriptionFailed: "Failed to transcribe audio.",
        noTranscription: "No transcription found.",
        duration: "Duration",
        defaultName: "Recording",
    }
}

export default function VoiceMemosPage() {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'recording'>('inactive');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('timeflow-recordings-v2', []);
  const [timer, setTimer] = useState(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const startRecording = () => {
    if (!stream) return;
    setRecordingStatus('recording');
    const media = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);

    setTimer(0);
    timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    setRecordingStatus('inactive');
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
    if (timerInterval.current) {
        clearInterval(timerInterval.current);
    }
  };
  
  const saveRecording = () => {
    if (!audio) return;
    
    fetch(audio)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newRecording: Recording = {
          id: crypto.randomUUID(),
          name: `${t.defaultName} ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          audioUrl: base64data,
          date: new Date().toISOString(),
          duration: timer,
        };
        setRecordings([newRecording, ...recordings]);
        setAudio(null);
        setTimer(0);
      };
      reader.readAsDataURL(blob);
    });
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
  };
  
  const updateRecording = (id: string, updates: Partial<Recording>) => {
    setRecordings(recordings.map(rec => rec.id === id ? {...rec, ...updates} : rec));
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t.newRecording}</CardTitle>
          <CardDescription>{t.newRecordingDesc}</CardDescription>
        </CardHeader>
        <CardContent className={cn("flex flex-col items-center justify-center space-y-4 p-6 transition-colors", recordingStatus === 'recording' ? 'recording-active rounded-b-lg' : '')}>
          <div className="flex items-center space-x-4">
            {recordingStatus === 'inactive' ? (
              <Button onClick={startRecording} disabled={!permission} size="lg" className="rounded-full w-24 h-24 bg-red-500 hover:bg-red-600 text-white shadow-lg">
                <Mic className="h-10 w-10" />
              </Button>
            ) : (
              <Button onClick={stopRecording} size="lg" className="rounded-full w-24 h-24 bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                <StopCircle className="h-10 w-10" />
              </Button>
            )}
          </div>
          {recordingStatus === 'recording' && <div className="text-lg font-mono text-muted-foreground">{formatTime(timer)}</div>}
          {audio && (
            <div className="w-full p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <audio src={audio} controls className="flex-grow" />
              <div className="flex items-center">
                 <Button onClick={saveRecording} variant="ghost" size="icon">
                    <Save className="h-5 w-5 text-green-600" />
                </Button>
                <Button onClick={() => setAudio(null)} variant="ghost" size="icon">
                    <Trash2 className="h-5 w-5 text-red-600" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.recordingsList}</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length > 0 ? (
            <div className="space-y-4">
              {recordings.map((rec) => (
                <RecordingItem key={rec.id} recording={rec} onDelete={deleteRecording} onUpdate={updateRecording} translations={t}/>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Mic className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">{t.noRecordings}</h3>
              <p className="mt-1 text-sm">{t.noRecordingsDesc}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function RecordingItem({ recording, onDelete, onUpdate, translations: t }: { recording: Recording, onDelete: (id: string) => void, onUpdate: (id: string, updates: Partial<Recording>) => void, translations: typeof translations.ar }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(recording.name);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');


  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const handleRename = () => {
      onUpdate(recording.id, {name: newName});
      setIsRenaming(false);
  }

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const result = await transcribeAudio({ audioUri: recording.audioUrl });
      onUpdate(recording.id, { transcription: result.transcription });
    } catch (error) {
      console.error("Transcription failed:", error);
      alert(t.transcriptionFailed);
    } finally {
      setIsTranscribing(false);
    }
  }
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  return (
    <Card className="transition-all hover:shadow-md">
       <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <audio ref={audioRef} src={recording.audioUrl} preload="metadata" className="hidden" />
          <Button onClick={togglePlay} variant="outline" size="icon" className="h-12 w-12 rounded-full flex-shrink-0">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <div className="flex-1 min-w-0">
            {isRenaming ? (
                <div className="flex items-center gap-2">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8" />
                    <Button onClick={handleRename} size="sm">{t.save}</Button>
                    <Button onClick={() => setIsRenaming(false)} size="sm" variant="ghost">{t.cancel}</Button>
                </div>
            ) : (
                <p className="font-semibold text-card-foreground truncate">{recording.name}</p>
            )}
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <span>{format(new Date(recording.date), lang === 'ar' ? 'd MMMM yyyy, HH:mm' : 'MMMM d, yyyy, HH:mm')}</span>
              <span>•</span>
              <span>{t.duration}: {formatTime(recording.duration)}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button onClick={() => setIsRenaming(true)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.deleteConfirmDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(recording.id)} className="bg-destructive hover:bg-destructive/90">
                    {t.delete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {recording.audioUrl && (
          <div className="w-full">
            <audio src={recording.audioUrl} controls controlsList="nodownload" className="w-full h-10" />
          </div>
        )}
       </CardContent>
       {(recording.transcription !== undefined || isTranscribing) && (
        <CardFooter className="p-4 pt-0">
             {isTranscribing ? (
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
             ) : (
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md w-full whitespace-pre-wrap">{recording.transcription || t.noTranscription}</p>
             )}
        </CardFooter>
       )}
       {!recording.transcription && !isTranscribing && (
        <CardFooter className="p-4 pt-0 border-t mt-2">
            <Button onClick={handleTranscribe} variant="outline" size="sm" className="w-full" disabled={isTranscribing}>
                <Wand2 className="mr-2 h-4 w-4" />
                <span>{t.transcribe}</span>
            </Button>
        </CardFooter>
       )}
    </Card>
  );
}
