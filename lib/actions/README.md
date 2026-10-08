# Server Actions Index & Screen Mapping (קשר טוב)

כל ה-Server Actions בפרויקט מוגדרים תחת `lib/actions/`. 
כאשר משתנה הסביבה `USE_MOCKS=1` פעיל, כל הפעולות מחזירות נתוני Mock עשירים ומדויקים בעברית, המאפשרים לפתח ולבדוק את כל המסכים (J4 עד J11) בצורה מושלמת מבלי לחכות למסד נתונים חי.

---

## מיפוי פעולות שרת לפי מסכי המערכת

| קובץ פעולה | פונקציה מיוצאת | תיאור | מסכים צורכים / משימות |
| :--- | :--- | :--- | :--- |
| `auth.ts` | `validateInvite` | אימות קוד הזמנה מול המערכת | `/join/[code]` (J4, #20) |
| `auth.ts` | `sendOtp` | שליחת קוד אימות 6 ספרות למייל | `/login`, `/join/[code]` (J4, #20) |
| `auth.ts` | `verifyOtp` | אימות קוד OTP והשלמת כניסה | `/login`, `/join/[code]` (J4, #20) |
| `auth.ts` | `signOut` | התנתקות מהמערכת | ניווט / תפריט עליון |
| `profile.ts` | `getProfile` | שליפת פרטי פרופיל המשתמשת | `/profile` (J4, #20) |
| `profile.ts` | `updateProfile` | עדכון פרטים אישיים ותחום עיסוק | `/profile` (J4, #20) |
| `profile.ts` | `setPaymentPreference` | הגדרת שיטת קבלת תודה (בנק/מזומן/צדקה/חסד) | `/profile` (J4, #20) |
| `companies.ts` | `searchCompanies` | חיפוש חברות + מונה עוזרות | `/companies` (J6), `/tasks/new` (J7, #23) |
| `companies.ts` | `addCompany` | הוספת חברה חדשה לקטלוג | `/companies` (J6, #22) |
| `helperLinks.ts` | `getHelperLinks` | שליפת החברות של העוזרת | `/companies` (J6, #22) |
| `helperLinks.ts` | `setHelperLinks` | עדכון חברות, סוגי סיוע והשתקה | `/companies` (J6, #22) |
| `tasks.ts` | `createTask` | פתיחת משימה חדשה וחישוב התאמה | `/tasks/new` (J7, #23) |
| `tasks.ts` | `listMyFeed` | שליפת משימות לעוזרת ולנעזרת | `/` (מסך הבית, J8, #24) |
| `tasks.ts` | `getTask` | שליפת פרטי משימה מלאים | `/tasks/[id]` (J8, #24) |
| `tasks.ts` | `claimTask` | לקיחת משימה לסיוע (עד 3 עוזרות) | `/tasks/[id]` (J8), מייל `/a/[token]` (O9) |
| `tasks.ts` | `markDone` | העוזרת מסמנת שסיימה את חלקה | `/tasks/[id]` (J8, #24) |
| `tasks.ts` | `closeTask` | סגירת משימה ובחירת מי סייעה | `/tasks/[id]` (J8, #24) |
| `tasks.ts` | `cancelTask` | ביטול משימה ע"י הנעזרת | `/tasks/[id]` (J8, #24) |
| `thanks.ts` | `markHired` | סימון קבלה לעבודה | `/hired` (J10, #26) |
| `thanks.ts` | `markFirstSalary` | סימון קבלת משכורת ראשונה וחשיפת פרטי תשלום | `/hired` (J10, #26) |
| `thanks.ts` | `listThanks` | שליפת רשימת תודות לתשלום | `/hired` (J10, #26) |
| `thanks.ts` | `markPaid` | סימון תודה כשולמה + מכתב תודה | `/hired` (J10, #26) |
| `ratings.ts` | `rateMatch` | דירוג דיוק ההתאמה ע"י העוזרת | `/tasks/[id]` (J8, #24) |
| `ratings.ts` | `flagNotClosed` | סימון "עזרתי והיא לא סגרה עליי" | `/tasks/[id]` (J8, #24) |
| `ratings.ts` | `flagNoReply` | סימון "לקחה ולא חזרה אליי" | `/tasks/[id]` (J8, #24) |
| `notifications.ts` | `getNotificationPrefs` | שליפת הגדרות תדירות וסיכום | `/settings/notifications` (J11, #27) |
| `notifications.ts` | `setNotificationPrefs` | עדכון העדפות התראה ושעת סיכום | `/settings/notifications` (J11, #27) |
| `notifications.ts` | `listInAppNotifications` | שליפת התראות פנימיות לפעמון | פעמון עליון ב-App Shell (J11, #27) |
| `notifications.ts` | `markNotificationRead` | סימון התראה כנקראה | פעמון עליון ב-App Shell (J11, #27) |
