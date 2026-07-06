import React, { useState, useEffect } from "react";
import { 
  Home, BookOpen, Search, Compass, Sparkles, Award, BookMarked, 
  Bookmark, Settings, Sun, Moon, SunDim, Languages, Menu, X, Check, Bell 
} from "lucide-react";
import { BibleSettings, Bookmark as BookmarkType, VerseHighlight, VerseNote, ReadingPlanProgress, BibleVerse } from "./types";
import HomeSection from "./components/HomeSection";
import ReaderSection from "./components/ReaderSection";
import SearchSection from "./components/SearchSection";
import PlansSection from "./components/PlansSection";
import GraceAiSection from "./components/GraceAiSection";
import QuizSection from "./components/QuizSection";
import DictionarySection from "./components/DictionarySection";
import BookmarksSection from "./components/BookmarksSection";
import SettingsSection from "./components/SettingsSection";

export default function App() {
  // 1. Central Preferences State (loads from localStorage with pristine fallbacks)
  const [settings, setSettings] = useState<BibleSettings>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse settings:", e);
    }
    return {
      primaryLanguage: "bilingual", // default Side-by-Side English & Myanmar
      uiLanguage: "my", // default Myanmar UI
      fontSize: 18,
      theme: "light",
      dailyNotification: true
    };
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("grace_bible_active_tab") || "home";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 3. Current Book & Chapter State
  const [currentBookId, setCurrentBookId] = useState<number>(() => {
    return Number(localStorage.getItem("grace_bible_recent_book_id")) || 43; // default: John
  });
  const [currentChapter, setCurrentChapter] = useState<number>(() => {
    return Number(localStorage.getItem("grace_bible_recent_chapter")) || 1; // default: Chapter 1
  });

  // 4. Study Binder states (Bookmarks, highlights, notes, plans progress)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [highlights, setHighlights] = useState<VerseHighlight[]>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_highlights");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [notes, setNotes] = useState<VerseNote[]>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_notes");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [planProgress, setPlanProgress] = useState<ReadingPlanProgress[]>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_plan_progress");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // AI interactive context trigger
  const [aiContext, setAiContext] = useState<{ verse: BibleVerse; bookName: string } | null>(null);

  // Sync settings & HTML Theme classes on load/change
  useEffect(() => {
    localStorage.setItem("grace_bible_settings", JSON.stringify(settings));
    
    // Apply theme
    const html = document.documentElement;
    html.classList.remove("dark", "sepia");
    if (settings.theme === "dark") {
      html.classList.add("dark");
    } else if (settings.theme === "sepia") {
      html.classList.add("sepia");
    }
  }, [settings]);

  // Sync binder states
  useEffect(() => {
    localStorage.setItem("grace_bible_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("grace_bible_highlights", JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem("grace_bible_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("grace_bible_plan_progress", JSON.stringify(planProgress));
  }, [planProgress]);

  // Track active tab & book jump parameters
  useEffect(() => {
    localStorage.setItem("grace_bible_active_tab", activeTab);
  }, [activeTab]);

  const updateSettings = (key: keyof BibleSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBookChapterChange = (bookId: number, chapter: number) => {
    setCurrentBookId(bookId);
    setCurrentChapter(chapter);
    localStorage.setItem("grace_bible_recent_book_id", bookId.toString());
    localStorage.setItem("grace_bible_recent_chapter", chapter.toString());
  };

  // Central functions to modify binder
  const handleAddBookmark = (bookId: number, chapter: number, verse: number) => {
    const newBookmark: BookmarkType = {
      id: `${bookId}-${chapter}-${verse}`,
      bookId,
      chapter,
      verse,
      timestamp: Date.now()
    };
    setBookmarks((prev) => [...prev.filter(b => b.id !== newBookmark.id), newBookmark]);
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddHighlight = (bookId: number, chapter: number, verse: number, color: string) => {
    const newHighlight: VerseHighlight = {
      id: `${bookId}-${chapter}-${verse}`,
      bookId,
      chapter,
      verse,
      color,
      timestamp: Date.now()
    };
    setHighlights((prev) => [...prev.filter(h => h.id !== newHighlight.id), newHighlight]);
  };

  const handleRemoveHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddNote = (bookId: number, chapter: number, verse: number, text: string) => {
    const newNote: VerseNote = {
      id: `${bookId}-${chapter}-${verse}`,
      bookId,
      chapter,
      verse,
      text,
      timestamp: Date.now()
    };
    setNotes((prev) => [...prev.filter(n => n.id !== newNote.id), newNote]);
  };

  const handleRemoveNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePlanDay = (planId: string, day: number) => {
    setPlanProgress((prev) => {
      const existing = prev.find((p) => p.planId === planId);
      if (existing) {
        const isCompleted = existing.completedDays.includes(day);
        const newDays = isCompleted
          ? existing.completedDays.filter((d) => d !== day)
          : [...existing.completedDays, day];
        
        return [
          ...prev.filter((p) => p.planId !== planId),
          { ...existing, completedDays: newDays }
        ];
      } else {
        return [
          ...prev,
          { planId, completedDays: [day], startDate: Date.now() }
        ];
      }
    });
  };

  const handleClearAllData = () => {
    setBookmarks([]);
    setHighlights([]);
    setNotes([]);
    setPlanProgress([]);
    localStorage.removeItem("grace_bible_bookmarks");
    localStorage.removeItem("grace_bible_highlights");
    localStorage.removeItem("grace_bible_notes");
    localStorage.removeItem("grace_bible_plan_progress");
    localStorage.removeItem("grace_bible_recent_book_id");
    localStorage.removeItem("grace_bible_recent_chapter");
    setCurrentBookId(43);
    setCurrentChapter(1);
    alert("Data cleared successfully.");
  };

  const handleExplainVerse = (verse: BibleVerse, bookName: string) => {
    setAiContext({ verse, bookName });
    setActiveTab("ai");
  };

  const handleJumpToReader = (tabName: string, bookId?: number, chapter?: number) => {
    if (bookId && chapter) {
      handleBookChapterChange(bookId, chapter);
    }
    setActiveTab(tabName);
  };

  const uiLang = settings.uiLanguage;

  // Sidebar Items dictionary with translations
  const sidebarItems = [
    { id: "home", labelEn: "Home", labelMy: "ပင်မမျက်နှာစာ", icon: Home },
    { id: "bible", labelEn: "Bible Reader", labelMy: "ကျမ်းစာဖတ်ခန်း", icon: BookOpen },
    { id: "search", labelEn: "Search Scripture", labelMy: "ကျမ်းစာရှာဖွေရန်", icon: Search },
    { id: "plans", labelEn: "Reading Plans", labelMy: "ဖတ်ရှုခြင်းအစီအစဉ်", icon: Compass },
    { id: "ai", labelEn: "Grace AI Helper", labelMy: "Grace AI အကူ", icon: Sparkles },
    { id: "quiz", labelEn: "Bible Quiz", labelMy: "ကျမ်းစာဉာဏ်စမ်း", icon: Award },
    { id: "dictionary", labelEn: "Dictionary", labelMy: "ကျမ်းစာအဘိဓာန်", icon: BookMarked },
    { id: "binder", labelEn: "Study Binder", labelMy: "လေ့လာရေးမှတ်တမ်း", icon: Bookmark },
    { id: "settings", labelEn: "Settings", labelMy: "စနစ်သတ်မှတ်ချက်", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#fcfbfa] dark:bg-slate-950 dark:text-slate-100 sepia:bg-gold-50 sepia:text-gold-900 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. Mobile Header bar */}
      <div className="md:hidden p-4 bg-white dark:bg-slate-900 sepia:bg-gold-100/60 border-b border-slate-100 dark:border-slate-800 sepia:border-gold-200/40 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg text-gold-600 dark:text-gold-400">
            Grace Bible
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick theme toggler */}
          <button
            onClick={() => {
              const nextTheme = settings.theme === "light" ? "sepia" : settings.theme === "sepia" ? "dark" : "light";
              updateSettings("theme", nextTheme);
            }}
            className="p-2 text-slate-500 dark:text-slate-400 sepia:text-gold-700 hover:bg-slate-100 dark:hover:bg-slate-800 sepia:hover:bg-gold-200/50 rounded-xl transition-all"
            title={uiLang === "en" ? "Change Reading Color" : "အလင်းအမှောင် ပြောင်းလဲရန်"}
          >
            {settings.theme === "light" ? (
              <SunDim className="h-4.5 w-4.5" />
            ) : settings.theme === "sepia" ? (
              <Moon className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-gold-400" />
            )}
          </button>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 2. Responsive Left Sidebar Drawer */}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-850 p-5 z-50 flex flex-col justify-between shadow-xl md:shadow-none transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Logo Heading */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-sm shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-slate-850 dark:text-gold-100 text-base leading-tight tracking-tight">
                  Grace Bible
                </h2>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                  မြန်မာ - ENGLISH
                </span>
              </div>
            </div>
            {/* Close drawer button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                    isActive
                      ? "bg-slate-900 border-l-4 border-gold-500 text-white shadow-sm dark:bg-slate-800"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{uiLang === "en" ? item.labelEn : item.labelMy}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          
          {/* Quick Language Toggle */}
          <div className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850">
            <span className="text-[10px] text-slate-400 px-2 font-bold uppercase tracking-wider">
              UI
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => updateSettings("uiLanguage", "my")}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  uiLang === "my"
                    ? "bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-400 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                မြန်မာ
              </button>
              <button
                onClick={() => updateSettings("uiLanguage", "en")}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                  uiLang === "en"
                    ? "bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-400 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Quick theme mode toggler on desktop */}
          <div className="hidden md:flex justify-between items-center text-xs text-slate-400 sepia:text-gold-700">
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              {uiLang === "en" ? "Theme" : "အသွင်အပြင်"}
            </span>
            <button
              onClick={() => {
                const nextTheme = settings.theme === "light" ? "sepia" : settings.theme === "sepia" ? "dark" : "light";
                updateSettings("theme", nextTheme);
              }}
              className="p-1.5 rounded-lg text-slate-400 sepia:text-gold-600 hover:text-slate-700 dark:hover:text-slate-200 sepia:hover:bg-gold-200/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              title={uiLang === "en" ? "Change Theme" : "နောက်ခံအရောင်ပြောင်းရန်"}
            >
              <span className="text-[10px] font-bold tracking-tight capitalize">
                {settings.theme === "light" ? (uiLang === "en" ? "Light" : "လင်း") : settings.theme === "sepia" ? (uiLang === "en" ? "Sepia" : "ဝါနု") : (uiLang === "en" ? "Dark" : "မှောင်")}
              </span>
              {settings.theme === "light" ? (
                <SunDim className="h-4 w-4" />
              ) : settings.theme === "sepia" ? (
                <Moon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <Sun className="h-4 w-4 text-gold-400" />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 3. Main Workspace Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        
        {activeTab === "home" && (
          <HomeSection
            onNavigate={handleJumpToReader}
            uiLang={uiLang}
            primaryLang={settings.primaryLanguage}
            fontSize={settings.fontSize}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            bookmarks={bookmarks}
            recentRead={{ bookId: currentBookId, chapter: currentChapter }}
          />
        )}

        {activeTab === "bible" && (
          <ReaderSection
            currentBookId={currentBookId}
            currentChapter={currentChapter}
            onBookChapterChange={handleBookChapterChange}
            uiLang={uiLang}
            primaryLang={settings.primaryLanguage}
            setPrimaryLang={(lang) => updateSettings("primaryLanguage", lang)}
            fontSize={settings.fontSize}
            setFontSize={(size) => updateSettings("fontSize", size)}
            theme={settings.theme}
            setTheme={(newTheme) => updateSettings("theme", newTheme)}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            highlights={highlights}
            onAddHighlight={handleAddHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            notes={notes}
            onAddNote={handleAddNote}
            onRemoveNote={handleRemoveNote}
            onExplainVerse={handleExplainVerse}
          />
        )}

        {activeTab === "search" && (
          <SearchSection
            onNavigate={handleJumpToReader}
            uiLang={uiLang}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={(id) => handleRemoveBookmark(id)}
            onExplainVerse={handleExplainVerse}
          />
        )}

        {activeTab === "plans" && (
          <PlansSection
            onNavigate={handleJumpToReader}
            uiLang={uiLang}
            planProgress={planProgress}
            onTogglePlanDay={handleTogglePlanDay}
          />
        )}

        {activeTab === "ai" && (
          <GraceAiSection
            uiLang={uiLang}
            aiContext={aiContext}
            clearAiContext={() => setAiContext(null)}
            onNavigate={handleJumpToReader}
          />
        )}

        {activeTab === "quiz" && (
          <QuizSection
            uiLang={uiLang}
          />
        )}

        {activeTab === "dictionary" && (
          <DictionarySection
            onNavigate={handleJumpToReader}
            uiLang={uiLang}
          />
        )}

        {activeTab === "binder" && (
          <BookmarksSection
            onNavigate={handleJumpToReader}
            uiLang={uiLang}
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            highlights={highlights}
            onRemoveHighlight={handleRemoveHighlight}
            notes={notes}
            onRemoveNote={handleRemoveNote}
          />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            settings={settings}
            updateSettings={updateSettings}
            uiLang={uiLang}
            onClearAllData={handleClearAllData}
          />
        )}

      </main>
    </div>
  );
}
