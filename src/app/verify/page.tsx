'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useAuth';
import { AuroraBackground } from '@/components/backgrounds/AnimatedBackground';

function maskEmail(email: string) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal =
    local.length > 2 ? local[0] + '***' + local[local.length - 1] : local[0] + '***';
  return `${maskedLocal}@${domain}`;
}

function VerifyContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const signOut = useSignOut();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.emailVerified) {
      router.replace('/profile'); // or dashboard
      return;
    }

    if (!hasSentRef.current && !isResending && resendTimer === 0) {
      hasSentRef.current = true;
      sendCode();
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendCode = async () => {
    if (isResending) return;
    try {
      setIsResending(true);
      setError(null);

      const res = await fetch('/api/auth/verify/send', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send code');

      toast.success('Verification code sent');
      setResendTimer(60);
    } catch (err: any) {
      const msg = err.message || 'Failed to send verification code';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid verification code');

      if (data.verified) {
        toast.success('Email verified successfully!');
        window.location.href = '/profile';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length; i++) {
        if (index + i < 6) {
          newCode[index + i] = pastedCode[i];
        }
      }
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newCode.every((v) => v !== '')) {
        handleVerify(newCode.join(''));
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((v) => v !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      <AuroraBackground />
      <div className="surface-card relative z-10 w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-6 text-center"
        >
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <Shield className="text-primary h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Verify your email</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              We sent a code to{' '}
              <span className="text-foreground font-medium">{maskEmail(user?.email || '')}</span>
            </p>
          </div>

          {error && (
            <div className="border-destructive/30 bg-destructive/10 text-destructive w-full rounded-lg border px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="w-full space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isVerifying}
                  className="focus-visible:ring-primary h-14 w-12 p-0 text-center text-xl font-semibold focus-visible:ring-offset-2"
                />
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={() => handleVerify(code.join(''))}
                disabled={code.some((v) => !v) || isVerifying}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => sendCode()}
                disabled={resendTimer > 0 || isResending}
                className="w-full text-sm"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  'Resend code'
                )}
              </Button>
            </div>
          </div>

          <div className="border-border/50 w-full border-t pt-4">
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
