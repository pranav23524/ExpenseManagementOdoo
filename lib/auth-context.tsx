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
  setupCompany: (companyData: Omit<Company, "id" | "createdAt">) => Promise<void>
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
    try {
      console.log('Attempting login for:', email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data.user)
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)
        
        // Fetch company data
        const companyResponse = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          setCompany(companyData.company)
          localStorage.setItem("company", JSON.stringify(companyData.company))
          console.log('Company data loaded:', companyData.company)
        } else {
          console.error('Failed to load company data')
        }
      } else {
        const error = await response.json()
        console.error('Login failed:', error)
        throw new Error(error.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setCompany(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("company")
  }

  const setupCompany = async (companyData: Omit<Company, "id" | "createdAt">) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      })

      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
        localStorage.setItem("company", JSON.stringify(data.company))
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to setup company')
      }
    } catch (error) {
      console.error('Setup company error:', error)
      throw error
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
