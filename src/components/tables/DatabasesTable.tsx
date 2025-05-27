
import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EditRecordDialog } from "../EditRecordDialog";
import { PostgreSQLConnection, PostgreSQLConfig } from "../PostgreSQLConnection";
import { useToast } from "@/hooks/use-toast";
import { TableInfo } from "@/services/databaseService";

export interface Database {
  id: string;
  hostname: string;
  db_name: string;
  owner: string;
  state: "ONLINE" | "OFFLINE";
  size_mb: number;
  start_date: string;
  site_id: string;
  mdver: string;
  last_connection: string;
  collected_at: string;
}

const mockDatabases: Database[] = [
  {
    id: "1",
    hostname: "VP-SQL-DEV",
    db_name: "ACT",
    owner: "VP-SQL-DEV\\Administrateur",
    state: "ONLINE",
    size_mb: 1930,
    start_date: "2024-07-04T10:57:58",
    site_id: "ACT",
    mdver: "10.0401",
    last_connection: "2025-01-28T08:37:53",
    collected_at: "2025-05-15 09:31:02.442637"
  }
];

interface DatabasesTableProps {
  searchQuery: string;
  onAddRecord?: () => void;
  availableTables: TableInfo[];
  onRefreshTables: () => void;
}

export const DatabasesTable = ({ searchQuery, onAddRecord, availableTables, onRefreshTables }: DatabasesTableProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<Database[]>(mockDatabases);
  const [editingRecord, setEditingRecord] = useState<Database | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dbConfig, setDbConfig] = useState<PostgreSQLConfig | null>(null);

  const handlePostgreSQLConnect = (config: PostgreSQLConfig) => {
    console.log('PostgreSQL connection configured:', config);
    setDbConfig(config);
    setIsConnected(true);
    // In a real implementation, this would connect to the database
  };

  const handleEditRecord = (record: Database) => {
    setEditingRecord(record);
  };

  const handleSaveRecord = (updatedRecord: Database) => {
    setData(prev => prev.map(item => 
      item.id === updatedRecord.id ? updatedRecord : item
    ));
    console.log('Updated record:', updatedRecord);
    // In a real implementation, this would update the database
  };

  const handleAddRecord = () => {
    const newRecord: Database = {
      id: (data.length + 1).toString(),
      hostname: "",
      db_name: "",
      owner: "",
      state: "OFFLINE",
      size_mb: 0,
      start_date: new Date().toISOString(),
      site_id: "",
      mdver: "",
      last_connection: new Date().toISOString(),
      collected_at: new Date().toISOString()
    };
    setData(prev => [...prev, newRecord]);
    setEditingRecord(newRecord);
    toast({
      title: "Record Added",
      description: "New blank record created. Fill in the details.",
    });
  };

  // Call onAddRecord when the prop function is provided
  if (onAddRecord) {
    onAddRecord = handleAddRecord;
  }

  const columns = useMemo(() => [
    {
      accessorKey: "hostname",
      header: "Hostname",
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{row.original.hostname}</span>
      ),
    },
    {
      accessorKey: "db_name",
      header: "Database Name",
      cell: ({ row }: any) => (
        <span className="font-semibold">{row.original.db_name}</span>
      ),
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">{row.original.owner}</span>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }: any) => (
        <Badge 
          variant={row.original.state === "ONLINE" ? "default" : "destructive"}
        >
          {row.original.state}
        </Badge>
      ),
    },
    {
      accessorKey: "size_mb",
      header: "Size (MB)",
      cell: ({ row }: any) => (
        <span className="font-mono">
          {row.original.size_mb.toLocaleString()} MB
        </span>
      ),
    },
    {
      accessorKey: "mdver",
      header: "Version",
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.original.mdver}</Badge>
      ),
    },
    {
      accessorKey: "last_connection",
      header: "Last Connection",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.last_connection), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: "collected_at",
      header: "Collected At",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.collected_at), { addSuffix: true })}
        </span>
      ),
    },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(db =>
      Object.values(db).some(value =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-2">SQL Server Databases</h1>
          <p className="text-muted-foreground mb-6">
            Connect to your PostgreSQL database to view and manage your data
          </p>
        </div>
        <PostgreSQLConnection 
          onConnect={handlePostgreSQLConnect}
          isConnected={isConnected}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SQL Server Databases</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database instances • Connected to: {dbConfig?.database} • {availableTables.length} tables available
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {data.filter(db => db.state === "ONLINE").length} Online
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {data.filter(db => db.state === "OFFLINE").length} Offline
          </Badge>
        </div>
      </div>
      
      <DataTable
        data={filteredData}
        columns={columns}
        onUpdateData={setData}
        onEditRecord={handleEditRecord}
      />

      <EditRecordDialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
