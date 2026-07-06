import React, { useState } from "react";
import { Compass, CheckCircle2, Circle, ArrowRight, Award, Calendar, BookOpen } from "lucide-react";
import { bibleService } from "../services/bibleService";
import { ReadingPlan, ReadingPlanProgress, PassageReference } from "../types";

interface PlansSectionProps {
  onNavigate: (tab: string, bookId?: number, chapter?: number) => void;
  uiLang: "en" | "my";
  planProgress: ReadingPlanProgress[];
  onTogglePlanDay: (planId: string, day: number) => void;
}

export default function PlansSection({
  onNavigate,
  uiLang,
  planProgress,
  onTogglePlanDay
}: PlansSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const plans = bibleService.getReadingPlans();

  const getPlanProgress = (planId: string): number => {
    const progress = planProgress.find((p) => p.planId === planId);
    if (!progress) return 0;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return 0;
    return Math.round((progress.completedDays.length / plan.durationDays) * 100);
  };

  const isDayCompleted = (planId: string, day: number): boolean => {
    const progress = planProgress.find((p) => p.planId === planId);
    return progress ? progress.completedDays.includes(day) : false;
  };

  const activePlan = plans.find((p) => p.id === selectedPlanId);

  const t = {
    en: {
      title: "Scripture Reading Plans",
      desc: "Stay consistent and grow spiritually with guided reading plans. Track your daily journey.",
      progress: "Progress",
      startPlan: "Start Journey",
      continue: "Continue Plan",
      completedDays: "days completed",
      backToPlans: "Back to Reading Plans",
      daysGrid: "Daily Schedule",
      passagesForDay: "Reading Passages",
      markComplete: "Mark Day Complete",
      markIncomplete: "Undo Completion",
      congrats: "You've finished this plan! Well done, good and faithful servant.",
      noActive: "Select a plan below to begin your structured reading journey."
    },
    my: {
      title: "ကျမ်းစာဖတ်ရှုခြင်း အစီအစဉ်များ",
      desc: "သတ်မှတ်ထားသော အစီအစဉ်များအတိုင်း စနစ်တကျဖတ်ရှုပြီး ဝိညာဉ်ရေးရာ ကြီးထွားလာပါစေ။ သင်၏ တိုးတက်မှုကို မှတ်သားပါ။",
      progress: "တိုးတက်မှု",
      startPlan: "ခရီးစဉ်စတင်ရန်",
      continue: "ဆက်လက်လုပ်ဆောင်ရန်",
      completedDays: "ရက် ပြီးစီးပြီး",
      backToPlans: "အစီအစဉ်များသို့ ပြန်သွားရန်",
      daysGrid: "နေ့စဉ်အချိန်ဇယား",
      passagesForDay: "ဖတ်ရှုရမည့် ကျမ်းပိုဒ်များ",
      markComplete: "ပြီးစီးကြောင်း မှတ်သားရန်",
      markIncomplete: "ပြီးစီးမှုကို ပြန်ဖျက်ရန်",
      congrats: "ဤအစီအစဉ်ကို ဖတ်ရှုပြီးမြောက်သွားပါပြီ။ သစ္စာရှိသော အစေခံကောင်း ဖြစ်ပါ၏။",
      noActive: "စနစ်တကျ ကျမ်းစာဖတ်ရှုခြင်းခရီးကို စတင်ရန် အောက်ပါအစီအစဉ်များအနက် တစ်ခုကို ရွေးချယ်ပါ။"
    }
  }[uiLang];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {!selectedPlanId ? (
        // LIST OF READING PLANS
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto py-4">
            <h1 className="font-serif text-3xl font-bold text-slate-950 dark:text-gold-200">
              {t.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
              {t.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const progressPct = getPlanProgress(plan.id);
              const progress = planProgress.find((p) => p.planId === plan.id);
              const completedCount = progress ? progress.completedDays.length : 0;

              return (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gold-50 dark:bg-gold-950/20 text-gold-500">
                        <Compass className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
                        {uiLang === "en" ? plan.nameEn : plan.nameMy}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {uiLang === "en" ? plan.descriptionEn : plan.descriptionMy}
                    </p>

                    {/* Progress indicator bar */}
                    {completedCount > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>{t.progress}</span>
                          <span className="text-gold-600 dark:text-gold-400">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${progressPct}%` }}
                            className="h-full bg-gold-500 dark:bg-gold-600 rounded-full transition-all duration-500"
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {completedCount} / {plan.durationDays} {t.completedDays}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setSelectedPlanId(plan.id)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-gold-500 dark:hover:bg-gold-600 text-white dark:text-slate-950 font-bold text-xs py-3 shadow-md transition-all active:scale-[0.98]"
                    >
                      {completedCount > 0 ? t.continue : t.startPlan}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ACTIVE PLAN OVERVIEW & SCHEDULE
        activePlan && (
          <div className="space-y-6">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
              >
                ← {t.backToPlans}
              </button>
              <span className="text-xs font-bold text-gold-500 bg-gold-50 dark:bg-gold-950/20 px-3 py-1 rounded-full">
                {activePlan.durationDays} Days Plan
              </span>
            </div>

            {/* Title / Meta Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Compass className="h-6 w-6 text-gold-500" />
                <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-gold-200">
                  {uiLang === "en" ? activePlan.nameEn : activePlan.nameMy}
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                {uiLang === "en" ? activePlan.descriptionEn : activePlan.descriptionMy}
              </p>

              {/* General Progress Overview */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Plan progress</span>
                  <span>{getPlanProgress(activePlan.id)}% Completed</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${getPlanProgress(activePlan.id)}%` }}
                    className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>

            {/* Days Schedule Grid */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-gold-500" />
                {t.daysGrid}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePlan.readings.map((dayReading) => {
                  const isCompleted = isDayCompleted(activePlan.id, dayReading.day);

                  return (
                    <div
                      key={dayReading.day}
                      className={`rounded-xl border p-4 shadow-sm flex items-start gap-4 transition-all ${
                        isCompleted
                          ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900"
                          : "bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-850 hover:border-gold-300"
                      }`}
                    >
                      {/* Check Circle Button */}
                      <button
                        onClick={() => onTogglePlanDay(activePlan.id, dayReading.day)}
                        className={`p-1 rounded-full shrink-0 transition-colors ${
                          isCompleted
                            ? "text-emerald-500 hover:text-emerald-600"
                            : "text-slate-300 hover:text-gold-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 fill-current" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>

                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {uiLang === "en" ? `Day ${dayReading.day}` : `ရက်မြောက် ${dayReading.day}`}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                              Done
                            </span>
                          )}
                        </div>

                        {/* List of Passages */}
                        <div className="space-y-1">
                          {dayReading.passages.map((p, idx) => {
                            const b = bibleService.getBook(p.bookId);
                            if (!b) return null;

                            return (
                              <button
                                key={idx}
                                onClick={() => onNavigate("bible", p.bookId, p.chapter)}
                                className="w-full text-left inline-flex items-center justify-between text-xs font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 hover:underline bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg"
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <BookOpen className="h-3 w-3 text-gold-500 shrink-0" />
                                  {uiLang === "en" ? b.nameEn : b.nameMy} {p.chapter}
                                </span>
                                <ArrowRight className="h-3 w-3 opacity-60" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan finished banner */}
            {getPlanProgress(activePlan.id) === 100 && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center shadow-xl space-y-3">
                <Award className="h-10 w-10 text-white mx-auto animate-bounce" />
                <h4 className="font-serif text-lg font-bold">
                  Hallelujah!
                </h4>
                <p className="text-xs text-emerald-50 max-w-sm mx-auto font-light leading-relaxed">
                  {t.congrats}
                </p>
              </div>
            )}

          </div>
        )
      )}
    </div>
  );
}
