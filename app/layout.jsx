import { ThemeProvider } from "../components/theme-provider.jsx"
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header.jsx"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tj's Medical Hub",
  description: "Combining genuine care with modern approach",
};

export default function RootLayout({ children }) {
  return (
    // Fixed: Ensure suppressHydrationWarning is on the <html> tag
    <html lang="en" suppressHydrationWarning className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />

          {/* Fixed: Added pt-16 so content isn't hidden under the fixed header */}
          <main className="min-h-screen pt-16">
            {children}
          </main>

          <footer className="bg-muted/50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-200">
              <p>Made by Alee</p>
            </div>
          </footer>

        </ThemeProvider>
      </body>
    </html>
  );
}