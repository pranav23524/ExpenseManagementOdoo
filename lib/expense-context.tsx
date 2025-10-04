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
  isLoading: boolean
  addExpense: (expense: Omit<Expense, "id" | "userId" | "userName" | "submittedAt" | "status">) => Promise<void>
  updateExpenseStatus: (id: string, status: ExpenseStatus, approvedBy?: string, rejectionReason?: string) => Promise<void>
  getUserExpenses: (userId: string) => Expense[]
  getPendingExpenses: () => Expense[]
  fetchExpenses: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Fetch expenses from API
  const fetchExpenses = async () => {
    if (!user) {
      console.log('No user found, skipping expense fetch')
      return
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found, skipping expense fetch')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
        console.log('Expenses fetched successfully:', data.expenses?.length || 0)
      } else {
        const errorData = await response.json()
        console.error('Error fetching expenses:', errorData)
        if (response.status === 401) {
          console.log('Unauthorized - user may need to login again')
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  const addExpense = async (expenseData: Omit<Expense, "id" | "userId" | "userName" | "submittedAt" | "status">) => {
    if (!user) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(prev => [data.expense, ...prev])
        console.log('Expense added successfully:', data.expense.id)
      } else {
        const error = await response.json()
        console.error('Error creating expense:', error)
      }
    } catch (error) {
      console.error('Error creating expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateExpenseStatus = async (id: string, status: ExpenseStatus, approvedBy?: string, rejectionReason?: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejectionReason })
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(prev => 
          prev.map(expense => 
            expense.id === id ? data.expense : expense
          )
        )
        console.log('Expense status updated successfully:', id, status)
      } else {
        const error = await response.json()
        console.error('Error updating expense:', error)
      }
    } catch (error) {
      console.error('Error updating expense:', error)
    } finally {
      setIsLoading(false)
    }
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
        isLoading,
        addExpense,
        updateExpenseStatus,
        getUserExpenses,
        getPendingExpenses,
        fetchExpenses,
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
