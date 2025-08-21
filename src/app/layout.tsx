import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/lib/settings-context";
import { LoadingProvider } from "@/components/providers/loading-provider";
import "./globals.css";

// Primary font for body text - Inter is highly readable and modern
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Display font for headings - Poppins is friendly yet professional
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Monospace font for code - JetBrains Mono is clean and readable
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MindTrack - Mental Health Questionnaire Platform",
  description: "Comprehensive mental health questionnaire management platform for healthcare professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <LoadingProvider
          enableSplash={true}
          splashMinDuration={2500}
          skipSplashInDev={false}
          preloadResources={[
            // Add any resources you want to preload
            '/images/logo.png',
            '/images/hero-bg.jpg'
          ]}
        >
          <AuthProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
