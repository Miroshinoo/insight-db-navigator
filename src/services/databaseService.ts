
import { PostgreSQLConfig } from "@/components/DatabaseSettings";

export interface TableInfo {
  name: string;
  type: 'iis' | 'sql';
  rowCount?: number;
  lastUpdated?: string;
}

export interface TableData {
  columns: string[];
  rows: Record<string, any>[];
}

class DatabaseService {
  private config: PostgreSQLConfig | null = null;
  private isConnected = false;

  setConfig(config: PostgreSQLConfig) {
    this.config = config;
    this.isConnected = true;
    console.log('Database config set:', config);
  }

  getIsConnected(): boolean {
    return this.isConnected && this.config !== null;
  }

  async testConnection(config: PostgreSQLConfig): Promise<boolean> {
    try {
      // In real implementation, this would make an API call to test the connection
      const response = await fetch('/api/test-db-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    try {
      // In real implementation, this would query the database for table names
      const response = await fetch('/api/database/tables', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }

      const tables = await response.json();
      
      // Categorize tables based on naming patterns
      return tables.map((tableName: string): TableInfo => ({
        name: tableName,
        type: this.categorizeTable(tableName),
        rowCount: Math.floor(Math.random() * 1000) + 10, // Mock data
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      // Return mock data for now
      return this.getMockTables();
    }
  }

  async getTableData(tableName: string): Promise<TableData> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    try {
      const response = await fetch(`/api/database/table/${tableName}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch table data');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      // Return mock data based on table type
      return this.getMockTableData(tableName);
    }
  }

  async updateRecord(tableName: string, recordId: string, data: Record<string, any>): Promise<boolean> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    try {
      const response = await fetch(`/api/database/table/${tableName}/record/${recordId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to update record:', error);
      return false;
    }
  }

  private categorizeTable(tableName: string): 'iis' | 'sql' {
    // Updated regex to match v9, v10, v11, etc.
    if (tableName.match(/^vp-v\d+-/)) {
      return 'iis';
    } else if (tableName.startsWith('vp-sql-')) {
      return 'sql';
    }
    // Default to IIS for other patterns
    return 'iis';
  }

  private getMockTables(): TableInfo[] {
    return [
      { name: 'vp-v9-dev-applications', type: 'iis', rowCount: 156, lastUpdated: new Date().toISOString() },
      { name: 'vp-v10-dev-applications', type: 'iis', rowCount: 142, lastUpdated: new Date().toISOString() },
      { name: 'vp-v11-prod-applications', type: 'iis', rowCount: 89, lastUpdated: new Date().toISOString() },
      { name: 'vp-v12-test-applications', type: 'iis', rowCount: 67, lastUpdated: new Date().toISOString() },
      { name: 'vp-sql-databases', type: 'sql', rowCount: 45, lastUpdated: new Date().toISOString() },
      { name: 'vp-sql-connections', type: 'sql', rowCount: 23, lastUpdated: new Date().toISOString() },
      { name: 'vp-sql-users', type: 'sql', rowCount: 12, lastUpdated: new Date().toISOString() },
    ];
  }

  private getMockTableData(tableName: string): TableData {
    const tableType = this.categorizeTable(tableName);
    
    if (tableType === 'iis') {
      return {
        columns: ['id', 'hostname', 'site_name', 'app_name', 'responsable', 'version_socle', 'pool_state', 'runtime'],
        rows: [
          {
            id: '1',
            hostname: 'VP-V10-DEV',
            site_name: 'Default Web Site',
            app_name: 'MyApp',
            responsable: 'John Doe',
            version_socle: 'v4.8',
            pool_state: 'Started',
            runtime: 'v4.0'
          },
          {
            id: '2',
            hostname: 'VP-V10-PROD',
            site_name: 'Production Site',
            app_name: 'CriticalApp',
            responsable: 'Jane Smith',
            version_socle: 'v6.0',
            pool_state: 'Stopped',
            runtime: 'v6.0'
          }
        ]
      };
    } else {
      return {
        columns: ['id', 'hostname', 'db_name', 'owner', 'state', 'size_mb', 'mdver'],
        rows: [
          {
            id: '1',
            hostname: 'VP-SQL-DEV',
            db_name: 'ACT',
            owner: 'VP-SQL-DEV\\Administrateur',
            state: 'ONLINE',
            size_mb: 1930,
            mdver: '10.0401'
          },
          {
            id: '2',
            hostname: 'VP-SQL-PROD',
            db_name: 'PRODUCTION',
            owner: 'VP-SQL-PROD\\SA',
            state: 'ONLINE',
            size_mb: 4560,
            mdver: '12.0601'
          }
        ]
      };
    }
  }
}

export const databaseService = new DatabaseService();
