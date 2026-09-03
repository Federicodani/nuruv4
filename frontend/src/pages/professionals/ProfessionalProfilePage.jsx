import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Briefcase, Calendar, Star } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import { getProfessionalById, addReview } from '../../api/professionalApi';
import { useAuth } from '../../context/AuthContext';
import {
  getWhatsAppLink,
  getCallLink,
  getInitials,
  formatDate,
  WHATSAPP_MESSAGES,
} from '../../utils/helpers';

const ProfessionalProfilePage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProfessional = async () => {
      setLoading(true);
      try {
        const { data } = await getProfessionalById(id);
        setProfessional(data.professional);
      } catch {
        setError('Professional not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await addReview(id, reviewForm);
      setProfessional(data.professional);
      setReviewForm({ rating: 5, comment: '' });
    } catch {
      // silently ignore for now, could add inline alert
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage label="Loading profile..." />;
  if (error || !professional) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Not Found" description={error || 'This profile does not exist.'} />
      </div>
    );
  }

  const { user, profession, bio, yearsOfExperience, county, town, coverImage, profileImage, portfolio, reviews, averageRating, whatsappNumber, isNuruElectricals } = professional;
  const phone = user?.phone;

  return (
    <div>
      {/* Cover Photo */}
      <div className="relative h-48 w-full bg-secondary-200 sm:h-64">
        {coverImage?.url ? (
          <img src={coverImage.url} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-secondary-700" />
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-secondary shadow-lg">
            {profileImage?.url ? (
              <img src={profileImage.url} alt={user?.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{getInitials(user?.fullName)}</span>
            )}
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-secondary-900">{user?.fullName}</h1>
              {isNuruElectricals && <Badge variant="primary">Recommended Partner</Badge>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-secondary-500">
              <Briefcase className="h-4 w-4" /> {profession}
            </p>
          </div>

          <div className="flex w-full gap-2 pb-2 sm:w-auto">
            <a href={getCallLink(phone)} className="flex-1 sm:flex-none">
              <Button variant="outline" icon={Phone} fullWidth>
                Call Now
              </Button>
            </a>
            <a
              href={getWhatsAppLink(whatsappNumber || phone, WHATSAPP_MESSAGES.professional)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button variant="whatsapp" icon={MessageCircle} fullWidth>
                WhatsApp
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
              <h2 className="font-semibold text-secondary-900">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary-600">
                {bio || 'This professional has not added a bio yet.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> {town}, {county}
                </span>
                {yearsOfExperience > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> {yearsOfExperience} years of experience
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary" /> {averageRating > 0 ? `${averageRating} rating` : 'No ratings yet'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
              <h2 className="font-semibold text-secondary-900">Portfolio</h2>
              {portfolio && portfolio.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {portfolio.map((img) => (
                    <div key={img._id} className="aspect-square overflow-hidden rounded-lg bg-secondary-50">
                      <img src={img.url} alt={img.caption || 'Portfolio'} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-secondary-400">No portfolio images yet.</p>
              )}
            </div>

            <div className="rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-secondary-900">Reviews ({reviews?.length || 0})</h2>
                <RatingStars rating={averageRating} />
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {reviews.slice().reverse().map((r) => (
                    <div key={r._id} className="border-b border-secondary-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-secondary-900">{r.reviewerName}</span>
                        <RatingStars rating={r.rating} showNumber={false} />
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-secondary-600">{r.comment}</p>}
                      <span className="text-xs text-secondary-400">{formatDate(r.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-secondary-400">No reviews yet. Be the first to leave one.</p>
              )}

              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-3 border-t border-secondary-100 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-secondary-700">Your rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= reviewForm.rating ? 'fill-primary text-primary' : 'fill-secondary-200 text-secondary-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    className="w-full rounded-lg border border-secondary-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={submittingReview}>
                    Submit Review
                  </Button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-secondary-400">
                  <Link to="/login" className="font-medium text-primary-700 hover:underline">
                    Login
                  </Link>{' '}
                  to leave a review.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
              <h3 className="font-semibold text-secondary-900">Contact Information</h3>
              <div className="mt-3 space-y-2 text-sm text-secondary-600">
                <p>Phone: {phone}</p>
                {whatsappNumber && <p>WhatsApp: {whatsappNumber}</p>}
                <p>Location: {town}, {county}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12" />
    </div>
  );
};

export default ProfessionalProfilePage;
