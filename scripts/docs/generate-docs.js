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
    if (category) {
      category = String(category)
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .toLowerCase();
      outDir = path.join(outDir, category);
    }

    const docFolder = path.resolve(process.cwd(), outDir);
    if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder, { recursive: true });

    const docFile = path.join(docFolder, `${assembler.name}.md`);

    // Ordonner les files : celle qui porte le nom du dossier en premier
    let files = Array.isArray(assembler.files) ? [...assembler.files] : [];
    // Filtrer les fichiers 'index', ceux de type '.d', et les .ts pour registry:ui et registry:hook
    files = files.filter((f) => {
      const isIndex = f.name === 'index' || f.title === 'index';
      const isDts =
        f.path && (f.path.endsWith('.d.ts') || f.path.endsWith('.d.js') || f.path.endsWith('.d'));
      const isTs = f.path && f.path.endsWith('.ts');
      if ((type === 'registry:ui' || type === 'registry:hook') && isTs) return false;
      return !isIndex && !isDts;
    });
    const mainIdx = files.findIndex(
      (f) => f.name === assembler.name || f.title === assembler.title
    );
    if (mainIdx > 0) {
      const [mainFile] = files.splice(mainIdx, 1);
      files = [mainFile, ...files];
    }

    const templateData = {
      name: assembler.name,
      title: assembler.title || assembler.name,
      description: assembler.description || '',
      author: assembler.author || '',
      files,
    };

    const template = fs.readFileSync(templatePath, 'utf-8');
    const rendered = ejs.render(template, templateData, { filename: templatePath });

    fs.writeFileSync(docFile, rendered, 'utf-8');
    console.log(`Doc générée : ${docFile}`);
  });
};

generateDocs();
