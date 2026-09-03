import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, MapPin, Home, BedDouble, Layers, AlertCircle,
  CheckCircle, Users, ShoppingBag,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { estimateMaterials, getEstimatorOptions } from '../../api/estimatorApi';

const MATERIAL_ITEMS = [
  {
    key: 'cementBags',
    label: 'Cement Bags (50kg)',
    unit: 'bags',
    icon: '🏗️',
    hint: 'Foundation, slab, mortar & plaster',
  },
  {
    key: 'sandTonnes',
    label: 'Sand',
    unit: 'tonnes',
    icon: '⛏️',
    hint: 'River sand for mortar, plaster & screed',
  },
  {
    key: 'ballastTonnes',
    label: 'Ballast / Aggregate',
    unit: 'tonnes',
    icon: '🪨',
    hint: 'Concrete aggregate for foundations & slabs',
  },
  {
    key: 'roofArea',
    label: 'Roof Area',
    unit: 'sqm',
    icon: '🏠',
    hint: 'Includes pitch and eaves overhang (~30% over floor area)',
  },
  {
    key: 'roofingSheets',
    label: 'Roofing Sheets',
    unit: 'sheets',
    icon: '🔩',
    hint: 'Iron sheets (standard gauge, effective 0.6m width)',
  },
  {
    key: 'paintLitres',
    label: 'Paint',
    unit: 'litres',
    icon: '🎨',
    hint: '2 coats — interior walls, ceilings & exterior',
  },
  {
    key: 'tiledAreaSqm',
    label: 'Floor Tiles',
    unit: 'sqm',
    icon: '⬛',
    hint: 'Tiled area based on finish level (bathrooms, kitchen, living)',
  },
];

const FINISH_LABELS = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  luxury: 'Luxury',
};

const MaterialEstimatorPage = () => {
  const [options, setOptions] = useState({ houseTypes: [], finishLevels: [], counties: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    county: '',
    houseType: '',
    bedrooms: '',
    floorArea: '',
    finish: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEstimatorOptions()
      .then(({ data }) => setOptions(data))
      .catch(() => {})
      .finally(() => setLoadingOptions(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.county || !form.houseType || !form.bedrooms || !form.finish) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await estimateMaterials(form);
      setResult(data.materials);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) return <LoadingSpinner fullPage label="Loading estimator..." />;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="border-b border-secondary-100 bg-secondary py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-secondary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Material Estimator</h1>
              <p className="mt-1 text-secondary-400">
                Approximate material quantities for your construction project
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

          {/* FORM */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-card">
              <h2 className="mb-5 text-lg font-bold text-secondary-900">Project Details</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <MapPin className="h-4 w-4 text-primary" /> County <span className="text-red-500">*</span>
                  </label>
                  <select name="county" value={form.county} onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select county</option>
                    {options.counties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <Home className="h-4 w-4 text-primary" /> House Type <span className="text-red-500">*</span>
                  </label>
                  <select name="houseType" value={form.houseType} onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select type</option>
                    {options.houseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <BedDouble className="h-4 w-4 text-primary" /> Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <select name="bedrooms" value={form.bedrooms} onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select bedrooms</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <Layers className="h-4 w-4 text-primary" /> Floor Area (sqm)
                    <span className="ml-1 text-xs text-secondary-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="floorArea"
                    value={form.floorArea}
                    onChange={handleChange}
                    min="20"
                    max="5000"
                    placeholder="Auto-estimated if blank"
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-secondary-700">
                    Finish Level <span className="text-red-500">*</span>
                  </label>
                  <select name="finish" value={form.finish} onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select finish</option>
                    {options.finishLevels.map((l) => (
                      <option key={l} value={l}>{FINISH_LABELS[l]}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-secondary transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  Estimate Materials
                </button>
              </form>
            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-secondary-200 bg-white p-10 text-center">
                <Package className="h-12 w-12 text-secondary-200" />
                <p className="mt-4 text-lg font-semibold text-secondary-400">
                  Fill in project details
                </p>
                <p className="mt-1 text-sm text-secondary-400">
                  Material estimates will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-secondary-100 bg-white">
                <LoadingSpinner label="Calculating quantities..." />
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col gap-4">
                {/* Summary tag */}
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Estimates for {result.houseType} — {result.floorArea} sqm — {result.county}
                </div>

                {/* Material cards grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {MATERIAL_ITEMS.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-start gap-4 rounded-xl border border-secondary-100 bg-white p-4 shadow-card"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-2xl font-extrabold text-secondary-900">
                          {Number(result[item.key]).toLocaleString()}
                          <span className="ml-1 text-sm font-medium text-secondary-500">
                            {item.unit}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-secondary-400">{item.hint}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p>
                    <strong>Disclaimer:</strong> Material quantities are approximate estimates and
                    should be verified by a Quantity Surveyor or Engineer before construction.
                    Allowances for wastage (5–10%) should be added when ordering.
                  </p>
                </div>

                {/* CTAs */}
                <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-card">
                  <p className="mb-4 font-semibold text-secondary-900">
                    Find what you need:
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to="/materials" className="flex-1">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary-800">
                        <ShoppingBag className="h-4 w-4" /> Find Suppliers
                      </button>
                    </Link>
                    <Link to="/professionals?profession=Quantity Surveyor" className="flex-1">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary-200 py-3 text-sm font-semibold text-secondary-700 transition-colors hover:border-secondary-400">
                        <Users className="h-4 w-4" /> Find Professionals
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialEstimatorPage;
