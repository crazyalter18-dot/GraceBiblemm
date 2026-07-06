import React, { useState, useEffect } from "react";
import { 
  Search, BookOpen, AlertCircle, Copy, Bookmark, Check, Sparkles, Clock, Trash2, ChevronRight,
  Heart, Shield, Anchor, Flame, Sun, Crown, Compass, X
} from "lucide-react";
import { bibleService } from "../services/bibleService";
import { BibleBook, BibleVerse, Bookmark as BookmarkType } from "../types";

// Suggested search topics for high-quality discoverability
const suggestedTopics = [
  { labelEn: "Grace", labelMy: "ကျေးဇူးတော်", queryEn: "Grace", queryMy: "ကျေးဇူးတော်", icon: Sparkles },
  { labelEn: "Faith", labelMy: "ယုံကြည်ခြင်း", queryEn: "Faith", queryMy: "ယုံကြည်ခြင်း", icon: Shield },
  { labelEn: "Love", labelMy: "မေတ္တာ", queryEn: "Love", queryMy: "မေတ္တာ", icon: Heart },
  { labelEn: "Hope", labelMy: "မျှော်လင့်ခြင်း", queryEn: "Hope", queryMy: "မျှော်လင့်ခြင်း", icon: Compass },
  { labelEn: "Peace", labelMy: "ငြိမ်သက်ခြင်း", queryEn: "Peace", queryMy: "ငြိမ်သက်ခြင်း", icon: Anchor },
  { labelEn: "Salvation", labelMy: "ကယ်တင်ခြင်း", queryEn: "Salvation", queryMy: "ကယ်တင်ခြင်း", icon: Crown },
  { labelEn: "Light", labelMy: "အလင်း", queryEn: "Light", queryMy: "အလင်း", icon: Sun },
  { labelEn: "Holy Spirit", labelMy: "ဝိညာဉ်တော်", queryEn: "Spirit", queryMy: "ဝိညာဉ်တော်", icon: Flame }
];

interface SearchSectionProps {
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
  uiLang: "en" | "my";
  bookmarks?: BookmarkType[];
  onAddBookmark?: (bookId: number, chapter: number, verse: number) => void;
  onRemoveBookmark?: (id: string) => void;
  onExplainVerse?: (verse: BibleVerse, bookName: string) => void;
}

