import type { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────
// RBAC Permission Matrix
// ─────────────────────────────────────────────

export const PERMISSIONS = {
  // Booking
  "booking:create": [
    "GUEST",
    "FRONT_DESK",
    "RESERVATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],
  "booking:read": [
    "GUEST",
    "FRONT_DESK",
    "RESERVATIONS_MANAGER",
    "HOTEL_ADMIN",
    "HOTEL_MANAGER",
  ],
  "booking:update": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:cancel": ["GUEST", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:checkin": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:checkout": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],

  // Support
  "case:create": ["GUEST", "FRONT_DESK", "GUEST_RELATIONS", "HOTEL_ADMIN"],
  "case:assign": ["GUEST_RELATIONS", "OPERATIONS_MANAGER", "HOTEL_ADMIN"],
  "case:resolve": [
    "FRONT_DESK",
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],
  "case:escalate": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
    "PLATFORM_OPS",
  ],

  // Compensation
  "compensation:propose": ["AGENT"],
  "compensation:approve": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "FINANCE_APPROVER",
    "HOTEL_ADMIN",
  ],
  "compensation:execute": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],

  // Events
  "event:create": ["GUEST", "EVENTS_MANAGER", "HOTEL_ADMIN"],
  "event:manage": ["EVENTS_MANAGER", "BANQUET_MANAGER", "HOTEL_ADMIN"],
  "beo:manage": [
    "EVENTS_MANAGER",
    "BANQUET_MANAGER",
    "FB_MANAGER",
    "HOTEL_ADMIN",
  ],

  // Hotel Management
  "hotel:manage": ["HOTEL_ADMIN"],
  "hotel:verify": ["PLATFORM_OPS", "SUPER_ADMIN"],
  "inventory:manage": ["RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "venue:manage": ["EVENTS_MANAGER", "HOTEL_ADMIN"],
  "dining:manage": ["FB_MANAGER", "HOTEL_ADMIN"],
  "staff:manage": ["HOTEL_ADMIN"],

  // Analytics
  "analytics:hotel": ["HOTEL_MANAGER", "OPERATIONS_MANAGER", "HOTEL_ADMIN"],
  "analytics:platform": ["PLATFORM_OPS", "SUPER_ADMIN"],

  // Admin
  "tenant:manage": ["SUPER_ADMIN"],
  "agent:configure": ["SUPER_ADMIN", "PLATFORM_OPS"],
  "agent:logs": ["HOTEL_ADMIN", "PLATFORM_OPS", "SUPER_ADMIN"],
} as const satisfies Record<string, readonly string[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly string[];
  return allowed.includes(role);
}

export function isHotelStaff(role: UserRole): boolean {
  const staffRoles: UserRole[] = [
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
  ];
  return staffRoles.includes(role);
}

export function isPlatformStaff(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "PLATFORM_OPS";
}

export function isGuest(role: UserRole): boolean {
  return role === "GUEST";
}
