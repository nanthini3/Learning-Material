// src/pages/EditModulePage.tsx
'use client'

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
}

interface Module extends ModuleFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditModulePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModule, setIsLoadingModule] = useState(true);
  const [moduleData, setModuleData] = useState<Module | null>(null);

  // Load existing module data
  useEffect(() => {
    const fetchModule = async () => {
      if (!id) {
        toast.error('Module ID is required');
        navigate('/modules');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/hr/modules/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setModuleData(data.module);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch module:', errorData);
          toast.error('Failed to load module');
          
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          } else if (response.status === 404) {
            toast.error('Module not found');
            navigate('/modules');
          }
        }
      } catch (error) {
        console.error('Error fetching module:', error);
        toast.error('Error loading module');
        navigate('/modules');
      } finally {
        setIsLoadingModule(false);
      }
    };

    fetchModule();
  }, [id, navigate]);

  const handleSubmit = async (formData: ModuleFormData) => {
    if (!id) {
      toast.error('Module ID is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Updating module with data:', formData);

      const response = await fetch(`http://localhost:5000/api/hr/modules/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Module updated successfully:', data);
        
        toast.success('Module updated successfully!');
        navigate('/modules'); // Navigate back to modules list
      } else {
        const errorData = await response.json();
        console.error('Failed to update module:', errorData);
        toast.error(errorData.message || 'Failed to update module');
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Error updating module. Please try again.');
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
    { label: 'Edit Module' }
  ];

  if (isLoadingModule) {
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
                  <div>Loading module...</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  if (!moduleData) {
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
                  <div>Module not found</div>
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
              <ModuleForm
                initialData={{
                  title: moduleData.title,
                  description: moduleData.description,
                  learningObjectives: moduleData.learningObjectives
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                mode="edit"
              />
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}