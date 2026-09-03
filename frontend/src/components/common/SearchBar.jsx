import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, onSubmit, placeholder, size = 'md' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  const sizes = {
    md: 'py-3 text-sm',
    lg: 'py-4 text-base sm:py-5',
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-full border border-secondary-200 bg-white pl-12 pr-28 text-secondary-900 placeholder:text-secondary-400 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${sizes[size]}`}
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-primary-600"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
