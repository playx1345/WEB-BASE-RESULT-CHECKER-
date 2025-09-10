import { Button } from '@/components/ui/button';
import { School } from 'lucide-react';
export function SiteHeader() {
  return <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto bg-orange-300 px-[29px] py-[30px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <School className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground px-[2px] py-[2px] mx-[3px] my-[3px]">PLATEAU STATE POLYTECNIC BARKIN-LADI</h1>
              <p className="text-sm text-muted-foreground">TECHNOLOGY FOR INOVATION</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/auth">Login</a>
            </Button>
            <Button asChild size="sm">
              <a href="/auth">Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    </header>;
}