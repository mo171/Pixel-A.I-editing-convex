import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";// Will be learning this in next course
import { Toaster } from "sonner";// always use in layout page for toast msg so agentic tool also uses it
import { FloatingShapes } from "@/components/floating-shapes"; // made this by myself 
import { ClerkProvider } from "@clerk/nextjs"; // provider wrapper
import Header from "@/components/header";
import { shadesOfPurple } from "@clerk/themes";
import { ConvexClientProvider } from "./ConvexClientProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Image Editor",
  description: "Generate images with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              baseTheme: shadesOfPurple,
            }}
          >
            <ConvexClientProvider>
              <Header />
              <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                <Toaster richColors />
                <FloatingShapes />
                {children}
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
