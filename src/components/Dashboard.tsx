
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

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
          />
          <MainContent 
            selectedTable={selectedTable}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};
