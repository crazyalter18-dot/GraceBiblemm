import React from "react";
import { Languages, Type, Moon, Sun, SunDim, Bell, Trash2, Shield, Info, Heart } from "lucide-react";
import { BibleSettings } from "../types";

interface SettingsSectionProps {
  settings: BibleSettings;
  updateSettings: (key: keyof BibleSettings, value: any) => void;
  uiLang: "en" | "my";
  onClearAllData: () => void;
}

export default function SettingsSection({
  settings,
  updateSettings,
  uiLang,
  onClearAllData
}: SettingsSectionProps) {

  const handleClearData = () => {
    const confirmed = window.confirm(
      uiLang === "en"
        ? "Are you sure you want to clear all your bookmarks, notes, highlights, and reading plan progress? This action is permanent."
        : "သင်၏ စာအုပ်ညှပ်များ၊ မှတ်စုများ၊ အရောင်ခြယ်ချက်များနှင့် အစီအစဉ်များ၏ တိုးတက်မှုအားလုံးကို ဖျက်ပစ်ရန် သေချာပါသလား။ ဤလုပ်ဆောင်ချက်ကို ပြန်ပြင်၍မရပါ။"
    );
    if (confirmed) {
      onClearAllData();
    }
  };

  const t = {
    en: {
      title: "Settings & Profile",
      desc: "Customize your Grace Bible reading experience and local preferences.",
      languageHeading: "Language Settings",
      uiLanguage: "App Interface Language",
      bibleLanguage: "Scripture Reading Mode",
      appearanceHeading: "Appearance & Typography",
      theme: "Theme Mode",
      light: "Light",
      sepia: "Sepia / Eye Comfort",
      dark: "Dark",
      fontSize: "Reader Font Size",
      fontNotice: "Adjust slide to customize reading readability.",
      notificationsHeading: "Reminders & Alerts",
      dailyNotify: "Daily Verse Notification",
      dailyNotifyDesc: "Receive inspirational reminders to read the scripture every day.",
      systemNotice: "System Notifications",
      clearHeading: "Storage & Data Safety",
      clearBtn: "Reset Local Study Data",
      clearDesc: "Erase all bookmarks, highlights, custom notes, and reading plan history.",
      aboutHeading: "About Grace Bible",
      version: "Version",
      aboutText: "Grace Bible is a lightweight, responsive Christian study tool created to make the Scriptures beautifully accessible. The Myanmar translation is the beloved Judson Translation (ဆရာကြီး ယုဒသံ ဘာသာပြန်၊ ၁၈၃၅), and the English translation is the classic King James Version (KJV). It is powered by local databases and server-side AI companion features.",
      creator: "Designed with Purity & Devotion"
    },
    my: {
      title: "စနစ်ပြင်ဆင်ချက်များ",
      desc: "Grace ကျမ်းစာဖတ်ရှုခြင်း အတွေ့အကြုံနှင့် စိတ်ကြိုက်ရွေးချယ်မှုများကို ပြင်ဆင်ပါ။",
      languageHeading: "ဘာသာစကား သတ်မှတ်ချက်များ",
      uiLanguage: "အသုံးပြုမည့် ဘာသာစကား (Interface)",
      bibleLanguage: "ကျမ်းစာဖတ်ရှုမည့် စနစ် (Mode)",
      appearanceHeading: "အသွင်အပြင်နှင့် စာလုံးအရွယ်အစား",
      theme: "ညဘက်/နေ့ဘက် နောက်ခံ",
      light: "နေ့ဘက် (လင်း)",
      sepia: "ဝါနု (မျက်စိအေး)",
      dark: "ညဘက် (မှောင်)",
      fontSize: "စာလုံးအရွယ်အစား",
      fontNotice: "စာဖတ်ရန် အဆင်ပြေစေရန် စာလုံးအရွယ်အစားကို ရွှေ့၍ ချိန်ညှိပါ။",
      notificationsHeading: "အသိပေးချက်များနှင့် သတိပေးချက်များ",
      dailyNotify: "နေ့စဉ်ကျမ်းချက် အသိပေးချက်",
      dailyNotifyDesc: "နေ့စဉ် ကျမ်းစာဖတ်ရှုရန် ဝိညာဉ်ရေးရာ သတိပေးချက်များကို လက်ခံရယူပါ။",
      systemNotice: "စနစ် အသိပေးချက်",
      clearHeading: "ဒေတာသိမ်းဆည်းမှုနှင့် လုံခြုံရေး",
      clearBtn: "လေ့လာမှုဒေတာများ အားလုံးဖျက်ရန်",
      clearDesc: "စာအုပ်ညှပ်များ၊ အရောင်ခြယ်ချက်များ၊ ကိုယ်ပိုင်မှတ်စုများနှင့် ဖတ်ရှုမှုမှတ်တမ်းအားလုံးကို ဖျက်ဆီးပစ်ရန်။",
      aboutHeading: "Grace ကျမ်းစာအကြောင်း",
      version: "ဗားရှင်း",
      aboutText: "Grace Bible သည် မြန်မာနှင့် အင်္ဂလိပ် နှစ်ဘာသာဖြင့် သမ္မာကျမ်းစာကို အလွယ်တကူ လေ့လာနိုင်စေရန် ဖန်တီးထားသော ဆော့ဖ်ဝဲတစ်ခုဖြစ်ပါသည်။ မြန်မာကျမ်းစာတော်မြတ်ကို ဆရာကြီးယုဒသံ၏ မူရင်းဘာသာပြန်ချက် (၁၈၃၅) ဖြင့် တည်ဆောက်ထားပြီး၊ အင်္ဂလိပ်ကျမ်းစာတော်မြတ်ကို King James Version (KJV) ဖြင့် စုံလင်စွာ ဖော်ပြထားပါသည်။",
      creator: "Designed with Purity & Devotion"
    }
  }[uiLang];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="text-center space-y-2 max-w-xl mx-auto py-4">
        <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-gold-200">
          {t.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
          {t.desc}
        </p>
      </div>

      {/* 1. Language Settings */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Languages className="h-4 w-4 text-gold-500" />
          {t.languageHeading}
        </h2>

        {/* UI Language selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.uiLanguage}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSettings("uiLanguage", "my")}
              className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                settings.uiLanguage === "my"
                  ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              မြန်မာစာ (Myanmar)
            </button>
            <button
              onClick={() => updateSettings("uiLanguage", "en")}
              className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                settings.uiLanguage === "en"
                  ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Primary bible reading language */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.bibleLanguage}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "my", label: "မြန်မာကျမ်း" },
              { id: "bilingual", label: "Dual (နှစ်ဘာသာ)" },
              { id: "en", label: "English" }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => updateSettings("primaryLanguage", lang.id)}
                className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                  settings.primaryLanguage === lang.id
                    ? "bg-slate-950 dark:bg-gold-500 border-slate-950 dark:border-gold-500 text-white dark:text-slate-950 shadow-md"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Appearance & Typography */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Type className="h-4 w-4 text-gold-500" />
          {t.appearanceHeading}
        </h2>

        {/* Theme mode selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.theme}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateSettings("theme", "light")}
              className={`py-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                settings.theme === "light"
                  ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <Sun className="h-4 w-4 shrink-0" />
              <span>{t.light}</span>
            </button>
            <button
              onClick={() => updateSettings("theme", "sepia")}
              className={`py-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                settings.theme === "sepia"
                  ? "bg-gold-600 border-gold-600 text-white shadow-md shadow-gold-600/10"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <SunDim className="h-4 w-4 shrink-0" />
              <span>{t.sepia}</span>
            </button>
            <button
              onClick={() => updateSettings("theme", "dark")}
              className={`py-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all ${
                settings.theme === "dark"
                  ? "bg-gold-500 border-gold-500 text-white shadow-md shadow-gold-500/10"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <Moon className="h-4 w-4 shrink-0" />
              <span>{t.dark}</span>
            </button>
          </div>
        </div>

        {/* Font size slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{t.fontSize}</span>
            <span className="font-mono text-gold-600 dark:text-gold-400 font-bold">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="14"
            max="28"
            step="2"
            value={settings.fontSize}
            onChange={(e) => updateSettings("fontSize", parseInt(e.target.value))}
            className="w-full accent-gold-500 dark:accent-gold-600 bg-slate-100 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 font-light">
            {t.fontNotice}
          </p>
        </div>
      </div>

      {/* 3. Notifications */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gold-500" />
          {t.notificationsHeading}
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-850">
          <div className="space-y-0.5 max-w-[80%]">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.dailyNotify}
            </span>
            <p className="text-[11px] text-slate-400 font-light leading-relaxed">
              {t.dailyNotifyDesc}
            </p>
          </div>
          
          <button
            onClick={() => updateSettings("dailyNotification", !settings.dailyNotification)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${
              settings.dailyNotification ? "bg-gold-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.dailyNotification ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Reset & Clear Data */}
      <div className="rounded-3xl border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/20 dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          {t.clearHeading}
        </h2>
        
        <p className="text-xs text-slate-400 leading-relaxed font-light">
          {t.clearDesc}
        </p>

        <button
          onClick={handleClearData}
          className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/10 transition-colors active:scale-[0.98]"
        >
          {t.clearBtn}
        </button>
      </div>

      {/* 5. About Grace Bible */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all text-center space-y-4">
        <Info className="h-8 w-8 text-gold-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-gold-200">
            {t.aboutHeading}
          </h3>
          <span className="text-[10px] font-mono text-slate-400 block">
            {t.version} 1.2.0 (Stable Release)
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-md mx-auto leading-relaxed">
          {t.aboutText}
        </p>

        <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 block pt-2 border-t border-slate-50 dark:border-slate-850">
          — {t.creator} —
        </span>
      </div>

    </div>
  );
}
