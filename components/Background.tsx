import { useEffect, useRef } from 'react';

interface GridNode {
  x: number;
  y: number;
  col: number;
  row: number;
}

const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const nodesRef = useRef<GridNode[]>([]);
  const highlightedLinesRef = useRef<[GridNode, GridNode][]>([]);
  const highlightedArcsRef = useRef<{ x: number; y: number; r: number; start: number; end: number }[]>([]);
  const accentDotsRef = useRef<{ leftPct: number; topPct: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid parameters
    const GRID_SPACING = 200;
    const INTERSECTION_CIRCLE_RADIUS = GRID_SPACING / 2; // Circle touches adjacent grid lines
    const SQUARE_CIRCLE_RADIUS = GRID_SPACING / 2; // Circle inscribed in the grid square

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeGrid();
    };

    const initializeGrid = () => {
      const nodes: GridNode[] = [];
      const cols = Math.ceil(canvas.width / GRID_SPACING) + 1;
      const rows = Math.ceil(canvas.height / GRID_SPACING) + 1;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          nodes.push({
            x: col * GRID_SPACING,
            y: row * GRID_SPACING,
            col,
            row
          });
        }
      }
      
      nodesRef.current = nodes;
      selectHighlights(nodes);
    };

    const selectHighlights = (nodes: GridNode[]) => {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      // Keep highlights away from center; stronger bias towards edges
      const marginX = width * 0.22;
      const marginY = height * 0.22;
      const centerBoxW = width * 0.6;
      const centerBoxH = height * 0.6;
      const centerLeft = (width - centerBoxW) / 2;
      const centerTop = (height - centerBoxH) / 2;

      const isEdgeBiased = (x: number, y: number) => {
        const nearEdge = x < marginX || x > width - marginX || y < marginY || y > height - marginY;
        const inCenterBox = x > centerLeft && x < centerLeft + centerBoxW && y > centerTop && y < centerTop + centerBoxH;
        return nearEdge && !inCenterBox;
      };

      const lineCandidates: [GridNode, GridNode][] = [];
      for (const node of nodes) {
        const adj = getAdjacentNodes(node, nodes);
        for (const other of adj) {
          // Consider vertical segments to complement circular motif subtly
          const isVertical = node.col === other.col && Math.abs(node.row - other.row) === 1;
          if (!isVertical) continue;
          // Only one direction to avoid duplicates
          if (node.row < other.row) {
            if (isEdgeBiased(node.x, node.y) || isEdgeBiased(other.x, other.y)) {
              lineCandidates.push([node, other]);
            }
          }
        }
      }

      // Build 3–4 highlight chains, each 1–2 segments tall, edge-biased
      const desiredChains = 3 + Math.floor(Math.random() * 2); // 3..4
      const chosenLines: [GridNode, GridNode][] = [];
      const arcs: { x: number; y: number; r: number; start: number; end: number }[] = [];
      const accentDots: { leftPct: number; topPct: number }[] = [];
      const taken = new Set<string>();

      const keyFor = (a: GridNode, b: GridNode) => `${a.col},${a.row}-${b.col},${b.row}`;

      for (let c = 0; c < desiredChains && lineCandidates.length > 0; c++) {
        // pick a random seed segment near edges
        let seedIdx = Math.floor(Math.random() * lineCandidates.length);
        let [startA, startB] = lineCandidates[seedIdx];
        // extend downwards up to 2 more segments if available
        const chain: [GridNode, GridNode][] = [];
        let currentTop = startA;
        let currentBottom = startB;
        chain.push([currentTop, currentBottom]);

        const maxExtra = 1 + Math.floor(Math.random() * 1); // up to 1 extra (so 1–2 total)
        for (let e = 0; e < maxExtra; e++) {
          // find next vertical segment continuing downward
          const next = nodes.find(n => n.col === currentBottom.col && n.row === currentBottom.row + 1);
          if (!next) break;
          if (!isEdgeBiased(currentBottom.x, currentBottom.y) && !isEdgeBiased(next.x, next.y)) break;
          const seg: [GridNode, GridNode] = [currentBottom, next];
          chain.push(seg);
          currentBottom = next;
        }

        // record chain segments if not already taken
        chain.forEach(([a, b]) => {
          const k = keyFor(a, b);
          if (!taken.has(k)) {
            taken.add(k);
            chosenLines.push([a, b]);
          }
        });

        // add a subtle continuation arc at the final endpoint
        const end = currentBottom;
        const r = INTERSECTION_CIRCLE_RADIUS;
        const startAngle = -Math.PI / 2; // arc sweeping slightly clockwise
        const span = 0.5 + Math.random() * 0.25; // 0.5..0.75 radians
        arcs.push({ x: end.x, y: end.y, r, start: startAngle, end: startAngle + span });

        // Occasionally add a micro accent at the arc end (normalized for CSS overlay)
        if (Math.random() < 0.6) {
          const ex = end.x + r * Math.cos(startAngle + span);
          const ey = end.y + r * Math.sin(startAngle + span);
          accentDots.push({ leftPct: (ex / width) * 100, topPct: (ey / height) * 100 });
        }
      }

      highlightedLinesRef.current = chosenLines;
      highlightedArcsRef.current = arcs;
      accentDotsRef.current = accentDots.slice(0, 4); // at most 3–4
    };

    const getAdjacentNodes = (node: GridNode, allNodes: GridNode[]): GridNode[] => {
      return allNodes.filter(n => {
        const isAdjacent = 
          (Math.abs(n.col - node.col) === 1 && n.row === node.row) ||
          (Math.abs(n.row - node.row) === 1 && n.col === node.col);
        return isAdjacent;
      });
    };

    const drawCircle = (x: number, y: number, radius: number, opacity: number = 0.6) => {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(x - radius, y, x + radius, y);
      // Slightly reduced opacity for circles
      gradient.addColorStop(0, `rgba(255, 140, 0, ${opacity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${opacity * 0.75})`);
      gradient.addColorStop(1, `rgba(255, 200, 0, ${opacity * 0.7})`);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      // Slightly further reduced opacity for base grid lines
      gradient.addColorStop(0, 'rgba(255, 140, 0, 0.06)');
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.09)');
      gradient.addColorStop(1, 'rgba(255, 200, 0, 0.06)');
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawHighlightedLine = (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx) return;
      ctx.save();
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(255, 183, 116, 0.46)');
      gradient.addColorStop(1, 'rgba(255, 152, 89, 0.46)');
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient as unknown as string;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 160, 90, 0.25)'; // soft glow
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    };

    const drawVertexDot = (x: number, y: number) => {
      if (!ctx) return;
      // Slightly further reduced opacity for vertex dots
      ctx.fillStyle = 'rgba(255, 140, 0, 0.10)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawHighlightedArc = (x: number, y: number, r: number, start: number, end: number) => {
      if (!ctx) return;
      ctx.save();
      const gradient = ctx.createLinearGradient(x - r, y, x + r, y);
      gradient.addColorStop(0, 'rgba(255, 183, 116, 0.46)');
      gradient.addColorStop(1, 'rgba(255, 152, 89, 0.46)');
      ctx.beginPath();
      ctx.arc(x, y, r, start, end);
      ctx.strokeStyle = gradient as unknown as string;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 160, 90, 0.25)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // tiny glowing endpoint accent on 50% of arcs
      if (Math.random() < 0.5) {
        const ex = x + r * Math.cos(end);
        const ey = y + r * Math.sin(end);
        ctx.fillStyle = 'rgba(255, 183, 116, 0.35)';
        ctx.shadowColor = 'rgba(255, 173, 100, 0.35)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas with a subtle vertical gradient background (less opaque)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      // Subtler, transitioning gradient with lower opacity
      bgGradient.addColorStop(0, 'rgba(250, 250, 250, 0.72)');      // soft light top
      bgGradient.addColorStop(0.5, 'rgba(255, 245, 235, 0.70)');    // warm mid
      bgGradient.addColorStop(1, 'rgba(245, 248, 255, 0.72)');      // cool light bottom
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const nodes = nodesRef.current;
      
      // Draw connections between adjacent nodes
      nodes.forEach(node => {
        const adjacent = getAdjacentNodes(node, nodes);
        adjacent.forEach(adjNode => {
          if (node.col < adjNode.col || node.row < adjNode.row) {
            drawLine(node.x, node.y, adjNode.x, adjNode.y);
          }
        });
      });

      // Draw highlighted segments on top (edge-biased)
      highlightedLinesRef.current.forEach(([a, b]) => {
        drawHighlightedLine(a.x, a.y, b.x, b.y);
      });
      
      // Draw circles at grid intersections (touching adjacent grid lines)
      nodes.forEach(node => {
        drawCircle(node.x, node.y, INTERSECTION_CIRCLE_RADIUS, 0.22);
      });
      
      // Draw circles in the center of each grid square (inscribed circles)
      const cols = Math.ceil(canvas.width / GRID_SPACING);
      const rows = Math.ceil(canvas.height / GRID_SPACING);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const centerX = col * GRID_SPACING + GRID_SPACING / 2;
          const centerY = row * GRID_SPACING + GRID_SPACING / 2;
          drawCircle(centerX, centerY, SQUARE_CIRCLE_RADIUS, 0.18);
        }
      }
      
      // Draw small dots at each vertex (grid intersection)
      nodes.forEach(node => {
        drawVertexDot(node.x, node.y);
      });

      // Draw highlighted arcs
      highlightedArcsRef.current.forEach(c => {
        drawHighlightedArc(c.x, c.y, c.r, c.start, c.end);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {/* Existing grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Micro motion accent pulses at arc endpoints (CSS overlay) */}
      <div className="absolute inset-0">
        {accentDotsRef.current.map((p, i) => (
          <span
            key={i}
            className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-orange-300/80"
            style={{ left: `${p.leftPct}%`, top: `${p.topPct}%` }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-orange-300/60 animate-ping" />
          </span>
        ))}
      </div>

      {/* Decorative accent elements (slow pulse) */}
      <div className="absolute inset-0">
        <div className="absolute left-[4%] top-[12%] w-2 h-2 rounded-full bg-orange-300/60 blur-[1px] animate-[bgPulse_5s_ease-in-out_infinite]" />
        <div className="absolute right-[6%] bottom-[14%] w-1.5 h-1.5 rounded-full bg-orange-200/60 blur-[1px] animate-[bgPulse_6s_ease-in-out_infinite]" />
        <div className="absolute right-[10%] top-[26%] w-1.5 h-1.5 rounded-full bg-orange-300/60 blur-[1px] animate-[bgPulse_7s_ease-in-out_infinite]" />
      </div>

      {/* Author avatars overlay moved to dedicated component for Authors page */}

      {/* Local keyframes for accents and float */}
      <style jsx>{`
        @keyframes bgPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Background;
