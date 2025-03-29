import React from 'react';

function DiagramView({ xml }) {
  if (!xml) return null;

  // Create a URL to open the XML in draw.io
  const drawioUrl = `https://viewer.diagrams.net/?highlight=0000ff&edit=_blank&layers=1&nav=1&xml=${encodeURIComponent(xml)}`;

  return (
    <div className="diagram-container">
      <div className="diagram-actions">
        <a 
          href={`https://app.diagrams.net/?splash=0&url=data:text/xml,${encodeURIComponent(xml)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="open-drawio-btn"
        >
          Open in draw.io Editor
        </a>
      </div>
      
      <div className="diagram-embed">
        <iframe 
          src={drawioUrl}
          width="100%" 
          height="400" 
          frameBorder="0" 
          title="Class Diagram"
        ></iframe>
      </div>
    </div>
  );
}

export default DiagramView; 