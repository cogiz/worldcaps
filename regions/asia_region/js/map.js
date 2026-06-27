import { regionData } from "../data/asia.js";
import { ASIA_DECOY_CITIES } from "../data/asia_decoy_cities.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "asia",
  regionName: "Asia",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/asia.svg",
  starRadii: [4, 2],
  starStrokeWidth: 0,
  hasGeniusMode: true, // Tells the shared engine to expose the premium level
  
  formatQuestion: (country) => {
    return `What is the capital of ${country.name}?`;
  },
  
  buildAnswers: (country, globalCapitals, difficulty, entities) => {
    const correctCapital = String(country.capital).trim();
    const countryDecoys = ASIA_DECOY_CITIES[country.id] || [];
    
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
      // BEGINNER: 0 country decoys + 3 global capitals
      for (const city of shuffledGlobal) {
        if (wrongAnswers.length < 3 && !used.has(city)) {
          wrongAnswers.push({ text: city, kind: "wrong" });
          used.add(city);
        }
      }
    } else if (difficulty === "genius") {
      // GENIUS: 3 country decoys + 0 global capitals
      const slicedDecoys = countryDecoys.slice(0, 3);
      slicedDecoys.forEach(city => {
        wrongAnswers.push({ text: city, kind: "wrong" });
        used.add(city);
      });

      // Safety Fallback: If decoy files run short, pad with adjacent Asian capitals
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
      // ADVANCED: Exactly 1 country decoy + 2 global capitals
      if (countryDecoys.length > 0) {
        wrongAnswers.push({ text: countryDecoys[0], kind: "preferredWrong" });
        used.add(countryDecoys[0]);
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

new QuizEngine(config);
