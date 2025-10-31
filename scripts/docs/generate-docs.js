import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

/**
 * Génère la documentation pour tous les assemblerjs.json trouvés dans registry/new-york
 * Le dossier de sortie dépend du type :
 *   - registry:ui     => content/components
 *   - registry:hook   => content/composables
 *   - registry:block  => content/blocks
 * Le nom du fichier md est défini par l'entrée 'name' de assemblerjs.json
 */
export const generateDocs = () => {
  const baseDir = path.resolve(process.cwd(), 'registry/new-york');
  const templatePath = path.resolve(process.cwd(), 'scripts/docs/templates/component-doc.mdc.ejs');

  /**
   * Recherche récursive tous les assemblerjs.json
   */
  function findAssemblerJsons(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findAssemblerJsons(filePath));
      } else if (file === 'assemblerjs.json') {
        results.push(filePath);
      }
    }
    return results;
  }

  const assemblerFiles = findAssemblerJsons(baseDir);

  assemblerFiles.forEach((assemblerPath) => {
    const assembler = JSON.parse(fs.readFileSync(assemblerPath, 'utf-8'));
    const type = assembler.type;
    let outDir = null;
    if (type === 'registry:ui') outDir = 'content/components';
    else if (type === 'registry:hook') outDir = 'content/composables';
    else if (type === 'registry:block') outDir = 'content/blocks';
    else outDir = 'content/miscellaneous';

    // Ajout de la gestion de la catégorie
    let category = assembler.category || null;
    // Nettoyage du nom de catégorie (évite les caractères spéciaux)
    if (category) {
      category = String(category)
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .toLowerCase();
      outDir = path.join(outDir, category);
    }

    const docFolder = path.resolve(process.cwd(), outDir);
    if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder, { recursive: true });

    const docFile = path.join(docFolder, `${assembler.name}.md`);

    // Find main .vue file for usage example
    const mainFile = (assembler.files || []).find((f) => f.path.endsWith('.vue'));
    const mainFileName = mainFile
      ? path.basename(mainFile.path)
      : `${assembler.title || assembler.name}.vue`;
    const props = (mainFile && mainFile.props) || [];

    const templateData = {
      title: assembler.title || assembler.name,
      description: assembler.description || '',
      author: assembler.author || '',
      componentName: assembler.title || assembler.name,
      mainFileName,
      props,
    };

    const template = fs.readFileSync(templatePath, 'utf-8');
    const rendered = ejs.render(template, templateData);

    fs.writeFileSync(docFile, rendered, 'utf-8');
    // Optionnel : log
    console.log(`Doc générée : ${docFile}`);
  });
};

generateDocs();
