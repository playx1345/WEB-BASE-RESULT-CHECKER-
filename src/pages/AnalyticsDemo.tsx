import { AdminAnalyticsView } from '@/components/admin/views/AdminAnalyticsView';

export function AnalyticsDemo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics Demo</h1>
              <p className="text-muted-foreground">Result Analytics and Visualization Feature Preview</p>
            </div>
            <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
              Demo Mode - Sample Data
            </div>
          </div>
        </div>
      </header>
      <AdminAnalyticsView />
    </div>
  );
}