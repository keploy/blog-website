import React, { useState, useEffect, useMemo } from "react";
import { Differ, Viewer } from "json-diff-kit";
import type { DiffResult } from "json-diff-kit";
import "json-diff-kit/dist/viewer.css";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { dracula } from "@uiw/codemirror-theme-dracula";
import styles from "./json-diff-viewer.module.css";

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

const JsonDiffViewer: React.FC = (): JSX.Element => {
  const [oldJson, setOldJson] = useState<object>(defaultOldJson);
  const [newJson, setNewJson] = useState<object>(defaultNewJson);
  const [diff, setDiff] = useState<readonly [DiffResult[], DiffResult[]] | null>(null);
  const [error, setError] = useState<string>("");
  const [oldJsonInput, setOldJsonInput] = useState<string>(
    JSON.stringify(defaultOldJson, null, 2)
  );
  const [newJsonInput, setNewJsonInput] = useState<string>(
    JSON.stringify(defaultNewJson, null, 2)
  );

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

  const handleJsonChange = (value: string, type: "old" | "new"): void => {
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
    } catch {
      setDiff(null);
    }
  }, [oldJson, newJson, differ]);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>JSON Diff Viewer</h2>
      <div className={styles.textAreaContainer}>
        <div className={styles.textAreaWrapper}>
          <h3 className={styles.subHeader}>Old JSON</h3>
          <CodeMirror
            value={oldJsonInput}
            extensions={[json()]}
            theme={dracula}
            onChange={(value) => handleJsonChange(value, "old")}
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: true,
              tabSize: 4,
            }}
          />
        </div>
        <div className={styles.textAreaWrapper}>
          <h3 className={styles.subHeader}>New JSON</h3>
          <CodeMirror
            value={newJsonInput}
            extensions={[json()]}
            theme={dracula}
            onChange={(value) => handleJsonChange(value, "new")}
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: true,
              tabSize: 4,
            }}
          />
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {diff ? (
        <div className={styles.viewerContainer}>
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
        <p className={styles.noDiff}>
          No difference to show. Please enter valid JSON objects.
        </p>
      )}
    </div>
  );
};

export default JsonDiffViewer;
