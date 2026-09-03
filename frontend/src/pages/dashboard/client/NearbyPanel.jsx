import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Navigation, Store as StoreIcon, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import useGeolocation from '../../../hooks/useGeolocation';
import { getNearbyProfessionals, getNearbyStores } from '../../../api/locationApi';
import { getInitials } from '../../../utils/helpers';

const NearbyPanel = () => {
  const { coords, status, error: geoError, requestLocation } = useGeolocation();
  const [professionals, setProfessionals] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    if (status === 'granted' && coords) {
      fetchNearby(coords.lat, coords.lng, activeFilter);
    }
  }, [coords, status, activeFilter]);

  const fetchNearby = async (lat, lng, profession = '') => {
    setLoading(true); setFetchError('');
    try {
      const params = { radius: 30, limit: 8 };
      if (profession) params.profession = profession;
      const [prosRes, storesRes] = await Promise.all([
        getNearbyProfessionals(lat, lng, params),
        getNearbyStores(lat, lng, { radius: 30, limit: 6 }),
      ]);
      setProfessionals(prosRes.data.professionals || []);
      setStores(storesRes.data.stores || []);
    } catch {
      setFetchError('Could not fetch nearby results. Please try again.');
    } finally { setLoading(false); }
  };

  // Prompt state
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-secondary-200 bg-secondary-50 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Navigation className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-secondary-900">Find Nearby Professionals & Stores</h3>
          <p className="mt-1 max-w-sm text-sm text-secondary-500">
            Allow Nuru Construction Hub to use your location to find nearby professionals and construction suppliers.
          </p>
        </div>
        <Button icon={MapPin} onClick={requestLocation}>Allow Location Access</Button>
      </div>
    );
  }

  if (status === 'requesting') {
    return <LoadingSpinner label="Requesting location access..." />;
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center">
        <p className="font-medium text-yellow-800">Location access required</p>
        <p className="mt-1 text-sm text-yellow-700">
          {geoError || 'Please enable location permissions in your browser settings.'}
        </p>
        <p className="mt-2 text-sm text-secondary-500">
          You can still find professionals by browsing the <Link to="/professionals" className="underline">Professionals page</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-secondary-600">Filter by:</span>
        {['', 'Electrician', 'Plumber', 'Contractor', 'Architect'].map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeFilter === f ? 'bg-primary text-secondary' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}>
            {f || 'All Professions'}
          </button>
        ))}
        {coords && (
          <button onClick={() => fetchNearby(coords.lat, coords.lng, activeFilter)}
            className="ml-auto flex items-center gap-1 text-xs text-secondary-400 hover:text-secondary-700">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        )}
      </div>

      {fetchError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{fetchError}</div>
      )}

      {loading ? (
        <LoadingSpinner label="Finding nearby results..." />
      ) : (
        <>
          {/* Nearby Professionals */}
          <div>
            <h2 className="mb-4 font-semibold text-secondary-900">
              Nearby Professionals {professionals.length > 0 && `(${professionals.length})`}
            </h2>
            {professionals.length === 0 ? (
              <EmptyState icon={MapPin} title="No professionals found nearby"
                description="Try increasing the search radius or browse all professionals."
                action={<Link to="/professionals"><Button variant="outline" size="sm">Browse All</Button></Link>} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {professionals.map((pro) => (
                  <Link key={pro._id} to={`/professionals/${pro._id}`}
                    className="flex items-start gap-3 rounded-xl border border-secondary-100 bg-white p-4 shadow-card transition-all hover:shadow-card-hover">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                      {pro.profileImage?.url
                        ? <img src={pro.profileImage.url} alt="" className="h-full w-full rounded-full object-cover" />
                        : getInitials(pro.user?.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-secondary-900">{pro.user?.fullName}</p>
                      <p className="text-xs text-secondary-500">{pro.profession}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-secondary-400">
                        <span className="flex items-center gap-0.5 font-medium text-primary-700">
                          <MapPin className="h-3 w-3" /> {pro.distanceKm} km away
                        </span>
                        {pro.averageRating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-primary" /> {pro.averageRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Stores */}
          <div>
            <h2 className="mb-4 font-semibold text-secondary-900">
              Nearby Construction Stores {stores.length > 0 && `(${stores.length})`}
            </h2>
            {stores.length === 0 ? (
              <EmptyState icon={StoreIcon} title="No stores found nearby"
                description="Browse all available stores in the materials marketplace."
                action={<Link to="/materials"><Button variant="outline" size="sm">Browse Materials</Button></Link>} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {stores.map((store) => (
                  <Link key={store._id} to={`/stores/${store._id}`}
                    className="flex items-start gap-3 rounded-xl border border-secondary-100 bg-white p-4 shadow-card transition-all hover:shadow-card-hover">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-sm font-bold text-white">
                      {store.logo?.url
                        ? <img src={store.logo.url} alt="" className="h-full w-full object-cover" />
                        : getInitials(store.storeName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-secondary-900">{store.storeName}</p>
                        {store.isNuruElectricals && <Badge variant="primary">Recommended</Badge>}
                      </div>
                      <p className="text-xs text-secondary-500">{store.town}, {store.county}</p>
                      <span className="mt-1 flex items-center gap-0.5 text-xs font-medium text-primary-700">
                        <MapPin className="h-3 w-3" /> {store.distanceKm} km away
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyPanel;
