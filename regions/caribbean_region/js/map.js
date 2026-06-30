import { regionData } from "../data/caribbean.js";
import { CARIBBEAN_DECOY_CITIES } from "../data/caribbean_decoy_cities.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "caribbean",
  regionName: "Caribbean",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/caribbean.svg",
  starRadii: [6, 4],
  starStrokeWidth: 0,
  hasGeniusMode: true, // Tells the shared engine to expose the premium level
  
  formatQuestion: (entity, difficulty) => {
    if (difficulty === "genius") {
      return "What is the name of this highlighted country?"; 
    }
    // GENERAL MODE: Always show the name
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
    // GENIUS MODE: GUESS THE COUNTRY/STATE
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
    // GENERAL MODE: GUESS THE CAPITAL (3 Local Decoys)
    // ==========================================
    const correctCapital = String(entity.capital).trim();
    const countryDecoys = CARIBBEAN_DECOY_CITIES[entity.id] || []; // <-- CHANGE THIS VARIABLE PER REGION!
    let wrongAnswers = [];
    const used = new Set([correctCapital]);

    // 1. Grab up to 3 local decoys
    const slicedDecoys = countryDecoys.slice(0, 3);
    slicedDecoys.forEach(city => {
      wrongAnswers.push({ text: city, kind: "wrong" });
      used.add(city);
    });

    // 2. Fallback: If short on decoys, pad with other capitals from this region
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
