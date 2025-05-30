
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { databaseService } from "@/services/databaseService";

interface EditRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  tableName: string;
  onSave: (updatedRecord: any) => void;
}

export const EditRecordDialog = ({ isOpen, onClose, record, tableName, onSave }: EditRecordDialogProps) => {
  const { toast } = useToast();
  const [editedRecord, setEditedRecord] = useState(record || {});
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (record) {
      setEditedRecord({...record});
      // Store original state in history
      setHistory([{...record, timestamp: new Date().toISOString(), action: 'opened'}]);
    }
  }, [record]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Add to history before saving
      setHistory(prev => [...prev, {
        ...editedRecord, 
        timestamp: new Date().toISOString(), 
        action: 'saving'
      }]);

      const success = await databaseService.updateRecord(tableName, record.id, editedRecord);
      
      if (success) {
        onSave(editedRecord);
        toast({
          title: "Record Updated",
          description: "Changes have been saved successfully to the database.",
        });
        setHistory(prev => [...prev, {
          ...editedRecord, 
          timestamp: new Date().toISOString(), 
          action: 'saved'
        }]);
        onClose();
      } else {
        throw new Error('Failed to update record');
      }
    } catch (error) {
      console.error('Failed to save record:', error);
      toast({
        title: "Error",
        description: "Failed to save changes to database. Changes reverted.",
        variant: "destructive",
      });
      // Fallback: revert to original state
      if (history.length > 0) {
        const original = history[0];
        setEditedRecord(original);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedRecord({
      ...editedRecord,
      [key]: value,
    });
  };

  const getFieldType = (key: string, value: any) => {
    if (key.includes('date') || key.includes('_at')) return 'date';
    if (typeof value === 'number') return 'number';
    if (key.includes('description') || key.includes('notes')) return 'textarea';
    return 'text';
  };

  const revertToVersion = (versionIndex: number) => {
    if (history[versionIndex]) {
      setEditedRecord({...history[versionIndex]});
      toast({
        title: "Reverted",
        description: `Reverted to version from ${new Date(history[versionIndex].timestamp).toLocaleString()}`,
      });
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Record - {tableName}</DialogTitle>
          <DialogDescription>
            Make changes to the record fields below. All changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Main editing area */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(record).map(([key, value]) => {
                if (key === 'id') return null;
                
                const fieldType = getFieldType(key, value);
                
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </Label>
                    {fieldType === 'textarea' ? (
                      <Textarea
                        id={key}
                        value={editedRecord[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="text-sm min-h-[80px]"
                        placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                      />
                    ) : (
                      <Input
                        id={key}
                        type={fieldType}
                        value={editedRecord[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="text-sm"
                        placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* History sidebar */}
          <div className="w-80 border-l pl-4 overflow-y-auto">
            <h4 className="font-medium mb-3">Edit History</h4>
            <div className="space-y-2 text-xs">
              {history.map((version, index) => (
                <div key={index} className="p-2 bg-muted rounded text-xs">
                  <div className="font-medium">{version.action}</div>
                  <div className="text-muted-foreground">
                    {new Date(version.timestamp).toLocaleString()}
                  </div>
                  {index > 0 && (
                    <Button
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => revertToVersion(index)}
                    >
                      Revert to this version
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
