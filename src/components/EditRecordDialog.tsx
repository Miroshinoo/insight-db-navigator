
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
import { Badge } from "@/components/ui/badge";

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
  const [originalRecord, setOriginalRecord] = useState(record || {});
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (record) {
      const cleanRecord = {...record};
      setEditedRecord(cleanRecord);
      setOriginalRecord(cleanRecord);
      // Store original state in history
      setHistory([{...cleanRecord, timestamp: new Date().toISOString(), action: 'ouvert'}]);
    }
  }, [record]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Only send changed fields to avoid database errors
      const changedFields: any = {};
      let hasChanges = false;

      Object.keys(editedRecord).forEach(key => {
        if (key !== 'id' && key !== '_tableName') {
          const originalValue = originalRecord[key];
          const editedValue = editedRecord[key];
          
          // Check if value actually changed
          if (originalValue !== editedValue) {
            changedFields[key] = editedValue;
            hasChanges = true;
          }
        }
      });

      if (!hasChanges) {
        toast({
          title: "Aucune modification",
          description: "Aucun changement détecté.",
        });
        onClose();
        return;
      }

      // Add to history before saving
      setHistory(prev => [...prev, {
        ...editedRecord, 
        timestamp: new Date().toISOString(), 
        action: 'sauvegarde en cours'
      }]);

      console.log('Saving only changed fields:', changedFields);
      const success = await databaseService.updateRecord(tableName, record.id, changedFields);
      
      if (success) {
        // Update the record with all current values
        const updatedRecord = { ...editedRecord };
        onSave(updatedRecord);
        
        toast({
          title: "Enregistrement mis à jour",
          description: "Les modifications ont été sauvegardées avec succès dans la base de données.",
        });
        
        setHistory(prev => [...prev, {
          ...editedRecord, 
          timestamp: new Date().toISOString(), 
          action: 'sauvegardé'
        }]);
        onClose();
      } else {
        throw new Error('Échec de la mise à jour de l\'enregistrement');
      }
    } catch (error) {
      console.error('Failed to save record:', error);
      toast({
        title: "Erreur",
        description: "Échec de la sauvegarde des modifications dans la base de données. Modifications annulées.",
        variant: "destructive",
      });
      // Fallback: revert to original state
      setEditedRecord({...originalRecord});
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
    if (key.includes('date') || key.includes('_at') || key === 'date_de_revue') return 'date';
    if (typeof value === 'number') return 'number';
    if (key.includes('description') || key.includes('notes') || key === 'identity') return 'textarea';
    return 'text';
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      hostname: 'Nom d\'hôte',
      site_name: 'Nom du site',
      app_name: 'Nom de l\'application',
      responsable: 'Responsable',
      date_de_revue: 'Date de revue',
      version_socle: 'Version socle',
      pool_name: 'Nom du pool',
      pool_state: 'État du pool',
      runtime: 'Runtime',
      identity: 'Identité',
      collected_at: 'Collecté le',
    };
    return labels[key] || key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
  };

  const revertToVersion = (versionIndex: number) => {
    if (history[versionIndex]) {
      setEditedRecord({...history[versionIndex]});
      toast({
        title: "Version restaurée",
        description: `Restauré à la version du ${new Date(history[versionIndex].timestamp).toLocaleString()}`,
      });
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Modifier l'enregistrement - Yggdrasil Listing</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Modifiez les champs de l'enregistrement ci-dessous. Seuls les champs modifiés seront sauvegardés.
            <Badge variant="outline">{tableName}</Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Main editing area */}
          <div className="flex-1 space-y-6 overflow-y-auto pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(record).map(([key, value]) => {
                if (key === 'id' || key === '_tableName') return null;
                
                const fieldType = getFieldType(key, value);
                const hasChanged = originalRecord[key] !== editedRecord[key];
                
                return (
                  <div key={key} className="space-y-3">
                    <Label htmlFor={key} className={`text-sm font-semibold ${hasChanged ? 'text-blue-600' : 'text-foreground'}`}>
                      {getFieldLabel(key)} {hasChanged && '(modifié)'}
                    </Label>
                    {fieldType === 'textarea' ? (
                      <Textarea
                        id={key}
                        value={editedRecord[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={`min-h-[120px] resize-none ${hasChanged ? 'border-blue-500' : ''}`}
                        placeholder={`Entrez ${getFieldLabel(key).toLowerCase()}...`}
                      />
                    ) : key === 'pool_state' ? (
                      <select
                        id={key}
                        value={editedRecord[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${hasChanged ? 'border-blue-500' : ''}`}
                      >
                        <option value="Started">Started</option>
                        <option value="Stopped">Stopped</option>
                      </select>
                    ) : (
                      <Input
                        id={key}
                        type={fieldType}
                        value={editedRecord[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className={`h-10 ${hasChanged ? 'border-blue-500' : ''}`}
                        placeholder={`Entrez ${getFieldLabel(key).toLowerCase()}...`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* History sidebar */}
          <div className="w-80 border-l pl-6 overflow-y-auto bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-4 text-foreground">Historique des modifications</h4>
            <div className="space-y-3">
              {history.map((version, index) => (
                <div key={index} className="p-3 bg-background rounded-md border text-sm">
                  <div className="font-medium text-foreground capitalize">{version.action}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {new Date(version.timestamp).toLocaleString('fr-FR')}
                  </div>
                  {index > 0 && (
                    <Button
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 text-xs mt-2 text-blue-600"
                      onClick={() => revertToVersion(index)}
                    >
                      Restaurer cette version
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="min-w-[120px]">
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
