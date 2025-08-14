import { z } from 'zod'

// Existing register form schema
export const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  role: z.string().default('HR'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// New edit profile form schema
export const editProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  role: z.string().default('HR'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
  profileImage: z.any().optional(), // For file upload
}).refine((data) => {
  // If current password is provided, new password is required
  if (data.currentPassword && (!data.newPassword || data.newPassword.length < 6)) {
    return false
  }
  return true
}, {
  message: "New password must be at least 6 characters when changing password",
  path: ["newPassword"],
}).refine((data) => {
  // If new password is provided, passwords must match
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false
  }
  return true
}, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
})