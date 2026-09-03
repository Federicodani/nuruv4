import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import ProjectCard from '../../components/projects/ProjectCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { getProjects } from '../../api/projectApi';
import { getConstants } from '../../api/searchApi';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [profession, setProfession] = useState('');
  const [sort, setSort] = useState('newest');

  const [categories, setCategories] = useState([]);
  const [counties, setCounties] = useState([]);
  const [professions, setProfessions] = useState([]);

  // Load constants once
  useEffect(() => {
    getConstants().then(({ data }) => {
      setCategories(data.projectCategories || []);
      setCounties(data.counties || []);
      setProfessions(data.professions || []);
    }).catch(() => {});
  }, []);

  const fetchProjects = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await getProjects({
          search,
          category,
          county,
          profession,
          sort,
          page: pageNum,
          limit: 12,
        });

        if (append) {
          setProjects((prev) => [...prev, ...(data.projects || [])]);
        } else {
          setProjects(data.projects || []);
        }
        setTotalPages(data.totalPages || 1);
        setPage(pageNum);
      } catch {
        if (!append) setProjects([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, category, county, profession, sort]
  );

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (page < totalPages) fetchProjects(page + 1, true);
  };

  const resetFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategory('');
    setCounty('');
    setProfession('');
    setSort('newest');
  };

  const hasFilters = search || category || county || profession || sort !== 'newest';

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-secondary-100 bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Construction Inspiration</h1>
          <p className="mt-3 max-w-2xl text-secondary-400">
            Browse completed projects by Kenya's top professionals — your next home starts here.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchBar
              size="lg"
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearch}
              placeholder="Search by title, category, county, or profession..."
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-700 focus:border-primary focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-700 focus:border-primary focus:outline-none"
          >
            <option value="">All Counties</option>
            {counties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-700 focus:border-primary focus:outline-none"
          >
            <option value="">All Professions</option>
            {professions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-700 focus:border-primary focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="rounded-lg border border-secondary-200 px-3 py-2 text-sm text-secondary-500 hover:border-secondary-400 hover:text-secondary-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <LoadingSpinner label="Loading projects..." />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No projects found"
              description={hasFilters ? 'Try adjusting your filters.' : 'No construction projects have been uploaded yet.'}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))}
              </div>

              {page < totalPages && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-8 py-3 text-sm font-semibold text-secondary-700 shadow-card transition-all hover:border-primary hover:text-primary-700 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : null}
                    Load More Projects
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
