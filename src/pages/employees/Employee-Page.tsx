'use client'

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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
import { columns } from "@/components/employees/columns"
import { DataTable } from "@/components/employees/data-table"
import { toast } from "sonner"

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  identityNumber?: string;
  phoneNumber?: string;
  position?: string;
  isActive: boolean; // Use existing isActive field
  status: 'active' | 'inactive'; // For frontend compatibility
}

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load employees from API
  useEffect(() => {
    const fetchEmployees = async () => {      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/hr/employees', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Ensure all employees have a status field based on isActive and correct ID field
          const employeesWithStatus = (data.employees || []).map((emp: any) => ({
            ...emp,
            id: emp._id || emp.id, // Ensure we have the correct ID field
            status: emp.isActive ? 'active' : 'inactive'
          }));
          setEmployees(employeesWithStatus);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch employees:', errorData);
          toast.error('Failed to load employees');
          
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Error loading employees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [navigate]);

  // Function to toggle employee status
  const handleToggleEmployeeStatus = async (employeeId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate employee ID
      if (!employeeId || employeeId === 'undefined') {
        console.error('Invalid employee ID:', employeeId);
        toast.error('Invalid employee ID');
        return;
      }

      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const action = newStatus === 'active' ? 'reactivate' : 'deactivate';

      console.log(`Attempting to ${action} employee ${employeeId}`);

      const response = await fetch(`http://localhost:5000/api/hr/employees/${employeeId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Update the employee status in local state
        setEmployees(prevEmployees =>
          prevEmployees.map(employee =>
            (employee.id === employeeId || employee._id === employeeId)
              ? { 
                  ...employee, 
                  status: newStatus,
                  isActive: newStatus === 'active'
                }
              : employee
          )
        );
        
        toast.success(`Employee ${action}d successfully`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error(`Failed to ${action} employee:`, errorData);
        toast.error(`Failed to ${action} employee: ${errorData.message || 'Unknown error'}`);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error(`Error ${currentStatus === 'active' ? 'deactivating' : 'reactivating'} employee:`, error);
      toast.error(`Error ${currentStatus === 'active' ? 'deactivating' : 'reactivating'} employee`);
    }
  };

  const handleAddEmployee = () => {
    navigate('/register-employee');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employees' }
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
                  <div>Loading employees...</div>
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
                <div>
                  <h1 className="text-2xl font-bold">Employees</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your company employees and their information
                  </p>
                </div>
                {/* Desktop button only */}
                <div className="hidden sm:block">
                  <Button onClick={handleAddEmployee}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </div>
              </div>
              
              {/* Employee Table */}
              <DataTable 
                columns={columns} 
                data={employees} 
                onToggleStatus={handleToggleEmployeeStatus}
              />
              
              {/* Mobile button only (fixed at bottom) */}
              <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
                <Button className="w-full" onClick={handleAddEmployee}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}