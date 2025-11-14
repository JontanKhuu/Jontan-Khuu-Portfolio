"use client";

type ImageUploadProps = {
  label: string;
  imageUrl: string | null | undefined;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  previewSize?: 'small' | 'large';
};

export function ImageUpload({ 
  label, 
  imageUrl, 
  uploading, 
  onUpload, 
  onRemove,
  previewSize = 'small'
}: ImageUploadProps) {
  const previewClass = previewSize === 'large' 
    ? 'w-48 h-64' 
    : 'w-24 h-24 rounded-full';
  
  const imageClass = previewSize === 'large'
    ? 'w-full h-full object-contain'
    : 'w-full h-full object-cover';

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-900">{label}</label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {imageUrl ? (
            <div className={`${previewClass} overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center ${previewSize === 'large' ? 'rounded' : ''}`}>
              <img
                src={imageUrl}
                alt="Preview"
                className={imageClass}
              />
            </div>
          ) : (
            <div className={`${previewClass} border-2 border-gray-300 bg-gray-100 flex items-center justify-center ${previewSize === 'large' ? 'rounded' : ''}`}>
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={onUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
          </label>
          {imageUrl && (
            <button
              onClick={onRemove}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WebP (max 5MB)</p>
    </div>
  );
}

