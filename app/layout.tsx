import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3D Action RPG - Elemental Combat',
  description: 'A 3D action RPG game with physics-based elemental combat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
