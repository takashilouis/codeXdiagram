import React, { useEffect, useRef } from 'react';

function DiagramViewer({ xmlContent }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!xmlContent || !containerRef.current) return;
    
    try {
      // Clear the container
      const container = containerRef.current;
      container.innerHTML = '';
      
      // Create a viewer container
      const viewerContainer = document.createElement('div');
      viewerContainer.className = 'drawio-viewer';
      container.appendChild(viewerContainer);
      
      // Use base64 encoding for more reliable transmission
      const base64Xml = btoa(unescape(encodeURIComponent(xmlContent)));
      
      // Create iframe with draw.io viewer
      const iframe = document.createElement('iframe');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '600px');
      
      // Use the diagrams.net viewer with base64 XML
      iframe.setAttribute('src', `https://viewer.diagrams.net/?highlight=0000ff&nav=1&title=Algorithm&layers=1&lightbox=1&edit=_blank#${base64Xml}`);
      viewerContainer.appendChild(iframe);
      
      // Add the "Edit in draw.io" button
      const openButton = document.createElement('div');
      openButton.className = 'open-drawio-container';
      openButton.innerHTML = `
        <button class="open-drawio-btn glassmorphism-button" onclick="window.open('https://app.diagrams.net/?splash=0&title=Algorithm#${base64Xml}', '_blank')">
          Edit in draw.io
        </button>
      `;
      container.appendChild(openButton);
      
    } catch (error) {
      console.error("Error displaying diagram:", error);
      containerRef.current.innerHTML = `
        <div class="error-message glassmorphism">
          <h3>Could not render diagram</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }, [xmlContent]);
  
  return (
    <div className="diagram-container glassmorphism">
      <div ref={containerRef} className="diagram-viewer glassmorphism"></div>
    </div>
  );
}

export default DiagramViewer; 