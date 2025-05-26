
import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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

const mockApplications: Application[] = [
  {
    id: "1",
    hostname: "VP-V10-DEV",
    site_name: "Default Web Site",
    app_name: "MyApp",
    responsable: "John Doe",
    date_revue: "2025-03-15",
    version_socle: "v4.8",
    pool_name: "DefaultAppPool",
    pool_state: "Started",
    runtime: "v4.0",
    identity: "ApplicationPoolIdentity",
    collected_at: "2025-05-13 15:24:37.816124"
  },
  {
    id: "2",
    hostname: "VP-V10-PROD",
    site_name: "Production Site",
    app_name: "CriticalApp",
    responsable: "Jane Smith",
    date_revue: "2025-01-20",
    version_socle: "v6.0",
    pool_name: "CriticalAppPool",
    pool_state: "Stopped",
    runtime: "v6.0",
    identity: "NetworkService",
    collected_at: "2025-05-13 14:20:15.123456"
  }
];

interface ApplicationsTableProps {
  searchQuery: string;
}

export const ApplicationsTable = ({ searchQuery }: ApplicationsTableProps) => {
  const [data, setData] = useState<Application[]>(mockApplications);

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
        <span className="text-blue-600">{row.original.responsable}</span>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IIS Applications</h1>
          <p className="text-muted-foreground">
            Manage and monitor your IIS application pools and sites
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
      />
    </div>
  );
};
