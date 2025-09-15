import { School, Mail, Phone, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">INFORMATION</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className="block hover:text-white transition-colors">Research</a>
              <a href="#" className="block hover:text-white transition-colors">Vacancy</a>
              <a href="#" className="block hover:text-white transition-colors">Security & Safety</a>
              <a href="#" className="block hover:text-white transition-colors">Library</a>
              <a href="#" className="block hover:text-white transition-colors">Bursary</a>
              <a href="#" className="block hover:text-white transition-colors">ICT Directorate</a>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">LINKS</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <a href="#" className="block hover:text-white transition-colors">Students</a>
              <a href="#" className="block hover:text-white transition-colors">Staff</a>
              <a href="#" className="block hover:text-white transition-colors">Medical Services</a>
              <a href="#" className="block hover:text-white transition-colors">Plapoly Consultancy Services</a>
              <a href="#" className="block hover:text-white transition-colors">Photo Gallery</a>
              <a href="#" className="block hover:text-white transition-colors">Video Gallery</a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">CONTACT</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="text-yellow-400 font-medium">Main Campus</p>
              <p>Hiepang, Barkin Ladi LGA, Plateau State</p>
              <p>Phone: 09017177834</p>
              <p>Email: info@plapoly.com.ng</p>
            </div>
          </div>

          {/* Jos Campus Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-yellow-400 text-lg">Jos Campus</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Beside National Library, Hwolshe, Jos, Plateau State.</p>
              <p>Phone: 09017177834</p>
              <p>Email: joscampus@plapoly.com.ng</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} All Right Reserved | Powered by: <span className="text-yellow-400">Plateau State Polytechnic, ICT Directorate</span>
          </p>
        </div>
      </div>
    </footer>
  );
}