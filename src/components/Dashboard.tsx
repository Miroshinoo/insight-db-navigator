import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { MainContent } from "@/components/MainContent";
import { DatabaseSettings, PostgreSQLConfig } from "@/components/DatabaseSettings";
import { PermissionManager } from "@/components/PermissionManager";
import { AuditLog } from "@/components/AuditLog";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { BackupManager } from "@/components/BackupManager";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DataImporter } from "@/components/DataImporter";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { databaseService, TableInfo } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/permissions";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export type TableType = "applications" | "databases";
export type SettingsTab = "database" | "analytics" | "permissions" | "audit" | "search" | "backup" | "notifications" | "import";

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<TableType>("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("database");
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbConfig, setDbConfig] = useState<PostgreSQLConfig | null>(null);
  const [availableTables, setAvailableTables] = useState<TableInfo[]>([]);
  const [userRole, setUserRole] = useState<UserRole>("Admin");

  useEffect(() => {
    if (isDbConnected) {
      loadTables();
    }
  }, [isDbConnected]);

  const loadTables = async () => {
    try {
      const tables = await databaseService.getTables();
      setAvailableTables(tables);
      toast({
        title: "Tables Loaded",
        description: `Found ${tables.length} tables in the database.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tables from database.",
        variant: "destructive",
      });
    }
  };

  const handleDatabaseConnect = (config: PostgreSQLConfig) => {
    databaseService.setConfig(config);
    setDbConfig(config);
    setIsDbConnected(true);
    loadTables();
  };

  const handleAdvancedSearch = (filters: any[], globalSearch: string) => {
    // Implement advanced search logic
    console.log('Advanced search:', { filters, globalSearch });
    toast({
      title: "Search Executed",
      description: `Applied ${filters.length} filters with global search: "${globalSearch}"`,
    });
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (showSettings) {
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
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {/* Settings Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id as SettingsTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSettingsTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="space-y-6">
            {activeSettingsTab === 'database' && (
              <DatabaseSettings 
                onConnect={handleDatabaseConnect}
                isConnected={isDbConnected}
                currentConfig={dbConfig || undefined}
              />
            )}
            
            {activeSettingsTab === 'analytics' && <AnalyticsDashboard />}
            
            {activeSettingsTab === 'permissions' && (
              <PermissionManager 
                currentRole={userRole}
                onRoleChange={setUserRole}
              />
            )}
            
            {activeSettingsTab === 'audit' && <AuditLog />}
            
            {activeSettingsTab === 'search' && (
              <AdvancedSearch 
                onSearch={handleAdvancedSearch}
                availableTables={availableTables.map(t => t.name)}
              />
            )}
            
            {activeSettingsTab === 'backup' && <BackupManager />}
            
            {activeSettingsTab === 'notifications' && <NotificationCenter />}
            
            {activeSettingsTab === 'import' && <DataImporter />}
          </div>
        </div>
      </div>
    );
  }

  const handleAddRecord = () => {
    console.log('Add record triggered for:', selectedTable);
  };

  const getExportData = () => {
    return availableTables.filter(table => 
      selectedTable === "applications" ? table.type === 'iis' : table.type === 'sql'
    );
  };

  const getTableCounts = () => {
    const iisCount = availableTables.filter(t => t.type === 'iis').length;
    const sqlCount = availableTables.filter(t => t.type === 'sql').length;
    return { iisCount, sqlCount };
  };

  const { iisCount, sqlCount } = getTableCounts();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          selectedTable={selectedTable} 
          onTableSelect={setSelectedTable}
          onSettingsClick={() => setShowSettings(true)}
          iisCount={iisCount}
          sqlCount={sqlCount}
        />
        <div className="flex-1 flex flex-col">
          <TopNavigation 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            user={user}
            onAddRecord={handleAddRecord}
            exportData={getExportData()}
            exportFilename={selectedTable}
            onSettingsClick={() => setShowSettings(true)}
          />
          <MainContent 
            selectedTable={selectedTable}
            searchQuery={searchQuery}
            onAddRecord={handleAddRecord}
            isDbConnected={isDbConnected}
            availableTables={availableTables}
            onRefreshTables={loadTables}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};
