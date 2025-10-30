import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

/**
 * Generate a component documentation file from an assembler.json
 * @param {string} assemblerPath - Path to the assemblerjs.json file
 * @returns {string|undefined} - Path to the generated doc file, or undefined if already exists
 */
export function generateComponentDoc(assemblerPath) {
  const assembler = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));
  const componentName = assembler.title || assembler.name;
  const docFolder = path.resolve(process.cwd(), 'content/3.components', assembler.name);
  const docFile = path.join(docFolder, 'index.mdc');
  const templatePath = path.resolve(process.cwd(), 'scripts/docs/templates/component-doc.mdc.ejs');

  if (fs.existsSync(docFolder)) {
    // Documentation folder already exists, do nothing
    return undefined;
  }

  fs.mkdirSync(docFolder, { recursive: true });

  // Find main .vue file for usage example
  const mainFile = (assembler.files || []).find((f) => f.path.endsWith('.vue'));
  const mainFileName = mainFile ? path.basename(mainFile.path) : `${componentName}.vue`;
  const props = (mainFile && mainFile.props) || [];

  const templateData = {
    title: assembler.title || assembler.name,
    description: assembler.description || '',
    author: assembler.author || '',
    componentName,
    mainFileName,
    props,
  };

  const template = fs.readFileSync(templatePath, 'utf-8');
  const rendered = ejs.render(template, templateData);

  fs.writeFileSync(docFile, rendered, 'utf-8');
  return docFile;
}
