import React, { useState } from "react";
import { BookMarked, Search, ArrowRight, Quote } from "lucide-react";
import { bibleService } from "../services/bibleService";
import { DictionaryEntry } from "../types";

interface DictionarySectionProps {
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
  uiLang: "en" | "my";
}

export default function DictionarySection({ onNavigate, uiLang }: DictionarySectionProps) {
  const [query, setQuery] = useState("");
  const dictionary = bibleService.getDictionary();

  const filteredEntries = dictionary.filter((entry) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      entry.wordEn.toLowerCase().includes(q) ||
      entry.wordMy.includes(q) ||
      entry.definitionEn.toLowerCase().includes(q) ||
      entry.definitionMy.includes(q)
    );
  });

  const t = {
    en: {
      title: "Bible Dictionary",
      desc: "Deepen your understanding of important biblical terms, concepts, and doctrines.",
      placeholder: "Search for a theological word (e.g., 'faith', 'grace')...",
      empty: "No dictionary matches found.",
      citations: "Key Scripture Verses",
      navReader: "Open in Reader"
    },
    my: {
      title: "ကျမ်းစာအဘိဓာန်",
      desc: "အရေးကြီးသော ကျမ်းစာစကားလုံးများ၊ အတွေးအခေါ်များနှင့် ကျမ်းစာသွန်သင်ချက်များကို လေ့လာပါ။",
      placeholder: "ဓမ္မပညာစကားလုံးကို ရှာဖွေပါ (ဥပမာ- 'ကျေးဇူး', 'ယုံကြည်')...",
      empty: "အဘိဓာန်တွင် ကိုက်ညီသော စကားလုံးမရှိပါ။",
      citations: "ဆက်စပ် ကျမ်းပိုဒ်များ",
      navReader: "ကျမ်းဖတ်ခန်း၌ ဖွင့်ရန်"
    }
  }[uiLang];

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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.placeholder}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-sm font-normal text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 shadow-lg focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Dictionary entries grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Title Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <BookMarked className="h-5 w-5 text-gold-500 shrink-0" />
                  <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-slate-100">
                    {entry.wordEn}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                    ({entry.wordMy})
                  </span>
                </div>

                {/* Definitions */}
                <div className="space-y-2">
                  <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-light leading-relaxed">
                    {entry.definitionEn}
                  </p>
                  <p className="myanmar-font text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed font-normal">
                    {entry.definitionMy}
                  </p>
                </div>
              </div>

              {/* Citations references */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.citations}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.references.map((ref, rIdx) => (
                    <button
                      key={rIdx}
                      onClick={() => {
                        const books = bibleService.getBooks();
                        const lowerRef = ref.toLowerCase();
                        
                        // Try to find matching book name
                        let matchedBook = books.find(b => {
                          const enName = b.nameEn.toLowerCase();
                          return lowerRef.includes(enName);
                        });
                        
                        // Fallback for numbered books
                        if (!matchedBook) {
                          if (lowerRef.includes("peter")) {
                            matchedBook = books.find(b => b.id === 60); // 1 Peter
                          } else if (lowerRef.includes("john") && lowerRef.includes("1")) {
                            matchedBook = books.find(b => b.id === 62); // 1 John
                          } else if (lowerRef.includes("thessalonians")) {
                            matchedBook = books.find(b => b.id === 52); // 1 Thess
                          } else if (lowerRef.includes("corinthians")) {
                            matchedBook = books.find(b => b.id === 46); // 1 Cor
                          } else if (lowerRef.includes("timothy")) {
                            matchedBook = books.find(b => b.id === 54); // 1 Tim
                          }
                        }

                        // Parse chapter (e.g. "Ephesians 2:8" or "1 John 2:2" -> chapter 2)
                        let chapter = 1;
                        const match = ref.match(/\s(\d+):/);
                        if (match && match[1]) {
                          chapter = parseInt(match[1], 10);
                        }

                        const bookId = matchedBook ? matchedBook.id : 43;
                        onNavigate("bible", bookId, chapter);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-gold-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-[11px] font-semibold text-gold-600 dark:text-gold-400 transition-all shadow-sm"
                    >
                      <Quote className="h-2.5 w-2.5 opacity-50" />
                      {ref}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-xs font-light">
            {t.empty}
          </p>
        </div>
      )}

    </div>
  );
}
