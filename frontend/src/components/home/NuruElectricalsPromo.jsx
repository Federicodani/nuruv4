import { Link } from 'react-router-dom';
import { Zap, Sun, Camera, ShieldCheck, Cpu, Lock, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { getWhatsAppLink, WHATSAPP_MESSAGES } from '../../utils/helpers';

const SERVICES = [
  { name: 'House Wiring', icon: Zap },
  { name: 'Solar Installation', icon: Sun },
  { name: 'CCTV Installation', icon: Camera },
  { name: 'Electric Fence Installation', icon: ShieldCheck },
  { name: 'Generator Installation', icon: Cpu },
  { name: 'Access Control Systems', icon: Lock },
];

const NURU_WHATSAPP = '+254711000000';

const NuruElectricalsPromo = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary-800 py-16">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
            <Zap className="h-4 w-4" /> Recommended Partner
          </div>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-white sm:text-4xl">Nuru Electricals</h2>
        <p className="mt-3 max-w-2xl text-secondary-300">
          Kenya's trusted name in electrical installation and security systems. From house wiring
          to solar power and CCTV, Nuru Electricals delivers safe, professional, and reliable
          service every time.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICES.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-secondary-200">{name}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/nuru-electricals">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              View Services
            </Button>
          </Link>
          <a
            href={getWhatsAppLink(NURU_WHATSAPP, WHATSAPP_MESSAGES.quote)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
            >
              Request Quote
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default NuruElectricalsPromo;
