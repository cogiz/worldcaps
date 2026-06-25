import { regionData } from "../data/south_america.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "south_america",
  regionName: "South America",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/south_america.svg",
  starRadii: [2, 1],
  starStrokeWidth: 0.2,
  onSvgLoad: (svgRoot) => {
    svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgRoot.style.width = "100%";
    svgRoot.style.height = "100%";
  }
};

new QuizEngine(config);
