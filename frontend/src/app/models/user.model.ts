export interface User {
    _id: string;
    name: string;
    email: string;
    gender: string;
    phone: string;
    role: 'client' | 'professional' | 'admin';
    profession?: string;
    createdAt: string | Date;
  }
  
  // For creating new users
  export interface NewUser {
    name: string;
    email: string;
    gender: string;
    phone: string;
    password: string;
    role: 'client' | 'professional' | 'admin';
    profession?: string;
  }
  
  // For updating users
  export interface UpdateUser {
    name?: string;
    email?: string;
    gender?: string;
    phone?: string;
    role?: 'client' | 'professional' | 'admin';
    profession?: string;
  }