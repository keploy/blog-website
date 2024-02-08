"use client";

import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python"
import "prismjs/components/prism-yaml"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-go"
export default function PrismLoader() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return <div className="hidden"></div>;
}
