import { regionData } from "../data/united_states.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { US_STATE_DECOYS } from "../data/us_state_decoys.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "united_states",
  regionName: "United States",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/united_states.svg",
  starRadii: [6, 3],
  starStrokeWidth: 1,
  hasGeniusMode: true,
  
  onSvgLoad: (svgRoot) => {
    svgRoot.setAttribute("width", "1000");
    svgRoot.setAttribute("height", "630");
    svgRoot.style.display = "block";
  },
  
  formatQuestion: (entity, difficulty) => {
    if (difficulty === "genius") {
      return "What is the name of the highlighted state or district?"; 
    }
    // GENERAL MODE: Check for Washington D.C.
    if (entity.id === "DC") {
      return `What is the National Capital of ${entity.name}?`; // Prints: "What is the National Capital of the United States?"
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
    const countryDecoys = US_STATE_DECOYS[entity.id] || [];
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
