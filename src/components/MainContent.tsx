
import { TableType } from "./Dashboard";
import { ApplicationsTable } from "./tables/ApplicationsTable";
import { DatabasesTable } from "./tables/DatabasesTable";

interface MainContentProps {
  selectedTable: TableType;
  searchQuery: string;
}

export const MainContent = ({ selectedTable, searchQuery }: MainContentProps) => {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-full">
        {selectedTable === "applications" && (
          <ApplicationsTable searchQuery={searchQuery} />
        )}
        {selectedTable === "databases" && (
          <DatabasesTable searchQuery={searchQuery} />
        )}
      </div>
    </main>
  );
};
