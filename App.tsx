import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchQuestions } from './services/geminiService';
import { GameState, Question, GameStats, Rank } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Button } from './components/Button';
import { EmperorImage } from './components/EmperorImage';
import { Timer, Trophy, AlertTriangle, SkipForward, HelpCircle, History, RotateCcw } from 'lucide-react';

// --- Helper Components defined locally for simplicity in this structure ---

const RankBadge: React.FC<{ rank: Rank; score: number }> = ({ rank, score }) => {
  const getColors = () => {
    switch(rank) {
      case Rank.TOP_TIER: return "bg-yellow-500 text-yellow-950 border-yellow-300";
      case Rank.SUPERIOR: return "bg-purple-600 text-purple-100 border-purple-400";
      case Rank.SOLID: return "bg-blue-600 text-blue-100 border-blue-400";
      case Rank.NPC: return "bg-stone-500 text-stone-100 border-stone-400";
      case Rank.TRASH: return "bg-red-800 text-red-100 border-red-900";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-4 shadow-2xl transform hover:scale-105 transition-transform ${getColors()}`}>
      <Trophy className="w-12 h-12 mb-2" />
      <div className="text-5xl font-calligraphy mb-1">{rank}</div>
      <div className="text-sm font-serif opacity-80">正确率 {score}%</div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    history: []
  });
  
  // Use ReturnType<typeof setInterval> to avoid NodeJS namespace dependency in browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Logic ---

  const startGame = async () => {
    setGameState(GameState.LOADING);
    try {
      const q = await fetchQuestions(5);
      setQuestions(q);
      setStats({ score: 0, totalQuestions: q.length, correctAnswers: 0, history: [] });
      setCurrentQIndex(0);
      setGameState(GameState.PLAYING);
      startTimer();
    } catch (e) {
      console.error(e);
      setGameState(GameState.ERROR);
    }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    setShowHint(false);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentQIndex]); // Depends on current question changing

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordAnswer(null, false);
  };

  const recordAnswer = (answer: string | null, isCorrect: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = questions[currentQIndex];
    const newStats = {
      ...stats,
      correctAnswers: isCorrect ? stats.correctAnswers + 1 : stats.correctAnswers,
      history: [...stats.history, {
        question: currentQ,
        userAnswer: answer,
        isCorrect,
        timeTaken: 30 - timeLeft
      }]
    };
    setStats(newStats);

    // Small delay to show feedback if needed, but for speed we go to next
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        startTimer();
      } else {
        finishGame(newStats);
      }
    }, 500);
  };

  const finishGame = (finalStats: GameStats) => {
    const finalScore = Math.round((finalStats.correctAnswers / finalStats.totalQuestions) * 100);
    setStats({ ...finalStats, score: finalScore });
    setGameState(GameState.RESULT);
  };

  const getRank = (score: number): Rank => {
    if (score === 100) return Rank.TOP_TIER;
    if (score >= 80) return Rank.SUPERIOR;
    if (score >= 60) return Rank.SOLID;
    if (score >= 40) return Rank.NPC;
    return Rank.TRASH;
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- Views ---

  const renderStart = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[url('https://picsum.photos/seed/bg_emperor/1920/1080?grayscale&blur=5')] bg-cover bg-center">
      <div className="bg-stone-100/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full mx-4 border-4 border-double border-red-900">
        <h1 className="text-6xl md:text-7xl font-calligraphy text-red-900 mb-4 animate-float">
          谥号猜猜乐
        </h1>
        <p className="text-stone-700 text-lg mb-8 font-serif leading-relaxed">
          纵横中华五千年，多少帝王在其中。<br/>
          是"文"是"武"，是"高"是"太"？<br/>
          来测试一下你的历史含金量！
        </p>
        <Button size="lg" onClick={startGame} className="w-full">
          开始廷试
        </Button>
        <div className="mt-4 text-xs text-stone-500">
          * 题目由 Google Gemini 实时生成
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return <LoadingSpinner />;

    const progress = ((currentQIndex) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* Header */}
        <header className="bg-red-900 text-amber-50 p-4 shadow-lg sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
               <History className="w-5 h-5" />
               <span className="font-bold">第 {currentQIndex + 1} / {questions.length} 题</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-amber-50'}`}>
                <Timer className="w-5 h-5" />
                {timeLeft}s
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-red-950 w-full">
             <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
          
          {/* Left: Image Card */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-200 transform md:-rotate-1 hover:rotate-0 transition-transform duration-300">
              <EmperorImage emperorName={currentQ.emperorName} className="w-full" />
              <div className="mt-4 text-center">
                <h2 className="text-3xl font-calligraphy text-stone-900">{currentQ.emperorName}</h2>
                <div className="inline-block mt-2 px-3 py-1 bg-stone-200 text-stone-600 rounded-full text-sm font-bold tracking-wider">
                  {currentQ.dynasty}
                </div>
                <p className="mt-4 text-stone-600 italic font-serif text-sm leading-relaxed border-t border-stone-100 pt-3">
                  "{currentQ.description}"
                </p>
              </div>
            </div>

            {/* Hint & Skip Controls */}
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-stone-300 text-stone-600 font-bold hover:bg-stone-50 transition-colors ${showHint ? 'opacity-50 cursor-default' : ''}`}
              >
                <HelpCircle className="w-5 h-5" />
                {showHint ? '提示已显示' : '给个提示'}
              </button>
              
              {timeLeft < 25 && (
                <button 
                  onClick={() => handleTimeUp()}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-amber-300 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                  跳过此题
                </button>
              )}
            </div>
            
            {showHint && (
               <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded animate-in fade-in slide-in-from-top-2">
                 <p className="text-amber-900 text-sm">
                   <span className="font-bold">💡 史官密信:</span> {currentQ.hint}
                 </p>
               </div>
            )}
          </div>

          {/* Right: Options */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
             <div className="mb-4">
               <h3 className="text-xl font-bold text-stone-800 mb-2">请选择正确的谥号:</h3>
               <div className="h-1 w-20 bg-red-900 rounded-full"></div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {currentQ.options.map((option, idx) => (
                 <button
                   key={idx}
                   onClick={() => recordAnswer(option, option === currentQ.correctTitle)}
                   className="group relative overflow-hidden bg-white hover:bg-red-50 p-5 rounded-xl border-2 border-stone-200 hover:border-red-800 text-left transition-all duration-200 shadow-sm hover:shadow-md"
                 >
                   <div className="flex items-center justify-between relative z-10">
                     <span className="text-xl font-bold text-stone-800 group-hover:text-red-900 font-serif">
                       {option}
                     </span>
                     <span className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-sm font-mono group-hover:bg-red-100 group-hover:text-red-800 transition-colors">
                       {String.fromCharCode(65 + idx)}
                     </span>
                   </div>
                 </button>
               ))}
             </div>
          </div>

        </main>
      </div>
    );
  };

  const renderResult = () => {
    const rank = getRank(stats.score);

    return (
      <div className="min-h-screen bg-stone-100 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Summary Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-red-900">
            <div className="p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
               <h2 className="text-3xl font-bold text-stone-800 mb-6">殿试结果</h2>
               <div className="flex justify-center mb-8">
                 <RankBadge rank={rank} score={stats.score} />
               </div>
               
               <div className="grid grid-cols-3 gap-4 text-stone-600 border-t border-stone-100 pt-6">
                 <div>
                   <div className="text-2xl font-bold text-stone-800">{stats.totalQuestions}</div>
                   <div className="text-xs uppercase tracking-wide mt-1">总题数</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}</div>
                   <div className="text-xs uppercase tracking-wide mt-1">答对</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-red-600">{stats.totalQuestions - stats.correctAnswers}</div>
                   <div className="text-xs uppercase tracking-wide mt-1">答错</div>
                 </div>
               </div>
            </div>
            
            <div className="bg-stone-50 p-6 flex justify-center">
              <Button onClick={() => startGame()} variant="primary" size="lg" className="w-full md:w-auto shadow-lg">
                <RotateCcw className="w-5 h-5" />
                再来一局
              </Button>
            </div>
          </div>

          {/* Detailed Review */}
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-red-800" />
              起居注 (答题回顾)
            </h3>
            
            <div className="space-y-4">
              {stats.history.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-l-4 ${item.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-stone-800">{idx + 1}. {item.question.emperorName} ({item.question.dynasty})</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {item.isCorrect ? '正确' : '错误'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-stone-500 min-w-[4rem]">你的选择:</span>
                      <span className={`font-medium ${item.isCorrect ? 'text-green-700' : 'text-red-700 line-through'}`}>
                        {item.userAnswer || '未作答'}
                      </span>
                    </div>
                    {!item.isCorrect && (
                      <div className="flex gap-2">
                         <span className="text-stone-500 min-w-[4rem]">正确谥号:</span>
                         <span className="font-bold text-green-700">{item.question.correctTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // --- Router Switch ---
  
  if (gameState === GameState.START) return renderStart();
  if (gameState === GameState.LOADING) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <LoadingSpinner />
    </div>
  );
  if (gameState === GameState.ERROR) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 flex-col p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-stone-800 mb-2">圣旨传达失败</h2>
      <p className="text-stone-600 mb-6">连接太史令（API）时出现问题，请检查网络或 API Key 设置。</p>
      <Button onClick={() => setGameState(GameState.START)} variant="outline">返回主页</Button>
    </div>
  );
  if (gameState === GameState.RESULT) return renderResult();
  
  return renderPlaying();
}