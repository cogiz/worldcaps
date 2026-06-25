// shared/js/quizEngine.js

// d3 is loaded globally via <script> in each region index.html
const d3 = window.d3;

export class QuizEngine {
  constructor(config) {
    try {
      this.config = config;
      
      // Standardize data access
      this.entities = config.regionData.countries || config.regionData.states || config.regionData.locations;
      if (!this.entities) throw new Error("regionData is missing countries, states, or locations");

      this.totalQuestions = this.entities.length;
      
      this.currentIndex = 0;
      this.score = 0;
      this.locked = false;
      this.hintUsed = false;
      this.actionDebounce = false; // Prevents rapid cross-button spamming
      this.isFinished = false;     // Prevents multiple completion events
      this.difficultyLocked = false; // Locks the difficulty for the entire region session
      this.svgRoot = null;
      this.capitalStar = null;
      this.currentEntity = null;

      this.mapWrap = document.getElementById("mapWrap");
      this.qaPanel = document.getElementById("qaPanel");
      this.questionBox = document.getElementById("questionBox");
      this.answerBtns = Array.from(document.querySelectorAll(".answerBtn"));
      this.hintBtn = document.getElementById("hintBtn");
      this.nextBtn = document.getElementById("nextBtn");
      this.scoreEl = document.getElementById("qaScore");

      // Save original hint button text securely
      this.originalHintText = this.hintBtn ? this.hintBtn.textContent : "HINT";

      // A container to store our dynamically created difficulty buttons
      this.diffContainer = null;

      const _audioBase = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) + "../../assets/audio/";
      this.audioCorrect = new Audio(_audioBase + "correct_answer.mp3");
      this.audioWrong = new Audio(_audioBase + "wrong_answer.mp3");
      this.audioClick = new Audio(_audioBase + "generic_click.mp3");
      this.audioSuccess = new Audio(_audioBase + "region_success.mp3");
      this.audioSuccess.preload = "auto";

      if (this.hintBtn) this.hintBtn.onclick = () => this.handleHint();
      if (this.nextBtn) this.nextBtn.onclick = () => this.handleNext();

      this.init();
    } catch (err) {
      this.showError("INIT ERROR: " + err.message);
    }
  }

  showError(msg) {
    if (this.qaPanel) this.qaPanel.style.visibility = "visible";
    const qb = document.getElementById("questionBox");
    if (qb) {
      qb.textContent = msg;
      qb.style.color = "#ff4444";
      qb.style.backgroundColor = "#222";
    }
    console.error(msg);
  }

  init() {
    if (this.qaPanel) this.qaPanel.style.visibility = "visible";
    this.updateScore();

    // Inject Difficulty Selector into the layout using game theme colors
    this.renderDifficultyUI();

    // Put game elements in standby before difficulty selection
    if (this.questionBox) {
      this.questionBox.textContent = "CHOOSE A DIFFICULTY LEVEL TO START";
    }
    this.answerBtns.forEach(btn => {
      btn.textContent = "";
      btn.style.backgroundColor = "";
      btn.style.color = "";
      btn.classList.add("disabled");
    });
    if (this.hintBtn) {
      this.hintBtn.disabled = true;
      this.hintBtn.style.cursor = "not-allowed";
    }

    // Resolve SVG path to absolute using the region page's location
    let finalSvgPath = this.config.svgPath;
    if (finalSvgPath.startsWith("./")) {
      const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
      finalSvgPath = base + finalSvgPath.substring(2);
    }

    d3.xml(finalSvgPath)
      .then(data => {
        if (!data || !data.documentElement) throw new Error("SVG data is empty");
        this.svgRoot = data.documentElement;
        
        const existing = this.mapWrap.querySelector("svg");
        if (existing) existing.remove();

        if (this.config.onSvgLoad) {
          this.config.onSvgLoad(this.svgRoot);
        }

        this.mapWrap.prepend(this.svgRoot);
        this.createCapitalStar();
      })
      .catch(err => {
        this.showError(`Failed to load map: ${finalSvgPath}. Check your file paths!`);
      });
  }

  // Dynamic UI builder for the difficulty buttons
  renderDifficultyUI() {
    if (!this.qaPanel || !this.questionBox) return;

    // Remove old panel if it somehow exists
    if (this.diffContainer) this.diffContainer.remove();

    this.diffContainer = document.createElement("div");
    this.diffContainer.id = "difficultyPanel";
    
    // Minimal layout styles using theme matching colors
    Object.assign(this.diffContainer.style, {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginBottom: "12px",
      width: "100%"
    });

    // Ensure a default starting level exists
    this.config.difficulty = this.config.difficulty || "advanced";

    const levels = ["beginner", "advanced"];
    if (this.config.hasGeniusMode) {
      levels.push("genius");
    }

    levels.forEach(level => {
      const btn = document.createElement("button");
      btn.textContent = level.toUpperCase();
      
      // Standby style: black background with neon green borders/text
      const setNormalStyle = () => {
        Object.assign(btn.style, {
          padding: "6px 14px",
          backgroundColor: "#000000",
          color: "#00FF00",
          border: "2px solid #00FF00",
          fontFamily: "inherit",
          fontWeight: "bold",
          fontSize: "0.85rem",
          cursor: this.difficultyLocked ? "not-allowed" : "pointer",
          borderRadius: "0px", 
          transition: "all 0.1s ease-in-out",
          opacity: this.difficultyLocked && this.config.difficulty !== level ? "0.5" : "1"
        });
      };

      // Active state style: fully inverted green fill with dark text
      const setActiveStyle = () => {
        Object.assign(btn.style, {
          padding: "6px 14px",
          backgroundColor: "#00FF00",
          color: "#000000",
          border: "2px solid #00FF00",
          fontFamily: "inherit",
          fontWeight: "900",
          fontSize: "0.85rem",
          cursor: this.difficultyLocked ? "not-allowed" : "pointer",
          borderRadius: "0px",
          opacity: "1"
        });
      };

      if (this.difficultyLocked && this.config.difficulty === level) {
        setActiveStyle();
      } else {
        setNormalStyle();
      }

      // Quick hover animations (only apply if the difficulty isn't locked yet)
      btn.onmouseenter = () => {
        if (!this.difficultyLocked) {
          btn.style.backgroundColor = "#222222";
        }
      };
      btn.onmouseleave = () => {
        if (!this.difficultyLocked) {
          btn.style.backgroundColor = "#000000";
        }
      };

      btn.onclick = () => {
        // Reject clicks completely if difficulty is locked for this region session
        if (this.difficultyLocked || this.actionDebounce) return;
        
        this.safePlay(this.audioClick);
        this.config.difficulty = level;
        this.difficultyLocked = true; // Lock choice instantly

        // Clean and update active button visual status across the bar
        Array.from(this.diffContainer.children).forEach((childNode, index) => {
          if (levels[index] === level) {
            childNode.style.backgroundColor = "#00FF00";
            childNode.style.color = "#000000";
            childNode.style.fontWeight = "900";
            childNode.style.opacity = "1";
          } else {
            childNode.style.backgroundColor = "#000000";
            childNode.style.color = "#00FF00";
            childNode.style.fontWeight = "bold";
            childNode.style.opacity = "0.5";
            childNode.style.cursor = "not-allowed";
          }
        });

        // Fire engine and pull the questions down
        this.loadQuestion();
      };

      this.diffContainer.appendChild(btn);
    });

    // Injects the selection row neatly right before the main question display box
    this.qaPanel.insertBefore(this.diffContainer, this.questionBox);
  }

 loadQuestion() {
    try {
      this.resetUI();

      if (this.currentIndex >= this.totalQuestions) {
        this.regionComplete();
        return;
      }

      this.currentEntity = this.entities[this.currentIndex];

      if (this.config.formatQuestion) {
        this.questionBox.textContent = this.config.formatQuestion(this.currentEntity);
      } else {
        this.questionBox.textContent = `What is the Capital of ${this.currentEntity.name}?`;
      }

      this.highlightRegion(this.currentEntity.id);
      this.moveCapitalStar(this.currentEntity.x, this.currentEntity.y);

      // Ensure a default difficulty exists
      this.config.difficulty = this.config.difficulty || "advanced";

      // Premium UI updates based on mode choice
      if (this.hintBtn) {
        if (this.config.difficulty === "genius") {
          this.hintBtn.disabled = true;
          this.hintBtn.textContent = "HINTS LOCKED";
          this.hintBtn.style.cursor = "not-allowed";
        } else {
          // Restore native themes for Beginner and Advanced modes
          this.hintBtn.disabled = false;
          this.hintBtn.textContent = this.originalHintText;
          this.hintBtn.style.cursor = "";
        }
      }

      let answersData;
      if (this.config.buildAnswers) {
        answersData = this.config.buildAnswers(this.currentEntity, this.config.globalCapitals, this.config.difficulty, this.entities);
      } else {
        answersData = this.defaultBuildAnswers(this.currentEntity.capital, this.config.difficulty);
      }

      this.answerBtns.forEach((btn, i) => {
        const ans = answersData[i];
        if (!ans) return;
        btn.textContent = ans.text;
        btn.dataset.value = ans.text;
        btn.dataset.kind = ans.kind;
        btn.onclick = () => this.handleAnswer(btn, ans);
      });
    } catch (err) {
      this.showError("QUESTION ERROR: " + err.message);
    }
  }

  defaultBuildAnswers(correctCapital, difficulty) {
    const localCapitals = this.entities.map(e => e.capital);
    let wrongAnswers = [];

    if (difficulty === "genius" || difficulty === "advanced") {
      const regionalPool = localCapitals.filter(c => c !== correctCapital);
      wrongAnswers = this.shuffle(regionalPool).slice(0, 3);
      
      if (wrongAnswers.length < 3) {
        const globalPool = this.config.globalCapitals.filter(c => !localCapitals.includes(c));
        const padding = this.shuffle(globalPool).slice(0, 3 - wrongAnswers.length);
        wrongAnswers = [...wrongAnswers, ...padding];
      }
    } else {
      const globalPool = this.config.globalCapitals.filter(c => !localCapitals.includes(c));
      wrongAnswers = this.shuffle(globalPool).slice(0, 3);
    }

    const picks = wrongAnswers.map(text => ({ text, kind: "wrong" }));
    const correct = { text: correctCapital, kind: "correct" };
    
    return this.shuffle([correct, ...picks]);
  }

  handleAnswer(btn, ans) {
    if (this.locked || this.actionDebounce) return;
    this.actionDebounce = true;
    this.locked = true;

    // Force hint button down immediately when an answer choice is committed
    if (this.hintBtn) {
      this.hintBtn.disabled = true;
      this.hintBtn.style.cursor = "not-allowed";
    }

    btn.blur(); 

    const isCorrect = ans.text === this.currentEntity.capital;

    if (isCorrect) {
      this.safePlay(this.audioCorrect);
      this.score++;
      this.updateScore();

      btn.style.backgroundColor = "#00FF00";
      btn.style.color = "#000";
      btn.innerHTML = `<span>${btn.textContent}</span><span style="float:right;font-weight:900;">✔</span>`;
    } else {
      this.safePlay(this.audioWrong);
      btn.style.backgroundColor = "#FF0000";
      btn.style.color = "#000";
      btn.innerHTML = `<span>${btn.textContent}</span><span style="float:right;font-weight:900;">✕</span>`;

      if (this.hintUsed) {
        const correctBtn = this.answerBtns.find(b => b.dataset.kind === "correct");
        if (correctBtn) {
          correctBtn.style.backgroundColor = "#00FF00";
          correctBtn.style.color = "#000";
          correctBtn.innerHTML = `<span>${correctBtn.textContent}</span><span style="float:right;font-weight:900;">✔</span>`;
        }
      }
    }

    this.answerBtns.forEach(b => b.classList.add("disabled"));

    setTimeout(() => {
      this.actionDebounce = false;
    }, 400);
  }

  handleHint() {
    if (this.locked || this.hintUsed || this.actionDebounce) return;
    this.actionDebounce = true;
    this.hintUsed = true;
    
    // Disable the hint button without changing colors
    if (this.hintBtn) {
      this.hintBtn.disabled = true;
      this.hintBtn.style.cursor = "not-allowed";
      this.hintBtn.blur(); 
    }
    
    this.safePlay(this.audioClick);

    const hasPreferredWrong = this.answerBtns.some(b => b.dataset.kind === "preferredWrong");
    const wrongBtns = this.answerBtns.filter(b => b.dataset.kind === "wrong");

    if (hasPreferredWrong) {
      wrongBtns.forEach(btn => btn.classList.add("hint-disabled"));
    } else {
      this.shuffle(wrongBtns).slice(0, 2).forEach(btn => {
        btn.classList.add("hint-disabled");
      });
    }

    setTimeout(() => {
      this.actionDebounce = false;
    }, 300);
  }

  handleNext() {
    if (!this.locked || this.actionDebounce) return;
    this.actionDebounce = true;
    this.safePlay(this.audioClick);
    
    if (this.nextBtn) this.nextBtn.blur(); 

    this.currentIndex++;
    this.loadQuestion();

    setTimeout(() => {
      this.actionDebounce = false;
    }, 400);
  }

  regionComplete() {
    if (this.isFinished) return;
    this.isFinished = true;

    if (this.diffContainer) {
      this.diffContainer.style.display = "none";
    }

    const isPerfect = this.score === this.totalQuestions;
    const percentage = this.totalQuestions > 0 ? Math.round((this.score / this.totalQuestions) * 100) : 0;

    this.questionBox.textContent = isPerfect 
      ? `${this.config.regionName || "Region"} completed 100% correct!` 
      : `${this.config.regionName || "Region"} completed ${percentage}% correct!`;
    
    this.questionBox.style.backgroundColor = "#00FF00";
    this.questionBox.style.color = "#000";

    this.answerBtns.forEach(btn => btn.style.display = "none");
    if (this.hintBtn) this.hintBtn.style.display = "none";
    if (this.nextBtn) this.nextBtn.style.display = "none";

    this.clearMapStyles();
    if (this.capitalStar) {
      this.capitalStar.remove();
      this.capitalStar = null;
    }

    try {
      window.parent.postMessage({
        type: "REGION_COMPLETE",
        regionId: this.config.regionId,
        score: this.score,
        total: this.totalQuestions,
        percentage: percentage,
        perfect: isPerfect
      }, "*");
    } catch (err) {
      console.warn("postMessage failed:", err);
    }

    if (isPerfect) {
      this.safePlay(this.audioSuccess);
      if (typeof window.launchPerfectGeographyVictory === "function") {
        window.launchPerfectGeographyVictory();
      }
    }
  }

  createCapitalStar() {
    let targetContainer = this.svgRoot.querySelector("g"); 
    if (!targetContainer) {
      targetContainer = this.svgRoot;
    }

    this.capitalStar = d3.select(targetContainer)
      .append("polygon")
      .attr("fill", "#FF0000")
      .attr("stroke", "#000")
      .attr("stroke-width", this.config.starStrokeWidth !== undefined ? this.config.starStrokeWidth : 1.2)
      .style("pointer-events", "none")
      .style("display", "none");
  }

  moveCapitalStar(x, y) {
    if (!this.capitalStar) return;
    
    let cx = parseFloat(x);
    let cy = parseFloat(y);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;

    const [outerR, innerR] = this.config.starRadii || [8, 4];
    const points = this.buildStarPoints(cx, cy, outerR, innerR);
    if (points) {
      this.capitalStar.attr("points", points).style("display", "block");
    }
  }

  buildStarPoints(cx, cy, outerR, innerR) {
    cx = parseFloat(cx);
    cy = parseFloat(cy);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return "";

    const pts = [];
    const step = Math.PI / 5;
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = i * step - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return pts.join(" ");
  }

  highlightRegion(id) {
    this.clearMapStyles();
    const path = this.svgRoot.querySelector(`#${this.cssEscape(id)}`);
    if (path) path.style.fill = "#00FF00";
  }

  clearMapStyles() {
    if (this.svgRoot) {
      d3.select(this.svgRoot).selectAll("path").style("fill", null);
    }
  }

  resetUI() {
    this.locked = false;
    this.hintUsed = false;
    
    if (this.nextBtn) this.nextBtn.disabled = false;

    this.answerBtns.forEach(btn => {
      btn.textContent = "";
      btn.style.backgroundColor = "";
      btn.style.color = "";
      btn.classList.remove("correct", "wrong", "disabled", "hint-disabled");
      delete btn.dataset.kind;
      delete btn.dataset.value;
    });
  }

  updateScore() {
    if (this.scoreEl) {
      this.scoreEl.textContent = `${this.score} / ${this.totalQuestions}`;
    }
  }

  safePlay(audio) {
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch (e) {}
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  cssEscape(value) {
    return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }
}
