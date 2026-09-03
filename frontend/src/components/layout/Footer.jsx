import { Link } from 'react-router-dom';
import { HardHat, Phone, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-secondary-100 bg-secondary text-secondary-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <HardHat className="h-5 w-5 text-secondary" />
              </div>
              <span className="text-lg font-bold text-white">
                Nuru<span className="text-primary">Hub</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-secondary-400">
              Connecting clients with trusted construction professionals and quality materials, all in one place.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/professionals" className="hover:text-primary">Find Professionals</Link></li>
              <li><Link to="/materials" className="hover:text-primary">Browse Materials</Link></li>
              <li><Link to="/projects" className="hover:text-primary">Construction Projects</Link></li>
              <li><Link to="/jobs" className="hover:text-primary">Post a Job</Link></li>
              <li><Link to="/nuru-electricals" className="hover:text-primary">Nuru Electricals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Planning Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cost-estimator" className="hover:text-primary">Build Cost Estimator</Link></li>
              <li><Link to="/material-estimator" className="hover:text-primary">Material Estimator</Link></li>
              <li><Link to="/register" className="hover:text-primary">Join as a Professional</Link></li>
              <li><Link to="/register" className="hover:text-primary">Register Your Store</Link></li>
              <li><Link to="/login" className="hover:text-primary">Login to Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +254 791670926
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> infofedantechnologies@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-secondary-800 pt-6 text-center text-xs text-secondary-500">
          &copy; {year} Nuru Construction Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
