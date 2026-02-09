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
      case Rank.GANG: return "bg-yellow-500 text-yellow-950 border-yellow-300";
      case Rank.TOP_TIER: return "bg-purple-600 text-purple-100 border-purple-400";
      case Rank.SUPERIOR: return "bg-blue-600 text-blue-100 border-blue-400";
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

// --- Game Config ---
const MIN_QUESTIONS = 12;
const MAX_QUESTIONS = 17;

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
      const q = await fetchQuestions(MAX_QUESTIONS);
      setQuestions(q);
      setStats({ score: 0, totalQuestions: 0, correctAnswers: 0, history: [] });
      setCurrentQIndex(0);
      setGameState(GameState.PLAYING);
      startTimer();
    } catch (e) {
      console.error(e);
      setGameState(GameState.ERROR);
    }
  };

  /**
   * Decide whether to end the game based on how many questions have been
   * answered and the player's running accuracy.
   *  - Always play at least MIN_QUESTIONS (12).
   *  - If accuracy >= 60%: keep going (decent player, let them challenge more).
   *  - If accuracy < 40%: stop (mercy rule, struggling too much).
   *  - Between 40%-60%: increasingly likely to stop with each extra question.
   *  - Hard cap at MAX_QUESTIONS (17).
   */
  const shouldEndGame = (currentStats: GameStats): boolean => {
    const answered = currentStats.history.length;
    if (answered < MIN_QUESTIONS) return false;
    if (answered >= MAX_QUESTIONS) return true;

    const accuracy = currentStats.correctAnswers / answered;
    if (accuracy >= 0.6) return false;   // doing okay or better → keep going
    if (accuracy < 0.4) return true;     // struggling → mercy stop

    // 40%-60%: gradually increase chance of ending
    const extra = answered - MIN_QUESTIONS;
    return Math.random() < 0.25 + extra * 0.15;
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

    // Small delay, then decide whether to continue or finish
    setTimeout(() => {
      const hasMore = currentQIndex < questions.length - 1;
      if (hasMore && !shouldEndGame(newStats)) {
        setCurrentQIndex(prev => prev + 1);
        startTimer();
      } else {
        finishGame(newStats);
      }
    }, 500);
  };

  const finishGame = (finalStats: GameStats) => {
    const totalAnswered = finalStats.history.length;
    const finalScore = Math.round((finalStats.correctAnswers / totalAnswered) * 100);
    setStats({ ...finalStats, score: finalScore, totalQuestions: totalAnswered });
    setGameState(GameState.RESULT);
  };

  const getRank = (score: number): Rank => {
    if (score === 100) return Rank.GANG;
    if (score >= 80) return Rank.TOP_TIER;
    if (score >= 60) return Rank.SUPERIOR;
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
          帝号猜猜乐
        </h1>
        <p className="text-stone-700 text-lg mb-8 font-serif leading-relaxed">
          庙号谥号，你分得清吗？<br/>
          是"文"是"武"，是"高"是"太"？<br/>
          来测试一下你的历史含金量！
        </p>
        <Button size="lg" onClick={startGame} className="w-full">
          开始廷试
        </Button>
        <div className="mt-4 text-xs text-stone-500">
          * 题目来自精选题库，每局随机出题
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const currentQ = questions[currentQIndex];
    if (!currentQ) return <LoadingSpinner />;

    const progress = ((currentQIndex) / MAX_QUESTIONS) * 100;

    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        {/* Header */}
        <header className="bg-red-900 text-amber-50 p-4 shadow-lg sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
               <History className="w-5 h-5" />
               <span className="font-bold">第 {currentQIndex + 1} 题</span>
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
          
          {/* Left: Emperor Card */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-200 transform md:-rotate-1 hover:rotate-0 transition-transform duration-300">
              <EmperorImage image={currentQ.image} dramaImage={currentQ.dramaImage} emperorName={currentQ.emperorName} className="w-full" />
              <div className="mt-4 text-center">
                <h2 className="text-3xl font-calligraphy text-stone-900">{currentQ.emperorName}</h2>

                {/* Fill-in-the-blank Template */}
                <div className="mt-4 flex items-center justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-calligraphy text-stone-700 leading-none">
                    {currentQ.templatePrefix}
                  </span>
                  <span className="inline-flex items-center justify-center mx-1 min-w-[3.5rem] h-14 md:h-16 px-3 border-[3px] border-amber-500 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/80 animate-seal-glow">
                    <span className="text-2xl md:text-3xl text-amber-500/80 font-calligraphy select-none">？</span>
                  </span>
                  <span className="text-4xl md:text-5xl font-calligraphy text-stone-700 leading-none">
                    {currentQ.templateSuffix}
                  </span>
                </div>

                {/* Dynasty + Question Type badges */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="inline-block px-3 py-1 bg-stone-200 text-stone-600 rounded-full text-sm font-bold tracking-wider">
                    {currentQ.dynasty}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wider ${
                    currentQ.questionType === '庙号'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    猜{currentQ.questionType}
                  </span>
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
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
             <div>
               <h3 className="text-xl font-bold text-stone-800 mb-2">
                 {currentQ.questionType === '庙号' ? '请选出正确的庙号:' : '请选出正确的谥号:'}
               </h3>
               <div className="h-1 w-20 bg-red-900 rounded-full"></div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               {currentQ.options.map((option, idx) => (
                 <button
                   key={idx}
                   onClick={() => recordAnswer(option, option === currentQ.correctAnswer)}
                   className="group relative overflow-hidden bg-white hover:bg-red-50 py-6 px-4 rounded-xl border-2 border-stone-200 hover:border-red-800 text-center transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-[1.03]"
                 >
                   <div className="flex flex-col items-center gap-2 relative z-10">
                     <span className="text-3xl font-calligraphy font-bold text-stone-800 group-hover:text-red-900">
                       {option}
                     </span>
                     <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-xs font-mono group-hover:bg-red-100 group-hover:text-red-800 transition-colors">
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
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">{idx + 1}. {item.question.emperorName} ({item.question.dynasty})</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        item.question.questionType === '庙号'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.question.questionType}
                      </span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {item.isCorrect ? '正确' : '错误'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-stone-500 min-w-[4rem]">你的选择:</span>
                      <span className={`font-medium ${item.isCorrect ? 'text-green-700' : 'text-red-700 line-through'}`}>
                        {item.userAnswer
                          ? `${item.question.templatePrefix}${item.userAnswer}${item.question.templateSuffix}`
                          : '未作答'}
                      </span>
                    </div>
                    {!item.isCorrect && (
                      <div className="flex gap-2">
                         <span className="text-stone-500 min-w-[4rem]">正确答案:</span>
                         <span className="font-bold text-green-700">
                           {item.question.templatePrefix}{item.question.correctAnswer}{item.question.templateSuffix}
                         </span>
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
      <p className="text-stone-600 mb-6">加载题目时出现问题，请刷新页面重试。</p>
      <Button onClick={() => setGameState(GameState.START)} variant="outline">返回主页</Button>
    </div>
  );
  if (gameState === GameState.RESULT) return renderResult();
  
  return renderPlaying();
}