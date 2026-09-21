/*
  RAFAELA GYM V2
  Application Controller

  Connects:
  curriculum.js
  storage.js
  trainer.js
  scenarios.js

  This controller handles:
  - adaptive recommendation
  - today's workout
  - dynamic positioning reps
  - scoring and feedback
  - progress recording
  - session continuity

  Scenario results are decision-practice evidence only.
  They are NOT proof of real gameplay mechanics.
*/


window.RafaelaApp = {

  currentScenario:
    null,

  currentPosition:
    null,

  currentSessionId:
    null,

  currentRep:
    0,

  targetReps:
    5,

  sessionResults:
    [],


  /*
    -----------------------------
    STARTUP
    -----------------------------
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
          "Rafaela Gym V2 could not start because one or more core modules are missing."
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
    -----------------------------
    BASIC DOM HELPERS
    -----------------------------
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
    -----------------------------
    SCREEN NAVIGATION
    -----------------------------
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
          top:
            0,

          behavior:
            "smooth"
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
                reps:
                  3
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
    -----------------------------
    DASHBOARD
    -----------------------------
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
    -----------------------------
    WORKOUT
    -----------------------------
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
    -----------------------------
    SCENARIO RENDERING
    -----------------------------
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


      values.forEach(
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


      /*
        Decorative map layers.
      */

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


      this.currentScenario
        .actors
        .forEach(
          (actor) => {

            /*
              Missing threats are represented
              by uncertainty markers rather than
              pretending their actual position is known.
            */

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


      const marker =
        document.createElement(
          "div"
        );


      marker.className =
        "unknown-threat-marker";


      marker.textContent =
        "?";


      /*
        We intentionally show uncertainty
        as a broad edge marker rather than
        the hidden actor's simulated coordinate.
      */

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
    -----------------------------
    MOVEMENT
    -----------------------------
  */


  moveRafaela:
    function(event) {

      if (
        !this.currentScenario
      ) {

        return;

      }


      if (
        !this.byId(
          "feedbackPanel"
        ).hidden
      ) {

        return;

      }


      const board =
        this.byId(
          "battlefield"
        );


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
    -----------------------------
    EVALUATION
    -----------------------------
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


      const result =
        window.RafaelaScenarios
          .evaluatePosition(
            this.currentScenario,
            this.currentPosition
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


      this.renderFeedback(
        result
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
    -----------------------------
    FEEDBACK UI
    -----------------------------
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
    -----------------------------
    WORKOUT COMPLETION
    -----------------------------
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
        results.length > 0
      ) {

        average =
          Math.round(
            results.reduce(
              function(total, result) {

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
        this.sessionResults.length === 0
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
    -----------------------------
    PROGRESS SCREEN
    -----------------------------
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
    -----------------------------
    DOCTRINE SCREEN
    -----------------------------
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
    -----------------------------
    ERROR UI
    -----------------------------
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
  Start after the HTML is ready.
*/

document.addEventListener(
  "DOMContentLoaded",
  function() {

    window.RafaelaApp
      .init();

  }
);
