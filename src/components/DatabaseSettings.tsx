
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Database, TestTube, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface PostgreSQLConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

interface DatabaseSettingsProps {
  onConnect: (config: PostgreSQLConfig) => void;
  isConnected: boolean;
  currentConfig?: PostgreSQLConfig;
}

export const DatabaseSettings = ({ onConnect, isConnected, currentConfig }: DatabaseSettingsProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PostgreSQLConfig>(currentConfig || {
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: false,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

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
      title: "Connection Saved",
      description: "Database configuration has been saved successfully.",
    });
  };

  const handleTestConnection = async () => {
    if (!config.database || !config.username) {
      toast({
        title: "Missing Information",
        description: "Please fill in database name and username",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Simulate connection test - in real implementation, this would call your backend API
      console.log('Testing PostgreSQL connection with config:', config);
      
      // Mock API call to test connection
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the PostgreSQL database.",
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setTestResult('failed');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the database. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>PostgreSQL Database Connection</CardTitle>
          </div>
          <CardDescription>
            Configure your PostgreSQL database connection to read IIS applications and SQL database tables
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
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isTestingConnection}
            >
              <TestTube className="w-4 h-4" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {testResult && (
              <div className={`flex items-center gap-1 text-sm ${
                testResult === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResult === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {testResult === 'success' ? 'Connection successful' : 'Connection failed'}
              </div>
            )}
          </div>
          
          <Button onClick={handleConnect} className="w-full">
            {isConnected ? 'Update Connection' : 'Save Connection'}
          </Button>
          
          {isConnected && (
            <div className="text-sm text-green-600 text-center">
              ✓ Database connection configured
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Categories</CardTitle>
          <CardDescription>
            Tables will be automatically categorized based on their naming patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>IIS Applications:</strong> Tables matching pattern vp-v[number]-*</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>SQL Databases:</strong> Tables matching pattern vp-sql-*</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
