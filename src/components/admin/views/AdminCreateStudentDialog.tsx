import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { InputSanitizer } from '@/lib/security';

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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    const sanitizedName = InputSanitizer.sanitizeText(formData.fullName);
    const sanitizedMatric = InputSanitizer.sanitizeMatricNumber(formData.matricNumber);
    const sanitizedPhone = InputSanitizer.sanitizePhoneNumber(formData.phoneNumber);
    const sanitizedPIN = InputSanitizer.sanitizePIN(formData.pin);
    
    if (!sanitizedName || sanitizedName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!sanitizedMatric) {
      newErrors.matricNumber = 'Matric number is required';
    } else if (!InputSanitizer.validateMatricNumber(sanitizedMatric)) {
      newErrors.matricNumber = 'Invalid format. Use: CS/2021/001';
    }
    
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    
    if (sanitizedPhone && !InputSanitizer.validatePhoneNumber(sanitizedPhone)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    
    if (!InputSanitizer.validatePIN(sanitizedPIN)) {
      newErrors.pin = 'PIN must be exactly 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value;
    
    // Apply appropriate sanitization based on field type
    switch (field) {
      case 'fullName':
        sanitizedValue = InputSanitizer.sanitizeText(value);
        break;
      case 'matricNumber':
        sanitizedValue = InputSanitizer.sanitizeMatricNumber(value);
        break;
      case 'phoneNumber':
        sanitizedValue = InputSanitizer.sanitizePhoneNumber(value);
        break;
      case 'pin':
        sanitizedValue = InputSanitizer.sanitizePIN(value);
        break;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      // Final sanitization before sending to backend
      const sanitizedData = {
        p_full_name: InputSanitizer.sanitizeText(formData.fullName),
        p_matric_number: InputSanitizer.sanitizeMatricNumber(formData.matricNumber),
        p_level: formData.level,
        p_phone_number: formData.phoneNumber ? InputSanitizer.sanitizePhoneNumber(formData.phoneNumber) : null,
        p_pin: InputSanitizer.sanitizePIN(formData.pin)
      };

      const { data, error } = await supabase.rpc('admin_create_student', sanitizedData);

      if (error) {
        console.error('Error creating student:', error);
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          setErrors({ matricNumber: 'A student with this matric number already exists' });
          toast.error('A student with this matric number already exists');
        } else {
          toast.error('Failed to create student: ' + error.message);
        }
        return;
      }

      toast.success(`Student ${formData.fullName} created successfully!`);
      
      // Reset form
      setFormData({
        fullName: '',
        matricNumber: '',
        level: '',
        phoneNumber: '',
        pin: '112233'
      });
      setErrors({});
      
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
    setErrors({});
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
              className={errors.fullName ? 'border-destructive' : ''}
              required
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number *</Label>
            <Input
              id="matricNumber"
              value={formData.matricNumber}
              onChange={(e) => handleInputChange('matricNumber', e.target.value.toUpperCase())}
              placeholder="e.g., CS/2021/001"
              className={errors.matricNumber ? 'border-destructive' : ''}
              required
            />
            {errors.matricNumber && (
              <p className="text-sm text-destructive">{errors.matricNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
              <SelectTrigger className={errors.level ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ND1">ND1 (First Year)</SelectItem>
                <SelectItem value="ND2">ND2 (Second Year)</SelectItem>
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-destructive">{errors.level}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Enter phone number (optional)"
              className={errors.phoneNumber ? 'border-destructive' : ''}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">Login PIN</Label>
            <Input
              id="pin"
              value={formData.pin}
              onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit PIN"
              className={errors.pin ? 'border-destructive' : ''}
              maxLength={6}
            />
            {errors.pin && (
              <p className="text-sm text-destructive">{errors.pin}</p>
            )}
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