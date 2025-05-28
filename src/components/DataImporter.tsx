
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";

interface ImportResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: string[];
}

export const DataImporter = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedTable, setSelectedTable] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!selectedTable) {
        toast({
          title: "Table Required",
          description: "Please select a target table first.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      
      importData(file);
    }
  };

  const importData = async (file: File) => {
    setImporting(true);
    setProgress(0);
    setImportResult(null);

    // Simulate import progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setImporting(false);
          
          // Mock import result
          const result: ImportResult = {
            totalRows: 150,
            successRows: 147,
            errorRows: 3,
            errors: [
              "Row 23: Invalid date format in 'created_at' column",
              "Row 67: Missing required field 'name'",
              "Row 132: Value too long for 'description' column (max 255 chars)"
            ]
          };
          
          setImportResult(result);
          
          toast({
            title: "Import Completed",
            description: `Successfully imported ${result.successRows}/${result.totalRows} rows.`,
          });
          
          return 0;
        }
        return prev + 5;
      });
    }, 100);
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const template = "id,name,status,created_at,description\n1,Sample Record,active,2024-01-15,Sample description";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTable || 'template'}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully.",
    });
  };

  // Mock table list - in real app, this would come from your database service
  const tables = [
    'vp-v10-applications',
    'vp-v11-sites',
    'vp-sql-databases',
    'vp-sql-logs'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Data Import</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import CSV Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Select a table...</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing || !selectedTable}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : 'Select CSV File'}
              </Button>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                disabled={!selectedTable}
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Import Results
              </h3>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{importResult.totalRows}</div>
                  <div className="text-muted-foreground">Total Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.successRows}</div>
                  <div className="text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.errorRows}</div>
                  <div className="text-muted-foreground">Errors</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Import Errors
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Select the target table where you want to import data</li>
              <li>Download the template to see the expected CSV format</li>
              <li>Upload your CSV file (must match the table structure)</li>
              <li>The first row should contain column headers</li>
              <li>Existing records with the same ID will be updated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
