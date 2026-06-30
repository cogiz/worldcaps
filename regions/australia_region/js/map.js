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
  hasGeniusMode: true,

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
      return "What is the name of the highlighted state or territory?"; 
    }
    // GENERAL MODE: Check for the National Capital
    if (entity.id === "AUACT") {
      return "What is the National Capital of Australia?";
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
    // GENIUS MODE: GUESS THE STATE
    // ==========================================
    if (difficulty === "genius") {
      const correctName = String(entity.name).trim();
      let wrongAnswers = [];
      
      const otherNames = localShuffle(
        entities.map(e => e.name).filter(name => name !== correctName)
      );

      for (let i = 0; i < 3; i++) {
        if (otherNames[i]) {
          wrongAnswers.push({ text: otherNames[i], kind: "wrong" });
        }
      }

      const choices = [{ text: correctName, kind: "correct" }, ...wrongAnswers];
      return localShuffle(choices);
    }

    // ==========================================
    // GENERAL MODE: GUESS THE CAPITAL
    // ==========================================
    const correctCapital = String(entity.capital).trim();
    const countryDecoys = AUSTRALIA_DECOY_CITIES[entity.id] || [];
    let wrongAnswers = [];
    const used = new Set([correctCapital]);

    const slicedDecoys = countryDecoys.slice(0, 3);
    slicedDecoys.forEach(city => {
      wrongAnswers.push({ text: city, kind: "wrong" });
      used.add(city);
    });

    if (wrongAnswers.length < 3) {
      const otherCapitals = localShuffle(entities.map(e => e.capital).filter(c => c !== correctCapital));
      for (const city of otherCapitals) {
        if (wrongAnswers.length < 3 && !used.has(city)) {
          wrongAnswers.push({ text: city, kind: "wrong" });
          used.add(city);
        }
      }
    }

    const choices = [{ text: correctCapital, kind: "correct" }, ...wrongAnswers];
    return localShuffle(choices);
  }
};

new QuizEngine(config);
