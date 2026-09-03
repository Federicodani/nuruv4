import Select from '../common/Select';
import Button from '../common/Button';
import { X } from 'lucide-react';

const ProfessionalFilters = ({ filters, setFilters, professions, counties, onClear }) => {
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
        label="Profession"
        placeholder="All Professions"
        value={filters.profession}
        onChange={(e) => setFilters((f) => ({ ...f, profession: e.target.value }))}
        options={professions}
      />

      <Select
        label="County"
        placeholder="All Counties"
        value={filters.county}
        onChange={(e) => setFilters((f) => ({ ...f, county: e.target.value }))}
        options={counties}
      />
    </div>
  );
};

export default ProfessionalFilters;
