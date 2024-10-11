import React, { useState, useEffect, useMemo } from "react";
import { Differ, Viewer } from "json-diff-kit";
import type { DiffResult } from "json-diff-kit";
import "json-diff-kit/dist/viewer.css";

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

  // Memoize the differ instance so it's only created once
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

  // Function to handle JSON changes
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: "old" | "new") => {
    const value = e.target.value;

    try {
      const parsedValue = JSON.parse(value);
      setError(""); // Clear any previous errors

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
      // Compute the diff whenever oldJson or newJson changes
      const computedDiff = differ.diff(oldJson, newJson);
      setDiff(computedDiff);
    } catch (err) {
      setDiff(null);
    }
  }, [oldJson, newJson, differ]);

  return (
    <div style={{ margin: "20px" }}>
      <h2>JSON Diff Viewer</h2>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Old JSON</h3>
          <textarea
            rows={10}
            style={{ width: "100%", fontFamily: "monospace" }}
            value={oldJsonInput}
            onChange={(e) => handleJsonChange(e, "old")}
            placeholder="Enter old JSON here"
          />
        </div>
        <div style={{ flex: 1 }}>
          <h3>New JSON</h3>
          <textarea
            rows={10}
            style={{ width: "100%", fontFamily: "monospace" }}
            value={newJsonInput}
            onChange={(e) => handleJsonChange(e, "new")}
            placeholder="Enter new JSON here"
          />
        </div>
      </div>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {diff ? (
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
      ) : (
        <p>No difference to show. Please enter valid JSON objects.</p>
      )}
    </div>
  );
};

export default JsonDiffViewer;