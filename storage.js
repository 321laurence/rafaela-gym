/*
  RAFAELA GYM
  Learning Ledger + Local Progress Storage

  Purpose:
  - Remember training progress on this device.
  - Track mistakes separately from successes.
  - Track retrieval, explanation, scenario application,
    and real gameplay evidence separately.
  - Schedule weaker concepts for earlier review.
  - Never treat one correct answer as mastery.

  This file stores data locally in the browser.
*/


window.RafaelaStorage = {

  storageKey:
    "rafaelaGymV2State",


  stateVersion:
    "2.0.0",


  createEmptyState:
    function() {

      const now =
        new Date().toISOString();


      return {

        version:
          this.stateVersion,

        createdAt:
          now,

        updatedAt:
          now,


        sessions: {

          started:
            0,

          completed:
            0,

          lastStartedAt:
            null,

          lastCompletedAt:
            null

        },


        concepts: {},


        sessionHistory: [],


        gameplayEvidence: [],


        corrections: []

      };

    },


  load:
    function() {

      try {

        const raw =
          localStorage.getItem(
            this.storageKey
          );


        if (!raw) {

          const newState =
            this.createEmptyState();


          this.save(
            newState
          );


          return newState;

        }


        const parsed =
          JSON.parse(
            raw
          );


        if (
          !parsed ||
          typeof parsed !==
          "object"
        ) {

          throw new Error(
            "Invalid stored Rafaela Gym state."
          );

        }


        return parsed;

      }

      catch (error) {

        console.error(
          "Rafaela Gym storage load failed:",
          error
        );


        return this.createEmptyState();

      }

    },


  save:
    function(state) {

      state.updatedAt =
        new Date().toISOString();


      try {

        localStorage.setItem(
          this.storageKey,
          JSON.stringify(state)
        );


        return true;

      }

      catch (error) {

        console.error(
          "Rafaela Gym storage save failed:",
          error
        );


        return false;

      }

    },


  ensureConceptRecord:
    function(
      state,
      conceptId
    ) {

      if (
        !state.concepts[
          conceptId
        ]
      ) {

        state.concepts[
          conceptId
        ] = {

          conceptId:
            conceptId,


          firstSeenAt:
            null,

          lastSeenAt:
            null,

          nextReviewAt:
            null,


          retrieval: {

            attempts:
              0,

            correct:
              0,

            incorrect:
              0

          },


          explanation: {

            attempts:
              0,

            successful:
              0,

            unsuccessful:
              0

          },


          application: {

            attempts:
              0,

            successful:
              0,

            unsuccessful:
              0

          },


          gameplay: {

            evidenceCount:
              0,

            positiveEvidence:
              0,

            correctionEvidence:
              0

          },


          correctionsCount:
            0,


          consecutiveSuccesses:
            0,


          lastResult:
            null,


          reviewPriority:
            50

        };

      }


      return state.concepts[
        conceptId
      ];

    },


  ensureCurriculumConcepts:
    function() {

      const state =
        this.load();


      if (
        !window.RafaelaCurriculum
      ) {

        console.warn(
          "Rafaela curriculum is not loaded yet."
        );


        return state;

      }


      const concepts =
        window.RafaelaCurriculum
          .getAllConcepts();


      concepts.forEach(
        (concept) => {

          this.ensureConceptRecord(
            state,
            concept.id
          );

        }
      );


      this.save(
        state
      );


      return state;

    },


  markSeen:
    function(
      record
    ) {

      const now =
        new Date().toISOString();


      if (
        !record.firstSeenAt
      ) {

        record.firstSeenAt =
          now;

      }


      record.lastSeenAt =
        now;

    },


  calculateNextReview:
    function(
      record,
      successful
    ) {

      const now =
        new Date();


      let days =
        1;


      if (
        successful
      ) {

        if (
          record.consecutiveSuccesses >= 5
        ) {

          days =
            10;

        }

        else if (
          record.consecutiveSuccesses >= 3
        ) {

          days =
            6;

        }

        else if (
          record.consecutiveSuccesses >= 2
        ) {

          days =
            3;

        }

        else {

          days =
            2;

        }

      }

      else {

        days =
          1;

      }


      const next =
        new Date(
          now.getTime()
          +
          days
          *
          24
          *
          60
          *
          60
          *
          1000
        );


      record.nextReviewAt =
        next.toISOString();

    },


  updatePriority:
    function(
      record
    ) {

      let priority =
        50;


      priority +=
        record.retrieval.incorrect
        *
        6;


      priority +=
        record.explanation.unsuccessful
        *
        7;


      priority +=
        record.application.unsuccessful
        *
        10;


      priority +=
        record.gameplay.correctionEvidence
        *
        12;


      priority +=
        record.correctionsCount
        *
        4;


      priority -=
        record.application.successful
        *
        3;


      priority -=
        record.gameplay.positiveEvidence
        *
        4;


      priority =
        Math.max(
          1,
          Math.min(
            100,
            priority
          )
        );


      record.reviewPriority =
        priority;

    },


  recordRetrieval:
    function(
      conceptId,
      correct
    ) {

      const state =
        this.load();


      const record =
        this.ensureConceptRecord(
          state,
          conceptId
        );


      this.markSeen(
        record
      );


      record.retrieval.attempts++;


      if (
        correct
      ) {

        record.retrieval.correct++;

        record.consecutiveSuccesses++;

        record.lastResult =
          "retrieval_success";

      }

      else {

        record.retrieval.incorrect++;

        record.consecutiveSuccesses =
          0;

        record.lastResult =
          "retrieval_error";

      }


      this.calculateNextReview(
        record,
        correct
      );


      this.updatePriority(
        record
      );


      this.save(
        state
      );


      return record;

    },


  recordExplanation:
    function(
      conceptId,
      successful
    ) {

      const state =
        this.load();


      const record =
        this.ensureConceptRecord(
          state,
          conceptId
        );


      this.markSeen(
        record
      );


      record.explanation.attempts++;


      if (
        successful
      ) {

        record.explanation.successful++;

        record.consecutiveSuccesses++;

        record.lastResult =
          "explanation_success";

      }

      else {

        record.explanation.unsuccessful++;

        record.consecutiveSuccesses =
          0;

        record.lastResult =
          "explanation_error";

      }


      this.calculateNextReview(
        record,
        successful
      );


      this.updatePriority(
        record
      );


      this.save(
        state
      );


      return record;

    },


  recordApplication:
    function(
      conceptId,
      successful
    ) {

      const state =
        this.load();


      const record =
        this.ensureConceptRecord(
          state,
          conceptId
        );


      this.markSeen(
        record
      );


      record.application.attempts++;


      if (
        successful
      ) {

        record.application.successful++;

        record.consecutiveSuccesses++;

        record.lastResult =
          "application_success";

      }

      else {

        record.application.unsuccessful++;

        record.consecutiveSuccesses =
          0;

        record.lastResult =
          "application_error";

      }


      this.calculateNextReview(
        record,
        successful
      );


      this.updatePriority(
        record
      );


      this.save(
        state
      );


      return record;

    },


  recordCorrection:
    function(
      conceptId,
      correctionText,
      source
    ) {

      const state =
        this.load();


      const record =
        this.ensureConceptRecord(
          state,
          conceptId
        );


      this.markSeen(
        record
      );


      record.correctionsCount++;


      record.consecutiveSuccesses =
        0;


      record.lastResult =
        "correction_needed";


      state.corrections.push({

        conceptId:
          conceptId,

        correction:
          correctionText,

        source:
          source || "training",

        createdAt:
          new Date().toISOString()

      });


      this.calculateNextReview(
        record,
        false
      );


      this.updatePriority(
        record
      );


      this.save(
        state
      );


      return record;

    },


  recordGameplayEvidence:
    function(
      conceptId,
      evidence
    ) {

      const state =
        this.load();


      const record =
        this.ensureConceptRecord(
          state,
          conceptId
        );


      this.markSeen(
        record
      );


      const evidenceRecord = {

        conceptId:
          conceptId,

        type:
          evidence.type
          || "user_report",

        result:
          evidence.result
          || "unverified",

        note:
          evidence.note
          || "",

        createdAt:
          new Date().toISOString()

      };


      state.gameplayEvidence.push(
        evidenceRecord
      );


      record.gameplay.evidenceCount++;


      if (
        evidenceRecord.result ===
        "positive"
      ) {

        record.gameplay.positiveEvidence++;

        record.consecutiveSuccesses++;

        record.lastResult =
          "gameplay_positive";

      }

      else if (
        evidenceRecord.result ===
        "correction"
      ) {

        record.gameplay.correctionEvidence++;

        record.consecutiveSuccesses =
          0;

        record.lastResult =
          "gameplay_correction";

      }

      else {

        record.lastResult =
          "gameplay_unverified";

      }


      this.calculateNextReview(
        record,
        evidenceRecord.result ===
        "positive"
      );


      this.updatePriority(
        record
      );


      this.save(
        state
      );


      return evidenceRecord;

    },


  getEvidenceStage:
    function(
      conceptId
    ) {

      const state =
        this.load();


      const record =
        state.concepts[
          conceptId
        ];


      if (!record) {

        return {
          id:
            "unseen",

          name:
            "Not Yet Trained"
        };

      }


      if (
        record.gameplay.positiveEvidence >= 3
        &&
        record.application.successful >= 5
      ) {

        return {
          id:
            "consistency_evidence",

          name:
            "Consistency Evidence"
        };

      }


      if (
        record.gameplay.evidenceCount > 0
      ) {

        return {
          id:
            "gameplay_evidence",

          name:
            "Gameplay Evidence"
        };

      }


      if (
        record.application.successful > 0
      ) {

        return {
          id:
            "scenario_application",

          name:
            "Scenario Application"
        };

      }


      if (
        record.explanation.successful > 0
      ) {

        return {
          id:
            "explanation",

          name:
            "Explanation"
        };

      }


      if (
        record.retrieval.correct > 0
      ) {

        return {
          id:
            "recognition",

          name:
            "Recognition"
        };

      }


      return {
        id:
          "exposed",

        name:
          "Exposed / Developing"
      };

    },


  isReviewDue:
    function(
      record
    ) {

      if (
        !record.nextReviewAt
      ) {

        return true;

      }


      return (
        new Date(
          record.nextReviewAt
        ).getTime()
        <=
        Date.now()
      );

    },


  getReviewQueue:
    function() {

      const state =
        this.ensureCurriculumConcepts();


      const records =
        Object.values(
          state.concepts
        );


      return records
        .filter(
          (record) =>
            this.isReviewDue(
              record
            )
        )
        .sort(
          (a, b) =>
            b.reviewPriority
            -
            a.reviewPriority
        );

    },


  startSession:
    function() {

      const state =
        this.load();


      state.sessions.started++;


      state.sessions.lastStartedAt =
        new Date().toISOString();


      const session = {

        id:
          "session_"
          +
          Date.now(),

        startedAt:
          state.sessions.lastStartedAt,

        completedAt:
          null,

        events:
          []

      };


      state.sessionHistory.push(
        session
      );


      this.save(
        state
      );


      return session.id;

    },


  completeSession:
    function(
      sessionId
    ) {

      const state =
        this.load();


      const session =
        state.sessionHistory.find(
          function(item) {

            return item.id ===
              sessionId;

          }
        );


      if (
        !session
      ) {

        return false;

      }


      if (
        !session.completedAt
      ) {

        session.completedAt =
          new Date().toISOString();


        state.sessions.completed++;


        state.sessions.lastCompletedAt =
          session.completedAt;

      }


      this.save(
        state
      );


      return true;

    },


  getProgressSummary:
    function() {

      const state =
        this.ensureCurriculumConcepts();


      const records =
        Object.values(
          state.concepts
        );


      const summary = {

        totalConcepts:
          records.length,

        unseen:
          0,

        exposed:
          0,

        recognition:
          0,

        explanation:
          0,

        scenarioApplication:
          0,

        gameplayEvidence:
          0,

        consistencyEvidence:
          0,

        reviewsDue:
          0

      };


      records.forEach(
        (record) => {

          const stage =
            this.getEvidenceStage(
              record.conceptId
            );


          if (
            stage.id ===
            "unseen"
          ) {

            summary.unseen++;

          }

          else if (
            stage.id ===
            "exposed"
          ) {

            summary.exposed++;

          }

          else if (
            stage.id ===
            "recognition"
          ) {

            summary.recognition++;

          }

          else if (
            stage.id ===
            "explanation"
          ) {

            summary.explanation++;

          }

          else if (
            stage.id ===
            "scenario_application"
          ) {

            summary.scenarioApplication++;

          }

          else if (
            stage.id ===
            "gameplay_evidence"
          ) {

            summary.gameplayEvidence++;

          }

          else if (
            stage.id ===
            "consistency_evidence"
          ) {

            summary.consistencyEvidence++;

          }


          if (
            this.isReviewDue(
              record
            )
          ) {

            summary.reviewsDue++;

          }

        }
      );


      return summary;

    },


  exportData:
    function() {

      const state =
        this.load();


      return JSON.stringify(
        state,
        null,
        2
      );

    },


  reset:
    function() {

      const empty =
        this.createEmptyState();


      this.save(
        empty
      );


      return empty;

    }

};


/*
  Initialize concept records when both
  curriculum.js and storage.js are loaded.
*/

if (
  window.RafaelaCurriculum
) {

  window.RafaelaStorage
    .ensureCurriculumConcepts();

}
