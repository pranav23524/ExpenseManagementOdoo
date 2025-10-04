"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Receipt, LogOut, User, Plus, List, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NavBar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">ExpenseFlow</span>
        </Link>

        <div className="flex items-center gap-1 ml-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>

          {(user.role === "employee" || user.role === "manager") && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/expenses/submit">
                  <Plus className="h-4 w-4 mr-1" />
                  Submit
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/expenses">
                  <List className="h-4 w-4 mr-1" />
                  My Expenses
                </Link>
              </Button>
            </>
          )}

          {(user.role === "manager" || user.role === "admin") && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/approvals">Approvals</Link>
            </Button>
          )}

          {user.role === "admin" && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Link>
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
