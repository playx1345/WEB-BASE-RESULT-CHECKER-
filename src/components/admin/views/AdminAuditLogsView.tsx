import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, FilterIcon, RefreshCwIcon, SearchIcon, ActivityIcon } from 'lucide-react';
import { fetchAuditLogs, getAuditLogStats, AuditLogEntry } from '@/lib/auditLogger';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function AdminAuditLogsView() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalActivities: number;
    todayActivities: number;
    actionBreakdown: Record<string, number>;
  } | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    userId: '',
    fromDate: '',
    toDate: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 50;

  const loadAuditLogs = async (page = 0, resetData = false) => {
    try {
      setLoading(true);
      
      const { data, error } = await fetchAuditLogs({
        limit: pageSize,
        offset: page * pageSize,
        action: filters.action || undefined,
        tableName: filters.tableName || undefined,
        userId: filters.userId || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });

      if (error) {
        toast.error('Failed to load audit logs');
        return;
      }

      if (resetData || page === 0) {
        setAuditLogs(data);
      } else {
        setAuditLogs(prev => [...prev, ...data]);
      }

      setHasMore(data.length === pageSize);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getAuditLogStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  };

  useEffect(() => {
    loadAuditLogs(0, true);
    loadStats();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const handleRefresh = () => {
    loadAuditLogs(0, true);
    loadStats();
    toast.success('Audit logs refreshed');
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadAuditLogs(currentPage + 1, false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('login') || action.includes('logout')) return 'default';
    if (action.includes('insert') || action.includes('create')) return 'secondary';
    if (action.includes('update') || action.includes('modify')) return 'outline';
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    if (action.includes('view') || action.includes('access')) return 'secondary';
    return 'default';
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getUserDisplayName = (log: AuditLogEntry) => {
    const profile = (log as AuditLogEntry & { profiles?: { full_name?: string; matric_number?: string } }).profiles;
    if (profile?.full_name) {
      return profile.full_name + (profile.matric_number ? ` (${profile.matric_number})` : '');
    }
    return log.user_id || 'System';
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchTerm) ||
      getUserDisplayName(log).toLowerCase().includes(searchTerm) ||
      (log.table_name && log.table_name.toLowerCase().includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            Track user activities and system changes for security and compliance
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities (7 days)</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayActivities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Actions</CardTitle>
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.actionBreakdown).length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search actions, users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action">Action Type</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="login">Login/Logout</SelectItem>
                  <SelectItem value="insert">Create/Insert</SelectItem>
                  <SelectItem value="update">Update/Modify</SelectItem>
                  <SelectItem value="delete">Delete/Remove</SelectItem>
                  <SelectItem value="view">View/Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="table">Table</Label>
              <Select value={filters.tableName} onValueChange={(value) => handleFilterChange('tableName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tables</SelectItem>
                  <SelectItem value="results">Results</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="profiles">Profiles</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {auditLogs.length} audit log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getUserDisplayName(log)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {formatActionName(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.table_name && (
                        <Badge variant="outline">{log.table_name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground truncate">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {loading && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            )}

            {!loading && filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">No audit logs found</div>
              </div>
            )}

            {!loading && hasMore && filteredLogs.length > 0 && (
              <div className="text-center py-4">
                <Button variant="outline" onClick={handleLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}