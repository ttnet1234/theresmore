// Save file data types

export interface SaveFileData {
  [key: string]: unknown;
}

export interface SaveFileState {
  encoded: string;
  decoded: string;
  parsed: SaveFileData | null;
  isCompressed: boolean;
  fileName: string;
  error: string | null;
  isLoading: boolean;
}

export interface DecodedDataNode {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  path: string;
  children?: DecodedDataNode[];
}

export type ViewMode = 'raw' | 'tree' | 'visualization';

export interface AppSettings {
  viewMode: ViewMode;
  autoDecode: boolean;
  theme: 'light' | 'dark';
}
