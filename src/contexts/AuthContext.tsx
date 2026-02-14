import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  specialization?: string;
  consultationFee?: number;
  location?: string;
  availableSlots?: string[]; // times like "09:00","10:00"
  availableDays?: number[]; // 0=Sun,1=Mon,...6=Sat
  age?: number;
  medicalHistory?: string;
  warnings?: string[];
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (data: RegisterData) => { success: boolean; message: string };
  logout: () => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  warnUser: (id: string, message: string) => void;
  changePassword: (id: string, newPassword: string) => { success: boolean; message: string };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  specialization?: string;
  consultationFee?: number;
  location?: string;
  availableSlots?: string[];
  availableDays?: number[];
  age?: number;
  medicalHistory?: string;
}

const mockUsers: (User & { password: string })[] = [
  {
    id: "admin-1",
    username: "admin",
    email: "admin@mediconnect.com",
    password: "admin123",
    phone: "9876543210",
    firstName: "System",
    lastName: "Admin",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    warnings: [],
  },
  {
    id: "doc-1",
    username: "dr.sharma",
    email: "sharma@mediconnect.com",
    password: "doctor123",
    phone: "9876543211",
    firstName: "Rajesh",
    lastName: "Sharma",
    role: "doctor",
    specialization: "Cardiology",
    consultationFee: 500,
    location: "Mumbai",
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "16:00"],
    availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    createdAt: "2025-01-15T00:00:00Z",
    warnings: [],
  },
  {
    id: "doc-2",
    username: "dr.patel",
    email: "patel@mediconnect.com",
    password: "doctor123",
    phone: "9876543212",
    firstName: "Priya",
    lastName: "Patel",
    role: "doctor",
    specialization: "Dermatology",
    consultationFee: 400,
    location: "Delhi",
    availableSlots: ["10:00", "11:00", "15:00", "16:00"],
    availableDays: [1, 2, 3, 4, 5], // Mon-Fri
    createdAt: "2025-02-01T00:00:00Z",
    warnings: [],
  },
  {
    id: "doc-3",
    username: "dr.gupta",
    email: "gupta@mediconnect.com",
    password: "doctor123",
    phone: "9876543215",
    firstName: "Amit",
    lastName: "Gupta",
    role: "doctor",
    specialization: "Orthopedics",
    consultationFee: 600,
    location: "Mumbai",
    availableSlots: ["09:00", "12:00", "14:00", "16:00"],
    availableDays: [1, 2, 3, 4, 5, 6],
    createdAt: "2025-03-01T00:00:00Z",
    warnings: [],
  },
  {
    id: "doc-4",
    username: "dr.reddy",
    email: "reddy@mediconnect.com",
    password: "doctor123",
    phone: "9876543216",
    firstName: "Sita",
    lastName: "Reddy",
    role: "doctor",
    specialization: "General Medicine",
    consultationFee: 300,
    location: "Bangalore",
    availableSlots: ["09:00", "10:00", "11:00", "14:00"],
    availableDays: [1, 2, 3, 5, 6], // Mon,Tue,Wed,Fri,Sat
    createdAt: "2025-03-10T00:00:00Z",
    warnings: [],
  },
  {
    id: "pat-1",
    username: "john.doe",
    email: "john@example.com",
    password: "patient123",
    phone: "9876543213",
    firstName: "John",
    lastName: "Doe",
    role: "patient",
    age: 32,
    medicalHistory: "No significant history",
    createdAt: "2025-03-01T00:00:00Z",
    warnings: [],
  },
  {
    id: "pat-2",
    username: "jane.smith",
    email: "jane@example.com",
    password: "patient123",
    phone: "9876543214",
    firstName: "Jane",
    lastName: "Smith",
    role: "patient",
    age: 28,
    medicalHistory: "Mild asthma",
    createdAt: "2025-03-15T00:00:00Z",
    warnings: [],
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<(User & { password: string })[]>(mockUsers);

  const login = useCallback(
    (email: string, password: string) => {
      const found = users.find((u) => u.email === email && u.password === password);
      if (found) {
        const { password: _, ...userData } = found;
        setUser(userData);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: "Invalid email or password" };
    },
    [users]
  );

  const register = useCallback(
    (data: RegisterData) => {
      if (users.find((u) => u.email === data.email)) {
        return { success: false, message: "Email already registered" };
      }
      if (users.find((u) => u.username === data.username)) {
        return { success: false, message: "Username already taken" };
      }
      const newUser: User & { password: string } = {
        id: `${data.role}-${Date.now()}`,
        ...data,
        warnings: [],
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      return { success: true, message: "Registration successful" };
    },
    [users]
  );

  const logout = useCallback(() => setUser(null), []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    setUser((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
  }, []);

  const warnUser = useCallback((id: string, message: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, warnings: [...(u.warnings || []), message] } : u))
    );
  }, []);

  const changePassword = useCallback((id: string, newPassword: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: newPassword } : u))
    );
    return { success: true, message: "Password changed successfully" };
  }, []);

  const publicUsers: User[] = users.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider
      value={{ user, users: publicUsers, isAuthenticated: !!user, login, register, logout, deleteUser, updateUser, warnUser, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
