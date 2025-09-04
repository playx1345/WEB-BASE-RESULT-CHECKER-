import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Upload, 
  FileText, 
  DollarSign,
  Settings,
  School,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [students] = useState([
    {
      id: 1,
      name: "John Doe",
      matricNumber: "ND/2023/001",
      email: "john.doe@student.plateaupolytechnic.edu.ng",
      phone: "08012345678",
      level: "ND2",
      feeStatus: "paid"
    },
    {
      id: 2,
      name: "Jane Smith",
      matricNumber: "ND/2023/002", 
      email: "jane.smith@student.plateaupolytechnic.edu.ng",
      phone: "08098765432",
      level: "ND1",
      feeStatus: "unpaid"
    }
  ]);

  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    matricNumber: '',
    phoneNumber: '',
    level: ''
  });

  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    targetLevel: 'all'
  });

  const [resultUpload, setResultUpload] = useState({
    level: '',
    semester: '',
    session: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newStudent.fullName || !newStudent.email || !newStudent.matricNumber || !newStudent.level) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically call your API to create the student
      toast({
        title: "Student Created",
        description: `Student ${newStudent.fullName} has been created successfully with default PIN 2233.`,
      });
      
      // Reset form
      setNewStudent({
        fullName: '',
        email: '',
        matricNumber: '',
        phoneNumber: '',
        level: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student account.",
        variant: "destructive",
      });
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!announcement.title || !announcement.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Announcement Sent",
        description: `Announcement sent to ${announcement.targetLevel === 'all' ? 'all students' : announcement.targetLevel + ' students'}.`,
      });
      
      setAnnouncement({
        title: '',
        content: '',
        targetLevel: 'all'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement.",
        variant: "destructive",
      });
    }
  };

  const handleFeeStatusUpdate = (studentId: number, status: string) => {
    toast({
      title: "Fee Status Updated",
      description: `Student fee status updated to ${status}.`,
    });
  };

  const handleResultUpload = () => {
    if (!resultUpload.level || !resultUpload.semester || !resultUpload.session) {
      toast({
        title: "Validation Error",
        description: "Please select level, semester, and session.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Upload Ready",
      description: "Please select a CSV file containing the results data.",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <School className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage students, results, and announcements</p>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fees Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.feeStatus === 'paid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fees Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.feeStatus === 'unpaid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ND2 Students</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.level === 'ND2').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="create">Create Student</TabsTrigger>
            <TabsTrigger value="results">Upload Results</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Matric Number</th>
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">Fee Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b">
                          <td className="p-2">{student.name}</td>
                          <td className="p-2 font-medium">{student.matricNumber}</td>
                          <td className="p-2">{student.level}</td>
                          <td className="p-2">
                            <Badge 
                              variant={student.feeStatus === 'paid' ? 'default' : 'destructive'}
                              className={student.feeStatus === 'paid' ? 'bg-green-600' : ''}
                            >
                              {student.feeStatus}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleFeeStatusUpdate(student.id, 
                                  student.feeStatus === 'paid' ? 'unpaid' : 'paid')}
                              >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Toggle Fee
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New Student Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newStudent.fullName}
                        onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                        placeholder="Enter student's full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        placeholder="student@plateaupolytechnic.edu.ng"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="matricNumber">Matric Number *</Label>
                      <Input
                        id="matricNumber"
                        value={newStudent.matricNumber}
                        onChange={(e) => setNewStudent({...newStudent, matricNumber: e.target.value})}
                        placeholder="ND/2024/XXX"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={newStudent.phoneNumber}
                        onChange={(e) => setNewStudent({...newStudent, phoneNumber: e.target.value})}
                        placeholder="08XXXXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Level *</Label>
                      <Select value={newStudent.level} onValueChange={(value) => setNewStudent({...newStudent, level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ND1">ND1</SelectItem>
                          <SelectItem value="ND2">ND2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Default Settings:</p>
                    <p className="text-sm text-muted-foreground">• Default PIN: 2233</p>
                    <p className="text-sm text-muted-foreground">• Fee Status: Unpaid</p>
                    <p className="text-sm text-muted-foreground">• Account will be created and student can login immediately</p>
                  </div>

                  <Button type="submit" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Student Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Student Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={resultUpload.level} onValueChange={(value) => setResultUpload({...resultUpload, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ND1">ND1</SelectItem>
                        <SelectItem value="ND2">ND2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={resultUpload.semester} onValueChange={(value) => setResultUpload({...resultUpload, semester: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First Semester</SelectItem>
                        <SelectItem value="second">Second Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session">Session</Label>
                    <Input
                      id="session"
                      value={resultUpload.session}
                      onChange={(e) => setResultUpload({...resultUpload, session: e.target.value})}
                      placeholder="2023/2024"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFile">Results CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                  />
                  <p className="text-sm text-muted-foreground">
                    CSV format: Matric Number, Course Code, Course Title, Credit Unit, Grade, Point
                  </p>
                </div>

                <Button onClick={handleResultUpload} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Results
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Send Announcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={announcement.title}
                      onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={announcement.content}
                      onChange={(e) => setAnnouncement({...announcement, content: e.target.value})}
                      placeholder="Enter announcement content"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetLevel">Target Audience</Label>
                    <Select value={announcement.targetLevel} onValueChange={(value) => setAnnouncement({...announcement, targetLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="ND1">ND1 Students Only</SelectItem>
                        <SelectItem value="ND2">ND2 Students Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;