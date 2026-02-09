import React, { useState, useEffect, useCallback } from 'react';

type Phase = 'textbook' | 'burning' | 'drama';

interface EmperorImageProps {
  image: string;
  dramaImage: string;
  emperorName: string;
  className?: string;
}

export const EmperorImage: React.FC<EmperorImageProps> = ({
  image,
  dramaImage,
  emperorName,
  className = '',
}) => {
  const [tbReady, setTbReady] = useState(false);
  const [dramaReady, setDramaReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('textbook');

  const displayChar = emperorName.replace(/^爱新觉罗·/, '').charAt(0);

  // Pre-load both images; reset on question change
  useEffect(() => {
    setPhase('textbook');
    setTbReady(false);
    setDramaReady(false);

    if (image) {
      const img = new Image();
      img.onload = () => setTbReady(true);
      img.onerror = () => setTbReady(false);
      img.src = `/images/emperors/${image}`;
    }
    if (dramaImage) {
      const img = new Image();
      img.onload = () => setDramaReady(true);
      img.onerror = () => setDramaReady(false);
      img.src = `/images/now/${dramaImage}`;
    }
  }, [image, dramaImage]);

  // Auto-transition: textbook 3s -> burn 1.2s -> drama
  useEffect(() => {
    if (!tbReady || !dramaReady) return;

    const t1 = setTimeout(() => {
      setPhase('burning');
    }, 1500);

    const t2 = setTimeout(() => {
      setPhase('drama');
    }, 2900); // 1500 + 1400

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tbReady, dramaReady]);

  // Click to toggle (skip if mid-burn)
  const toggle = useCallback(() => {
    if (phase === 'burning') return;
    setPhase((p) => (p === 'textbook' ? 'drama' : 'textbook'));
  }, [phase]);

  // ---- Fallback: no images at all ----
  if (!tbReady && !dramaReady) {
    return (
      <div className={`relative overflow-hidden rounded-xl border-4 border-stone-400 ${className}`}>
        <div className="aspect-[3/4] w-full flex items-center justify-center bg-gradient-to-b from-amber-50 via-stone-100 to-stone-200">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[7rem] leading-none font-calligraphy text-stone-300 select-none drop-shadow-sm">
              {displayChar}
            </span>
            <span className="text-xs text-stone-400 tracking-widest">(暂无画像)</span>
          </div>
        </div>
      </div>
    );
  }

  // ---- Only one image available: show it directly ----
  if (!dramaReady) {
    return (
      <div className={`relative overflow-hidden rounded-xl border-4 border-stone-600 shadow-xl ${className}`}>
        <div className="aspect-[3/4] w-full">
          <img src={`/images/emperors/${image}`} alt={emperorName} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // ---- Full two-image mode with transition ----
  const labelText = phase === 'drama' ? '影视剧版' : '教科书版';
  const labelColor = phase === 'drama' ? 'bg-pink-500 text-white' : 'bg-stone-200 text-stone-900';

  return (
    <div
      onClick={toggle}
      className={`relative overflow-hidden rounded-xl border-4 shadow-xl cursor-pointer select-none ${
        phase === 'drama' ? 'border-amber-400' : 'border-stone-600'
      } ${className}`}
    >
      <div className="aspect-[3/4] w-full relative">
        {/* Layer 1: Drama image (always behind) */}
        <img
          src={`/images/now/${dramaImage}`}
          alt={`${emperorName} 影视剧`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Layer 2: Textbook image (on top, gets burned away) */}
        {tbReady && (
          <img
            src={`/images/emperors/${image}`}
            alt={`${emperorName} 教科书`}
            className={`absolute inset-0 w-full h-full object-cover ${
              phase === 'burning'
                ? 'animate-burn-from-center'
                : phase === 'drama'
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100'
            }`}
          />
        )}

        {/* Layer 3: Fire ring that expands from center */}
        {phase === 'burning' && (
          <div className="absolute inset-0 animate-fire-edge pointer-events-none" />
        )}

        {/* Label badge */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-1 rounded ${labelColor}`}>
              {labelText}
            </span>
            <span className="text-white/70 text-xs">点击切换</span>
          </div>
        </div>
      </div>
    </div>
  );
};
