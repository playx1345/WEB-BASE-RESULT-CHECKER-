import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateEmail, validatePhone, validateMatricNumber } from '@/lib/file-utils';

interface Student {
  id?: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp?: number;
  total_gp?: number;
  carryovers?: number;
  profile?: {
    full_name: string;
    phone_number: string;
    email?: string;
  };
}

interface StudentFormProps {
  student?: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (studentData: any, profileData: any) => Promise<void>;
  loading?: boolean;
}

export function StudentForm({ student, open, onOpenChange, onSubmit, loading = false }: StudentFormProps) {
  const [formData, setFormData] = useState({
    matric_number: '',
    level: '',
    fee_status: 'unpaid',
    cgp: '',
    total_gp: '',
    carryovers: '',
    full_name: '',
    phone_number: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        matric_number: student.matric_number || '',
        level: student.level || '',
        fee_status: student.fee_status || 'unpaid',
        cgp: student.cgp?.toString() || '',
        total_gp: student.total_gp?.toString() || '',
        carryovers: student.carryovers?.toString() || '',
        full_name: student.profile?.full_name || '',
        phone_number: student.profile?.phone_number || '',
        email: student.profile?.email || '',
      });
    } else {
      setFormData({
        matric_number: '',
        level: '',
        fee_status: 'unpaid',
        cgp: '',
        total_gp: '',
        carryovers: '',
        full_name: '',
        phone_number: '',
        email: '',
      });
    }
    setErrors({});
  }, [student, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.matric_number.trim()) {
      newErrors.matric_number = 'Matric number is required';
    } else if (!validateMatricNumber(formData.matric_number)) {
      newErrors.matric_number = 'Invalid matric number format';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

    if (formData.cgp && (isNaN(parseFloat(formData.cgp)) || parseFloat(formData.cgp) < 0 || parseFloat(formData.cgp) > 4)) {
      newErrors.cgp = 'CGPA must be between 0 and 4';
    }

    if (formData.carryovers && (isNaN(parseInt(formData.carryovers)) || parseInt(formData.carryovers) < 0)) {
      newErrors.carryovers = 'Carryovers must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const studentData = {
      matric_number: formData.matric_number,
      level: formData.level,
      fee_status: formData.fee_status,
      cgp: formData.cgp ? parseFloat(formData.cgp) : undefined,
      total_gp: formData.total_gp ? parseFloat(formData.total_gp) : undefined,
      carryovers: formData.carryovers ? parseInt(formData.carryovers) : 0,
    };

    const profileData = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      email: formData.email || undefined,
    };

    await onSubmit(studentData, profileData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            {student ? 'Update student information' : 'Enter student details to add to the system'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matric_number">Matric Number *</Label>
              <Input
                id="matric_number"
                value={formData.matric_number}
                onChange={(e) => handleInputChange('matric_number', e.target.value)}
                placeholder="e.g., ND22/CS/001"
                disabled={loading}
              />
              {errors.matric_number && (
                <p className="text-sm text-destructive">{errors.matric_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ND1">ND1</SelectItem>
                  <SelectItem value="ND2">ND2</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-destructive">{errors.level}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Student's full name"
              disabled={loading}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="e.g., +234 800 000 0000"
                disabled={loading}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="student@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee_status">Fee Status</Label>
              <Select value={formData.fee_status} onValueChange={(value) => handleInputChange('fee_status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgp">CGPA</Label>
              <Input
                id="cgp"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.cgp}
                onChange={(e) => handleInputChange('cgp', e.target.value)}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.cgp && (
                <p className="text-sm text-destructive">{errors.cgp}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="carryovers">Carryovers</Label>
              <Input
                id="carryovers"
                type="number"
                min="0"
                value={formData.carryovers}
                onChange={(e) => handleInputChange('carryovers', e.target.value)}
                placeholder="0"
                disabled={loading}
              />
              {errors.carryovers && (
                <p className="text-sm text-destructive">{errors.carryovers}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}