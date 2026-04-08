import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { isSupabaseConfigured } from '../services/supabase';
import { Activity, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginDemo, loginWithEmail, signUpWithEmail } = useApp();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleDemo = () => {
    loginDemo();
    navigate('/onboarding');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        navigate('/onboarding');
      } else {
        await loginWithEmail(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Logo & hero */}
      <div className="animate-fade-in mb-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-biosync-500/20 animate-pulse-glow">
          <Activity size={32} className="text-biosync-400" />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Bio<span className="text-biosync-400">Sync</span>
        </h1>
        <p className="text-base text-white/50 leading-relaxed max-w-xs mx-auto">
          Effortless diet & fitness tracking.
          <br />
          Snap. Speak. Optimize.
        </p>
      </div>

      {/* Features */}
      <div className="animate-slide-up mb-10 grid w-full max-w-sm gap-3">
        {[
          { icon: Sparkles, text: 'AI-powered meal analysis from photos' },
          { icon: Zap, text: 'Voice-first workout logging' },
          { icon: Activity, text: 'Intelligent health recommendations' },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5">
            <Icon size={18} className="shrink-0 text-biosync-400" />
            <span className="text-sm text-white/70">{text}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={handleDemo}
          className="w-full rounded-2xl bg-biosync-500 py-3.5 text-sm font-semibold text-black transition-all hover:bg-biosync-400 active:scale-[0.98]"
        >
          Try Demo
        </button>

        {isSupabaseConfigured() && (
          <>
            <button
              onClick={() => setShowAuth(!showAuth)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 text-sm font-medium text-white/70 transition-all hover:bg-white/[0.08]"
            >
              {showAuth ? 'Hide' : 'Sign in with Email'}
            </button>

            {showAuth && (
              <form onSubmit={handleAuth} className="space-y-3 animate-fade-in">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-biosync-500/50 focus:ring-1 focus:ring-biosync-500/20"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-biosync-500/50 focus:ring-1 focus:ring-biosync-500/20"
                />
                {authError && <p className="text-xs text-red-400">{authError}</p>}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white transition-all hover:bg-white/15 disabled:opacity-50"
                >
                  {authLoading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-xs text-white/40 hover:text-white/60"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-white/20">v1.0 · Built with AI</p>
    </div>
  );
}
