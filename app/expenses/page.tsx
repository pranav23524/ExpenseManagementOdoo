"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/lib/expense-context"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function ExpensesPage() {
  const { user } = useAuth()
  const { getUserExpenses } = useExpenses()
  const router = useRouter()

  useEffect(() => {
    if (!user || (user.role !== "employee" && user.role !== "manager")) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user) return null

  const userExpenses = getUserExpenses(user.id)
  const sortedExpenses = [...userExpenses].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      travel: "Travel",
      meals: "Meals & Entertainment",
      office: "Office Supplies",
      equipment: "Equipment",
      other: "Other",
    }
    return labels[category] || category
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
            <p className="text-muted-foreground">Track and manage your submitted expenses</p>
          </div>
          <Button asChild>
            <Link href="/expenses/submit">
              <Plus className="h-4 w-4 mr-2" />
              Submit Expense
            </Link>
          </Button>
        </div>

        {sortedExpenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
              <p className="text-muted-foreground text-center mb-4">Get started by submitting your first expense</p>
              <Button asChild>
                <Link href="/expenses/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Expense
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{expense.merchant}</CardTitle>
                      <CardDescription>{expense.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(expense.status)} variant="secondary">
                      {expense.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {expense.currency} {expense.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Amount</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{getCategoryLabel(expense.category)}</p>
                        <p className="text-xs text-muted-foreground">Category</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Date</p>
                      </div>
                    </div>
                  </div>

                  {expense.receiptName && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Receipt: {expense.receiptName}</p>
                    </div>
                  )}

                  {expense.rejectionReason && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground mt-1">{expense.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
