
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, TestTube, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databaseService } from "@/services/databaseService";

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
  const [errorDetails, setErrorDetails] = useState<string>('');

  const getApiUrl = () => {
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return `http://${currentHost}:3001`;
  };

  const handleConnect = async () => {
    if (!config.database || !config.username) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir le nom de la base de données et le nom d'utilisateur",
        variant: "destructive",
      });
      return;
    }
    
    console.log('PostgreSQL Connection Config:', config);
    
    try {
      databaseService.setConfig(config);
      const result = await databaseService.connect();
      
      if (result) {
        onConnect(config);
        setTestResult('success');
        setErrorDetails('');
        toast({
          title: "Connexion réussie",
          description: "Connexion à la base de données PostgreSQL établie avec succès.",
        });
      } else {
        setTestResult('failed');
        toast({
          title: "Échec de la connexion",
          description: "Impossible de se connecter à la base de données. Vérifiez vos identifiants.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult('failed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrorDetails(errorMessage);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la connexion à la base de données.",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    if (!config.database || !config.username) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir le nom de la base de données et le nom d'utilisateur",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);
    setErrorDetails('');

    try {
      console.log('Testing PostgreSQL connection with config:', config);
      
      const result = await databaseService.testConnection(config);

      if (result.success) {
        setTestResult('success');
        setErrorDetails('');
        toast({
          title: "Test de connexion réussi",
          description: "Connexion à la base de données PostgreSQL établie avec succès.",
        });
      } else {
        setTestResult('failed');
        setErrorDetails(result.details || result.error || 'Erreur inconnue');
        toast({
          title: "Échec du test de connexion",
          description: result.error || "Impossible de se connecter à la base de données.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult('failed');
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrorDetails(errorMessage);
      toast({
        title: "Échec du test de connexion",
        description: "Impossible de se connecter à la base de données. Vérifiez vos identifiants.",
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
            <CardTitle>Connexion à la base de données PostgreSQL</CardTitle>
          </div>
          <CardDescription>
            Configurez votre connexion à la base de données PostgreSQL pour lire les applications IIS et les tables de base de données SQL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration actuelle :</strong> L'API backend doit être accessible sur <code>{getApiUrl()}</code>. 
                Assurez-vous que le serveur backend est démarré sur ce port.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Hôte</Label>
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
            <Label htmlFor="database">Nom de la base de données</Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => setConfig({...config, database: e.target.value})}
              placeholder="votre_base_de_donnees"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={config.username}
              onChange={(e) => setConfig({...config, username: e.target.value})}
              placeholder="postgres"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig({...config, password: e.target.value})}
              placeholder="mot_de_passe"
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
              {isTestingConnection ? 'Test en cours...' : 'Tester la connexion'}
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
                {testResult === 'success' ? 'Connexion réussie' : 'Échec de la connexion'}
              </div>
            )}
          </div>

          {errorDetails && testResult === 'failed' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Détails de l'erreur :</strong><br />
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
          
          <Button onClick={handleConnect} className="w-full">
            {isConnected ? 'Mettre à jour la connexion' : 'Se connecter à la base de données'}
          </Button>
          
          {isConnected && (
            <div className="text-sm text-green-600 text-center">
              ✓ Connexion à la base de données configurée
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catégories de tables</CardTitle>
          <CardDescription>
            Les tables seront automatiquement catégorisées en fonction de leurs modèles de nommage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>Applications IIS :</strong> Tables correspondant au modèle vp-v[numéro]-*</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>Bases de données SQL :</strong> Tables correspondant au modèle vp-sql-*</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

