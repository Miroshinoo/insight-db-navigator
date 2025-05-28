
export type UserRole = 'SuperAdmin' | 'Admin' | 'Editor' | 'ReadOnly';

export interface Permission {
  id: string;
  name: string;
  description: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
  tables?: string[];
}

export interface UserPermission {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission> = {
  SuperAdmin: {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full access to all features and data',
    canRead: true,
    canWrite: true,
    canDelete: true,
    canExport: true,
  },
  Admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to data management',
    canRead: true,
    canWrite: true,
    canDelete: true,
    canExport: true,
  },
  Editor: {
    id: 'editor',
    name: 'Editor',
    description: 'Can read and modify data',
    canRead: true,
    canWrite: true,
    canDelete: false,
    canExport: true,
  },
  ReadOnly: {
    id: 'readonly',
    name: 'Read Only',
    description: 'Can only view data',
    canRead: true,
    canWrite: false,
    canDelete: false,
    canExport: true,
  },
};
