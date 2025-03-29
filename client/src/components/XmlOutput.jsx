import React, { useState } from 'react';

function XmlOutput({ xml }) {
  const [showInstructions, setShowInstructions] = useState(true);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(xml)
      .then(() => alert('XML copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="xml-output">
      <div className="xml-actions">
        <button onClick={copyToClipboard}>Copy XML</button>
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            const encodedXml = btoa(unescape(encodeURIComponent(xml)));
            window.open(`https://app.diagrams.net/?splash=0&title=Diagram#${encodedXml}`);
          }}
          className="open-drawio-btn"
        >
          Open in draw.io
        </a>
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="toggle-instructions-btn"
        >
          {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
        </button>
      </div>
      
      {showInstructions && (
        <div className="xml-instructions">
          <p>To use in draw.io:</p>
          <ol>
            <li>Copy the XML using the button above</li>
            <li>Go to <a href="https://app.diagrams.net/" target="_blank" rel="noopener noreferrer">draw.io</a></li>
            <li>Create a new diagram or open an existing one</li>
            <li>Press Ctrl+A (or Cmd+A) to select all in the diagram</li>
            <li>Press Delete to clear the canvas</li>
            <li>Go to Edit → Edit Data → Paste XML</li>
            <li>Paste the copied XML and click Apply</li>
          </ol>
          <p>Or click the "Open in draw.io" button above to open directly.</p>
        </div>
      )}
      
      <div className="xml-content">
        <pre>{xml}</pre>
      </div>
    </div>
  );
}

export default XmlOutput; 