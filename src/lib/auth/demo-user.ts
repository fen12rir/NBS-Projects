export type UserRole = "trainee" | "branch_admin" | "super_admin";
export type UserStatus = "pending" | "active" | "rejected" | "deactivated";

export interface AuthUser {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  contactNo?: string;
  role: UserRole;
  status?: UserStatus;
  branchCode: string;
  branchName?: string;
  branchRegion?: string | null;
  employeeId?: string | null;
  accessExpiresAt?: string | null;
  isDemo?: boolean;
  avatarUrl?: string;
}

export const DEMO_USER: AuthUser = {
  id: "demo-cashier-001",
  name: "Maria Santos",
  fullName: "Maria Santos",
  email: "maria.santos@training.nbs.internal",
  contactNo: "+639171234567",
  role: "trainee",
  status: "active",
  branchCode: "2438",
  branchName: "NBS SM North Edsa",
  isDemo: false,
};
