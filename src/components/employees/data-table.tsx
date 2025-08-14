"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { createColumns } from "./columns"

type Employee = {
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onToggleStatus?: (employeeId: string, currentStatus: 'active' | 'inactive') => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onToggleStatus,
}: DataTableProps<TData, TValue>) {
  // Create columns with the toggle function
  const columnsWithActions = createColumns({ onToggleStatus })
  
  const table = useReactTable({
    data,
    columns: columnsWithActions as ColumnDef<TData, TValue>[],
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsWithActions.length} className="text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map(row => {
            const employee = row.original as Employee
            return (
              <div key={row.id} className="border rounded-lg p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div>
                      <span className="text-sm text-muted-foreground">Name</span>
                      <p className="font-medium">{employee.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p>{employee.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Department</span>
                      <p>{employee.department}</p>
                    </div>
                    {employee.position && (
                      <div>
                        <span className="text-sm text-muted-foreground">Position</span>
                        <p>{employee.position}</p>
                      </div>
                    )}
                    {employee.phoneNumber && (
                      <div>
                        <span className="text-sm text-muted-foreground">Phone Number</span>
                        <p>{employee.phoneNumber}</p>
                      </div>
                    )}
                    {employee.identityNumber && (
                      <div>
                        <span className="text-sm text-muted-foreground">IC/Passport Number</span>
                        <p className="font-mono text-sm">{employee.identityNumber}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <span className="text-sm text-gray-600">
                      {employee.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <ToggleSwitch
                      checked={employee.status === 'active'}
                      onToggle={() => {
                        const employeeId = employee.id || employee._id;
                        console.log('Mobile toggle clicked for employee:', employee.name, 'ID:', employeeId, 'current status:', employee.status);
                        if (!employeeId) {
                          console.error('No employee ID found');
                          return;
                        }
                        onToggleStatus?.(employeeId, employee.status);
                      }}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No employees found.</p>
          </div>
        )}
      </div>
    </>
  )
}