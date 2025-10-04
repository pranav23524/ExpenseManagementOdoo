"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useExpenses, type Expense } from "@/lib/expense-context"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, Calendar, DollarSign, User, CheckCircle, XCircle, FileText } from "lucide-react"

export default function ApprovalsPage() {
  const { user } = useAuth()
  const { getPendingExpenses, updateExpenseStatus } = useExpenses()
  const router = useRouter()

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  useEffect(() => {
    if (!user || (user.role !== "manager" && user.role !== "admin")) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user) return null

  const pendingExpenses = getPendingExpenses()
  const filteredExpenses =
    filterCategory === "all" ? pendingExpenses : pendingExpenses.filter((e) => e.category === filterCategory)

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )

  const handleApprove = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsApproveDialogOpen(true)
  }

  const handleReject = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsRejectDialogOpen(true)
  }

  const confirmApprove = () => {
    if (selectedExpense) {
      updateExpenseStatus(selectedExpense.id, "approved", user.name)
      setIsApproveDialogOpen(false)
      setSelectedExpense(null)
    }
  }

  const confirmReject = () => {
    if (selectedExpense && rejectionReason.trim()) {
      updateExpenseStatus(selectedExpense.id, "rejected", user.name, rejectionReason)
      setIsRejectDialogOpen(false)
      setSelectedExpense(null)
      setRejectionReason("")
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
            <h1 className="text-3xl font-bold tracking-tight">Expense Approvals</h1>
            <p className="text-muted-foreground">Review and approve pending expense submissions</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {pendingExpenses.length} Pending
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filter" className="text-sm font-medium">
            Filter by category:
          </Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger id="filter" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="meals">Meals & Entertainment</SelectItem>
              <SelectItem value="office">Office Supplies</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortedExpenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-center">There are no pending expenses to review</p>
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
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{expense.userName}</p>
                        <p className="text-xs text-muted-foreground">Submitted by</p>
                      </div>
                    </div>
                  </div>

                  {expense.receiptName && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Receipt attached</p>
                        <p className="text-xs text-muted-foreground">{expense.receiptName}</p>
                      </div>
                      {expense.receiptUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleApprove(expense)} className="flex-1" variant="default">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(expense)} className="flex-1" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Expense</DialogTitle>
            <DialogDescription>Are you sure you want to approve this expense?</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Merchant:</span>
                <span className="text-sm font-medium">{selectedExpense.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-medium">
                  {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Submitted by:</span>
                <span className="text-sm font-medium">{selectedExpense.userName}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this expense.</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Merchant:</span>
                  <span className="text-sm font-medium">{selectedExpense.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this expense is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
