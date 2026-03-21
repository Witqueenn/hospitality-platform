import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  hotelId?: string;
  token: string;
}

const TOKEN_KEY = "heo_auth_token";
const USER_KEY = "heo_auth_user";

export function saveAuth(user: AuthUser, token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getUser(): AuthUser | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AuthUser;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isHotelStaff(role: UserRole): boolean {
  return [
    "HOTEL_ADMIN",
    "HOTEL_MANAGER",
    "FRONT_DESK",
    "RESERVATIONS_MANAGER",
    "EVENTS_MANAGER",
    "BANQUET_MANAGER",
    "FB_MANAGER",
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "FINANCE_APPROVER",
  ].includes(role);
}

export function isPlatformAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "PLATFORM_OPS";
}
