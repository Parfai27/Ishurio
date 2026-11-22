import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { SCHOOL_NAME } from "@/lib/format";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: `Ishurio · ${SCHOOL_NAME}`, template: `%s · Ishurio` },
  description: "Attendance, results, fees and parent notices for your school.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrains.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
