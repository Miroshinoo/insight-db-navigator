
// Real PostgreSQL API implementation
const API_BASE_URL = 'http://localhost:3001/api';

export interface DatabaseAPI {
  testConnection: (config: any) => Promise<{ success: boolean; error?: string }>;
  connect: (config: any) => Promise<{ success: boolean; error?: string }>;
  getTables: (config: any) => Promise<string[]>;
  getTableData: (config: any, tableName: string) => Promise<{ columns: string[]; rows: any[] }>;
  updateRecord: (config: any, tableName: string, recordId: string, data: any) => Promise<{ success: boolean }>;
}

// Real implementation that connects to the backend API
export const mockDatabaseAPI: DatabaseAPI = {
  testConnection: async (config) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API connection error:', error);
      return { 
        success: false, 
        error: 'Failed to connect to API server. Make sure the backend server is running on http://localhost:3001' 
      };
    }
  },
  
  connect: async (config) => {
    try {
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API connection error:', error);
      return { 
        success: false, 
        error: 'Failed to connect to API server' 
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
  }
};
