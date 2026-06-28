import { regionData } from "../data/australia.js";
import { AUSTRALIA_DECOY_CITIES } from "../data/australia_decoy_cities.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "australia",
  regionName: "Australia",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/australia.svg",
  starRadii: [8, 4],
  starStrokeWidth: 1.2,
  hasGeniusMode: true, // Tells the shared engine to expose the premium level

  onSvgLoad: (svgRoot) => {
    const mapWrap = document.getElementById("mapWrap");
    const wrapHeight = mapWrap ? mapWrap.clientHeight : 600;
    svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgRoot.style.width = "100%";
    svgRoot.style.height = (wrapHeight - 50) + "px";
    svgRoot.style.display = "block";
    svgRoot.style.margin = "0 auto";
  },
  
  formatQuestion: (entity, difficulty) => {
    if (difficulty === "genius") {
      return "What is the name of the highlighted region?"; 
    } else if (difficulty === "advanced") {
      return "What is the capital of the highlighted region?";
    }
    return `What is the capital of ${entity.name}?`;
  },
  
  buildAnswers: (entity, globalCapitals, difficulty, entities) => {
    const localShuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // ==========================================
    // NEW GENIUS MODE: GUESS THE COUNTRY/STATE
    // ==========================================
    if (difficulty === "genius") {
      const correctName = String(entity.name).trim();
      let wrongAnswers = [];
      
      // 1. Get all OTHER names in this specific region
      const otherNames = localShuffle(
        entities.map(e => e.name).filter(name => name !== correctName)
      );

      // 2. Pick the first 3 to use as decoys
      for (let i = 0; i < 3; i++) {
        if (otherNames[i]) {
          wrongAnswers.push({ text: otherNames[i], kind: "wrong" });
        }
      }

      // 3. Return the choices
      const choices = [{ text: correctName, kind: "correct" }, ...wrongAnswers];
      return localShuffle(choices);
    }

    // ==========================================
    // BEGINNER & ADVANCED: GUESS THE CAPITAL
    // ==========================================
    const correctCapital = String(entity.capital).trim();
    const countryDecoys = AUSTRALIA_DECOY_CITIES[entity.id] || []; // <-- Remember to change this variable per region!
    let wrongAnswers = [];
    const used = new Set([correctCapital]);
    const shuffledGlobal = localShuffle(globalCapitals);

    if (difficulty === "beginner") {
      // BEGINNER: 3 global capitals
      for (const city of shuffledGlobal) {
        if (wrongAnswers.length < 3 && !used.has(city)) {
          wrongAnswers.push({ text: city, kind: "wrong" });
          used.add(city);
        }
      }
    } else {
      // ADVANCED: 3 local decoys from the decoy_cities.js file
      const slicedDecoys = countryDecoys.slice(0, 3);
      slicedDecoys.forEach(city => {
        wrongAnswers.push({ text: city, kind: "wrong" });
        used.add(city);
      });

      // Safety Fallback: If a country has fewer than 3 decoys in the file, 
      // pad the remaining slots with other correct capitals from this same region.
      if (wrongAnswers.length < 3) {
        const otherCapitals = localShuffle(entities.map(e => e.capital).filter(c => c !== correctCapital));
        for (const city of otherCapitals) {
          if (wrongAnswers.length < 3 && !used.has(city)) {
            wrongAnswers.push({ text: city, kind: "wrong" });
            used.add(city);
          }
        }
      }
    }

    const choices = [{ text: correctCapital, kind: "correct" }, ...wrongAnswers];
    return localShuffle(choices);
  }
};

new QuizEngine(config);

