// src/pages/ModulesPages.tsx - Debug Version
'use client'

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ModuleList } from "@/components/modules/ModuleList"
import { toast } from "sonner"

interface Module {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function ModulesPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load modules from API
  useEffect(() => {
    const fetchModules = async () => {      
      try {
        // Debug: Check all possible token keys
        const token = localStorage.getItem('token');
        const userToken = localStorage.getItem('userToken');
        const authToken = localStorage.getItem('authToken');
        const hrToken = localStorage.getItem('hrToken');
        
        console.log('🔍 Debug Token Check:');
        console.log('token:', token ? `${token.substring(0, 20)}...` : 'null');
        console.log('userToken:', userToken ? `${userToken.substring(0, 20)}...` : 'null');
        console.log('authToken:', authToken ? `${authToken.substring(0, 20)}...` : 'null');
        console.log('hrToken:', hrToken ? `${hrToken.substring(0, 20)}...` : 'null');
        
        // Try to use the most likely token
        const actualToken = token || userToken || authToken || hrToken;
        
        if (!actualToken) {
          console.error('❌ No token found in localStorage');
          toast.error('No authentication token found. Please login again.');
          navigate('/login');
          return;
        }
        
        console.log('🔑 Using token for API call:', actualToken.substring(0, 20) + '...');

        // Test the API endpoint first
        console.log('📡 Testing API endpoint...');
        
        const response = await fetch('http://localhost:5000/api/hr/modules', {
          headers: {
            'Authorization': `Bearer ${actualToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 API Response Status:', response.status);
        console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Modules data received:', data);
          
          // Ensure modules have correct ID mapping and default status
          const modulesWithCorrectIds = (data.modules || []).map((module: any) => ({
            ...module,
            id: module._id || module.id, // Map MongoDB _id to id
            status: module.status || 'draft', // Default to draft if no status
          }));
          
          console.log('✅ Processed modules:', modulesWithCorrectIds);
          setModules(modulesWithCorrectIds);
        } else {
          const errorText = await response.text();
          console.error('❌ API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('❌ Parsed Error Data:', errorData);
            toast.error(errorData.message || 'Failed to load modules');
          } catch {
            toast.error(`Server error: ${response.status} - ${errorText}`);
          }
          
          if (response.status === 401) {
            console.log('🔐 Unauthorized - clearing tokens and redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('userToken');
            localStorage.removeItem('authToken');
            localStorage.removeItem('hrToken');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('🔥 Network Error:', error);
        toast.error('Network error: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [navigate]);

  const handleAddModule = () => {
    navigate('/add-module');
  };

  const handleEditModule = (moduleId: string) => {
    console.log('Navigating to edit module with ID:', moduleId);
    
    if (!moduleId || moduleId === 'undefined') {
      console.error('Invalid module ID for edit:', moduleId);
      toast.error('Unable to edit module - invalid ID');
      return;
    }
    
    navigate(`/edit-module/${moduleId}`);
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('userToken') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('hrToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/hr/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setModules(prevModules => prevModules.filter(module => module.id !== moduleId));
        toast.success('Module deleted successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to delete module:', errorData);
        toast.error('Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Error deleting module');
    }
  };

  const handleStatusChange = async (moduleId: string, status: 'draft' | 'published' | 'archived') => {
    try {
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('userToken') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('hrToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/hr/modules/${moduleId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update the module status in local state
        setModules(prevModules => 
          prevModules.map(module => 
            module.id === moduleId 
              ? { ...module, status, updatedAt: new Date().toISOString() }
              : module
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to update module status:', errorData);
        throw new Error(errorData.message || 'Failed to update module status');
      }
    } catch (error) {
      console.error('Error updating module status:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Modules' }
  ];

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
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
                  <div>Loading modules...</div>
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
      <AppSidebar />
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
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
              {/* Top row (text + desktop button) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Learning Modules</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage your learning modules and content
                    </p>
                  </div>
                </div>
                {/* Desktop button only */}
                <div className="hidden sm:block">
                  <Button onClick={handleAddModule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </div>
              </div>
              
              {/* Modules List */}
              <ModuleList 
                modules={modules}
                onEdit={handleEditModule}
                onDelete={handleDeleteModule}
                onStatusChange={handleStatusChange}
              />
              
              {/* Mobile button only (fixed at bottom) */}
              <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
                <Button className="w-full" onClick={handleAddModule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Module
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}