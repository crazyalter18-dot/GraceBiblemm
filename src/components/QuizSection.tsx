import React, { useState } from "react";
import { Award, CheckCircle, XCircle, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { bibleService } from "../services/bibleService";

interface QuizSectionProps {
  uiLang: "en" | "my";
}

export default function QuizSection({ uiLang }: QuizSectionProps) {
  const [questions] = useState(() => bibleService.getQuizQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.answerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const t = {
    en: {
      title: "Scripture Quiz",
      desc: "Challenge your mind and reinforce your Bible knowledge with interactive trivia.",
      score: "Score",
      question: "Question",
      correct: "Correct!",
      incorrect: "Incorrect",
      next: "Next Question",
      finish: "Finish Quiz",
      citation: "Citation:",
      congrats: "Quiz Completed!",
      congratsDesc: "May you continue to grow in the grace and knowledge of our Lord Jesus Christ.",
      restart: "Take Quiz Again"
    },
    my: {
      title: "ကျမ်းစာ ဉာဏ်စမ်း",
      desc: "အပြန်အလှန်မေးခွန်းများဖြင့် သမ္မာကျမ်းစာဗဟုသုတကို တိုးပွားစေပြီး သင့်စိတ်ကို စိန်ခေါ်ပါ။",
      score: "ရမှတ်",
      question: "မေးခွန်း",
      correct: "မှန်ကန်ပါသည်!",
      incorrect: "မှားယွင်းနေပါသည်",
      next: "နောက်တစ်ပုဒ်",
      finish: "ဉာဏ်စမ်းပြီးဆုံးရန်",
      citation: "ကျမ်းကိုးချက်-",
      congrats: "ဉာဏ်စမ်း ပြီးမြောက်ပါပြီ!",
      congratsDesc: "သခင်ယေရှုခရစ်တော်၏ ကျေးဇူးတော်နှင့် သိကျွမ်းခြင်းပညာ၌ ဆက်လက်ကြီးထွားပါစေသော။",
      restart: "ဉာဏ်စမ်း ပြန်လည်ဖြေဆိုရန်"
    }
  }[uiLang];

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-fade-in">
      
      {!quizFinished ? (
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm hover:shadow-md transition-all space-y-6">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.question} {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950/20 px-2.5 py-1 rounded-full">
              {t.score}: {score}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-slate-950 dark:text-slate-100 leading-snug">
              {uiLang === "en" ? currentQuestion.questionEn : currentQuestion.questionMy}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {(uiLang === "en" ? currentQuestion.optionsEn : currentQuestion.optionsMy).map((option, idx) => {
              const isCorrect = idx === currentQuestion.answerIndex;
              const isSelected = idx === selectedOption;
              
              let optionClass = "bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800 text-slate-800 dark:text-slate-300";
              if (isAnswered) {
                if (isCorrect) {
                  optionClass = "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 font-semibold";
                } else if (isSelected) {
                  optionClass = "bg-rose-50 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800 text-rose-800 dark:text-rose-400";
                } else {
                  optionClass = "opacity-50 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${optionClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Answer Citation Tray */}
          {isAnswered && (
            <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 p-4 border border-amber-200/40 text-xs space-y-2 animate-slide-in">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-gold-300 font-bold">
                <ShieldCheck className="h-4 w-4" />
                {selectedOption === currentQuestion.answerIndex ? t.correct : t.incorrect}
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                {t.citation} <span className="font-semibold text-slate-800 dark:text-slate-200">{currentQuestion.citation}</span>
              </p>
            </div>
          )}

          {/* Action Footer */}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 font-bold text-xs py-3.5 shadow-lg shadow-gold-500/10 transition-all active:scale-[0.98]"
            >
              {currentIndex === questions.length - 1 ? t.finish : t.next}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

        </div>
      ) : (
        // RESULTS VIEW
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md transition-all text-center space-y-6 animate-fade-in">
          <Award className="h-16 w-16 text-gold-500 mx-auto animate-bounce" />
          
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-gold-200">
              {t.congrats}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-light max-w-sm mx-auto leading-relaxed">
              {t.congratsDesc}
            </p>
          </div>

          <div className="inline-block px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Your Final Score
            </span>
            <span className="font-serif text-4xl font-extrabold text-gold-600 dark:text-gold-400">
              {score} / {questions.length}
            </span>
            <span className="block text-[11px] font-bold text-slate-400 mt-2">
              {Math.round((score / questions.length) * 100)}% Accuracy
            </span>
          </div>

          <button
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 font-bold text-xs py-3.5 shadow-lg transition-all active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            {t.restart}
          </button>
        </div>
      )}

    </div>
  );
}
