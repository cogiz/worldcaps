// regions/canada_region/js/map.js

import { regionData } from "../data/canada.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { CANADA_PROVINCE_DECOYS } from "../data/canada_province_decoys.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "canada",
  regionName: "Canada",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/canada.svg",
  starRadii: [8, 4],
  starStrokeWidth: 1,
  hasGeniusMode: true, // Tells the shared engine to expose the premium level
  
  onSvgLoad: (svgRoot) => {
    // --- FORCE INJECT VIEWBOX TO FIX COORDINATE PLANE ALIGNMENT ---
    if (!svgRoot.getAttribute("viewBox")) {
      const widthAttr = svgRoot.getAttribute("width");
      const heightAttr = svgRoot.getAttribute("height");
      
      if (widthAttr && heightAttr) {
        svgRoot.setAttribute("viewBox", `0 0 ${parseFloat(widthAttr)} ${parseFloat(heightAttr)}`);
      } else {
        const bbox = svgRoot.getBBox();
        svgRoot.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      }
    }
    // --- END OF VIEWBOX FIX ---

    svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgRoot.style.width = "100%";
    svgRoot.style.height = "100%";
    svgRoot.style.maxWidth = "100vw";
    svgRoot.style.maxHeight = "100vh";
    svgRoot.style.display = "block";
    svgRoot.style.margin = "0 auto";
    svgRoot.style.marginTop = "0px";
  },
  
  formatQuestion: (province) => {
    return `What is the capital of ${province.name}?`;
  },
  
  buildAnswers: (province, globalCapitals, difficulty, entities) => {
    const correctCapital = String(province.capital).trim();
    const provinceDecoys = CANADA_PROVINCE_DECOYS[province.id] || [];
    
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
      // BEGINNER: 0 province decoys + 3 global capitals
      for (const city of shuffledGlobal) {
        if (wrongAnswers.length < 3 && !used.has(city)) {
          wrongAnswers.push({ text: city, kind: "wrong" });
          used.add(city);
        }
      }
    } else if (difficulty === "genius") {
      // GENIUS: 3 province decoys + 0 global capitals
      const slicedDecoys = provinceDecoys.slice(0, 3);
      slicedDecoys.forEach(city => {
        wrongAnswers.push({ text: city, kind: "wrong" });
        used.add(city);
      });

      // Safety Fallback: If decoy files run short, pad with adjacent Canadian capitals
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
      // ADVANCED: Exactly 1 province decoy + 2 global capitals
      if (provinceDecoys.length > 0) {
        wrongAnswers.push({ text: provinceDecoys[0], kind: "preferredWrong" });
        used.add(provinceDecoys[0]);
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

// Start the region
new QuizEngine(config);
