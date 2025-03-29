# CodeXDiagram

<div align="center">
  <img src="client/src/assets/logo.png" alt="CodeXDiagram Logo" width="200" />
</div>

## Code to Flowchart Generator

CodeXDiagram is an intuitive web application that automatically generates visual flowcharts from your code. With both normal mode and AI-powered mode (using Gemini), it provides developers with a powerful tool to visualize algorithms and code logic.

<div align="center">
  <img src="client/src/assets/mainscreen.png" alt="CodeXDiagram Main Screen" width="800" />
</div>

## Features

- **Dual Generation Modes**:
  - **Normal Mode**: Quick and reliable standard flowchart generation
  - **AI Mode (Gemini)**: Advanced AI-powered analysis for more detailed and context-aware diagrams

- **User-Friendly Interface**:
  - Clean, modern dark theme inspired by GitHub
  - Intuitive code editor with syntax highlighting
  - Interactive flowchart visualization

- **Export Options**:
  - Download as SVG for scalable vector graphics
  - Download as PNG with optimized settings for dark background
  - Preserves white text for better visibility against dark backgrounds

- **Interactive Diagrams**:
  - Zoom controls for detailed inspection
  - Pan and navigate large diagrams

<div align="center">
  <img src="client/src/assets/generateFlowchart_NormalMode.png" alt="Normal Mode Flowchart" width="400" />
  <img src="client/src/assets/generatedFlowchart_AImode.png" alt="AI Mode Flowchart" width="400" />
</div>

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Gemini API key (for AI mode)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/takashilouis/codeXdiagram.git
   cd codeXdiagram
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Environment setup:
   - Create a `.env` file in the server directory:
     ```
     PORT=3001
     GOOGLE_API_KEY=your_gemini_api_key_here
     ```

4. Start the application:
   ```bash
   # Start the server (from server directory)
   npm run dev

   # Start the client (from client directory)
   npm start
   ```

5. The application will be available at:
   - Client: http://localhost:3000
   - Server: http://localhost:3001

## Usage

1. **Input your code**:
   - Paste your code snippet into the editor
   - Select either Normal Mode or AI Mode (Gemini)

2. **Generate the flowchart**:
   - Click "Generate Flowchart" button
   - The flowchart will be rendered in the output section

3. **Export and share**:
   - Use the "Download SVG" button for vector graphics
   - Use the "Download PNG" button for raster images
   - Images have white text optimized for visibility against dark backgrounds

## Technologies Used

- **Frontend**:
  - React.js
  - D3.js for visualization
  - dagre-d3 for flowchart layout

- **Backend**:
  - Node.js
  - Express.js
  - Google Gemini API for AI-powered analysis

## Contribution

Contributions are welcome! Feel free to submit pull requests or open issues to improve the application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <img src="client/src/assets/logo64x64.png" alt="CodeXDiagram Small Logo" width="64" />
  <p>Powered by <strong>CodeXDiagram</strong></p>
</div>
