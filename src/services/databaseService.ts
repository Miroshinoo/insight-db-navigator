
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
  private tableColumnsCache = new Map<string, string[]>();

  setConfig(config: PostgreSQLConfig) {
    this.config = config;
    this.isConnected = false;
    this.tableColumnsCache.clear();
    console.log('Database config set:', config);
  }

  getIsConnected(): boolean {
    return this.isConnected && this.config !== null;
  }

  async testConnection(config: PostgreSQLConfig): Promise<{ success: boolean; error?: string; details?: string }> {
    try {
      const result = await mockDatabaseAPI.testConnection(config);
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: 'Erreur lors du test de connexion',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async connect(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Base de données non configurée');
    }

    try {
      const result = await mockDatabaseAPI.connect(this.config);
      this.isConnected = result.success;
      
      if (!result.success && result.error) {
        console.error('Connection failed:', result.error, result.details);
        throw new Error(result.details || result.error);
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      this.isConnected = false;
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Échec de la connexion à la base de données');
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.config) {
      throw new Error('Base de données non configurée');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Échec de la connexion à la base de données');
      }
    }

    try {
      const tables = await mockDatabaseAPI.getTables(this.config);
      
      const tableInfos: TableInfo[] = [];
      
      for (const tableName of tables) {
        try {
          // Get table columns to help with categorization
          const tableData = await mockDatabaseAPI.getTableData(this.config, tableName);
          this.tableColumnsCache.set(tableName, tableData.columns);
          
          const tableInfo: TableInfo = {
            name: tableName,
            type: this.categorizeTable(tableName, tableData.columns),
            rowCount: tableData.rows.length,
            lastUpdated: new Date().toISOString()
          };
          
          tableInfos.push(tableInfo);
        } catch (error) {
          console.warn(`Failed to get data for table ${tableName}, using name-based categorization:`, error);
          // Fallback to name-based categorization if we can't get columns
          const tableInfo: TableInfo = {
            name: tableName,
            type: this.categorizeTable(tableName, []),
            rowCount: 0,
            lastUpdated: new Date().toISOString()
          };
          
          tableInfos.push(tableInfo);
        }
      }
      
      return tableInfos;
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }
  }

  async getTableData(tableName: string): Promise<TableData> {
    if (!this.config) {
      throw new Error('Base de données non configurée');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Échec de la connexion à la base de données');
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
      throw new Error('Base de données non configurée');
    }

    if (!this.isConnected) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Échec de la connexion à la base de données');
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

  private categorizeTable(tableName: string, columns: string[]): 'iis' | 'sql' {
    // IIS-specific column patterns
    const iisColumns = [
      'site_name', 'application_pool', 'binding', 'port', 'protocol', 'path', 'app_pool',
      'site_id', 'physical_path', 'virtual_directory', 'default_document', 'authentication',
      'ssl_certificate', 'hostname', 'state', 'last_connection', 'version'
    ];
    
    // SQL-specific column patterns
    const sqlColumns = [
      'database_name', 'db_name', 'schema_name', 'table_count', 'size_mb', 'owner',
      'collation', 'compatibility_level', 'recovery_model', 'log_size_mb'
    ];

    // Check column names for categorization hints
    const lowerColumns = columns.map(col => col.toLowerCase());
    
    const iisScore = iisColumns.filter(iisCol => 
      lowerColumns.some(col => col.includes(iisCol) || iisCol.includes(col))
    ).length;
    
    const sqlScore = sqlColumns.filter(sqlCol => 
      lowerColumns.some(col => col.includes(sqlCol) || sqlCol.includes(col))
    ).length;

    // If we have clear column indicators, use them
    if (iisScore > sqlScore && iisScore > 0) {
      return 'iis';
    } else if (sqlScore > iisScore && sqlScore > 0) {
      return 'sql';
    }

    // Fallback to name-based categorization with improved patterns
    const lowerTableName = tableName.toLowerCase();
    
    // IIS patterns - more comprehensive
    if (lowerTableName.match(/^vp-v\d+/) || // VP-V10-DEV, VP-V11-PROD, etc.
        lowerTableName.includes('iis') ||
        lowerTableName.includes('site') ||
        lowerTableName.includes('app') ||
        lowerTableName.includes('web') ||
        lowerTableName.includes('application')) {
      return 'iis';
    }
    
    // SQL patterns
    if (lowerTableName.startsWith('vp-sql') ||
        lowerTableName.includes('database') ||
        lowerTableName.includes('sql') ||
        lowerTableName.includes('db')) {
      return 'sql';
    }

    // Default: if it starts with VP- but doesn't match SQL pattern, assume IIS
    if (lowerTableName.startsWith('vp-')) {
      return 'iis';
    }
    
    // Final fallback
    return 'sql';
  }
}

export const databaseService = new DatabaseService();
