import React, { useEffect, useRef } from 'react';
// Import d3 with specific imports to avoid version conflicts
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

function SvgFlowchartGenerator({ flowData }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!flowData || !svgRef.current) return;
    
    // Clear previous renders
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Set up a new graph
    const g = new dagreD3.graphlib.Graph().setGraph({
      rankdir: 'TB',
      marginx: 20,
      marginy: 20,
      nodesep: 70,
      edgesep: 25,
      ranksep: 50,
      acyclicer: 'greedy',
    });
    
    // Add nodes to the graph
    flowData.nodes.forEach(node => {
      // Use only shapes supported by dagre-d3
      let shape = 'rect';
      let style = '';
      
      switch(node.type) {
        case 'start':
        case 'end':
          // Use rect with rounded corners instead of 'stadium'
          shape = 'rect';
          style = 'fill: #263C59; stroke: #58A6FF; rx: 20px; ry: 20px;'; // GitHub blue accent
          break;
        case 'decision':
          shape = 'diamond';
          style = 'fill: #2D333B; stroke: #FFCA28;'; // Yellow accent
          break;
        case 'io':
          // Use rect for IO nodes since 'parallelogram' isn't supported
          shape = 'rect';
          style = 'fill: #2D333B; stroke: #7CE38B;'; // Green accent
          break;
        default:
          style = 'fill: #2D333B; stroke: #A371F7;'; // Purple accent
      }
      
      g.setNode(node.id, {
        label: node.data.label,
        shape: shape,
        style: style,
        rx: node.type === 'start' || node.type === 'end' ? 15 : 5,
        ry: node.type === 'start' || node.type === 'end' ? 15 : 5,
        class: `node-${node.type}`
      });
    });
    
    // Add edges to the graph
    flowData.edges.forEach(edge => {
      g.setEdge(edge.source, edge.target, {
        label: edge.label || '',
        style: 'stroke: #8b949e; stroke-width: 1.5px;',
        arrowheadStyle: 'fill: #8b949e;',
        curve: d3.curveBasis
      });
    });
    
    try {
      // Create the renderer
      const svg = d3.select(svgRef.current);
      const inner = svg.append('g');
      
      // Create the renderer
      const render = new dagreD3.render();
      
      // Run the renderer
      render(inner, g);
      
      // Center the graph
      const svgWidth = parseInt(svg.attr('width'), 10) || svg.node().clientWidth;
      const svgHeight = parseInt(svg.attr('height'), 10) || svg.node().clientHeight;
      const graphWidth = g.graph().width || 0;
      const graphHeight = g.graph().height || 0;
      
      const xCenterOffset = Math.max(0, (svgWidth - graphWidth) / 2);
      const yCenterOffset = Math.max(0, (svgHeight - graphHeight) / 2);
      
      inner.attr('transform', `translate(${xCenterOffset}, ${yCenterOffset})`);
      
      // Fit the SVG to the graph with better handling of large diagrams
      const fitDiagram = () => {
        // Get actual graph dimensions
        const graphWidth = g.graph().width || 800;
        const graphHeight = g.graph().height || 600;
        
        // Set minimum dimensions to avoid tiny diagrams
        svg.attr('width', Math.max(graphWidth + 80, 800))
           .attr('height', Math.max(graphHeight + 80, 600));
        
        // Auto-fit with initial zoom that shows the whole diagram
        const svgWidth = parseInt(svg.attr('width'), 10);
        const containerWidth = svgRef.current.parentNode.clientWidth - 30; // Account for padding
        
        // Calculate zoom level to fit diagram properly
        const widthRatio = containerWidth / svgWidth;
        const initialScale = Math.min(widthRatio, 1); // Don't zoom in, only out if needed
        
        // Create a new transform object for initial positioning
        const initialTranslateX = (containerWidth - (svgWidth * initialScale)) / 2;
        
        return {
          k: initialScale,
          x: initialTranslateX,
          y: 20 // Add a little padding at the top
        };
      };
      
      // Apply the fit function
      const initialTransform = fitDiagram();
      
      // IMPROVED: Configure zoom with proper extent to allow zooming out
      const zoomHandler = d3.zoom()
        .scaleExtent([0.1, 2]) // Allow zooming out to 10% and in to 200%
        .on('zoom', function(event) {
          if (event && event.transform) {
            inner.attr('transform', event.transform);
          }
        });
      
      try {
        // Initialize with our calculated transform
        if (d3.zoomIdentity && initialTransform) {
          const zoomIdentity = d3.zoomIdentity
            .translate(initialTransform.x || 0, initialTransform.y || 0)
            .scale(initialTransform.k || 1);
            
          svg.call(zoomHandler.transform, zoomIdentity);
          
          // Then call the zoom handler
          svg.call(zoomHandler);
        }
      } catch (zoomError) {
        console.warn("Zoom initialization error:", zoomError);
        // Fallback: set basic transform without zoom
        inner.attr('transform', `translate(${initialTransform.x || 0}, ${initialTransform.y || 0}) scale(${initialTransform.k || 1})`);
      }
      
      // Add zoom controls
      const zoomControls = document.createElement('div');
      zoomControls.className = 'zoom-controls';
      
      // Zoom in button
      const zoomInBtn = document.createElement('button');
      zoomInBtn.textContent = '+';
      zoomInBtn.className = 'zoom-btn';
      zoomInBtn.onclick = () => {
        try {
          svg.transition().duration(300).call(
            zoomHandler.scaleBy, 1.2
          );
        } catch (err) {
          console.warn("Zoom in error:", err);
        }
      };
      
      // Zoom out button
      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.textContent = '−'; // Use Unicode minus sign
      zoomOutBtn.className = 'zoom-btn';
      zoomOutBtn.onclick = () => {
        try {
          svg.transition().duration(300).call(
            zoomHandler.scaleBy, 0.8
          );
        } catch (err) {
          console.warn("Zoom out error:", err);
        }
      };
      
      // Reset zoom button
      const resetZoomBtn = document.createElement('button');
      resetZoomBtn.textContent = '⟳'; // Reset symbol
      resetZoomBtn.className = 'zoom-btn';
      resetZoomBtn.onclick = () => {
        try {
          if (d3.zoomIdentity && initialTransform) {
            const zoomIdentity = d3.zoomIdentity
              .translate(initialTransform.x || 0, initialTransform.y || 0)
              .scale(initialTransform.k || 1);
              
            svg.transition().duration(300).call(
              zoomHandler.transform, zoomIdentity
            );
          }
        } catch (err) {
          console.warn("Reset zoom error:", err);
          // Fallback: set basic transform without zoom
          inner.attr('transform', `translate(${initialTransform.x || 0}, ${initialTransform.y || 0}) scale(${initialTransform.k || 1})`);
        }
      };
      
      zoomControls.appendChild(zoomInBtn);
      zoomControls.appendChild(zoomOutBtn);
      zoomControls.appendChild(resetZoomBtn);
      
      // Add zoom controls to container
      const container = svgRef.current.parentNode;
      container.appendChild(zoomControls);
      
      return () => {
        // Clean up
        if (container.contains(zoomControls)) {
          container.removeChild(zoomControls);
        }
      };
    } catch (error) {
      console.error("Error rendering diagram:", error);
      // Add a fallback display when rendering fails
      const errorMessage = document.createElement('div');
      errorMessage.className = 'render-error';
      errorMessage.innerHTML = `
        <h3>Error rendering diagram</h3>
        <p>${error.message}</p>
        <p>Try with a different algorithm or check the browser console for details.</p>
      `;
      
      const container = svgRef.current.parentNode;
      container.appendChild(errorMessage);
      
      return () => {
        if (container.contains(errorMessage)) {
          container.removeChild(errorMessage);
        }
      };
    }
  }, [flowData]);
  
  return (
    <div className="svg-flowchart-container">
      <div className="download-buttons">
        <button 
          className="svg-download-btn"
          onClick={() => {
            const svgData = svgRef.current.outerHTML;
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = 'flowchart.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
          }}
        >
          ⬇️ Download SVG
        </button>
        
        <button 
          className="png-download-btn"
          onClick={() => {
            const svg = svgRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions to match SVG
            const svgWidth = svg.clientWidth || 800;
            const svgHeight = svg.clientHeight || 600;
            
            // Scale for better quality
            const scale = 2;
            canvas.width = svgWidth * scale;
            canvas.height = svgHeight * scale;
            
            // Create a copy of the SVG with styles embedded for accurate rendering
            const svgCopy = svg.cloneNode(true);
            
            // Make sure all text is white (this is important for the dark background)
            const allTextElements = svgCopy.querySelectorAll('text');
            allTextElements.forEach(text => {
              text.setAttribute('fill', 'white');
            });
            
            // Ensure the background color is set
            const styleElement = document.createElement('style');
            styleElement.textContent = `
              * { font-family: Arial, sans-serif; }
              svg { background-color: #0d1117; }
              .node text { fill: white !important; }
              .edgeLabel text { fill: white !important; }
              .label text { fill: white !important; }
            `;
            svgCopy.appendChild(styleElement);
            
            // Create image from SVG
            const img = new Image();
            const svgData = new XMLSerializer().serializeToString(svgCopy);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
              // Fill background (SVGs can have transparent backgrounds)
              ctx.fillStyle = '#0d1117';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Draw scaled SVG
              ctx.scale(scale, scale);
              ctx.drawImage(img, 0, 0);
              
              // Generate download
              canvas.toBlob((blob) => {
                const pngUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = 'flowchart.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(pngUrl);
              }, 'image/png');
              
              URL.revokeObjectURL(svgUrl);
            };
            
            img.src = svgUrl;
          }}
        >
          ⬇️ Download PNG
        </button>
      </div>
      
      <svg 
        ref={svgRef} 
        width="100%" 
        height="600"
        className="svg-flowchart dark-theme"
      ></svg>
    </div>
  );
}

export default SvgFlowchartGenerator; 