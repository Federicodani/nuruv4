import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-secondary-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
