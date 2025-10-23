import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminBulkCreateStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentsCreated: () => void;
}

interface CreatedStudent {
  matric_number: string;
  pin: string;
  full_name: string;
}

export function AdminBulkCreateStudentsDialog({ open, onOpenChange, onStudentsCreated }: AdminBulkCreateStudentsDialogProps) {
  const [year, setYear] = useState('25');
  const [startNumber, setStartNumber] = useState('1');
  const [endNumber, setEndNumber] = useState('50');
  const [level, setLevel] = useState('ND1');
  const [loading, setLoading] = useState(false);
  const [createdStudents, setCreatedStudents] = useState<CreatedStudent[]>([]);

  const handleBulkCreate = async () => {
    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    if (isNaN(start) || isNaN(end) || start < 1 || end > 500 || start > end) {
      toast.error('Please enter valid numbers between 1 and 500, with start number less than end number');
      return;
    }

    if (!year || year.length !== 2 || isNaN(parseInt(year))) {
      toast.error('Please enter a valid 2-digit year (e.g., 25 for 2025)');
      return;
    }

    setLoading(true);
    const created: CreatedStudent[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = start; i <= end; i++) {
        const matricNumber = `PSP/SICT/CSC/ND/${year}/${i.toString().padStart(3, '0')}`;
        const fullName = `Student ${matricNumber}`;

        const { data, error } = await supabase.rpc('admin_create_student', {
          p_full_name: fullName,
          p_matric_number: matricNumber,
          p_level: level,
          p_phone_number: null,
          p_pin: null
        });

        if (error) {
          console.error(`Error creating student ${matricNumber}:`, error);
          errorCount++;
        } else if (data && typeof data === 'object' && 'success' in data && data.success) {
          const result = data as { success: boolean; generated_pin: string };
          created.push({
            matric_number: matricNumber,
            pin: result.generated_pin,
            full_name: fullName
          });
          successCount++;
        }
      }

      if (successCount > 0) {
        setCreatedStudents(created);
        toast.success(`Successfully created ${successCount} students${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        onStudentsCreated();
      } else {
        toast.error('Failed to create students. Please check permissions and try again.');
      }
    } catch (error) {
      console.error('Bulk creation error:', error);
      toast.error('An error occurred during bulk creation');
    } finally {
      setLoading(false);
    }
  };

  const downloadStudentsList = () => {
    const csv = [
      'Matric Number,Full Name,PIN,Level',
      ...createdStudents.map(s => `${s.matric_number},${s.full_name},${s.pin},${level}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${year}_${startNumber}-${endNumber}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCreatedStudents([]);
    setYear('25');
    setStartNumber('1');
    setEndNumber('50');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Create Students
          </DialogTitle>
          <DialogDescription>
            Create multiple students at once with auto-generated matric numbers and PINs.
          </DialogDescription>
        </DialogHeader>

        {createdStudents.length === 0 ? (
          <div className="grid gap-4 py-4">
            <Alert>
              <AlertDescription>
                This will create students with matric numbers in the format: PSP/SICT/CSC/ND/{year}/XXX
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year (2 digits)</Label>
                <Input
                  id="year"
                  placeholder="25"
                  value={year}
                  onChange={(e) => setYear(e.target.value.slice(0, 2))}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ND1">ND1</SelectItem>
                    <SelectItem value="ND2">ND2</SelectItem>
                    <SelectItem value="HND1">HND1</SelectItem>
                    <SelectItem value="HND2">HND2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Number (1-500)</Label>
                <Input
                  id="start"
                  type="number"
                  placeholder="1"
                  value={startNumber}
                  onChange={(e) => setStartNumber(e.target.value)}
                  min={1}
                  max={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End Number (1-500)</Label>
                <Input
                  id="end"
                  type="number"
                  placeholder="50"
                  value={endNumber}
                  onChange={(e) => setEndNumber(e.target.value)}
                  min={1}
                  max={500}
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Preview: PSP/SICT/CSC/ND/{year}/{startNumber.padStart(3, '0')} to PSP/SICT/CSC/ND/{year}/{endNumber.padStart(3, '0')}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="font-semibold text-green-600">
                ✓ Successfully created {createdStudents.length} students!
              </AlertDescription>
            </Alert>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-4">
              {createdStudents.slice(0, 10).map((student, idx) => (
                <div key={idx} className="text-sm p-2 bg-muted rounded">
                  <div><strong>Matric:</strong> {student.matric_number}</div>
                  <div><strong>PIN:</strong> {student.pin}</div>
                </div>
              ))}
              {createdStudents.length > 10 && (
                <div className="text-sm text-muted-foreground text-center">
                  ...and {createdStudents.length - 10} more
                </div>
              )}
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Download the CSV file to save the matric numbers and PINs. 
                PINs cannot be retrieved after closing this dialog.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {createdStudents.length === 0 ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleBulkCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Students'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={downloadStudentsList}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}