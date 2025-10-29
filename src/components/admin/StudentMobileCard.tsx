import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Edit, Trash2, RefreshCw } from 'lucide-react';

interface Student {
  id: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp: number;
  total_gp: number;
  carryovers: number;
  profile: {
    full_name: string;
    phone_number: string;
    user_id: string;
  };
}

interface StudentMobileCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onResetPin?: (student: Student) => void;
}

export function StudentMobileCard({ student, onEdit, onDelete, onResetPin }: StudentMobileCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {student.profile?.full_name || 'N/A'}
            </h3>
            <p className="text-sm text-muted-foreground">{student.matric_number}</p>
          </div>
          <Badge variant="outline" className="ml-2 shrink-0">{student.level}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">CGPA</p>
            <p className="font-medium">{student.cgp ? student.cgp.toFixed(2) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Carryovers</p>
            {student.carryovers > 0 ? (
              <Badge variant="destructive" className="text-xs">{student.carryovers}</Badge>
            ) : (
              <p className="text-muted-foreground">None</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge 
            variant={student.fee_status === 'paid' ? 'default' : 'destructive'}
            className="capitalize text-xs"
          >
            {student.fee_status === 'paid' ? (
              <><UserCheck className="h-3 w-3 mr-1" />Paid</>
            ) : (
              <><UserX className="h-3 w-3 mr-1" />Unpaid</>
            )}
          </Badge>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(student)}
              className="h-8 px-2"
              title="Edit student"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {onResetPin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onResetPin(student)}
                className="h-8 px-2"
                title="Reset PIN"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(student)}
              className="h-8 px-2 text-destructive hover:bg-destructive/10"
              title="Delete student"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
