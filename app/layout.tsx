import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store";
import { Shell } from "@/components/shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Khawaja Traders — General Store & Cosmetics",
  description: "Browse retail and wholesale prices at Khawaja Traders in Rawalpindi and Islamabad. Order on WhatsApp or from the cart.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
