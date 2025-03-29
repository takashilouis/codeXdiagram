import React, { useState } from 'react';
import CodeInput from './components/CodeInput';
import SvgFlowchartGenerator from './components/SvgFlowchartGenerator';
import './App.css';
// Import the logo image (you'll need to add your actual logo file to the assets folder)
import logo from './assets/logo.png'; // Update this with your actual logo filename

function App() {
  const [code, setCode] = useState('');
  const [flowchartData, setFlowchartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('normal'); // Default to normal tab
  
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use different endpoints based on the active tab
      const endpoint = activeTab === 'normal' ? 
        'http://localhost:3001/api/generate-normal' : 
        'http://localhost:3001/api/generate-json';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate diagram');
      }

      const data = await response.json();
      setFlowchartData(data.flowchart);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="CodeXDiagram Logo" className="logo" width="100" height="100" />
          <div className="logo-text">
            <h1>CodeX<br/>Diagram</h1>
          </div>
        </div>
        <p>Paste your code to generate a flowchart diagram</p>
      </header>
      
      <main className="app-main">
        <div className="input-section">
          <h2>Source Code</h2>
          
          {/* Tabs UI */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === 'normal' ? 'active' : ''}`}
                onClick={() => setActiveTab('normal')}
              >
                Normal Mode
              </button>
              <button 
                className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                AI Mode (Gemini)
              </button>
            </div>
            
            <div className="tab-content">
              <CodeInput 
                code={code} 
                onCodeChange={handleCodeChange} 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                buttonLabel={activeTab === 'normal' ? 
                  'Generate Flowchart (Normal)' : 
                  'Generate Flowchart (AI)'
                }
              />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {flowchartData && (
          <div className="output-section">
            <div className="diagram-section">
              <h2>Generated Flowchart</h2>
              {/* If SVG content is available directly from code2flow */}
              {flowchartData.svgContent ? (
                <div className="svg-flowchart-container">
                  <div className="download-buttons">
                    <button 
                      className="svg-download-btn"
                      onClick={() => {
                        // Get SVG element
                        const svgElement = document.querySelector('.svg-flowchart-container svg');
                        if (!svgElement) return;
                        
                        // Get SVG source
                        const serializer = new XMLSerializer();
                        const svgData = serializer.serializeToString(svgElement);
                        
                        // Create blob and download
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
                        // Get SVG element
                        const svgElement = document.querySelector('.svg-flowchart-container svg');
                        if (!svgElement) return;
                        
                        // Create canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Set canvas dimensions to match SVG
                        const svgWidth = svgElement.clientWidth || 900;
                        const svgHeight = svgElement.clientHeight || 600;
                        
                        // Scale for better quality
                        const scale = 2;
                        canvas.width = svgWidth * scale;
                        canvas.height = svgHeight * scale;
                        
                        // Create a copy of the SVG with styles embedded for accurate rendering
                        const svgCopy = svgElement.cloneNode(true);
                        
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
                          .node-text { fill: white !important; }
                          .arrow-text { fill: white !important; }
                        `;
                        svgCopy.appendChild(styleElement);
                        
                        // Create image from SVG
                        const img = new Image();
                        const serializer = new XMLSerializer();
                        const svgData = serializer.serializeToString(svgCopy);
                        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                        const svgUrl = URL.createObjectURL(svgBlob);
                        
                        img.onload = () => {
                          // Fill background
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
                  <div 
                    dangerouslySetInnerHTML={{ __html: flowchartData.svgContent }}
                  />
                </div>
              ) : (
                <SvgFlowchartGenerator flowData={flowchartData} />
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Powered by <span className="brand-text">CodeXDiagram</span></p>
      </footer>
    </div>
  );
}

export default App; 