const fs = require("fs");
const path = require("path");
const express = require("express");
const sass = require("sass");

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const obGlobal = {
  obErori: null,
  obGalerie: null,
  folderScss: path.join(__dirname, "resurse", "scss"),
  folderCss: path.join(__dirname, "resurse", "css"),
};

const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (const numeFolder of vect_foldere) {
  const caleFolder = path.join(__dirname, numeFolder);
  if (!fs.existsSync(caleFolder)) {
    fs.mkdirSync(caleFolder, { recursive: true });
  }
}

console.log("__dirname:", __dirname);
console.log("__filename:", __filename);
console.log("process.cwd():", process.cwd());
console.log("__dirname === process.cwd():", __dirname === process.cwd());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

function existaDirector(cale) {
  return fs.existsSync(cale) && fs.statSync(cale).isDirectory();
}

function obtineListaScss(caleFolder) {
  const rezultate = [];
  if (!existaDirector(caleFolder)) {
    return rezultate;
  }

  const intrari = fs.readdirSync(caleFolder, { withFileTypes: true });
  for (const intrare of intrari) {
    const caleAbsoluta = path.join(caleFolder, intrare.name);
    if (intrare.isDirectory()) {
      rezultate.push(...obtineListaScss(caleAbsoluta));
      continue;
    }

    if (/\.scss$/i.test(intrare.name) && !intrare.name.startsWith("_")) {
      rezultate.push(caleAbsoluta);
    }
  }

  return rezultate;
}

function rezolvaCaleScss(caleScss) {
  if (!caleScss) {
    return null;
  }
  return path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
}

function rezolvaCaleCss(caleCss, caleScssAbsoluta) {
  if (caleCss) {
    return path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss);
  }

  let caleRelativaScss = path.relative(obGlobal.folderScss, caleScssAbsoluta);
  if (caleRelativaScss.startsWith("..")) {
    caleRelativaScss = path.basename(caleScssAbsoluta);
  }

  const caleRelativaCss = caleRelativaScss.replace(/\.scss$/i, ".css");
  return path.join(obGlobal.folderCss, caleRelativaCss);
}

function salveazaBackupCss(caleCssAbsoluta) {
  if (!fs.existsSync(caleCssAbsoluta)) {
    return;
  }

  let caleRelativaCss = path.relative(obGlobal.folderCss, caleCssAbsoluta);
  if (caleRelativaCss.startsWith("..")) {
    caleRelativaCss = path.basename(caleCssAbsoluta);
  }

  const numeFisier = path.basename(caleRelativaCss);
  const extensie = path.extname(numeFisier);
  const numeFaraExt = path.basename(numeFisier, extensie);
  const numeCuTimestamp = `${numeFaraExt}_${Date.now()}${extensie}`;
  const folderRelativ = path.dirname(caleRelativaCss);
  const folderBackup = path.join(__dirname, "backup", "resurse", "css", folderRelativ);
  const caleBackup = path.join(folderBackup, numeCuTimestamp);

  try {
    fs.mkdirSync(folderBackup, { recursive: true });
    fs.copyFileSync(caleCssAbsoluta, caleBackup);
  } catch (err) {
    console.error(`[SCSS] Eroare la copierea backup pentru ${caleCssAbsoluta}: ${err.message}`);
  }
}

