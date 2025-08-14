import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Trophy, Award, Target } from "lucide-react"

const rewardItems = [
  {
    id: 1,
    title: "Beginner",
    description: "Complete your first task",
    icon: Star,
    color: "bg-yellow-500",
    status: "completed",
    points: 100,
  },
  {
    id: 2,
    title: "Intermediate", 
    description: "Complete 10 tasks successfully",
    icon: Trophy,
    color: "bg-green-500",
    status: "completed",
    points: 250,
  },
  {
    id: 3,
    title: "Advanced",
    description: "Complete 50 tasks with high quality",
    icon: Award,
    color: "bg-red-500",
    status: "in-progress",
    points: 500,
    progress: 60,
  },
  {
    id: 4,
    title: "Expert",
    description: "Master all available features",
    icon: Target,
    color: "bg-blue-500",
    status: "locked",
    points: 1000,
  },
]

export default function RewardsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Rewards" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
          </div>
        </div>

        {/* Simplified grid - centering is now handled by DashboardLayout */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rewardItems.map((reward) => {
            const IconComponent = reward.icon
            return (
              <Card
                key={reward.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  reward.status === "completed"
                    ? "border-green-200 bg-green-50/50"
                    : reward.status === "in-progress"
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`${reward.color} p-3 rounded-lg text-white shadow-lg`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reward.status === "completed"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : reward.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {reward.status === "completed" && "✓"}
                      {reward.status === "in-progress" && `${reward.progress}%`}
                      {reward.status === "locked" && "🔒"}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {reward.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      {reward.points} Points
                    </div>
                    {reward.status === "in-progress" && (
                      <div className="w-full ml-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${reward.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {reward.status === "completed" && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}