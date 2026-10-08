"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listMyFeed, type FeedItem } from "@/lib/actions/tasks";
import { Button, Card, Badge, EmptyState } from "@/components/ui";
import { TaskCard } from "@/components/task";

export function AppDashboard() {
  const [loading, setLoading] = useState(true);
  const [helperTasks, setHelperTasks] = useState<FeedItem[]>([]);
  const [seekerTasks, setSeekerTasks] = useState<FeedItem[]>([]);
  const [counters, setCounters] = useState({ helpedCount: 0, activeSeekerCount: 0 });

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      const res = await listMyFeed();
      if (res.ok) {
        setHelperTasks(res.data.helperTasks);
        setSeekerTasks(res.data.seekerTasks);
        setCounters(res.data.counters);
      }
      setLoading(false);
    }
    loadFeed();
  }, []);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Top Banner & Quick Stats */}
      <Card variant="highlight" className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-800 mb-2">
            האזור האישי שלי
          </span>
          <h1 className="text-3xl font-black text-ink-900">שלום, שרה כהן!</h1>
          <p className="mt-1 text-base text-ink-600">
            תמונת מצב עדכנית של בקשות העזרה והמשימות שלך בקהילה.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/80 border border-ink-900/10 rounded-2xl px-5 py-3 text-center shadow-soft">
            <span className="block text-2xl font-black text-brand-700">{counters.helpedCount}</span>
            <span className="text-xs text-ink-600 font-semibold">עזרת לנשים</span>
          </div>
          <div className="bg-white/80 border border-ink-900/10 rounded-2xl px-5 py-3 text-center shadow-soft">
            <span className="block text-2xl font-black text-honey-600">{counters.activeSeekerCount}</span>
            <span className="text-xs text-ink-600 font-semibold">משימות פעילות</span>
          </div>
        </div>
      </Card>

      {/* Section 1: Helper Tasks (משימות שמחכות לעזרה בחברות שלי) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-ink-900">נשים שמחפשות עזרה בחברות שלך</h2>
              <Badge variant="brand">{helperTasks.length}</Badge>
            </div>
            <p className="text-sm text-ink-600 mt-1">
              בקשות עזרה של חברות קהילה בחברות שסימנת שאת מכירה או עובדת בהן.
            </p>
          </div>

          <Link href="/companies">
            <Button variant="ghost" size="sm">
              ניהול החברות שלי ←
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ink-500 font-medium">טוען משימות...</div>
        ) : helperTasks.length === 0 ? (
          <EmptyState
            icon={<span>🌱</span>}
            title="אין כרגע משימות פתוחות בחברות שלך"
            description="כשמישהי תפתח משימה בחברות שאת מכירה, תקבלי על כך הודעה מיידית או בסיכום היומי."
            action={
              <Link href="/companies">
                <Button variant="primary">הוספת חברות נוספות</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helperTasks.map((t) => (
              <TaskCard key={t.id} task={t} role="helper" />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Seeker Tasks (המשימות שלי כמחפשת עבודה) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-ink-900">המשימות שלי (סיוע בהגשת קו&quot;ח)</h2>
              <Badge variant="honey">{seekerTasks.length}</Badge>
            </div>
            <p className="text-sm text-ink-600 mt-1">
              בקשות עזרה שפתחת, מצב הלקיחה ע&quot;י עוזרות וסטטוס התהליך.
            </p>
          </div>

          <Link href="/tasks/new">
            <Button variant="primary" size="md">
              + פתיחת משימה חדשה
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ink-500 font-medium">טוען משימות...</div>
        ) : seekerTasks.length === 0 ? (
          <EmptyState
            icon={<span>💼</span>}
            title="עדיין לא פתחת אף משימה"
            description="מצאת משרה שמתאימה לך? פתחי משימה כדי שעובדת מהחברה תוכל להגיש את קורות החיים שלך מבפנים."
            action={
              <Link href="/tasks/new">
                <Button variant="primary">+ פתיחת משימה ראשונה</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seekerTasks.map((t) => (
              <TaskCard key={t.id} task={t} role="seeker" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
