
import { useState } from "react";
import { PostgreSQLConfig } from "@/components/DatabaseSettings";
import { UserRole } from "@/types/permissions";
import { TableInfo } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseTab } from "./settings/DatabaseTab";
import { AnalyticsTab } from "./settings/AnalyticsTab";
import { PermissionsTab } from "./settings/PermissionsTab";
import { AuditTab } from "./settings/AuditTab";
import { SearchTab } from "./settings/SearchTab";
import { BackupTab } from "./settings/BackupTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { ImportTab } from "./settings/ImportTab";

export type SettingsTab = "database" | "analytics" | "permissions" | "audit" | "search" | "backup" | "notifications" | "import";

interface SettingsManagerProps {
  onDatabaseConnect: (config: PostgreSQLConfig) => void;
  isDbConnected: boolean;
  dbConfig: PostgreSQLConfig | null;
  availableTables: TableInfo[];
  userRole: UserRole;
  onUserRoleChange: (role: UserRole) => void;
  onClose: () => void;
}

export const SettingsManager = ({
  onDatabaseConnect,
  isDbConnected,
  dbConfig,
  availableTables,
  userRole,
  onUserRoleChange,
  onClose
}: SettingsManagerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("database");

  const handleAdvancedSearch = (filters: any[], globalSearch: string) => {
    console.log('Advanced search:', { filters, globalSearch });
    toast({
      title: "Search Executed",
      description: `Applied ${filters.length} filters with global search: "${globalSearch}"`,
    });
  };

  const settingsTabs = [
    { id: 'database', label: 'Database', icon: '🗄️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'permissions', label: 'Permissions', icon: '🔐' },
    { id: 'audit', label: 'Audit Log', icon: '📋' },
    { id: 'search', label: 'Advanced Search', icon: '🔍' },
    { id: 'backup', label: 'Backup', icon: '💾' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'import', label: 'Data Import', icon: '📥' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings & Management</h1>
            <p className="text-muted-foreground">Configure your database and application settings</p>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                <span className="mr-1">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="database">
              <DatabaseTab 
                onConnect={onDatabaseConnect}
                isConnected={isDbConnected}
                currentConfig={dbConfig || undefined}
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            
            <TabsContent value="permissions">
              <PermissionsTab 
                currentRole={userRole}
                onRoleChange={onUserRoleChange}
              />
            </TabsContent>
            
            <TabsContent value="audit">
              <AuditTab />
            </TabsContent>
            
            <TabsContent value="search">
              <SearchTab 
                onSearch={handleAdvancedSearch}
                availableTables={availableTables.map(t => t.name)}
              />
            </TabsContent>
            
            <TabsContent value="backup">
              <BackupTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            
            <TabsContent value="import">
              <ImportTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
