import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectPerformanceData {
  courseCode: string;
  courseTitle: string;
  averagePoint: number;
  studentCount: number;
  passRate: number;
  needsImprovement: boolean;
}

interface SubjectAnalysisChartProps {
  data: SubjectPerformanceData[];
}

const COLORS = {
  good: '#22c55e',
  average: '#f59e0b', 
  poor: '#ef4444'
};

export function SubjectAnalysisChart({ data }: SubjectAnalysisChartProps) {
  const getBarColor = (averagePoint: number) => {
    if (averagePoint >= 3.5) return COLORS.good;
    if (averagePoint >= 2.0) return COLORS.average;
    return COLORS.poor;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Subject Performance Analysis</CardTitle>
        <CardDescription>Identify subjects that need improvement and top performing courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="courseCode" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => {
                const course = data.find(d => d.courseCode === label);
                return course ? `${course.courseCode}: ${course.courseTitle}` : label;
              }}
            />
            <Legend />
            <Bar dataKey="averagePoint" name="Average Grade Point">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.averagePoint)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}