export default function SearchSection({ 
  onNavigate, 
  uiLang,
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  onExplainVerse
}: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "OT" | "NT">("ALL");
  const [selectedBookFilter, setSelectedBookFilter] = useState<number | null>(null);
  const [results, setResults] = useState<{ verse: BibleVerse; book: BibleBook }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [parsedReference, setParsedReference] = useState<{
    book: BibleBook;
    chapter: number;
    verse?: number;
    endVerse?: number;
  } | null>(null);
  
  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("grace_bible_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save recent searches
  useEffect(() => {
    localStorage.setItem("grace_bible_recent_searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Utility to find the book matching the query
  const findBookMatch = (queryText: string) => {
    const books = bibleService.getBooks();
    const sortedBooks = [...books].sort((a, b) => b.nameEn.length - a.nameEn.length);
    const queryLower = queryText.toLowerCase().trim();
    
    for (const book of sortedBooks) {
      const bookNames = [
        book.nameEn.toLowerCase(),
        book.nameMy,
        book.abbrevEn.toLowerCase(),
        book.abbrevMy,
        book.nameMy.replace("ခရစ်ဝင်", ""),
        book.nameMy.replace("ကျမ်း", ""),
        book.nameMy.replace("ဝတ္ထု", ""),
        book.nameMy.replace("ဩဝါဒစာ", ""),
        book.nameMy.replace("သြဝါဒစာ", ""),
      ].filter(Boolean);
      
      for (const name of bookNames) {
        const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s*');
        const regex = new RegExp(`^${escapedName}\\s*(.*)`, 'i');
        const match = queryLower.match(regex);
        if (match) {
          const remaining = match[1].trim();
          return { book, remaining };
        }
      }
    }
    return null;
  };

  // Utility to parse chapter and verse numbers
  const parseChapterVerse = (remaining: string) => {
    const matches = [...remaining.matchAll(/\d+/g)].map(m => parseInt(m[0]));
    if (matches.length === 0) return null;
    
    const chapter = matches[0];
    const verse = matches.length > 1 ? matches[1] : undefined;
    const endVerse = matches.length > 2 ? matches[2] : undefined;
    
    return { chapter, verse, endVerse };
  };

  // Main high-precision Bible reference parser
  const parseBibleReference = (rawQuery: string) => {
    if (!rawQuery) return null;
    
    const myanmarToEnglishDigits = (text: string): string => {
      const map: Record<string, string> = {
        '၀': '0', '၁': '1', '၂': '2', '၃': '3', '၄': '4',
        '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9'
      };
      return text.replace(/[၀-၉]/g, m => map[m]);
    };

    const queryConverted = myanmarToEnglishDigits(rawQuery.trim()).replace(/း/g, ':');
    const bookMatch = findBookMatch(queryConverted);
    if (!bookMatch) return null;
    
    const { book, remaining } = bookMatch;
    const numbers = parseChapterVerse(remaining);
    if (!numbers) return null;
    
    if (numbers.chapter <= 0 || numbers.chapter > book.totalChapters) {
      return null;
    }
    
    return {
      book,
      chapter: numbers.chapter,
      verse: numbers.verse,
      endVerse: numbers.endVerse
    };
  };

  const runSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    
    setLoading(true);
    setHasSearched(false);
    setSelectedBookFilter(null); // reset book filter on new search
    setParsedReference(null);

    // 1. Try exact reference parsing first (Instant local lookup)
    const ref = parseBibleReference(searchQuery);
    if (ref) {
      setParsedReference(ref);
      try {
        const verses = await bibleService.getVersesAsync(ref.book.id, ref.chapter);
        let matched = verses;
        if (ref.verse !== undefined) {
          if (ref.endVerse !== undefined) {
            matched = verses.filter(v => v.verse >= ref.verse! && v.verse <= ref.endVerse!);
          } else {
            matched = verses.filter(v => v.verse === ref.verse);
          }
        }
        
        const mappedResults = matched.map(v => ({ verse: v, book: ref.book }));
        setResults(mappedResults);
        
        // Update recent searches
        setRecentSearches(prev => {
          const filtered = prev.filter(q => q.toLowerCase() !== searchQuery.toLowerCase());
          return [searchQuery, ...filtered].slice(0, 5);
        });
      } catch (err) {
        console.error("Direct reference search failed:", err);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
      return;
    }

    // 2. Regular Keyword / Semantic Search
    try {
      const searchResults = await bibleService.searchBibleAsync(searchQuery);
      setResults(searchResults);
      
      // Update recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(q => q.toLowerCase() !== searchQuery.toLowerCase());
        return [searchQuery, ...filtered].slice(0, 5);
      });
    } catch (err) {
      console.error("Bible search failed:", err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    runSearch(q);
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const handleCopy = (verse: BibleVerse, book: BibleBook) => {
    const key = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
    const bookName = uiLang === "en" ? book.nameEn : book.nameMy;
    const textToCopy = `[${bookName} ${verse.chapter}:${verse.verse}]\nMyanmar: ${verse.textMy}\nEnglish: ${verse.textEn}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleBookmark = (verse: BibleVerse) => {
    const id = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
    const isBookmarked = bookmarks.some(b => b.id === id);
    if (isBookmarked) {
      if (onRemoveBookmark) onRemoveBookmark(id);
    } else {
      if (onAddBookmark) onAddBookmark(verse.bookId, verse.chapter, verse.verse);
    }
  };

  // Filter search results
  const filteredResults = results.filter((item) => {
    if (testamentFilter !== "ALL" && item.book.testament !== testamentFilter) return false;
    if (selectedBookFilter !== null && item.book.id !== selectedBookFilter) return false;
    return true;
  });

  // Calculate book matches statistics
  const bookStats = results
    .filter(item => testamentFilter === "ALL" || item.book.testament === testamentFilter)
    .reduce((acc, item) => {
      const bId = item.book.id;
      if (!acc[bId]) {
        acc[bId] = { book: item.book, count: 0 };
      }
      acc[bId].count++;
      return acc;
    }, {} as Record<number, { book: BibleBook; count: number }>);

  const bookStatsArray = (Object.values(bookStats) as { book: BibleBook; count: number }[]).sort((a, b) => b.count - a.count);

  const t = {
    en: {
      title: "Search Grace Bible",
      desc: "Instant search by word or verse across English and Myanmar scripts.",
      placeholder: "Type a word (e.g., 'faith', 'love', 'အလင်း', 'ကျေးဇူး')...",
      searchBtn: "Search",
      searching: "Searching scriptures...",
      noResults: "No scripture passages found matching your search. Try looking for different key terms.",
      matchingFound: "matching verses found",
      all: "All Scripture",
      ot: "Old Testament",
      nt: "New Testament",
      resultHint: "Click a verse to read in context or use actions below to study.",
      recent: "Recent Searches",
      clearHistory: "Clear",
      filterByBook: "Filter by Book",
      allBooks: "All Books",
      explainAI: "Explain with AI",
      openInReader: "Open Reader",
      copied: "Copied!",
      copyText: "Copy Verse",
      bookmarkText: "Bookmark"
    },
    my: {
      title: "သမ္မာကျမ်းစာ ရှာဖွေရေး",
      desc: "အင်္ဂလိပ် သို့မဟုတ် မြန်မာစာလုံးများဖြင့် ကျမ်းချက်များကို မြန်ဆန်စွာ ရှာဖွေပါ။",
      placeholder: "စကားလုံးရိုက်ထည့်ပါ (ဥပမာ- 'faith', 'love', 'အလင်း', 'ကျေးဇူး')...",
      searchBtn: "ရှာဖွေရန်",
      searching: "ကျမ်းချက်များ ရှာဖွေနေပါသည်...",
      noResults: "ရှာဖွေမှုနှင့် ကိုက်ညီသော ကျမ်းပိုဒ်များ မတွေ့ရှိပါ။ အခြားသော အဓိကစကားလုံးများဖြင့် ထပ်မံရှာဖွေကြည့်ပါ။",
      matchingFound: "ကျမ်းချက်များ တွေ့ရှိသည်",
      all: "ကျမ်းစာအားလုံး",
      ot: "ဓမ္မဟောင်းကျမ်း",
      nt: "ဓမ္မသစ်ကျမ်း",
      resultHint: "ကျမ်းချက်ကို တစ်ချက်နှိပ်၍ အခန်းကြီးတစ်ခုလုံးကို ဖတ်ရှုပါ သို့မဟုတ် အောက်ပါကိရိယာများကို အသုံးပြုပါ။",
      recent: "မကြာသေးမီက ရှာဖွေမှုများ",
      clearHistory: "ရှင်းလင်းရန်",
      filterByBook: "ကျမ်းစောင်အလိုက် စစ်ထုတ်ရန်",
      allBooks: "ကျမ်းစောင်အားလုံး",
      explainAI: "AI ဖြင့် ရှင်းလင်းချက်တောင်းရန်",
      openInReader: "ကျမ်းဖတ်ခန်း၌ ဖွင့်ရန်",
      copied: "ကူးယူပြီး!",
      copyText: "ကျမ်းချက်ကူးယူရန်",
      bookmarkText: "မှတ်သားရန်"
    }
  }[uiLang];

  // Helper to highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-100 text-slate-900 rounded px-1.5 py-0.5 font-semibold dark:bg-amber-900/60 dark:text-slate-100">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="text-center space-y-2 max-w-xl mx-auto py-4">
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-gold-200">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              disabled={loading}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-sm font-normal text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-lg focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all placeholder:text-slate-400 disabled:opacity-75"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setHasSearched(false);
                  setParsedReference(null);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-75 flex items-center gap-2 shrink-0"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-slate-950 border-t-transparent"></div>}
            {loading ? t.searching : t.searchBtn}
          </button>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t.recent}:
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1 items-center">
              {recentSearches.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-all"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={handleClearHistory}
                className="text-[10px] text-red-500 hover:text-red-600 font-bold ml-auto flex items-center gap-0.5"
              >
                <Trash2 className="h-3 w-3" />
                {t.clearHistory}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggest Popular Topics (Only on empty state/before searching) */}
      {!hasSearched && !loading && (
        <div className="space-y-4 pt-6 animate-fade-in border-t border-slate-100 dark:border-slate-850">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">
            {uiLang === "en" ? "Explore Popular Topics" : "ခေါင်းစဉ်အလိုက် ကျမ်းချက်များကို ရှာဖွေပါ"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suggestedTopics.map((topic, idx) => {
              const IconComponent = topic.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const q = uiLang === "en" ? topic.queryEn : topic.queryMy;
                    setQuery(q);
                    runSearch(q);
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:border-gold-400/50 dark:hover:border-gold-500/40 hover:bg-gold-50/10 dark:hover:bg-gold-950/5 transition-all group text-left shadow-sm cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-gold-600 dark:group-hover:text-gold-400 group-hover:bg-gold-100/50 dark:group-hover:bg-gold-950/20 transition-all shrink-0">
                    <IconComponent className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-850 dark:text-slate-150 truncate">
                      {uiLang === "en" ? topic.labelEn : topic.labelMy}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {uiLang === "en" ? `"${topic.queryEn}"` : `"${topic.queryMy}"`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Spinner Area */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-400 border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light animate-pulse">
            {t.searching}
          </p>
        </div>
      )}

      {/* Search results content */}
      {hasSearched && !loading && (
        <div className="space-y-6">
          
          {/* Direct Scripture Reference Match Banner */}
          {parsedReference && (
            <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-700 dark:text-gold-400 shrink-0">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-850 dark:text-gold-200">
                    {uiLang === "en" ? "Exact Reference Lookup Matches" : "တိုက်ရိုက်ကျမ်းချက်ညွှန်းဆိုချက် တွေ့ရှိသည်"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {uiLang === "en" 
                      ? `Displaying verified verses for: ${parsedReference.book.nameEn} ${parsedReference.chapter}${parsedReference.verse ? `:${parsedReference.verse}` : ""}`
                      : `အချက်အလက်မှန်ကန်သော ကျမ်းချက်များကို ပြသနေသည်- ${parsedReference.book.nameMy} အခန်းကြီး ${parsedReference.chapter}${parsedReference.verse ? `း${parsedReference.verse}` : ""}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("bible", parsedReference.book.id, parsedReference.chapter)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-slate-950 text-white hover:bg-slate-900 dark:bg-gold-500 dark:text-slate-950 dark:hover:bg-gold-400 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{uiLang === "en" ? "Read Whole Chapter" : "အခန်းကြီးတစ်ခုလုံးဖတ်ရန်"}</span>
              </button>
            </div>
          )}
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-inner">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-full">
              {filteredResults.length} {t.matchingFound}
            </span>

            {/* Testament Toggle */}
            <div className="inline-flex rounded-xl p-1 bg-slate-200/60 dark:bg-slate-800 text-xs gap-1">
              <button
                onClick={() => {
                  setTestamentFilter("ALL");
                  setSelectedBookFilter(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  testamentFilter === "ALL"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => {
                  setTestamentFilter("OT");
                  setSelectedBookFilter(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  testamentFilter === "OT"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t.ot}
              </button>
              <button
                onClick={() => {
                  setTestamentFilter("NT");
                  setSelectedBookFilter(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  testamentFilter === "NT"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t.nt}
              </button>
            </div>
          </div>

          {/* Book-level dynamic stats pills */}
          {bookStatsArray.length > 0 && (
            <div className="space-y-2 p-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.filterByBook}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBookFilter(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedBookFilter === null
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {t.allBooks} ({results.filter(item => testamentFilter === "ALL" || item.book.testament === testamentFilter).length})
                </button>
                {bookStatsArray.map(({ book, count }) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBookFilter(book.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      selectedBookFilter === book.id
                        ? "bg-gold-500 border-gold-500 text-slate-950 shadow-md shadow-gold-500/10"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{uiLang === "en" ? book.nameEn : book.nameMy}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedBookFilter === book.id ? "bg-white/30 text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Grid List */}
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-1">
                {t.resultHint}
              </span>

              {filteredResults.map(({ verse, book }) => {
                const verseId = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
                const isBookmarked = bookmarks.some(b => b.id === verseId);

                return (
                  <div
                    key={verseId}
                    className="group rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-md hover:shadow-lg hover:border-gold-300 dark:hover:border-gold-500 transition-all flex flex-col gap-4"
                  >
                    {/* Upper click area - opens reader */}
                    <div 
                      onClick={() => onNavigate("bible", verse.bookId, verse.chapter)}
                      className="cursor-pointer space-y-3 flex-1"
                    >
                      {/* Header Citation */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-gold-700 dark:text-gold-400 bg-gold-100/60 dark:bg-gold-950/20 px-2.5 py-1 rounded-lg">
                            {uiLang === "en" ? book.nameEn : book.nameMy} {verse.chapter}:{verse.verse}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {book.testament === "OT" ? "OT" : "NT"} • {uiLang === "en" ? "Judson / KJV" : "ယုဒသံ / KJV"}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-gold-500 transition-colors" />
                      </div>

                      {/* Texts with matching highlight */}
                      <div className="space-y-2.5 pt-1">
                        <p className="myanmar-font text-slate-850 dark:text-slate-150 text-sm md:text-[15px] leading-relaxed font-normal">
                          {highlightText(verse.textMy, query)}
                        </p>
                        <p className="font-serif text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                          {highlightText(verse.textEn, query)}
                        </p>
                      </div>
                    </div>

                    {/* Lower action toolbar */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-xs">
                      {/* Quick Read Button */}
                      <button
                        onClick={() => onNavigate("bible", verse.bookId, verse.chapter)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-gold-600 dark:text-slate-400 dark:hover:text-gold-400 font-semibold transition-colors"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{t.openInReader}</span>
                      </button>

                      {/* Right side study tools */}
                      <div className="flex items-center gap-3">
                        {/* Explain button if callback exists */}
                        {onExplainVerse && (
                          <button
                            onClick={() => onExplainVerse(verse, uiLang === "en" ? book.nameEn : book.nameMy)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold transition-all"
                            title={t.explainAI}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t.explainAI}</span>
                          </button>
                        )}

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(verse, book)}
                          className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all font-semibold"
                          title={t.copyText}
                        >
                          {copiedId === verseId ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-[10px] text-green-500 font-bold">{t.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline text-[10px]">{t.copyText}</span>
                            </>
                          )}
                        </button>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggleBookmark(verse)}
                          className={`flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-semibold ${
                            isBookmarked 
                              ? "text-amber-500 dark:text-amber-400" 
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          }`}
                          title={t.bookmarkText}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                          <span className="hidden sm:inline text-[10px]">{t.bookmarkText}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                {t.noResults}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
