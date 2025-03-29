import React, { useState } from 'react';
import CodeInput from './components/CodeInput';
import SvgFlowchartGenerator from './components/SvgFlowchartGenerator';
import './App.css';
// Import the logo image
import logo from './assets/logo.png';

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

  // Feature section icons (using inline SVG for simplicity)
  const codeIcon = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="#333333"/>
    </svg>
  );
  
  const flowchartIcon = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11V3H15V6H9V3H2V11H9V8H11V18H9V15H2V22H9V19H15V22H22V15H15V18H13V8H15V11H22ZM7 9H4V5H7V9ZM7 20H4V17H7V20ZM20 20H17V17H20V20ZM20 9H17V5H20V9Z" fill="#FF7E55"/>
    </svg>
  );
  
  const downloadIcon = (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#28A745"/>
    </svg>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="CodeXDiagram Logo" className="logo" width="100" height="100" />
          <div className="logo-text">
            <h1>CodeXDiagram</h1>
          </div>
        </div>
        <p>Transform your code into intuitive visual flowcharts instantly</p>
      </header>
      
      <main className="app-main">
        {/* How it works section */}
        <div className="feature-row">
          <div className="feature-item">
            <div className="feature-icon">{codeIcon}</div>
            <h3 className="feature-title">Paste your code</h3>
            <p className="feature-description">Input any programming language and select your mode</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">{flowchartIcon}</div>
            <h3 className="feature-title">Generate flowchart</h3>
            <p className="feature-description">Analyze and visualize your code logic automatically</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">{downloadIcon}</div>
            <h3 className="feature-title">Export & share</h3>
            <p className="feature-description">Download as SVG or PNG with perfect visibility</p>
          </div>
        </div>

        <div className="input-section">
          <h2>Paste Your Code</h2>
          
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
              <p className="mode-description">
                {activeTab === 'normal' 
                  ? 'Quick and reliable standard flowchart generation, perfect for simple functions.' 
                  : 'Advanced AI-powered analysis for more detailed and context-aware diagrams.'}
              </p>
              <CodeInput 
                code={code} 
                onCodeChange={handleCodeChange} 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                buttonLabel={activeTab === 'normal' ? 
                  'Generate Flowchart' : 
                  'Generate AI Flowchart'
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
              <h2>Your Generated Flowchart</h2>
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
                      Download SVG
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
                      Download PNG
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

      <div className="about-developer">
        <h2>Khanh Nguyen</h2>
        <h3>📫 Connect With Me</h3>
        <p>
          <a href="https://linkedin.com/in/khanhlouisnguyen" target="_blank" rel="noopener noreferrer">LinkedIn</a> | 
          <a href="mailto:takashilouisnguyen@gmail.com">Email</a>
        </p>
      </div>
    </div>
  );
}

export default App; 