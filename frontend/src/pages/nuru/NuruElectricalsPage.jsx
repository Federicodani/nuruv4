import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Zap, Sun, Camera, ShieldCheck, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { getProfessionals } from '../../api/professionalApi';
import { getWhatsAppLink, getCallLink, WHATSAPP_MESSAGES } from '../../utils/helpers';

const SERVICES = [
  {
    name: 'House Wiring',
    icon: Zap,
    description: 'Safe, code-compliant electrical wiring for new builds and renovations.',
  },
  {
    name: 'Solar Installation',
    icon: Sun,
    description: 'Reliable solar power systems for homes and businesses.',
  },
  {
    name: 'CCTV Installation',
    icon: Camera,
    description: 'Professional surveillance camera setup for total peace of mind.',
  },
  {
    name: 'Electric Fence Installation',
    icon: ShieldCheck,
    description: 'Perimeter security fencing to keep your property protected.',
  },
  {
    name: 'Generator Installation',
    icon: Cpu,
    description: 'Backup power solutions installed and configured correctly.',
  },
  {
    name: 'Access Control Systems',
    icon: Lock,
    description: 'Smart entry systems for residential and commercial properties.',
  },
];

const NURU_PHONE = '+254792848201';
const NURU_WHATSAPP = '+254792848201';

const NuruElectricalsPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await getProfessionals({ search: 'GLEC Electricals' });
        const nuruProfile = data.professionals.find((p) => p.isNuruElectricals);
        setPortfolio(nuruProfile?.portfolio || []);
      } catch {
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <div>
      {/* Company Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary-800 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
            <Zap className="h-4 w-4" /> Official Partner
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-5xl">GLEC Electricals</h1>
          <p className="mx-auto mt-4 max-w-2xl text-secondary-300">
            Kenya's trusted name in electrical installation and security systems for homes and
            businesses. Licensed, experienced, and committed to safety on every job.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={getCallLink(NURU_PHONE)}>
              <Button variant="primary" size="lg" icon={Phone}>
                Call Now
              </Button>
            </a>
            <a href={getWhatsAppLink(NURU_WHATSAPP, WHATSAPP_MESSAGES.quote)} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                icon={MessageCircle}
              >
                Request Quote
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">About GLEC Electricals</h2>
            <p className="mt-4 text-secondary-600 leading-relaxed">
              With over a decade of experience, GLEC Electricals has built a reputation as one of
              the most reliable electrical service providers in Kenya. We combine technical
              expertise with a commitment to customer satisfaction, ensuring every installation is
              done right the first time.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'Licensed and experienced electricians',
              'Transparent, upfront pricing',
              'Fast response times across the region',
              'Full warranty on all installations',
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm text-secondary-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-secondary-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-secondary-900 sm:text-3xl">
            Our Services
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ name, icon: Icon, description }) => (
              <div
                key={name}
                className="rounded-xl border border-secondary-100 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary-700" />
                </div>
                <h3 className="mt-4 font-semibold text-secondary-900">{name}</h3>
                <p className="mt-1.5 text-sm text-secondary-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl">Our Work</h2>
        {loading ? (
          <LoadingSpinner label="Loading portfolio..." />
        ) : portfolio.length === 0 ? (
          <p className="mt-4 text-sm text-secondary-400">
            Portfolio images coming soon. Check back to see our latest installations.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {portfolio.map((img) => (
              <div key={img._id} className="aspect-square overflow-hidden rounded-xl bg-secondary-50">
                <img src={img.url} alt={img.caption || 'GLEC Electricals work'} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to get started?</h2>
          <p className="mt-3 text-secondary-300">
            Contact GLEC Electricals today for a free, no-obligation quote on your project.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={getCallLink(NURU_PHONE)}>
              <Button variant="primary" size="lg" icon={Phone}>
                Call {NURU_PHONE}
              </Button>
            </a>
            <a href={getWhatsAppLink(NURU_WHATSAPP, WHATSAPP_MESSAGES.quote)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="lg" icon={MessageCircle}>
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NuruElectricalsPage;
