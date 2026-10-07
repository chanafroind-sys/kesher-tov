import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "קשר טוב | פלטפורמת עזרה הדדית",
  description: "רשת עזרה הדדית קהילתית למציאת עבודה וחיבורים מקצועיים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
