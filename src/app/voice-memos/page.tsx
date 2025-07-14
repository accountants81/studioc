
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, StopCircle, Trash2, Edit, Play, Pause, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

type Recording = {
  id: string;
  name: string;
  audioUrl: string;
  date: string;
  duration: number;
};

export default function VoiceMemosPage() {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'recording'>('inactive');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [recordings, setRecordings] = useLocalStorage<Recording[]>('timeflow-recordings', []);
  const [timer, setTimer] = useState(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

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

    // Start timer
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
    
    const reader = new FileReader();
    reader.readAsDataURL(new Blob(audioChunks, { type: 'audio/webm' })); 
    reader.onloadend = function() {
        const base64data = reader.result as string;
        const newRecording: Recording = {
            id: crypto.randomUUID(),
            name: `تسجيل ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
            audioUrl: base64data,
            date: new Date().toISOString(),
            duration: timer,
        };
        setRecordings([...recordings, newRecording]);
        setAudio(null);
        setTimer(0);
    }

    // A bit of a hack to get the blob from the object URL
    fetch(audio)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newRecording: Recording = {
          id: crypto.randomUUID(),
          name: `تسجيل ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          audioUrl: base64data,
          date: new Date().toISOString(),
          duration: timer,
        };
        setRecordings([...recordings, newRecording]);
        setAudio(null);
        setTimer(0);
      };
      reader.readAsDataURL(blob);
    });
  };

  const deleteRecording = (id: string) => {
    setRecordings(recordings.filter(rec => rec.id !== id));
  };
  
  const renameRecording = (id: string, newName: string) => {
    setRecordings(recordings.map(rec => rec.id === id ? {...rec, name: newName} : rec));
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="مذكراتي الصوتية" />
      <Card className="mb-8" style={{ backgroundColor: '#F9FAFB' }}>
        <CardHeader>
          <CardTitle>تسجيل جديد</CardTitle>
          <CardDescription>اضغط على الزر لبدء تسجيل ملاحظة صوتية جديدة.</CardDescription>
        </CardHeader>
        <CardContent className={`flex flex-col items-center justify-center space-y-4 p-6 ${recordingStatus === 'recording' ? 'recording-active rounded-b-lg' : ''}`}>
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
          {recordingStatus === 'recording' && <div className="text-lg font-mono text-gray-700">{formatTime(timer)}</div>}
          {audio && (
            <div className="w-full p-4 bg-gray-100 rounded-lg flex items-center justify-between">
              <audio src={audio} controls className="flex-grow" />
              <Button onClick={saveRecording} variant="ghost" size="icon">
                <Save className="h-5 w-5 text-green-600" />
              </Button>
              <Button onClick={() => setAudio(null)} variant="ghost" size="icon">
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة التسجيلات</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length > 0 ? (
            <div className="space-y-3">
              {recordings.map((rec) => (
                <RecordingItem key={rec.id} recording={rec} onDelete={deleteRecording} onRename={renameRecording} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Mic className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">لا توجد تسجيلات</h3>
              <p className="mt-1 text-sm">ابدأ بتسجيل ملاحظتك الصوتية الأولى!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function RecordingItem({ recording, onDelete, onRename }: { recording: Recording, onDelete: (id: string) => void, onRename: (id: string, name: string) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(recording.name);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const handleRename = () => {
      onRename(recording.id, newName);
      setIsRenaming(false);
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-md">
      <audio ref={audioRef} src={recording.audioUrl} preload="metadata" />
      <Button onClick={togglePlay} variant="ghost" size="icon" className="h-10 w-10 rounded-full">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <div className="flex-1">
        {isRenaming ? (
            <div className="flex items-center gap-2">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8" />
                <Button onClick={handleRename} size="sm">حفظ</Button>
                <Button onClick={() => setIsRenaming(false)} size="sm" variant="ghost">إلغاء</Button>
            </div>
        ) : (
             <p className="font-medium text-card-foreground">{recording.name}</p>
        )}
       
        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
          <span>{format(new Date(recording.date), 'd MMMM yyyy, HH:mm')}</span>
          <span>المدة: {formatTime(recording.duration)}</span>
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
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذا التسجيل نهائيًا. لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(recording.id)} className="bg-destructive hover:bg-destructive/90">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

