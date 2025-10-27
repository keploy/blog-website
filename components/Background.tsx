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
      gradient.addColorStop(0, `rgba(255, 140, 0, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 165, 0, ${opacity})`);
      gradient.addColorStop(1, `rgba(255, 200, 0, ${opacity})`);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(255, 140, 0, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 200, 0, 0.3)');
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawVertexDot = (x: number, y: number) => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(255, 140, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas with off-white background
      ctx.fillStyle = '#fafafa';
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
      
      // Draw circles at grid intersections (touching adjacent grid lines)
      nodes.forEach(node => {
        drawCircle(node.x, node.y, INTERSECTION_CIRCLE_RADIUS, 0.5);
      });
      
      // Draw circles in the center of each grid square (inscribed circles)
      const cols = Math.ceil(canvas.width / GRID_SPACING);
      const rows = Math.ceil(canvas.height / GRID_SPACING);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const centerX = col * GRID_SPACING + GRID_SPACING / 2;
          const centerY = row * GRID_SPACING + GRID_SPACING / 2;
          drawCircle(centerX, centerY, SQUARE_CIRCLE_RADIUS, 0.4);
        }
      }
      
      // Draw small dots at each vertex (grid intersection)
      nodes.forEach(node => {
        drawVertexDot(node.x, node.y);
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
    />
  );
};

export default Background;
