import React, { useState } from "react";
import { BookOpen, Sparkles, Award, BookMarked, Search, ArrowRight, Heart, Share2, Copy, Check } from "lucide-react";
import { BibleBook, BibleVerse } from "../types";
import { bibleService } from "../services/bibleService";

interface HomeSectionProps {
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
  uiLang: "en" | "my";
  primaryLang: "en" | "my" | "bilingual";
  fontSize: number;
  onAddBookmark: (bookId: number, chapter: number, verse: number) => void;
  onRemoveBookmark: (id: string) => void;
  bookmarks: any[];
  recentRead: { bookId: number; chapter: number } | null;
}

export default function HomeSection({
  onNavigate,
  uiLang,
  primaryLang,
  fontSize,
  onAddBookmark,
  onRemoveBookmark,
  bookmarks,
  recentRead
}: HomeSectionProps) {
  const [copied, setCopied] = useState(false);
  const daily = bibleService.getDailyVerse();
  const recentBook = recentRead ? bibleService.getBook(recentRead.bookId) : null;

  // Translations dictionary
  const t = {
    en: {
      welcome: "Welcome to Grace Bible",
      tagline: "Your light and spiritual guide through Scripture",
      dailyVerse: "Verse of the Day",
      continueReading: "Continue Reading",
      startYourDay: "Let's read where you left off:",
      oldTestament: "Old Testament",
      newTestament: "New Testament",
      otCount: "39 Books of law, history, poetry, and prophets",
      ntCount: "27 Books of the Gospels, history, and letters",
      searchHint: "Search by word, book, or verse...",
      searchButton: "Search",
      quickTools: "Study Tools",
      aiHelper: "Grace AI Helper",
      aiHelperDesc: "Ask theological questions & explain verses",
      quiz: "Bible Quiz",
      quizDesc: "Test your Scripture knowledge",
      dict: "Bible Dictionary",
      dictDesc: "Look up biblical words & translations",
      shareImage: "Generate Card",
      copied: "Copied!",
      copy: "Copy Verse",
      favorite: "Add Favorite",
      isFavorited: "Favorited"
    },
    my: {
      welcome: "Grace သမ္မာကျမ်းစာမှ ကြိုဆိုပါ၏",
      tagline: "နှုတ်ကပတ်တော်အားဖြင့် သင့်ဘဝအတွက် အလင်းနှင့် ဝိညာဉ်ရေးရာလမ်းပြခြင်း",
      dailyVerse: "ယနေ့အတွက် သမ္မာကျမ်းစာ",
      continueReading: "ဆက်လက်ဖတ်ရှုရန်",
      startYourDay: "သင်နောက်ဆုံး ဖတ်ရှုခဲ့သည့်နေရာမှ စတင်ပါ-",
      oldTestament: "ဓမ္မဟောင်းကျမ်း",
      newTestament: "ဓမ္မသစ်ကျမ်း",
      otCount: "ပညတ်တရား၊ သမိုင်း၊ ကဗျာနှင့် ပရောဖက်ကျမ်း ၃၉ စောင်",
      ntCount: "ခရစ်ဝင်ကျမ်း၊ သမိုင်းနှင့် သြဝါဒစာ ၂၇ စောင်",
      searchHint: "စကားလုံး၊ ကျမ်းစာစောင် သို့မဟုတ် ကျမ်းပိုဒ်ဖြင့် ရှာဖွေပါ...",
      searchButton: "ရှာဖွေရန်",
      quickTools: "ကျမ်းစာလေ့လာရေးကိရိယာများ",
      aiHelper: "Grace AI အကူအညီပေးသူ",
      aiHelperDesc: "ဓမ္မပညာမေးခွန်းများမေးရန်နှင့် ကျမ်းချက်များကိုရှင်းပြရန်",
      quiz: "ကျမ်းစာဉာဏ်စမ်း",
      quizDesc: "နှုတ်ကပတ်တော်ဗဟုသုတကို စမ်းသပ်ပါ",
      dict: "ကျမ်းစာအဘိဓာန်",
      dictDesc: "ကျမ်းစာစကားလုံးများနှင့် ဘာသာပြန်များကို ရှာဖွေရန်",
      shareImage: "ပုံရိပ်ဖန်တီးရန်",
      copied: "ကူးယူပြီးပြီ!",
      copy: "ကျမ်းချက်ကူးယူရန်",
      favorite: "မှတ်သားရန်",
      isFavorited: "မှတ်သားပြီး"
    }
  }[uiLang];

  const handleCopy = () => {
    const text = `${daily.book.nameEn} ${daily.verse.chapter}:${daily.verse.verse}\n"${daily.verse.textEn}"\n\n${daily.book.nameMy} ${daily.verse.chapter}:${daily.verse.verse}\n"${daily.verse.textMy}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = bookmarks.some(
    (b) => b.bookId === daily.verse.bookId && b.chapter === daily.verse.chapter && b.verse === daily.verse.verse
  );

  const toggleFavorite = () => {
    const favId = `${daily.verse.bookId}-${daily.verse.chapter}-${daily.verse.verse}`;
    if (isFav) {
      onRemoveBookmark(favId);
    } else {
      onAddBookmark(daily.verse.bookId, daily.verse.chapter, daily.verse.verse);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-900 via-slate-950 to-black p-8 md:p-12 text-white shadow-2xl border border-gold-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-3.5 py-1 text-sm font-medium text-gold-300 backdrop-blur-sm border border-gold-500/30">
            <Sparkles className="h-4 w-4" />
            Grace Bible
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-gold-100">
            {t.welcome}
          </h1>
          <p className="text-slate-300 md:text-lg max-w-xl font-light">
            {t.tagline}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Daily Verse & Continue Reading */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Verse Card */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-500"></div>
            
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-serif text-xl font-semibold text-slate-800 dark:text-gold-200 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold-500" />
                {t.dailyVerse}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFav 
                      ? "bg-rose-50 text-rose-500 dark:bg-rose-950/30" 
                      : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title={isFav ? t.isFavorited : t.favorite}
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title={t.copy}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => onNavigate("bible", daily.verse.bookId, daily.verse.chapter)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Open Reader"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* English Version */}
              {(primaryLang === "en" || primaryLang === "bilingual") && (
                <p className="text-slate-700 dark:text-slate-300 font-serif italic text-lg leading-relaxed">
                  "{daily.verse.textEn}"
                </p>
              )}
              {/* Myanmar Version */}
              {(primaryLang === "my" || primaryLang === "bilingual") && (
                <p className="text-slate-800 dark:text-slate-100 myanmar-font text-lg leading-relaxed font-normal">
                  "{daily.verse.textMy}"
                </p>
              )}
              
              <div className="mt-3 flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {uiLang === "en" ? "Judson Translation / KJV" : "ဆရာကြီး ယုဒသံ ဘာသာပြန် / KJV"}
                </span>
                <span className="font-serif font-semibold text-gold-600 dark:text-gold-400 text-sm tracking-wide">
                  — {uiLang === "en" ? daily.book.nameEn : daily.book.nameMy} {daily.verse.chapter}:{daily.verse.verse}
                </span>
              </div>
            </div>

            {/* Simulated social card export */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => onNavigate("bible", daily.verse.bookId, daily.verse.chapter)}
                className="text-xs font-semibold text-gold-500 hover:text-gold-600 flex items-center gap-1 transition-colors"
              >
                {uiLang === "en" ? "Study This Passage" : "ကျမ်းပိုဒ်လေ့လာရန်"} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Continue Reading / Recently Read */}
          {recentRead && (
            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-r from-blue-50/50 to-gold-50/20 dark:from-slate-900/40 dark:to-slate-900/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t.continueReading}
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {t.startYourDay}{" "}
                  <span className="text-gold-600 dark:text-gold-400 font-bold font-serif">
                    {uiLang === "en" ? recentBook?.nameEn : recentBook?.nameMy} {recentRead.chapter}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onNavigate("bible", recentRead.bookId, recentRead.chapter)}
                className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-600 dark:bg-gold-600 dark:hover:bg-gold-500 text-white font-semibold text-sm px-5 py-2.5 shadow-lg shadow-gold-500/20 transition-all active:scale-[0.98]"
              >
                <BookOpen className="h-4 w-4" />
                {uiLang === "en" ? "Open Now" : "ယခုဖတ်ရန်"}
              </button>
            </div>
          )}

          {/* Old Testament / New Testament quick access cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* OT Card */}
            <div 
              onClick={() => onNavigate("bible", 1, 1)}
              className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all hover:border-gold-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-gold-500 group-hover:bg-amber-100 transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-gold-500 transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-850 dark:text-slate-100">
                {t.oldTestament}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-normal">
                {t.otCount}
              </p>
            </div>

            {/* NT Card */}
            <div 
              onClick={() => onNavigate("bible", 40, 1)}
              className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 group-hover:bg-blue-100 transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-850 dark:text-slate-100">
                {t.newTestament}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-normal">
                {t.ntCount}
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Tools & Quick Navigation */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {t.quickTools}
          </h2>

          {/* Grace AI Chat card */}
          <div 
            onClick={() => onNavigate("ai")}
            className="group cursor-pointer rounded-2xl border border-gold-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-xl hover:-translate-y-0.5 transition-all relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl group-hover:bg-gold-400/20 transition-all"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/30">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-serif text-lg font-bold text-gold-100">
                {t.aiHelper}
              </h3>
            </div>
            <p className="text-slate-300 text-xs font-light leading-relaxed">
              {t.aiHelperDesc}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:text-gold-300">
              {uiLang === "en" ? "Chat Now" : "စကားပြောရန်"} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Bible Quiz card */}
          <div 
            onClick={() => onNavigate("quiz")}
            className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all hover:border-gold-200 flex items-start gap-4"
          >
            <div className="p-3 rounded-xl bg-gold-50 dark:bg-gold-950/20 text-gold-500 group-hover:bg-gold-100 transition-colors">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-slate-850 dark:text-slate-200">
                {t.quiz}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {t.quizDesc}
              </p>
            </div>
          </div>

          {/* Bible Dictionary card */}
          <div 
            onClick={() => onNavigate("dictionary")}
            className="group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200 flex items-start gap-4"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 group-hover:bg-blue-100 transition-colors">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-slate-850 dark:text-slate-200">
                {t.dict}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {t.dictDesc}
              </p>
            </div>
          </div>

          {/* Quick Book Selection Panel */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="h-4 w-4 text-gold-500" />
              {uiLang === "en" ? "Quick Book Jump" : "ကျမ်းစာစောင် အမြန်ကူးရန်"}
            </h3>
            
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {bibleService.getBooks().slice(0, 16).map((book) => (
                <button
                  key={book.id}
                  onClick={() => onNavigate("bible", book.id, 1)}
                  className="text-left text-xs font-medium px-3 py-2 rounded-lg bg-slate-50 hover:bg-gold-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 hover:text-gold-700 dark:text-slate-300 dark:hover:text-gold-300 transition-all truncate border border-transparent hover:border-gold-200"
                >
                  {uiLang === "en" ? book.nameEn : book.nameMy}
                </button>
              ))}
            </div>
            <div className="text-center pt-2">
              <button 
                onClick={() => onNavigate("bible", 43, 1)}
                className="text-xs font-semibold text-gold-500 hover:text-gold-600 hover:underline"
              >
                {uiLang === "en" ? "See All 66 Books" : "ကျမ်းစောင် ၆၆ စောင်လုံးကြည့်ရန်"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
