export type UserRole = "admin" | "docente" | "estudiante";

export interface DemoUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@universidad.edu",
    password: "admin123",
    role: "admin",
    name: "Admin Demo",
  },
  {
    email: "docente@universidad.edu",
    password: "docente123",
    role: "docente",
    name: "Docente Demo",
  },
  {
    email: "estudiante@universidad.edu",
    password: "estudiante123",
    role: "estudiante",
    name: "Estudiante Demo",
  },
];

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/views/admin",
  docente: "/views/docente",
  estudiante: "/views/estudiante",
};

export function validateDemoCredentials(email: string, password: string) {
  return DEMO_USERS.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );
}
