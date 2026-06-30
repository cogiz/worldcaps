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
  
   formatQuestion: (entity, difficulty) => {
    if (difficulty === "genius") {
      return "What is the name of this highlighted province?"; 
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
    const countryDecoys = CANADA_PROVINCE_DECOYS[entity.id] || []; // <-- CHANGE THIS VARIABLE PER REGION!
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

// Start the region
new QuizEngine(config);
