'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [config, setConfig] = useState<{ enabled: boolean; siteKey: string | null } | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && (window as any).turnstile) {
          (window as any).turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      fetch('/api/auth/turnstile/config')
        .then(res => res.json())
        .then(data => setConfig(data))
        .catch(err => console.error('Failed to fetch turnstile config', err));
    }, []);

    useEffect(() => {
      if (!config) return;
      if (!config.enabled || !config.siteKey) {
        // If disabled or missing siteKey, auto-verify with a dummy token so the form can submit
        onVerify('dummy-bypass-token');
        return;
      }

      let isMounted = true;

      const renderWidget = () => {
        if (containerRef.current && !widgetIdRef.current && (window as any).turnstile) {
          widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
            sitekey: config.siteKey,
            callback: (token: string) => {
              if (isMounted) onVerify(token);
            },
            'error-callback': () => {
              if (isMounted) onError?.();
            },
            'expired-callback': () => {
              if (isMounted) onExpire?.();
            },
          });
        }
      };

      if ((window as any).turnstile) {
        renderWidget();
      } else {
        const scriptId = 'turnstile-script';
        let existingScript = document.getElementById(scriptId);

        if (!existingScript) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          script.onload = () => {
            if (isMounted) renderWidget();
          };
        } else {
          existingScript.addEventListener('load', () => {
            if (isMounted) renderWidget();
          });
        }
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && (window as any).turnstile) {
          (window as any).turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [config, onVerify, onError, onExpire]);

    if (!config || !config.enabled) return null;

    return (
      <div className="my-4 flex justify-center">
        <div ref={containerRef} />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
