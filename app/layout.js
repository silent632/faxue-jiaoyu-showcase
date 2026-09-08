import WelcomeAnnouncement from "@/components/welcome-announcement";
import help from "@/content/help.json";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://falixue-yanxi.pages.dev"),
  title: "裁判文书研习平台",
  description: "面向法理学教学改革的双师协同、案例研习与成果展示平台",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}<WelcomeAnnouncement copy={help.welcome} email={help.feedback.email}/></body>
    </html>
  );
}
