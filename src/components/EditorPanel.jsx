/* eslint-disable no-unused-vars */
import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const EditorPanel = ({ code, setCode, language, analysis, activeBlock }) => {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]); // To keep track of old decorations so we can clear them

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Effect: Draw Squiggles and Highlights
  useEffect(() => {
    if (!editorRef.current || !analysis) return;

    const editor = editorRef.current;
    const monaco = window.monaco; // Access global monaco instance if needed, or from prop

    if (!monaco) return;

    // 1. Prepare decorations list
    const newDecorations = [];

    // A. Static Issues (Red/Yellow Gutter Markers)
    analysis.results.forEach((item) => {
      const report = item.analysis;
      if (!report) return;

      // Logic: Score < 5 is Critical (Red), < 8 is Warning (Yellow)
      const isCritical = report.quality_score < 5;
      const gutterClass = isCritical
        ? "squiggly-error-gutter"
        : "squiggly-warning-gutter";

      newDecorations.push({
        range: new monaco.Range(item.meta.start_line, 1, item.meta.end_line, 1),
        options: {
          isWholeLine: true,
          linesDecorationsClassName: gutterClass, // Shows in the line number margin
        },
      });
    });

    // B. Dynamic Hover Highlight (Blue Background)
    if (activeBlock) {
      newDecorations.push({
        range: new monaco.Range(
          activeBlock.start_line,
          1,
          activeBlock.end_line,
          1
        ),
        options: {
          isWholeLine: true,
          className: "monaco-highlight-active", // Uses the CSS class we just defined
        },
      });

      // Smooth scroll to the line
      editor.revealLineInCenter(activeBlock.start_line);
    }

    // 2. Apply to Editor (deltaDecorations manages adding new & removing old)
    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [analysis, activeBlock]);

  return (
    <div className="h-full w-full flex flex-col border-r border-gray-700 bg-[#1e1e1e]">
      <div className="bg-gray-900 text-gray-400 px-4 py-2 text-xs font-mono border-b border-gray-700 flex items-center justify-between">
        <span>
          📄 source_code.
          {language === "python"
            ? "py"
            : language === "cpp"
            ? "cpp"
            : language === "javascript"
            ? "js"
            : language === "java"
            ? "java"
            : "cs"}
        </span>
        <span className="text-gray-600 capitalize">{language} Mode</span>
      </div>
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={
            language === "csharp"
              ? "csharp"
              : language === "cpp"
              ? "cpp"
              : language
          }
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            renderLineHighlight: "none",
            overviewRulerBorder: false, // Cleaner look
            hideCursorInOverviewRuler: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
