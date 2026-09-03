import { formatCurrency } from '../../utils/helpers';

const BudgetBar = ({ budget, spent, label = 'Budget Utilisation' }) => {
  const pct = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const over = budget > 0 && spent > budget;

  const barColor = over
    ? 'bg-red-500'
    : pct > 80
    ? 'bg-yellow-500'
    : 'bg-primary';

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-secondary-600">{label}</span>
          <span className={`font-bold ${over ? 'text-red-600' : 'text-secondary-900'}`}>
            {pct}%
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-secondary-400">
        <span>Spent: {formatCurrency(spent)}</span>
        <span>Budget: {formatCurrency(budget)}</span>
      </div>
    </div>
  );
};

export default BudgetBar;
