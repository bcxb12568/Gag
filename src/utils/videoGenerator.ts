// Utility to dynamically generate short viral prank video loops using HTML5 Canvas
export type ViralVideoPreset = 'screamer' | 'glitch' | 'rickroll' | 'troll';

export function generateViralPrankVideo(preset: ViralVideoPreset): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      if (!ctx || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        // Fallback placeholder if canvas streaming is unsupported
        return resolve('');
      }

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = '';
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read video blob'));
        reader.readAsDataURL(blob);
      };

      recorder.start();
      let frame = 0;
      const totalFrames = 75; // 2.5 seconds at 30 fps

      const animInterval = setInterval(() => {
        frame++;

        if (preset === 'screamer') {
          // Horror glitch screamer animation
          const isRed = frame % 4 < 2;
          ctx.fillStyle = isRed ? '#7f1d1d' : '#000000';
          ctx.fillRect(0, 0, 480, 480);

          // Glitch scanlines
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
          ctx.lineWidth = 3;
          for (let y = 0; y < 480; y += 12) {
            ctx.beginPath();
            ctx.moveTo(0, y + (frame % 12));
            ctx.lineTo(480, y + (frame % 12));
            ctx.stroke();
          }

          // Shaking skull
          const shakeX = (Math.random() - 0.5) * 16;
          const shakeY = (Math.random() - 0.5) * 16;
          ctx.font = 'bold 120px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💀', 240 + shakeX, 190 + shakeY);

          // Glitch text
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 32px monospace';
          ctx.fillText('CRITICAL DEADLOCK!', 240, 310);

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 20px monospace';
          ctx.fillText('PHONE BUFFER OVERFLOW 0x99', 240, 350);
        } else if (preset === 'glitch') {
          // Cyber Hacker Matrix Deadlock
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, 480, 480);

          ctx.fillStyle = '#22c55e';
          ctx.font = '16px monospace';
          for (let col = 0; col < 20; col++) {
            const x = col * 24;
            const yOffset = (frame * 12 + col * 45) % 480;
            const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
            ctx.fillText(char, x, yOffset);
          }

          // Centered warning box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.fillRect(40, 160, 400, 160);
          ctx.strokeRect(40, 160, 400, 160);

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🚨 SYSTEM LOCKED', 240, 220);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = '14px monospace';
          ctx.fillText('SECURITY BREACH DETECTED', 240, 260);
        } else if (preset === 'rickroll') {
          // 8-bit Meme Rickroll Dance Loop
          const bgPulse = frame % 6 < 3 ? '#1e1b4b' : '#312e81';
          ctx.fillStyle = bgPulse;
          ctx.fillRect(0, 0, 480, 480);

          const danceY = Math.sin(frame * 0.4) * 20;
          const danceX = Math.cos(frame * 0.4) * 30;

          ctx.font = 'bold 110px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🕺', 240 + danceX, 190 + danceY);

          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('NEVER GONNA GIVE YOU UP!', 240, 310);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('YOU HAVE BEEN TROLLED! 🎵', 240, 350);
        } else {
          // Funny Laughing Meme Troll
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 480, 480);

          const bounce = Math.abs(Math.sin(frame * 0.5)) * 30;
          ctx.font = 'bold 120px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('😂', 240, 190 - bounce);

          ctx.fillStyle = '#f59e0b';
          ctx.font = '900 32px sans-serif';
          ctx.fillText('আরে ভাই! ট্রোল হয়েছেন! 🤣', 240, 310);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '16px sans-serif';
          ctx.fillText('১০০% ফানি প্র্যাঙ্ক • ফোন অক্ষত আছে', 240, 350);
        }

        if (frame >= totalFrames) {
          clearInterval(animInterval);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 1000 / 30);
    } catch (err) {
      reject(err);
    }
  });
}
