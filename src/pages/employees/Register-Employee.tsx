'use client'

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UserPlus, ArrowLeft } from "lucide-react";

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Enhanced form schema with better validation
const formSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is required')
    .max(255, 'Email is too long'),
  department: z.string()
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department must be less than 100 characters'),
})

export default function RegisterEmployeePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
    },
  })

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Validate token format
      if (token.split('.').length !== 3) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      // Clean and validate data before sending
      const cleanedData = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        department: values.department.trim(),
      };
      
      const response = await fetch('http://localhost:5000/api/hr/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Unknown error occurred' };
      }

      if (response.ok) {
        toast.success('Employee registered successfully!');
        form.reset();
        navigate('/employees');
      } else {
        // Handle specific error cases
        if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error: any) => {
              toast.error(`${error.field}: ${error.message}`);
            });
          } else if (data.message) {
            toast.error(data.message);
          } else {
            toast.error('Invalid data provided. Please check your inputs.');
          }
        } else if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('You do not have permission to register employees.');
        } else if (response.status === 409) {
          toast.error('An employee with this email already exists.');
        } else if (response.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(data.message || `Registration failed (${response.status})`);
        }
      }
    } catch (error: any) {      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Cannot connect to server. Please check if the server is running.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    navigate('/employees');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employees', href: '/employees' },
    { label: 'Register Employee' }
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
              <div className="flex min-h-[60vh] h-full w-full items-center justify-center px-4">
                <div className="mx-auto max-w-md w-full">
                  {/* External Header with Icon */}
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <UserPlus className="h-6 w-6 text-blue-600" />
                      </div>
                      <h1 className="text-2xl font-bold">Register Employee</h1>
                    </div>
                    <p className="text-gray-600">
                      Add a new employee to your system.
                    </p>
                  </div>


                  <Card>
                    <CardHeader>
                      <CardTitle>Employee Information</CardTitle>
                      <CardDescription>
                        Fill in the employee details below
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                          {/* Name */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="name">Full Name *</FormLabel>
                                <FormControl>
                                  <Input 
                                    id="name" 
                                    placeholder="Enter employee's full name" 
                                    disabled={isLoading} 
                                    {...field}
                                    onChange={(e) => {
                                      // Remove extra spaces and limit to letters and spaces
                                      const cleaned = e.target.value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
                                      field.onChange(cleaned);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email */}
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="email">Email *</FormLabel>
                                <FormControl>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="employee@gmail.com"
                                    autoComplete="email"
                                    disabled={isLoading}
                                    {...field}
                                    onChange={(e) => {
                                      // Convert to lowercase and trim
                                      field.onChange(e.target.value.toLowerCase().trim());
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Department */}
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem className="grid gap-3">
                                <FormLabel htmlFor="department">Department *</FormLabel>
                                <FormControl>
                                  <Input
                                    id="department"
                                    placeholder="e.g., IT, HR, Finance, Marketing"
                                    disabled={isLoading}
                                    {...field}
                                    onChange={(e) => {
                                      // Capitalize first letter and trim
                                      const value = e.target.value.trim();
                                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                                      field.onChange(capitalized);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleBack}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                              {isLoading ? 'Registering...' : 'Register Employee'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}