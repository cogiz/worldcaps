// regions/united_states_region/js/map.js

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
  
  // US specific SVG styling
  onSvgLoad: (svgRoot) => {
    svgRoot.setAttribute("width", "1000");
    svgRoot.setAttribute("height", "630");
    svgRoot.style.display = "block";
  },
  
  // US specific question formatting (Handles Washington D.C.)
  formatQuestion: (state) => {
    return state.id === "DC"
      ? `What is the National Capital of ${state.name}?`
      : `What is the capital of ${state.name}?`;
  },
  
  // US specific Decoy Logic
  buildAnswers: (state, globalCapitals, difficulty, entities) => {
    const correctCapital = String(state.capital).trim();
    const decoys = US_STATE_DECOYS[state.id] || [];
    
    let wrongAnswers = [];
    const used = new Set([correctCapital]);

    const localShuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffledGlobal = localShuffle(globalCapitals);

    if (difficulty === "beginner") {
      // BEGINNER: 0 state decoys + 3 global capitals
      for (const city of shuffledGlobal) {
        if (wrongAnswers.length < 3 && !used.has(city)) {
          wrongAnswers.push({ text: city, kind: "wrong" });
          used.add(city);
        }
      }
    } else if (difficulty === "genius") {
      // GENIUS: 3 state decoys + 0 global capitals
      const slicedDecoys = decoys.slice(0, 3);
      slicedDecoys.forEach(city => {
        wrongAnswers.push({ text: city, kind: "wrong" });
        used.add(city);
      });

      // Safety Fallback: If decoy files run short, pad with other US capitals
      if (wrongAnswers.length < 3) {
        const otherCapitals = localShuffle(entities.map(e => e.capital).filter(c => c !== correctCapital));
        for (const city of otherCapitals) {
          if (wrongAnswers.length < 3 && !used.has(city)) {
            wrongAnswers.push({ text: city, kind: "wrong" });
            used.add(city);
          }
        }
      }
    } else {
      // ADVANCED (Default): Exactly 1 state decoy + 2 global capitals
      if (decoys.length > 0) {
        wrongAnswers.push({ text: decoys[0], kind: "preferredWrong" });
        used.add(decoys[0]);
      } else {
        const otherCapitals = localShuffle(entities.map(e => e.capital).filter(c => c !== correctCapital));
        if (otherCapitals.length > 0) {
          wrongAnswers.push({ text: otherCapitals[0], kind: "preferredWrong" });
          used.add(otherCapitals[0]);
        }
      }

      for (const city of shuffledGlobal) {
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

// Boot the engine
  new QuizEngine(config);
