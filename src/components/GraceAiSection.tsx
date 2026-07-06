import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, RefreshCw, MessageSquare, AlertCircle, Bookmark, ArrowRight } from "lucide-react";
import { BibleVerse } from "../types";

interface Message {
  sender: "user" | "grace";
  text: string;
}

interface GraceAiSectionProps {
  uiLang: "en" | "my";
  aiContext: { verse: BibleVerse; bookName: string } | null;
  clearAiContext: () => void;
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
}

export default function GraceAiSection({
  uiLang,
  aiContext,
  clearAiContext,
  onNavigate
}: GraceAiSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "grace",
      text: uiLang === "en" 
        ? "Hello, beloved! I am Grace, your Bible study assistant. How can I help you grow in your understanding of the Scriptures today? Feel free to ask theological questions, request a sermon outline, or study a verse!"
        : "မင်္ဂလာရှိသောနေ့လေးပါရှင်! သမီးကတော့ Grace ဖြစ်ပါတယ်။ ယနေ့ သမ္မာကျမ်းစာတော်မြတ်ကို ပိုမိုနားလည်သဘောပေါက်နိုင်စေရန် မည်သို့ကူညီပေးရမလဲရှင်။ ကျမ်းချက်များနှင့်ပတ်သက်သော မေးခွန်းများမေးခြင်း၊ ဝတ်ပြုကိုးကွယ်ခြင်း အစီအစဉ်များ ဖန်တီးခြင်းများကို မေးမြန်းနိုင်ပါတယ်ရှင်။"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle triggered AI context from the Bible reader
  useEffect(() => {
    if (aiContext) {
      const explainText = uiLang === "en"
        ? `Explain this verse in depth: ${aiContext.bookName} ${aiContext.verse.chapter}:${aiContext.verse.verse} - "${aiContext.verse.textEn}"`
        : `ဤကျမ်းချက်ကို ရှင်းပြပေးပါ- ${aiContext.bookName} ${aiContext.verse.chapter}:${aiContext.verse.verse} - "${aiContext.verse.textMy}"`;
      
      setInput(explainText);
      // Automatically send
      handleSendPrompt(explainText, "explain", aiContext.verse, aiContext.bookName);
      clearAiContext();
    }
  }, [aiContext]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendPrompt = async (
    promptText: string, 
    mode: "ask" | "explain" | "devotional" = "ask",
    contextVerse?: BibleVerse,
    bookName?: string
  ) => {
    if (!promptText.trim()) return;

    const userMsg: Message = { sender: "user", text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          mode,
          history: messages.slice(-10), // Send last 10 messages for conversational memory!
          context: contextVerse ? {
            book: bookName,
            chapter: contextVerse.chapter,
            verses: contextVerse.verse.toString(),
            verseText: uiLang === "en" ? contextVerse.textEn : contextVerse.textMy,
            language: uiLang
          } : undefined
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { sender: "grace", text: data.text }]);
      } else {
        throw new Error("No response from Grace AI");
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "grace",
          text: uiLang === "en"
            ? "I apologize, but I am having trouble connecting right now. Please ensure your GEMINI_API_KEY is properly set up in Secrets or check your network."
            : "စိတ်မကောင်းပါဘူးရှင်၊ ယခုအချိန်တွင် ဆက်သွယ်မှုပြတ်တောက်နေပါသည်။ လျှို့ဝှက်ချက်များ (Secrets) တွင် GEMINI_API_KEY ကို သေချာစွာ ထည့်သွင်းထားပါသလား သို့မဟုတ် ကွန်ရက်ချိတ်ဆက်မှုကို ပြန်လည်စစ်ဆေးပါ။"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    handleSendPrompt(input);
  };

  // Sample templates to aid the user
  const samplePrompts = uiLang === "en" 
    ? [
        { label: "Sermon Outline on Love", text: "Create a detailed Christian sermon outline with scripture references on 'God's unconditional love' (Agape)." },
        { label: "Explain Psalm 23", text: "Give me an encouraging theological explanation of Psalm 23:4." },
        { label: "Comfort in Anxiety", text: "What scriptures provide comfort, courage, and calmness during seasons of anxiety and stress?" },
        { label: "Grace vs Law", text: "Explain the difference between God's Grace and the Old Testament Law in easy terms." }
      ]
    : [
        { label: "မေတ္တာအကြောင်း တရားဒေသနာ", text: "ဘုရားသခင်၏ စစ်မှန်သောမေတ္တာအကြောင်းနှင့် သက်ဆိုင်သော ကျမ်းညွှန်းများပါဝင်သည့် တရားဒေသနာအကြမ်းတစ်ခု ရေးသားပေးပါ။" },
        { label: "ဆာလံ ၂၃ ရှင်းပြချက်", text: "ဆာလံကျမ်း ၂၃:၄ ၏ အဓိပ္ပာယ်ကို နားလည်လွယ်အောင် အားပေးစကားဖြင့် ရှင်းပြပေးပါ။" },
        { label: "စိုးရိမ်ပူပန်မှုအတွက် ကျမ်းချက်", text: "စိတ်ပူပန်သောကရောက်နေချိန်တွင် ဖတ်ရှုရန်နှင့် စိတ်ငြိမ်သက်မှုရရှိစေရန် ကျမ်းချက်များ ညွှန်းပေးပါ။" },
        { label: "ကျေးဇူးတော်နှင့် ပညတ်တရား", text: "ဓမ္မဟောင်းကျမ်းမှ ပညတ်တရားနှင့် ဓမ္မသစ်ကျမ်းမှ ကျေးဇူးတော်တို့၏ ကွာခြားချက်ကို ရှင်းပြပေးပါ။" }
      ];

  const t = {
    en: {
      title: "Ask Grace",
      subtitle: "Gemini-powered Bible study companion",
      placeholder: "Ask Grace a question about Scripture...",
      templates: "Suggested Bible Study Topics",
      contextNotice: "AI is ready to explain your selected verse!",
      typing: "Grace is meditating on the scriptures..."
    },
    my: {
      title: "Grace AI အကူအညီ",
      subtitle: "Gemini ဖြင့်စွမ်းဆောင်ထားသော ကျမ်းစာလေ့လာဖော်",
      placeholder: "သမ္မာကျမ်းစာနှင့်ပတ်သက်သော မေးခွန်းများကို မေးမြန်းပါ...",
      templates: "လေ့လာရန် အကြံပြုထားသော ခေါင်းစဉ်များ",
      contextNotice: "ရွေးချယ်ထားသော ကျမ်းပိုဒ်ကို ရှင်းပြရန် AI အဆင်သင့်ရှိပါသည်!",
      typing: "Grace က ကျမ်းစာချက်များကို တွေးတောဆင်ခြင်နေပါသည်..."
    }
  }[uiLang];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[75vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-850 shadow-xl overflow-hidden animate-fade-in">
      
      {/* AI Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-300">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-gold-100">{t.title}</h1>
            <p className="text-[10px] text-slate-400 font-light tracking-wide">{t.subtitle}</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all"
          title="Restart Session"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {messages.map((m, idx) => {
          const isGrace = m.sender === "grace";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 ${isGrace ? "" : "flex-row-reverse"}`}
            >
              {/* Profile Avatar */}
              <div className={`p-2 rounded-xl shrink-0 ${
                isGrace 
                  ? "bg-gold-50 dark:bg-gold-950/20 text-gold-500 border border-gold-200/40" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}>
                {isGrace ? <Bot className="h-4.5 w-4.5" /> : <MessageSquare className="h-4.5 w-4.5" />}
              </div>

              {/* Speech Bubble */}
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm leading-relaxed ${
                isGrace
                  ? "bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800"
                  : "bg-slate-950 text-white dark:bg-gold-600 dark:text-slate-950 font-medium"
              }`}>
                <div className="whitespace-pre-wrap text-xs md:text-sm prose dark:prose-invert">
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5 animate-pulse">
            <div className="p-2 rounded-xl bg-gold-50 dark:bg-gold-950/20 text-gold-500">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin text-gold-500" />
              {t.typing}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Templates tray (Shows only when conversation is short) */}
      {messages.length <= 2 && !loading && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t.templates}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 pr-1 scrollbar-thin">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p.text)}
                className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200/60 hover:border-gold-300 text-slate-700 hover:text-gold-700 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-300 dark:hover:text-gold-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                {p.label}
                <ArrowRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Form Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:border-gold-400 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 rounded-xl transition-all disabled:opacity-50 active:scale-[0.95] flex items-center justify-center shrink-0"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
