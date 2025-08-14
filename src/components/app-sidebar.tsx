import * as React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  GraduationCap,
  Trophy,
  Users,
  BookOpen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define the user type
interface User {
  name: string;
  email: string;
  avatar?: string;
  id?: string;
  department?: string;
  role?: string;
}

const navMainData = [
  {
    title: "Modules",
    url: "/modules",
    icon: BookOpen,
    items: [],
  },
  {
    title: "Module Progress",
    url: "/module-progress",
    icon: GraduationCap,
    items: [],
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    items: [],
  },
  {
    title: "Rewards",
    url: "/rewards",
    icon: Trophy,
    items: [],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser({
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
          avatar: userData.avatar,
          id: userData.id,
          department: userData.department,
          role: userData.role
        })
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error)
      // Set default user data if parsing fails
      setUser({
        name: 'User',
        email: 'user@example.com',
        department: 'IT Department',
        avatar: "/avatars/default-user.jpg"
      })
    }
  }

  useEffect(() => {
    getUserData()

    // Listen for storage changes (if user data updates in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        getUserData()
      }
    }

    // Listen for custom userUpdated event
    const handleUserUpdate = (e: CustomEvent) => {
      setUser(e.detail)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userUpdated', handleUserUpdate as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener)
    }
  }, [])

  // Generate initials for avatar if no avatar image is available
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle edit profile navigation
  const handleEditProfile = () => {
    navigate('/edit-profile')
  }

  // Default user data while loading or if no user found
  const defaultUser: User = {
    name: 'Loading...',
    email: 'loading@example.com',
    department: 'Loading...',
    avatar: "/avatars/default-user.jpg"
  }

  const displayUser = user || defaultUser

  // Format avatar URL for display
  const getAvatarUrl = () => {
    if (displayUser.avatar) {
      // If avatar already has the full URL, return it
      if (displayUser.avatar.startsWith('http://') || displayUser.avatar.startsWith('https://')) {
        return displayUser.avatar
      }
      // If it's just the path, prepend the server URL
      if (displayUser.avatar.startsWith('/uploads/')) {
        return `http://localhost:5000${displayUser.avatar}`
      }
      // For local assets
      return displayUser.avatar
    }
    return null
  }

  const avatarUrl = getAvatarUrl()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <div className="text-white font-bold text-lg">UB</div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Point Based</span>
                  <span className="truncate text-xs">Learning System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={{
            ...displayUser,
            // Use the uploaded image URL or fallback to initials
            avatar: avatarUrl || `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#4F46E5"/><text x="16" y="20" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${getInitials(displayUser.name)}</text></svg>`)}`
          }}
          onEditProfile={handleEditProfile} // Pass the edit profile handler
        />
      </SidebarFooter>
    </Sidebar>
  )
}