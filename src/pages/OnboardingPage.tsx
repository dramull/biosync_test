import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useCamera } from '../hooks/useCamera';
import { isOpenRouterConfigured, analyzeSelfieLive } from '../services/openrouter';
import { Camera, ChevronRight, User } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser, isDemo } = useApp();
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, capturePhoto } = useCamera();

  const [step, setStep] = useState<'selfie' | 'confirm'>('selfie');
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [gender, setGender] = useState(user?.gender || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bmi, setBmi] = useState(user?.bmi?.toString() || '');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (step === 'selfie' && !photo) {
      startCamera('user');
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleCapture = async () => {
    const dataUrl = capturePhoto();
    if (!dataUrl) return;
    setPhoto(dataUrl);
    stopCamera();

    if (isOpenRouterConfigured()) {
      setAnalyzing(true);
      setAiError('');
      try {
        const result = await analyzeSelfieLive(dataUrl);
        setGender(result.gender);
        setAge(result.age.toString());
        setBmi(result.bmi.toString());
      } catch {
        setAiError('AI analysis unavailable. Please enter details manually.');
      } finally {
        setAnalyzing(false);
      }
    }
    setStep('confirm');
  };

  const handleSkipPhoto = () => {
    stopCamera();
    setStep('confirm');
    if (isDemo && user) {
      setGender(user.gender);
      setAge(user.age.toString());
      setBmi(user.bmi.toString());
    }
  };

  const handleConfirm = () => {
    if (!user) return;
    setUser({
      ...user,
      gender: gender || 'other',
      age: parseInt(age) || 25,
      bmi: parseFloat(bmi) || 22,
    });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-black px-6 pt-12 pb-8">
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === 'selfie' ? 'bg-biosync-400' : 'bg-biosync-400'}`} />
        <div className={`h-1 flex-1 rounded-full ${step === 'confirm' ? 'bg-biosync-400' : 'bg-white/10'}`} />
      </div>

      {step === 'selfie' && (
        <div className="animate-fade-in flex flex-1 flex-col">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Let&apos;s get started</h2>
          <p className="mb-6 text-sm text-white/50">Take a selfie and our AI will estimate your profile. You can always adjust.</p>

          <div className="relative mb-6 flex-1 overflow-hidden rounded-3xl bg-surface">
            {isActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User size={64} className="text-white/10" />
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
                <p className="text-center text-sm text-white/60">{cameraError}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-biosync-500 py-3.5 text-sm font-semibold text-black transition-all hover:bg-biosync-400 active:scale-[0.98] disabled:opacity-30"
            >
              <Camera size={18} />
              Capture
            </button>
            <button
              onClick={handleSkipPhoto}
              className="w-full rounded-2xl py-3 text-sm text-white/40 hover:text-white/60"
            >
              Skip photo &amp; enter manually
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="animate-fade-in flex flex-1 flex-col">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">Confirm your profile</h2>
          <p className="mb-6 text-sm text-white/50">
            {analyzing ? 'Analyzing...' : aiError || 'Review and correct if needed.'}
          </p>

          {photo && (
            <div className="mb-6 mx-auto h-32 w-32 overflow-hidden rounded-full ring-2 ring-biosync-500/30">
              <img src={photo} alt="Selfie" className="h-full w-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            </div>
          )}

          <div className="space-y-4 flex-1">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-biosync-500/50"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">Approximate Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                min={10}
                max={120}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-biosync-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">Approximate BMI</label>
              <input
                type="number"
                value={bmi}
                onChange={e => setBmi(e.target.value)}
                placeholder="22"
                step="0.1"
                min={10}
                max={60}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-biosync-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={analyzing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-biosync-500 py-3.5 text-sm font-semibold text-black transition-all hover:bg-biosync-400 active:scale-[0.98] disabled:opacity-30"
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
