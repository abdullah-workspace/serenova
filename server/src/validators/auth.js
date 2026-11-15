import { z } from 'zod';
const password = z.string().min(10).max(72).regex(/[A-Za-z]/, 'Password must contain a letter').regex(/\d/, 'Password must contain a number');
export const register = z.object({ email: z.string().email(), password, fullName: z.string().min(2).max(120), phone: z.string().max(40).optional().default(''), dateOfBirth: z.string().optional().default(''), consent: z.literal(true) }).superRefine((value, context) => {
  if (value.password.toLowerCase() === value.email.toLowerCase()) context.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Password must not equal your email' });
});
export const login = z.object({ identifier: z.string().min(1), password: z.string().min(1), remember: z.boolean().optional().default(false) });
export const forgotPassword = z.object({ email: z.string().email() });
export const resetPassword = z.object({ token: z.string().min(20), password });
