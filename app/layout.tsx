import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "קשר טוב | עזרה הדדית במציאת עבודה",
  description:
    "מישהי כבר עובדת שם — והיא רוצה לעזור לך. רשת קהילתית שמחברת בין מחפשות עבודה לנשים שעובדות בחברות.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
