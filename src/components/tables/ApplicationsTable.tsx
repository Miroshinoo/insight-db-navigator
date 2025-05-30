import { useState, useMemo, useEffect } from "react";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EditRecordDialog } from "../EditRecordDialog";
import { useToast } from "@/hooks/use-toast";
import { TableInfo, databaseService } from "@/services/databaseService";

export interface Application {
  id: string;
  hostname: string;
  site_name: string;
  app_name: string;
  responsable: string;
  date_revue: string;
  version_socle: string;
  pool_name: string;
  pool_state: "Started" | "Stopped";
  runtime: string;
  identity: string;
  collected_at: string;
}

interface ApplicationsTableProps {
  searchQuery: string;
  onAddRecord?: () => void;
  availableTables: TableInfo[];
  onRefreshTables: () => void;
}

export const ApplicationsTable = ({ searchQuery, onAddRecord, availableTables, onRefreshTables }: ApplicationsTableProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<Application[]>([]);
  const [editingRecord, setEditingRecord] = useState<Application | null>(null);
  const [editingTableName, setEditingTableName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load data from all IIS tables
  useEffect(() => {
    loadIISData();
  }, [availableTables]);

  const loadIISData = async () => {
    setIsLoading(true);
    try {
      const iisTableData = [];
      const iisTables = availableTables.filter(table => table.type === 'iis');
      
      for (const table of iisTables) {
        try {
          const tableData = await databaseService.getTableData(table.name);
          // Convert table data to Application format
          const applications = tableData.rows.map(row => ({
            id: row.id || Math.random().toString(),
            hostname: row.hostname || '',
            site_name: row.site_name || '',
            app_name: row.app_name || '',
            responsable: row.responsable || '', // Default empty, to be filled manually
            date_revue: row.date_revue || '', // Default empty, to be filled manually
            version_socle: row.version_socle || '',
            pool_name: row.pool_name || '',
            pool_state: row.pool_state === "Started" ? "Started" : "Stopped",
            runtime: row.runtime || '',
            identity: row.identity || '',
            collected_at: row.collected_at || new Date().toISOString(),
            _tableName: table.name // Track which table this record comes from
          }));
          iisTableData.push(...applications);
        } catch (error) {
          console.error(`Failed to load data from table ${table.name}:`, error);
        }
      }
      
      setData(iisTableData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load IIS application data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRecord = (record: Application) => {
    setEditingRecord(record);
    // Find which table this record belongs to
    const recordWithTable = data.find(r => r.id === record.id);
    setEditingTableName((recordWithTable as any)?._tableName || 'unknown');
  };

  const handleSaveRecord = async (updatedRecord: Application) => {
    setData(prev => prev.map(item => 
      item.id === updatedRecord.id ? updatedRecord : item
    ));
    
    toast({
      title: "Record Updated",
      description: "Application data updated successfully in database.",
    });
    
    // Refresh data to ensure consistency
    await loadIISData();
  };

  const handleAddRecord = () => {
    const newRecord: Application = {
      id: (data.length + 1).toString(),
      hostname: "",
      site_name: "",
      app_name: "",
      responsable: "",
      date_revue: new Date().toISOString().split('T')[0],
      version_socle: "",
      pool_name: "",
      pool_state: "Stopped",
      runtime: "",
      identity: "",
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
      accessorKey: "site_name",
      header: "Site Name",
    },
    {
      accessorKey: "app_name",
      header: "Application",
      cell: ({ row }: any) => (
        <span className="font-semibold">{row.original.app_name}</span>
      ),
    },
    {
      accessorKey: "responsable",
      header: "Responsible",
      cell: ({ row }: any) => (
        <span className={`${row.original.responsable ? 'text-blue-600' : 'text-muted-foreground italic'}`}>
          {row.original.responsable || 'Not assigned'}
        </span>
      ),
    },
    {
      accessorKey: "date_revue",
      header: "Review Date",
      cell: ({ row }: any) => (
        <span className={`text-sm ${row.original.date_revue ? '' : 'text-muted-foreground italic'}`}>
          {row.original.date_revue || 'Not scheduled'}
        </span>
      ),
    },
    {
      accessorKey: "version_socle",
      header: "Version",
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.original.version_socle}</Badge>
      ),
    },
    {
      accessorKey: "pool_state",
      header: "Pool State",
      cell: ({ row }: any) => (
        <Badge 
          variant={row.original.pool_state === "Started" ? "default" : "destructive"}
        >
          {row.original.pool_state}
        </Badge>
      ),
    },
    {
      accessorKey: "runtime",
      header: "Runtime",
      cell: ({ row }: any) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {row.original.runtime}
        </span>
      ),
    },
    {
      accessorKey: "collected_at",
      header: "Last Collected",
      cell: ({ row }: any) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.collected_at), { addSuffix: true })}
        </span>
      ),
    },
  ], []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(app =>
      Object.values(app).some(value =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold tracking-tight">Loading IIS Applications...</h1>
          <p className="text-muted-foreground">Fetching data from {availableTables.filter(t => t.type === 'iis').length} IIS tables</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IIS Applications</h1>
          <p className="text-muted-foreground">
            Manage and monitor your IIS application pools and sites • {availableTables.filter(t => t.type === 'iis').length} tables • {data.length} total records
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {data.filter(app => app.pool_state === "Started").length} Active
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {data.filter(app => app.pool_state === "Stopped").length} Stopped
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
        tableName={editingTableName}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
