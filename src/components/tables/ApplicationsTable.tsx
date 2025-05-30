
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
  date_de_revue: string; // Correction du nom de colonne
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
            responsable: row.responsable || '', // Correction du nom de colonne
            date_de_revue: row.date_de_revue || '', // Correction du nom de colonne
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
        title: "Erreur",
        description: "Échec du chargement des données d'applications IIS.",
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
      title: "Enregistrement mis à jour",
      description: "Les données de l'application ont été mises à jour avec succès dans la base de données.",
    });
    
    // Refresh data to ensure consistency
    await loadIISData();
  };

  const handleAddRecord = async () => {
    // Get the first IIS table to add the record to
    const iisTables = availableTables.filter(table => table.type === 'iis');
    if (iisTables.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune table IIS trouvée pour ajouter un enregistrement.",
        variant: "destructive",
      });
      return;
    }

    const targetTable = iisTables[0].name;
    const newRecord: Partial<Application> = {
      hostname: "",
      site_name: "",
      app_name: "",
      responsable: "",
      date_de_revue: "",
      version_socle: "",
      pool_name: "",
      pool_state: "Stopped",
      runtime: "",
      identity: "",
    };

    try {
      const success = await databaseService.createRecord(targetTable, newRecord);
      if (success) {
        toast({
          title: "Enregistrement ajouté",
          description: "Nouvel enregistrement créé avec succès. Veuillez remplir les détails.",
        });
        await loadIISData(); // Refresh to get the new record with its ID
        
        // Find and edit the newly created record
        setTimeout(() => {
          const newRecords = data.filter(r => !r.hostname && !r.app_name);
          if (newRecords.length > 0) {
            handleEditRecord(newRecords[newRecords.length - 1]);
          }
        }, 500);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la création de l'enregistrement.",
        variant: "destructive",
      });
    }
  };

  // Update the onAddRecord prop function
  if (onAddRecord) {
    onAddRecord = handleAddRecord;
  }

  const columns = useMemo(() => [
    {
      accessorKey: "hostname",
      header: "Nom d'hôte",
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{row.original.hostname}</span>
      ),
    },
    {
      accessorKey: "site_name",
      header: "Nom du site",
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
      header: "Responsable",
      cell: ({ row }: any) => (
        <span className={`${row.original.responsable ? 'text-blue-600' : 'text-muted-foreground italic'}`}>
          {row.original.responsable || 'Non assigné'}
        </span>
      ),
    },
    {
      accessorKey: "date_de_revue", // Correction du nom de colonne
      header: "Date de revue",
      cell: ({ row }: any) => (
        <span className={`text-sm ${row.original.date_de_revue ? '' : 'text-muted-foreground italic'}`}>
          {row.original.date_de_revue || 'Non planifiée'}
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
      header: "État du pool",
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
      header: "Dernière collecte",
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
          <h1 className="text-2xl font-bold tracking-tight">Chargement des applications IIS...</h1>
          <p className="text-muted-foreground">Récupération des données depuis {availableTables.filter(t => t.type === 'iis').length} tables IIS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications IIS - Yggdrasil Listing</h1>
          <p className="text-muted-foreground">
            Gérez et surveillez vos pools d'applications et sites IIS • {availableTables.filter(t => t.type === 'iis').length} tables • {data.length} enregistrements au total
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {data.filter(app => app.pool_state === "Started").length} Actives
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {data.filter(app => app.pool_state === "Stopped").length} Arrêtées
          </Badge>
        </div>
      </div>
      
      <DataTable
        data={filteredData}
        columns={columns}
        onUpdateData={setData}
        onEditRecord={handleEditRecord}
        onAddRecord={handleAddRecord}
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
