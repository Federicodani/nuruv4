import { useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import Button from '../../../components/common/Button';
import useGeolocation from '../../../hooks/useGeolocation';
import { updateProfessionalLocation } from '../../../api/locationApi';

const ProfessionalLocationPage = () => {
  const { coords, status, error: geoError, requestLocation } = useGeolocation();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    if (!coords) return;
    setSaving(true); setSaved(false); setSaveError('');
    try {
      await updateProfessionalLocation(coords.lat, coords.lng);
      setSaved(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save location.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-secondary-900">My Location</h1>
      <p className="mt-1 text-secondary-500">
        Set your location so clients can discover you in nearby searches.
        Your exact coordinates are never shown publicly — only your distance from the client.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-secondary-200 bg-secondary-50 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Enable Location</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Use your device's GPS to set your current location.
              </p>
            </div>
            <Button icon={MapPin} onClick={requestLocation}>Detect My Location</Button>
          </div>
        )}

        {status === 'requesting' && (
          <div className="rounded-xl border border-secondary-100 bg-white p-6 text-center shadow-card">
            <p className="text-secondary-600">Requesting location access...</p>
          </div>
        )}

        {(status === 'denied' || status === 'error') && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <p className="font-medium text-yellow-800">Location access required</p>
            <p className="mt-1 text-sm text-yellow-700">{geoError}</p>
            <Button variant="outline" size="sm" onClick={requestLocation} className="mt-3">
              Try Again
            </Button>
          </div>
        )}

        {status === 'granted' && coords && (
          <div className="rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Location detected</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary-400">Latitude</p>
                <p className="font-mono text-sm font-medium text-secondary-900">{coords.lat.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-400">Longitude</p>
                <p className="font-mono text-sm font-medium text-secondary-900">{coords.lng.toFixed(6)}</p>
              </div>
            </div>

            {saveError && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
            )}
            {saved && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" /> Location saved. You will now appear in nearby searches.
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <Button onClick={requestLocation} variant="outline" size="sm" icon={Navigation}>
                Re-detect
              </Button>
              <Button onClick={handleSave} isLoading={saving} size="sm" icon={MapPin}>
                Save My Location
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 text-sm text-secondary-500">
          <strong className="text-secondary-700">Privacy note:</strong> Your exact GPS coordinates are stored securely
          and used only to calculate your approximate distance from clients. Clients see only your distance
          (e.g. "3.2 km away"), not your precise location.
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLocationPage;
