
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserRole, DEFAULT_PERMISSIONS } from "@/types/permissions";
import { Users, Shield, Settings } from "lucide-react";

interface PermissionManagerProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const PermissionManager = ({ currentRole, onRoleChange }: PermissionManagerProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const currentPermissions = DEFAULT_PERMISSIONS[selectedRole];

  const roles: UserRole[] = ['SuperAdmin', 'Admin', 'Editor', 'ReadOnly'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Permission Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role} className={`cursor-pointer transition-colors ${selectedRole === role ? 'border-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{DEFAULT_PERMISSIONS[role].name}</CardTitle>
                <Badge variant={selectedRole === role ? 'default' : 'secondary'}>
                  {role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {DEFAULT_PERMISSIONS[role].description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Read Data</Label>
                  <Switch checked={DEFAULT_PERMISSIONS[role].canRead} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Write Data</Label>
                  <Switch checked={DEFAULT_PERMISSIONS[role].canWrite} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Delete Data</Label>
                  <Switch checked={DEFAULT_PERMISSIONS[role].canDelete} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Export Data</Label>
                  <Switch checked={DEFAULT_PERMISSIONS[role].canExport} disabled />
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-3"
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedRole(role);
                  onRoleChange(role);
                }}
              >
                {selectedRole === role ? 'Current Role' : 'Select Role'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
