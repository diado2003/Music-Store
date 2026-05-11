(function () {
  const CHEIE_TEMA = "tema-site";
  const teme = ["dark", "light", "concert", "studio"];

  function aplicaTema(tema) {
    const temaFinala = teme.includes(tema) ? tema : "dark";
    document.documentElement.dataset.bsTheme = temaFinala === "light" ? "light" : "dark";

    document.body?.classList.remove("tema-deschisa", "tema-inchisa", "tema-concert", "tema-studio");
    if (temaFinala === "light") {
      document.body?.classList.add("tema-deschisa");
    } else if (temaFinala === "concert") {
      document.body?.classList.add("tema-concert");
    } else if (temaFinala === "studio") {
      document.body?.classList.add("tema-studio");
    } else {
      document.body?.classList.add("tema-inchisa");
    }

    const selectTema = document.getElementById("select-tema");
    const icon = document.querySelector(".selector-tema i");
    if (selectTema) {
      selectTema.value = temaFinala;
    }
    if (icon) {
      icon.className = temaFinala === "light" ? "fa-solid fa-sun" : temaFinala === "studio" ? "fa-solid fa-compact-disc" : "fa-solid fa-moon";
    }
  }

  function initTema() {
    aplicaTema(localStorage.getItem(CHEIE_TEMA) || "dark");
    const selectTema = document.getElementById("select-tema");
    selectTema?.addEventListener("change", function () {
      localStorage.setItem(CHEIE_TEMA, this.value);
      aplicaTema(this.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTema);
  } else {
    initTema();
  }
})();
