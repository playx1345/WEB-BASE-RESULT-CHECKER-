import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, GraduationCap, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface StudentData {
  id: string;
  matric_number: string;
  level: string;
  fee_status: string;
  cgp: number;
}

interface DocumentInfo {
  id: string;
  name: string;
  description: string;
  type: 'transcript' | 'result' | 'certificate' | 'statement';
  requiresFee: boolean;
  available: boolean;
  semester?: string;
  session?: string;
}

export function DocumentsView() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, level')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('profile_id', profileData.id)
            .single();

          if (studentData) {
            setStudentData(studentData);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student information');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  // Generate available documents based on student data
  const getAvailableDocuments = (): DocumentInfo[] => {
    if (!studentData) return [];

    const documents: DocumentInfo[] = [
      {
        id: 'current-result',
        name: 'Current Semester Result',
        description: 'Download your current semester examination results',
        type: 'result',
        requiresFee: true,
        available: studentData.fee_status === 'paid',
        semester: 'Second',
        session: '2024/2025'
      },
      {
        id: 'transcript',
        name: 'Academic Transcript',
        description: 'Complete academic transcript showing all courses and grades',
        type: 'transcript',
        requiresFee: true,
        available: studentData.fee_status === 'paid',
      },
      {
        id: 'fee-statement',
        name: 'Fee Payment Statement',
        description: 'Statement showing all fee payments made',
        type: 'statement',
        requiresFee: false,
        available: true,
      },
      {
        id: 'course-registration',
        name: 'Course Registration Form',
        description: 'Current semester course registration details',
        type: 'certificate',
        requiresFee: false,
        available: true,
        semester: 'Second',
        session: '2024/2025'
      }
    ];

    // Add completion certificate if student is in final level with good grades
    if (studentData.level === 'ND2' && studentData.cgp >= 2.0) {
      documents.push({
        id: 'completion-cert',
        name: 'Certificate of Completion',
        description: 'Certificate of successful completion of National Diploma program',
        type: 'certificate',
        requiresFee: true,
        available: studentData.fee_status === 'paid',
      });
    }

    return documents;
  };

  const handleDownload = async (documentId: string, documentName: string) => {
    if (!studentData) return;

    setDownloading(documentId);

    try {
      // Simulate document generation and download
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Call a backend API to generate the document
      // 2. Download the generated PDF/document
      
      // For now, we'll simulate a successful download
      toast.success(`${documentName} downloaded successfully!`);
      
      // Create a mock download
      const element = document.createElement('a');
      const mockPdfContent = `data:text/plain;charset=utf-8,${encodeURIComponent(
        `PLATEAU STATE POLYTECHNIC BARKIN LADI
SCHOOL OF INFORMATION AND COMMUNICATION TECHNOLOGY
DEPARTMENT OF COMPUTER SCIENCE

${documentName}

Student Name: [Student Name]
Matric Number: ${studentData.matric_number}
Level: ${studentData.level}
CGPA: ${studentData.cgp ? studentData.cgp.toFixed(2) : 'N/A'}

Generated on: ${format(new Date(), 'PPP')}

This is a mock document for demonstration purposes.
In a real implementation, this would be a properly formatted PDF document.`
      )}`;
      
      element.href = mockPdfContent;
      element.download = `${documentName.replace(/\s+/g, '_')}_${studentData.matric_number}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'transcript':
        return <GraduationCap className="h-5 w-5" />;
      case 'result':
        return <FileText className="h-5 w-5" />;
      case 'certificate':
        return <CheckCircle className="h-5 w-5" />;
      case 'statement':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDocumentBadgeVariant = (type: string) => {
    switch (type) {
      case 'transcript':
        return 'default';
      case 'result':
        return 'secondary';
      case 'certificate':
        return 'outline';
      case 'statement':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const documents = getAvailableDocuments();
  const hasRestrictedAccess = studentData?.fee_status === 'unpaid';

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Download className="h-8 w-8 text-primary" />
          Documents & Downloads
        </h1>
        <p className="text-muted-foreground">
          Download your academic documents and certificates.
        </p>
      </div>

      {hasRestrictedAccess && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Restricted Access:</strong> Some documents require fee payment to be completed. 
            Please complete your fee payment to access all documents.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((document) => (
          <Card key={document.id} className={`transition-all duration-200 ${!document.available ? 'opacity-60' : 'hover:shadow-lg'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getDocumentIcon(document.type)}
                  <div>
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getDocumentBadgeVariant(document.type) as any} className="text-xs">
                        {document.type}
                      </Badge>
                      {document.requiresFee && (
                        <Badge variant="outline" className="text-xs">
                          Fee Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {document.available ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {document.description}
              </CardDescription>
              
              {(document.semester || document.session) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3" />
                  {document.semester && `${document.semester} Semester`}
                  {document.session && ` - ${document.session}`}
                </div>
              )}

              <Button
                onClick={() => handleDownload(document.id, document.name)}
                disabled={!document.available || downloading === document.id}
                className="w-full"
                variant={document.available ? 'default' : 'secondary'}
              >
                {downloading === document.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {document.available ? 'Download' : 'Unavailable'}
                  </>
                )}
              </Button>

              {!document.available && document.requiresFee && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Complete fee payment to access this document
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents available</h3>
            <p className="text-muted-foreground text-center">
              No documents are currently available for download. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}