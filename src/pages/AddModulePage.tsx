// src/pages/AddModulePage.tsx
'use client'

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ModuleForm } from "@/components/modules/ModuleForm"
import { toast } from "sonner"

interface ModuleFormData {
  title: string;
  description: string;
  learningObjectives: string[];
  status?: 'draft' | 'published' | 'archived';
}

export default function AddModulePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: ModuleFormData, action: 'draft' | 'publish' = 'draft') => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Set status based on action
      const moduleData = {
        ...formData,
        status: action === 'publish' ? 'published' : 'draft'
      };

      console.log('Creating module with data:', moduleData);

      // Fixed API URL to match backend routes
      const response = await fetch('http://localhost:5000/api/hr/modules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Module created successfully:', data);
        
        const statusMessage = action === 'publish' ? 'published' : 'saved as draft';
        toast.success(`Module ${statusMessage} successfully!`);
        navigate('/modules'); // Navigate back to modules list
      } else {
        const errorData = await response.json();
        console.error('Failed to create module:', errorData);
        toast.error(errorData.message || 'Failed to create module');
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Error creating module. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/modules');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Modules', href: '/modules' },
    { label: 'Add Module' }
  ];

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
              <ModuleForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="create"
              />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}