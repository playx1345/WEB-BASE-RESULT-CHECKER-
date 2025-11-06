import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminCreateStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentCreated: () => void;
}

export function AdminCreateStudentDialog({ 
  open, 
  onOpenChange, 
  onStudentCreated 
}: AdminCreateStudentDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    level: '',
    phoneNumber: '',
    pin: '112233' // Default PIN
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.matricNumber || !formData.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('admin_create_student', {
        p_full_name: formData.fullName,
        p_matric_number: formData.matricNumber,
        p_level: formData.level,
        p_phone_number: formData.phoneNumber || null,
        p_pin: formData.pin
      });

      if (error) {
        console.error('Error creating student:', error);
        if (error.message.includes('duplicate key')) {
          toast.error('A student with this matric number already exists');
        } else {
          toast.error('Failed to create student: ' + error.message);
        }
        return;
      }

      toast.success('Student created successfully!');
      
      // Reset form
      setFormData({
        fullName: '',
        matricNumber: '',
        level: '',
        phoneNumber: '',
        pin: '112233'
      });
      
      onStudentCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      fullName: '',
      matricNumber: '',
      level: '',
      phoneNumber: '',
      pin: '112233'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
          <DialogDescription>
            Add a new student to the system. They will be able to login with their matric number and PIN.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter student's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number *</Label>
            <Input
              id="matricNumber"
              value={formData.matricNumber}
              onChange={(e) => handleInputChange('matricNumber', e.target.value.toUpperCase())}
              placeholder="e.g., CS/2021/001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 Level</SelectItem>
                <SelectItem value="200">200 Level</SelectItem>
                <SelectItem value="300">300 Level</SelectItem>
                <SelectItem value="400">400 Level</SelectItem>
                <SelectItem value="500">500 Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Login PIN</Label>
            <Input
              id="pin"
              value={formData.pin}
              onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit PIN"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Default PIN is 112233. Student can request PIN change later.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}