import { storage } from './client-app';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload an image file to Firebase Storage and return its download URL.
 * @param file - The image file to upload
 * @param path - The storage path (e.g., 'detailers/{uid}/profile.jpg')
 * @returns Promise<string> - The download URL of the uploaded image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/**
 * Delete an image from Firebase Storage by its path.
 * @param path - The storage path of the image
 * @returns Promise<void>
 */
export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
} 