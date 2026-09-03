import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

const ImageUploadBox = ({ currentImageUrl, onUpload, shape = 'square', label, isUploading }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    onUpload(file);
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex h-32 w-32 items-center justify-center overflow-hidden border-2 border-dashed border-secondary-200 bg-secondary-50 transition-colors hover:border-primary ${shapeClass}`}
      >
        {displayUrl ? (
          <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-8 w-8 text-secondary-400" />
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary-900/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </button>
      <span className="text-xs font-medium text-secondary-500">{label}</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploadBox;
