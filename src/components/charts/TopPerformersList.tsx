import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

interface TopPerformer {
  id: string;
  matricNumber: string;
  fullName: string;
  level: string;
  cgp: number;
  rank: number;
}

interface TopPerformersListProps {
  data: TopPerformer[];
  title?: string;
  limit?: number;
}

export function TopPerformersList({ data, title = "Top Performers", limit = 10 }: TopPerformersListProps) {
  const limitedData = data.slice(0, limit);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 5) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Students with highest CGPA across all levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {limitedData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No performance data available
            </div>
          ) : (
            limitedData.map((performer) => (
              <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(performer.rank)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {performer.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{performer.fullName || 'Unknown Student'}</span>
                    <span className="text-xs text-muted-foreground">{performer.matricNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRankBadgeVariant(performer.rank)} className="text-xs">
                    {performer.level}
                  </Badge>
                  <div className="text-right">
                    <div className="font-bold text-lg text-primary">
                      {performer.cgp.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">CGPA</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}