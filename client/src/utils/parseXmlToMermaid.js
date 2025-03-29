/**
 * Parses XML structure and converts it to Mermaid class diagram syntax
 * @param {string} xmlString - The XML string to parse
 * @returns {string} - Mermaid diagram syntax
 */
function parseXmlToMermaid(xmlString) {
  try {
    // Parse XML string to DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML: ' + parseError.textContent);
    }
    
    // Start building the Mermaid diagram
    let mermaidCode = 'classDiagram\n';
    
    // Process classes
    const classes = xmlDoc.querySelectorAll('Class');
    classes.forEach(classNode => {
      const className = classNode.getAttribute('name');
      
      // Add class declaration
      mermaidCode += `  class ${className} {\n`;
      
      // Add properties
      const properties = classNode.querySelectorAll('Properties > Property');
      properties.forEach(prop => {
        const propName = prop.getAttribute('name');
        const propType = prop.getAttribute('type') || '';
        mermaidCode += `    ${propName}: ${propType}\n`;
      });
      
      // Add methods
      const methods = classNode.querySelectorAll('Methods > Method');
      methods.forEach(method => {
        const methodName = method.getAttribute('name');
        const returnType = method.getAttribute('returnType') || 'void';
        
        // Get parameters
        const params = Array.from(method.querySelectorAll('Parameters > Parameter'))
          .map(param => {
            const paramName = param.getAttribute('name');
            const paramType = param.getAttribute('type') || '';
            return `${paramName}: ${paramType}`;
          })
          .join(', ');
        
        mermaidCode += `    ${methodName}(${params}): ${returnType}\n`;
      });
      
      mermaidCode += '  }\n';
    });
    
    // Process relationships
    const relationships = xmlDoc.querySelectorAll('Relationships > *');
    relationships.forEach(rel => {
      const type = rel.tagName;
      
      if (type === 'Inheritance') {
        const parent = rel.getAttribute('parent');
        const child = rel.getAttribute('child');
        mermaidCode += `  ${child} --|> ${parent}\n`;
      } else if (type === 'Composition') {
        const container = rel.getAttribute('container');
        const contained = rel.getAttribute('contained');
        mermaidCode += `  ${container} *-- ${contained}\n`;
      } else if (type === 'Aggregation') {
        const container = rel.getAttribute('container');
        const contained = rel.getAttribute('contained');
        mermaidCode += `  ${container} o-- ${contained}\n`;
      } else if (type === 'Association') {
        const from = rel.getAttribute('from');
        const to = rel.getAttribute('to');
        mermaidCode += `  ${from} --> ${to}\n`;
      }
    });
    
    return mermaidCode;
  } catch (error) {
    console.error('Error parsing XML to Mermaid:', error);
    return `classDiagram\n  class Error {\n    Error parsing XML: ${error.message}\n  }`;
  }
}

export default parseXmlToMermaid; 