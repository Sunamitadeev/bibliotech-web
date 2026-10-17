export type UserRole = 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string; // Registro Acadêmico (RA)
  course: string;
  role: UserRole;
  avatarUrl?: string;
  maxActiveLoans: number; // e.g., 3 for students, 5 for professors
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
