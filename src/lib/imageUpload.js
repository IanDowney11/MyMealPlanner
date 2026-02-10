const NOSTR_BUILD_UPLOAD_URL = 'https://nostr.build/api/v2/upload/files';

// Convert a base64 data URL to a File object
function base64ToFile(base64DataUrl, filename = 'image.jpg') {
  const arr = base64DataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Upload an image to nostr.build
// Accepts either a File object or a base64 data URL string
export async function uploadImageToNostrBuild(imageInput) {
  let file;

  if (typeof imageInput === 'string') {
    if (imageInput.startsWith('data:')) {
      file = base64ToFile(imageInput);
    } else {
      // Already a URL, return as-is
      return imageInput;
    }
  } else if (imageInput instanceof File) {
    file = imageInput;
  } else {
    throw new Error('Invalid image input: expected File or base64 data URL');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(NOSTR_BUILD_UPLOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();

  if (result.status === 'success' && result.data?.[0]?.url) {
    return result.data[0].url;
  }

  throw new Error('Unexpected response from nostr.build');
}
