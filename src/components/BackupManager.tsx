
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, Clock, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { format } from "date-fns";

interface BackupEntry {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
  type: 'manual' | 'automatic';
}

export const BackupManager = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<BackupEntry[]>([
    {
      id: '1',
      name: 'database_backup_2024-01-15.sql',
      size: '2.4 MB',
      createdAt: new Date().toISOString(),
      status: 'completed',
      type: 'manual'
    },
    {
      id: '2',
      name: 'auto_backup_2024-01-14.sql',
      size: '2.3 MB',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      type: 'automatic'
    }
  ]);
  
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const createBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate backup progress
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsBackingUp(false);
          
          const newBackup: BackupEntry = {
            id: Date.now().toString(),
            name: `manual_backup_${format(new Date(), 'yyyy-MM-dd-HH-mm')}.sql`,
            size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
            createdAt: new Date().toISOString(),
            status: 'completed',
            type: 'manual'
          };
          
          setBackups(prev => [newBackup, ...prev]);
          
          toast({
            title: "Backup Created",
            description: "Database backup completed successfully.",
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadBackup = (backup: BackupEntry) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual file URL
    link.download = backup.name;
    link.click();
    
    toast({
      title: "Download Started",
      description: `Downloading ${backup.name}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Backup Manager</h2>
      </div>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Create automatic backups daily at 2:00 AM
              </p>
            </div>
            <Switch
              checked={autoBackupEnabled}
              onCheckedChange={setAutoBackupEnabled}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={createBackup} 
              disabled={isBackingUp}
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-2" />
              {isBackingUp ? 'Creating Backup...' : 'Create Manual Backup'}
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating backup...</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <p className="font-medium text-sm">{backup.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{backup.size}</span>
                      <span>{format(new Date(backup.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'} className="text-xs">
                        {backup.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadBackup(backup)}
                  disabled={backup.status !== 'completed'}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
