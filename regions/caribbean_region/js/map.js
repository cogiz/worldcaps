import { regionData } from "../data/caribbean.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "caribbean",
  regionName: "Caribbean",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/caribbean.svg",
  starRadii: [6, 4],
  starStrokeWidth: 0
};

new QuizEngine(config);
