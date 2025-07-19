export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  full_name: string;
  phone?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  experience_years: number;
  qualification: string;
  consultation_fee: number;
  location: string;
  bio?: string;
  status: 'pending' | 'approved' | 'rejected';
  availability?: string;
  created_at: string;
  user?: User;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  doctor?: Doctor;
  patient?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}