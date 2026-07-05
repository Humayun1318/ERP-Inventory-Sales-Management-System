export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export const USER_SEARCHABLE_FIELDS = ['name', 'email'];

// Reference map — actual enforcement happens via checkAuth(Role...) per route.
// Kept here since other modules (Product/Customer/Sale) will import Role from this file.
export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.MANAGER]: ['MANAGE_PRODUCTS', 'MANAGE_CUSTOMERS', 'CREATE_SALES'],
  [UserRole.EMPLOYEE]: ['VIEW_PRODUCTS', 'CREATE_SALES'],
} as const;

export const USER_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 60,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  AVATAR_URL_MAX_LENGTH: 500,
} as const;