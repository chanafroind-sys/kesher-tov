# קשר טוב (Kesher Tov) 🤝

**פלטפורמת עזרה הדדית למציאת עבודה בקהילה**

מערכת המחברת בין נשים מהקהילה המחפשות עבודה לבין עובדות בחברות ("עוזרות") המסייעות בהגשת קורות חיים, מידע פנימי, בדיקת התאמה והמלצות, בדיסקרטיות מלאה ובאופן מכבד.

---

## 🛠️ טכנולוגיות

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4 (RTL, עברית מלאה), פונט Heebo
- **Backend / DB:** Supabase (PostgreSQL, Row Level Security - RLS, Auth OTP, Storage, Edge Functions)
- **Emails:** Resend + React Email
- **Testing:** Vitest (יחידה), Playwright (בדיקות E2E)
- **Code Quality:** ESLint, Prettier, TypeScript Strict

---

## 🚀 התקנה והרצה מקומית

### דרישות מקדימות
- **Node.js** גרסה 20 ומעלה (מומלץ LTS / 22+)
- **Git**
- **Docker Desktop** (עבור הרצת Supabase מקומית)

### שלבי התקנה

1. **שכפול המאגר:**
   ```bash
   git clone https://github.com/chanafroind-sys/kesher-tov.git
   cd kesher-tov
   ```

2. **התקנת תלויות:**
   ```bash
   npm install
   ```

3. **הגדרת משתני סביבה:**
   העתיקו את קובץ הדוגמה לקובץ מקומי:
   ```bash
   cp .env.example .env.local
   ```
   (ב-Windows PowerShell: `Copy-Item .env.example .env.local`)

4. **הפעלת Supabase מקומי (אופציונלי / פיתוח מלא):**
   ```bash
   npx supabase start
   ```

5. **הפעלת שרת הפיתוח:**
   ```bash
   npm run dev
   ```
   האפליקציה תיפתח בכתובת: [http://localhost:3000](http://localhost:3000).

---

## 📜 פקודות זמינות

| פקודה | תיאור |
|---|---|
| `npm run dev` | הפעלת שרת הפיתוח המקומי |
| `npm run build` | בניית גרסת ייצור (Production Build) |
| `npm run start` | הרצת שרת ה-Production |
| `npm run lint` | בדיקת איכות קוד בעזרת ESLint |
| `npm run typecheck` | בדיקת טיפוסים ב-TypeScript (`tsc --noEmit`) |
| `npm test` | הרצת בדיקות יחידה בעזרת Vitest |
| `npm run test:e2e` | הרצת בדיקות קצה-לקצה בעזרת Playwright |
| `npm run format` | עיצוב קוד בעזרת Prettier |

---

## 🔒 אבטחה ופרטיות

- המערכת בנויה לפי עקרונות פרטיות מחמירים (RLS במסד הנתונים).
- פרטי מחפשות העבודה חסויים עד ללקיחת המשימה על ידי עוזרת.
- תמיכה מלאה במסנני אינטרנט קהילתיים (נטפרי, נתיב וכדומה) וללא תמונות משתמשים.
