// src/components/employee-nav-user.tsx
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Key,
  User,
  Settings,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export function EmployeeNavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [userData, setUserData] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string>("")

  useEffect(() => {
    // Get user data from localStorage
    const loadUserData = () => {
      try {
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData)
          setUserData(parsedData)
          
          // Load profile image
          const savedImage = localStorage.getItem(`profileImage_${parsedData.id || parsedData.email}`)
          if (savedImage) {
            setProfileImage(savedImage)
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Initial load
    loadUserData()

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('Profile updated, refreshing sidebar...', event.detail)
      setUserData(event.detail.userData)
      if (event.detail.profileImage) {
        setProfileImage(event.detail.profileImage)
      }
    }

    // Add event listener for profile updates
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener)

    // Cleanup event listener
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener)
    }
  }, [])

  const handleLogout = () => {
    try {
      // Clear all possible token keys
      localStorage.removeItem('token') // Main token for employee
      localStorage.removeItem('userToken') // Alternative token name
      localStorage.removeItem('userData')
      localStorage.removeItem('user')
      navigate('/employee/login')
    } catch (error) {
      console.error('Error during logout:', error)
      navigate('/employee/login')
    }
  }

  const displayName = userData?.name || userData?.email || user.name
  const displayEmail = userData?.email || user.email
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profileImage || user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-green-100 text-green-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profileImage || user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-green-100 text-green-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/employee/profile')}>
                <User />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/employee/change-password')}>
                <Key />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/employee/notifications')}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}