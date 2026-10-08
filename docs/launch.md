# מדריך העלאה לייצור וצ'קליסט השקה (Production Launch Checklist)

מסמך זה מרכז את כל שלבי ההקמה, האבטחה, הגדרות ה-DNS והבדיקות הנדרשות לקראת העלאת פלטפורמת **"קשר טוב"** לסביבת ייצור (Production).

---

## 1. פרויקט Supabase בייצור (Production Database & Storage)

### א. יצירת הפרויקט והרצת מיגרציות
1. צרי פרויקט חדש ב-Supabase (מומלץ ב-Region: `Frankfurt (eu-central-1)` הקרוב ביותר לישראל).
2. הריצי את כל קבצי המיגרציה לפי הסדר ב-SQL Editor:
   - `supabase/migrations/20261008000001_initial_schema.sql` (סכמת טבלאות הליבה, RLS, אינדקסים `pg_trgm`)
   - `supabase/migrations/20261008000002_retention.sql` (מחיקה אוטומטית של קו"ח לא פעילים ודירוגים ישנים)
   - `supabase/migrations/20261008000003_reliability.sql` (מדדי אמינות, דוחות התנהגות פסולה וחסימות)
   - `supabase/migrations/20261008000004_wave_dispatch.sql` (שליחה בגלים וביטול אוטומטי בהגעה ל-3 לקיחות)

### ב. הגדרת אחסון קורות חיים (Private Storage Bucket)
1. צרי Storage Bucket בשם `cvs`.
2. ודאי שה-Bucket מוגדר כ-**Private** (Public: `false`).
3. הגבילי העלאה לקבצי `application/pdf` בלבד ובגודל מקסימלי של עד `5MB`.
4. הגישה לקבצים תתבצע אך ורק באמצעות **Signed URLs** קצרי-מועד (15 דקות) הנוצרים בעת לקיחת המשימה.

### ג. הפעלת משימות תקופתיות (pg_cron)
ודאי שההרחבה `pg_cron` מופעלת בפרויקט והגדירי את ה-cron jobs הבאים:
```sql
-- הרצה לילית ב-03:00 למחיקת קו"ח של משתמשות שלא פעלו 12 חודשים
SELECT cron.schedule('purge-retention-nightly', '0 3 * * *', 'SELECT public.purge_inactive_cvs_and_old_ratings();');

-- הרצת תור ההתראות כל דקה
SELECT cron.schedule('process-outbox-every-minute', '* * * * *', 'SELECT public.process_pending_outbox_notifications();');
```

### ד. גיבויים ושחזור
- הפעילי **Point-in-Time Recovery (PITR)** בהגדרות ה-Database ב-Supabase (שמירת היסטוריה ל-7 ימים).
- ודאי שגיבויי ה-Daily Backups מופעלים.

---

## 2. הגדרת סביבת Vercel ומשתני סביבה (Environment Variables)

הוסיפי ב-Vercel Project Settings את משתני הסביבה הבאים:

| שם המשתנה | סביבת Production | סביבת Preview (Staging) | תיאור |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[prod-id].supabase.co` | `https://[staging-id].supabase.co` | כתובת הפרויקט |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[prod-anon-key]` | `[staging-anon-key]` | מפתח פומבי (Client) |
| `SUPABASE_SERVICE_ROLE_KEY` | `[prod-service-role-key]` | `[staging-service-role-key]` | מפתח שרת מאובטח (Server Actions) |
| `RESEND_API_KEY` | `re_prod_...` | `re_staging_...` | מפתח שליחת מיילים ב-Resend |
| `EMAIL_FROM` | `קשר טוב <notifications@kesher-tov.co.il>` | `קשר טוב <dev@kesher-tov.co.il>` | כתובת השולח המאומתת |
| `NEXT_PUBLIC_APP_URL` | `https://kesher-tov.co.il` | `https://staging.kesher-tov.co.il` | כתובת הדומיין לקישורי מייל |
| `ACTION_TOKEN_SECRET` | מחרוזת אקראית חזקה (64 תווים) | מחרוזת שונה לסביבת בדיקות | חתימה על קישורי כפתורים במייל |
| `MOCK_MODE` | `false` | `false` | הפעלת מסד נתונים אמיתי |

---

## 3. אימות דומיין ומשלוח מיילים (Resend DNS Records)

כדי להבטיח עבירות מייל של 100% (Deliverability) ישירות ל-Primary Inbox של Gmail ו-Outlook ולמנוע נפילה לתיבת ספאם, יש להוסיף את הרשומות הבאות אצל רשם הדומיין (DNS Provider):

### רשומות DNS נדרשות:

| סוג (Type) | שם (Host / Name) | ערך (Value / Target) | עדיפות (Priority) | TTL |
|---|---|---|---|---|
| **TXT** (SPF) | `bounces.kesher-tov.co.il` | `v=spf1 include:amazonses.com ~all` | - | 3600 |
| **MX** | `bounces.kesher-tov.co.il` | `feedback-smtp.eu-west-1.amazonses.com` | `10` | 3600 |
| **CNAME** (DKIM 1) | `resend._domainkey` | `dkim.resend.com` | - | 3600 |
| **CNAME** (DKIM 2) | `resend2._domainkey` | `dkim2.resend.com` | - | 3600 |
| **TXT** (DMARC) | `_dmarc.kesher-tov.co.il` | `v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-reports@kesher-tov.co.il` | - | 3600 |

> [!IMPORTANT]
> לאחר הוספת הרשומות, היכנסי ללוח הבקרה של Resend ולחצי על **Verify Domain**. ודאי שכל 3 הסימונים (SPF, DKIM, DMARC) בירוק (Verified).

---

## 4. אישור מסנני אינטרנט כשרים (נטפרי, נתיב, אתרוג, כשר פליי)

פלטפורמת "קשר טוב" נבנתה מראש בהתאמה מלאה למסננים כשרים:
1. **ללא תמונות משתמשים:** אוואטרים מבוססי אותיות וצבעים בלבד (אין צורך בסינון תמונות אנושיות).
2. **ללא תלות ב-CDNs חיצוניים:** גופן `Heebo` מוטמע מקומית, ללא סקריפטים זרים.
3. **הגנת סורקים במייל:** כל כפתור במייל מוגן מפני `GET` scanners ואינו מפעיל פעולה אוטומטית.

### פנייה לפתיחת האתר בנטפרי:
- שליחת פנייה דרך מערכת הפניות של נטפרי עם הכתובת `https://kesher-tov.co.il`.
- הגדרה: "אתר עזרה הדדית קהילתי סגור לנשים חרדיות לחיפוש עבודה בהזמנה אישית בלבד. האתר אינו כולל תמונות אנושיות או תוכן שיווקי."

---

## 5. בדיקת עשן לפני פתיחה (Production Smoke Test Checklist)

לפני הזמנת המשתמשות הראשונות, יש לבצע את המסלול המלא (End-to-End):

1. **הרשמה בהזמנה:**
   - גלישה לקישור `/join/[code]` עם קוד הזמנה תקין.
   - הזנת מייל וקבלת קוד אימות חד-פעמי (OTP) תוך פחות מ-10 שניות.
   - אישור תנאי השימוש וכניסה לפרופיל.
2. **ניהול חברות עזרה:**
   - כניסה ל-`/companies`, הוספת חברה (לדוגמה: "מטריקס"), הגדרת סוגי סיוע ("הגשת קו\"ח מבפנים").
3. **פתיחת משימת עזרה:**
   - כניסה ל-`/tasks/new` מחשבון של נעזרת.
   - בחירת אותה חברה, סימון דרישות, קבלת ציון התאמה והגשת המשימה.
4. **קבלת התראה וסגירת מעגל:**
   - בדיקה שהעוזרת קיבלה מייל מעוצב ומכובד מכתובת הדומיין.
   - לחיצה על כפתור הלקיחה במייל (`/a/[token]`), אישור בדף הלקיחה וקבלת פרטי הנעזרת.
   - סימון סיום וסגירת המשימה.
