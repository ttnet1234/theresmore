import { useMemo } from 'react';
import { useSaveFile } from '../contexts/SaveFileContext';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DataDisplay() {
  const { state, settings } = useSaveFile();

  // Extract numeric data for visualization
  const numericData = useMemo(() => {
    if (!state.parsed) return [];
    
    const data: { name: string; value: number }[] = [];
    
    function extractNumbers(obj: unknown, prefix = '') {
      if (obj === null || obj === undefined) return;
      
      if (typeof obj === 'number') {
        if (prefix) {
          data.push({ name: prefix, value: obj });
        }
        return;
      }
      
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          extractNumbers(value, newPrefix);
        }
      }
    }
    
    extractNumbers(state.parsed);
    return data.slice(0, 20); // Limit to first 20 for readability
  }, [state.parsed]);

  // Get key types distribution
  const typeDistribution = useMemo(() => {
    if (!state.parsed) return [];
    
    const types: Record<string, number> = {};
    
    function countTypes(obj: unknown) {
      if (obj === null) {
        types['null'] = (types['null'] || 0) + 1;
        return;
      }
      
      const type = typeof obj;
      types[type] = (types[type] || 0) + 1;
      
      if (type === 'object' && !Array.isArray(obj)) {
        for (const value of Object.values(obj as Record<string, unknown>)) {
          countTypes(value);
        }
      } else if (type === 'object' && Array.isArray(obj)) {
        for (const item of obj as unknown[]) {
          countTypes(item);
        }
      }
    }
    
    countTypes(state.parsed);
    
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [state.parsed]);

  // Render raw JSON with syntax highlighting
  const renderJsonWithHighlight = (json: string) => {
    if (!json) return null;
    
    // Simple syntax highlighting
    const highlighted = json
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
    
    return (
      <pre
        className="text-sm overflow-auto max-h-[600px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  // Render tree view
  const renderTreeView = (obj: unknown, depth = 0): JSX.Element => {
    if (obj === null) {
      return <span className="json-null">null</span>;
    }
    
    if (typeof obj === 'boolean') {
      return <span className="json-boolean">{obj.toString()}</span>;
    }
    
    if (typeof obj === 'number') {
      return <span className="json-number">{obj}</span>;
    }
    
    if (typeof obj === 'string') {
      return <span className="json-string">"{obj}"</span>;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span>[]</span>;
      
      return (
        <span>
          [
          <div className="ml-4" style={{ marginLeft: `${(depth + 1) * 16}px` }}>
            {obj.map((item, index) => (
              <div key={index}>
                <span className="text-gray-500">{index}: </span>
                {renderTreeView(item, depth + 1)}
                {index < obj.length - 1 && ','}
              </div>
            ))}
          </div>
          <span style={{ marginLeft: `${depth * 16}px` }}>]</span>
        </span>
      );
    }
    
    if (typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>);
      if (entries.length === 0) return <span>{'{}'}</span>;
      
      return (
        <span>
          {'{'}
          <div className="ml-4" style={{ marginLeft: `${(depth + 1) * 16}px` }}>
            {entries.map(([key, value], index) => (
              <div key={key}>
                <span className="json-key">"{key}"</span>: {renderTreeView(value, depth + 1)}
                {index < entries.length - 1 && ','}
              </div>
            ))}
          </div>
          <span style={{ marginLeft: `${depth * 16}px` }}>{'}'}</span>
        </span>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  // No data message
  if (!state.decoded && !state.error) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No data loaded
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload a save file or paste encoded data to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Raw JSON View */}
      {settings.viewMode === 'raw' && state.decoded && (
        <div>
          <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            Raw JSON
          </h2>
          {renderJsonWithHighlight(state.decoded)}
        </div>
      )}

      {/* Tree View */}
      {settings.viewMode === 'tree' && state.parsed && (
        <div>
          <h2 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
            Tree View
          </h2>
          <div className="text-sm overflow-auto max-h-[600px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {renderTreeView(state.parsed)}
          </div>
        </div>
      )}

      {/* Visualization */}
      {settings.viewMode === 'visualization' && (
        <div>
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Data Visualization
          </h2>
          
          {numericData.length > 0 || typeDistribution.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Distribution Pie Chart */}
              {typeDistribution.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Data Types Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Numeric Values Bar Chart */}
              {numericData.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Numeric Values (Top 20)
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={numericData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No numeric data available for visualization.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
