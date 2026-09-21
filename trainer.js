/*
  RAFAELA GYM
  Adaptive Training Selector

  Uses:
  - curriculum.js = what can be learned
  - storage.js    = what the player has actually done

  Purpose:
  Decide WHAT should be trained next and WHY.

  Selection considers:
  - prerequisites
  - review due status
  - weaknesses
  - concept importance
  - prior successful application
  - recent exposure
  - curriculum connections

  This file does NOT contain patch-sensitive Rafaela mechanics.
*/


window.RafaelaTrainer = {

  version:
    "2.0.0",


  /*
    Make sure required systems exist.
  */

  ready:
    function() {

      return Boolean(
        window.RafaelaCurriculum
        &&
        window.RafaelaStorage
      );

    },


  /*
    Return one concept's progress record.
  */

  getRecord:
    function(
      conceptId
    ) {

      const state =
        window.RafaelaStorage.load();


      return (
        state.concepts[
          conceptId
        ]
        ||
        null
      );

    },


  /*
    Count all formal training attempts
    for one concept.
  */

  getAttemptCount:
    function(
      record
    ) {

      if (!record) {
        return 0;
      }


      return (
        record.retrieval.attempts
        +
        record.explanation.attempts
        +
        record.application.attempts
      );

    },


  /*
    Count successful evidence.
  */

  getSuccessCount:
    function(
      record
    ) {

      if (!record) {
        return 0;
      }


      return (
        record.retrieval.correct
        +
        record.explanation.successful
        +
        record.application.successful
        +
        record.gameplay.positiveEvidence
      );

    },


  /*
    Count correction/error evidence.
  */

  getErrorCount:
    function(
      record
    ) {

      if (!record) {
        return 0;
      }


      return (
        record.retrieval.incorrect
        +
        record.explanation.unsuccessful
        +
        record.application.unsuccessful
        +
        record.gameplay.correctionEvidence
      );

    },


  /*
    A prerequisite does NOT require
    full mastery.

    It only needs enough evidence that
    the learner has encountered and
    successfully handled the prerequisite
    at least once.

    Full mastery remains separate.
  */

  prerequisiteIsReady:
    function(
      prerequisiteId
    ) {

      const record =
        this.getRecord(
          prerequisiteId
        );


      if (!record) {
        return false;
      }


      return (
        record.retrieval.correct > 0
        ||
        record.explanation.successful > 0
        ||
        record.application.successful > 0
        ||
        record.gameplay.positiveEvidence > 0
      );

    },


  /*
    Check all prerequisites.
  */

  prerequisitesMet:
    function(
      concept
    ) {

      if (
        !concept.prerequisites
        ||
        concept.prerequisites.length === 0
      ) {

        return true;

      }


      return concept.prerequisites.every(
        (prerequisiteId) => {

          return this.prerequisiteIsReady(
            prerequisiteId
          );

        }
      );

    },


  /*
    Return prerequisite IDs that are
    currently blocking this concept.
  */

  getMissingPrerequisites:
    function(
      concept
    ) {

      if (
        !concept.prerequisites
      ) {

        return [];

      }


      return concept.prerequisites.filter(
        (prerequisiteId) => {

          return !this.prerequisiteIsReady(
            prerequisiteId
          );

        }
      );

    },


  /*
    Determine whether the concept has
    never been formally trained.
  */

  isNewConcept:
    function(
      record
    ) {

      if (!record) {
        return true;
      }


      return (
        this.getAttemptCount(
          record
        ) === 0
        &&
        record.gameplay.evidenceCount === 0
      );

    },


  /*
    Check whether review is due.
  */

  reviewIsDue:
    function(
      record
    ) {

      if (!record) {
        return true;
      }


      return window.RafaelaStorage
        .isReviewDue(
          record
        );

    },


  /*
    Calculate hours since the concept
    was last seen.

    Returns null when unseen.
  */

  hoursSinceLastSeen:
    function(
      record
    ) {

      if (
        !record
        ||
        !record.lastSeenAt
      ) {

        return null;

      }


      const difference =
        Date.now()
        -
        new Date(
          record.lastSeenAt
        ).getTime();


      return (
        difference
        /
        (
          1000
          *
          60
          *
          60
        )
      );

    },


  /*
    Score one concept.

    Higher score =
    stronger reason to train it now.
  */

  scoreConcept:
    function(
      concept,
      options
    ) {

      const config =
        options
        ||
        {};


      const record =
        this.getRecord(
          concept.id
        );


      let score =
        0;


      /*
        Importance matters,
        but does not control everything.
      */

      score +=
        concept.importance
        *
        0.35;


      /*
        Stored weakness / review priority.
      */

      if (record) {

        score +=
          record.reviewPriority
          *
          0.35;

      }

      else {

        score +=
          17.5;

      }


      /*
        Due review bonus.
      */

      if (
        this.reviewIsDue(
          record
        )
      ) {

        score +=
          20;

      }


      /*
        New concepts should still enter
        the curriculum progressively.
      */

      if (
        this.isNewConcept(
          record
        )
      ) {

        score +=
          8;

      }


      /*
        Mistakes raise priority.
      */

      const errors =
        this.getErrorCount(
          record
        );


      score +=
        Math.min(
          25,
          errors
          *
          5
        );


      /*
        Successful scenario application
        slightly lowers urgency.

        It does NOT mean mastery.
      */

      if (record) {

        score -=
          Math.min(
            12,
            record.application.successful
            *
            2
          );

      }


      /*
        Repeated positive gameplay evidence
        lowers immediate review pressure.
      */

      if (record) {

        score -=
          Math.min(
            12,
            record.gameplay.positiveEvidence
            *
            3
          );

      }


      /*
        Avoid drilling the exact same thing
        continuously when it was just seen.

        Weak concepts can still return later.
      */

      const hours =
        this.hoursSinceLastSeen(
          record
        );


      if (
        hours !== null
        &&
        hours < 1
      ) {

        score -=
          18;

      }

      else if (
        hours !== null
        &&
        hours < 6
      ) {

        score -=
          10;

      }


      /*
        Optional connection bonus.

        Example:
        If today's main lesson is positioning,
        connected positioning concepts can
        receive extra priority.
      */

      if (
        config.preferredDomainId
        &&
        concept.domainId ===
          config.preferredDomainId
      ) {

        score +=
          8;

      }


      /*
        Optional category bonus.
      */

      if (
        config.preferredCategory
        &&
        concept.category ===
          config.preferredCategory
      ) {

        score +=
          5;

      }


      return Math.round(
        score
        *
        100
      )
      /
      100;

    },


  /*
    Return all currently trainable concepts.

    Concepts whose prerequisites are not
    ready are excluded.
  */

  getEligibleConcepts:
    function() {

      if (
        !this.ready()
      ) {

        return [];

      }


      window.RafaelaStorage
        .ensureCurriculumConcepts();


      return window.RafaelaCurriculum
        .getAllConcepts()
        .filter(
          (concept) => {

            return this.prerequisitesMet(
              concept
            );

          }
        );

    },


  /*
    Rank all eligible concepts.
  */

  rankConcepts:
    function(
      options
    ) {

      const concepts =
        this.getEligibleConcepts();


      return concepts
        .map(
          (concept) => {

            return {

              concept:
                concept,

              score:
                this.scoreConcept(
                  concept,
                  options
                )

            };

          }
        )
        .sort(
          (a, b) => {

            return (
              b.score
              -
              a.score
            );

          }
        );

    },


  /*
    Choose the best concept to train now.
  */

  chooseNextConcept:
    function(
      options
    ) {

      const ranked =
        this.rankConcepts(
          options
        );


      if (
        ranked.length === 0
      ) {

        return null;

      }


      return ranked[0];

    },


  /*
    Explain WHY a concept was selected.

    This is useful for the future
    "Today's Workout" dashboard.
  */

  explainSelection:
    function(
      concept
    ) {

      const record =
        this.getRecord(
          concept.id
        );


      const reasons =
        [];


      if (
        this.isNewConcept(
          record
        )
      ) {

        reasons.push(
          "important new foundation"
        );

      }


      if (
        this.reviewIsDue(
          record
        )
      ) {

        reasons.push(
          "review is due"
        );

      }


      const errors =
        this.getErrorCount(
          record
        );


      if (
        errors >= 2
      ) {

        reasons.push(
          "repeated errors need correction"
        );

      }


      if (
        record
        &&
        record.application.unsuccessful > 0
      ) {

        reasons.push(
          "scenario application needs reinforcement"
        );

      }


      if (
        record
        &&
        record.gameplay.correctionEvidence > 0
      ) {

        reasons.push(
          "gameplay evidence showed a correction need"
        );

      }


      if (
        reasons.length === 0
      ) {

        reasons.push(
          "high-value curriculum progression"
        );

      }


      return reasons;

    },


  /*
    Determine the most appropriate
    learning activity for one concept.
  */

  chooseActivity:
    function(
      conceptId
    ) {

      const record =
        this.getRecord(
          conceptId
        );


      if (
        !record
        ||
        this.isNewConcept(
          record
        )
      ) {

        return {
          type:
            "learn",

          reason:
            "The concept has not yet been formally introduced."
        };

      }


      if (
        record.lastResult ===
        "retrieval_error"
        ||
        record.lastResult ===
        "explanation_error"
      ) {

        return {
          type:
            "learn",

          reason:
            "The underlying concept needs clarification before harder application."
        };

      }


      if (
        record.retrieval.correct === 0
      ) {

        return {
          type:
            "retrieve",

          reason:
            "Recognition has not yet been demonstrated."
        };

      }


      if (
        record.explanation.successful === 0
      ) {

        return {
          type:
            "examine",

          reason:
            "Recognition exists, but explanation and limits still need examination."
        };

      }


      if (
        record.application.successful === 0
        ||
        record.application.unsuccessful > 0
      ) {

        return {
          type:
            "apply",

          reason:
            "The concept needs practical decision application."
        };

      }


      if (
        record.gameplay.evidenceCount === 0
      ) {

        return {
          type:
            "apply",

          reason:
            "Scenario competence exists, but real gameplay transfer remains unverified."
        };

      }


      if (
        this.reviewIsDue(
          record
        )
      ) {

        return {
          type:
            "retrieve",

          reason:
            "The concept is due for spaced retrieval."
        };

      }


      return {
        type:
          "interleave",

        reason:
          "The concept is developing well and should now be mixed with other skills."
      };

    },


  /*
    Find another eligible concept for
    interleaving.

    Prefer something different from
    the primary concept.
  */

  chooseSecondaryConcept:
    function(
      primaryConcept
    ) {

      const ranked =
        this.rankConcepts();


      const differentDomain =
        ranked.find(
          (item) => {

            return (
              item.concept.id !==
                primaryConcept.id
              &&
              item.concept.domainId !==
                primaryConcept.domainId
            );

          }
        );


      if (
        differentDomain
      ) {

        return differentDomain;

      }


      const anyDifferent =
        ranked.find(
          (item) => {

            return (
              item.concept.id !==
              primaryConcept.id
            );

          }
        );


      return (
        anyDifferent
        ||
        null
      );

    },


  /*
    Build one complete training session.

    6 steps:

    1 Retrieve
    2 Learn
    3 Examine
    4 Apply
    5 Apply / Interleave
    6 Capture

    Two of six steps are direct application,
    satisfying the doctrine's minimum
    one-third application target.
  */

  buildSessionPlan:
    function() {

      if (
        !this.ready()
      ) {

        return null;

      }


      const primarySelection =
        this.chooseNextConcept();


      if (
        !primarySelection
      ) {

        return null;

      }


      const primary =
        primarySelection.concept;


      const secondarySelection =
        this.chooseSecondaryConcept(
          primary
        );


      const secondary =
        secondarySelection
        ?
        secondarySelection.concept
        :
        primary;


      return {

        generatedAt:
          new Date().toISOString(),


        primaryConcept: {

          id:
            primary.id,

          name:
            primary.name,

          domainId:
            primary.domainId,

          domainName:
            primary.domainName,

          selectionScore:
            primarySelection.score,

          reasons:
            this.explainSelection(
              primary
            )

        },


        secondaryConcept: {

          id:
            secondary.id,

          name:
            secondary.name,

          domainId:
            secondary.domainId,

          domainName:
            secondary.domainName

        },


        steps: [

          {
            order:
              1,

            phase:
              "retrieve",

            conceptId:
              primary.id,

            purpose:
              "Retrieve prior understanding without revealing the answer first."
          },


          {
            order:
              2,

            phase:
              "learn",

            conceptId:
              primary.id,

            purpose:
              "Teach or correct the high-value principle using cue, action, reason, exception, and result check."
          },


          {
            order:
              3,

            phase:
              "examine",

            conceptId:
              primary.id,

            purpose:
              "Clarify assumptions, limits, tradeoffs, and common misuse."
          },


          {
            order:
              4,

            phase:
              "apply",

            conceptId:
              primary.id,

            purpose:
              "Apply the principle in a concrete decision-practice scenario."
          },


          {
            order:
              5,

            phase:
              "apply",

            conceptId:
              secondary.id,

            purpose:
              "Interleave another relevant concept through a different application scenario."
          },


          {
            order:
              6,

            phase:
              "capture",

            conceptId:
              primary.id,

            purpose:
              "Record the principle, most useful correction, application result, and review priority."
          }

        ]

      };

    },


  /*
    Produce the recommendation information
    that will later appear on the home screen.
  */

  getDashboardRecommendation:
    function() {

      if (
        !this.ready()
      ) {

        return {

          ready:
            false,

          message:
            "Curriculum or learning ledger is not loaded."

        };

      }


      const selection =
        this.chooseNextConcept();


      if (
        !selection
      ) {

        return {

          ready:
            false,

          message:
            "No eligible concept is currently available."

        };

      }


      const concept =
        selection.concept;


      const activity =
        this.chooseActivity(
          concept.id
        );


      const summary =
        window.RafaelaStorage
          .getProgressSummary();


      return {

        ready:
          true,


        conceptId:
          concept.id,


        conceptName:
          concept.name,


        domain:
          concept.domainName,


        category:
          concept.category,


        priorityScore:
          selection.score,


        reasons:
          this.explainSelection(
            concept
          ),


        recommendedActivity:
          activity.type,


        activityReason:
          activity.reason,


        reviewsDue:
          summary.reviewsDue,


        totalConcepts:
          summary.totalConcepts

      };

    },


  /*
    Development / testing helper.

    This does NOT modify progress.
  */

  preview:
    function() {

      const recommendation =
        this.getDashboardRecommendation();


      const session =
        this.buildSessionPlan();


      console.log(
        "Rafaela Gym recommendation:",
        recommendation
      );


      console.log(
        "Rafaela Gym session plan:",
        session
      );


      return {

        recommendation:
          recommendation,

        session:
          session

      };

    }

};
