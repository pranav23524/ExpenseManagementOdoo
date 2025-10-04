"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/lib/expense-context"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, CheckCircle, Clock, DollarSign, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, company, isLoading } = useAuth()
  const { getUserExpenses, getPendingExpenses } = useExpenses()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (user?.role === "admin" && !company) {
      router.push("/setup")
    }
  }, [user, company, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const userExpenses = getUserExpenses(user.id)
  const pendingExpenses = userExpenses.filter((e) => e.status === "pending")
  const approvedExpenses = userExpenses.filter((e) => e.status === "approved")
  const totalAmount = userExpenses.reduce((sum, e) => sum + e.amount, 0)

  const allPendingExpenses = getPendingExpenses()

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>

        {(user.role === "manager" || user.role === "admin") && allPendingExpenses.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <CardTitle className="text-lg">Pending Approvals</CardTitle>
                </div>
                <Button asChild size="sm">
                  <Link href="/approvals">Review Now</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have {allPendingExpenses.length} expense{allPendingExpenses.length !== 1 ? "s" : ""} waiting for
                approval
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userExpenses.length}</div>
              <p className="text-xs text-muted-foreground">
                {userExpenses.length === 0 ? "No expenses submitted yet" : "All time"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingExpenses.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedExpenses.length}</div>
              <p className="text-xs text-muted-foreground">Ready for reimbursement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company?.currency || "USD"} {totalAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest expense submissions and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {userExpenses.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-4">
                {userExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{expense.merchant}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{expense.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
