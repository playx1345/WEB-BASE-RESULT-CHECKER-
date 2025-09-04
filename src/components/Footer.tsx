import { School, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <School className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-bold text-lg">Plateau State Polytechnic</h3>
                <p className="text-sm text-muted-foreground">Barkin Ladi</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              School of Information and Communication Technology<br />
              Department of Computer Science
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Information</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Barkin Ladi, Plateau State, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+234 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@plateaupolytechnic.edu.ng</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Student Portal</p>
              <p>• Academic Calendar</p>
              <p>• Fee Payment</p>
              <p>• Support Center</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Plateau State Polytechnic Barkin Ladi. All rights reserved.</p>
          <p className="mt-1">Online Result Checker System - Department of Computer Science</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;