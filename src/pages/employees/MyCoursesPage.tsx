// src/pages/employees/MyCoursesPage.tsx - Fixed Version
'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Play, Clock, Award } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeAppSidebar } from "@/components/employee-app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast } from "sonner"

interface Module {
  id: string;
  _id?: string;
  title: string;
  description: string;
  learningObjectives: string[];
  status: 'draft' | 'published' | 'archived'; // ✅ Fixed: Allow all status types
  createdAt: string;
  updatedAt: string;
  progress?: number; // Employee's progress percentage
  isCompleted?: boolean;
  startedAt?: string;
  completedAt?: string;
}

export default function MyCoursesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load published modules from API
  useEffect(() => {
    const fetchModules = async () => {      
      try {
        const token = localStorage.getItem('token');
        
        console.log('🔍 Employee fetching modules...');
        console.log('🔑 Token available:', token ? 'YES' : 'NO');

        const response = await fetch('http://localhost:5000/api/modules/employee', {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          } : {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Employee API Response Status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Employee modules data received:', data);
          
          // Check if data has modules array
          if (!data.modules || !Array.isArray(data.modules)) {
            console.error('❌ No modules array in response:', data);
            toast.error('Invalid response format from server');
            return;
          }

          // ✅ Process all modules and filter published ones
          const allModules = data.modules.map((module: any) => ({
            ...module,
            id: module._id || module.id,
            progress: module.progress || 0,
            isCompleted: module.isCompleted || false,
          }));

          // ✅ Filter only published modules
          const publishedModules = allModules.filter((module: Module) => {
            console.log(`🔍 Module: "${module.title}" - Status: "${module.status}"`);
            return module.status === 'published';
          });
          
          console.log(`✅ Total modules received: ${allModules.length}`);
          console.log(`✅ Published modules filtered: ${publishedModules.length}`);
          console.log('✅ Published modules:', publishedModules);
          
          setModules(publishedModules);
          
          if (publishedModules.length === 0) {
            toast.info('No published courses available at the moment');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Employee API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          
          try {
            const errorData = JSON.parse(errorText);
            toast.error(errorData.message || 'Failed to load courses');
          } catch {
            toast.error(`Server error: ${response.status}`);
          }
        }
      } catch (error: any) {
        console.error('🔥 Employee Network Error:', error);
        toast.error('Network error: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleStartCourse = (moduleId: string) => {
    console.log('Starting course:', moduleId);
    toast.success('Course started! (Navigation to course content would go here)');
  };

  const handleContinueCourse = (moduleId: string) => {
    console.log('Continuing course:', moduleId);
    toast.success('Continuing course! (Navigation to course content would go here)');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 30) return 'bg-red-200';
    if (progress < 70) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  const breadcrumbs = [
    { label: 'Learning', href: '/employee/dashboard' },
    { label: 'My Courses' }
  ];

  if (isLoading) {
    return (
      <SidebarProvider>
        <EmployeeAppSidebar />
        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/employee/dashboard">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          
          <div className="flex flex-1 justify-center">
            <div className="w-full max-w-7xl">
              <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div>Loading your courses...</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <EmployeeAppSidebar />
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/employee/dashboard">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {breadcrumb.href ? (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-7xl">
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">My Courses</h1>
                  <p className="text-sm text-muted-foreground">
                    Continue your learning journey
                  </p>
                </div>
              </div>

              {/* Courses Grid */}
              {modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
                  <p className="text-gray-600 mb-4 max-w-sm">
                    There are no published courses available at the moment. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {modules.map((module) => {
                    const moduleId = module.id || module._id || `module-${Math.random()}`;
                    
                    return (
                      <Card key={moduleId} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg leading-tight line-clamp-2">
                                {module.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                {module.isCompleted ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Award className="mr-1 h-3 w-3" />
                                    Completed
                                  </Badge>
                                ) : module.progress > 0 ? (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    <Clock className="mr-1 h-3 w-3" />
                                    In Progress
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col">
                          {/* Description */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {module.description}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm text-gray-500">{module.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(module.progress)}`}
                                style={{ width: `${module.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Learning Objectives */}
                          <div className="mb-6 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Learning Objectives ({module.learningObjectives.length})
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {module.learningObjectives.slice(0, 2).map((objective, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-green-500 font-bold leading-none">•</span>
                                  <span className="line-clamp-2">{objective}</span>
                                </li>
                              ))}
                              {module.learningObjectives.length > 2 && (
                                <li className="text-xs text-gray-400 pl-3">
                                  +{module.learningObjectives.length - 2} more objectives
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t">
                            {module.isCompleted ? (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleContinueCourse(moduleId)}
                              >
                                <Award className="mr-2 h-4 w-4" />
                                Review Course
                              </Button>
                            ) : module.progress > 0 ? (
                              <Button
                                className="w-full"
                                onClick={() => handleContinueCourse(moduleId)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Continue Learning
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => handleStartCourse(moduleId)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Course
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}