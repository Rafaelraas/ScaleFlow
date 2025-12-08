import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';
import { getWorkloadMetrics, getWorkloadSummary, getActiveWorkloadTemplates } from '@/api/workload';
import { WorkloadMetric, WorkloadTemplate } from '@/types/database';
import { showError } from '@/utils/toast';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

const Workload = () => {
  const { userProfile } = useSession();
  const [metrics, setMetrics] = useState<WorkloadMetric[]>([]);
  const [templates, setTemplates] = useState<WorkloadTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [summary, setSummary] = useState({
    avgUtilization: 0,
    totalScheduledHours: 0,
    totalPlannedHours: 0,
    avgStaffingGap: 0,
    daysUnderStaffed: 0,
    daysOverStaffed: 0,
  });

  useEffect(() => {
    if (userProfile?.company_id) {
      loadWorkloadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.company_id, selectedPeriod]);

  const loadWorkloadData = async () => {
    if (!userProfile?.company_id) return;

    setIsLoading(true);
    try {
      const today = new Date();
      const startDate =
        selectedPeriod === 'week'
          ? format(startOfWeek(today), 'yyyy-MM-dd')
          : format(subDays(today, 30), 'yyyy-MM-dd');
      const endDate =
        selectedPeriod === 'week'
          ? format(endOfWeek(today), 'yyyy-MM-dd')
          : format(addDays(today, 30), 'yyyy-MM-dd');

      const [metricsData, summaryData, templatesData] = await Promise.all([
        getWorkloadMetrics(userProfile.company_id, startDate, endDate),
        getWorkloadSummary(userProfile.company_id, startDate, endDate),
        getActiveWorkloadTemplates(userProfile.company_id),
      ]);

      setMetrics(metricsData);
      setSummary(summaryData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load workload data:', error);
      showError('Failed to load workload data');
    } finally {
      setIsLoading(false);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 50) return 'text-yellow-600';
    if (rate < 80) return 'text-green-600';
    if (rate < 100) return 'text-blue-600';
    return 'text-red-600';
  };

  const getStaffingGapColor = (gap: number) => {
    if (gap < 0) return 'text-red-600'; // Understaffed
    if (gap === 0) return 'text-green-600'; // Perfect
    return 'text-yellow-600'; // Overstaffed
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading workload data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workload Management</h1>
          <p className="text-muted-foreground mt-2">
            Track capacity, utilization, and staffing levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('week')}
          >
            This Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            30 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(summary.avgUtilization)}`}>
              {summary.avgUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalScheduledHours.toFixed(0)} / {summary.totalPlannedHours.toFixed(0)}{' '}
              hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Staffing Gap</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStaffingGapColor(summary.avgStaffingGap)}`}>
              {summary.avgStaffingGap > 0 ? '+' : ''}
              {summary.avgStaffingGap.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.avgStaffingGap < 0
                ? 'Understaffed'
                : summary.avgStaffingGap > 0
                  ? 'Overstaffed'
                  : 'Optimal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Understaffed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.daysUnderStaffed}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalScheduledHours.toFixed(0)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Across all days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Daily Metrics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Workload Metrics</CardTitle>
              <CardDescription>Capacity and staffing levels for each day</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workload data yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Workload metrics are automatically calculated from your shifts
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {format(new Date(metric.date), 'EEEE, MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {metric.department || 'General'}
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Utilization</div>
                          <div
                            className={`font-bold ${getUtilizationColor(metric.utilization_rate)}`}
                          >
                            {metric.utilization_rate.toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Hours</div>
                          <div className="font-bold">
                            {metric.scheduled_hours.toFixed(0)} /{' '}
                            {metric.planned_capacity_hours.toFixed(0)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Staff</div>
                          <div className={`font-bold ${getStaffingGapColor(metric.staffing_gap)}`}>
                            {metric.scheduled_staff_count} / {metric.required_staff_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workload Templates</CardTitle>
              <CardDescription>Reusable patterns for capacity planning</CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create templates to quickly plan capacity for similar days
                  </p>
                  <Button>Create Template</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description || 'No description'}
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Capacity</div>
                          <div className="font-bold">{template.template_capacity_hours}h</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Staff</div>
                          <div className="font-bold">{template.template_staff_count}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workload Analytics</CardTitle>
              <CardDescription>Coming soon: Charts and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics coming soon</h3>
                <p className="text-muted-foreground">
                  Visual charts and trend analysis will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workload;
