
import { PermissionManager } from "@/components/PermissionManager";
import { UserRole } from "@/types/permissions";

interface PermissionsTabProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const PermissionsTab = ({ currentRole, onRoleChange }: PermissionsTabProps) => {
  return (
    <PermissionManager 
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    />
  );
};
