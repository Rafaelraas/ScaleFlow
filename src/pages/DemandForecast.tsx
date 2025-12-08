import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import {
  getDemandForecasts,
  getDemandForecastSummary,
  getHighPriorityForecasts,
  generateAutoForecasts,
} from '@/api/demand';
import { DemandForecast } from '@/types/database';
import { showError, showSuccess } from '@/utils/toast';
import { format, addDays, subDays } from 'date-fns';

const DemandForecastPage = () => {
  const { userProfile } = useSession();
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [highPriorityForecasts, setHighPriorityForecasts] = useState<DemandForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState({
    avgPredictedHours: 0,
    avgPredictedStaff: 0,
    avgConfidence: 0,
    criticalDays: 0,
    highPriorityDays: 0,
    weekendDays: 0,
    holidayDays: 0,
  });

  const loadForecastData = useCallback(async () => {
    if (!userProfile?.company_id) return;

    setIsLoading(true);
    try {
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate = format(addDays(today, 30), 'yyyy-MM-dd');

      const [forecastsData, summaryData, highPriorityData] = await Promise.all([
        getDemandForecasts(userProfile.company_id, startDate, endDate),
        getDemandForecastSummary(userProfile.company_id, startDate, endDate),
        getHighPriorityForecasts(userProfile.company_id, startDate, endDate),
      ]);

      setForecasts(forecastsData);
      setSummary(summaryData);
      setHighPriorityForecasts(highPriorityData);
    } catch (error) {
      console.error('Failed to load forecast data:', error);
      showError('Failed to load forecast data');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.company_id]);

  useEffect(() => {
    if (userProfile?.company_id) {
      loadForecastData();
    }
  }, [userProfile?.company_id, loadForecastData]);

  const handleGenerateForecasts = async () => {
    if (!userProfile?.company_id) return;

    setIsGenerating(true);
    try {
      const count = await generateAutoForecasts(userProfile.company_id, 14);
      showSuccess(`Generated ${count} forecasts for the next 2 weeks`);
      await loadForecastData();
    } catch (error) {
      console.error('Failed to generate forecasts:', error);
      showError('Failed to generate forecasts');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
      <Badge className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading demand forecasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand Forecasting</h1>
          <p className="text-muted-foreground mt-2">Predict staffing needs and plan ahead</p>
        </div>
        <Button onClick={handleGenerateForecasts} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Forecasts
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Predicted Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgPredictedHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.avgPredictedStaff.toFixed(1)} staff per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConfidenceColor(summary.avgConfidence)}`}>
              {(summary.avgConfidence * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Forecast accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Days</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.highPriorityDays + summary.criticalDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{summary.criticalDays} critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Special Days</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.weekendDays + summary.holidayDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.holidayDays} holidays, {summary.weekendDays} weekends
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Forecasts</TabsTrigger>
          <TabsTrigger value="priority">High Priority</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Demand Forecasts</CardTitle>
              <CardDescription>Next 30 days staffing predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {forecasts.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No forecasts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate automatic forecasts based on historical data
                  </p>
                  <Button onClick={handleGenerateForecasts}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {forecasts.map((forecast) => (
                    <div
                      key={forecast.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {format(new Date(forecast.forecast_date), 'EEEE, MMM dd, yyyy')}
                          </div>
                          {getPriorityBadge(forecast.recommendation_priority)}
                          {forecast.is_weekend && <Badge variant="outline">Weekend</Badge>}
                          {forecast.is_holiday && <Badge variant="outline">Holiday</Badge>}
                        </div>
                        {forecast.recommended_action && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {forecast.recommended_action}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground">Predicted Hours</div>
                          <div className="font-bold">
                            {forecast.predicted_demand_hours.toFixed(0)}h
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Staff Needed</div>
                          <div className="font-bold">{forecast.predicted_staff_count}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Confidence</div>
                          <div
                            className={`font-bold ${getConfidenceColor(forecast.confidence_level)}`}
                          >
                            {(forecast.confidence_level * 100).toFixed(0)}%
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

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Forecasts</CardTitle>
              <CardDescription>Days requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {highPriorityForecasts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All clear!</h3>
                  <p className="text-muted-foreground">
                    No high priority staffing issues in the forecast period
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {highPriorityForecasts.map((forecast) => (
                    <div
                      key={forecast.id}
                      className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950 dark:border-orange-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <div className="font-medium">
                            {format(new Date(forecast.forecast_date), 'EEEE, MMM dd, yyyy')}
                          </div>
                          {getPriorityBadge(forecast.recommendation_priority)}
                        </div>
                        <div className="text-sm mt-2">
                          {forecast.recommended_action || 'Requires immediate staffing attention'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{forecast.predicted_staff_count}</div>
                        <div className="text-sm text-muted-foreground">staff needed</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Insights</CardTitle>
              <CardDescription>Coming soon: AI-powered recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Insights coming soon</h3>
                <p className="text-muted-foreground">
                  AI-powered staffing recommendations will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DemandForecastPage;
