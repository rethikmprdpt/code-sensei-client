import React, { useState } from "react";
import EditorPanel from "./components/EditorPanel";
import SenseiPanel from "./components/SenseiPanel";
import { analyzeCode } from "./services/api";
import { Play, Code2 } from "lucide-react";

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
  const [language, setLanguage] = useState("python");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: Track which block is currently being hovered/focused
  const [activeBlock, setActiveBlock] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setActiveBlock(null);

    try {
      const result = await analyzeCode(code, language);
      setAnalysis(result);
    } catch (err) {
      // FIX: Check if the backend sent a specific error message (like 400 Bad Request)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        // Only show this if we truly can't reach the server
        setError("Failed to connect to backend. Is FastAPI running?");
      }
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
          <h1 className="font-bold text-lg tracking-tight">
            Code Sensei{" "}
            <span className="text-xs font-normal text-gray-500 ml-1">
              Graph v2
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white text-xs border border-gray-700 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
          </select>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all transform active:scale-95
              ${
                loading
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
              }`}
          >
            <Play
              className={`w-4 h-4 fill-current ${loading ? "hidden" : ""}`}
            />
            {loading ? "Thinking..." : "Run Analysis"}
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor (Pass analysis data so it can draw squiggles) */}
        <div className="w-1/2 h-full relative group">
          <EditorPanel
            code={code}
            setCode={setCode}
            language={language}
            analysis={analysis}
            activeBlock={activeBlock}
          />
        </div>

        {/* Right: AI Analysis (Pass setter so hovering a card updates the state) */}
        <div className="w-1/2 h-full bg-[#111827] border-l border-gray-800">
          <SenseiPanel
            analysis={analysis}
            loading={loading}
            error={error}
            onHoverBlock={setActiveBlock}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
