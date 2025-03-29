const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const esprima = require('esprima');
const esgraph = require('esgraph');
const { Module, render } = require('viz.js/full.render.js');
const Viz = require('viz.js');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL, 'https://codexdiagram.vercel.app'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Add this function to your server.js
function generateSimpleXml(code) {
  // A very basic XML generator for code structure
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<CodeStructure>\n';
  
  // Extract class names with a simple regex
  const classMatches = code.match(/class\s+(\w+)(\s+extends\s+(\w+))?/g) || [];
  
  for (const classMatch of classMatches) {
    const className = classMatch.match(/class\s+(\w+)/)[1];
    const extendsMatch = classMatch.match(/extends\s+(\w+)/);
    const parentClass = extendsMatch ? extendsMatch[1] : null;
    
    xml += `  <Class name="${className}">\n`;
    
    if (parentClass) {
      xml += `    <Extends>${parentClass}</Extends>\n`;
    }
    
    xml += '    <Properties>\n';
    // Simple property extraction (this is very basic)
    const propRegex = new RegExp(`class\\s+${className}[^{]*{([^}]*)}`, 's');
    const classBody = code.match(propRegex);
    if (classBody) {
      const props = classBody[1].match(/(\w+)\s*:\s*(\w+)/g) || [];
      for (const prop of props) {
        const [name, type] = prop.split(':').map(p => p.trim());
        xml += `      <Property name="${name}" type="${type}" />\n`;
      }
    }
    xml += '    </Properties>\n';
    
    xml += '  </Class>\n';
  }
  
  xml += '</CodeStructure>';
  return xml;
}

// Add this function to your server.js
function generateFallbackFlowchart(code) {
  // Simple fallback that creates a basic flowchart
  return {
    nodes: [
      { id: '1', type: 'start', data: { label: 'Start Algorithm' } },
      { id: '2', type: 'process', data: { label: 'Process Code' } },
      { id: '3', type: 'decision', data: { label: 'Execute Successfully?' } },
      { id: '4', type: 'process', data: { label: 'Handle Result' } },
      { id: '5', type: 'process', data: { label: 'Handle Error' } },
      { id: '6', type: 'end', data: { label: 'End Algorithm' } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
      { id: 'e3-5', source: '3', target: '5', label: 'No' },
      { id: 'e4-6', source: '4', target: '6' },
      { id: 'e5-6', source: '5', target: '6' }
    ]
  };
}

// API endpoint to generate JSON from code
app.post('/api/generate-json', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    console.log('Received code of length:', code.length);
    console.log('Using API key:', process.env.GOOGLE_API_KEY ? 'Key is set' : 'Key is missing');

    const prompt = `
      Analyze the following code and create a flowchart description in JSON format.
      Return an object with 'nodes' and 'edges' arrays that describe the algorithm's flow.
      
      For nodes, include:
      - id: unique string 
      - type: "start", "process", "decision", "io", or "end"
      - data: { label: "Description of the step" }
      
      For edges, include:
      - id: unique string (e.g., "e1-2")
      - source: ID of source node
      - target: ID of target node
      - label: (optional) condition or description
      
      Example JSON:
      {
        "nodes": [
          { "id": "1", "type": "start", "data": { "label": "Start Algorithm" } },
          { "id": "2", "type": "process", "data": { "label": "Initialize variables" } },
          { "id": "3", "type": "decision", "data": { "label": "Is condition met?" } },
          { "id": "4", "type": "process", "data": { "label": "Process when true" } },
          { "id": "5", "type": "process", "data": { "label": "Process when false" } },
          { "id": "6", "type": "end", "data": { "label": "End Algorithm" } }
        ],
        "edges": [
          { "id": "e1-2", "source": "1", "target": "2" },
          { "id": "e2-3", "source": "2", "target": "3" },
          { "id": "e3-4", "source": "3", "target": "4", "label": "Yes" },
          { "id": "e3-5", "source": "3", "target": "5", "label": "No" },
          { "id": "e4-6", "source": "4", "target": "6" },
          { "id": "e5-6", "source": "5", "target": "6" }
        ]
      }
      
      Follow these guidelines:
      1. Start with a "start" node and end with an "end" node
      2. Represent conditional branches with "decision" nodes
      3. Represent loops by creating edges that point back to earlier nodes
      4. Keep node labels concise but descriptive
      5. Include all significant steps in the algorithm
      
      Code to analyze:
      ${code}
      
      Return ONLY the JSON object, no additional text.
    `;

    // For Gemini 1.0 Pro (more widely available)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      }
    });
    
    console.log('Sending request to Gemini API...');
    
    try {
      console.log('Attempting to generate content with Gemini...');
      const result = await model.generateContent(prompt);
      console.log('Content generation successful');
      
      const response = await result.response;
      let flowchartJson = response.text();
      
      console.log('Flowchart JSON length:', flowchartJson.length);
      
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = flowchartJson.match(/```json\s*([\s\S]*?)\s*```/) || 
                        flowchartJson.match(/```\s*([\s\S]*?)\s*```/);
      
      const cleanJson = jsonMatch ? jsonMatch[1] : flowchartJson;
      
      // Parse the JSON to ensure it's valid
      let parsedJson;
      try {
        parsedJson = JSON.parse(cleanJson);
        console.log(`Parsed JSON: ${parsedJson.nodes.length} nodes, ${parsedJson.edges.length} edges`);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Return a simplified fallback flowchart
        parsedJson = generateFallbackFlowchart(code);
      }
      
      res.json({ flowchart: parsedJson });
    } catch (apiError) {
      console.error('Gemini API Error details:', {
        name: apiError.name,
        message: apiError.message,
        stack: apiError.stack,
        code: apiError.code
      });
      
      // Check for specific error types
      if (apiError.message && apiError.message.includes('API key')) {
        return res.status(401).json({ 
          error: 'Invalid API key or authentication issue', 
          details: apiError.message 
        });
      }
      
      if (apiError.message && apiError.message.includes('quota')) {
        return res.status(429).json({ 
          error: 'API quota exceeded', 
          details: apiError.message 
        });
      }
      
      // Generate simple XML as fallback
      console.log('Using fallback JSON generator');
      const fallbackJson = generateFallbackFlowchart(code);
      return res.json({ 
        flowchart: fallbackJson,
        fallback: true,
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('General error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to generate JSON', 
      details: error.message || 'Unknown error'
    });
  }
});

