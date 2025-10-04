"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useExpenses } from "@/lib/expense-context"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Users, FileText, TrendingUp, Plus, Trash2 } from "lucide-react"

export default function AdminPage() {
  const {
    user,
    company,
    updateCompany,
    approvalRules,
    addApprovalRule,
    updateApprovalRule,
    deleteApprovalRule,
    users,
    addUser,
  } = useAuth()
  const { expenses } = useExpenses()
  const router = useRouter()

  const [companyName, setCompanyName] = useState(company?.name || "")
  const [currency, setCurrency] = useState(company?.currency || "USD")
  const [approvalThreshold, setApprovalThreshold] = useState(company?.approvalThreshold.toString() || "1000")

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState<"admin" | "manager" | "employee">("employee")

  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [newRuleName, setNewRuleName] = useState("")
  const [newRuleCondition, setNewRuleCondition] = useState<"amount" | "category">("amount")
  const [newRuleValue, setNewRuleValue] = useState("")
  const [newRuleApprover, setNewRuleApprover] = useState<"admin" | "manager">("manager")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    if (company) {
      setCompanyName(company.name)
      setCurrency(company.currency)
      setApprovalThreshold(company.approvalThreshold.toString())
    }
  }, [company])

  if (!user || !company) return null

  const handleUpdateCompany = () => {
    updateCompany({
      name: companyName,
      currency,
      approvalThreshold: Number.parseFloat(approvalThreshold),
    })
  }

  const handleAddUser = () => {
    if (newUserEmail && newUserName) {
      addUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
      })
      setNewUserEmail("")
      setNewUserName("")
      setNewUserRole("employee")
      setIsAddUserOpen(false)
    }
  }

  const handleAddRule = () => {
    if (newRuleName && newRuleValue) {
      addApprovalRule({
        name: newRuleName,
        condition: newRuleCondition,
        value: newRuleCondition === "amount" ? Number.parseFloat(newRuleValue) : newRuleValue,
        approverRole: newRuleApprover,
        enabled: true,
      })
      setNewRuleName("")
      setNewRuleValue("")
      setIsAddRuleOpen(false)
    }
  }

  const totalExpenses = expenses.length
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingCount = expenses.filter((e) => e.status === "pending").length
  const approvedCount = expenses.filter((e) => e.status === "approved").length

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage company settings, users, and approval workflows</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpenses}</div>
              <p className="text-xs text-muted-foreground">{pendingCount} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Expenses approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currency} {totalAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All expenses</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Company Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="rules">Approval Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Auto-Approval Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={approvalThreshold}
                    onChange={(e) => setApprovalThreshold(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Expenses below this amount will be auto-approved</p>
                </div>

                <Button onClick={handleUpdateCompany}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage users and their roles</CardDescription>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new user account for your company</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="userName">Name</Label>
                          <Input
                            id="userName"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">Email</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="john@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userRole">Role</Label>
                          <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                            <SelectTrigger id="userRole">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {u.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Approval Rules</CardTitle>
                    <CardDescription>Configure conditional approval workflows</CardDescription>
                  </div>
                  <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Approval Rule</DialogTitle>
                        <DialogDescription>Create a new conditional approval rule</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="ruleName">Rule Name</Label>
                          <Input
                            id="ruleName"
                            value={newRuleName}
                            onChange={(e) => setNewRuleName(e.target.value)}
                            placeholder="High value expenses"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ruleCondition">Condition Type</Label>
                          <Select value={newRuleCondition} onValueChange={(value: any) => setNewRuleCondition(value)}>
                            <SelectTrigger id="ruleCondition">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Amount Threshold</SelectItem>
                              <SelectItem value="category">Category</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ruleValue">{newRuleCondition === "amount" ? "Amount" : "Category"}</Label>
                          {newRuleCondition === "amount" ? (
                            <Input
                              id="ruleValue"
                              type="number"
                              value={newRuleValue}
                              onChange={(e) => setNewRuleValue(e.target.value)}
                              placeholder="5000"
                            />
                          ) : (
                            <Select value={newRuleValue} onValueChange={setNewRuleValue}>
                              <SelectTrigger id="ruleValue">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="meals">Meals & Entertainment</SelectItem>
                                <SelectItem value="office">Office Supplies</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ruleApprover">Required Approver</Label>
                          <Select value={newRuleApprover} onValueChange={(value: any) => setNewRuleApprover(value)}>
                            <SelectTrigger id="ruleApprover">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddRule}>Add Rule</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {approvalRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No approval rules configured yet</div>
                ) : (
                  <div className="space-y-4">
                    {approvalRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rule.condition === "amount"
                              ? `Amount > ${currency} ${rule.value}`
                              : `Category: ${rule.value}`}{" "}
                            → Requires {rule.approverRole} approval
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => updateApprovalRule(rule.id, { enabled: checked })}
                          />
                          <Button variant="ghost" size="icon" onClick={() => deleteApprovalRule(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
