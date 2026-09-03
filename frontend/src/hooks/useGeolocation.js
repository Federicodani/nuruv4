import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);       // { lat, lng }
  const [status, setStatus] = useState('idle');     // idle | requesting | granted | denied | error
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location access was denied. Enable location permissions to see nearby results.');
        } else {
          setStatus('error');
          setError('Could not determine your location. Please try again.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { coords, status, error, requestLocation };
};

export default useGeolocation;
