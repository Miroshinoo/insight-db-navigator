
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Database, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface PostgreSQLConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

interface PostgreSQLConnectionProps {
  onConnect: (config: PostgreSQLConfig) => void;
  isConnected: boolean;
}

export const PostgreSQLConnection = ({ onConnect, isConnected }: PostgreSQLConnectionProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PostgreSQLConfig>({
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: false,
  });

  const handleConnect = () => {
    if (!config.database || !config.username) {
      toast({
        title: "Missing Information",
        description: "Please fill in database name and username",
        variant: "destructive",
      });
      return;
    }
    
    console.log('PostgreSQL Connection Config:', config);
    onConnect(config);
    toast({
      title: "Connection Template Ready",
      description: "PostgreSQL configuration saved. Integration coming soon.",
    });
  };

  const handleTestConnection = () => {
    console.log('Testing PostgreSQL connection with config:', config);
    toast({
      title: "Test Connection",
      description: "Connection testing will be available with backend integration.",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          <CardTitle>PostgreSQL Connection</CardTitle>
        </div>
        <CardDescription>
          Configure your PostgreSQL database connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({...config, host: e.target.value})}
              placeholder="localhost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={config.port}
              onChange={(e) => setConfig({...config, port: e.target.value})}
              placeholder="5432"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="database">Database Name</Label>
          <Input
            id="database"
            value={config.database}
            onChange={(e) => setConfig({...config, database: e.target.value})}
            placeholder="your_database"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={config.username}
            onChange={(e) => setConfig({...config, username: e.target.value})}
            placeholder="postgres"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => setConfig({...config, password: e.target.value})}
            placeholder="password"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleTestConnection} variant="outline" size="sm" className="gap-2">
            <TestTube className="w-4 h-4" />
            Test
          </Button>
          <Button onClick={handleConnect} className="flex-1">
            {isConnected ? 'Update Connection' : 'Connect'}
          </Button>
        </div>
        
        {isConnected && (
          <div className="text-sm text-green-600 text-center">
            ✓ Connection configured
          </div>
        )}
      </CardContent>
    </Card>
  );
};
