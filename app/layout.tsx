import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Wifi Menu",
    description: "Your menu in the digital world",
    icons: {
        icon: "/wifi-menu-logo-white.svg"
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                    <body className={`${inter.className} min-h-screen flex flex-col scroll-smooth dark:bg-gray-950 dark:text-white`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    >
                            <Header />
                            <main className="flex flex-col flex-1">{children}</main>
                            <SpeedInsights />
                            <Toaster />
                            <Footer />
                </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
