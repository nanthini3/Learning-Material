import * as React from "react"
import {
  BookOpen,
  BarChart3,
  Award,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Trophy,
  Clock,
  Target
} from "lucide-react"

import { EmployeeNavMain } from "@/components/employee-nav-main"
import { EmployeeNavUser } from "@/components/employee-nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Employee navigation data
const data = {
  user: {
    name: "Employee",
    email: "employee@company.com",
    avatar: "/avatars/employee.jpg",
  },
  navMain: [
    {
      title: "Learning",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "My Courses",
          url: "/employee/courses",
        },
        {
          title: "Browse Catalog",
          url: "/employee/catalog",
        },
        {
          title: "Assignments",
          url: "/employee/assignments",
        },
        {
          title: "Certificates",
          url: "/employee/certificates",
        },
      ],
    },
    {
      title: "Progress",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "My Progress",
          url: "/employee/progress",
        },
        {
          title: "Completed Courses",
          url: "/employee/completed",
        },
        {
          title: "Learning Path",
          url: "/employee/learning-path",
        },
        {
          title: "Time Tracking",
          url: "/employee/time-tracking",
        },
      ],
    },
    {
      title: "Achievements",
      url: "#",
      icon: Award,
      items: [
        {
          title: "My Rewards",
          url: "/employee/rewards",
        },
        {
          title: "Badges",
          url: "/employee/badges",
        },
        {
          title: "Leaderboard",
          url: "/employee/leaderboard",
        },
        {
          title: "Points History",
          url: "/employee/points",
        },
      ],
    },
    {
      title: "Performance",
      url: "#",
      icon: Target,
      items: [
        {
          title: "Goals",
          url: "/employee/goals",
        },
        {
          title: "Assessments",
          url: "/employee/assessments",
        },
        {
          title: "Feedback",
          url: "/employee/feedback",
        },
        {
          title: "Skills Matrix",
          url: "/employee/skills",
        },
      ],
    },
  ],
}

export function EmployeeAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Learning Portal</span>
            <span className="truncate text-xs text-muted-foreground">Employee Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <EmployeeNavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <EmployeeNavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}