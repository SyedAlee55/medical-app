import { ThemeProvider } from "../components/theme-provider.jsx"
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header.jsx"
import { Toaster } from "@/components/ui/sonner"
import LayoutShell from "@/components/layout-shell"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tj's Medical Hub",
  description: "Combining genuine care with modern approach",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Toaster is always present across all routes */}
          <Toaster />

          {/*
            LayoutShell passes <Header /> as a prop (not an import inside a
            client component) — the correct Next.js pattern for using a Server
            Component inside a Client Component. On the landing page (/) the
            shell is bypassed entirely; all other routes get the standard
            Header + padded main + footer wrapper.
          */}
          <LayoutShell header={<Header />}>
            {children}
          </LayoutShell>

        </ThemeProvider>
      </body>
    </html>
  );
}