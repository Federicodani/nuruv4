import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator, MapPin, Home, BedDouble, Layers, ArrowRight,
  Users, ShoppingBag, FileText, AlertCircle, CheckCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { estimateCost, getEstimatorOptions } from '../../api/estimatorApi';
import { formatCurrency } from '../../utils/helpers';

const FINISH_LABELS = {
  basic: { label: 'Basic', desc: 'Essential finishes, functional quality' },
  standard: { label: 'Standard', desc: 'Mid-range finishes, good quality' },
  premium: { label: 'Premium', desc: 'High-end finishes, excellent quality' },
  luxury: { label: 'Luxury', desc: 'Top-tier finishes, architectural quality' },
};

const CostEstimatorPage = () => {
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
    setResult(null);

    if (!form.county || !form.houseType || !form.bedrooms || !form.finish) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await estimateCost(form);
      setResult(data.estimate);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ county: '', houseType: '', bedrooms: '', floorArea: '', finish: '' });
    setResult(null);
    setError('');
  };

  if (loadingOptions) return <LoadingSpinner fullPage label="Loading estimator..." />;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="border-b border-secondary-100 bg-secondary py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-secondary">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Build Cost Estimator</h1>
              <p className="mt-1 text-secondary-400">
                Get an approximate construction cost range for your project in Kenya
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

          {/* FORM */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-card">
              <h2 className="mb-5 text-lg font-bold text-secondary-900">Your Project Details</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* County */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <MapPin className="h-4 w-4 text-primary" /> County <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="county"
                    value={form.county}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select county</option>
                    {options.counties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* House Type */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <Home className="h-4 w-4 text-primary" /> House Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="houseType"
                    value={form.houseType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select type</option>
                    {options.houseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                    <BedDouble className="h-4 w-4 text-primary" /> Bedrooms <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select bedrooms</option>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Bedroom{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                {/* Floor Area */}
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
                    placeholder="e.g. 120 — auto-estimated if blank"
                    className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Finish Level */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondary-700">
                    Finish Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {options.finishLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => { handleChange({ target: { name: 'finish', value: level } }); }}
                        className={`rounded-lg border px-3 py-2.5 text-left text-xs transition-all ${
                          form.finish === level
                            ? 'border-primary bg-primary/10 text-primary-700'
                            : 'border-secondary-200 text-secondary-600 hover:border-secondary-400'
                        }`}
                      >
                        <span className="block font-semibold capitalize">{level}</span>
                        <span className="text-secondary-400">{FINISH_LABELS[level]?.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" isLoading={loading} fullWidth icon={Calculator}>
                  Calculate Estimate
                </Button>

                {result && (
                  <button type="button" onClick={reset} className="text-center text-sm text-secondary-400 hover:text-secondary-700">
                    Reset form
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* RESULT */}
          <div className="lg:col-span-3">
            {!result && !loading && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-secondary-200 bg-white p-10 text-center">
                <Calculator className="h-12 w-12 text-secondary-200" />
                <p className="mt-4 text-lg font-semibold text-secondary-400">
                  Fill in your project details
                </p>
                <p className="mt-1 text-sm text-secondary-400">
                  Your cost estimate will appear here
                </p>
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-secondary-100 bg-white">
                <LoadingSpinner label="Calculating estimate..." />
              </div>
            )}

            {result && !loading && (
              <div className="flex flex-col gap-5">
                {/* Main cost card */}
                <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-card">
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Estimate Generated
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-sm font-medium text-secondary-500">Estimated Construction Cost</p>
                    <p className="mt-2 text-4xl font-extrabold text-secondary-900">
                      {formatCurrency(result.minCost)}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-secondary-500">
                      — {formatCurrency(result.maxCost)}
                    </p>
                  </div>

                  {/* Summary grid */}
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-secondary-50 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-secondary-400">House Type</p>
                      <p className="font-semibold text-secondary-800">{result.houseType}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400">Floor Area</p>
                      <p className="font-semibold text-secondary-800">{result.floorArea} sqm</p>
                    </div>
                    <div>
                      <p className="text-secondary-400">Bedrooms</p>
                      <p className="font-semibold text-secondary-800">{result.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400">County</p>
                      <p className="font-semibold text-secondary-800">{result.county}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400">Finish</p>
                      <p className="font-semibold capitalize text-secondary-800">{result.finish}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400">Rate/sqm</p>
                      <p className="font-semibold text-secondary-800">
                        {formatCurrency(result.ratePerSqmMin)}–{formatCurrency(result.ratePerSqmMax)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p>
                    <strong>Disclaimer:</strong> This estimate is intended for planning purposes only.
                    Actual construction costs vary depending on design, labour, location, material
                    prices and professional quotations.
                  </p>
                </div>

                {/* CTAs */}
                <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-card">
                  <p className="mb-4 font-semibold text-secondary-900">Ready to build? Get started:</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to="/professionals" className="flex-1">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary-800">
                        <Users className="h-4 w-4" /> Find Professionals
                      </button>
                    </Link>
                    <Link to="/materials" className="flex-1">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary-200 py-3 text-sm font-semibold text-secondary-700 transition-colors hover:border-secondary-400">
                        <ShoppingBag className="h-4 w-4" /> Browse Hardware Stores
                      </button>
                    </Link>
                    <Link to="/material-estimator" className="flex-1">
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary/5">
                        <FileText className="h-4 w-4" /> Material Estimator
                        <ArrowRight className="h-3.5 w-3.5" />
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

export default CostEstimatorPage;
