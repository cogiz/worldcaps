// regions/africa_region/js/map.js

import { regionData } from "../data/africa.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "africa",
  regionName: "Africa",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/africa.svg",
  starRadii: [8, 4],
  starStrokeWidth: 1.2,
  onSvgLoad: (svgRoot) => {
    svgRoot.setAttribute(
      "style",
      "transform: translateY(20px) scale(0.80); transform-origin: center center;"
    );
  }
};

// Boot the engine
new QuizEngine(config);

