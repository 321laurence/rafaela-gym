/*
  RAFAELA GYM
  Scenario Engine — V2

  PURPOSE

  Convert Universal Support Doctrine concepts into
  practical decision-training situations.

  Important:

  - These scenarios are DECISION PRACTICE.
  - They are NOT proof of real mechanical skill.
  - Coordinates use normalized training-space units
    from 0 to 100.
  - These values are NOT MLBB ranges, distances,
    cooldowns, or hidden game statistics.
  - Patch-sensitive Rafaela mechanics do not belong here.

  The engine trains:
  - observation
  - uncertainty
  - prioritization
  - positioning
  - threat management
  - ally access
  - objective participation
  - escape space
  - tradeoffs
*/


window.RafaelaScenarios = {

  version:
    "2.0.0",


  /*
    Scenario difficulty levels.

    Difficulty increases through:
    - more competing priorities
    - more uncertainty
    - more relevant actors
    - tighter tradeoffs

    NOT obscure trivia.
  */

  difficultyLevels: {

    1: {
      name:
        "Foundation",

      description:
        "One dominant cue with limited competing information."
    },


    2: {
      name:
        "Developing",

      description:
        "Two relevant priorities must be balanced."
    },


    3: {
      name:
        "Applied",

      description:
        "Multiple threats, allies, or objectives compete for attention."
    },


    4: {
      name:
        "Advanced",

      description:
        "Uncertainty and tradeoffs make the best action less obvious."
    },


    5: {
      name:
        "Mixed Macro",

      description:
        "Several systems interact and priorities can change quickly."
    }

  },


  /*
    Generic actor types.

    These describe tactical function,
    not specific MLBB heroes.
  */

  actorTypes: {

    priorityAlly: {
      label:
        "Priority Ally",

      short:
        "ALLY"
    },


    frontline: {
      label:
        "Frontline Ally",

      short:
        "FRONT"
    },


    damageAlly: {
      label:
        "Damage Ally",

      short:
        "DMG"
    },


    enemyThreat: {
      label:
        "Primary Threat",

      short:
        "THREAT"
    },


    secondaryThreat: {
      label:
        "Secondary Threat",

      short:
        "ENEMY"
    },


    missingThreat: {
      label:
        "Missing Threat",

      short:
        "?"
    },


    objective: {
      label:
        "Objective",

      short:
        "OBJ"
    }

  },


  /*
    Helper:
    constrain a normalized coordinate.
  */

  clamp:
    function(
      value,
      min,
      max
    ) {

      return Math.max(
        min,
        Math.min(
          max,
          value
        )
      );

    },


  /*
    Helper:
    distance in normalized training-space units.

    Again:
    this is NOT an MLBB distance measurement.
  */

  distance:
    function(
      a,
      b
    ) {

      const dx =
        a.x - b.x;


      const dy =
        a.y - b.y;


      return Math.sqrt(
        dx * dx
        +
        dy * dy
      );

    },


  /*
    Deterministic pseudo-random generator.

    A seed lets us recreate a scenario later.
  */

  createRandom:
    function(
      seed
    ) {

      let value =
        Number(seed)
        ||
        Date.now();


      return function() {

        value |= 0;

        value =
          value + 0x6D2B79F5
          | 0;


        let t =
          Math.imul(
            value
            ^
            value >>> 15,
            1
            |
            value
          );


        t =
          t
          +
          Math.imul(
            t
            ^
            t >>> 7,
            61
            |
            t
          )
          ^
          t;


        return (
          (
            t
            ^
            t >>> 14
          )
          >>>
          0
        )
        /
        4294967296;

      };

    },


  /*
    Helper:
    choose one item.
  */

  pick:
    function(
      random,
      items
    ) {

      const index =
        Math.floor(
          random()
          *
          items.length
        );


      return items[
        index
      ];

    },


  /*
    Helper:
    choose a number between min and max.
  */

  between:
    function(
      random,
      min,
      max
    ) {

      return (
        min
        +
        random()
        *
        (
          max
          -
          min
        )
      );

    },


  /*
    Helper:
    create actor object.
  */

  actor:
    function(
      id,
      type,
      x,
      y,
      options
    ) {

      const config =
        options
        ||
        {};


      return {

        id:
          id,

        type:
          type,

        label:
          config.label
          ||
          this.actorTypes[
            type
          ].label,

        short:
          config.short
          ||
          this.actorTypes[
            type
          ].short,

        x:
          this.clamp(
            x,
            5,
            95
          ),

        y:
          this.clamp(
            y,
            5,
            95
          ),

        visible:
          config.visible !==
          false,

        relevant:
          config.relevant !==
          false,

        notes:
          config.notes
          ||
          ""

      };

    },


  /*
    ------------------------------------------------
    SCENARIO BUILDERS
    ------------------------------------------------
  */


  buildParticipationScenario:
    function(
      random,
      difficulty
    ) {

      const side =
        random() > 0.5
        ?
        1
        :
        -1;


      const objective =
        this.actor(
          "objective",
          "objective",
          50,
          24
        );


      const front =
        this.actor(
          "frontline",
          "frontline",
          50
          +
          side
          *
          this.between(
            random,
            2,
            9
          ),
          43
        );


      const ally =
        this.actor(
          "priority_ally",
          "priorityAlly",
          50
          -
          side
          *
          this.between(
            random,
            12,
            22
          ),
          60
        );


      const threat =
        this.actor(
          "primary_threat",
          "enemyThreat",
          50
          +
          side
          *
          this.between(
            random,
            24,
            34
          ),
          43
        );


      const actors = [
        objective,
        front,
        ally,
        threat
      ];


      if (
        difficulty >= 3
      ) {

        actors.push(
          this.actor(
            "secondary_enemy",
            "secondaryThreat",
            50
            -
            side
            *
            this.between(
              random,
              28,
              38
            ),
            31
          )
        );

      }


      return {

        conceptId:
          "positioning_01",

        title:
          "Useful Participation",

        instruction:
          "Position Rafaela so she can influence the play without becoming unnecessarily exposed.",

        facts: [
          "An objective is active.",
          "A frontline ally is positioned ahead.",
          "A priority ally needs support access.",
          "A visible enemy threat can pressure the fight."
        ],

        inferences: [
          "Standing too far away may remove Rafaela from the play.",
          "Standing directly with the frontline may create unnecessary exposure."
        ],

        unknowns:
          difficulty >= 3
          ?
          [
            "The secondary enemy's next action is unknown."
          ]
          :
          [
            "The enemy threat's exact next action is unknown."
          ],

        actors:
          actors,

        startPosition: {
          x:
            50
            -
            side
            *
            22,

          y:
            78
        },

        evaluation:
          "positioning",

        focusWeights: {

          participation:
            1.0,

          threatSafety:
            1.0,

          allyAccess:
            1.0,

          objectiveAccess:
            0.8,

          frontlineSeparation:
            0.7,

          escapeSpace:
            0.7

        }

      };

    },


  buildThreatReachScenario:
    function(
      random,
      difficulty
    ) {

      const side =
        random() > 0.5
        ?
        1
        :
        -1;


      const ally =
        this.actor(
          "priority_ally",
          "priorityAlly",
          50
          -
          side
          *
          15,
          56
        );


      const front =
        this.actor(
          "frontline",
          "frontline",
          50
          +
          side
          *
          4,
          43
        );


      const threat =
        this.actor(
          "primary_threat",
          "enemyThreat",
          50
          +
          side
          *
          29,
          45
        );


      const actors = [
        ally,
        front,
        threat
      ];


      if (
        difficulty >= 3
      ) {

        actors.push(
          this.actor(
            "objective",
            "objective",
            50,
            24
          )
        );

      }


      return {

        conceptId:
          "threats_02",

        title:
          "Threat Reach",

        instruction:
          "Position for what the threat could plausibly do next, not only where it currently stands.",

        facts: [
          "The primary threat is visible.",
          "The priority ally is within the current fight area.",
          "The frontline ally is already ahead of Rafaela."
        ],

        inferences: [
          "The enemy may close distance or control an exposed support angle.",
          "Rafaela can remain useful without occupying the frontline's danger zone."
        ],

        unknowns: [
          "The enemy threat's exact next action is unknown."
        ],

        actors:
          actors,

        startPosition: {
          x:
            50
            -
            side
            *
            6,

          y:
            71
        },

        evaluation:
          "positioning",

        focusWeights: {

          participation:
            0.9,

          threatSafety:
            1.3,

          allyAccess:
            1.0,

          objectiveAccess:
            difficulty >= 3
            ?
            0.6
            :
            0,

          frontlineSeparation:
            0.8,

          escapeSpace:
            0.8

        }

      };

    },


  buildMissingThreatScenario:
    function(
      random,
      difficulty
    ) {

      const side =
        random() > 0.5
        ?
        1
        :
        -1;


      const ally =
        this.actor(
          "priority_ally",
          "priorityAlly",
          50
          -
          side
          *
          10,
          57
        );


      const visibleThreat =
        this.actor(
          "visible_threat",
          "secondaryThreat",
          50
          +
          side
          *
          29,
          40
        );


      const missingThreat =
        this.actor(
          "missing_threat",
          "missingThreat",
          50
          -
          side
          *
          38,
          39,
          {
            visible:
              false,

            notes:
              "Exact location unknown."
          }
        );


      const actors = [
        ally,
        visibleThreat,
        missingThreat
      ];


      if (
        difficulty >= 2
      ) {

        actors.push(
          this.actor(
            "objective",
            "objective",
            50,
            25
          )
        );

      }


      return {

        conceptId:
          "information_02",

        title:
          "Missing Threat",

        instruction:
          "Stay useful while denying the most obvious collapse angle from the unseen threat.",

        facts: [
          "One enemy threat is visible.",
          "A dangerous enemy is currently missing.",
          "The priority ally remains in the active area."
        ],

        inferences: [
          "The missing threat may approach through an open flank.",
          "Total retreat would also reduce Rafaela's participation."
        ],

        unknowns: [
          "The missing enemy's exact location is unknown.",
          "The missing enemy's exact next action is unknown."
        ],

        actors:
          actors,

        hiddenThreatSide:
          side
          *
          -1,

        startPosition: {
          x:
            50,

          y:
            75
        },

        evaluation:
          "uncertainty_positioning",

        focusWeights: {

          participation:
            1.0,

          threatSafety:
            0.9,

          allyAccess:
            1.0,

          objectiveAccess:
            difficulty >= 2
            ?
            0.5
            :
            0,

          frontlineSeparation:
            0.3,

          escapeSpace:
            1.0,

          uncertaintySafety:
            1.3

        }

      };

    },


  buildFrontlineScenario:
    function(
      random,
      difficulty
    ) {

      const side =
        random() > 0.5
        ?
        1
        :
        -1;


      const front =
        this.actor(
          "frontline",
          "frontline",
          50
          +
          side
          *
          4,
          38
        );


      const ally =
        this.actor(
          "priority_ally",
          "priorityAlly",
          50
          -
          side
          *
          16,
          57
        );


      const threat =
        this.actor(
          "primary_threat",
          "enemyThreat",
          50
          +
          side
          *
          27,
          35
        );


      return {

        conceptId:
          "positioning_02",

        title:
          "Support Without Copying Frontline",

        instruction:
          "Support the advancing ally without occupying the same danger zone.",

        facts: [
          "The frontline ally is advancing.",
          "The priority ally remains behind the frontline.",
          "A visible threat can pressure the forward area."
        ],

        inferences: [
          "The frontline can tolerate exposure that Rafaela may not want to copy.",
          "Rafaela can support from a different angle or depth."
        ],

        unknowns: [
          "How far the frontline will continue is unknown."
        ],

        actors: [
          front,
          ally,
          threat
        ],

        startPosition: {
          x:
            front.x
            -
            side
            *
            4,

          y:
            48
        },

        evaluation:
          "positioning",

        focusWeights: {

          participation:
            0.9,

          threatSafety:
            1.0,

          allyAccess:
            0.9,

          objectiveAccess:
            0,

          frontlineSeparation:
            1.4,

          escapeSpace:
            0.7

        }

      };

    },


  buildObjectivePreparationScenario:
    function(
      random,
      difficulty
    ) {

      const side =
        random() > 0.5
        ?
        1
        :
        -1;


      const objective =
        this.actor(
          "objective",
          "objective",
          50,
          23
        );


      const ally =
        this.actor(
          "priority_ally",
          "priorityAlly",
          50
          -
          side
          *
          16,
          53
        );


      const front =
        this.actor(
          "frontline",
          "frontline",
          50
          +
          side
          *
          5,
          42
        );


      const threat =
        this.actor(
          "primary_threat",
          "enemyThreat",
          50
          +
          side
          *
          31,
          39
        );


      const actors = [
        objective,
        ally,
        front,
        threat
      ];


      if (
        difficulty >= 4
      ) {

        actors.push(
          this.actor(
            "missing_threat",
            "missingThreat",
            50
            -
            side
            *
            38,
            34,
            {
              visible:
                false
            }
          )
        );

      }


      return {

        conceptId:
          "objectives_01",

        title:
          "Objective Preparation",

        instruction:
          "Take a position that supports the coming objective before direct contest begins.",

        facts: [
          "The objective area is becoming important.",
          "Allies are approaching the objective.",
          "A visible enemy threat can contest the area."
        ],

        inferences: [
          "Late positioning will reduce available options.",
          "Preparation should preserve ally access and safe routes."
        ],

        unknowns:
          difficulty >= 4
          ?
          [
            "A relevant enemy is missing.",
            "The enemy team's exact contest route is unknown."
          ]
          :
          [
            "The enemy team's exact contest route is unknown."
          ],

        actors:
          actors,

        startPosition: {
          x:
            50
            -
            side
            *
            12,

          y:
            78
        },

        evaluation:
          difficulty >= 4
          ?
          "uncertainty_positioning"
          :
          "positioning",

        focusWeights: {

          participation:
            0.9,

          threatSafety:
            0.9,

          allyAccess:
            0.9,

          objectiveAccess:
            1.4,

          frontlineSeparation:
            0.5,

          escapeSpace:
            0.9,

          uncertaintySafety:
            difficulty >= 4
            ?
            0.8
            :
            0

        }

      };

    },


  /*
    ------------------------------------------------
    SCENARIO SELECTION
    ------------------------------------------------
  */


  buildersByConcept: {

    positioning_01:
      "buildParticipationScenario",

    positioning_02:
      "buildFrontlineScenario",

    threats_02:
      "buildThreatReachScenario",

    information_02:
      "buildMissingThreatScenario",

    objectives_01:
      "buildObjectivePreparationScenario"

  },


  /*
    Concepts that do not yet have a dedicated
    visual builder can still use a related
    positioning scenario temporarily.

    This prevents the app from breaking while
    we progressively add more specialized gyms.
  */

  fallbackBuilders: {

    team_goal_01:
      "buildParticipationScenario",

    team_goal_02:
      "buildObjectivePreparationScenario",

    information_01:
      "buildMissingThreatScenario",

    positioning_03:
      "buildParticipationScenario",

    threats_01:
      "buildThreatReachScenario",

    support_01:
      "buildParticipationScenario",

    support_02:
      "buildThreatReachScenario",

    tempo_01:
      "buildObjectivePreparationScenario",

    tempo_02:
      "buildObjectivePreparationScenario",

    teamfights_01:
      "buildThreatReachScenario",

    self_01:
      "buildParticipationScenario"

  },


  /*
    Generate one scenario.
  */

  generate:
    function(
      conceptId,
      options
    ) {

      const config =
        options
        ||
        {};


      const difficulty =
        this.clamp(
          Number(
            config.difficulty
          )
          ||
          1,
          1,
          5
        );


      const seed =
        config.seed
        ||
        Date.now();


      const random =
        this.createRandom(
          seed
        );


      let builderName =
        this.buildersByConcept[
          conceptId
        ]
        ||
        this.fallbackBuilders[
          conceptId
        ]
        ||
        "buildParticipationScenario";


      const builder =
        this[
          builderName
        ];


      const scenario =
        builder.call(
          this,
          random,
          difficulty
        );


      scenario.id =
        "scenario_"
        +
        seed;


      scenario.seed =
        seed;


      scenario.requestedConceptId =
        conceptId;


      scenario.difficulty =
        difficulty;


      scenario.difficultyName =
        this.difficultyLevels[
          difficulty
        ].name;


      scenario.practiceType =
        "decision_practice";


      scenario.evidenceLimit =
        "This scenario measures decision practice only. It does not prove real gameplay mechanics or consistency.";


      return scenario;

    },


  /*
    ------------------------------------------------
    EVALUATION HELPERS
    ------------------------------------------------
  */


  getActor:
    function(
      scenario,
      id
    ) {

      return scenario.actors.find(
        function(actor) {

          return actor.id === id;

        }
      )
      ||
      null;

    },


  getActorsByType:
    function(
      scenario,
      type
    ) {

      return scenario.actors.filter(
        function(actor) {

          return actor.type === type;

        }
      );

    },


  /*
    Scores are abstract training dimensions.

    They do NOT represent MLBB statistics.
  */

  scoreCloseness:
    function(
      distance,
      ideal,
      tolerance
    ) {

      const difference =
        Math.abs(
          distance
          -
          ideal
        );


      const normalized =
        1
        -
        difference
        /
        tolerance;


      return this.clamp(
        normalized
        *
        100,
        0,
        100
      );

    },


  scoreMinimumDistance:
    function(
      distance,
      desired
    ) {

      return this.clamp(
        distance
        /
        desired
        *
        100,
        0,
        100
      );

    },


  scoreMaximumDistance:
    function(
      distance,
      desired
    ) {

      if (
        distance <= desired
      ) {

        return 100;

      }


      return this.clamp(
        100
        -
        (
          distance
          -
          desired
        )
        *
        4,
        0,
        100
      );

    },


  /*
    Escape-space proxy.

    Rewards avoiding extreme edges while
    retaining room to move.

    This is an abstract training heuristic.
  */

  scoreEscapeSpace:
    function(
      position
    ) {

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


      return this.clamp(
        edgeDistance
        /
        20
        *
        100,
        0,
        100
      );

    },


  /*
    Uncertainty safety proxy.

    When a threat is known to be missing from one side,
    reward avoiding the most obvious exposed flank.

    This does NOT assume the threat is actually there.
  */

  scoreUncertaintySafety:
    function(
      scenario,
      position
    ) {

      if (
        !scenario.hiddenThreatSide
      ) {

        return 100;

      }


      const centerDifference =
        position.x
        -
        50;


      if (
        scenario.hiddenThreatSide < 0
      ) {

        return this.clamp(
          60
          +
          centerDifference
          *
          2,
          0,
          100
        );

      }


      return this.clamp(
        60
        -
        centerDifference
        *
        2,
        0,
        100
      );

    },


  /*
    ------------------------------------------------
    POSITION EVALUATION
    ------------------------------------------------
  */


  evaluatePosition:
    function(
      scenario,
      position
    ) {

      const rafaela = {

        x:
          this.clamp(
            Number(
              position.x
            ),
            0,
            100
          ),

        y:
          this.clamp(
            Number(
              position.y
            ),
            0,
            100
          )

      };


      const priorityAlly =
        this.getActor(
          scenario,
          "priority_ally"
        );


      const frontline =
        this.getActor(
          scenario,
          "frontline"
        );


      const objective =
        this.getActor(
          scenario,
          "objective"
        );


      const threat =
        this.getActor(
          scenario,
          "primary_threat"
        )
        ||
        this.getActor(
          scenario,
          "visible_threat"
        );


      const dimensions = {};


      /*
        Participation:
        practical proximity to the active ally group.
      */

      if (
        priorityAlly
      ) {

        const distance =
          this.distance(
            rafaela,
            priorityAlly
          );


        dimensions.participation =
          this.scoreMaximumDistance(
            distance,
            30
          );


        dimensions.allyAccess =
          this.scoreCloseness(
            distance,
            20,
            24
          );

      }

      else {

        dimensions.participation =
          70;


        dimensions.allyAccess =
          70;

      }


      /*
        Threat safety:
        reward separation from visible primary threat.
      */

      if (
        threat
      ) {

        const distance =
          this.distance(
            rafaela,
            threat
          );


        dimensions.threatSafety =
          this.scoreMinimumDistance(
            distance,
            24
          );

      }

      else {

        dimensions.threatSafety =
          75;

      }


      /*
        Objective access.
      */

      if (
        objective
      ) {

        const distance =
          this.distance(
            rafaela,
            objective
          );


        dimensions.objectiveAccess =
          this.scoreMaximumDistance(
            distance,
            45
          );

      }

      else {

        dimensions.objectiveAccess =
          80;

      }


      /*
        Frontline separation:
        avoid occupying almost the exact
        same location as frontline.
      */

      if (
        frontline
      ) {

        const distance =
          this.distance(
            rafaela,
            frontline
          );


        dimensions.frontlineSeparation =
          this.scoreMinimumDistance(
            distance,
            11
          );

      }

      else {

        dimensions.frontlineSeparation =
          85;

      }


      dimensions.escapeSpace =
        this.scoreEscapeSpace(
          rafaela
        );


      dimensions.uncertaintySafety =
        this.scoreUncertaintySafety(
          scenario,
          rafaela
        );


      /*
        Weighted overall score.
      */

      const weights =
        scenario.focusWeights
        ||
        {};


      let totalWeight =
        0;


      let weightedScore =
        0;


      Object.keys(
        dimensions
      ).forEach(
        (key) => {

          const weight =
            Number(
              weights[
                key
              ]
            )
            ||
            0;


          if (
            weight > 0
          ) {

            totalWeight +=
              weight;


            weightedScore +=
              dimensions[
                key
              ]
              *
              weight;

          }

        }
      );


      const overall =
        totalWeight > 0
        ?
        weightedScore
        /
        totalWeight
        :
        0;


      /*
        Find strongest and weakest dimensions.
      */

      const activeDimensions =
        Object.keys(
          dimensions
        )
        .filter(
          (key) => {

            return (
              Number(
                weights[
                  key
                ]
              )
              >
              0
            );

          }
        )
        .map(
          (key) => {

            return {

              key:
                key,

              score:
                dimensions[
                  key
                ]

            };

          }
        );


      activeDimensions.sort(
        (a, b) => {

          return (
            a.score
            -
            b.score
          );

        }
      );


      const weakest =
        activeDimensions[
          0
        ]
        ||
        null;


      const strongest =
        activeDimensions[
          activeDimensions.length
          -
          1
        ]
        ||
        null;


      const feedback =
        this.buildPositionFeedback(
          scenario,
          dimensions,
          weakest,
          overall
        );


      return {

        scenarioId:
          scenario.id,

        conceptId:
          scenario.requestedConceptId,

        practiceType:
          "decision_practice",

        overall:
          Math.round(
            overall
          ),

        dimensions: {

          participation:
            Math.round(
              dimensions.participation
            ),

          allyAccess:
            Math.round(
              dimensions.allyAccess
            ),

          threatSafety:
            Math.round(
              dimensions.threatSafety
            ),

          objectiveAccess:
            Math.round(
              dimensions.objectiveAccess
            ),

          frontlineSeparation:
            Math.round(
              dimensions.frontlineSeparation
            ),

          escapeSpace:
            Math.round(
              dimensions.escapeSpace
            ),

          uncertaintySafety:
            Math.round(
              dimensions.uncertaintySafety
            )

        },

        weakest:
          weakest,

        strongest:
          strongest,

        successful:
          overall >= 75,

        feedback:
          feedback,

        limitation:
          scenario.evidenceLimit

      };

    },


  /*
    ------------------------------------------------
    FEEDBACK
    ------------------------------------------------
  */


  dimensionLabels: {

    participation:
      "Participation",

    allyAccess:
      "Ally Access",

    threatSafety:
      "Threat Safety",

    objectiveAccess:
      "Objective Access",

    frontlineSeparation:
      "Frontline Separation",

    escapeSpace:
      "Escape Space",

    uncertaintySafety:
      "Uncertainty Safety"

  },


  correctionLibrary: {

    participation: {

      action:
        "Move closer to the relevant play while preserving a safer angle.",

      reason:
        "Excessive safety can remove Rafaela from the action.",

      check:
        "If the play started now, could Rafaela contribute immediately?"
    },


    allyAccess: {

      action:
        "Improve your angle or distance to the ally who matters most to this play.",

      reason:
        "Support value depends on being able to influence the relevant ally.",

      check:
        "Can Rafaela support the priority ally without first making a major reposition?"
    },


    threatSafety: {

      action:
        "Create more separation or a less direct angle from the primary threat.",

      reason:
        "Rafaela loses repeated support value if she becomes an easy early target.",

      check:
        "Would the enemy need meaningful effort to reach Rafaela?"
    },


    objectiveAccess: {

      action:
        "Shift toward a position that preserves meaningful access to the objective area.",

      reason:
        "Being safe but disconnected from the team's objective reduces practical value.",

      check:
        "Can Rafaela participate if the objective contest begins now?"
    },


    frontlineSeparation: {

      action:
        "Support the frontline from different depth or angle instead of occupying the same danger zone.",

      reason:
        "Different heroes tolerate different amounts of exposure.",

      check:
        "Are you supporting the frontline, or simply copying its position?"
    },


    escapeSpace: {

      action:
        "Choose a position with a clearer next movement option.",

      reason:
        "A position becomes fragile when pressure removes every practical exit.",

      check:
        "If pressure arrives, where is Rafaela's next position?"
    },


    uncertaintySafety: {

      action:
        "Reduce exposure to the most obvious unseen collapse route without abandoning the play.",

      reason:
        "Missing information should change risk management without forcing total passivity.",

      check:
        "Are you respecting the unseen threat while still remaining useful?"
    }

  },


  buildPositionFeedback:
    function(
      scenario,
      dimensions,
      weakest,
      overall
    ) {

      if (
        !weakest
      ) {

        return {

          title:
            "Position Recorded",

          cue:
            scenario.instruction,

          action:
            "Reassess as the game state changes.",

          reason:
            "Positioning is dynamic rather than one permanent correct location.",

          exception:
            "A changing threat, ally, objective, or route can change the correct position.",

          resultCheck:
            "What changed after your action?"

        };

      }


      const correction =
        this.correctionLibrary[
          weakest.key
        ];


      let title;


      if (
        overall >= 90
      ) {

        title =
          "Strong Decision";

      }

      else if (
        overall >= 75
      ) {

        title =
          "Usable — Refine the Weakest Area";

      }

      else if (
        overall >= 55
      ) {

        title =
          "Developing Position";

      }

      else {

        title =
          "Major Reposition Needed";

      }


      return {

        title:
          title,

        cue:
          scenario.instruction,

        mainCorrection:
          this.dimensionLabels[
            weakest.key
          ],

        action:
          correction.action,

        reason:
          correction.reason,

        exception:
          "The priority may change when new information, resources, numbers, objectives, or threats change.",

        resultCheck:
          correction.check

      };

    },


  /*
    ------------------------------------------------
    ADAPTIVE DIFFICULTY
    ------------------------------------------------
  */


  chooseDifficulty:
    function(
      conceptId
    ) {

      if (
        !window.RafaelaStorage
      ) {

        return 1;

      }


      const state =
        window.RafaelaStorage
          .load();


      const record =
        state.concepts[
          conceptId
        ];


      if (!record) {

        return 1;

      }


      const successes =
        record.application.successful;


      const errors =
        record.application.unsuccessful;


      const evidence =
        record.gameplay.positiveEvidence;


      if (
        successes >= 8
        &&
        evidence >= 2
      ) {

        return 5;

      }


      if (
        successes >= 5
      ) {

        return 4;

      }


      if (
        successes >= 3
      ) {

        return 3;

      }


      if (
        successes >= 1
      ) {

        return 2;

      }


      if (
        errors >= 2
      ) {

        return 1;

      }


      return 1;

    },


  /*
    ------------------------------------------------
    TRAINER INTEGRATION
    ------------------------------------------------
  */


  generateAdaptiveScenario:
    function(
      conceptId
    ) {

      const difficulty =
        this.chooseDifficulty(
          conceptId
        );


      return this.generate(
        conceptId,
        {
          difficulty:
            difficulty
        }
      );

    },


  /*
    Ask trainer which concept should be practiced,
    then generate the scenario automatically.
  */

  generateNextTrainingScenario:
    function() {

      if (
        !window.RafaelaTrainer
      ) {

        return null;

      }


      const selection =
        window.RafaelaTrainer
          .chooseNextConcept();


      if (
        !selection
      ) {

        return null;

      }


      const concept =
        selection.concept;


      const scenario =
        this.generateAdaptiveScenario(
          concept.id
        );


      scenario.selection = {

        conceptName:
          concept.name,

        domainName:
          concept.domainName,

        priorityScore:
          selection.score,

        reasons:
          window.RafaelaTrainer
            .explainSelection(
              concept
            )

      };


      return scenario;

    },


  /*
    Development preview.
  */

  preview:
    function(
      conceptId
    ) {

      const scenario =
        conceptId
        ?
        this.generateAdaptiveScenario(
          conceptId
        )
        :
        this.generateNextTrainingScenario();


      console.log(
        "Rafaela Gym scenario:",
        scenario
      );


      return scenario;

    }

};
