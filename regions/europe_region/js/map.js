import { regionData } from "../data/europe.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "europe",
  regionName: "Europe",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/europe.svg",
  starRadii: [6, 3],
  starStrokeWidth: 0.5,
  onSvgLoad: (svgRoot) => {
    svgRoot.setAttribute(
      "style",
      "transform: translateY(55px) scale(1.10); transform-origin: center center;"
    );
  }
};

new QuizEngine(config);
