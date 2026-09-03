import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

const AdminDataTable = ({ columns, data, icon: Icon, emptyTitle, emptyDescription, onDelete, getRowLabel }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (data.length === 0) {
    return <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-secondary-100 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 text-xs uppercase text-secondary-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3">
                  {col.header}
                </th>
              ))}
              {onDelete && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {data.map((row) => (
              <tr key={row._id}>
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-secondary-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {onDelete && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(row)}
                      className="rounded-md p-2 text-secondary-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onDelete && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Deletion"
          maxWidth="max-w-sm"
        >
          <p className="text-sm text-secondary-600">
            Are you sure you want to delete{' '}
            <strong>{deleteTarget ? getRowLabel(deleteTarget) : ''}</strong>? This cannot be undone.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminDataTable;
