import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceTrendData {
  semester: string;
  averageGP: number;
  excellentPerformers: number;
  strugglingStudents: number;
}

interface PerformanceTrendChartProps {
  data: PerformanceTrendData[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Performance Trends Over Time</CardTitle>
        <CardDescription>Track academic performance trends across semesters</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="averageGP" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Average GPA"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="excellentPerformers" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Excellent Performers"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="strugglingStudents" 
              stroke="#ff7c7c" 
              strokeWidth={2}
              name="Students Needing Support"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}