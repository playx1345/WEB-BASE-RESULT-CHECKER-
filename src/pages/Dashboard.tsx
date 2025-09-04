import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Download,
  User,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [studentData] = useState({
    name: "John Doe",
    matricNumber: "ND/2023/001",
    level: "ND2",
    feeStatus: "paid", // or "unpaid"
    totalGP: 65.5,
    cgp: 3.27,
    carryovers: 2
  });

  const [announcements] = useState([
    {
      id: 1,
      title: "Result Release Notice",
      content: "Second semester results for ND2 students have been released.",
      date: "2024-01-15",
      level: "ND2"
    },
    {
      id: 2,
      title: "Fee Payment Reminder", 
      content: "All outstanding fees must be cleared before result access.",
      date: "2024-01-10",
      level: "all"
    }
  ]);

  const [nd1Results] = useState([
    {
      semester: "First Semester",
      courses: [
        { code: "COS101", title: "Introduction to Computer Science", unit: 3, grade: "A", point: 5.0 },
        { code: "MTH101", title: "Elementary Mathematics I", unit: 3, grade: "B", point: 4.0 },
        { code: "GST101", title: "Use of English", unit: 2, grade: "A", point: 5.0 },
        { code: "GST103", title: "Nigerian People and Culture", unit: 2, grade: "B", point: 4.0 }
      ]
    },
    {
      semester: "Second Semester", 
      courses: [
        { code: "COS102", title: "Introduction to Programming", unit: 3, grade: "A", point: 5.0 },
        { code: "MTH102", title: "Elementary Mathematics II", unit: 3, grade: "B", point: 4.0 },
        { code: "GST102", title: "Philosophy and Logic", unit: 2, grade: "A", point: 5.0 },
        { code: "GST104", title: "History and Philosophy of Science", unit: 2, grade: "B", point: 4.0 }
      ]
    }
  ]);

  const [nd2Results] = useState([
    {
      semester: "First Semester",
      courses: [
        { code: "COS201", title: "Computer Programming I", unit: 4, grade: "A", point: 5.0 },
        { code: "COS203", title: "Data Structures", unit: 3, grade: "B", point: 4.0 },
        { code: "COS205", title: "Database Design", unit: 3, grade: "A", point: 5.0 },
        { code: "MTH201", title: "Mathematics for Computing", unit: 3, grade: "C", point: 3.0 }
      ]
    },
    {
      semester: "Second Semester",
      courses: [
        { code: "COS202", title: "Computer Programming II", unit: 4, grade: "A", point: 5.0 },
        { code: "COS204", title: "Systems Analysis and Design", unit: 3, grade: "B", point: 4.0 },
        { code: "COS206", title: "Web Development", unit: 3, grade: "A", point: 5.0 },
        { code: "MTH202", title: "Statistics for Computing", unit: 3, grade: "B", point: 4.0 }
      ]
    }
  ]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <School className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const calculateSemesterGP = (courses: any[]) => {
    const totalPoints = courses.reduce((sum, course) => sum + (course.point * course.unit), 0);
    const totalUnits = courses.reduce((sum, course) => sum + course.unit, 0);
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
  };

  const handlePrintResult = (level: string, semester: string) => {
    // This would generate and download a PDF
    alert(`Printing ${level} ${semester} results...`);
  };

  if (studentData.feeStatus === "unpaid") {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <CardTitle className="text-2xl">Fee Payment Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your school fees have not been cleared. Please complete your fee payment to access your results.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">Student Information</p>
                <p>Name: {studentData.name}</p>
                <p>Matric Number: {studentData.matricNumber}</p>
                <p>Level: {studentData.level}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact the bursary department for fee payment information.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {studentData.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total GP</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.totalGP}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CGP</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.cgp}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carryovers</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.carryovers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-600">
                Paid
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Academic Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="nd1" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nd1">ND1 Results</TabsTrigger>
                <TabsTrigger value="nd2">ND2 Results</TabsTrigger>
              </TabsList>

              <TabsContent value="nd1" className="space-y-4">
                {nd1Results.map((semesterResult, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">{semesterResult.semester}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintResult("ND1", semesterResult.semester)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Course Code</th>
                              <th className="text-left p-2">Course Title</th>
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Grade</th>
                              <th className="text-left p-2">Point</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semesterResult.courses.map((course, courseIndex) => (
                              <tr key={courseIndex} className="border-b">
                                <td className="p-2 font-medium">{course.code}</td>
                                <td className="p-2">{course.title}</td>
                                <td className="p-2">{course.unit}</td>
                                <td className="p-2">
                                  <Badge variant="outline">{course.grade}</Badge>
                                </td>
                                <td className="p-2">{course.point}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-right">
                        <p className="font-semibold">
                          Semester GP: {calculateSemesterGP(semesterResult.courses)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="nd2" className="space-y-4">
                {nd2Results.map((semesterResult, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">{semesterResult.semester}</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintResult("ND2", semesterResult.semester)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Course Code</th>
                              <th className="text-left p-2">Course Title</th>
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Grade</th>
                              <th className="text-left p-2">Point</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semesterResult.courses.map((course, courseIndex) => (
                              <tr key={courseIndex} className="border-b">
                                <td className="p-2 font-medium">{course.code}</td>
                                <td className="p-2">{course.title}</td>
                                <td className="p-2">{course.unit}</td>
                                <td className="p-2">
                                  <Badge variant="outline">{course.grade}</Badge>
                                </td>
                                <td className="p-2">{course.point}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-right">
                        <p className="font-semibold">
                          Semester GP: {calculateSemesterGP(semesterResult.courses)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;