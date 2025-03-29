import React from 'react';

function CodeInput({ code, onCodeChange, onSubmit, isLoading, buttonLabel }) {
  return (
    <div className="code-input">
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Paste your code here... (JavaScript, Python, Java, etc.)"
        aria-label="Code input"
      />
      
      <div className="button-container" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Analyzing...' : buttonLabel || 'Generate Flowchart'}
        </button>
      </div>
      
      {isLoading && (
        <div className="loading-indicator" style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Analyzing your code and generating flowchart...
        </div>
      )}
    </div>
  );
}

export default CodeInput; 