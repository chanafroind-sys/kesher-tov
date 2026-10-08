# קשר טוב — מסמך ארכיטקטורה ומפרט טכני

פלטפורמת עזרה הדדית קהילתית למציאת עבודה וחיבורים מקצועיים.

---

## 1. תקציר ומטרת המערכת
פלטפורמה המאפשרת לנשים מחפשות עבודה ("נעזרות") לקבל סיוע ישיר מנשים שעובדות בארגונים ובחברות ("עוזרות"):
- הגשת קורות חיים "מבפנים" (חבר מביא חבר).
- מתן מידע פנימי מהימן על התפקיד, התרבות והדרישות.
- הכנה לראיון וליווי אישי.
- מודל "תודה" קהילתי המבוסס על הכרת הטוב, המשולם רק לאחר קבלה לעבודה ומשכורת ראשונה.

---

## 2. מודל הנתונים (Database Schema & Tables)

### טבלאות ליבה:
1. **`profiles`**
   - `id` (uuid, fk auth.users, pk)
   - `full_name` (text, not null)
   - `phone` (text, nullable)
   - `city` (text, nullable)
   - `field` (text, nullable) — תחום מקצועי (פיתוח, בדיקות, מוצר, דאטה, עיצוב וכו')
   - `years_of_experience` (integer, default 0)
   - `cv_storage_path` (text, nullable) — נתיב ב-bucket הפרטי `cvs`
   - `payment_preference` (jsonb) — `{ type: 'bank_transfer' | 'in_person' | 'charity' | 'waive', details: {...} }`
   - `invited_by` (uuid, fk profiles.id, nullable)
   - `is_blocked` (boolean, default false)
   - `created_at` (timestamptz, default now())

2. **`invites`**
   - `id` (uuid, pk)
   - `code` (text, unique, not null)
   - `inviter_id` (uuid, fk profiles.id, not null)
   - `max_uses` (integer, default 5)
   - `used_count` (integer, default 0)
   - `expires_at` (timestamptz, not null)
   - `created_at` (timestamptz, default now())

3. **`companies`**
   - `id` (uuid, pk)
   - `name_he` (text, not null)
   - `name_en` (text, nullable)
   - `website_domain` (text, nullable)
   - `category` (enum: `hitech`, `government`, `banking`, `health`, `education`, `other`)
   - `parent_company_id` (uuid, fk companies.id, nullable)
   - `helper_count` (integer, default 0)
   - `created_at` (timestamptz, default now())

4. **`company_aliases`**
   - `id` (uuid, pk)
   - `company_id` (uuid, fk companies.id, not null)
   - `alias` (text, not null)
   - `created_at` (timestamptz, default now())

5. **`helper_links`**
   - `id` (uuid, pk)
   - `helper_id` (uuid, fk profiles.id, not null)
   - `company_id` (uuid, fk companies.id, not null)
   - `relation` (enum: `current_employee`, `past_employee`, `close_connection`)
   - `help_types` (text[]) — `['cv_submission', 'internal_info', 'interview_prep']`
   - `is_muted` (boolean, default false)
   - `created_at` (timestamptz, default now())
   - unique (helper_id, company_id)

6. **`tasks`**
   - `id` (uuid, pk)
   - `seeker_id` (uuid, fk profiles.id, not null)
   - `company_id` (uuid, fk companies.id, not null)
   - `help_types` (text[], not null)
   - `job_url` (text, nullable)
   - `free_text` (text, nullable) — עד 280 תווים
   - `thanks_amount` (integer, default 0) — 0, 20, 50, 100, custom
   - `status` (enum: `open`, `in_progress`, `closed`, `cancelled`, `expired`)
   - `closed_helper_id` (uuid, fk profiles.id, nullable)
   - `closed_at` (timestamptz, nullable)
   - `expires_at` (timestamptz, default now() + interval '30 days')
   - `created_at` (timestamptz, default now())

7. **`job_matches`**
   - `id` (uuid, pk)
   - `task_id` (uuid, fk tasks.id, not null)
   - `requirements` (jsonb) — מערך של `{ text: string, required: boolean, match: 'full' | 'partial' | 'no', cv_evidence: string }`
   - `score` (integer, not null) — מחושב לפי נוסחת ההתאמה

8. **`task_claims`**
   - `id` (uuid, pk)
   - `task_id` (uuid, fk tasks.id, not null)
   - `helper_id` (uuid, fk profiles.id, not null)
   - `status` (enum: `claimed`, `marked_done`, `cancelled`)
   - `claimed_at` (timestamptz, default now())
   - `done_at` (timestamptz, nullable)
   - unique (task_id, helper_id)
   - אכיפה במסד הנתונים: מקסימום 3 עוזרות למשימה, ללא claim עצמי.

9. **`thanks`**
   - `id` (uuid, pk)
   - `task_id` (uuid, fk tasks.id, not null)
   - `seeker_id` (uuid, fk profiles.id, not null)
   - `helper_id` (uuid, fk profiles.id, not null)
   - `amount` (integer, not null)
   - `status` (enum: `pending_first_salary`, `ready_to_pay`, `paid`, `waived`)
   - `paid_at` (timestamptz, nullable)
   - `note` (text, nullable)
   - `created_at` (timestamptz, default now())

10. **`ratings`**
    - `id` (uuid, pk)
    - `task_id` (uuid, fk tasks.id, not null)
    - `rater_id` (uuid, fk profiles.id, not null)
    - `rated_id` (uuid, fk profiles.id, not null)
    - `type` (enum: `match_accuracy`, `reply_responsiveness`, `fair_closing`)
    - `score` (integer, not null)
    - `flag_reason` (text, nullable)
    - `created_at` (timestamptz, default now())
    - unique (task_id, rater_id, type)

11. **`email_action_tokens`**
    - `id` (uuid, pk)
    - `user_id` (uuid, fk profiles.id, not null)
    - `action` (text, not null)
    - `payload` (jsonb, default '{}')
    - `expires_at` (timestamptz, not null)
    - `used_at` (timestamptz, nullable)
    - `created_at` (timestamptz, default now())

12. **`notifications_outbox`**
    - `id` (uuid, pk)
    - `event_type` (text, not null)
    - `task_id` (uuid, fk tasks.id, nullable)
    - `actor_id` (uuid, fk profiles.id, nullable)
    - `payload` (jsonb, default '{}')
    - `created_at` (timestamptz, default now())
    - `processed_at` (timestamptz, nullable)

---

## 3. תהליכי הליבה (Core Flows)

1. **פתיחת משימה (Create Task):**
   - הנעזרת בוחרת חברה, סוגי עזרה, קישור למשרה, דרישות (עם סימון התאמה) וסכום תודה רצוי.
   - מגבלה: עד 5 משימות פתוחות בו-זמנית לנעזרת, משימה פתוחה אחת בלבד לאותה חברה.
   - כל משימה מייצרת שורה ב-`notifications_outbox`.

2. **לקיחת משימה (Claim Task):**
   - מתבצעת דרך פונקציית מסד נתונים `claim_task(task_id)` ב-`SECURITY DEFINER` ונעילת שורה (`SELECT ... FOR UPDATE`).
   - עד 3 עוזרות לכל משימה. עוזרת רביעית נחסמת ברמת ה-DB.
   - רק לאחר לקיחה, העוזרת זוכה לקבלת פרטי הנעזרת וקישור לקורות החיים שלה.

3. **סימון סיום בידי העוזרת (Mark Done):**
   - העוזרת מסמנת "עשיתי את שלי" (הגשתי, דיברתי, סייעתי). נשלחת התראה לנעזרת.

4. **סגירת משימה (Close Task):**
   - מבוצעת אך ורק על ידי הנעזרת באמצעות `close_task(task_id, helper_id)`.
   - אם העוזרת בחרה בעוזרת ספציפית — נוצרת שורת `thanks`.
   - המשימה ננעלת לכל שינוי ולקיחות נוספות.

---

## 4. מנגנון התודה (Thanks Mechanism)

- **תשלום מאוחר בלבד:** סכום התודה אינו מועבר בפתיחה, בלקיחה ואף לא בעת הקבלה לעבודה.
- **שלב 1 (התקבלתי לעבודה):** עדכון סטטוס `markHired`.
- **שלב 2 (משכורת ראשונה):** עדכון `markFirstSalary` החושף את רשימת התודות עם פרטי התשלום שהעוזרת הגדירה (העברה בנקאית, מזומן, תרומה או ויתור כחסד).
- **שלב 3 (סגירת תודה):** סימון `markPaid` בצירוף מכתב תודה אישי.

---

## 5. אמינות, ציונים וכללים אוטומטיים

- **נוסחת התאמה (Match %):**
  - דרישת חובה (Required): משקל כפול (2x).
  - התאמה מלאה (Full): 100 נקודות.
  - התאמה חלקית (Partial): 50 נקודות.
  - אין התאמה (No): 0 נקודות.
- **מדדי אמינות:**
  - נעזרת: יחס סגירה הוגנת, אמינות התאמה.
  - עוזרת: כמות סיועים, אחוז מענה.
  - מדדים מוצגים רק לאחר מינימום 3 משימות.
- **כללים אוטומטיים:**
  - 3 דגלי "לא סגרה משימה" -> הגבלת הנעזרת ל-2 משימות פתוחות וגלים קטנים יותר.
  - 3 דגלי "לקחה ולא חזרה" -> הורדת תעדוף העוזרת.
  - 3 תלונות שונות -> השעיית משתמשת, חסימת יצירת משימות והזמנות, והתראה למזמינה שלה.

---

## 6. פרטיות, אבטחה וסינון אינטרנט

- **Row Level Security (RLS):**
  - עוזרות אינן רואות עוזרות אחרות שלקחו את אותה משימה.
  - פרטי הנעזרת חסויים לחלוטין בפני כל מי שטרם ביצעה Claim.
  - קורות חיים מאוחסנים ב-Bucket פרטי (`cvs`) ונגישים רק ב-Signed URL קצר-מועד.
- **מחיקת חשבון:** מחיקה מלאה של פרופיל, קבצי קורות חיים, קישורים ודירוגים.
- **מחיקה אוטומטית (Retention):** מחיקת קורות חיים של משתמשות שלא היו פעילות 12 חודשים.
- **סינון אינטרנט (נטפרי / נתיב):**
  - ללא תמונות משתמשים (אוואטרים מבוססי אותיות בלבד).
  - ללא CDNs חיצוניים למעט Google Fonts (Heebo).
  - כפתורי מייל מוגנים מפני סורקי דואר אוטומטיים.

---

## 7. כפתורי פעולה במייל (Signed Tokens)

- קישורי `/a/[token]` עם טוקן חד-פעמי חתום (תוקף ל-14 ימים).
- בקשת `GET` **לעולם אינה מבצעת פעולה** (מניעת הפעלה ע"י סורקי מיילים ומסנני אבטחה).
- דף הנחיתה מציג כפתור אישור גדול בעברית, ורק שליחת `POST` מבצעת את הפעולה.

---

## 8. התראות ומיילים

- אינטגרציה עם **Resend** ותבניות ב-React Email.
- תקרת התראות: מקסימום 3 מיילים מיידיים ביום למשתמשת; שאר העדכונים נשלחים בסיכום (Digest).
- **שקט בשבתות וחגים:** סנכרון שנתי מול Hebcal. השהיית כל ההתראות לאורך השבת והחג ושליחת סיכום מרוכז בצאת השבת.

---

## 9. רשימת החברות וחיפוש חכם

- חיפוש באמצעות `pg_trgm` עם סובלנות לשגיאות כתיב בעברית ובאנגלית.
- מנגנון כינויים (Aliases) אוטומטי המאחד כפילויות על בסיס דומיין האתר.
