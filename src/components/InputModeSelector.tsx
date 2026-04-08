import { Camera, Mic, Keyboard } from 'lucide-react';

type InputMode = 'photo' | 'voice' | 'manual';

interface InputModeSelectorProps {
  current: InputMode;
  onChange: (mode: InputMode) => void;
  photoFirst?: boolean;
}

export default function InputModeSelector({ current, onChange, photoFirst = true }: InputModeSelectorProps) {
  const modes: { key: InputMode; label: string; icon: typeof Camera }[] = photoFirst
    ? [
        { key: 'photo', label: 'Photo', icon: Camera },
        { key: 'voice', label: 'Voice', icon: Mic },
        { key: 'manual', label: 'Manual', icon: Keyboard },
      ]
    : [
        { key: 'voice', label: 'Voice', icon: Mic },
        { key: 'photo', label: 'Photo', icon: Camera },
        { key: 'manual', label: 'Manual', icon: Keyboard },
      ];

  return (
    <div className="flex gap-2">
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            current === key
              ? 'bg-biosync-500/20 text-biosync-400 ring-1 ring-biosync-500/30'
              : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
