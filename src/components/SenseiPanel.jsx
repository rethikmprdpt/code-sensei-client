/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Zap,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendFeedback } from "../services/api";

// --- SUB-COMPONENT: FEEDBACK BUTTONS ---
const FeedbackButtons = ({ item, explanation }) => {
  const [voted, setVoted] = useState(false);

  const handleVote = (rating) => {
    setVoted(true);
    sendFeedback({
      function_name: item.meta.function_name,
      code: item.meta.code,
      explanation: explanation,
      rating: rating,
    });
  };

  if (voted)
    return (
      <span className="text-xs text-gray-500 italic block mt-4 text-right">
        Thanks for contributing!
      </span>
    );

  return (
    <div className="flex justify-end gap-2 mt-4 border-t border-gray-700/50 pt-3">
      <span className="text-xs text-gray-500 mr-2 flex items-center">
        Helpful?
      </span>
      <button
        onClick={() => handleVote(1)}
        className="p-1 hover:text-green-400 text-gray-600 transition rounded hover:bg-gray-800"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleVote(-1)}
        className="p-1 hover:text-red-400 text-gray-600 transition rounded hover:bg-gray-800"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- SUB-COMPONENT: COLLAPSIBLE CARD ---
const AnalysisCard = ({ item, index, onHoverBlock }) => {
  // Default to expanded for the first item, collapsed for others?
  // Or just open all. Let's open all by default for better visibility.
  const [isExpanded, setIsExpanded] = useState(true);
  const report = item.analysis;

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4 bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-colors"
      // CRITICAL: Highlight logic stays on the outer container
      onMouseEnter={() => onHoverBlock(item.meta)}
      onMouseLeave={() => onHoverBlock(null)}
    >
      {/* --- HEADER (Click to Expand/Collapse) --- */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-800 p-4 border-b border-gray-700/50 flex justify-between items-center cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          {/* Chevron Icon with Rotation Animation */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </motion.div>

          <div>
            <div className="font-mono text-blue-400 font-bold text-sm group-hover:text-blue-300 transition-colors">
              {item.meta.function_name}()
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Lines {item.meta.start_line} - {item.meta.end_line}
            </div>
          </div>
        </div>

        {/* Score Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            report.quality_score >= 8
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : report.quality_score >= 5
              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          Score: {report.quality_score}/10
        </div>
      </div>

      {/* --- BODY (Collapsible Content) --- */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-5 space-y-6">
              {/* Plain English Explanation */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Logic Summary
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                  {report.plain_english_explanation}
                </p>
              </div>

              {/* Complexity & Issues Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Complexity */}
                <div className="flex items-center gap-3 bg-purple-500/5 p-3 rounded-lg border border-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xs text-purple-300/70 uppercase font-bold">
                      Time Complexity
                    </div>
                    <div className="font-mono text-purple-300 font-bold">
                      {report.complexity_estimate}
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-3">
                  {report.issues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/5 p-3 rounded border border-green-500/10">
                      <CheckCircle className="w-4 h-4" /> Clean code! No major
                      issues found.
                    </div>
                  ) : (
                    report.issues.map((issue, i) => (
                      <div
                        key={i}
                        className="bg-red-500/5 border border-red-500/20 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-red-300 font-semibold text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />{" "}
                            {issue.issue_type}
                          </span>
                          <span className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded uppercase tracking-wide">
                            {issue.severity}
                          </span>
                        </div>

                        <p className="text-gray-400 text-xs mb-3">
                          {issue.description}
                        </p>

                        {/* Code Fix Block */}
                        {issue.fix_suggestion && (
                          <div className="mt-2 relative group">
                            <div className="absolute -left-1 top-0 bottom-0 w-1 bg-green-500/30 rounded-full"></div>
                            <div className="pl-3">
                              <p className="text-[10px] text-gray-500 mb-1 uppercase font-bold">
                                Suggested Fix
                              </p>
                              <code className="block bg-black/40 text-green-300 text-xs font-mono p-2 rounded border border-gray-700/50 whitespace-pre-wrap">
                                {issue.fix_suggestion}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feedback Loop */}
              <FeedbackButtons
                item={item}
                explanation={report.plain_english_explanation}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const SenseiPanel = ({ analysis, loading, error, onHoverBlock }) => {
  // 1. Loading State
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="animate-pulse font-mono text-sm">
          Parsing CST & Querying Gemini...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-red-400 p-8 text-center">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-80" />
        <p className="font-semibold">Analysis Failed</p>
        <p className="text-sm mt-2 opacity-70">{error}</p>
      </div>
    );
  }

  // 3. Empty State
  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 p-8 text-center">
        <BookOpen className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-gray-300">
          Code Sensei is Ready
        </h3>
        <p className="text-sm mt-2 max-w-xs mx-auto">
          Paste your code on the left and hit "Analyze" to detect bad logic.
        </p>
      </div>
    );
  }

  // 4. Data Display
  return (
    <div className="h-full bg-gray-900 text-gray-100 overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-yellow-400 fill-current" />
          Analysis Report
        </h2>

        {analysis.results.map((item, index) => (
          <AnalysisCard
            key={index}
            item={item}
            index={index}
            onHoverBlock={onHoverBlock}
          />
        ))}
      </div>
    </div>
  );
};

export default SenseiPanel;
