"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "manager" | "employee"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  companyName: string
  managerId?: string
}

export interface Company {
  id: string
  name: string
  currency: string
  approvalThreshold: number
  createdAt: string
}

export interface ApprovalRule {
  id: string
  name: string
  condition: "amount" | "category"
  value: string | number
  approverRole: UserRole
  enabled: boolean
}

interface AuthContextType {
  user: User | null
  company: Company | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  setupCompany: (companyData: Omit<Company, "id" | "createdAt">) => void
  updateCompany: (companyData: Partial<Company>) => void
  isLoading: boolean
  approvalRules: ApprovalRule[]
  addApprovalRule: (rule: Omit<ApprovalRule, "id">) => void
  updateApprovalRule: (id: string, updates: Partial<ApprovalRule>) => void
  deleteApprovalRule: (id: string) => void
  users: User[]
  addUser: (userData: Omit<User, "id" | "companyId" | "companyName">) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user")
    const storedCompany = localStorage.getItem("company")
    const storedRules = localStorage.getItem("approvalRules")
    const storedUsers = localStorage.getItem("users")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany))
    }
    if (storedRules) {
      setApprovalRules(JSON.parse(storedRules))
    }
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      role,
      companyId: "company-1",
      companyName: "Demo Company",
    }

    setUser(mockUser)
    localStorage.setItem("user", JSON.stringify(mockUser))

    // Load or create company
    const storedCompany = localStorage.getItem("company")
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany))
    }

    // Add user to users list if not exists
    const storedUsers = localStorage.getItem("users")
    const existingUsers = storedUsers ? JSON.parse(storedUsers) : []
    if (!existingUsers.find((u: User) => u.email === email)) {
      const updatedUsers = [...existingUsers, mockUser]
      setUsers(updatedUsers)
      localStorage.setItem("users", JSON.stringify(updatedUsers))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const setupCompany = (companyData: Omit<Company, "id" | "createdAt">) => {
    const newCompany: Company = {
      ...companyData,
      id: `company-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setCompany(newCompany)
    localStorage.setItem("company", JSON.stringify(newCompany))

    // Update user with company info
    if (user) {
      const updatedUser = {
        ...user,
        companyId: newCompany.id,
        companyName: newCompany.name,
      }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const updateCompany = (companyData: Partial<Company>) => {
    if (company) {
      const updatedCompany = { ...company, ...companyData }
      setCompany(updatedCompany)
      localStorage.setItem("company", JSON.stringify(updatedCompany))
    }
  }

  const addApprovalRule = (rule: Omit<ApprovalRule, "id">) => {
    const newRule: ApprovalRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    }
    const updatedRules = [...approvalRules, newRule]
    setApprovalRules(updatedRules)
    localStorage.setItem("approvalRules", JSON.stringify(updatedRules))
  }

  const updateApprovalRule = (id: string, updates: Partial<ApprovalRule>) => {
    const updatedRules = approvalRules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    setApprovalRules(updatedRules)
    localStorage.setItem("approvalRules", JSON.stringify(updatedRules))
  }

  const deleteApprovalRule = (id: string) => {
    const updatedRules = approvalRules.filter((rule) => rule.id !== id)
    setApprovalRules(updatedRules)
    localStorage.setItem("approvalRules", JSON.stringify(updatedRules))
  }

  const addUser = (userData: Omit<User, "id" | "companyId" | "companyName">) => {
    if (!company) return

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      companyId: company.id,
      companyName: company.name,
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        login,
        logout,
        setupCompany,
        updateCompany,
        isLoading,
        approvalRules,
        addApprovalRule,
        updateApprovalRule,
        deleteApprovalRule,
        users,
        addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
