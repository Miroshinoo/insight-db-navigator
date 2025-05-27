
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { MainContent } from "@/components/MainContent";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";

export type TableType = "applications" | "databases";

export const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedTable, setSelectedTable] = useState<TableType>("applications");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (showSettings) {
    const Settings = () => {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure your database connections and application settings</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </button>
            </div>
            
            <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">
                  Database configuration and settings panel is currently under development.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    return <Settings />;
  }

  const handleAddRecord = () => {
    console.log('Add record triggered for:', selectedTable);
  };

  const getExportData = () => {
    // This would normally come from the current table's data
    // For now, return empty array as placeholder
    return [];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          selectedTable={selectedTable} 
          onTableSelect={setSelectedTable} 
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
          />
        </div>
      </div>
    </SidebarProvider>
  );
};
