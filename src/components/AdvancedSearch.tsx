
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, X, Calendar, Database } from "lucide-react";

interface SearchFilter {
  table?: string;
  column?: string;
  operator: 'contains' | 'equals' | 'greater' | 'less' | 'between';
  value: string;
  secondValue?: string; // for between operator
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilter[], globalSearch: string) => void;
  availableTables: string[];
}

export const AdvancedSearch = ({ onSearch, availableTables }: AdvancedSearchProps) => {
  const [globalSearch, setGlobalSearch] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newFilter, setNewFilter] = useState<SearchFilter>({
    operator: 'contains',
    value: ''
  });

  const operators = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'greater', label: 'Greater than' },
    { value: 'less', label: 'Less than' },
    { value: 'between', label: 'Between' }
  ];

  const addFilter = () => {
    if (newFilter.value) {
      setFilters([...filters, { ...newFilter }]);
      setNewFilter({ operator: 'contains', value: '' });
    }
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    onSearch(filters, globalSearch);
  };

  const clearAll = () => {
    setFilters([]);
    setGlobalSearch("");
    onSearch([], "");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <CardTitle className="text-lg">Advanced Search</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="advanced-toggle" className="text-sm">Advanced</Label>
            <Switch
              id="advanced-toggle"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Global Search */}
        <div className="space-y-2">
          <Label>Global Search</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Search across all tables and columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Active Filters */}
            {filters.length > 0 && (
              <div className="space-y-2">
                <Label>Active Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      {filter.table || 'All'} - {filter.column || 'All'} {filter.operator} "{filter.value}"
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFilter(index)}
                        className="h-auto p-0 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Filter */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <Label>Add Filter</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Table</Label>
                  <select
                    value={newFilter.table || ''}
                    onChange={(e) => setNewFilter({...newFilter, table: e.target.value || undefined})}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="">All Tables</option>
                    {availableTables.map(table => (
                      <option key={table} value={table}>{table}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Column</Label>
                  <Input
                    placeholder="Column name"
                    value={newFilter.column || ''}
                    onChange={(e) => setNewFilter({...newFilter, column: e.target.value || undefined})}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Operator</Label>
                  <select
                    value={newFilter.operator}
                    onChange={(e) => setNewFilter({...newFilter, operator: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    placeholder="Search value"
                    value={newFilter.value}
                    onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </div>

              {newFilter.operator === 'between' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">To Value</Label>
                    <Input
                      placeholder="End value"
                      value={newFilter.secondValue || ''}
                      onChange={(e) => setNewFilter({...newFilter, secondValue: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={addFilter} size="sm" disabled={!newFilter.value}>
                  <Filter className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
                {filters.length > 0 && (
                  <Button onClick={clearAll} size="sm" variant="outline">
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
