import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BookCheck } from 'lucide-react';

interface AcademicStatsWidgetProps {
  cgpa: number;
  totalGP: number;
  carryovers: number;
  level: string;
}

export function AcademicStatsWidget({ cgpa, totalGP, carryovers, level }: AcademicStatsWidgetProps) {
  const targetCGPA = 4.0;
  const progressPercentage = (cgpa / targetCGPA) * 100;
  const isExcellent = cgpa >= 3.5;
  const isGood = cgpa >= 2.5 && cgpa < 3.5;
  
  const getPerformanceLevel = () => {
    if (cgpa >= 3.5) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (cgpa >= 3.0) return { label: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (cgpa >= 2.5) return { label: 'Good', color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
    if (cgpa >= 2.0) return { label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Needs Improvement', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* CGPA Progress Card */}
      <Card className="relative overflow-hidden border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">CGPA Progress</CardTitle>
            {cgpa >= 3.0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-orange-600" />
            )}
          </div>
          <CardDescription>Your academic standing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {cgpa.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">/ 4.00</span>
            </div>
            <Badge variant="outline" className={`${performance.bgColor} ${performance.color} border-0`}>
              {performance.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Excellence</span>
              <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Grade Points</span>
              <span className="font-semibold">{totalGP.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Goals Card */}
      <Card className="relative overflow-hidden border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Academic Status</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <CardDescription>Current academic standing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <BookCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Current Level</span>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0">
                {level}
              </Badge>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${carryovers === 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
              <span className="text-sm font-medium">Carryover Courses</span>
              <Badge 
                variant={carryovers === 0 ? 'default' : 'destructive'}
                className="font-semibold"
              >
                {carryovers}
              </Badge>
            </div>

            {carryovers === 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  🎉 Excellent! No outstanding courses
                </p>
              </div>
            )}

            {isExcellent && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                  ⭐ Outstanding Performance!
                </p>
              </div>
            )}
          </div>

          {cgpa > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {cgpa >= 3.5 
                  ? "Keep up the excellent work! You're on track for honors." 
                  : cgpa >= 2.5 
                  ? "Good progress! Aim for a 3.5 CGPA to achieve excellence." 
                  : "Stay focused! Work towards improving your CGPA to 2.5+."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
