import { ColumnDef } from "@tanstack/react-table"
import { ToggleSwitch } from "@/components/ui/toggle-switch"

export type Employee = {
  id: string
  name: string
  email: string
  department: string
  identityNumber?: string
  phoneNumber?: string
  position?: string
  isActive: boolean
  status: 'active' | 'inactive'
}

interface ColumnsProps {
  onToggleStatus?: (employeeId: string, currentStatus: 'active' | 'inactive') => void
}

export const createColumns = ({ onToggleStatus }: ColumnsProps): ColumnDef<Employee>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as 'active' | 'inactive'
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const employee = row.original
      const employeeId = employee.id || employee._id; // Use either id or _id
      
      const handleToggle = () => {
        console.log('Column toggle clicked for employee:', employee.name, 'ID:', employeeId, 'current status:', employee.status);
        if (!employeeId) {
          console.error('No employee ID found');
          return;
        }
        onToggleStatus?.(employeeId, employee.status);
      };
      
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {employee.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <ToggleSwitch
            checked={employee.status === 'active'}
            onToggle={handleToggle}
          />
        </div>
      )
    },
  },
]

// Default columns for backward compatibility
export const columns: ColumnDef<Employee>[] = createColumns({})