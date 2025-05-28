
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, User, Database, Search, Filter } from "lucide-react";
import { format } from "date-fns";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  table: string;
  recordId?: string;
  changes?: Record<string, { from: any; to: any }>;
  ip?: string;
}

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  // Mock data - in real implementation, this would come from your API
  useEffect(() => {
    const mockLogs: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user: 'admin@example.com',
        action: 'UPDATE',
        table: 'vp-v10-applications',
        recordId: '123',
        changes: {
          status: { from: 'active', to: 'inactive' },
          lastModified: { from: '2024-01-01', to: '2024-01-02' }
        },
        ip: '192.168.1.100'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'editor@example.com',
        action: 'CREATE',
        table: 'vp-sql-databases',
        recordId: '456',
        ip: '192.168.1.101'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'admin@example.com',
        action: 'DELETE',
        table: 'vp-v11-sites',
        recordId: '789',
        ip: '192.168.1.100'
      }
    ];
    setLogs(mockLogs);
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'READ': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Audit Log</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="READ">Read</option>
        </select>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-sm font-medium">{log.table}</span>
                    {log.recordId && (
                      <span className="text-xs text-muted-foreground">ID: {log.recordId}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                    {log.ip && (
                      <span>IP: {log.ip}</span>
                    )}
                  </div>

                  {log.changes && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <strong>Changes:</strong>
                      {Object.entries(log.changes).map(([field, change]) => (
                        <div key={field} className="ml-2">
                          <span className="font-medium">{field}:</span> 
                          <span className="text-red-600"> {JSON.stringify(change.from)}</span> → 
                          <span className="text-green-600"> {JSON.stringify(change.to)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
