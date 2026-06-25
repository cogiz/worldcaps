import { regionData } from "../data/australia.js";
import { GLOBAL_CAPITALS } from "../data/global_capitals.js";
import { QuizEngine } from "../../../shared/js/quizEngine.js";

const config = {
  regionId: "australia",
  regionName: "Australia",
  regionData: regionData,
  globalCapitals: GLOBAL_CAPITALS,
  svgPath: "./assets/maps/australia.svg",
  starRadii: [8, 4],
  starStrokeWidth: 1.2,
  onSvgLoad: (svgRoot) => {
    const mapWrap = document.getElementById("mapWrap");
    const wrapHeight = mapWrap ? mapWrap.clientHeight : 600;
    svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgRoot.style.width = "100%";
    svgRoot.style.height = (wrapHeight - 50) + "px";
    svgRoot.style.display = "block";
    svgRoot.style.margin = "0 auto";
  },
  formatQuestion: (state) => {
    return state.id === "AUACT"
      ? "What is the National Capital of Australia?"
      : `What is the Capital of ${state.name}?`;
  }
};

new QuizEngine(config);
