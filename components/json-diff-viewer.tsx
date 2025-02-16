import React, { useState, useEffect, useMemo } from "react";
import { Differ, Viewer } from "json-diff-kit";
import type { DiffResult } from "json-diff-kit";
import "json-diff-kit/dist/viewer.css";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const defaultOldJson = {
  name: "John",
  age: 25,
  location: "New York",
  hobbies: ["Reading", "Cycling", "Hiking"],
};

const defaultNewJson = {
  name: "John",
  age: 26,
  location: "San Francisco",
  hobbies: ["Reading", "Traveling"],
  job: "Software Developer",
};

const JsonDiffViewer: React.FC = () => {
  const [oldJson, setOldJson] = useState<object>(defaultOldJson);
  const [newJson, setNewJson] = useState<object>(defaultNewJson);
  const [diff, setDiff] = useState<readonly [DiffResult[], DiffResult[]] | null>(null);
  const [error, setError] = useState<string>("");
  const [oldJsonInput, setOldJsonInput] = useState(JSON.stringify(defaultOldJson, null, 2));
  const [newJsonInput, setNewJsonInput] = useState(JSON.stringify(defaultNewJson, null, 2));
  const [isOpen, setIsOpen] = useState(false);

  const differ = useMemo(
    () =>
      new Differ({
        detectCircular: true,
        maxDepth: Infinity,
        showModifications: true,
        arrayDiffMethod: "lcs",
      }),
    []
  );

  const handleJsonChange = (value: string, type: "old" | "new") => {
    try {
      const parsedValue = JSON.parse(value);
      setError("");

      if (type === "old") {
        setOldJson(parsedValue);
        setOldJsonInput(value);
      } else {
        setNewJson(parsedValue);
        setNewJsonInput(value);
      }
    } catch (err) {
      setError("Invalid JSON format. Please correct the input.");
      if (type === "old") {
        setOldJsonInput(value);
      } else {
        setNewJsonInput(value);
      }
    }
  };

  useEffect(() => {
    try {
      const computedDiff = differ.diff(oldJson, newJson);
      setDiff(computedDiff);
    } catch (err) {
      setDiff(null);
    }
  }, [oldJson, newJson, differ]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div
        className="flex items-center justify-center cursor-pointer bg-gray-200 rounded-lg p-2 mb-4"
        onClick={toggleDropdown}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-semibold leading-tight tracking-tighter text-gray-800">
          JSON Diff Viewer
        </h2>
        {isOpen ? <ChevronUpIcon className="h-6 w-6 ml-2" /> : <ChevronDownIcon className="h-6 w-6 ml-2" />}
      </div>
      {isOpen && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border shadow-lg p-6 mb-6 transition-colors duration-300 bg-white border-primary-400">
              <h3 className="text-2xl font-bold mb-4 text-primary-400">Old JSON</h3>
              <CodeMirror
                value={oldJsonInput}
                extensions={[json()]}
                theme={dracula}
                onChange={(value) => handleJsonChange(value, "old")}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  tabSize: 4,
                }}
              />
            </div>
            <div className="rounded-lg border shadow-lg p-6 mb-6 transition-colors duration-300 bg-white border-primary-400">
              <h3 className="text-2xl font-bold mb-4 text-primary-400">New JSON</h3>
              <CodeMirror
                value={newJsonInput}
                extensions={[json()]}
                theme={dracula}
                onChange={(value) => handleJsonChange(value, "new")}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  tabSize: 4,
                }}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {diff ? (
            <div className="rounded-lg border shadow-lg p-6 mb-6 transition-colors duration-300 bg-white border-primary-400">
              <Viewer
                diff={diff}
                indent={4}
                lineNumbers={true}
                highlightInlineDiff={true}
                inlineDiffOptions={{
                  mode: "word",
                  wordSeparator: " ",
                }}
              />
            </div>
          ) : (
            <p className="text-center text-gray-700">No difference to show. Please enter valid JSON objects.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JsonDiffViewer;