import { regionData } from "../data/central_america.js";
import { LATIN_AMERICA_DECOY_CITIES } from "../data/latin_america_decoy_cities.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "central_america",
  regionName: "Central America",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/central_america.svg",
  starRadii: [2, 1],
  starStrokeWidth: 0.3,
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
    const countryDecoys = LATIN_AMERICA_DECOY_CITIES[entity.id] || []; // <-- CHANGE THIS VARIABLE PER REGION!
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
