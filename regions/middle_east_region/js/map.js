import { regionData } from "../data/middle_east.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "middle_east",
  regionName: "Middle East",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/middle_east.svg",
  starRadii: [1, 0.5],
  starStrokeWidth: 0
};

new QuizEngine(config);
