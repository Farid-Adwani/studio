'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

// SHA-256 hash of code
const correctCodeHash = '97c45ed03fee03606ada6c055ab3ba029dfc41d1a2a666afb93dc6e0e3ac4624';

const prayerHints = [
  { hint: "Dawn", icon: <Sunrise className="w-5 h-5" /> },
  { hint: "Midday", icon: <Sun className="w-5 h-5" /> },
  { hint: "Afternoon", icon: <Sun className="w-5 h-5" /> },
  { hint: "Sunset", icon: <Sunset className="w-5 h-5" /> },
  { hint: "Night", icon: <Moon className="w-5 h-5" /> },
];

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export default function Home() {
  const [code, setCode] = useState<string[]>(Array(5).fill(''));
  const [showVideo, setShowVideo] = useState(false);
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  useEffect(() => {
    setIsClient(true)
  }, [])
  

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 5) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Code',
        description: 'Please enter all 5 digits.',
      });
      return;
    }

    const enteredCodeHash = await sha256(enteredCode);

    if (enteredCodeHash === correctCodeHash) {
      setShowVideo(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Code',
        description: 'Theeee code is not correct. Please try again.',
      });
      setCode(Array(5).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  if (!isClient) return null

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-white p-4">
       {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex flex-col gap-6 mt-10 p-8 bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-500/50">
          <div className="flex gap-2 md:gap-4 justify-center">
            {code.map((digit, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <Input
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-16 md:w-16 md:h-20 text-4xl md:text-5xl text-center font-bold bg-white/10 border-gray-400 focus:ring-primary focus:border-primary"
                  inputMode="numeric"
                />
                <div title={prayerHints[index].hint} className="text-gray-300">
                  {prayerHints[index].icon}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Unlock
          </Button>
        </div>
      </div>
      
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl p-0 border-0">
          <DialogHeader className='hidden'>
             <DialogTitle>Video</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/Q1hUH6BRleM?autoplay=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
