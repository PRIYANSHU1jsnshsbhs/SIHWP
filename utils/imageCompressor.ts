import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress an image to reduce file size for 2G network upload
 * Target: < 100KB per image
 */
export const compressImage = async (uri: string): Promise<string> => {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Resize to max 800px width
            {
                compress: 0.5, // 50% quality
                format: ImageManipulator.SaveFormat.JPEG
            }
        );
        return result.uri;
    } catch (error) {
        console.log('Image compression error:', error);
        return uri; // Return original if compression fails
    }
};

/**
 * Get approximate file size category
 */
export const getFileSizeCategory = (bytes: number): string => {
    if (bytes < 50000) return 'Tiny (<50KB)';
    if (bytes < 100000) return 'Small (<100KB)';
    if (bytes < 500000) return 'Medium (<500KB)';
    return 'Large (>500KB)';
};
