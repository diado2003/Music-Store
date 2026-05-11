window.addEventListener("DOMContentLoaded", function () {
  const inpDescriere = document.getElementById("inp-descriere");
  const inpProducator = document.getElementById("inp-producator");
  const inpPret = document.getElementById("inp-pret");
  const infoRange = document.getElementById("infoRange");
  const inpNume = document.getElementById("inp-nume");
  const inpCuloare = document.getElementById("inp-culoare");
  const inpCaracteristici = document.getElementById("inp-caracteristici");
  const inpNoutati = document.getElementById("inp-noutati");
  const mesajValidare = document.getElementById("mesaj-validare");
  const rezultatFiltrare = document.getElementById("rezultat-filtrare");
  const containerProduse = document.getElementById("produse");
  const produse = Array.from(document.getElementsByClassName("produs"));
  const ordineInitiala = [...produse];
  const dataNoutati = new Date(`${inpNoutati.dataset.dataReferinta || "2026-05-01"}T00:00:00`);

  function formatSelectat() {
    return document.querySelector('input[name="gr_format"]:checked')?.value || "toate";
  }

  function valoriSelectateMultiplu(select) {
    return Array.from(select.selectedOptions).map((opt) => opt.value.toLowerCase());
  }

  function textSimpluValid(text) {
    return /^[a-zA-ZăâîșțĂÂÎȘȚ -]*$/.test(text);
  }

  function numeValid(text) {
    return /^[a-zA-Z0-9ăâîșțĂÂÎȘȚ -]*$/.test(text);
  }

  function seteazaMesaj(text) {
    mesajValidare.textContent = text;
    mesajValidare.classList.toggle("d-none", !text);
  }

  function valideazaInputuri() {
    const descriere = inpDescriere.value.trim();
    const nume = inpNume.value.trim();
    const descriereOk = textSimpluValid(descriere);
    const numeOk = numeValid(nume);

    inpDescriere.classList.toggle("is-invalid", !descriereOk);
    inpNume.classList.toggle("is-invalid", !numeOk);

    if (!descriereOk) {
      seteazaMesaj("Cuvantul cautat in descriere nu trebuie sa contina cifre sau simboluri.");
      return false;
    }
    if (!numeOk) {
      seteazaMesaj("Filtrul pentru nume poate contine doar litere, cifre, spatii si cratima.");
      return false;
    }
    seteazaMesaj("");
    return true;
  }

  function produsVizibil(produs) {
    const nume = produs.dataset.nume.toLowerCase();
    const descriere = produs.dataset.descriere.toLowerCase();
    const format = produs.dataset.format;
    const pret = Number(produs.dataset.pret);
    const culoare = produs.dataset.culoare;
    const caracteristici = produs.dataset.caracteristici.toLowerCase();
    const producator = produs.dataset.producator.toLowerCase();
    const dataAdaugare = new Date(`${produs.dataset.data}T00:00:00`);

    const condNume = nume.startsWith(inpNume.value.toLowerCase().trim());
    const condDescriere = descriere.includes(inpDescriere.value.toLowerCase().trim());
    const condProducator = !inpProducator.value.trim() || producator === inpProducator.value.toLowerCase().trim();
    const condFormat = formatSelectat() === "toate" || formatSelectat() === format;
    const condPret = pret <= Number(inpPret.value);
    const condCuloare = inpCuloare.value === "oricare" || inpCuloare.value === culoare;
    const selectate = valoriSelectateMultiplu(inpCaracteristici);
    const condCaracteristici = selectate.length === 0 || selectate.every((val) => caracteristici.includes(val));
    const condNoutati = !inpNoutati.checked || dataAdaugare >= dataNoutati;

    return condNume && condDescriere && condProducator && condFormat && condPret && condCuloare && condCaracteristici && condNoutati;
  }

  function actualizeazaNumarProduse() {
    const vizibile = produse.filter((produs) => produs.style.display !== "none").length;
    rezultatFiltrare.textContent = `Produse afisate: ${vizibile}`;
  }

  function filtreazaProduse() {
    if (!valideazaInputuri()) {
      return;
    }
    for (const produs of produse) {
      produs.style.display = produsVizibil(produs) ? "" : "none";
    }
    actualizeazaNumarProduse();
  }

  function reseteazaFiltre() {
    if (!confirm("Sigur vrei sa resetezi filtrele?")) {
      return;
    }
    inpDescriere.value = "";
    inpProducator.value = "";
    inpPret.value = inpPret.max;
    infoRange.textContent = inpPret.max;
    inpNume.value = "";
    inpCuloare.value = "oricare";
    inpNoutati.checked = false;
    document.getElementById("format-toate").checked = true;
    Array.from(inpCaracteristici.options).forEach((opt) => {
      opt.selected = false;
    });
    inpDescriere.classList.remove("is-invalid");
    inpNume.classList.remove("is-invalid");
    seteazaMesaj("");

    for (const produs of ordineInitiala) {
      produs.style.display = "";
      containerProduse.appendChild(produs);
    }
    actualizeazaNumarProduse();
  }

  function sorteazaProduse(semn) {
    if (!valideazaInputuri()) {
      return;
    }
    const sortate = [...produse].sort(function (a, b) {
      const compNume = a.dataset.nume.localeCompare(b.dataset.nume, "ro");
      if (compNume !== 0) {
        return semn * compNume;
      }
      const raportA = Number(a.dataset.durata) / Number(a.dataset.pret);
      const raportB = Number(b.dataset.durata) / Number(b.dataset.pret);
      return semn * (raportA - raportB);
    });

    for (const produs of sortate) {
      containerProduse.appendChild(produs);
    }
  }

  function calculeazaMediaPreturilor() {
    if (!valideazaInputuri()) {
      return;
    }
    const vizibile = produse.filter((produs) => produs.style.display !== "none");
    const suma = vizibile.reduce((total, produs) => total + Number(produs.dataset.pret), 0);
    const media = vizibile.length ? suma / vizibile.length : 0;

    const div = document.createElement("div");
    div.className = "rezultat-calcul";
    div.textContent = `Media preturilor vizibile: ${media.toFixed(2)} RON`;
    document.body.appendChild(div);

    setTimeout(function () {
      div.remove();
    }, 2000);
  }

  inpPret.addEventListener("input", function () {
    infoRange.textContent = inpPret.value;
  });
  inpDescriere.addEventListener("input", valideazaInputuri);
  inpNume.addEventListener("input", valideazaInputuri);
  document.getElementById("filtrare").addEventListener("click", filtreazaProduse);
  document.getElementById("resetare").addEventListener("click", reseteazaFiltre);
  document.getElementById("sortCrescNume").addEventListener("click", function () {
    sorteazaProduse(1);
  });
  document.getElementById("sortDescrescNume").addEventListener("click", function () {
    sorteazaProduse(-1);
  });
  document.getElementById("calculeaza").addEventListener("click", calculeazaMediaPreturilor);
});
