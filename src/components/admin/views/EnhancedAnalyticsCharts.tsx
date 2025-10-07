import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EnhancedAnalyticsChartsProps {
  levelData: { name: string; students: number }[];
  gradeData: { grade: string; count: number }[];
  performanceData: { category: string; value: number }[];
  monthlyTrend?: { month: string; students: number; results: number }[];
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const GRADE_COLORS: Record<string, string> = {
  'A': COLORS.success,
  'B': COLORS.info,
  'C': COLORS.warning,
  'D': COLORS.warning,
  'E': COLORS.danger,
  'F': COLORS.danger,
};

export function EnhancedAnalyticsCharts({ 
  levelData, 
  gradeData, 
  performanceData,
  monthlyTrend 
}: EnhancedAnalyticsChartsProps) {
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Student Distribution by Level - Bar Chart */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Student Distribution by Level</CardTitle>
          <CardDescription>Number of students in each academic level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="students" 
                fill={COLORS.primary}
                radius={[8, 8, 0, 0]}
                name="Students"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade Distribution - Pie Chart */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Overall performance across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ grade, percent }) => `${grade} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill={COLORS.primary}
                dataKey="count"
                nameKey="grade"
              >
                {gradeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={GRADE_COLORS[entry.grade] || COLORS.secondary} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Categories - Bar Chart */}
      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Performance Categories</CardTitle>
          <CardDescription>Students grouped by CGPA performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={150}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.accent}
                radius={[0, 8, 8, 0]}
                name="Students"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend - Line Chart */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Student registrations and result uploads over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="New Students"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="results" 
                  stroke={COLORS.success} 
                  strokeWidth={2}
                  name="Results Uploaded"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
