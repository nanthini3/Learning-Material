import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check, Circle, Lock, GraduationCap } from "lucide-react"

const moduleData = {
  title: "Introduction",
  progress: 75,
  totalLessons: 4,
  completedLessons: 3,
  lessons: [
    {
      id: 1,
      title: "Getting Started",
      status: "completed",
      description: "Learn the basics and setup"
    },
    {
      id: 2,
      title: "Overview",
      status: "completed", 
      description: "Understanding the fundamentals"
    },
    {
      id: 3,
      title: "Key Concepts",
      status: "completed",
      description: "Master the core principles"
    },
    {
      id: 4,
      title: "Final Assessment",
      status: "current",
      description: "Test your knowledge"
    }
  ]
}

export default function ModuleProgress() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Module Progress" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Module Progress</h1>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-orange-500 p-3 rounded-full text-white">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{moduleData.title}</h2>
                <p className="text-muted-foreground">
                  {moduleData.completedLessons} of {moduleData.totalLessons} lessons completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-500">{moduleData.progress}%</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{moduleData.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${moduleData.progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>Complete each lesson to progress through the module</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleData.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${
                    lesson.status === "completed"
                      ? "bg-green-50 border-green-200"
                      : lesson.status === "current"
                      ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {lesson.status === "completed" ? (
                      <div className="bg-green-500 text-white rounded-full p-2">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : lesson.status === "current" ? (
                      <div className="bg-blue-500 text-white rounded-full p-2 animate-pulse">
                        <Circle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white rounded-full p-2">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {lesson.status === "completed" && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {lesson.status === "current" && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        In Progress
                      </div>
                    )}
                    {lesson.status === "locked" && (
                      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Stats - Updated with better responsive grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{moduleData.completedLessons}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Circle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{moduleData.progress}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}