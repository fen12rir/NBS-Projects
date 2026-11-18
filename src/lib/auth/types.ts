export type UserRole = "trainee" | "branch_admin" | "super_admin";

export type UserStatus = "pending" | "active" | "rejected" | "deactivated";

export interface Branch {
  code: string;
  name: string;
  region: string | null;
  isActive: boolean;
  seatLimit?: number | null;
}

export interface AuthSessionUser {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  branchCode: string;
  branchName?: string;
  branchRegion?: string | null;
  role: UserRole;
  status: UserStatus;
  employeeId?: string | null;
  accessExpiresAt?: string | null;
  suspendedFrom?: string | null;
  suspendedUntil?: string | null;
  disabledReason?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface SessionRecord {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  userAgent?: string | null;
}
