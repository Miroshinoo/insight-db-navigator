
import { PostgreSQLConfig } from "@/components/DatabaseSettings";
import { mockDatabaseAPI } from "@/api/database";

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
    this.isConnected = false;
    console.log('Database config set:', config);
  }

  getIsConnected(): boolean {
    return this.isConnected && this.config !== null;
  }

  async testConnection(config: PostgreSQLConfig): Promise<boolean> {
    try {
      const result = await mockDatabaseAPI.testConnection(config);
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    try {
      const result = await mockDatabaseAPI.connect(this.config);
      this.isConnected = result.success;
      return result.success;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      this.isConnected = false;
      return false;
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
    }

    try {
      const tables = await mockDatabaseAPI.getTables(this.config);
      
      return tables.map((tableName: string): TableInfo => ({
        name: tableName,
        type: this.categorizeTable(tableName),
        rowCount: 0,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }
  }

  async getTableData(tableName: string): Promise<TableData> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
    }

    try {
      const result = await mockDatabaseAPI.getTableData(this.config, tableName);
      return {
        columns: result.columns,
        rows: result.rows
      };
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      throw error;
    }
  }

  async updateRecord(tableName: string, recordId: string, data: Record<string, any>): Promise<boolean> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
    }

    try {
      const result = await mockDatabaseAPI.updateRecord(this.config, tableName, recordId, data);
      return result.success;
    } catch (error) {
      console.error('Failed to update record:', error);
      return false;
    }
  }

  private categorizeTable(tableName: string): 'iis' | 'sql' {
    // Match patterns like vp-v9-, vp-v10-, vp-v11-, etc.
    if (tableName.match(/^vp-v\d+-.*/)) {
      return 'iis';
    } else if (tableName.startsWith('vp-sql-')) {
      return 'sql';
    }
    // Default categorization based on common patterns
    if (tableName.toLowerCase().includes('iis') || 
        tableName.toLowerCase().includes('application') ||
        tableName.toLowerCase().includes('site')) {
      return 'iis';
    }
    return 'sql';
  }
}

export const databaseService = new DatabaseService();
