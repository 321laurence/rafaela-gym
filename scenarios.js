/*
============================================================
RAFAELA GYM
POSITIONING SCENARIO ENGINE V3
============================================================

Purpose:
Train positioning through simulated decision practice.

This engine does NOT claim that its internal map percentages,
distances, thresholds, or scores are real MLBB measurements.

They are abstract training-space values used to teach stable
positioning principles:

Observe
→ Assess
→ Prioritize
→ Position
→ Act
→ Verify
→ Reassess

The evaluator considers:

1. Participation
2. Ally access
3. Threat safety
4. Objective relevance
5. Escape space
6. Uncertainty safety
7. Frontline relationship
8. Direct threat paths
9. Crowding / actor overlap
10. Scenario priorities

There is deliberately no universal rule such as:
- always stand behind the tank
- always stand beside the marksman
- always stay far away
- always hug the objective

The best-supported zone changes with the situation.
============================================================
*/


window.RafaelaScenarios = {

  /*
  ==========================================================
  BASIC UTILITIES
  ==========================================================
  */

  clamp:
    function(value, min, max) {

      return Math.max(
        min,
        Math.min(
          max,
          value
        )
      );

    },


  distance:
    function(a, b) {

      if (
        !a
        ||
        !b
      ) {

        return 999;

      }

      const dx =
        Number(a.x)
        -
        Number(b.x);

      const dy =
        Number(a.y)
        -
        Number(b.y);

      return Math.sqrt(
        dx * dx
        +
        dy * dy
      );

    },


  roundScore:
    function(value) {

      return Math.round(
        this.clamp(
          value,
          0,
          100
        )
      );

    },


  average:
    function(values) {

      if (
        !values
        ||
        values.length === 0
      ) {

        return 0;

      }

      return (
        values.reduce(
          function(total, value) {

            return total + value;

          },
          0
        )
        /
        values.length
      );

    },


  /*
  ==========================================================
  GENERIC SCORING CURVES

  These are SIMULATION values.

  They are NOT MLBB unit ranges.
  ==========================================================
  */


  rangeScore:
    function(
      value,
      preferredMin,
      preferredMax,
      falloff
    ) {

      if (
        value >= preferredMin
        &&
        value <= preferredMax
      ) {

        return 100;

      }


      if (
        value < preferredMin
      ) {

        const difference =
          preferredMin
          -
          value;

        return this.clamp(
          100
          -
          (
            difference
            /
            falloff
          )
          *
          100,
          0,
          100
        );

      }


      const difference =
        value
        -
        preferredMax;

      return this.clamp(
        100
        -
        (
          difference
          /
          falloff
        )
        *
        100,
        0,
        100
      );

    },


  fartherIsSafer:
    function(
      value,
      dangerDistance,
      comfortableDistance
    ) {

      if (
        value <= dangerDistance
      ) {

        return 0;

      }

      if (
        value >= comfortableDistance
      ) {

        return 100;

      }


      return (
        (
          value
          -
          dangerDistance
        )
        /
        (
          comfortableDistance
          -
          dangerDistance
        )
      )
      *
      100;

    },


  closerIsBetter:
    function(
      value,
      idealDistance,
      failureDistance
    ) {

      if (
        value <= idealDistance
      ) {

        return 100;

      }

      if (
        value >= failureDistance
      ) {

        return 0;

      }


      return (
        1
        -
        (
          (
            value
            -
            idealDistance
          )
          /
          (
            failureDistance
            -
            idealDistance
          )
        )
      )
      *
      100;

    },


  /*
  ==========================================================
  ACTOR HELPERS
  ==========================================================
  */


  actorByType:
    function(
      scenario,
      type
    ) {

      return (
        scenario.actors
        ||
        []
      )
      .find(
        function(actor) {

          return (
            actor.type ===
            type
          );

        }
      )
      ||
      null;

    },


  actorsByType:
    function(
      scenario,
      type
    ) {

      return (
        scenario.actors
        ||
        []
      )
      .filter(
        function(actor) {

          return (
            actor.type ===
            type
          );

        }
      );

    },


  visibleThreats:
    function(scenario) {

      return (
        scenario.actors
        ||
        []
      )
      .filter(
        function(actor) {

          return (
            (
              actor.type ===
                "enemyThreat"
              ||
              actor.type ===
                "secondaryThreat"
            )
            &&
            actor.visible !==
              false
          );

        }
      );

    },


  uncertainThreats:
    function(scenario) {

      return (
        scenario.actors
        ||
        []
      )
      .filter(
        function(actor) {

          return (
            actor.visible ===
              false
            ||
            actor.type ===
              "uncertainThreat"
          );

        }
      );

    },


  /*
  ==========================================================
  GEOMETRY
  ==========================================================
  */


  pointToSegmentDistance:
    function(
      point,
      segmentStart,
      segmentEnd
    ) {

      const x =
        Number(point.x);

      const y =
        Number(point.y);

      const x1 =
        Number(segmentStart.x);

      const y1 =
        Number(segmentStart.y);

      const x2 =
        Number(segmentEnd.x);

      const y2 =
        Number(segmentEnd.y);


      const dx =
        x2
        -
        x1;

      const dy =
        y2
        -
        y1;


      if (
        dx === 0
        &&
        dy === 0
      ) {

        return this.distance(
          point,
          segmentStart
        );

      }


      const t =
        this.clamp(
          (
            (
              x
              -
              x1
            )
            *
            dx
            +
            (
              y
              -
              y1
            )
            *
            dy
          )
          /
          (
            dx * dx
            +
            dy * dy
          ),
          0,
          1
        );


      const projection = {

        x:
          x1
          +
          t
          *
          dx,

        y:
          y1
          +
          t
          *
          dy

      };


      return this.distance(
        point,
        projection
      );

    },


  /*
  Returns how much usable map remains if Rafaela
  retreats directly away from the main visible threat.

  This measures simulated escape room,
  not an MLBB movement distance.
  */

  escapeRoomFromThreat:
    function(
      position,
      threat
    ) {

      if (
        !threat
      ) {

        return 75;

      }


      let dx =
        position.x
        -
        threat.x;

      let dy =
        position.y
        -
        threat.y;


      const magnitude =
        Math.sqrt(
          dx * dx
          +
          dy * dy
        );


      if (
        magnitude < 0.001
      ) {

        return 0;

      }


      dx /=
        magnitude;

      dy /=
        magnitude;


      const distances =
        [];


      if (
        dx > 0
      ) {

        distances.push(
          (
            97
            -
            position.x
          )
          /
          dx
        );

      }

      else if (
        dx < 0
      ) {

        distances.push(
          (
            3
            -
            position.x
          )
          /
          dx
        );

      }


      if (
        dy > 0
      ) {

        distances.push(
          (
            97
            -
            position.y
          )
          /
          dy
        );

      }

      else if (
        dy < 0
      ) {

        distances.push(
          (
            3
            -
            position.y
          )
          /
          dy
        );

      }


      const positive =
        distances.filter(
          function(value) {

            return (
              Number.isFinite(value)
              &&
              value >= 0
            );

          }
        );


      if (
        positive.length ===
        0
      ) {

        return 0;

      }


      return Math.min(
        ...positive
      );

    },


  /*
  ==========================================================
  CURRICULUM CONNECTION
  ==========================================================
  */


  findPositioningConcept:
    function() {

      try {

        if (
          !window.RafaelaCurriculum
          ||
          !Array.isArray(
            window.RafaelaCurriculum
              .domains
          )
        ) {

          return null;

        }


        for (
          const domain
          of
          window.RafaelaCurriculum
            .domains
        ) {

          for (
            const concept
            of
            (
              domain.concepts
              ||
              []
            )
        ) {

            const name =
              String(
                concept.name
                ||
                ""
              )
              .toLowerCase();


            if (
              name.includes(
                "position"
              )
            ) {

              return {

                conceptId:
                  concept.id,

                conceptName:
                  concept.name,

                domainName:
                  domain.name

              };

            }

          }

        }

      }

      catch(error) {

        console.warn(
          "Could not resolve positioning concept.",
          error
        );

      }


      return null;

    },


  /*
  ==========================================================
  SCENARIO LIBRARY
  ==========================================================
  */


  scenarioTemplates: [

    /*
    ----------------------------------------------------------
    1. OBJECTIVE SETUP + MISSING ENEMY
    ----------------------------------------------------------
    */

    {

      id:
        "objective_uncertainty",

      title:
        "Objective Setup — Missing Enemy",

      instruction:
        "Position Rafaela so she can support the objective and priority ally without becoming an easy target or overcommitting toward the unknown threat.",

      difficultyName:
        "Foundational",

      weights: {

        participation:
          0.18,

        allyAccess:
          0.20,

        threatSafety:
          0.20,

        objectiveAccess:
          0.14,

        escapeSpace:
          0.12,

        uncertaintySafety:
          0.16

      },

      startPosition: {

        x:
          58,

        y:
          83

      },

      actors: [

        {

          id:
            "priority_ally",

          type:
            "priorityAlly",

          short:
            "ALLY",

          label:
            "Priority ally",

          x:
            60,

          y:
            60,

          visible:
            true

        },

        {

          id:
            "frontline",

          type:
            "frontline",

          short:
            "FRONT",

          label:
            "Allied frontline",

          x:
            46,

          y:
            48,

          visible:
            true

        },

        {

          id:
            "primary_enemy",

          type:
            "enemyThreat",

          short:
            "ENEMY",

          label:
            "Visible primary threat",

          x:
            23,

          y:
            39,

          visible:
            true

        },

        {

          id:
            "objective",

          type:
            "objective",

          short:
            "OBJ",

          label:
            "Current objective",

          x:
            47,

          y:
            28,

          visible:
            true

        },

        {

          id:
            "unknown_enemy",

          type:
            "uncertainThreat",

          short:
            "?",

          label:
            "Enemy location uncertain",

          x:
            92,

          y:
            37,

          visible:
            false

        }

      ],

      facts: [

        "Your priority ally is participating near the objective.",

        "A visible enemy threat is approaching from the left side.",

        "An allied frontline is available.",

        "Another enemy is currently missing from confirmed vision."

      ],

      inferences: [

        "Moving too far toward the visible enemy increases exposure.",

        "Moving too far toward the uncertain side increases commitment into incomplete information.",

        "Staying too far back can disconnect Rafaela from the objective fight."

      ],

      unknowns: [

        "The missing enemy's exact location is unknown.",

        "The missing enemy's exact next action is unknown."

      ]

    },


    /*
    ----------------------------------------------------------
    2. PEEL FOR PRIORITY ALLY
    ----------------------------------------------------------
    */

    {

      id:
        "peel_priority_ally",

      title:
        "Protect the Priority Ally",

      instruction:
        "Position Rafaela to remain available for the threatened ally while avoiding a position that lets the enemy reach both of you easily.",

      difficultyName:
        "Foundational",

      weights: {

        participation:
          0.18,

        allyAccess:
          0.27,

        threatSafety:
          0.24,

        objectiveAccess:
          0.05,

        escapeSpace:
          0.16,

        uncertaintySafety:
          0.10

      },

      startPosition: {

        x:
          48,

        y:
          82

      },

      actors: [

        {

          id:
            "priority_ally",

          type:
            "priorityAlly",

          short:
            "ALLY",

          label:
            "Priority ally under pressure",

          x:
            55,

          y:
            61,

          visible:
            true

        },

        {

          id:
            "frontline",

          type:
            "frontline",

          short:
            "FRONT",

          label:
            "Allied frontline",

          x:
            43,

          y:
            49,

          visible:
            true

        },

        {

          id:
            "primary_enemy",

          type:
            "enemyThreat",

          short:
            "THREAT",

          label:
            "Enemy dive threat",

          x:
            69,

          y:
            33,

          visible:
            true

        },

        {

          id:
            "secondary_enemy",

          type:
            "secondaryThreat",

          short:
            "ENEMY",

          label:
            "Secondary enemy",

          x:
            31,

          y:
            31,

          visible:
            true

        }

      ],

      facts: [

        "The priority ally is exposed to an enemy dive threat.",

        "Two enemy threats are visible.",

        "Your frontline is closer to the enemy than the priority ally."

      ],

      inferences: [

        "Rafaela needs enough proximity to respond if the ally is engaged.",

        "Standing directly on top of the ally can allow one enemy action to threaten both positions.",

        "Excessive distance would remove Rafaela from the protection window."

      ],

      unknowns: [

        "The exact enemy commitment timing is not known."

      ]

    },


    /*
    ----------------------------------------------------------
    3. FOLLOW AN ALLIED ENGAGE
    ----------------------------------------------------------
    */

    {

      id:
        "follow_frontline",

      title:
        "Follow the Frontline Without Overcommitting",

      instruction:
        "Position close enough to support the frontline's play while preserving enough separation and retreat space to continue supporting afterward.",

      difficultyName:
        "Intermediate",

      weights: {

        participation:
          0.24,

        allyAccess:
          0.18,

        threatSafety:
          0.21,

        objectiveAccess:
          0.10,

        escapeSpace:
          0.17,

        uncertaintySafety:
          0.10

      },

      startPosition: {

        x:
          35,

        y:
          80

      },

      actors: [

        {

          id:
            "priority_ally",

          type:
            "priorityAlly",

          short:
            "ALLY",

          label:
            "Damage ally",

          x:
            42,

          y:
            68,

          visible:
            true

        },

        {

          id:
            "frontline",

          type:
            "frontline",

          short:
            "FRONT",

          label:
            "Engaging frontline",

          x:
            52,

          y:
            46,

          visible:
            true

        },

        {

          id:
            "primary_enemy",

          type:
            "enemyThreat",

          short:
            "THREAT",

          label:
            "Primary enemy threat",

          x:
            70,

          y:
            33,

          visible:
            true

        },

        {

          id:
            "objective",

          type:
            "objective",

          short:
            "OBJ",

          label:
            "Relevant objective area",

          x:
            59,

          y:
            24,

          visible:
            true

        }

      ],

      facts: [

        "Your frontline is moving toward the enemy.",

        "Your damage ally remains behind the frontline.",

        "The objective is relevant to the current play."

      ],

      inferences: [

        "If Rafaela stays too far behind, the frontline may engage without support.",

        "If Rafaela follows too deeply, she can become another easy target.",

        "The useful position should connect the frontline and the rest of the team."

      ],

      unknowns: [

        "The enemy's exact response to the frontline's advance is not yet known."

      ]

    },


    /*
    ----------------------------------------------------------
    4. DISENGAGE / LOST POSITION
    ----------------------------------------------------------
    */

    {

      id:
        "disengage",

      title:
        "Disengage Without Abandoning the Team",

      instruction:
        "Position Rafaela to preserve a retreat route and assist nearby allies without turning the retreat into additional deaths.",

      difficultyName:
        "Intermediate",

      weights: {

        participation:
          0.14,

        allyAccess:
          0.20,

        threatSafety:
          0.27,

        objectiveAccess:
          0.03,

        escapeSpace:
          0.26,

        uncertaintySafety:
          0.10

      },

      startPosition: {

        x:
          51,

        y:
          52

      },

      actors: [

        {

          id:
            "priority_ally",

          type:
            "priorityAlly",

          short:
            "ALLY",

          label:
            "Retreating ally",

          x:
            48,

          y:
            67,

          visible:
            true

        },

        {

          id:
            "frontline",

          type:
            "frontline",

          short:
            "FRONT",

          label:
            "Low-position frontline",

          x:
            45,

          y:
            49,

          visible:
            true

        },

        {

          id:
            "primary_enemy",

          type:
            "enemyThreat",

          short:
            "THREAT",

          label:
            "Enemy pursuing",

          x:
            52,

          y:
            27,

          visible:
            true

        },

        {

          id:
            "secondary_enemy",

          type:
            "secondaryThreat",

          short:
            "ENEMY",

          label:
            "Second pursuing enemy",

          x:
            69,

          y:
            37,

          visible:
            true

        }

      ],

      facts: [

        "The allied group is retreating.",

        "Multiple enemies are advancing.",

        "The nearest ally is moving toward the safer side of the battlefield."

      ],

      inferences: [

        "Remaining too far forward risks turning one lost position into another death.",

        "Retreating too far ahead of the ally can remove Rafaela's ability to assist.",

        "The useful position moves with the retreat instead of remaining fixed."

      ],

      unknowns: [

        "Whether the enemies will continue pursuing is not yet known."

      ]

    },


    /*
    ----------------------------------------------------------
    5. OBJECTIVE FRONT-TO-BACK
    ----------------------------------------------------------
    */

    {

      id:
        "objective_front_to_back",

      title:
        "Objective Fight — Maintain a Supportable Angle",

      instruction:
        "Find a position that keeps Rafaela relevant to the ally and objective while avoiding the enemy's easiest direct path.",

      difficultyName:
        "Intermediate",

      weights: {

        participation:
          0.21,

        allyAccess:
          0.18,

        threatSafety:
          0.22,

        objectiveAccess:
          0.17,

        escapeSpace:
          0.13,

        uncertaintySafety:
          0.09

      },

      startPosition: {

        x:
          24,

        y:
          78

      },

      actors: [

        {

          id:
            "priority_ally",

          type:
            "priorityAlly",

          short:
            "ALLY",

          label:
            "Priority damage ally",

          x:
            43,

          y:
            64,

          visible:
            true

        },

        {

          id:
            "frontline",

          type:
            "frontline",

          short:
            "FRONT",

          label:
            "Allied frontline",

          x:
            49,

          y:
            46,

          visible:
            true

        },

        {

          id:
            "primary_enemy",

          type:
            "enemyThreat",

          short:
            "THREAT",

          label:
            "Visible enemy threat",

          x:
            67,

          y:
            38,

          visible:
            true

        },

        {

          id:
            "objective",

          type:
            "objective",

          short:
            "OBJ",

          label:
            "Contested objective",

          x:
            53,

          y:
            27,

          visible:
            true

        }

      ],

      facts: [

        "Both teams are contesting an objective.",

        "The frontline is between your team and the primary enemy.",

        "The priority ally is positioned behind the frontline."

      ],

      inferences: [

        "Rafaela should remain relevant to both ally support and objective pressure.",

        "Standing directly in the enemy-to-ally path can make Rafaela easier to engage.",

        "The frontline can reduce access pressure when positioned between Rafaela and the threat."

      ],

      unknowns: [

        "Enemy follow-up resources are not fully known."

      ]

    }

  ],


  /*
  ==========================================================
  SCENARIO GENERATION
  ==========================================================
  */


  scenarioCursor:
    0,


  generateNextTrainingScenario:
    function() {

      if (
        this.scenarioTemplates.length ===
        0
      ) {

        return null;

      }


      /*
      Rotate through different contexts instead of
      repeating only one map situation.

      This supports varied practice and interleaving.
      */

      const template =
        this.scenarioTemplates[
          this.scenarioCursor
          %
          this.scenarioTemplates.length
        ];


      this.scenarioCursor++;


      const scenario =
        JSON.parse(
          JSON.stringify(
            template
          )
        );


      const curriculumMatch =
        this.findPositioningConcept();


      scenario.conceptId =
        curriculumMatch
        ?
        curriculumMatch.conceptId
        :
        "positioning";


      scenario.selection = {

        conceptId:
          scenario.conceptId,

        conceptName:
          curriculumMatch
          ?
          curriculumMatch.conceptName
          :
          "Positioning",

        domainName:
          curriculumMatch
          ?
          curriculumMatch.domainName
          :
          "Universal Fundamentals"

      };


      return scenario;

    },


  /*
  ==========================================================
  ALLY ACCESS
  ==========================================================
  */


  scoreAllyAccess:
    function(
      scenario,
      position
    ) {

      const ally =
        this.actorByType(
          scenario,
          "priorityAlly"
        );


      if (
        !ally
      ) {

        return 70;

      }


      const distance =
        this.distance(
          position,
          ally
        );


      /*
      Strong support access should be close enough
      to participate, but we do NOT reward physically
      overlapping the ally.

      Again: these are abstract simulation distances.
      */

      let score =
        this.rangeScore(
          distance,
          11,
          24,
          19
        );


      /*
      Heavy anti-stacking penalty.

      This directly fixes the problem visible in the
      screenshot where TARGET could appear almost
      on top of ALLY.
      */

      if (
        distance < 8
      ) {

        score *=
          0.50;

      }


      if (
        distance < 5
      ) {

        score *=
          0.35;

      }


      return this.roundScore(
        score
      );

    },


  /*
  ==========================================================
  THREAT SAFETY
  ==========================================================
  */


  scoreThreatSafety:
    function(
      scenario,
      position
    ) {

      const threats =
        this.visibleThreats(
          scenario
        );


      if (
        threats.length ===
        0
      ) {

        return 85;

      }


      const individualScores =
        threats.map(
          (threat) => {

            const distance =
              this.distance(
                position,
                threat
              );


            return this.fartherIsSafer(
              distance,
              10,
              34
            );

          }
        );


      /*
      The nearest / most dangerous visible threat
      should matter more than an average that could
      hide one severe exposure.
      */

      const minimum =
        Math.min(
          ...individualScores
        );


      const mean =
        this.average(
          individualScores
        );


      let score =
        (
          minimum
          *
          0.65
        )
        +
        (
          mean
          *
          0.35
        );


      /*
      Evaluate whether Rafaela stands near the
      direct line between a threat and the
      priority ally.

      This is an exposure proxy, not a claim
      about specific enemy skill geometry.
      */

      const ally =
        this.actorByType(
          scenario,
          "priorityAlly"
        );


      if (
        ally
      ) {

        threats.forEach(
          (threat) => {

            const pathDistance =
              this.pointToSegmentDistance(
                position,
                threat,
                ally
              );


            if (
              pathDistance < 7
            ) {

              score -=
                12;

            }

          }
        );

      }


      /*
      Frontline relationship.

      We do NOT require Rafaela to always be
      behind the frontline.

      We only give a modest benefit when the
      frontline is genuinely positioned between
      Rafaela and the nearest threat.
      */

      const frontline =
        this.actorByType(
          scenario,
          "frontline"
        );


      if (
        frontline
      ) {

        const nearestThreat =
          threats
            .slice()
            .sort(
              (a, b) => {

                return (
                  this.distance(
                    position,
                    a
                  )
                  -
                  this.distance(
                    position,
                    b
                  )
                );

              }
            )[0];


        const candidateToThreat =
          this.distance(
            position,
            nearestThreat
          );


        const frontlineToThreat =
          this.distance(
            frontline,
            nearestThreat
          );


        const coverLineDistance =
          this.pointToSegmentDistance(
            frontline,
            nearestThreat,
            position
          );


        const frontlineBetween =
          (
            frontlineToThreat
            <
            candidateToThreat
          );


        if (
          frontlineBetween
          &&
          coverLineDistance < 11
        ) {

          score +=
            10;

        }

      }


      return this.roundScore(
        score
      );

    },


  /*
  ==========================================================
  OBJECTIVE ACCESS
  ==========================================================
  */


  scoreObjectiveAccess:
    function(
      scenario,
      position
    ) {

      const objective =
        this.actorByType(
          scenario,
          "objective"
        );


      if (
        !objective
      ) {

        /*
        Objective access is neutral when the
        scenario deliberately has no relevant
        immediate objective actor.
        */

        return 75;

      }


      const distance =
        this.distance(
          position,
          objective
        );


      let score =
        this.rangeScore(
          distance,
          17,
          33,
          24
        );


      /*
      Rafaela does not gain extra training credit
      for sitting directly on the objective marker.
      */

      if (
        distance < 8
      ) {

        score *=
          0.65;

      }


      return this.roundScore(
        score
      );

    },


  /*
  ==========================================================
  ESCAPE SPACE
  ==========================================================
  */


  scoreEscapeSpace:
    function(
      scenario,
      position
    ) {

      const threats =
        this.visibleThreats(
          scenario
        );


      if (
        threats.length ===
        0
      ) {

        return 80;

      }


      const nearestThreat =
        threats
          .slice()
          .sort(
            (a, b) => {

              return (
                this.distance(
                  position,
                  a
                )
                -
                this.distance(
                  position,
                  b
                )
              );

            }
          )[0];


      const room =
        this.escapeRoomFromThreat(
          position,
          nearestThreat
        );


      /*
      More usable space in the direction away
      from the threat generally gives more
      retreat options.
      */

      let roomScore =
        this.clamp(
          (
            room
            /
            35
          )
          *
          100,
          0,
          100
        );


      /*
      Standing extremely near any map boundary
      can reduce available movement options.
      */

      const edgeDistance =
        Math.min(
          position.x,
          100
          -
          position.x,
          position.y,
          100
          -
          position.y
        );


      const edgeScore =
        this.clamp(
          (
            edgeDistance
            /
            16
          )
          *
          100,
          0,
          100
        );


      return this.roundScore(
        (
          roomScore
          *
          0.72
        )
        +
        (
          edgeScore
          *
          0.28
        )
      );

    },


  /*
  ==========================================================
  UNCERTAINTY SAFETY
  ==========================================================
  */


  scoreUncertaintySafety:
    function(
      scenario,
      position
    ) {

      const uncertain =
        this.uncertainThreats(
          scenario
        );


      if (
        uncertain.length ===
        0
      ) {

        return 85;

      }


      const scores =
        uncertain.map(
          (source) => {

            /*
            The '?' actor represents the SIDE /
            SOURCE OF UNCERTAINTY, not the enemy's
            confirmed exact coordinate.
            */

            const distance =
              this.distance(
                position,
                source
              );


            return this.fartherIsSafer(
              distance,
              15,
              39
            );

          }
        );


      return this.roundScore(
        Math.min(
          ...scores
        )
      );

    },


  /*
  ==========================================================
  PARTICIPATION
  ==========================================================
  */


  scoreParticipation:
    function(
      scenario,
      position,
      allyAccess,
      objectiveAccess
    ) {

      const frontline =
        this.actorByType(
          scenario,
          "frontline"
        );


      let frontlineAccess =
        75;


      if (
        frontline
      ) {

        const distance =
          this.distance(
            position,
            frontline
          );


        frontlineAccess =
          this.rangeScore(
            distance,
            13,
            31,
            24
          );

      }


      return this.roundScore(
        (
          allyAccess
          *
          0.46
        )
        +
        (
          frontlineAccess
          *
          0.29
        )
        +
        (
          objectiveAccess
          *
          0.25
        )
      );

    },


  /*
  ==========================================================
  CROWDING / OVERLAP PENALTY
  ==========================================================
  */


  getCrowdingPenalty:
    function(
      scenario,
      position
    ) {

      let penalty =
        0;


      (
        scenario.actors
        ||
        []
      )
      .forEach(
        (actor) => {

          /*
          The uncertain '?' marker is conceptual.
          Do not apply physical actor-overlap rules
          to it.
          */

          if (
            actor.visible ===
            false
          ) {

            return;

          }


          const distance =
            this.distance(
              position,
              actor
            );


          if (
            distance < 4
          ) {

            penalty +=
              34;

          }

          else if (
            distance < 7
          ) {

            penalty +=
              20;

          }

          else if (
            distance < 9
          ) {

            penalty +=
              8;

          }

        }
      );


      return this.clamp(
        penalty,
        0,
        55
      );

    },


  /*
  ==========================================================
  CRITICAL POSITION CHECKS
  ==========================================================
  */


  getCriticalFlags:
    function(
      scenario,
      position
    ) {

      const flags =
        [];


      const ally =
        this.actorByType(
          scenario,
          "priorityAlly"
        );


      const threats =
        this.visibleThreats(
          scenario
        );


      if (
        ally
      ) {

        const allyDistance =
          this.distance(
            position,
            ally
          );


        if (
          allyDistance > 43
        ) {

          flags.push(
            "disconnected_from_priority_ally"
          );

        }

      }


      threats.forEach(
        (threat) => {

          const threatDistance =
            this.distance(
              position,
              threat
            );


          if (
            threatDistance < 9
          ) {

            flags.push(
              "extreme_visible_threat_exposure"
            );

          }

        }
      );


      const crowding =
        this.getCrowdingPenalty(
          scenario,
          position
        );


      if (
        crowding >= 30
      ) {

        flags.push(
          "actor_overlap"
        );

      }


      return flags;

    },


  /*
  ==========================================================
  FEEDBACK GENERATION
  ==========================================================
  */


  getWeakestDimension:
    function(dimensions) {

      const labels = {

        participation:
          "Participation",

        allyAccess:
          "Ally Access",

        threatSafety:
          "Threat Safety",

        objectiveAccess:
          "Objective Access",

        escapeSpace:
          "Escape Space",

        uncertaintySafety:
          "Uncertainty Safety"

      };


      const entries =
        Object.keys(
          labels
        )
        .map(
          function(key) {

            return {

              key:
                key,

              label:
                labels[
                  key
                ],

              score:
                dimensions[
                  key
                ]

            };

          }
        );


      entries.sort(
        function(a, b) {

          return (
            a.score
            -
            b.score
          );

        }
      );


      return entries[
        0
      ];

    },


  buildFeedback:
    function(
      scenario,
      dimensions,
      overall,
      flags
    ) {

      const weakest =
        this.getWeakestDimension(
          dimensions
        );


      let title =
        "Usable Position";


      if (
        overall >= 88
      ) {

        title =
          "Strong Position";

      }

      else if (
        overall >= 76
      ) {

        title =
          "Good — Refine the Position";

      }

      else if (
        overall >= 62
      ) {

        title =
          "Usable — Important Tradeoff";

      }

      else {

        title =
          "Reposition";

      }


      if (
        flags.includes(
          "extreme_visible_threat_exposure"
        )
      ) {

        title =
          "Too Exposed";

      }


      else if (
        flags.includes(
          "disconnected_from_priority_ally"
        )
      ) {

        title =
          "Too Disconnected";

      }


      else if (
        flags.includes(
          "actor_overlap"
        )
      ) {

        title =
          "Too Crowded";

      }


      const feedbackMap = {

        participation: {

          mainCorrection:
            "Reconnect to the play",

          action:
            "Move toward a position that lets Rafaela influence the relevant ally, frontline, or objective without sacrificing unnecessary safety.",

          reason:
            "A position can be very safe but still poor if Rafaela cannot affect the play when action begins.",

          exception:
            "Temporary distance can be correct during a reset, retreat, or when joining the play would create a larger loss.",

          resultCheck:
            "If the fight starts now, can Rafaela contribute quickly enough to matter?"

        },


        allyAccess: {

          mainCorrection:
            "Improve ally access",

          action:
            "Move closer to the priority ally while keeping enough separation that one enemy action does not easily threaten both positions.",

          reason:
            "Rafaela needs practical access to the ally she may need to enable or protect, but stacking directly on that ally can reduce spacing.",

          exception:
            "The priority ally can change when another teammate becomes more important to the immediate win condition.",

          resultCheck:
            "Can Rafaela assist the relevant ally quickly without occupying the exact same danger space?"

        },


        threatSafety: {

          mainCorrection:
            "Reduce threat access",

          action:
            "Create more separation from the most relevant visible threat and move away from its easiest direct access path while staying connected to allies.",

          reason:
            "Rafaela loses support value if the enemy can remove her before she contributes meaningfully.",

          exception:
            "Some calculated forward positioning is justified when the expected gain is worth the exposure and allies can immediately participate.",

          resultCheck:
            "Can the visible threat reach Rafaela more easily than necessary?"

        },


        objectiveAccess: {

          mainCorrection:
            "Reconnect to the objective",

          action:
            "Shift toward a position that keeps the objective within the team's practical support area without standing directly on the most contested space.",

          reason:
            "Being alive but irrelevant to the objective can still be a positioning failure.",

          exception:
            "Objective proximity matters less when the correct team decision is to concede, reset, defend elsewhere, or protect another win condition.",

          resultCheck:
            "Does Rafaela's current position meaningfully support the objective plan?"

        },


        escapeSpace: {

          mainCorrection:
            "Preserve a retreat lane",

          action:
            "Move to a position with more usable space behind Rafaela relative to the primary threat while remaining close enough to participate.",

          reason:
            "A support position is stronger when Rafaela can contribute and still reposition after the enemy responds.",

          exception:
            "Retreat space can be traded for commitment when the team has a justified decisive opportunity.",

          resultCheck:
            "If the enemy advances now, does Rafaela have somewhere useful to move?"

        },


        uncertaintySafety: {

          mainCorrection:
            "Respect missing information",

          action:
            "Shift away from the unverified threat side while preserving access to the ally and objective.",

          reason:
            "Unknown information should change positioning even when it does not prove where the missing enemy actually is.",

          exception:
            "Once reliable information resolves the uncertainty, Rafaela can reposition more aggressively or more specifically.",

          resultCheck:
            "Are you committing toward a threat that has not actually been located?"

        }

      };


      let feedback =
        feedbackMap[
          weakest.key
        ];


      /*
      Critical flags override ordinary weakest-score
      coaching because they represent a more urgent
      positioning error.
      */

      if (
        flags.includes(
          "extreme_visible_threat_exposure"
        )
      ) {

        feedback = {

          mainCorrection:
            "Leave the immediate threat zone",

          action:
            "Increase separation from the visible threat first, then reconnect to the ally from a safer angle.",

          reason:
            "Immediate exposure has higher priority because being removed prevents Rafaela from performing every other support function.",

          exception:
            "Brief forward commitment can be justified when it produces a higher-value team outcome and the risk is intentional.",

          resultCheck:
            "Can Rafaela remain alive long enough to perform the next support action?"

        };

      }


      else if (
        flags.includes(
          "disconnected_from_priority_ally"
        )
      ) {

        feedback = {

          mainCorrection:
            "Reconnect to the team",

          action:
            "Move toward the relevant ally group while preserving separation from enemy threat paths.",

          reason:
            "Excessive safety removes Rafaela from the actual play and prevents timely support.",

          exception:
            "Distance can be correct when the team itself should disengage or when another location has higher strategic priority.",

          resultCheck:
            "If the ally is engaged now, can Rafaela realistically influence the outcome?"

        };

      }


      else if (
        flags.includes(
          "actor_overlap"
        )
      ) {

        feedback = {

          mainCorrection:
            "Create functional spacing",

          action:
            "Move slightly away from the nearby actor while maintaining access to the same play.",

          reason:
            "The simulator discourages stacking because useful support positioning usually benefits from maintaining its own movement and response space.",

          exception:
            "This is an abstract training rule, not a claim that a fixed separation distance is always required in MLBB.",

          resultCheck:
            "Can Rafaela preserve access without occupying almost the exact same position?"

        };

      }


      return {

        title:
          title,

        mainCorrection:
          feedback.mainCorrection,

        action:
          feedback.action,

        reason:
          feedback.reason,

        exception:
          feedback.exception,

        resultCheck:
          feedback.resultCheck,

        weakestDimension:
          weakest.key

      };

    },


  /*
  ==========================================================
  MAIN POSITION EVALUATOR
  ==========================================================
  */


  evaluatePosition:
    function(
      scenario,
      position
    ) {

      if (
        !scenario
        ||
        !position
      ) {

        throw new Error(
          "Scenario and position are required."
        );

      }


      const allyAccess =
        this.scoreAllyAccess(
          scenario,
          position
        );


      const threatSafety =
        this.scoreThreatSafety(
          scenario,
          position
        );


      const objectiveAccess =
        this.scoreObjectiveAccess(
          scenario,
          position
        );


      const escapeSpace =
        this.scoreEscapeSpace(
          scenario,
          position
        );


      const uncertaintySafety =
        this.scoreUncertaintySafety(
          scenario,
          position
        );


      const participation =
        this.scoreParticipation(
          scenario,
          position,
          allyAccess,
          objectiveAccess
        );


      const dimensions = {

        participation:
          participation,

        allyAccess:
          allyAccess,

        threatSafety:
          threatSafety,

        objectiveAccess:
          objectiveAccess,

        escapeSpace:
          escapeSpace,

        uncertaintySafety:
          uncertaintySafety

      };


      const weights =
        scenario.weights
        ||
        {

          participation:
            0.20,

          allyAccess:
            0.20,

          threatSafety:
            0.22,

          objectiveAccess:
            0.13,

          escapeSpace:
            0.13,

          uncertaintySafety:
            0.12

        };


      let overall =

        (
          participation
          *
          weights.participation
        )

        +

        (
          allyAccess
          *
          weights.allyAccess
        )

        +

        (
          threatSafety
          *
          weights.threatSafety
        )

        +

        (
          objectiveAccess
          *
          weights.objectiveAccess
        )

        +

        (
          escapeSpace
          *
          weights.escapeSpace
        )

        +

        (
          uncertaintySafety
          *
          weights.uncertaintySafety
        );


      /*
      Apply spacing penalty AFTER the strategic
      dimensions so TARGET will not simply sit
      directly on another actor.
      */

      const crowdingPenalty =
        this.getCrowdingPenalty(
          scenario,
          position
        );


      overall -=
        crowdingPenalty;


      const flags =
        this.getCriticalFlags(
          scenario,
          position
        );


      /*
      Critical-state caps.

      These prevent a candidate from receiving
      an apparently excellent overall score while
      committing a major positioning error.
      */

      if (
        flags.includes(
          "extreme_visible_threat_exposure"
        )
      ) {

        overall =
          Math.min(
            overall,
            44
          );

      }


      if (
        flags.includes(
          "disconnected_from_priority_ally"
        )
      ) {

        overall =
          Math.min(
            overall,
            57
          );

      }


      if (
        flags.includes(
          "actor_overlap"
        )
      ) {

        overall =
          Math.min(
            overall,
            69
          );

      }


      overall =
        this.roundScore(
          overall
        );


      const feedback =
        this.buildFeedback(
          scenario,
          dimensions,
          overall,
          flags
        );


      /*
      "Successful" does NOT mean mastery.
      It only means this decision-practice rep
      met the current simulated quality criterion.
      */

      const successful =
        (
          overall >= 76
          &&
          flags.length === 0
        );


      return {

        conceptId:
          scenario.conceptId
          ||
          "positioning",

        overall:
          overall,

        successful:
          successful,

        dimensions:
          dimensions,

        feedback:
          feedback,

        flags:
          flags,

        crowdingPenalty:
          crowdingPenalty,

        limitation:
          "Decision practice only. The battlefield uses abstract training geometry, not official MLBB ranges. The result evaluates the information represented in this scenario and does not prove real-match mechanical execution."

      };

    }

};
