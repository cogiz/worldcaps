import { regionData } from "../data/central_america.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "central_america",
  regionName: "Central America",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/central_america.svg",
  starRadii: [2, 1],
  starStrokeWidth: 0.3
};

new QuizEngine(config);
