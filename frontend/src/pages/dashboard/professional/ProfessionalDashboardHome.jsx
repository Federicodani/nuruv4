import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Images, Eye, MapPin, Heart, LayoutGrid, TrendingUp } from 'lucide-react';
import StatCard from '../../../components/dashboard/StatCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';
import { getMyProfessionalProfile } from '../../../api/professionalApi';
import { getMyProjectStats } from '../../../api/projectApi';

const ProfessionalDashboardHome = () => {
  const [profile, setProfile] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfessionalProfile().then(({ data }) => data.professional),
      getMyProjectStats().then(({ data }) => data.stats).catch(() => null),
    ])
      .then(([prof, stats]) => {
        setProfile(prof);
        setProjectStats(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage label="Loading your dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900">
        Welcome back, {profile?.user?.fullName?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-secondary-500">Here's an overview of your professional profile.</p>

      {/* Profile stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Star} label="Average Rating" value={profile?.averageRating || 0} accent />
        <StatCard icon={Images} label="Portfolio Images" value={profile?.portfolio?.length || 0} />
        <StatCard icon={Eye} label="Reviews" value={profile?.reviews?.length || 0} />
      </div>

      {/* Project stats */}
      {projectStats !== null && (
        <>
          <h2 className="mt-8 text-base font-semibold text-secondary-700">Project Statistics</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={LayoutGrid} label="Projects Uploaded" value={projectStats.totalProjects || 0} />
            <StatCard icon={Eye} label="Project Views" value={projectStats.totalViews || 0} />
            <StatCard icon={Heart} label="Project Likes" value={projectStats.totalLikes || 0} />
            <div className="flex items-center gap-4 rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-secondary-900 truncate">
                  {projectStats.mostViewedProject?.views || 0}
                </p>
                <p className="text-sm text-secondary-500 truncate">
                  {projectStats.mostViewedProject
                    ? `"${projectStats.mostViewedProject.title}"`
                    : 'Most Viewed Project'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile summary card */}
      <div className="mt-8 rounded-xl border border-secondary-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-secondary-900">Profile Summary</h2>
        <div className="mt-3 space-y-1.5 text-sm text-secondary-600">
          <p><strong>Profession:</strong> {profile?.profession}</p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {profile?.town}, {profile?.county}
          </p>
          <p><strong>Experience:</strong> {profile?.yearsOfExperience || 0} years</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboard/professional/profile">
            <Button variant="primary" size="sm">Edit Profile</Button>
          </Link>
          <Link to="/dashboard/professional/projects">
            <Button variant="outline" size="sm">My Projects</Button>
          </Link>
          <Link to={`/professionals/${profile?._id}`} target="_blank">
            <Button variant="ghost" size="sm">View Public Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboardHome;
