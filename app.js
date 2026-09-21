/*
  RAFAELA GYM V2.1
  Application Controller

  Adds:
  - adaptive recommendation
  - scenario training
  - scoring
  - learning ledger
  - recommended-position reveal
  - recommended zone
  - target marker
  - movement arrow
  - answer comparison

  IMPORTANT:
  Recommended positioning is derived from the
  current simulated scenario evaluator.

  It is NOT a claim that one exact coordinate is
  universally correct in real MLBB gameplay.
*/


window.RafaelaApp = {

  currentScenario: null,

  currentPosition: null,

  currentSessionId: null,

  currentRep: 0,

  targetReps: 5,

  sessionResults: [],

  currentRecommendedAnswer: null,


  /*
    ==================================================
    STARTUP
    ==================================================
  */


  ready:
    function() {

      return Boolean(
        window.RafaelaCurriculum
        &&
        window.RafaelaStorage
        &&
        window.RafaelaTrainer
        &&
        window.RafaelaScenarios
      );

    },


  init:
    function() {

      if (
        !this.ready()
      ) {

        console.error(
          "Rafaela Gym could not start because one or more core modules are missing."
        );

        this.showFatalError(
          "Rafaela Gym could not load its training systems."
        );

        return;

      }


      window.RafaelaStorage
        .ensureCurriculumConcepts();


      this.bindNavigation();


      this.renderDashboard();


      this.showScreen(
        "home"
      );

    },


  /*
    ==================================================
    BASIC DOM HELPERS
    ==================================================
  */


  byId:
    function(id) {

      return document.getElementById(
        id
      );

    },


  setText:
    function(
      id,
      value
    ) {

      const element =
        this.byId(
          id
        );


      if (
        element
      ) {

        element.textContent =
          value;

      }

    },


  show:
    function(id) {

      const element =
        this.byId(
          id
        );


      if (
        element
      ) {

        element.hidden =
          false;

      }

    },


  hide:
    function(id) {

      const element =
        this.byId(
          id
        );


      if (
        element
      ) {

        element.hidden =
          true;

      }

    },


  /*
    ==================================================
    SCREEN NAVIGATION
    ==================================================
  */


  showScreen:
    function(
      screenName
    ) {

      const screens =
        document.querySelectorAll(
          "[data-screen]"
        );


      screens.forEach(
        function(screen) {

          screen.hidden =
            true;

        }
      );


      const requested =
        document.querySelector(
          `[data-screen="${screenName}"]`
        );


      if (
        requested
      ) {

        requested.hidden =
          false;

      }


      const navButtons =
        document.querySelectorAll(
          "[data-nav]"
        );


      navButtons.forEach(
        function(button) {

          button.classList.toggle(
            "active",
            button.dataset.nav ===
              screenName
          );

        }
      );


      window.scrollTo(
        {
          top: 0,
          behavior: "smooth"
        }
      );

    },


  bindNavigation:
    function() {

      const navButtons =
        document.querySelectorAll(
          "[data-nav]"
        );


      navButtons.forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const destination =
                button.dataset.nav;


              if (
                destination ===
                "home"
              ) {

                this.renderDashboard();

              }


              if (
                destination ===
                "progress"
              ) {

                this.renderProgress();

              }


              if (
                destination ===
                "doctrine"
              ) {

                this.renderDoctrine();

              }


              this.showScreen(
                destination
              );

            }
          );

        }
      );


      const startButton =
        this.byId(
          "startWorkoutButton"
        );


      if (
        startButton
      ) {

        startButton.addEventListener(
          "click",
          () => {

            this.startWorkout();

          }
        );

      }


      const quickTrainButton =
        this.byId(
          "quickTrainButton"
        );


      if (
        quickTrainButton
      ) {

        quickTrainButton.addEventListener(
          "click",
          () => {

            this.startWorkout(
              {
                reps: 3
              }
            );

          }
        );

      }


      const evaluateButton =
        this.byId(
          "evaluateButton"
        );


      if (
        evaluateButton
      ) {

        evaluateButton.addEventListener(
          "click",
          () => {

            this.evaluateCurrentPosition();

          }
        );

      }


      const nextRepButton =
        this.byId(
          "nextRepButton"
        );


      if (
        nextRepButton
      ) {

        nextRepButton.addEventListener(
          "click",
          () => {

            this.nextRep();

          }
        );

      }


      const finishButton =
        this.byId(
          "finishWorkoutButton"
        );


      if (
        finishButton
      ) {

        finishButton.addEventListener(
          "click",
          () => {

            this.finishWorkout();

          }
        );

      }


      const board =
        this.byId(
          "battlefield"
        );


      if (
        board
      ) {

        board.addEventListener(
          "pointerdown",
          (event) => {

            this.moveRafaela(
              event
            );

          }
        );

      }

    },


  /*
    ==================================================
    DASHBOARD
    ==================================================
  */


  renderDashboard:
    function() {

      const recommendation =
        window.RafaelaTrainer
          .getDashboardRecommendation();


      const summary =
        window.RafaelaStorage
          .getProgressSummary();


      if (
        !recommendation.ready
      ) {

        this.setText(
          "recommendedConcept",
          "Training system preparing"
        );


        this.setText(
          "recommendedReason",
          recommendation.message
        );

      }

      else {

        this.setText(
          "recommendedConcept",
          recommendation.conceptName
        );


        const reason =
          recommendation.reasons
            .join(
              " · "
            );


        this.setText(
          "recommendedReason",
          reason
        );


        this.setText(
          "recommendedDomain",
          recommendation.domain
        );


        this.setText(
          "recommendedActivity",
          this.activityLabel(
            recommendation.recommendedActivity
          )
        );

      }


      this.setText(
        "reviewsDue",
        String(
          summary.reviewsDue
        )
      );


      this.setText(
        "totalConcepts",
        String(
          summary.totalConcepts
        )
      );


      const applied =
        summary.scenarioApplication
        +
        summary.gameplayEvidence
        +
        summary.consistencyEvidence;


      this.setText(
        "appliedConcepts",
        String(
          applied
        )
      );


      const gameplay =
        summary.gameplayEvidence
        +
        summary.consistencyEvidence;


      this.setText(
        "gameplayEvidenceCount",
        String(
          gameplay
        )
      );

    },


  activityLabel:
    function(
      activity
    ) {

      const labels = {

        retrieve:
          "Retrieve",

        learn:
          "Learn",

        examine:
          "Examine",

        apply:
          "Apply",

        interleave:
          "Mixed Practice",

        capture:
          "Capture"

      };


      return (
        labels[
          activity
        ]
        ||
        activity
      );

    },


  /*
    ==================================================
    WORKOUT
    ==================================================
  */


  startWorkout:
    function(options) {

      const config =
        options
        ||
        {};


      this.targetReps =
        Number(
          config.reps
        )
        ||
        5;


      this.currentRep =
        0;


      this.sessionResults =
        [];


      this.currentRecommendedAnswer =
        null;


      this.currentSessionId =
        window.RafaelaStorage
          .startSession();


      this.showScreen(
        "train"
      );


      this.nextRep();

    },


  nextRep:
    function() {

      if (
        this.currentRep >=
        this.targetReps
      ) {

        this.showWorkoutComplete();

        return;

      }


      this.currentRep++;


      this.currentRecommendedAnswer =
        null;


      this.currentScenario =
        window.RafaelaScenarios
          .generateNextTrainingScenario();


      if (
        !this.currentScenario
      ) {

        this.showFatalError(
          "No training scenario could be generated."
        );

        return;

      }


      this.currentPosition = {

        x:
          this.currentScenario
            .startPosition.x,

        y:
          this.currentScenario
            .startPosition.y

      };


      this.renderScenario();


      this.removeAnswerExplanation();


      this.hide(
        "feedbackPanel"
      );


      this.hide(
        "finishWorkoutButton"
      );


      this.show(
        "evaluateButton"
      );


      this.hide(
        "nextRepButton"
      );

    },


  /*
    ==================================================
    SCENARIO RENDERING
    ==================================================
  */


  renderScenario:
    function() {

      const scenario =
        this.currentScenario;


      this.setText(
        "repCounter",
        `Rep ${this.currentRep} / ${this.targetReps}`
      );


      this.setText(
        "scenarioTitle",
        scenario.title
      );


      this.setText(
        "scenarioInstruction",
        scenario.instruction
      );


      this.setText(
        "scenarioDifficulty",
        scenario.difficultyName
      );


      if (
        scenario.selection
      ) {

        this.setText(
          "scenarioConcept",
          scenario.selection
            .conceptName
        );


        this.setText(
          "scenarioDomain",
          scenario.selection
            .domainName
        );

      }


      this.renderInformationList(
        "factsList",
        scenario.facts
      );


      this.renderInformationList(
        "inferencesList",
        scenario.inferences
      );


      this.renderInformationList(
        "unknownsList",
        scenario.unknowns
      );


      this.renderBattlefield();

    },


  renderInformationList:
    function(
      elementId,
      values
    ) {

      const container =
        this.byId(
          elementId
        );


      if (
        !container
      ) {

        return;

      }


      container.innerHTML =
        "";


      (
        values
        ||
        []
      ).forEach(
        function(value) {

          const item =
            document.createElement(
              "li"
            );


          item.textContent =
            value;


          container.appendChild(
            item
          );

        }
      );

    },


  renderBattlefield:
    function() {

      const board =
        this.byId(
          "battlefield"
        );


      if (
        !board
      ) {

        return;

      }


      board.innerHTML =
        "";


      const river =
        document.createElement(
          "div"
        );


      river.className =
        "map-river";


      board.appendChild(
        river
      );


      const bushOne =
        document.createElement(
          "div"
        );


      bushOne.className =
        "map-bush bush-one";


      board.appendChild(
        bushOne
      );


      const bushTwo =
        document.createElement(
          "div"
        );


      bushTwo.className =
        "map-bush bush-two";


      board.appendChild(
        bushTwo
      );


      (
        this.currentScenario
          .actors
        ||
        []
      )
        .forEach(
          (actor) => {

            if (
              actor.visible ===
              false
            ) {

              this.renderUnknownMarker(
                actor
              );

              return;

            }


            const element =
              document.createElement(
                "div"
              );


            element.className =
              "battle-actor "
              +
              this.actorClass(
                actor.type
              );


            element.style.left =
              actor.x
              +
              "%";


            element.style.top =
              actor.y
              +
              "%";


            element.textContent =
              actor.short;


            element.title =
              actor.label;


            board.appendChild(
              element
            );

          }
        );


      const rafaela =
        document.createElement(
          "div"
        );


      rafaela.id =
        "rafaelaMarker";


      rafaela.className =
        "battle-actor rafaela-marker";


      rafaela.textContent =
        "R";


      rafaela.style.left =
        this.currentPosition.x
        +
        "%";


      rafaela.style.top =
        this.currentPosition.y
        +
        "%";


      board.appendChild(
        rafaela
      );

    },


  renderUnknownMarker:
    function(actor) {

      const board =
        this.byId(
          "battlefield"
        );


      if (
        !board
      ) {

        return;

      }


      const marker =
        document.createElement(
          "div"
        );


      marker.className =
        "unknown-threat-marker";


      marker.textContent =
        "?";


      if (
        actor.x < 50
      ) {

        marker.style.left =
          "5%";

      }

      else {

        marker.style.left =
          "95%";

      }


      marker.style.top =
        "38%";


      board.appendChild(
        marker
      );

    },


  actorClass:
    function(type) {

      const classes = {

        priorityAlly:
          "actor-ally",

        frontline:
          "actor-frontline",

        damageAlly:
          "actor-damage",

        enemyThreat:
          "actor-threat",

        secondaryThreat:
          "actor-enemy",

        objective:
          "actor-objective"

      };


      return (
        classes[
          type
        ]
        ||
        "actor-neutral"
      );

    },


  /*
    ==================================================
    MOVEMENT
    ==================================================
  */


  moveRafaela:
    function(event) {

      if (
        !this.currentScenario
      ) {

        return;

      }


      const feedback =
        this.byId(
          "feedbackPanel"
        );


      /*
        Once the answer is evaluated,
        lock Rafaela's submitted position.

        This makes the visual comparison honest:
        submitted answer versus recommended answer.
      */

      if (
        feedback
        &&
        !feedback.hidden
      ) {

        return;

      }


      const board =
        this.byId(
          "battlefield"
        );


      if (
        !board
      ) {

        return;

      }


      const rect =
        board.getBoundingClientRect();


      const x =
        (
          (
            event.clientX
            -
            rect.left
          )
          /
          rect.width
        )
        *
        100;


      const y =
        (
          (
            event.clientY
            -
            rect.top
          )
          /
          rect.height
        )
        *
        100;


      this.currentPosition = {

        x:
          window.RafaelaScenarios
            .clamp(
              x,
              3,
              97
            ),

        y:
          window.RafaelaScenarios
            .clamp(
              y,
              3,
              97
            )

      };


      const marker =
        this.byId(
          "rafaelaMarker"
        );


      if (
        marker
      ) {

        marker.style.left =
          this.currentPosition.x
          +
          "%";


        marker.style.top =
          this.currentPosition.y
          +
          "%";

      }

    },


  /*
    ==================================================
    EVALUATION
    ==================================================
  */


  evaluateCurrentPosition:
    function() {

      if (
        !this.currentScenario
        ||
        !this.currentPosition
      ) {

        return;

      }


      const submittedPosition = {

        x:
          this.currentPosition.x,

        y:
          this.currentPosition.y

      };


      const result =
        window.RafaelaScenarios
          .evaluatePosition(
            this.currentScenario,
            submittedPosition
          );


      this.sessionResults.push(
        result
      );


      window.RafaelaStorage
        .recordApplication(
          result.conceptId,
          result.successful
        );


      if (
        !result.successful
        &&
        result.feedback
        &&
        result.feedback.action
      ) {

        window.RafaelaStorage
          .recordCorrection(
            result.conceptId,
            result.feedback.action,
            "decision_practice"
          );

      }


      /*
        Find the strongest position according to
        the exact same simulated evaluator that
        graded the submitted answer.
      */

      this.currentRecommendedAnswer =
        this.findRecommendedAnswer(
          this.currentScenario,
          submittedPosition,
          result
        );


      this.renderFeedback(
        result
      );


      this.revealRecommendedAnswer(
        submittedPosition,
        result,
        this.currentRecommendedAnswer
      );


      this.show(
        "feedbackPanel"
      );


      this.hide(
        "evaluateButton"
      );


      if (
        this.currentRep >=
        this.targetReps
      ) {

        this.show(
          "finishWorkoutButton"
        );


        this.hide(
          "nextRepButton"
        );

      }

      else {

        this.show(
          "nextRepButton"
        );

      }

    },


  /*
    ==================================================
    RECOMMENDED ANSWER ENGINE
    ==================================================

    We deliberately do NOT hard-code one coordinate.

    Instead:

    1. Scan the simulated battlefield.
    2. Score each candidate using evaluatePosition().
    3. Locate the strongest-scoring area.
    4. Refine around the strongest candidate.
    5. Build a recommended zone around nearby
       high-quality positions.

    Therefore the revealed answer uses the same
    logic as the grading system.
    ==================================================
  */


  findRecommendedAnswer:
    function(
      scenario,
      submittedPosition,
      submittedResult
    ) {

      let candidates =
        [];


      /*
        Broad scan.

        Coordinates are internal training-space
        percentages, not MLBB game-unit distances.
      */

      for (
        let x = 5;
        x <= 95;
        x += 5
      ) {

        for (
          let y = 5;
          y <= 95;
          y += 5
        ) {

          const candidate =
            this.scoreCandidatePosition(
              scenario,
              x,
              y
            );


          if (
            candidate
          ) {

            candidates.push(
              candidate
            );

          }

        }

      }


      if (
        candidates.length ===
        0
      ) {

        return null;

      }


      candidates.sort(
        function(a, b) {

          return (
            b.score
            -
            a.score
          );

        }
      );


      const broadBest =
        candidates[
          0
        ];


      /*
        Refine close to the strongest broad result.
      */

      const refined =
        [];


      const startX =
        Math.max(
          3,
          broadBest.x - 6
        );


      const endX =
        Math.min(
          97,
          broadBest.x + 6
        );


      const startY =
        Math.max(
          3,
          broadBest.y - 6
        );


      const endY =
        Math.min(
          97,
          broadBest.y + 6
        );


      for (
        let x = startX;
        x <= endX;
        x += 1
      ) {

        for (
          let y = startY;
          y <= endY;
          y += 1
        ) {

          const candidate =
            this.scoreCandidatePosition(
              scenario,
              x,
              y
            );


          if (
            candidate
          ) {

            refined.push(
              candidate
            );

          }

        }

      }


      const allCandidates =
        candidates.concat(
          refined
        );


      allCandidates.sort(
        function(a, b) {

          return (
            b.score
            -
            a.score
          );

        }
      );


      const best =
        allCandidates[
          0
        ];


      /*
        A strong zone is more useful than pretending
        one pixel is the only correct answer.

        We keep candidates that:
        - score very close to the best
        - remain geographically close to the best

        This prevents disconnected good areas from
        becoming one misleading giant zone.
      */

      const nearBest =
        allCandidates
          .filter(
            (candidate) => {

              const scoreClose =
                candidate.score >=
                best.score - 4;


              const distance =
                this.positionDistance(
                  candidate,
                  best
                );


              const geographicallyClose =
                distance <=
                14;


              return (
                scoreClose
                &&
                geographicallyClose
              );

            }
          );


      const zone =
        this.buildRecommendedZone(
          nearBest,
          best
        );


      const direction =
        this.describeMovement(
          submittedPosition,
          best
        );


      const improvements =
        this.compareDimensions(
          submittedResult,
          best.result
        );


      return {

        x:
          best.x,

        y:
          best.y,

        score:
          best.score,

        result:
          best.result,

        zone:
          zone,

        direction:
          direction,

        improvements:
          improvements

      };

    },


  scoreCandidatePosition:
    function(
      scenario,
      x,
      y
    ) {

      try {

        const result =
          window.RafaelaScenarios
            .evaluatePosition(
              scenario,
              {
                x: x,
                y: y
              }
            );


        if (
          !result
          ||
          typeof result.overall !==
            "number"
        ) {

          return null;

        }


        return {

          x:
            x,

          y:
            y,

          score:
            result.overall,

          result:
            result

        };

      }

      catch(error) {

        console.warn(
          "Candidate position could not be evaluated:",
          x,
          y,
          error
        );


        return null;

      }

    },


  positionDistance:
    function(
      a,
      b
    ) {

      const dx =
        a.x
        -
        b.x;


      const dy =
        a.y
        -
        b.y;


      return Math.sqrt(
        dx * dx
        +
        dy * dy
      );

    },


  buildRecommendedZone:
    function(
      candidates,
      best
    ) {

      if (
        !candidates
        ||
        candidates.length ===
          0
      ) {

        return {

          cx:
            best.x,

          cy:
            best.y,

          rx:
            7,

          ry:
            7

        };

      }


      const xs =
        candidates.map(
          function(candidate) {

            return candidate.x;

          }
        );


      const ys =
        candidates.map(
          function(candidate) {

            return candidate.y;

          }
        );


      const minX =
        Math.min(
          ...xs
        );


      const maxX =
        Math.max(
          ...xs
        );


      const minY =
        Math.min(
          ...ys
        );


      const maxY =
        Math.max(
          ...ys
        );


      const cx =
        (
          minX
          +
          maxX
        )
        /
        2;


      const cy =
        (
          minY
          +
          maxY
        )
        /
        2;


      const rx =
        Math.max(
          6,
          (
            maxX
            -
            minX
          )
          /
          2
          +
          2
        );


      const ry =
        Math.max(
          6,
          (
            maxY
            -
            minY
          )
          /
          2
          +
          2
        );


      return {

        cx:
          cx,

        cy:
          cy,

        rx:
          Math.min(
            rx,
            18
          ),

        ry:
          Math.min(
            ry,
            18
          )

      };

    },


  /*
    ==================================================
    MOVEMENT DESCRIPTION
    ==================================================
  */


  describeMovement:
    function(
      from,
      to
    ) {

      const dx =
        to.x
        -
        from.x;


      const dy =
        to.y
        -
        from.y;


      const distance =
        Math.sqrt(
          dx * dx
          +
          dy * dy
        );


      if (
        distance < 4
      ) {

        return (
          "Stay around this area. "
          +
          "Your submitted position is already close "
          +
          "to the strongest zone found by the simulator."
        );

      }


      let horizontal =
        "";


      let vertical =
        "";


      if (
        dx > 3
      ) {

        horizontal =
          "right";

      }

      else if (
        dx < -3
      ) {

        horizontal =
          "left";

      }


      if (
        dy > 3
      ) {

        vertical =
          "down";

      }

      else if (
        dy < -3
      ) {

        vertical =
          "up";

      }


      let direction =
        "";


      if (
        vertical
        &&
        horizontal
      ) {

        direction =
          vertical
          +
          "-"
          +
          horizontal;

      }

      else {

        direction =
          vertical
          ||
          horizontal;

      }


      if (
        !direction
      ) {

        direction =
          "slightly toward the highlighted zone";

      }


      const qualifier =
        distance < 13
        ?
        "slightly "
        :
        "";


      return (
        "Move "
        +
        qualifier
        +
        direction
        +
        " toward the highlighted recommended zone."
      );

    },


  /*
    ==================================================
    DIMENSION COMPARISON
    ==================================================
  */


  compareDimensions:
    function(
      submittedResult,
      targetResult
    ) {

      if (
        !submittedResult
        ||
        !targetResult
        ||
        !submittedResult.dimensions
        ||
        !targetResult.dimensions
      ) {

        return [];

      }


      const dimensions = [

        {
          key:
            "participation",

          label:
            "participation"
        },

        {
          key:
            "allyAccess",

          label:
            "ally access"
        },

        {
          key:
            "threatSafety",

          label:
            "threat safety"
        },

        {
          key:
            "objectiveAccess",

          label:
            "objective access"
        },

        {
          key:
            "escapeSpace",

          label:
            "escape space"
        },

        {
          key:
            "uncertaintySafety",

          label:
            "uncertainty safety"
        }

      ];


      const comparison =
        dimensions.map(
          function(item) {

            const before =
              Number(
                submittedResult
                  .dimensions[
                    item.key
                  ]
              )
              ||
              0;


            const after =
              Number(
                targetResult
                  .dimensions[
                    item.key
                  ]
              )
              ||
              0;


            return {

              key:
                item.key,

              label:
                item.label,

              before:
                before,

              after:
                after,

              improvement:
                after
                -
                before

            };

          }
        );


      comparison.sort(
        function(a, b) {

          return (
            b.improvement
            -
            a.improvement
          );

        }
      );


      return comparison;

    },


  /*
    ==================================================
    ANSWER REVEAL
    ==================================================
  */


  revealRecommendedAnswer:
    function(
      submittedPosition,
      submittedResult,
      answer
    ) {

      if (
        !answer
      ) {

        return;

      }


      this.drawRecommendedAnswer(
        submittedPosition,
        answer
      );


      this.renderAnswerExplanation(
        submittedResult,
        answer
      );

    },


  drawRecommendedAnswer:
    function(
      submittedPosition,
      answer
    ) {

      const board =
        this.byId(
          "battlefield"
        );


      if (
        !board
      ) {

        return;

      }


      /*
        Remove any old reveal first.
      */

      const oldLayer =
        this.byId(
          "recommendedAnswerLayer"
        );


      if (
        oldLayer
      ) {

        oldLayer.remove();

      }


      const oldTarget =
        this.byId(
          "recommendedTarget"
        );


      if (
        oldTarget
      ) {

        oldTarget.remove();

      }


      /*
        SVG layer:
        - recommended zone
        - movement arrow
      */

      const svgNS =
        "http://www.w3.org/2000/svg";


      const svg =
        document.createElementNS(
          svgNS,
          "svg"
        );


      svg.id =
        "recommendedAnswerLayer";


      svg.setAttribute(
        "viewBox",
        "0 0 100 100"
      );


      svg.setAttribute(
        "preserveAspectRatio",
        "none"
      );


      Object.assign(
        svg.style,
        {
          position:
            "absolute",

          inset:
            "0",

          width:
            "100%",

          height:
            "100%",

          pointerEvents:
            "none",

          zIndex:
            "6"
        }
      );


      const defs =
        document.createElementNS(
          svgNS,
          "defs"
        );


      const marker =
        document.createElementNS(
          svgNS,
          "marker"
        );


      marker.setAttribute(
        "id",
        "rafaelaAnswerArrow"
      );


      marker.setAttribute(
        "markerWidth",
        "8"
      );


      marker.setAttribute(
        "markerHeight",
        "8"
      );


      marker.setAttribute(
        "refX",
        "6"
      );


      marker.setAttribute(
        "refY",
        "3"
      );


      marker.setAttribute(
        "orient",
        "auto"
      );


      marker.setAttribute(
        "markerUnits",
        "strokeWidth"
      );


      const arrowHead =
        document.createElementNS(
          svgNS,
          "path"
        );


      arrowHead.setAttribute(
        "d",
        "M0,0 L0,6 L7,3 z"
      );


      arrowHead.setAttribute(
        "fill",
        "#83e5a8"
      );


      marker.appendChild(
        arrowHead
      );


      defs.appendChild(
        marker
      );


      svg.appendChild(
        defs
      );


      /*
        Recommended zone.
      */

      const zone =
        document.createElementNS(
          svgNS,
          "ellipse"
        );


      zone.setAttribute(
        "cx",
        answer.zone.cx
      );


      zone.setAttribute(
        "cy",
        answer.zone.cy
      );


      zone.setAttribute(
        "rx",
        answer.zone.rx
      );


      zone.setAttribute(
        "ry",
        answer.zone.ry
      );


      zone.setAttribute(
        "fill",
        "rgba(88, 197, 138, 0.16)"
      );


      zone.setAttribute(
        "stroke",
        "#65d995"
      );


      zone.setAttribute(
        "stroke-width",
        "0.8"
      );


      zone.setAttribute(
        "stroke-dasharray",
        "2.2 1.8"
      );


      svg.appendChild(
        zone
      );


      /*
        Arrow from submitted position
        to recommended target.
      */

      const line =
        document.createElementNS(
          svgNS,
          "line"
        );


      line.setAttribute(
        "x1",
        submittedPosition.x
      );


      line.setAttribute(
        "y1",
        submittedPosition.y
      );


      line.setAttribute(
        "x2",
        answer.x
      );


      line.setAttribute(
        "y2",
        answer.y
      );


      line.setAttribute(
        "stroke",
        "#83e5a8"
      );


      line.setAttribute(
        "stroke-width",
        "0.9"
      );


      line.setAttribute(
        "stroke-dasharray",
        "2.5 1.7"
      );


      line.setAttribute(
        "marker-end",
        "url(#rafaelaAnswerArrow)"
      );


      line.setAttribute(
        "opacity",
        "0.9"
      );


      svg.appendChild(
        line
      );


      board.appendChild(
        svg
      );


      /*
        Target marker.
      */

      const target =
        document.createElement(
          "div"
        );


      target.id =
        "recommendedTarget";


      target.textContent =
        "TARGET";


      target.style.left =
        answer.x
        +
        "%";


      target.style.top =
        answer.y
        +
        "%";


      Object.assign(
        target.style,
        {
          position:
            "absolute",

          transform:
            "translate(-50%, -50%)",

          minWidth:
            "58px",

          height:
            "34px",

          padding:
            "0 8px",

          display:
            "grid",

          placeItems:
            "center",

          border:
            "2px solid #d9ffe7",

          borderRadius:
            "999px",

          background:
            "#58c58a",

          color:
            "#072615",

          fontSize:
            "9px",

          fontWeight:
            "900",

          letterSpacing:
            "0.05em",

          boxShadow:
            "0 0 0 7px rgba(88,197,138,0.13), 0 8px 20px rgba(0,0,0,0.32)",

          zIndex:
            "9",

          pointerEvents:
            "none"
        }
      );


      board.appendChild(
        target
      );


      /*
        Give submitted R a visible
        "YOUR ANSWER" label.
      */

      const rafaela =
        this.byId(
          "rafaelaMarker"
        );


      if (
        rafaela
      ) {

        rafaela.title =
          "Your submitted position";


        rafaela.style.boxShadow =
          "0 0 0 7px rgba(181,160,255,0.16), 0 9px 22px rgba(0,0,0,0.32)";

      }

    },


  /*
    ==================================================
    ANSWER EXPLANATION PANEL
    ==================================================
  */


  renderAnswerExplanation:
    function(
      submittedResult,
      answer
    ) {

      const feedback =
        this.byId(
          "feedbackPanel"
        );


      if (
        !feedback
      ) {

        return;

      }


      this.removeAnswerExplanation();


      const panel =
        document.createElement(
          "section"
        );


      panel.id =
        "recommendedAnswerExplanation";


      Object.assign(
        panel.style,
        {
          marginTop:
            "16px",

          padding:
            "17px",

          border:
            "1px solid rgba(88,197,138,0.28)",

          borderRadius:
            "17px",

          background:
            "rgba(88,197,138,0.07)"
        }
      );


      const heading =
        document.createElement(
          "div"
        );


      heading.textContent =
        "BEST-SUPPORTED ANSWER";


      Object.assign(
        heading.style,
        {
          marginBottom:
            "6px",

          color:
            "#7fe0a3",

          fontSize:
            "10px",

          fontWeight:
            "900",

          letterSpacing:
            "0.1em"
        }
      );


      panel.appendChild(
        heading
      );


      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        answer.direction;


      Object.assign(
        title.style,
        {
          margin:
            "0 0 10px",

          fontSize:
            "16px",

          lineHeight:
            "1.4"
        }
      );


      panel.appendChild(
        title
      );


      const score =
        document.createElement(
          "p"
        );


      score.textContent =
        (
          "Your simulated score: "
          +
          submittedResult.overall
          +
          "/100. "
          +
          "Recommended target score under this scenario evaluator: "
          +
          answer.score
          +
          "/100."
        );


      Object.assign(
        score.style,
        {
          margin:
            "0 0 12px",

          color:
            "#bcc6e8",

          fontSize:
            "12px",

          lineHeight:
            "1.5"
        }
      );


      panel.appendChild(
        score
      );


      const usefulImprovements =
        (
          answer.improvements
          ||
          []
        )
          .filter(
            function(item) {

              return (
                item.improvement >
                1
              );

            }
          )
          .slice(
            0,
            3
          );


      if (
        usefulImprovements.length >
        0
      ) {

        const whyTitle =
          document.createElement(
            "strong"
          );


        whyTitle.textContent =
          "What improves";


        Object.assign(
          whyTitle.style,
          {
            display:
              "block",

            marginBottom:
              "7px",

            color:
              "#d8ffe5",

            fontSize:
              "11px",

            textTransform:
              "uppercase",

            letterSpacing:
              "0.06em"
          }
        );


        panel.appendChild(
          whyTitle
        );


        const list =
          document.createElement(
            "ul"
          );


        Object.assign(
          list.style,
          {
            margin:
              "0 0 12px",

            paddingLeft:
              "18px",

            color:
              "#bcc6e8",

            fontSize:
              "12px",

            lineHeight:
              "1.55"
          }
        );


        usefulImprovements.forEach(
          function(item) {

            const li =
              document.createElement(
                "li"
              );


            li.textContent =
              (
                item.label
                +
                ": "
                +
                item.before
                +
                " → "
                +
                item.after
              );


            list.appendChild(
              li
            );

          }
        );


        panel.appendChild(
          list
        );

      }


      const doctrine =
        document.createElement(
          "p"
        );


      doctrine.textContent =
        (
          "Read the green area as a recommended zone, "
          +
          "not one magical pixel. It represents nearby "
          +
          "positions that score close to the strongest "
          +
          "answer under the current simulated facts."
        );


      Object.assign(
        doctrine.style,
        {
          margin:
            "0 0 10px",

          color:
            "#c8d2ef",

          fontSize:
            "12px",

          lineHeight:
            "1.55"
        }
      );


      panel.appendChild(
        doctrine
      );


      const caution =
        document.createElement(
          "p"
        );


      caution.textContent =
        (
          "If ally locations, threats, objective state, "
          +
          "resources, terrain, or unknown information change, "
          +
          "the recommended position may also change. "
          +
          "This is decision practice, not proof of mechanical "
          +
          "execution in a real MLBB match."
        );


      Object.assign(
        caution.style,
        {
          margin:
            "0",

          color:
            "#8490b8",

          fontSize:
            "10px",

          lineHeight:
            "1.5"
        }
      );


      panel.appendChild(
        caution
      );


      feedback.appendChild(
        panel
      );

    },


  removeAnswerExplanation:
    function() {

      const panel =
        this.byId(
          "recommendedAnswerExplanation"
        );


      if (
        panel
      ) {

        panel.remove();

      }

    },


  /*
    ==================================================
    STANDARD FEEDBACK UI
    ==================================================
  */


  renderFeedback:
    function(result) {

      this.setText(
        "feedbackTitle",
        result.feedback.title
      );


      this.setText(
        "overallScore",
        String(
          result.overall
        )
      );


      this.setText(
        "mainCorrection",
        result.feedback.mainCorrection
        ||
        "Reassess"
      );


      this.setText(
        "feedbackAction",
        result.feedback.action
      );


      this.setText(
        "feedbackReason",
        result.feedback.reason
      );


      this.setText(
        "feedbackException",
        result.feedback.exception
      );


      this.setText(
        "feedbackCheck",
        result.feedback.resultCheck
      );


      this.setText(
        "evidenceLimit",
        result.limitation
      );


      this.renderMetric(
        "metricParticipation",
        result.dimensions.participation
      );


      this.renderMetric(
        "metricAllyAccess",
        result.dimensions.allyAccess
      );


      this.renderMetric(
        "metricThreatSafety",
        result.dimensions.threatSafety
      );


      this.renderMetric(
        "metricObjectiveAccess",
        result.dimensions.objectiveAccess
      );


      this.renderMetric(
        "metricEscapeSpace",
        result.dimensions.escapeSpace
      );


      this.renderMetric(
        "metricUncertainty",
        result.dimensions.uncertaintySafety
      );

    },


  renderMetric:
    function(
      elementId,
      score
    ) {

      const element =
        this.byId(
          elementId
        );


      if (
        !element
      ) {

        return;

      }


      element.style.setProperty(
        "--score",
        score
        +
        "%"
      );


      const value =
        element.querySelector(
          ".metric-value"
        );


      if (
        value
      ) {

        value.textContent =
          score;

      }

    },


  /*
    ==================================================
    WORKOUT COMPLETION
    ==================================================
  */


  showWorkoutComplete:
    function() {

      this.hide(
        "evaluateButton"
      );


      this.hide(
        "nextRepButton"
      );


      this.show(
        "finishWorkoutButton"
      );

    },


  finishWorkout:
    function() {

      if (
        this.currentSessionId
      ) {

        window.RafaelaStorage
          .completeSession(
            this.currentSessionId
          );

      }


      const results =
        this.sessionResults;


      let average =
        0;


      if (
        results.length >
        0
      ) {

        average =
          Math.round(
            results.reduce(
              function(
                total,
                result
              ) {

                return (
                  total
                  +
                  result.overall
                );

              },
              0
            )
            /
            results.length
          );

      }


      const successful =
        results.filter(
          function(result) {

            return result.successful;

          }
        ).length;


      this.setText(
        "sessionScore",
        String(
          average
        )
      );


      this.setText(
        "sessionSuccessfulReps",
        `${successful} / ${results.length}`
      );


      const weakest =
        this.getSessionWeakestDimension();


      this.setText(
        "sessionWeakest",
        weakest
        ?
        weakest.label
        :
        "Pending"
      );


      this.renderDashboard();


      this.renderProgress();


      this.showScreen(
        "complete"
      );

    },


  getSessionWeakestDimension:
    function() {

      if (
        this.sessionResults.length ===
        0
      ) {

        return null;

      }


      const keys = [

        {
          key:
            "participation",

          label:
            "Participation"
        },

        {
          key:
            "allyAccess",

          label:
            "Ally Access"
        },

        {
          key:
            "threatSafety",

          label:
            "Threat Safety"
        },

        {
          key:
            "objectiveAccess",

          label:
            "Objective Access"
        },

        {
          key:
            "escapeSpace",

          label:
            "Escape Space"
        },

        {
          key:
            "uncertaintySafety",

          label:
            "Uncertainty Safety"
        }

      ];


      const averages =
        keys.map(
          (item) => {

            const total =
              this.sessionResults
                .reduce(
                  function(
                    running,
                    result
                  ) {

                    return (
                      running
                      +
                      result.dimensions[
                        item.key
                      ]
                    );

                  },
                  0
                );


            return {

              key:
                item.key,

              label:
                item.label,

              value:
                total
                /
                this.sessionResults.length

            };

          }
        );


      averages.sort(
        function(a, b) {

          return (
            a.value
            -
            b.value
          );

        }
      );


      return averages[
        0
      ];

    },


  /*
    ==================================================
    PROGRESS SCREEN
    ==================================================
  */


  renderProgress:
    function() {

      const summary =
        window.RafaelaStorage
          .getProgressSummary();


      this.setText(
        "progressTotal",
        String(
          summary.totalConcepts
        )
      );


      this.setText(
        "progressRecognition",
        String(
          summary.recognition
        )
      );


      this.setText(
        "progressExplanation",
        String(
          summary.explanation
        )
      );


      this.setText(
        "progressApplication",
        String(
          summary.scenarioApplication
        )
      );


      this.setText(
        "progressGameplay",
        String(
          summary.gameplayEvidence
        )
      );


      this.setText(
        "progressConsistency",
        String(
          summary.consistencyEvidence
        )
      );


      this.setText(
        "progressReviews",
        String(
          summary.reviewsDue
        )
      );


      const queue =
        window.RafaelaStorage
          .getReviewQueue();


      const container =
        this.byId(
          "reviewQueue"
        );


      if (
        !container
      ) {

        return;

      }


      container.innerHTML =
        "";


      queue
        .slice(
          0,
          5
        )
        .forEach(
          function(record) {

            const concept =
              window.RafaelaCurriculum
                .getConceptById(
                  record.conceptId
                );


            if (
              !concept
            ) {

              return;

            }


            const item =
              document.createElement(
                "div"
              );


            item.className =
              "review-item";


            item.innerHTML =
              `
                <div>
                  <strong>${concept.name}</strong>
                  <span>${concept.domainName}</span>
                </div>

                <div class="priority-pill">
                  ${Math.round(record.reviewPriority)}
                </div>
              `;


            container.appendChild(
              item
            );

          }
        );

    },


  /*
    ==================================================
    DOCTRINE SCREEN
    ==================================================
  */


  renderDoctrine:
    function() {

      const container =
        this.byId(
          "doctrineDomains"
        );


      if (
        !container
      ) {

        return;

      }


      container.innerHTML =
        "";


      window.RafaelaCurriculum
        .domains
        .forEach(
          function(domain) {

            const card =
              document.createElement(
                "article"
              );


            card.className =
              "doctrine-card";


            const conceptNames =
              domain.concepts
                .map(
                  function(concept) {

                    return concept.name;

                  }
                )
                .join(
                  " · "
                );


            card.innerHTML =
              `
                <span class="eyebrow">
                  ${domain.category}
                </span>

                <h3>
                  ${domain.name}
                </h3>

                <p>
                  ${conceptNames}
                </p>
              `;


            container.appendChild(
              card
            );

          }
        );

    },


  /*
    ==================================================
    ERROR UI
    ==================================================
  */


  showFatalError:
    function(message) {

      this.setText(
        "fatalErrorText",
        message
      );


      this.show(
        "fatalError"
      );

    }

};


/*
  Start after HTML is ready.
*/

document.addEventListener(
  "DOMContentLoaded",
  function() {

    window.RafaelaApp
      .init();

  }
);
