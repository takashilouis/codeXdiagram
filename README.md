# Code to XML and Mermaid Diagram Generator

This application converts source code into an XML structure and generates a UML-like class diagram using Mermaid. It uses OpenAI's GPT API to analyze the code and extract structural information.

## Features

- Input source code in a text area
- Convert code to XML structure using OpenAI GPT
- Generate a class diagram from the XML using Mermaid
- Display both the XML and diagram in the UI

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- OpenAI API key

## Installation

### Setting up the server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Setting up the client

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. In a separate terminal, start the client:
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. Build the client:
   ```
   cd client
   npm run build
   ```

2. Start the server:
   ```
   cd server
   npm start
   ```

3. Open your browser and navigate to `http://localhost:5000`

## Docker Setup

1. Build the Docker image:
   ```
   docker build -t code-to-xml .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 -e OPENAI_API_KEY=your_openai_api_key_here code-to-xml
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter or paste your source code in the text area.
2. Click the "Generate XML & Diagram" button.
3. The application will send the code to the OpenAI API and generate an XML structure.
4. The XML structure will be displayed and used to generate a Mermaid class diagram.

## Technologies Used

- **Frontend**: React
- **Backend**: Node.js, Express
- **API**: OpenAI GPT
- **Diagram**: Mermaid
- **Containerization**: Docker

## License

MIT 