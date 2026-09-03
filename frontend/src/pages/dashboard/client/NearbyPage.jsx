import NearbyPanel from './NearbyPanel';

// Standalone route — reuses the NearbyPanel component directly.
const NearbyPage = () => (
  <div>
    <h1 className="mb-6 text-2xl font-bold text-secondary-900">Nearby Professionals & Stores</h1>
    <NearbyPanel />
  </div>
);

export default NearbyPage;
