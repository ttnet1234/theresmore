import { useState, ChangeEvent } from 'react';
import { useSaveFile } from '../contexts/SaveFileContext';
import { readFileAsText } from '../utils/decoder';

export default function FileUpload() {
  const { setEncoded, setFileName, state } = useSaveFile();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      setFileName(file.name);
      setEncoded(content);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const textInput = formData.get('encodedText') as string;
    if (textInput.trim()) {
      setEncoded(textInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Drag and drop a save file here, or click to select
        </p>
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleInputChange}
          accept=".txt,.json"
        />
        <label
          htmlFor="file-upload"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          Select File
        </label>
      </div>

      {/* Text Input */}
      <form onSubmit={handleTextSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="encodedText"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Or paste encoded save data:
          </label>
          <textarea
            id="encodedText"
            name="encodedText"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            placeholder="Paste base64 encoded save data here..."
            defaultValue={state.encoded}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Decode
          </button>
          {state.fileName && (
            <span className="inline-flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              📄 {state.fileName}
            </span>
          )}
        </div>
      </form>

      {/* Error Display */}
      {state.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error decoding save file
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {state.error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {state.isLoading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Decoding...</span>
        </div>
      )}
    </div>
  );
}
