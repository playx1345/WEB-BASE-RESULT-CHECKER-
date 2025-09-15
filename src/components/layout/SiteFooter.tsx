import { School, Mail, Phone, MapPin } from 'lucide-react';
export function SiteFooter() {
  return <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Institution Info */}
          

          {/* Contact Info */}
          

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Student Portal
              </a>
              <a href="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Check Results
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Academic Calendar
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Plateau State Polytechnic Barkin Ladi. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Building Future Tech Leaders - Excellence in Technical Education
          </p>
        </div>
      </div>
    </footer>;
}