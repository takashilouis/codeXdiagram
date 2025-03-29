import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

function SimpleMermaidViewer({ code }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });
    
    if (!containerRef.current) return;
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    // Create div for mermaid
    const id = `mermaid-${Date.now()}`;
    const element = document.createElement('div');
    element.id = id;
    element.className = 'mermaid-content';
    element.textContent = code;
    containerRef.current.appendChild(element);
    
    // Render the diagram
    try {
      mermaid.render(id, code, (svg) => {
        element.innerHTML = svg;
      });
    } catch (error) {
      console.error("Mermaid render error:", error);
      element.innerHTML = `<div class="render-error">Error rendering diagram: ${error.message}</div>`;
    }
  }, [code]);
  
  return (
    <div className="simple-mermaid-container">
      <div ref={containerRef}></div>
    </div>
  );
}

export default SimpleMermaidViewer; 