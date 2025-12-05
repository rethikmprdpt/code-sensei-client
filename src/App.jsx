import React, { useState } from 'react';
import EditorPanel from './components/EditorPanel';
import SenseiPanel from './components/SenseiPanel';
import { analyzeCode } from './services/api';
import { Play, Code2 } from 'lucide-react';

// Default bad code to demo the O(n^2) detection
const DEFAULT_CODE = `def find_duplicate(nums):
    # Analyze this Bad Logic!
    # This nested loop is O(n^2)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return nums[i]
    return -1`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      // 1. Send code to FastAPI
      const result = await analyzeCode(code);
      // 2. Store result
      setAnalysis(result);
    } catch (err) {
      setError("Failed to connect to backend. Is uvicorn running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#111827] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <header className="h-16 bg-[#0f1117] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Code2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Code Sensei <span className="text-xs font-normal text-gray-500 ml-1">v0.1 POC</span></h1>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all transform active:scale-95
            ${loading 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
        >
          <Play className={`w-4 h-4 fill-current ${loading ? 'hidden' : ''}`} />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 h-full relative group">
          <EditorPanel code={code} setCode={setCode} />
        </div>

        {/* Right: AI Analysis */}
        <div className="w-1/2 h-full bg-[#111827] border-l border-gray-800">
          <SenseiPanel analysis={analysis} loading={loading} error={error} />
        </div>
      </main>
    </div>
  );
}

export default App;