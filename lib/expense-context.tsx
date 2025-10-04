"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

export type ExpenseStatus = "draft" | "pending" | "approved" | "rejected"
export type ExpenseCategory = "travel" | "meals" | "office" | "equipment" | "other"

export interface Expense {
  id: string
  userId: string
  userName: string
  amount: number
  currency: string
  category: ExpenseCategory
  description: string
  merchant: string
  date: string
  status: ExpenseStatus
  receiptUrl?: string
  receiptName?: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

interface ExpenseContextType {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id" | "userId" | "userName" | "submittedAt" | "status">) => void
  updateExpenseStatus: (id: string, status: ExpenseStatus, approvedBy?: string, rejectionReason?: string) => void
  getUserExpenses: (userId: string) => Expense[]
  getPendingExpenses: () => Expense[]
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses")
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses))
    }
  }, [])

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses)
    localStorage.setItem("expenses", JSON.stringify(newExpenses))
  }

  const addExpense = (expenseData: Omit<Expense, "id" | "userId" | "userName" | "submittedAt" | "status">) => {
    if (!user) return

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    saveExpenses([...expenses, newExpense])
  }

  const updateExpenseStatus = (id: string, status: ExpenseStatus, approvedBy?: string, rejectionReason?: string) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            status,
            approvedBy,
            approvedAt: status === "approved" ? new Date().toISOString() : undefined,
            rejectionReason,
          }
        : expense,
    )
    saveExpenses(updatedExpenses)
  }

  const getUserExpenses = (userId: string) => {
    return expenses.filter((expense) => expense.userId === userId)
  }

  const getPendingExpenses = () => {
    return expenses.filter((expense) => expense.status === "pending")
  }

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpenseStatus,
        getUserExpenses,
        getPendingExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses() {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider")
  }
  return context
}
