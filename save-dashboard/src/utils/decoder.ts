import LZString from 'lz-string';

// Decoder state
let isCompressed = true;

/**
 * Decode base64 encoded (possibly compressed) save data
 * @param encodedData - Base64 encoded string
 * @returns Decoded JSON string
 */
export function decode(encodedData: string): string {
  try {
    // Try LZString decompression first (most common case)
    const decompressed = LZString.decompressFromBase64(encodedData);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      isCompressed = true;
      return JSON.stringify(parsed, null, 2);
    }
    throw new Error('Decompressed data is null');
  } catch (e) {
    try {
      // Fall back to plain base64
      const decoded = atob(encodedData);
      const parsed = JSON.parse(decoded);
      isCompressed = false;
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error('Failed to decode data: ' + (error as Error).message);
    }
  }
}

/**
 * Encode JSON data back to base64 (possibly compressed)
 * @param decodedData - JSON string to encode
 * @returns Encoded string
 */
export function encode(decodedData: string): string {
  const parsed = JSON.parse(decodedData);
  const stringified = JSON.stringify(parsed);
  
  if (isCompressed) {
    return LZString.compressToBase64(stringified);
  } else {
    return btoa(stringified);
  }
}

export function setCompression(compressed: boolean): void {
  isCompressed = compressed;
}

export function getCompression(): boolean {
  return isCompressed;
}

/**
 * Read file as text
 * @param file - File to read
 * @returns Promise resolving to file contents
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parse JSON string to object
 * @param jsonString - JSON string to parse
 * @returns Parsed object
 */
export function parseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON: ' + (error as Error).message);
  }
}

/**
 * Format object as pretty JSON string
 * @param obj - Object to format
 * @returns Formatted JSON string
 */
export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