// Test endpoint for Gemini API
app.get('/api/test-gemini', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("Hello, what's 1+1?");
    const response = await result.response;
    res.json({ success: true, response: response.text() });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: JSON.stringify(error)
    });
  }
});

// Add this endpoint for code2flow generation
app.post('/api/generate-normal', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    // Enhanced algorithm analysis for flowchart generation
    // Check if this is a Sudoku validation function specifically
    const isSudokuValidator = code.includes('isValidSudoku') || code.includes('valid_sudoku');
    
    // Extract function names and structures
    const funcMatches = code.match(/function\s+(\w+|\s*)\(([^)]*)\)|def\s+(\w+)\s*\(([^)]*)\)/g) || [];
    
    const funcNames = funcMatches.map(match => {
      // Handle both JavaScript and Python function definitions
      const jsMatch = match.match(/function\s+(\w+)/);
      const pyMatch = match.match(/def\s+(\w+)/);
      return jsMatch ? jsMatch[1] : (pyMatch ? pyMatch[1] : "anonymous");
    });
    
    // Extract conditional statements (if/else) blocks
    const conditionMatches = code.match(/if\s+\(([^)]*)\)|if\s+([^:]*):|\bif\b\s+([^{]*)/g) || [];
    const conditions = conditionMatches.map(match => {
      // Clean up the condition text
      return match.replace(/if\s+\(|\)|\bif\b\s+|:/g, '').trim();
    });
    
    // Extract loops (for/while)
    const loopMatches = code.match(/for\s+\(([^)]*)\)|for\s+([^:]*):|\bfor\b\s+([^{]*)|while\s+\(([^)]*)\)|while\s+([^:]*):|\bwhile\b\s+([^{]*)/g) || [];
    const loops = loopMatches.map(match => {
      // Clean up the loop text
      return match.replace(/for\s+\(|\)|\bfor\b\s+|while\s+\(|\bwhile\b\s+|:/g, '').trim();
    });
    
    // For Sudoku validator, create a specialized flowchart
    if (isSudokuValidator) {
      // Build a specialized SVG flowchart for Sudoku validator
      let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" class="flowchart-svg">
        <style>
          .flowchart-svg {
            font-family: Arial, sans-serif;
            background-color: #0d1117;
          }
          .node {
            fill: #2D333B;
            stroke: #58A6FF;
            stroke-width: 2px;
          }
          .start-end {
            fill: #263C59;
            stroke: #58A6FF;
            rx: 20px;
            ry: 20px;
          }
          .process-box {
            fill: #2D333B;
            stroke: #A371F7;
            rx: 5px;
            ry: 5px;
          }
          .decision-box {
            fill: #2D333B;
            stroke: #FFCA28;
          }
          .loop-box {
            fill: #2D333B;
            stroke: #7CE38B;
            rx: 5px;
            ry: 5px;
          }
          .node-text {
            fill: white;
            font-size: 14px;
            text-anchor: middle;
            dominant-baseline: middle;
          }
          .arrow {
            stroke: #8b949e;
            stroke-width: 2px;
            marker-end: url(#arrowhead);
          }
          .arrow-text {
            fill: #8b949e;
            font-size: 12px;
            text-anchor: middle;
          }
        </style>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8b949e" />
          </marker>
        </defs>
        
        <!-- Start node -->
        <rect class="start-end" x="350" y="50" width="200" height="50" />
        <text class="node-text" x="450" y="75">Start</text>
        
        <!-- Initialize sets -->
        <rect class="process-box" x="350" y="150" width="200" height="60" />
        <text class="node-text" x="450" y="170">Initialize rows, columns,</text>
        <text class="node-text" x="450" y="190">and subset sets</text>
        <line class="arrow" x1="450" y1="100" x2="450" y2="150" />
        
        <!-- Double for loop -->
        <rect class="loop-box" x="350" y="260" width="200" height="60" />
        <text class="node-text" x="450" y="280">Loop through 9x9 grid</text>
        <text class="node-text" x="450" y="300">(i in range(9), j in range(9))</text>
        <line class="arrow" x1="450" y1="210" x2="450" y2="260" />
        
        <!-- Get number -->
        <rect class="process-box" x="350" y="370" width="200" height="60" />
        <text class="node-text" x="450" y="400">Get num = board[i][j]</text>
        <line class="arrow" x1="450" y1="320" x2="450" y2="370" />
        
        <!-- Check if "." -->
        <polygon class="decision-box" points="450,470 550,520 450,570 350,520" />
        <text class="node-text" x="450" y="520">num == "."?</text>
        <line class="arrow" x1="450" y1="430" x2="450" y2="470" />
        
        <!-- If ".", continue -->
        <line class="arrow" x1="550" y1="520" x2="650" y2="520" />
        <line class="arrow" x1="650" y1="520" x2="650" y2="290" />
        <line class="arrow" x1="650" y1="290" x2="550" y2="290" />
        <text class="arrow-text" x="585" y="500">Yes (continue)</text>
        
        <!-- If not "." -->
        <line class="arrow" x1="450" y1="570" x2="450" y2="610" />
        <text class="arrow-text" x="430" y="590">No</text>
        
        <!-- Check rows -->
        <polygon class="decision-box" points="450,610 550,660 450,710 350,660" />
        <text class="node-text" x="450" y="660">num in rows[i]?</text>
        
        <!-- Row check failed -->
        <line class="arrow" x1="550" y1="660" x2="700" y2="660" />
        <text class="arrow-text" x="625" y="640">Yes</text>
        
        <!-- Row check passed -->
        <line class="arrow" x1="450" y1="710" x2="450" y2="750" />
        <text class="arrow-text" x="430" y="730">No</text>
        
        <!-- Check columns -->
        <polygon class="decision-box" points="450,750 550,800 450,850 350,800" />
        <text class="node-text" x="450" y="800">num in columns[j]?</text>
        
        <!-- Column check failed -->
        <line class="arrow" x1="550" y1="800" x2="700" y2="800" />
        <text class="arrow-text" x="625" y="780">Yes</text>
        
        <!-- Column check passed -->
        <line class="arrow" x1="450" y1="850" x2="450" y2="890" />
        <text class="arrow-text" x="430" y="870">No</text>
        
        <!-- Calculate index -->
        <rect class="process-box" x="350" y="890" width="200" height="60" />
        <text class="node-text" x="450" y="910">Calculate index =</text>
        <text class="node-text" x="450" y="930">(i // 3) * 3 + (j // 3)</text>
        
        <!-- Check subsets -->
        <polygon class="decision-box" points="450,990 550,1040 450,1090 350,1040" />
        <text class="node-text" x="450" y="1040">num in subsets[index]?</text>
        <line class="arrow" x1="450" y1="950" x2="450" y2="990" />
        
        <!-- Subset check failed -->
        <line class="arrow" x1="550" y1="1040" x2="700" y2="1040" />
        <text class="arrow-text" x="625" y="1020">Yes</text>
        
        <!-- Return False -->
        <rect class="process-box" x="700" y="940" width="150" height="60" />
        <text class="node-text" x="775" y="970">Return False</text>
        
        <!-- Connect all failed checks to Return False -->
        <line class="arrow" x1="700" y1="660" x2="775" y2="660" />
        <line class="arrow" x1="775" y1="660" x2="775" y2="940" />
        
        <line class="arrow" x1="700" y1="800" x2="775" y2="800" />
        <line class="arrow" x1="775" y1="800" x2="775" y2="940" />
        
        <line class="arrow" x1="700" y1="1040" x2="775" y2="1040" />
        <line class="arrow" x1="775" y1="1040" x2="775" y2="1000" />
        
        <!-- All checks passed, add to sets -->
        <rect class="process-box" x="350" y="1140" width="200" height="60" />
        <text class="node-text" x="450" y="1160">Add num to rows[i],</text>
        <text class="node-text" x="450" y="1180">columns[j], subsets[index]</text>
        <line class="arrow" x1="450" y1="1090" x2="450" y2="1140" />
        <text class="arrow-text" x="430" y="1115">No</text>
        
        <!-- Back to loop - Fix the loop back arrow to properly connect to the block -->
        <line class="arrow" x1="350" y1="1170" x2="250" y2="1170" />
        <line class="arrow" x1="250" y1="1170" x2="250" y2="290" />
        <line class="arrow" x1="250" y1="290" x2="350" y2="290" />
        
        <!-- Return True -->
        <rect class="start-end" x="350" y="1250" width="200" height="50" />
        <text class="node-text" x="450" y="1275">Return True</text>
        <line class="arrow" x1="450" y1="1200" x2="450" y2="1250" />
      </svg>
      `;
      
      // Return the flowchart data
      const normalFlowchart = {
        svgContent: svgContent
      };
      
      res.json({ flowchart: normalFlowchart });
      return;
    }
    
    // Regular flowchart for other code
    // Build a more comprehensive SVG flowchart
    let svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="${Math.max(600, 150 + (funcNames.length + conditions.length + loops.length) * 100)}" class="flowchart-svg">
      <style>
        .flowchart-svg {
          font-family: Arial, sans-serif;
          background-color: #0d1117;
        }
        .node {
          fill: #2D333B;
          stroke: #58A6FF;
          stroke-width: 2px;
        }
        .start-end {
          fill: #263C59;
          stroke: #58A6FF;
          rx: 20px;
          ry: 20px;
        }
        .process-box {
          fill: #2D333B;
          stroke: #A371F7;
          rx: 5px;
          ry: 5px;
        }
        .decision-box {
          fill: #2D333B;
          stroke: #FFCA28;
        }
        .loop-box {
          fill: #2D333B;
          stroke: #7CE38B;
          rx: 5px;
          ry: 5px;
        }
        .node-text {
          fill: white;
          font-size: 14px;
          text-anchor: middle;
          dominant-baseline: middle;
        }
        .arrow {
          stroke: #8b949e;
          stroke-width: 2px;
          marker-end: url(#arrowhead);
        }
        .arrow-text {
          fill: #8b949e;
          font-size: 12px;
          text-anchor: middle;
        }
      </style>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#8b949e" />
        </marker>
      </defs>
      
      <!-- Start node -->
      <rect class="start-end" x="350" y="50" width="200" height="50" />
      <text class="node-text" x="450" y="75">Start</text>
    `;
    
    let yPos = 150;
    
    // Add function boxes
    if (funcNames.length > 0) {
      funcNames.forEach((name, index) => {
        svgContent += `
          <rect class="process-box" x="350" y="${yPos}" width="200" height="60" />
          <text class="node-text" x="450" y="${yPos + 30}">${name}()</text>
          <line class="arrow" x1="450" y1="${yPos - 40}" x2="450" y2="${yPos}" />
        `;
        yPos += 100;
      });
    } else {
      // Add a general process box if no functions found
      svgContent += `
        <rect class="process-box" x="350" y="${yPos}" width="200" height="60" />
        <text class="node-text" x="450" y="${yPos + 30}">Process Algorithm</text>
        <line class="arrow" x1="450" y1="100" x2="450" y2="${yPos}" />
      `;
      yPos += 100;
    }
    
    // Add decision boxes for conditional statements
    if (conditions.length > 0) {
      conditions.forEach((condition, index) => {
        // Diamond shape for decision
        const x = 450;
        const y = yPos + 40;
        const width = 200;
        const height = 80;
        
        // Create diamond points: top, right, bottom, left
        const points = `${x},${y - height/2} ${x + width/2},${y} ${x},${y + height/2} ${x - width/2},${y}`;
        
        svgContent += `
          <polygon class="decision-box" points="${points}" />
          <text class="node-text" x="${x}" y="${y}">${condition.length > 25 ? condition.substring(0, 22) + '...' : condition}</text>
          <line class="arrow" x1="450" y1="${yPos - 40}" x2="450" y2="${yPos}" />
          
          <!-- Yes/No paths -->
          <line class="arrow" x1="350" y1="${y}" x2="250" y2="${y}" />
          <line class="arrow" x1="250" y1="${y}" x2="250" y2="${y + 70}" />
          <line class="arrow" x1="250" y1="${y + 70}" x2="450" y2="${y + 70}" />
          <text class="arrow-text" x="300" y="${y - 10}">No</text>
          
          <line class="arrow" x1="550" y1="${y}" x2="650" y2="${y}" />
          <line class="arrow" x1="650" y1="${y}" x2="650" y2="${y + 70}" />
          <line class="arrow" x1="650" y1="${y + 70}" x2="450" y2="${y + 70}" />
          <text class="arrow-text" x="600" y="${y - 10}">Yes</text>
        `;
        
        yPos += 120;
      });
    }
    
    // Add loop boxes
    if (loops.length > 0) {
      loops.forEach((loop, index) => {
        svgContent += `
          <rect class="loop-box" x="350" y="${yPos}" width="200" height="60" />
          <text class="node-text" x="450" y="${yPos + 30}">${loop.length > 25 ? loop.substring(0, 22) + '...' : loop}</text>
          <line class="arrow" x1="450" y1="${yPos - 40}" x2="450" y2="${yPos}" />
          
          <!-- Loop back arrow -->
          <line class="arrow" x1="550" y1="${yPos + 30}" x2="600" y2="${yPos + 30}" />
          <line class="arrow" x1="600" y1="${yPos + 30}" x2="600" y2="${yPos - 20}" />
          <line class="arrow" x1="600" y1="${yPos - 20}" x2="450" y2="${yPos - 20}" />
          <text class="arrow-text" x="600" y="${yPos + 50}">Loop</text>
        `;
        
        yPos += 100;
      });
    }
    
    // Add end node
    svgContent += `
      <rect class="start-end" x="350" y="${yPos}" width="200" height="50" />
      <text class="node-text" x="450" y="${yPos + 25}">End</text>
      <line class="arrow" x1="450" y1="${yPos - 40}" x2="450" y2="${yPos}" />
    `;
    
    svgContent += '</svg>';
    
    // Return the flowchart data
    const normalFlowchart = {
      svgContent: svgContent
    };
    
    res.json({ flowchart: normalFlowchart });
  } catch (error) {
    console.error('Error generating normal flowchart:', error);
    res.status(500).json({ 
      error: 'Failed to generate flowchart', 
      details: error.message || 'Unknown error'
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 