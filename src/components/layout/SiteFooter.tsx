import { School, Mail, Phone, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Institution Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <School className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">PSPBL</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Plateau State Polytechnic Barkin Ladi</p>
              <p>School of Information and Communication Technology</p>
              <p>Department of Computer Science</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Barkin Ladi, Plateau State, Nigeria</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+234 (0) XX XXXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@pspbl.edu.ng</span>
              </div>
            </div>
          </div>

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
    </footer>
  );
}