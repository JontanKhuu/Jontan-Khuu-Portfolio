export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 5MB';
  }

  return null;
}

export async function uploadImage(
  file: File,
  endpoint: string,
  onProgress?: (uploading: boolean) => void
): Promise<{ path: string } | { error: string }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  if (onProgress) onProgress(true);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return { path: data.path };
    } else {
      const errorData = await res.json();
      return { error: errorData.error || 'Failed to upload image' };
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return { error: 'Error uploading image' };
  } finally {
    if (onProgress) onProgress(false);
  }
}

