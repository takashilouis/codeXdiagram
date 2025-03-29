import React from 'react';

function CodeInput({ code, onCodeChange, onSubmit, isLoading, buttonLabel }) {
  // Default button label if not provided
  const defaultButtonLabel = isLoading ? 'Generating...' : 'Generate Flowchart';
  const displayButtonLabel = buttonLabel || defaultButtonLabel;
  
  return (
    <div className="code-input">
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Paste your source code here..."
        rows={15}
        disabled={isLoading}
      />
      <button 
        onClick={onSubmit} 
        disabled={isLoading}
        className={isLoading ? 'loading' : ''}
      >
        {isLoading ? 'Generating...' : displayButtonLabel}
      </button>
    </div>
  );
}

export default CodeInput; 