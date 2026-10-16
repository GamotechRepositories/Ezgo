import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (token: string, isAccessToken?: boolean) => void;
  onError: (errorMsg: string) => void;
  text?: string;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
  disabled = false,
}) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [loading, setLoading] = useState(false);

  // Background Google One Tap initialization
  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;

    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => {
              if (res.credential) {
                onSuccess(res.credential, false);
              }
            },
          });
          window.google.accounts.id.prompt();
        } catch (_) {
          // Ignore One Tap prompt suppression
        }
      }
    };

    if (window.google?.accounts?.id) {
      checkGsi();
    } else {
      const timer = setTimeout(checkGsi, 500);
      return () => clearTimeout(timer);
    }
  }, [clientId, onSuccess]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (!clientId) {
      onError('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      // If script is still loading, wait a short moment
      setLoading(true);
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          setLoading(false);
          openGooglePopup();
        } else if (attempts > 20) {
          clearInterval(interval);
          setLoading(false);
          onError('Google Sign-In is still loading. Please check your internet connection.');
        }
      }, 200);
      return;
    }

    openGooglePopup();
  };

  const openGooglePopup = () => {
    setLoading(true);
    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (tokenResponse) => {
          setLoading(false);
          if (tokenResponse?.access_token) {
            onSuccess(tokenResponse.access_token, true);
          } else if (tokenResponse?.error) {
            onError(tokenResponse.error_description || tokenResponse.error || 'Google Sign-In failed.');
          }
        },
        error_callback: (err) => {
          setLoading(false);
          if (err?.type === 'popup_closed') {
            return;
          }
          onError('Google Sign-In popup was closed or blocked by browser.');
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setLoading(false);
      onError(err.message || 'Failed to initialize Google Sign-In popup.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`w-full h-[54px] px-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center justify-between transition-all duration-150 select-none ${
        disabled || loading
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/40 active:scale-[0.99] cursor-pointer'
      }`}
      aria-label="Continue with Google"
    >
      {/* Left: Google Logo + Divider */}
      <div className="flex items-center">
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <div className="h-5 w-[1px] bg-slate-200 ml-4 mr-1 shrink-0" />
      </div>

      {/* Center: Continue with Google */}
      <span className="font-semibold text-slate-800 text-[15px] sm:text-base tracking-tight">
        {loading ? 'Opening Google...' : text === 'continue_with' ? 'Continue with Google' : text}
      </span>

      {/* Right: Arrow Right */}
      <ArrowRight className="w-4 h-4 text-slate-700 shrink-0" />
    </button>
  );
};
