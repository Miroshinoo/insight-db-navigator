
import { TableType } from "./Dashboard";
import { ApplicationsTable } from "./tables/ApplicationsTable";
import { DatabasesTable } from "./tables/DatabasesTable";
import { TableInfo } from "@/services/databaseService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Plug } from "lucide-react";

interface MainContentProps {
  selectedTable: TableType;
  searchQuery: string;
  onAddRecord?: () => void;
  isDbConnected: boolean;
  availableTables: TableInfo[];
  onRefreshTables: () => void;
}

export const MainContent = ({ 
  selectedTable, 
  searchQuery, 
  onAddRecord, 
  isDbConnected, 
  availableTables,
  onRefreshTables 
}: MainContentProps) => {
  if (!isDbConnected) {
    return (
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto mt-16">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <CardTitle>No Database Connection</CardTitle>
              <CardDescription>
                Connect to your PostgreSQL database to view and manage your IIS applications and SQL databases
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Plug className="w-4 h-4" />
                  Go to Settings to configure your database connection
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-full">
        {selectedTable === "applications" && (
          <ApplicationsTable 
            searchQuery={searchQuery} 
            onAddRecord={onAddRecord}
            availableTables={availableTables.filter(t => t.type === 'iis')}
            onRefreshTables={onRefreshTables}
          />
        )}
        {selectedTable === "databases" && (
          <DatabasesTable 
            searchQuery={searchQuery} 
            onAddRecord={onAddRecord}
            availableTables={availableTables.filter(t => t.type === 'sql')}
            onRefreshTables={onRefreshTables}
          />
        )}
      </div>
    </main>
  );
};
