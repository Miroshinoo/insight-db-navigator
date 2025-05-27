
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { MainContent } from "@/components/MainContent";
import { DatabaseSettings, PostgreSQLConfig } from "@/components/DatabaseSettings";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { databaseService, TableInfo } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Database Settings</h1>
              <p className="text-muted-foreground">Configure your PostgreSQL database connection</p>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <DatabaseSettings 
            onConnect={handleDatabaseConnect}
            isConnected={isDbConnected}
            currentConfig={dbConfig || undefined}
          />
        </div>
      </div>
    );
  }

  const handleAddRecord = () => {
    console.log('Add record triggered for:', selectedTable);
  };

  const getExportData = () => {
    // This would return the current table's data for export
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
