import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Award, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface PerformanceChartsProps {
  cgpaData?: Array<{
    semester: string;
    cgpa: number;
    gpa: number;
  }>;
  gradeDistribution?: Array<{
    grade: string;
    count: number;
    color: string;
  }>;
  subjectPerformance?: Array<{
    subject: string;
    score: number;
    grade: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function PerformanceCharts({ 
  cgpaData = [], 
  gradeDistribution = [],
  subjectPerformance = []
}: PerformanceChartsProps) {
  // Mock data if not provided
  const defaultCgpaData = cgpaData.length > 0 ? cgpaData : [
    { semester: '2023/1', cgpa: 3.2, gpa: 3.4 },
    { semester: '2023/2', cgpa: 3.4, gpa: 3.6 },
    { semester: '2024/1', cgpa: 3.6, gpa: 3.8 },
    { semester: '2024/2', cgpa: 3.7, gpa: 3.9 },
  ];

  const defaultGradeDistribution = gradeDistribution.length > 0 ? gradeDistribution : [
    { grade: 'A', count: 8, color: '#10B981' },
    { grade: 'B', count: 12, color: '#3B82F6' },
    { grade: 'C', count: 6, color: '#F59E0B' },
    { grade: 'D', count: 2, color: '#EF4444' },
    { grade: 'F', count: 1, color: '#6B7280' },
  ];

  const defaultSubjectPerformance = subjectPerformance.length > 0 ? subjectPerformance : [
    { subject: 'Data Structures', score: 85, grade: 'A' },
    { subject: 'Database Systems', score: 78, grade: 'B' },
    { subject: 'Web Development', score: 92, grade: 'A' },
    { subject: 'Software Engineering', score: 74, grade: 'B' },
    { subject: 'Computer Networks', score: 68, grade: 'C' },
  ];

  const currentCgpa = defaultCgpaData[defaultCgpaData.length - 1]?.cgpa || 0;
  const previousCgpa = defaultCgpaData[defaultCgpaData.length - 2]?.cgpa || 0;
  const cgpaTrend = currentCgpa - previousCgpa;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCgpa.toFixed(2)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(cgpaTrend)}`}>
              {getTrendIcon(cgpaTrend)}
              <span className="ml-1">
                {cgpaTrend !== 0 ? `${cgpaTrend > 0 ? '+' : ''}${cgpaTrend.toFixed(2)} from last semester` : 'No change'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaultSubjectPerformance.length}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">A</div>
            <p className="text-xs text-muted-foreground">
              {defaultGradeDistribution.find(g => g.grade === 'A')?.count || 0} courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CGPA Trend Chart */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>CGPA Trend</CardTitle>
            <CardDescription>
              Your academic performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={defaultCgpaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cgpa" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Breakdown of your grades this semester
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={defaultGradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, count }) => `${grade}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {defaultGradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {defaultGradeDistribution.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: item.color, color: item.color }}
                >
                  {item.grade}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Chart */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>
            Your scores across different subjects this semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defaultSubjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="subject" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar 
                dataKey="score" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}