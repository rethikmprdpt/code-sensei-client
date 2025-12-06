import React from "react";
import Editor from "@monaco-editor/react";

const EditorPanel = ({ code, setCode, language }) => {
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="h-full w-full flex flex-col border-r border-gray-700 bg-[#1e1e1e]">
      <div className="bg-gray-900 text-gray-400 px-4 py-2 text-xs font-mono border-b border-gray-700 flex items-center justify-between">
        <span>📄 main.py</span>
        <span className="text-gray-600">Python 3.10</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          language={
            language === "csharp"
              ? "csharp"
              : language === "cpp"
              ? "cpp"
              : language
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
