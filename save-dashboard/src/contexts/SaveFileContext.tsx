import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SaveFileState, SaveFileData, AppSettings, ViewMode } from '../types';
import { decode, encode, getCompression, parseJson } from '../utils/decoder';

interface SaveFileContextType {
  state: SaveFileState;
  settings: AppSettings;
  decodeData: (encoded: string) => void;
  encodeData: (decoded: string) => void;
  setEncoded: (encoded: string) => void;
  setDecoded: (decoded: string) => void;
  setFileName: (name: string) => void;
  clearData: () => void;
  setViewMode: (mode: ViewMode) => void;
  setAutoDecode: (auto: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const initialState: SaveFileState = {
  encoded: '',
  decoded: '',
  parsed: null,
  isCompressed: true,
  fileName: '',
  error: null,
  isLoading: false,
};

const initialSettings: AppSettings = {
  viewMode: 'raw',
  autoDecode: true,
  theme: 'light',
};

const SaveFileContext = createContext<SaveFileContextType | undefined>(undefined);

export function SaveFileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SaveFileState>(initialState);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const decodeData = useCallback((encoded: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const decoded = decode(encoded);
      const parsed = parseJson(decoded) as SaveFileData;
      setState(prev => ({
        ...prev,
        encoded,
        decoded,
        parsed,
        isCompressed: getCompression(),
        error: null,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoading: false,
      }));
    }
  }, []);

  const encodeData = useCallback((decoded: string) => {
    try {
      const encoded = encode(decoded);
      setState(prev => ({ ...prev, encoded, isCompressed: getCompression() }));
    } catch (error) {
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  }, []);

  const setEncoded = useCallback((encoded: string) => {
    setState(prev => ({ ...prev, encoded }));
    if (settings.autoDecode && encoded.trim()) {
      decodeData(encoded);
    }
  }, [settings.autoDecode, decodeData]);

  const setDecoded = useCallback((decoded: string) => {
    setState(prev => ({ ...prev, decoded }));
  }, []);

  const setFileName = useCallback((fileName: string) => {
    setState(prev => ({ ...prev, fileName }));
  }, []);

  const clearData = useCallback(() => {
    setState(initialState);
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setSettings(prev => ({ ...prev, viewMode }));
  }, []);

  const setAutoDecode = useCallback((autoDecode: boolean) => {
    setSettings(prev => ({ ...prev, autoDecode }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const value: SaveFileContextType = {
    state,
    settings,
    decodeData,
    encodeData,
    setEncoded,
    setDecoded,
    setFileName,
    clearData,
    setViewMode,
    setAutoDecode,
    setTheme,
  };

  return (
    <SaveFileContext.Provider value={value}>
      {children}
    </SaveFileContext.Provider>
  );
}

export function useSaveFile() {
  const context = useContext(SaveFileContext);
  if (context === undefined) {
    throw new Error('useSaveFile must be used within a SaveFileProvider');
  }
  return context;
}
