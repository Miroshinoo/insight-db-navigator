import { useState, useMemo, useEffect } from "react";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EditRecordDialog } from "../EditRecordDialog";
import { useToast } from "@/hooks/use-toast";
import { TableInfo, databaseService } from "@/services/databaseService";

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

interface DatabasesTableProps {
  searchQuery: string;
  onAddRecord?: () => void;
  availableTables: TableInfo[];
  onRefreshTables: () => void;
}

export const DatabasesTable = ({ searchQuery, onAddRecord, availableTables, onRefreshTables }: DatabasesTableProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<Database[]>([]);
  const [editingRecord, setEditingRecord] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from all SQL tables
  useEffect(() => {
    loadSQLData();
  }, [availableTables]);

  const loadSQLData = async () => {
    setIsLoading(true);
    try {
      const sqlTableData = [];
      const sqlTables = availableTables.filter(table => table.type === 'sql');
      
      for (const table of sqlTables) {
        try {
          const tableData = await databaseService.getTableData(table.name);
          // Convert table data to Database format
          const databases = tableData.rows.map(row => ({
            id: row.id || Math.random().toString(),
            hostname: row.hostname || '',
            db_name: row.db_name || '',
            owner: row.owner || '',
            state: row.state === "ONLINE" ? "ONLINE" : "OFFLINE",
            size_mb: row.size_mb || 0,
            start_date: row.start_date || new Date().toISOString(),
            site_id: row.site_id || '',
            mdver: row.mdver || '',
            last_connection: row.last_connection || new Date().toISOString(),
            collected_at: row.collected_at || new Date().toISOString()
          }));
          sqlTableData.push(...databases);
        } catch (error) {
          console.error(`Failed to load data from table ${table.name}:`, error);
        }
      }
      
      setData(sqlTableData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SQL database data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = (record: Database) => {
    setEditingRecord(record);
  };

  const handleSaveRecord = async (updatedRecord: Database) => {
    setData(prev => prev.map(item => 
      item.id === updatedRecord.id ? updatedRecord : item
    ));
    
    // In real implementation, update the database
    try {
      console.log('Updated record:', updatedRecord);
      toast({
        title: "Record Updated",
        description: "Database record updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record in database.",
        variant: "destructive",
      });
    }
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold tracking-tight">Loading SQL Databases...</h1>
          <p className="text-muted-foreground">Fetching data from {availableTables.filter(t => t.type === 'sql').length} SQL tables</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SQL Server Databases</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database instances • {availableTables.filter(t => t.type === 'sql').length} tables • {data.length} total records
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
