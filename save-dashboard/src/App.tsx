import { SaveFileProvider } from './contexts/SaveFileContext';
import FileUpload from './components/FileUpload';
import DataDisplay from './components/DataDisplay';
import SearchBar from './components/SearchBar';

function App() {
  return (
    <SaveFileProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Save File Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Decode and analyze game save files
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              {/* File Upload Section */}
              <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Load Save File
                </h2>
                <FileUpload />
              </section>

              {/* Search Bar */}
              <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <SearchBar />
              </section>

              {/* Data Display */}
              <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <DataDisplay />
              </section>
            </div>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Save File Dashboard • Built with React + TypeScript + Vite
          </p>
        </footer>
      </div>
    </SaveFileProvider>
  );
}

export default App;
