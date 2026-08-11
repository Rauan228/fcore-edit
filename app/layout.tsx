import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Редактор постов · ФКОР",
  description: "Заполнить плейсхолдеры, отредактировать текст и опубликовать.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