function compileazaScss(caleScss, caleCss) {
  const caleScssAbsoluta = rezolvaCaleScss(caleScss);
  if (!caleScssAbsoluta || !fs.existsSync(caleScssAbsoluta)) {
    console.error(`[SCSS] Fisierul sursa nu exista: ${caleScss}`);
    return;
  }

  if (!/\.scss$/i.test(caleScssAbsoluta)) {
    return;
  }

  const caleCssAbsoluta = rezolvaCaleCss(caleCss, caleScssAbsoluta);

  try {
    fs.mkdirSync(path.dirname(caleCssAbsoluta), { recursive: true });
    salveazaBackupCss(caleCssAbsoluta);

    const rezultatCompilare = sass.compile(caleScssAbsoluta, {
      style: "expanded",
      loadPaths: [obGlobal.folderScss, path.join(__dirname, "node_modules")],
    });

    fs.writeFileSync(caleCssAbsoluta, rezultatCompilare.css, "utf-8");
    console.log(`[SCSS] Compilat: ${caleScssAbsoluta} -> ${caleCssAbsoluta}`);
  } catch (err) {
    console.error(`[SCSS] Eroare la compilare (${caleScssAbsoluta}): ${err.message}`);
  }
}

function compileazaInitialScss() {
  const fisiereScss = obtineListaScss(obGlobal.folderScss);
  for (const caleScssAbsoluta of fisiereScss) {
    compileazaScss(caleScssAbsoluta);
  }
}

function urmaresteScss() {
  if (!existaDirector(obGlobal.folderScss)) {
    console.error(`[SCSS] Folderul SCSS nu exista: ${obGlobal.folderScss}`);
    return;
  }

  const debounce = new Map();
  fs.watch(obGlobal.folderScss, { recursive: true }, (tipEveniment, numeFisier) => {
    if (!numeFisier || !/\.scss$/i.test(numeFisier)) {
      return;
    }

    const caleScssAbsoluta = path.join(obGlobal.folderScss, numeFisier);
    if (path.basename(caleScssAbsoluta).startsWith("_")) {
      return;
    }

    if (debounce.has(caleScssAbsoluta)) {
      clearTimeout(debounce.get(caleScssAbsoluta));
    }

    const timeout = setTimeout(() => {
      if (fs.existsSync(caleScssAbsoluta) && fs.statSync(caleScssAbsoluta).isFile()) {
        compileazaScss(caleScssAbsoluta);
      }
      debounce.delete(caleScssAbsoluta);
    }, 150);

    debounce.set(caleScssAbsoluta, timeout);
  });

  console.log("[SCSS] Watch activ pentru folderul:", obGlobal.folderScss);
}

