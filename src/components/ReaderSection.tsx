import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Languages, Type, Copy, Share2, Bookmark, BookmarkCheck, 
  MessageSquare, ChevronLeft, ChevronRight, Check, Sparkles, Highlighter,
  Sun, Moon, SunDim
} from "lucide-react";
import { bibleService } from "../services/bibleService";
import { BibleBook, BibleVerse, Bookmark as BookmarkType, VerseHighlight, VerseNote } from "../types";

interface ReaderSectionProps {
  currentBookId: number;
  currentChapter: number;
  onBookChapterChange: (bookId: number, chapter: number) => void;
  uiLang: "en" | "my";
  primaryLang: "en" | "my" | "bilingual";
  setPrimaryLang: (lang: "en" | "my" | "bilingual") => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: "light" | "dark" | "sepia";
  setTheme: (theme: "light" | "dark" | "sepia") => void;
  bookmarks: BookmarkType[];
  onAddBookmark: (bookId: number, chapter: number, verse: number) => void;
  onRemoveBookmark: (id: string) => void;
  highlights: VerseHighlight[];
  onAddHighlight: (bookId: number, chapter: number, verse: number, color: string) => void;
  onRemoveHighlight: (id: string) => void;
  notes: VerseNote[];
  onAddNote: (bookId: number, chapter: number, verse: number, text: string) => void;
  onRemoveNote: (id: string) => void;
  onExplainVerse: (verse: BibleVerse, bookName: string) => void;
}

