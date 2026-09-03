import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import Button from '../../../components/common/Button';
import { addExpense, updateExpense } from '../../../api/constructionProjectApi';

const inputCls = 'w-full rounded-lg border border-secondary-200 px-3.5 py-2.5 text-sm text-secondary-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const lbl = (text, req) => (
  <label className="mb-1 block text-sm font-medium text-secondary-700">
    {text}{req && <span className="ml-1 text-red-500">*</span>}
  </label>
);

const EXPENSE_CATEGORIES = ['Materials', 'Labour', 'Transport', 'Professional Fees', 'Equipment', 'Permits & Fees', 'Miscellaneous'];
const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Bank Transfer', 'Cheque', 'Other'];
const STAGES = [
  'Planning & Design', 'Site Preparation', 'Foundation', 'Walling / Superstructure',
  'Roofing', 'Electrical Rough-In', 'Plumbing Rough-In', 'Plastering & Screeding',
  'Windows & Doors', 'Electrical Finishing', 'Plumbing Finishing', 'Tiling',
  'Painting', 'Interior Finishing', 'Landscaping', 'Completion & Handover',
];

const EMPTY = {
  amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'Cash', stage: '', notes: '',
};

const ExpenseForm = ({ projectId, expense, onSaved, onCancel }) => {
  const isEdit = Boolean(expense);
  const [form, setForm] = useState(EMPTY);
  const [receipt, setReceipt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount || '',
        category: expense.category || '',
        description: expense.description || '',
        date: expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        paymentMethod: expense.paymentMethod || 'Cash',
        stage: expense.stage || '',
        notes: expense.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [expense]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || !form.category || !form.description) {
      setError('Amount, category and description are required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (receipt) fd.append('receipt', receipt);
      if (isEdit) {
        await updateExpense(projectId, expense._id, fd);
      } else {
        await addExpense(projectId, fd);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-secondary-900">{isEdit ? 'Edit Expense' : 'Add Expense'}</h3>
        <button onClick={onCancel} className="rounded p-1 text-secondary-400 hover:text-secondary-700"><X className="h-4 w-4" /></button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            {lbl('Amount (KSh)', true)}
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder="e.g. 25000" min="0" className={inputCls} />
          </div>
          <div>
            {lbl('Category', true)}
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              <option value="">Select</option>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          {lbl('Description', true)}
          <input name="description" value={form.description} onChange={handleChange}
            placeholder="e.g. Purchased 50 bags of Dangote cement" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {lbl('Date', true)}
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            {lbl('Payment Method')}
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputCls}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          {lbl('Construction Stage')}
          <select name="stage" value={form.stage} onChange={handleChange} className={inputCls}>
            <option value="">— None —</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          {lbl('Notes')}
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            placeholder="Any additional notes..." className={inputCls} />
        </div>

        <div>
          {lbl('Receipt Image')}
          <input type="file" accept="image/*,application/pdf"
            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
            className="text-sm text-secondary-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary" />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" isLoading={saving} icon={Save} fullWidth>
            {isEdit ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