function extrageObiecteDinJson(rawJson) {
  const obiecte = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < rawJson.length; i++) {
    const ch = rawJson[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) {
        start = i;
      }
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        obiecte.push(rawJson.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return obiecte;
}

function cheiDuplicateDinObiect(obiectRaw) {
  const duplicate = [];
  const frecventa = new Map();

  let inString = false;
  let escaped = false;
  let depth = 0;

  for (let i = 0; i < obiectRaw.length; i++) {
    const ch = obiectRaw[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      const start = i + 1;
      let j = start;
      let esc = false;

      while (j < obiectRaw.length) {
        const cj = obiectRaw[j];
        if (esc) {
          esc = false;
        } else if (cj === "\\") {
          esc = true;
        } else if (cj === '"') {
          break;
        }
        j++;
      }

      const potentialKey = obiectRaw.slice(start, j);
      let k = j + 1;
      while (k < obiectRaw.length && /\s/.test(obiectRaw[k])) {
        k++;
      }

      if (depth === 1 && obiectRaw[k] === ":") {
        const count = (frecventa.get(potentialKey) || 0) + 1;
        frecventa.set(potentialKey, count);
        if (count === 2) {
          duplicate.push(potentialKey);
        }
      }

      i = j;
      continue;
    }

    if (ch === "{") {
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
    }
  }

  return duplicate;
}

function valideazaDateErori(rawJson, caleJson) {
  const obiecte = extrageObiecteDinJson(rawJson);
  obiecte.forEach((obj, index) => {
    const duplicate = cheiDuplicateDinObiect(obj);
    if (duplicate.length > 0) {
      console.error(
        `[VALIDARE erori.json] Obiectul #${index + 1} contine proprietati duplicate: ${duplicate.join(", ")}.`
      );
    }
  });

  let obJson = null;
  try {
    obJson = JSON.parse(rawJson);
  } catch (err) {
    console.error(`[VALIDARE erori.json] JSON invalid in ${caleJson}: ${err.message}`);
    return null;
  }

  const proprietatiNecesare = ["info_erori", "cale_baza", "eroare_default"];
  for (const prop of proprietatiNecesare) {
    if (!(prop in obJson)) {
      console.error(`[VALIDARE erori.json] Lipseste proprietatea obligatorie \"${prop}\".`);
    }
  }

  if (obJson.eroare_default) {
    for (const propDefault of ["titlu", "text", "imagine"]) {
      if (!(propDefault in obJson.eroare_default)) {
        console.error(
          `[VALIDARE erori.json] In eroare_default lipseste proprietatea obligatorie \"${propDefault}\".`
        );
      }
    }
  }

  const caleBazaRel = (obJson.cale_baza || "").replace(/^\/+/, "");
  const caleBazaFs = path.join(__dirname, caleBazaRel);
  if (!fs.existsSync(caleBazaFs)) {
    console.error(`[VALIDARE erori.json] Folderul cale_baza nu exista in sistemul de fisiere: ${caleBazaFs}`);
  }

  const imagini = [];
  if (obJson.eroare_default && obJson.eroare_default.imagine) {
    imagini.push({ sursa: "eroare_default", nume: obJson.eroare_default.imagine });
  }
  if (Array.isArray(obJson.info_erori)) {
    obJson.info_erori.forEach((eroare, index) => {
      if (eroare && eroare.imagine) {
        imagini.push({ sursa: `info_erori[${index}]`, nume: eroare.imagine });
      }
    });
  }

  const frecventaImagini = new Map();
  for (const img of imagini) {
    frecventaImagini.set(img.nume, (frecventaImagini.get(img.nume) || 0) + 1);
    const caleImagine = path.join(caleBazaFs, img.nume);
    if (!fs.existsSync(caleImagine)) {
      console.error(
        `[VALIDARE erori.json] Lipseste fisierul imagine pentru ${img.sursa}: ${caleImagine}`
      );
    }
  }

  for (const [numeImagine, count] of frecventaImagini.entries()) {
    if (count > 1) {
      console.error(
        `[VALIDARE erori.json] Imaginea \"${numeImagine}\" este reutilizata de ${count} erori. Fiecare eroare trebuie sa aiba alta imagine.`
      );
    }
  }

  if (Array.isArray(obJson.info_erori)) {
    const mapId = new Map();
    for (const eroare of obJson.info_erori) {
      if (!eroare || typeof eroare.identificator === "undefined") {
        continue;
      }
      const list = mapId.get(eroare.identificator) || [];
      list.push(eroare);
      mapId.set(eroare.identificator, list);
    }

    for (const [id, erori] of mapId.entries()) {
      if (erori.length > 1) {
        console.error(`[VALIDARE erori.json] Exista ${erori.length} erori cu acelasi identificator ${id}.`);
        erori.forEach((eroare, idx) => {
          const { identificator, ...faraId } = eroare;
          console.error(`  Varianta ${idx + 1}: ${JSON.stringify(faraId)}`);
        });
      }
    }
  }

  return obJson;
}

function initErori() {
  const caleJson = path.join(__dirname, "resurse", "json", "erori.json");
  if (!fs.existsSync(caleJson)) {
    console.error(`[INIT ERORI] Nu exista fisierul obligatoriu: ${caleJson}`);
    process.exit(1);
  }

  const continutRaw = fs.readFileSync(caleJson, "utf-8");
  const obJson = valideazaDateErori(continutRaw, caleJson);
  if (!obJson) {
    obGlobal.obErori = {
      cale_baza: "/resurse/imagini/erori",
      eroare_default: {
        titlu: "Eroare",
        text: "A aparut o eroare neasteptata.",
        imagine: "/resurse/imagini/erori/eroare-default.png",
      },
      info_erori: [],
    };
    return;
  }

  const caleBazaWeb = obJson.cale_baza.startsWith("/")
    ? obJson.cale_baza
    : `/${obJson.cale_baza}`;

  if (obJson.eroare_default && obJson.eroare_default.imagine) {
    obJson.eroare_default.imagine = path.posix.join(caleBazaWeb, obJson.eroare_default.imagine);
  }

  if (Array.isArray(obJson.info_erori)) {
    obJson.info_erori = obJson.info_erori.map((eroare) => ({
      ...eroare,
      imagine: eroare.imagine ? path.posix.join(caleBazaWeb, eroare.imagine) : eroare.imagine,
    }));
  }

  obGlobal.obErori = obJson;
}

function valideazaDateGalerie(obGalerie) {
  if (!obGalerie || typeof obGalerie !== "object") {
    console.error("[VALIDARE galerie.json] Structura JSON invalida.");
    return false;
  }

  let valid = true;
  if (!obGalerie.cale_galerie) {
    console.error('[VALIDARE galerie.json] Lipseste proprietatea "cale_galerie".');
    valid = false;
  }

  if (!Array.isArray(obGalerie.imagini)) {
    console.error('[VALIDARE galerie.json] Proprietatea "imagini" trebuie sa fie un vector.');
    valid = false;
  }

  const caleGalerieFs = path.join(__dirname, (obGalerie.cale_galerie || "").replace(/^\/+/, ""));
  if (!existaDirector(caleGalerieFs)) {
    console.error(`[VALIDARE galerie.json] Folderul din \"cale_galerie\" nu exista: ${caleGalerieFs}`);
    valid = false;
  }

  if (Array.isArray(obGalerie.imagini)) {
    obGalerie.imagini.forEach((imagine, index) => {
      if (!imagine || !imagine.fisier) {
        console.error(`[VALIDARE galerie.json] Imaginea de pe pozitia ${index} nu are proprietatea \"fisier\".`);
        valid = false;
        return;
      }

      const caleImagine = path.join(caleGalerieFs, imagine.fisier);
      if (!fs.existsSync(caleImagine)) {
        console.error(`[VALIDARE galerie.json] Fisierul imagine lipseste: ${caleImagine}`);
        valid = false;
      }
    });
  }

  return valid;
}

function initGalerie() {
  const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
  if (!fs.existsSync(caleJson)) {
    console.error(`[INIT GALERIE] Nu exista fisierul ${caleJson}`);
    obGlobal.obGalerie = null;
    return;
  }

  try {
    const continut = fs.readFileSync(caleJson, "utf-8");
    const obGalerie = JSON.parse(continut);
    valideazaDateGalerie(obGalerie);
    obGlobal.obGalerie = obGalerie;
  } catch (err) {
    console.error(`[INIT GALERIE] Eroare la citirea galerie.json: ${err.message}`);
    obGlobal.obGalerie = null;
  }
}

function obtineImaginiGalerie() {
  if (!obGlobal.obGalerie || !Array.isArray(obGlobal.obGalerie.imagini)) {
    return [];
  }

  const luni = [
    "ianuarie",
    "februarie",
    "martie",
    "aprilie",
    "mai",
    "iunie",
    "iulie",
    "august",
    "septembrie",
    "octombrie",
    "noiembrie",
    "decembrie",
  ];

  const lunaCurenta = luni[new Date().getMonth()];
  const caleWeb = obGlobal.obGalerie.cale_galerie.startsWith("/")
    ? obGlobal.obGalerie.cale_galerie
    : `/${obGlobal.obGalerie.cale_galerie}`;

  const imaginiFiltrate = obGlobal.obGalerie.imagini.filter((img) => {
    if (!Array.isArray(img.luni) || img.luni.length === 0) {
      return true;
    }
    return img.luni.map((luna) => String(luna).toLowerCase()).includes(lunaCurenta);
  });

  const imaginiRezultat = (imaginiFiltrate.length > 0 ? imaginiFiltrate : obGlobal.obGalerie.imagini)
    .slice(0, 12)
    .map((img, index) => ({
      ...img,
      index: index + 1,
      cale: path.posix.join(caleWeb, img.fisier),
      descriere: img.descriere || `Imagine galerie ${index + 1}`,
    }));

  return imaginiRezultat;
}

function ipClientDinRequest(req) {
  return req.ip || req.socket?.remoteAddress || "necunoscut";
}

function afisareEroare(res, identificator, titlu, text, imagine, req) {
  let eroare = obGlobal.obErori?.eroare_default || {
    titlu: "Eroare",
    text: "A aparut o eroare.",
    imagine: null,
  };

  if (typeof identificator !== "undefined" && obGlobal.obErori?.info_erori) {
    const eroareGasita = obGlobal.obErori.info_erori.find((elem) => elem.identificator === identificator);
    if (eroareGasita) {
      eroare = eroareGasita;
    }
  }

  const titluFinal = typeof titlu !== "undefined" ? titlu : eroare.titlu;
  const textFinal = typeof text !== "undefined" ? text : eroare.text;
  const imagineFinal = typeof imagine !== "undefined" ? imagine : eroare.imagine;

  if (eroare.status && typeof eroare.identificator === "number") {
    res.status(eroare.identificator);
  }

  res.render(
    "pagini/eroare",
    {
      titlu: titluFinal,
      text: textFinal,
      imagine: imagineFinal,
      ipClient: req ? ipClientDinRequest(req) : "necunoscut",
    },
    (err, rezultatRandare) => {
      if (err) {
        res.status(500).send("Eroare la randarea paginii de eroare.");
        return;
      }
      res.send(rezultatRandare);
    }
  );
}

function randeazaPagina(res, req, numePagina, locals = {}) {
  res.render(
    path.join("pagini", numePagina),
    {
      ipClient: ipClientDinRequest(req),
      imaginiGalerie: obtineImaginiGalerie(),
      ...locals,
    },
    (eroare, rezultatRandare) => {
      if (eroare) {
        if (eroare.message && eroare.message.startsWith("Failed to lookup view")) {
          afisareEroare(res, 404, undefined, undefined, undefined, req);
          return;
        }

        console.error("[RENDER] Eroare la randare:", eroare.message);
        afisareEroare(
          res,
          undefined,
          "Eroare server",
          "A aparut o eroare la procesarea paginii cerute.",
          undefined,
          req
        );
        return;
      }

      res.send(rezultatRandare);
    }
  );
}

initErori();
initGalerie();
compileazaInitialScss();
urmaresteScss();

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "resurse", "favicon", "favicon.ico"));
});

app.get(/^\/resurse(\/.*)?$/, (req, res, next) => {
  const caleRelativa = req.path.replace(/^\/+/, "");
  const caleFs = path.join(__dirname, caleRelativa);

  if (req.path.endsWith("/") || (fs.existsSync(caleFs) && fs.statSync(caleFs).isDirectory())) {
    afisareEroare(res, 403, undefined, undefined, undefined, req);
    return;
  }

  next();
});

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get(/^\/.*\.ejs$/i, (req, res) => {
  afisareEroare(res, 400, undefined, undefined, undefined, req);
});

app.get(["/", "/index", "/home"], (req, res) => {
  randeazaPagina(res, req, "index", { titluPagina: "Magazin de discuri - Acasa" });
});

app.get(/^\/(.*)$/, (req, res, next) => {
  const pagina = req.params[0].replace(/^\/+|\/+$/g, "");
  if (!pagina) {
    next();
    return;
  }
  randeazaPagina(res, req, pagina);
});

app.use((req, res) => {
  afisareEroare(res, 404, undefined, undefined, undefined, req);
});

app.listen(PORT, () => {
  console.log(`Serverul a pornit pe http://localhost:${PORT}`);
});
