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

    // Récupérer le code source :
    // - si file.doc.source est un objet avec .html, on prend .html
    // - sinon si file.doc.source est un string, on prend ce string
    // Générer les blocs code pour code-tree Nuxt Content, sans bloc vide
    const codes = files
      .map((file) => {
        let code = '';
        let lang = '';
        let filename = '';
        if (file.doc && file.doc.source) {
          if (typeof file.doc.source === 'object') {
            if (file.doc.source.html) {
              code = file.doc.source.html;
            } else {
              // Prendre la première string trouvée dans l'objet qui n'est pas une doc (ex: { ts: '...' })
              const docKeys = ['description', 'tags', 'author', 'category', 'title', 'name'];
              const firstString = Object.entries(file.doc.source)
                .filter(
                  ([k, v]) =>
                    typeof v === 'string' &&
                    !docKeys.includes(k) &&
                    (v.includes('\n') ||
                      v.length > 40 ||
                      ['vue', 'js', 'ts', 'json', 'html', 'css', 'scss', 'md'].includes(k))
                )
                .map(([k, v]) => v)[0];
              if (firstString) code = firstString;
            }
          } else if (typeof file.doc.source === 'string') {
            code = file.doc.source;
          }
        }
        const ext = file.path.split('.').pop();
        if (ext === 'vue') lang = 'vue';
        else if (ext === 'js') lang = 'js';
        else if (ext === 'ts') lang = 'ts';
        else if (ext === 'json') lang = 'json';
        else lang = ext || '';
        filename = path.basename(file.path); // Toujours utiliser le vrai nom de fichier

        return {
          name: file.name,
          title: file.title || file.name,
          code,
          lang,
          filename,
        };
      })
      .filter(Boolean); // ne garder que les fichiers avec code et non index

    const templateData = {
      install: assembler.install || '',
      name: assembler.name,
      title: assembler.title || assembler.name,
      description: assembler.description || '',
      author: assembler.author || '',
      files,
      codes,
    };

    const template = fs.readFileSync(templatePath, 'utf-8');
    const rendered = ejs.render(template, templateData, { filename: templatePath });

    fs.writeFileSync(docFile, rendered, 'utf-8');
    console.log(`Doc générée : ${docFile}`);
  });
};

generateDocs();
