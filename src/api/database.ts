// Real PostgreSQL API implementation
const getApiBaseUrl = () => {
  // Try to detect the current host and use it for the API
  const currentHost = window.location.hostname;
  
  // If running on localhost, use localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // Otherwise, use the current host with port 3001
  return `http://${currentHost}:3001/api`;
};

const API_BASE_URL = getApiBaseUrl();

export interface DatabaseAPI {
  testConnection: (config: any) => Promise<{ success: boolean; error?: string; details?: string }>;
  connect: (config: any) => Promise<{ success: boolean; error?: string; details?: string }>;
  getTables: (config: any) => Promise<string[]>;
  getTableData: (config: any, tableName: string) => Promise<{ columns: string[]; rows: any[] }>;
  updateRecord: (config: any, tableName: string, recordId: string, data: any) => Promise<{ success: boolean }>;
  createRecord: (config: any, tableName: string, data: any) => Promise<{ success: boolean }>;
}

// Real implementation that connects to the backend API
export const mockDatabaseAPI: DatabaseAPI = {
  testConnection: async (config) => {
    try {
      console.log(`Attempting to connect to API at: ${API_BASE_URL}/test-connection`);
      console.log('Connection config:', { ...config, password: '[REDACTED]' });
      
      const response = await fetch(`${API_BASE_URL}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        };
      }
      
      const result = await response.json();
      console.log('API response:', result);
      return result;
    } catch (error) {
      console.error('API connection error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Impossible de se connecter au serveur API',
          details: `Vérifiez que le serveur backend est démarré sur ${API_BASE_URL.replace('/api', '')}. Erreur: ${error.message}`
        };
      }
      
      return { 
        success: false, 
        error: 'Erreur de connexion API inattendue',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  connect: async (config) => {
    try {
      console.log(`Attempting to connect to API at: ${API_BASE_URL}/connect`);
      
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        };
      }
      
      const result = await response.json();
      console.log('Connect API response:', result);
      return result;
    } catch (error) {
      console.error('API connection error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Impossible de se connecter au serveur API',
          details: `Vérifiez que le serveur backend est démarré sur ${API_BASE_URL.replace('/api', '')}. Erreur: ${error.message}`
        };
      }
      
      return { 
        success: false, 
        error: 'Erreur de connexion API inattendue',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  getTables: async (config) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const tables = await response.json();
      return tables;
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw new Error('Failed to fetch tables from database');
    }
  },
  
  getTableData: async (config, tableName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableName)}/data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch data for table ${tableName}:`, error);
      throw new Error(`Failed to fetch data for table ${tableName}`);
    }
  },
  
  updateRecord: async (config, tableName, recordId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableName)}/records/${encodeURIComponent(recordId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to update record in table ${tableName}:`, error);
      return { success: false };
    }
  },
  
  createRecord: async (config, tableName, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableName)}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Failed to create record in table ${tableName}:`, error);
      return { success: false };
    }
  }
};
