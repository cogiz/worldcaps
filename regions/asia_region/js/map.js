import { regionData } from "../data/asia.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "asia",
  regionName: "Asia",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/asia.svg",
  starRadii: [4, 2],
  starStrokeWidth: 0
};

new QuizEngine(config);
