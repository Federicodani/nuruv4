import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Eye, Heart, MapPin, Briefcase, ChevronLeft, ChevronRight,
  Phone, MessageCircle, Share2, Bookmark, ArrowLeft,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/projects/ProjectCard';
import { getProjectById, likeProject } from '../../api/projectApi';
import { getWhatsAppLink, getCallLink, WHATSAPP_MESSAGES } from '../../utils/helpers';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [sharing, setSharing] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProjectById(id);
      setProject(data.project);
      setRelated(data.related || []);
      setLikeCount(data.project.likes || 0);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    setActiveImg(0);
    setLiked(false);
    window.scrollTo(0, 0);
  }, [fetchProject]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeCount((c) => c + 1);
    try {
      await likeProject(id);
    } catch {
      setLiked(false);
      setLikeCount((c) => c - 1);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: project?.title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setSharing(true);
      setTimeout(() => setSharing(false), 2000);
    }
  };

  const prevImage = () => setActiveImg((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setActiveImg((i) => (i < images.length - 1 ? i + 1 : 0));

  if (loading) return <LoadingSpinner fullPage label="Loading project..." />;

  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <p className="text-2xl font-bold text-secondary-900">Project not found</p>
        <Link to="/projects" className="mt-4 text-sm font-semibold text-primary-700 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const { title, description, category, county, images = [], views, professional, isFeatured } = project;
  const profUser = professional?.user;
  const phone = profUser?.phone;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-secondary-100 bg-secondary-50 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-700">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* LEFT: Image Gallery (2/3 width on lg) */}
          <div className="lg:col-span-2">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl bg-secondary-100">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]?.url}
                  alt={`${title} — photo ${activeImg + 1}`}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center text-secondary-300">
                  No images available
                </div>
              )}
              {/* Nav arrows (only if >1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {activeImg + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeImg ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-secondary-900">About this project</h2>
                <p className="mt-2 whitespace-pre-line text-secondary-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Details + CTA */}
          <div className="flex flex-col gap-5">
            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={isFeatured ? 'primary' : 'neutral'}>{category}</Badge>
              </div>
              <h1 className="mt-3 text-2xl font-bold text-secondary-900">{title}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-secondary-500">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{county}</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{views} views</span>
                <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{likeCount} likes</span>
              </div>
            </div>

            {/* Professional card */}
            {professional && (
              <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-400">Professional</p>
                <div className="flex items-center gap-3">
                  {professional.profileImage?.url ? (
                    <img
                      src={professional.profileImage.url}
                      alt={profUser?.fullName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                      {profUser?.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-secondary-900">{profUser?.fullName}</p>
                    <p className="flex items-center gap-1 text-sm text-secondary-500">
                      <Briefcase className="h-3.5 w-3.5" />{professional.profession}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/professionals/${professional._id}`}
                  className="mt-3 block text-center rounded-lg border border-secondary-200 py-2 text-sm font-semibold text-secondary-700 transition-colors hover:border-primary hover:text-primary-700"
                >
                  View Full Profile
                </Link>
              </div>
            )}

            {/* CTA section */}
            <div className="rounded-xl border border-secondary-100 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-secondary-900">Need similar work?</p>
              <div className="flex flex-col gap-2">
                {phone && (
                  <a href={getCallLink(phone)}>
                    <Button variant="secondary" fullWidth icon={Phone}>
                      Call Professional
                    </Button>
                  </a>
                )}
                {phone && (
                  <a
                    href={getWhatsAppLink(phone, WHATSAPP_MESSAGES.professional)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="whatsapp" fullWidth icon={MessageCircle}>
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Like + Share */}
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                  liked
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-secondary-200 text-secondary-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liked!' : 'Like'}
              </button>
              <button
                onClick={handleShare}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-secondary-200 py-2.5 text-sm font-semibold text-secondary-600 transition-all hover:border-secondary-400 hover:text-secondary-800"
              >
                <Share2 className="h-4 w-4" />
                {sharing ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-secondary-900">Related Projects</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((proj) => (
                <ProjectCard key={proj._id} project={proj} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