export default function ReaderSection({
  currentBookId,
  currentChapter,
  onBookChapterChange,
  uiLang,
  primaryLang,
  setPrimaryLang,
  fontSize,
  setFontSize,
  theme,
  setTheme,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  notes,
  onAddNote,
  onRemoveNote,
  onExplainVerse
}: ReaderSectionProps) {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "OT" | "NT">("ALL");
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const books = bibleService.getBooks();
  const currentBook = bibleService.getBook(currentBookId) || books[0];
  const chapters = bibleService.getChapters(currentBookId);

  // Sync scroll on book or chapter change & load verses asynchronously
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    bibleService.getVersesAsync(currentBookId, currentChapter)
      .then((data) => {
        if (active) {
          setVerses(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading verses:", err);
        if (active) {
          setIsLoading(false);
        }
      });

    topRef.current?.scrollIntoView({ behavior: "smooth" });
    setSelectedVerse(null);

    return () => {
      active = false;
    };
  }, [currentBookId, currentChapter]);

  const handleBookSelect = (bookId: number) => {
    onBookChapterChange(bookId, 1);
    setShowBookSelector(false);
    setShowChapterSelector(true);
  };

  const handleChapterSelect = (ch: number) => {
    onBookChapterChange(currentBookId, ch);
    setShowChapterSelector(false);
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onBookChapterChange(currentBookId, currentChapter - 1);
    } else {
      // Go to previous book's last chapter
      const prevBookId = currentBookId > 1 ? currentBookId - 1 : 66;
      const prevBook = bibleService.getBook(prevBookId);
      if (prevBook) {
        onBookChapterChange(prevBookId, prevBook.totalChapters);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.totalChapters) {
      onBookChapterChange(currentBookId, currentChapter + 1);
    } else {
      // Go to next book's first chapter
      const nextBookId = currentBookId < 66 ? currentBookId + 1 : 1;
      onBookChapterChange(nextBookId, 1);
    }
  };

  const handleVerseClick = (v: BibleVerse) => {
    if (selectedVerse && selectedVerse.verse === v.verse && selectedVerse.bookId === v.bookId && selectedVerse.chapter === v.chapter) {
      setSelectedVerse(null);
      setNoteText("");
      setShowNoteEditor(false);
    } else {
      setSelectedVerse(v);
      const existingNote = notes.find(n => n.bookId === v.bookId && n.chapter === v.chapter && n.verse === v.verse);
      setNoteText(existingNote ? existingNote.text : "");
      setShowNoteEditor(false);
    }
  };

  const isVerseBookmarked = (verseNum: number) => {
    const id = `${currentBookId}-${currentChapter}-${verseNum}`;
    return bookmarks.some(b => b.id === id);
  };

  const handleToggleBookmark = (v: BibleVerse) => {
    const id = `${v.bookId}-${v.chapter}-${v.verse}`;
    if (isVerseBookmarked(v.verse)) {
      onRemoveBookmark(id);
    } else {
      onAddBookmark(v.bookId, v.chapter, v.verse);
    }
  };

  const getVerseHighlight = (verseNum: number) => {
    const id = `${currentBookId}-${currentChapter}-${verseNum}`;
    return highlights.find(h => h.id === id);
  };

  const getVerseNote = (verseNum: number) => {
    const id = `${currentBookId}-${currentChapter}-${verseNum}`;
    return notes.find(n => n.id === id);
  };

  const handleCopyVerse = (v: BibleVerse) => {
    const textToCopy = `[${currentBook.nameEn} ${v.chapter}:${v.verse}] \n${v.textEn} \n\n[${currentBook.nameMy} ${v.chapter}:${v.verse}] \n${v.textMy}`;
    navigator.clipboard.writeText(textToCopy);
    const id = `${v.bookId}-${v.chapter}-${v.verse}`;
    setCopiedVerseId(id);
    setTimeout(() => setCopiedVerseId(null), 2000);
  };

  const handleSaveNote = () => {
    if (selectedVerse) {
      if (noteText.trim() === "") {
        onRemoveNote(`${selectedVerse.bookId}-${selectedVerse.chapter}-${selectedVerse.verse}`);
      } else {
        onAddNote(selectedVerse.bookId, selectedVerse.chapter, selectedVerse.verse, noteText);
      }
      setShowNoteEditor(false);
    }
  };

  const filteredBooks = books.filter(b => {
    if (testamentFilter === "ALL") return true;
    return b.testament === testamentFilter;
  });

  const highlightColors = [
    { class: "bg-yellow-200/60 dark:bg-yellow-900/40 text-black dark:text-slate-100", label: "Yellow" },
    { class: "bg-blue-200/60 dark:bg-blue-900/40 text-black dark:text-slate-100", label: "Blue" },
    { class: "bg-green-200/60 dark:bg-green-900/40 text-black dark:text-slate-100", label: "Green" },
    { class: "bg-rose-200/60 dark:bg-rose-900/40 text-black dark:text-slate-100", label: "Rose" },
    { class: "bg-purple-200/60 dark:bg-purple-900/40 text-black dark:text-slate-100", label: "Purple" }
  ];

  // Language translation dictionary
  const t = {
    en: {
      selectBook: "Select Book",
      selectChapter: "Select Chapter",
      sidebarNote: "Select a verse to highlight, bookmark, add study notes, or explain with AI companion.",
      bilingual: "Side-by-Side",
      english: "English",
      myanmar: "Myanmar",
      actionCopy: "Copy Verse",
      actionBookmark: "Bookmark",
      actionNote: "Personal Notes",
      actionExplain: "AI Explanation",
      save: "Save Note",
      notePlaceholder: "Add your personal notes or prayer regarding this verse...",
      prev: "Prev",
      next: "Next"
    },
    my: {
      selectBook: "ကျမ်းစာစောင်ရွေးရန်",
      selectChapter: "အခန်းကြီးရွေးရန်",
      sidebarNote: "ကျမ်းပိုဒ်တစ်ခုကိုနှိပ်၍ အရောင်မှတ်သားခြင်း၊ စာအုပ်ညှပ်ခြင်း၊ မှတ်စုရေးခြင်း သို့မဟုတ် AI ဖြင့်လေ့လာခြင်းများ လုပ်ဆောင်ပါ။",
      bilingual: "နှစ်ဘာသာတွဲ",
      english: "အင်္ဂလိပ်ကျမ်း",
      myanmar: "မြန်မာကျမ်း",
      actionCopy: "ကျမ်းချက်ကူးရန်",
      actionBookmark: "စာအုပ်ညှပ်ရန်",
      actionNote: "ကိုယ်ပိုင်မှတ်စု",
      actionExplain: "AI ဖြင့်ရှင်းပြချက်",
      save: "မှတ်စုသိမ်းရန်",
      notePlaceholder: "ဤကျမ်းပိုဒ်နှင့်ပတ်သက်သော သင့်ကိုယ်ပိုင်တွေးခေါ်ချက်၊ မှတ်ချက် သို့မဟုတ် ဆုတောင်းချက်များကို ရေးသားပါ...",
      prev: "ယခင်အခန်း",
      next: "နောက်အခန်း"
    }
  }[uiLang];

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12 animate-fade-in relative min-h-[80vh]">
      <div ref={topRef} />

      {/* Main Reader Stage */}
      <div className="flex-1 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 sepia:bg-gold-100 shadow-md border border-slate-100 dark:border-slate-800 sepia:border-gold-200/50">
          <div className="flex items-center gap-2">
            {/* Book Selector Button */}
            <button
              onClick={() => {
                setShowBookSelector(true);
                setShowChapterSelector(false);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gold-50 dark:bg-slate-800 text-gold-700 dark:text-gold-300 hover:bg-gold-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-gold-200/40"
            >
              <BookOpen className="h-4 w-4 text-gold-500" />
              {uiLang === "en" ? currentBook.nameEn : currentBook.nameMy}
            </button>

            {/* Chapter Selector Button */}
            <button
              onClick={() => {
                setShowChapterSelector(true);
                setShowBookSelector(false);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-slate-200/40"
            >
              {uiLang === "en" ? `Chapter ${currentChapter}` : `အခန်းကြီး ${currentChapter}`}
            </button>
          </div>

          {/* Quick Reader Controls */}
          <div className="flex items-center gap-2">
            {/* Bilingual/Myanmar/English switches */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/40 text-xs">
              <button
                onClick={() => setPrimaryLang("my")}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  primaryLang === "my"
                    ? "bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                မြန်မာ
              </button>
              <button
                onClick={() => setPrimaryLang("bilingual")}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  primaryLang === "bilingual"
                    ? "bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Dual
              </button>
              <button
                onClick={() => setPrimaryLang("en")}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  primaryLang === "en"
                    ? "bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-300 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>

            {/* Font Size Increaser */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/40 px-2 py-1">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold"
              >
                A-
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold"
              >
                A+
              </button>
            </div>

            {/* Quick Theme Selector */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/40 p-1 gap-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "light"
                    ? "bg-white dark:bg-slate-700 text-gold-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title={uiLang === "en" ? "Light theme" : "နေ့ဘက်နောက်ခံ"}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("sepia")}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "sepia"
                    ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-amber-600"
                }`}
                title={uiLang === "en" ? "Sepia / Eye comfort" : "ဝါနုနောက်ခံ (မျက်စိအေး)"}
              >
                <SunDim className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === "dark"
                    ? "bg-white dark:bg-slate-700 text-gold-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title={uiLang === "en" ? "Dark theme" : "ညဘက်နောက်ခံ"}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Book Selector Overlay */}
        {showBookSelector && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 sepia:bg-gold-100 border border-slate-200 dark:border-slate-800 sepia:border-gold-200/50 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
                {t.selectBook}
              </h3>
              
              {/* OT / NT Toggles */}
              <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800 text-xs">
                {["ALL", "OT", "NT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTestamentFilter(cat as any)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      testamentFilter === cat
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto p-1">
              {filteredBooks.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBookSelect(b.id)}
                  className={`px-3 py-2 text-left rounded-xl text-xs font-semibold border transition-all ${
                    currentBookId === b.id
                      ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-gold-50 dark:hover:bg-slate-750 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="truncate">{uiLang === "en" ? b.nameEn : b.nameMy}</div>
                  <div className="text-[10px] opacity-70 font-light truncate">
                    {b.testament === "OT" ? "Old Testament" : "New Testament"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Chapter Selector Overlay */}
        {showChapterSelector && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 sepia:bg-gold-100 border border-slate-200 dark:border-slate-800 sepia:border-gold-200/50 shadow-xl space-y-4 animate-fade-in">
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              {t.selectChapter} — {uiLang === "en" ? currentBook.nameEn : currentBook.nameMy}
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-1 max-h-60 overflow-y-auto">
              {chapters.map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChapterSelect(ch)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${
                    currentChapter === ch
                      ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-gold-50 dark:hover:bg-slate-750 border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The Scripture Text Body */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 sepia:bg-gold-100 p-6 md:p-10 shadow-lg border border-slate-100 dark:border-slate-800 sepia:border-gold-200/50">
          
          <div className="text-center space-y-2 mb-8 pb-4 border-b border-slate-100 dark:border-slate-850">
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              {currentBook.testament === "OT" ? "Old Testament" : "New Testament"}
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-gold-200 leading-tight">
              {uiLang === "en" ? currentBook.nameEn : currentBook.nameMy}
            </h2>
            <h4 className="font-serif italic text-sm text-gold-600 dark:text-gold-400">
              {uiLang === "en" ? `Chapter ${currentChapter}` : `အခန်းကြီး ${currentChapter}`}
            </h4>
            <div className="flex justify-center items-center gap-2 mt-1.5">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-gold-600 dark:text-gold-400 border border-gold-200/20 font-medium">
                {uiLang === "en" ? "Judson Translation" : "ဆရာကြီး ယုဒသံ ဘာသာပြန်"}
              </span>
              {primaryLang !== "my" && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20 font-medium">
                  KJV
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100/40 dark:border-slate-800/60 space-y-3">
                    <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/50 rounded w-12"></div>
                    <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/50 rounded w-full"></div>
                    <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/50 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            ) : verses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-light">
                {uiLang === "en" ? "No verses found." : "ကျမ်းပိုဒ်များ မတွေ့ရှိပါ။"}
              </div>
            ) : (
              verses.map((v) => {
                const highlight = getVerseHighlight(v.verse);
                const note = getVerseNote(v.verse);
                const isSelected = selectedVerse?.verse === v.verse;
                const isBookmarked = isVerseBookmarked(v.verse);

                return (
                  <div 
                    key={v.verse}
                    onClick={() => handleVerseClick(v)}
                    className={`group relative rounded-xl p-3 md:p-4 cursor-pointer transition-all border ${
                      isSelected 
                        ? "bg-gold-50/50 dark:bg-slate-800/40 border-gold-300" 
                        : "border-transparent hover:bg-slate-50/40 dark:hover:bg-slate-800/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-1.5">
                        {/* Indicators (Notes, Bookmarks, etc.) */}
                        <div className="flex flex-wrap gap-1.5">
                          {note && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              <MessageSquare className="h-2.5 w-2.5" /> Note
                            </div>
                          )}
                          {isBookmarked && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                              <BookmarkCheck className="h-2.5 w-2.5" /> Saved
                            </div>
                          )}
                        </div>

                        {/* Bilingual Side-by-Side Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Myanmar Text */}
                          {(primaryLang === "my" || primaryLang === "bilingual") && (
                            <div className={primaryLang === "my" ? "col-span-2" : ""}>
                              <p 
                                style={{ fontSize: `${fontSize}px` }}
                                className="myanmar-font text-slate-800 dark:text-slate-100 font-normal leading-relaxed"
                              >
                                <span className="font-mono text-xs font-bold text-gold-500 mr-2 select-none">
                                  {v.verse}
                                </span>
                                <span className={`rounded px-1 py-0.5 transition-colors ${highlight ? highlight.color : ""}`}>
                                  {v.textMy}
                                </span>
                              </p>
                            </div>
                          )}

                          {/* English Text */}
                          {(primaryLang === "en" || primaryLang === "bilingual") && (
                            <div className={primaryLang === "en" ? "col-span-2" : ""}>
                              <p 
                                style={{ fontSize: `${fontSize - 1}px` }}
                                className="font-serif text-slate-700 dark:text-slate-300 leading-relaxed"
                              >
                                {primaryLang === "en" && (
                                  <span className="font-mono text-xs font-bold text-gold-500 mr-2 select-none">
                                    {v.verse}
                                  </span>
                                )}
                                <span className={`rounded px-1 py-0.5 transition-colors ${highlight ? highlight.color : ""}`}>
                                  {v.textEn}
                                </span>
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>

                    {/* Beautiful Inline Actions Panel when selected */}
                    {isSelected && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in"
                      >
                        {/* 1. Color Highlighter Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-2 px-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800/80">
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5">
                            {uiLang === "en" ? "Highlight Color" : "အရောင်မှတ်သားရန်"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {highlightColors.map((color) => {
                              const isColorActive = highlight?.color === color.class;
                              return (
                                <button
                                  key={color.label}
                                  onClick={() => {
                                    if (isColorActive) {
                                      onRemoveHighlight(`${v.bookId}-${v.chapter}-${v.verse}`);
                                    } else {
                                      onAddHighlight(v.bookId, v.chapter, v.verse, color.class);
                                    }
                                  }}
                                  className={`w-7 h-7 rounded-full ${
                                    color.class.split(" ")[0]
                                  } border-2 relative transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
                                    isColorActive ? "border-gold-500 shadow-md scale-105" : "border-transparent"
                                  }`}
                                  title={color.label}
                                >
                                  {isColorActive && <Check className="h-3 w-3 text-slate-850" />}
                                </button>
                              );
                            })}
                            
                            {highlight && (
                              <button
                                onClick={() => onRemoveHighlight(`${v.bookId}-${v.chapter}-${v.verse}`)}
                                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs font-bold"
                                title="Clear Highlight"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2. Action Buttons Row */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Easy Bookmark Toggle Button */}
                          <button
                            onClick={() => handleToggleBookmark(v)}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold border transition-all ${
                              isBookmarked
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                                : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-gold-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                            <span>
                              {isBookmarked 
                                ? (uiLang === "en" ? "Saved" : "မှတ်သားပြီး") 
                                : (uiLang === "en" ? "Bookmark" : "စာအုပ်ညှပ်ရန်")}
                            </span>
                          </button>

                          {/* Inline Note Editor Toggle Button */}
                          <button
                            onClick={() => setShowNoteEditor(!showNoteEditor)}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold border transition-all ${
                              showNoteEditor
                                ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/10"
                                : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-gold-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>
                              {uiLang === "en" ? "Notes" : "မှတ်စုရေးရန်"}
                            </span>
                          </button>

                          {/* Copy Verse Button */}
                          <button
                            onClick={() => handleCopyVerse(v)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold border bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-gold-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          >
                            {copiedVerseId === `${v.bookId}-${v.chapter}-${v.verse}` ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 dark:text-green-400 font-bold">
                                  {uiLang === "en" ? "Copied" : "ကူးယူပြီး"}
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 text-slate-400" />
                                <span>
                                  {uiLang === "en" ? "Copy" : "ကူးယူရန်"}
                                </span>
                              </>
                            )}
                          </button>

                          {/* AI Explain Button */}
                          {onExplainVerse && (
                            <button
                              onClick={() => onExplainVerse(v, currentBook.nameEn)}
                              className="w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 shadow-md transition-all active:scale-[0.98]"
                            >
                              <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold-400 dark:text-slate-950" />
                              <span>
                                {uiLang === "en" ? "Explain AI" : "AI ဖြင့်ရှင်းပြပါ"}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* 3. Inline Note Input Field */}
                        {showNoteEditor && (
                          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 animate-slide-in">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder={t.notePlaceholder}
                              rows={3}
                              className="w-full text-xs p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-300 focus:ring-1 focus:ring-gold-300 resize-none font-normal"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setShowNoteEditor(false)}
                                className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                              >
                                {uiLang === "en" ? "Cancel" : "မလုပ်တော့ပါ"}
                              </button>
                              <button
                                onClick={handleSaveNote}
                                className="px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-md transition-colors"
                              >
                                {t.save}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Embedded Note Text View if exists */}
                    {note && (
                      <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 border-l-2 border-blue-400 pl-3 py-0.5 italic">
                        "{note.text}"
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Chapter Pager */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
            <button
              onClick={handlePrevChapter}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 active:scale-[0.98]"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.prev}
            </button>
            <button
              onClick={handleNextChapter}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 active:scale-[0.98]"
            >
              {t.next}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Right Column Context / Verse Tool Drawer */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-6 space-y-6">
          
          {selectedVerse ? (
            <div className="rounded-3xl border border-gold-300/30 sepia:border-gold-350 bg-white dark:bg-slate-900 sepia:bg-gold-100 p-6 shadow-xl space-y-5 animate-slide-in">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-gold-500 uppercase tracking-widest">
                    Selected Verse
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-gold-200">
                    {currentBook.nameEn} {selectedVerse.chapter}:{selectedVerse.verse}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedVerse(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Verse Actions */}
              <div className="grid grid-cols-2 gap-2">
                
                {/* Copy Verse */}
                <button
                  onClick={() => handleCopyVerse(selectedVerse)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/40 hover:border-gold-300 transition-all text-slate-700 dark:text-slate-300 space-y-1.5"
                >
                  {copiedVerseId === `${selectedVerse.bookId}-${selectedVerse.chapter}-${selectedVerse.verse}` ? (
                    <>
                      <Check className="h-5 w-5 text-green-500 animate-scale-up" />
                      <span className="text-[11px] font-semibold text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 text-slate-500" />
                      <span className="text-[11px] font-medium">{t.actionCopy}</span>
                    </>
                  )}
                </button>

                {/* Bookmark Verse */}
                <button
                  onClick={() => handleToggleBookmark(selectedVerse)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                    isVerseBookmarked(selectedVerse.verse)
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800"
                      : "bg-slate-50 border-slate-200/40 text-slate-700 dark:text-slate-300 hover:border-gold-300 dark:bg-slate-800"
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isVerseBookmarked(selectedVerse.verse) ? "fill-current" : "text-slate-500"}`} />
                  <span className="text-[11px] font-medium">
                    {isVerseBookmarked(selectedVerse.verse) ? "Saved" : t.actionBookmark}
                  </span>
                </button>

                {/* Open Note Editor */}
                <button
                  onClick={() => {
                    setShowNoteEditor(!showNoteEditor);
                  }}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border col-span-2 transition-all space-y-1.5 ${
                    getVerseNote(selectedVerse.verse)
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900"
                      : "bg-slate-50 border-slate-200/40 text-slate-700 dark:text-slate-300 hover:border-gold-300 dark:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <span className="text-[11px] font-medium">
                    {getVerseNote(selectedVerse.verse) ? "Edit Notes" : t.actionNote}
                  </span>
                </button>

                {/* Ask AI Explanation */}
                <button
                  onClick={() => onExplainVerse(selectedVerse, currentBook.nameEn)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-black hover:from-slate-850 hover:to-slate-900 text-gold-300 border border-gold-500/20 col-span-2 transition-all shadow-md active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 animate-pulse text-gold-400" />
                  <span className="text-[11px] font-bold tracking-wide uppercase">
                    {t.actionExplain}
                  </span>
                </button>

              </div>

              {/* Highlighting Toolbar */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                  Highlight Color
                </span>
                <div className="flex justify-between">
                  {highlightColors.map((color) => {
                    const isHighlighted = getVerseHighlight(selectedVerse.verse)?.color === color.class;
                    return (
                      <button
                        key={color.label}
                        onClick={() => {
                          if (isHighlighted) {
                            onRemoveHighlight(`${selectedVerse.bookId}-${selectedVerse.chapter}-${selectedVerse.verse}`);
                          } else {
                            onAddHighlight(selectedVerse.bookId, selectedVerse.chapter, selectedVerse.verse, color.class);
                          }
                        }}
                        className={`w-8 h-8 rounded-full ${
                          color.class.split(" ")[0]
                        } border-2 relative transition-transform hover:scale-110 active:scale-95 flex items-center justify-center ${
                          isHighlighted ? "border-gold-500 shadow-md scale-105" : "border-transparent"
                        }`}
                        title={color.label}
                      >
                        {isHighlighted && <Check className="h-4 w-4 text-slate-800" />}
                      </button>
                    );
                  })}
                  
                  {/* Clear Highlight Button */}
                  {getVerseHighlight(selectedVerse.verse) && (
                    <button
                      onClick={() => onRemoveHighlight(`${selectedVerse.bookId}-${selectedVerse.chapter}-${selectedVerse.verse}`)}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs font-bold"
                      title="Clear Highlight"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Notes Editor Tray */}
              {showNoteEditor && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 animate-slide-in">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t.notePlaceholder}
                    rows={4}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-300 focus:ring-1 focus:ring-gold-300 resize-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {t.save}
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/60 sepia:border-gold-200 bg-white dark:bg-slate-900 sepia:bg-gold-100 p-6 shadow-md text-center py-10">
              <Highlighter className="h-8 w-8 text-gold-500/40 mx-auto mb-3" />
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                {t.sidebarNote}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
