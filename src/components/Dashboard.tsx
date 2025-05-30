
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { MainContent } from "@/components/MainContent";
import { PostgreSQLConfig } from "@/components/DatabaseSettings";
import { SettingsManager } from "@/components/SettingsManager";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { databaseService, TableInfo } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/permissions";

export type TableType = "applications" | "databases";

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<TableType>("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (showSettings) {
    return (
      <SettingsManager
        onDatabaseConnect={handleDatabaseConnect}
        isDbConnected={isDbConnected}
        dbConfig={dbConfig}
        availableTables={availableTables}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        onClose={() => setShowSettings(false)}
      />
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
