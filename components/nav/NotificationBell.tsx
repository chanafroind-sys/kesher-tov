"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  listInAppNotifications,
  markNotificationRead,
  type InAppNotification,
} from "@/lib/actions/notifications";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    async function fetchNotifs() {
      const res = await listInAppNotifications();
      if (res.ok) {
        setNotifications(res.data);
      }
    }
    fetchNotifs();
  }, []);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationRead(id);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-label="התראות"
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid place-items-center size-10 rounded-full border border-ink-900/10 bg-white text-ink-700 shadow-soft transition hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 start-1.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-brand-600 ring-2 ring-white" />
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute start-0 sm:start-auto sm:end-0 mt-2 w-80 sm:w-96 rounded-2xl border border-ink-900/10 bg-white shadow-lift z-50 overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between p-4 border-b border-ink-900/10 bg-cream/40">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-ink-900">התראות ועדכונים</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                  {unreadCount} חדשות
                </span>
              )}
            </div>

            <Link
              href="/settings/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              הגדרות התראה
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-ink-900/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-500">
                אין התראות חדשות כרגע
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition flex items-start justify-between gap-3 ${
                    n.isRead ? "bg-white opacity-70" : "bg-brand-50/30"
                  }`}
                >
                  <div className="flex-1 text-start">
                    <h4 className="text-sm font-bold text-ink-900">{n.title}</h4>
                    <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">{n.body}</p>
                    {n.taskId && (
                      <Link
                        href={`/tasks/${n.taskId}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-block text-xs font-bold text-brand-700 mt-1.5 hover:underline"
                      >
                        לצפייה במשימה ←
                      </Link>
                    )}
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[10px] font-bold text-ink-400 hover:text-brand-700 whitespace-nowrap"
                      title="סימון כנקרא"
                    >
                      סמן כנקרא
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 text-center bg-cream/20 border-t border-ink-900/5">
            <Link
              href="/settings/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-ink-700 hover:text-brand-700"
            >
              ניהול תדירות מיילים והשתקת חברות ←
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
