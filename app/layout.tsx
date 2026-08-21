import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Opsora Z Workspace',
  description: 'A focused Slack-style workspace for modern team communication.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
