import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const addStudentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name too long'),
  matricNumber: z.string().min(5, 'Matric number must be at least 5 characters').max(20, 'Matric number too long'),
  phoneNumber: z.string().optional(),
  level: z.string().min(1, 'Please select a level'),
  feeStatus: z.string().min(1, 'Please select fee status'),
  cgpa: z.string().optional(),
  carryovers: z.string().optional(),
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddStudentModal({ open, onOpenChange, onSuccess }: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      fullName: '',
      matricNumber: '',
      phoneNumber: '',
      level: '',
      feeStatus: '',
      cgpa: '',
      carryovers: '0',
    },
  });

  const onSubmit = async (data: AddStudentFormData) => {
    setIsLoading(true);
    try {
      // First, check if matric number already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('matric_number')
        .eq('matric_number', data.matricNumber)
        .single();

      if (existingStudent) {
        toast({
          title: 'Error',
          description: 'A student with this matric number already exists',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Create profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          full_name: data.fullName,
          phone_number: data.phoneNumber || null,
          matric_number: data.matricNumber,
          level: data.level,
          role: 'student',
          user_id: crypto.randomUUID(), // Generate a temporary user_id for now
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: 'Error',
          description: 'Failed to create student profile',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          matric_number: data.matricNumber,
          level: data.level,
          fee_status: data.feeStatus,
          cgp: data.cgpa ? parseFloat(data.cgpa) : null,
          carryovers: data.carryovers ? parseInt(data.carryovers) : 0,
          profile_id: profileData.id,
        });

      if (studentError) {
        console.error('Student creation error:', studentError);
        // Try to clean up the profile if student creation failed
        await supabase.from('profiles').delete().eq('id', profileData.id);
        
        toast({
          title: 'Error',
          description: 'Failed to create student record',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Student added successfully',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        form.reset();
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information to add them to the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="matricNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matric Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter matric number" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter phone number" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ND1">ND1</SelectItem>
                        <SelectItem value="ND2">ND2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feeStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGPA (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="4" 
                        placeholder="0.00" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carryovers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carryovers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}