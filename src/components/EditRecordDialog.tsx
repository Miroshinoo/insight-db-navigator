
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface EditRecordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  onSave: (updatedRecord: any) => void;
}

export const EditRecordDialog = ({ isOpen, onClose, record, onSave }: EditRecordDialogProps) => {
  const { toast } = useToast();
  const [editedRecord, setEditedRecord] = useState(record || {});

  const handleSave = () => {
    onSave(editedRecord);
    toast({
      title: "Record Updated",
      description: "Changes have been saved successfully.",
    });
    onClose();
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedRecord({
      ...editedRecord,
      [key]: value,
    });
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Make changes to the record fields below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(record).map(([key, value]) => {
            if (key === 'id') return null; // Don't edit ID
            
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </Label>
                <Input
                  id={key}
                  value={editedRecord[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="text-sm"
                />
              </div>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
