import Select from '../common/Select';
import { X } from 'lucide-react';

const ProductFilters = ({ filters, setFilters, categories, onClear }) => {
  return (
    <div className="space-y-4 rounded-xl border border-secondary-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-secondary-900">Filters</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-medium text-secondary-500 hover:text-primary-700"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      </div>

      <Select
        label="Category"
        placeholder="All Categories"
        value={filters.category}
        onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        options={categories}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">Location</label>
        <input
          type="text"
          placeholder="e.g. Nairobi"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default ProductFilters;
