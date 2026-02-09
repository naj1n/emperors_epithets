import React, { useState } from 'react';

interface EmperorImageProps {
  emperorName: string;
  className?: string;
}

export const EmperorImage: React.FC<EmperorImageProps> = ({ emperorName, className = '' }) => {
  const [mode, setMode] = useState<'textbook' | 'drama'>('textbook');

  // We use picsum with a hash of the name to get a consistent random image
  const nameHash = emperorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = mode === 'textbook' ? nameHash : nameHash + 1000;
  
  const toggleMode = () => {
    setMode(prev => prev === 'textbook' ? 'drama' : 'textbook');
  };

  return (
    <div 
      className={`relative group cursor-pointer overflow-hidden rounded-xl border-4 shadow-xl transition-all duration-300 ${className} ${mode === 'textbook' ? 'border-stone-600 bg-stone-200' : 'border-amber-400 bg-black'}`}
      onClick={toggleMode}
    >
      {/* Tooltip hint */}
      <div className="absolute top-2 right-2 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        点击切换形象
      </div>

      <div className="relative aspect-[3/4] w-full h-full">
        <img 
          src={`https://picsum.photos/seed/${seed}/400/600${mode === 'textbook' ? '?grayscale' : ''}`}
          alt={emperorName}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${mode === 'textbook' ? 'sepia-[.3] contrast-125' : 'brightness-110'}`}
        />
        
        {/* Overlay Label */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-1 rounded ${mode === 'textbook' ? 'bg-stone-200 text-stone-900' : 'bg-pink-500 text-white'}`}>
              {mode === 'textbook' ? '教科书版' : '影视剧版'}
            </span>
            <span className="text-white/80 text-xs italic">
              (示意图)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};