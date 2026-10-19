export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "trainee" | "trainer" | "manager" | "admin";
  branchCode: string;
  isDemo: boolean;
  avatarUrl?: string;
}

export const DEMO_USER: AuthUser = {
  id: "demo-emp-001",
  name: "Maria Santos",
  email: "maria.santos@training.nbs.internal",
  role: "trainee",
  branchCode: "BR-014",
  isDemo: true,
  avatarUrl: "",
};
