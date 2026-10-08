"use client";

import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import type { FeedItem } from "@/lib/actions/tasks";

interface TaskCardProps {
  task: FeedItem;
  role: "helper" | "seeker";
}

export function TaskCard({ task, role }: TaskCardProps) {
  const isHelper = role === "helper";

  return (
    <Card
      variant={isHelper ? "highlight" : "default"}
      className="flex flex-col justify-between gap-5 transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xl font-black text-ink-900">{task.companyName}</span>
          <Badge
            variant={
              task.status === "open"
                ? "brand"
                : task.status === "in_progress"
                ? "honey"
                : "mint"
            }
          >
            {task.status === "open"
              ? "פתוחה לעזרה"
              : task.status === "in_progress"
              ? "בתהליך"
              : "הושלמה"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {task.helpTypes.map((ht) => (
            <span
              key={ht}
              className="text-xs font-semibold rounded-lg bg-cream px-2.5 py-1 text-ink-700 border border-ink-900/5"
            >
              {ht}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-ink-600 bg-white/70 p-3 rounded-2xl border border-ink-900/5">
          <div>
            <span className="text-ink-500 block">התאמה למשרה:</span>
            <strong className="text-sm font-bold text-brand-700">{task.matchScore}%</strong>
          </div>
          <div>
            <span className="text-ink-500 block">תודה מוצעת:</span>
            <strong className="text-sm font-bold text-honey-600">₪{task.thanksAmount}</strong>
          </div>
        </div>

        {isHelper && (
          <p className="mt-3 text-xs text-ink-500">
            🔒 שם הנעזרת וקורות החיים חסויים לחלוטין עד לקיחת המשימה.
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-ink-900/5">
        <Link href={`/tasks/${task.id}`} className="block">
          <Button
            variant={isHelper ? "primary" : "secondary"}
            size="md"
            fullWidth
          >
            {isHelper ? "צפייה במשימה ואפשרות לעזור ←" : "ניהול המשימה שלי ←"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
