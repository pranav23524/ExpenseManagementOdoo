import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ExpenseProvider } from "@/lib/expense-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "ExpenseFlow - Expense Management System",
  description: "Professional expense management and approval workflows",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <ExpenseProvider>{children}</ExpenseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
