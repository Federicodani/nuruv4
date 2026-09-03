import { useNavigate } from 'react-router-dom';
import {
  Building2, HardHat, Hammer, Wrench, Zap, Sun, Droplet, Paintbrush,
  Grid3x3, ClipboardList, Home as HomeIcon, Sofa, Calculator, Camera,
  ShoppingBag, Plug,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Architect', icon: Building2 },
  { name: 'Contractor', icon: HardHat },
  { name: 'Mason', icon: Hammer },
  { name: 'Carpenter', icon: Wrench },
  { name: 'Welder', icon: Zap },
  { name: 'Electrician', icon: Plug },
  { name: 'Solar Technician', icon: Sun },
  { name: 'Plumber', icon: Droplet },
  { name: 'Painter', icon: Paintbrush },
  { name: 'Tiler', icon: Grid3x3 },
  { name: 'Project Manager', icon: ClipboardList },
  { name: 'Roofing Contractor', icon: HomeIcon },
  { name: 'Interior Designer', icon: Sofa },
  { name: 'Quantity Surveyor', icon: Calculator },
  { name: 'CCTV & Security Installer', icon: Camera },
  { name: 'Hardware / Materials Supplier', icon: ShoppingBag },
  { name: 'Electrical Supplier', icon: Zap },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Browse by Category</h2>
        <p className="mt-2 text-secondary-500">
          Explore all the professional categories available on Nuru Hub
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => navigate(`/professionals?profession=${encodeURIComponent(name)}`)}
            className="group flex flex-col items-center gap-3 rounded-xl border border-secondary-100 bg-white p-5 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
              <Icon className="h-6 w-6 text-primary-700 transition-colors group-hover:text-secondary" />
            </div>
            <span className="text-sm font-medium text-secondary-700">{name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
