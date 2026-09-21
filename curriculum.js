/*
  RAFAELA GYM
  Universal Support Doctrine — Curriculum Core

  This file contains the stable learning structure.

  Important:
  - Universal principles belong here.
  - Patch-specific Rafaela mechanics do NOT belong here.
  - Patch-sensitive content will live in a separate file later.
*/


window.RafaelaCurriculum = {

  version: "2.0.0",

  title: "Rafaela Universal Support Doctrine",

  description:
    "A fundamentals-based framework for learning Rafaela through practical judgment, execution, repetition, and adaptive review.",


  purpose: {
    primary:
      "Build practical Rafaela competence across changing allies, enemies, compositions, match phases, and normal game states.",

    principle:
      "Teach what to do, how, when, why, and in what priority.",

    limitation:
      "Universal applicability does not imply equal effectiveness or guaranteed wins."
  },


  decisionLoop: [
    "observe",
    "assess",
    "prioritize",
    "position",
    "act",
    "verify",
    "reassess"
  ],


  sessionFlow: [
    "retrieve",
    "learn",
    "examine",
    "apply",
    "capture"
  ],


  masteryStages: [
    {
      id: "recognition",
      name: "Recognition",
      description:
        "Can recognize the principle when prompted."
    },

    {
      id: "explanation",
      name: "Explanation",
      description:
        "Can explain what the principle means and why it matters."
    },

    {
      id: "scenario_application",
      name: "Unfamiliar Scenario Application",
      description:
        "Can apply the principle correctly in a new decision-practice scenario."
    },

    {
      id: "gameplay_evidence",
      name: "Gameplay Evidence",
      description:
        "Has demonstrated the behavior in real gameplay evidence such as replay or screenshot review."
    },

    {
      id: "consistency",
      name: "Consistency",
      description:
        "Demonstrates the behavior reliably across varied situations."
    }
  ],


  layers: [

    {
      id: "universal_fundamentals",
      name: "Universal Fundamentals",
      stable: true,
      description:
        "Information, uncertainty, positioning, spacing, threats, timing, resources, numbers, tempo, and objectives."
    },

    {
      id: "support_principles",
      name: "Support Principles",
      stable: true,
      description:
        "Enable allies, advance win conditions, create opportunities, and balance protection with aggression."
    },

    {
      id: "rafaela_execution",
      name: "Textbook Rafaela Execution",
      stable: false,
      description:
        "Technically sound, context-aware Rafaela movement, abilities, targeting, and interactions."
    },

    {
      id: "replaceable_implementation",
      name: "Replaceable Implementation",
      stable: false,
      description:
        "Patch-sensitive skills, passive, items, emblems, spells, roaming systems, and map mechanics."
    }

  ],


  domains: [

    {
      id: "team_goal",
      name: "Victory Conditions and Team Goal",
      category: "fundamental",

      concepts: [
        {
          id: "team_goal_01",
          name: "Team Goal Before Hero Action",
          importance: 100,
          prerequisites: [],

          principle:
            "Rafaela's actions should serve the team's achievable win condition rather than exist as isolated support actions.",

          cue:
            "Before choosing what Rafaela should do, identify what the team is currently trying to accomplish.",

          action:
            "Connect Rafaela's next action to the highest-priority achievable team outcome.",

          reason:
            "Healing, movement, damage, control, and protection only matter when they advance a useful team outcome.",

          exception:
            "Immediate survival or emergency disengagement can temporarily override the current proactive objective.",

          resultCheck:
            "Did Rafaela's action make the team's current objective more achievable?"
        },

        {
          id: "team_goal_02",
          name: "Achievable Outcome",
          importance: 95,
          prerequisites: [
            "team_goal_01"
          ],

          principle:
            "Choose an outcome the team can realistically achieve with the information, numbers, resources, and positioning available.",

          cue:
            "Compare desired outcome with current capability.",

          action:
            "Reduce, delay, or change the objective when the preferred outcome is not realistically achievable.",

          reason:
            "Correct priorities must account for present constraints.",

          exception:
            "Calculated high-risk plays may still be justified when lower-risk alternatives are worse.",

          resultCheck:
            "Was the chosen goal realistic given what was known at the time?"
        }
      ]
    },


    {
      id: "information",
      name: "Information and Uncertainty",
      category: "fundamental",

      concepts: [
        {
          id: "information_01",
          name: "Facts, Inferences, and Unknowns",
          importance: 100,
          prerequisites: [],

          principle:
            "Separate what is known from what is inferred and what remains unknown.",

          cue:
            "Before committing, identify visible information and missing information.",

          action:
            "Base the decision on confirmed facts while accounting for plausible threats created by uncertainty.",

          reason:
            "Treating assumptions as facts causes avoidable positioning and rotation errors.",

          exception:
            "Time pressure may require acting before uncertainty is resolved.",

          resultCheck:
            "Which parts of the decision were facts, inferences, and unknowns?"
        },

        {
          id: "information_02",
          name: "Missing Enemy Threat",
          importance: 98,
          prerequisites: [
            "information_01"
          ],

          principle:
            "An unseen relevant enemy changes safe positioning even when their exact location is unknown.",

          cue:
            "A dangerous enemy capable of reaching Rafaela or an ally is missing.",

          action:
            "Preserve useful participation while denying obvious flank or collapse angles.",

          reason:
            "Uncertainty should change risk management without forcing total inactivity.",

          exception:
            "Confirmed information may temporarily reduce the relevance of the missing threat.",

          resultCheck:
            "Did Rafaela remain useful without exposing the team to the most plausible unseen threat?"
        }
      ]
    },


    {
      id: "positioning",
      name: "Positioning and Spacing",
      category: "fundamental",

      concepts: [
        {
          id: "positioning_01",
          name: "Useful Participation Distance",
          importance: 100,
          prerequisites: [
            "team_goal_01"
          ],

          principle:
            "Rafaela should remain close enough to influence the relevant play without becoming unnecessarily exposed.",

          cue:
            "Check whether Rafaela can contribute if action begins immediately.",

          action:
            "Move to the nearest position that preserves useful participation and acceptable safety.",

          reason:
            "Excessive distance loses influence; excessive closeness increases exposure.",

          exception:
            "Temporary separation may be necessary for scouting, retreat, reset, or pathing.",

          resultCheck:
            "Could Rafaela meaningfully participate when the play began?"
        },

        {
          id: "positioning_02",
          name: "Do Not Copy the Frontline",
          importance: 92,
          prerequisites: [
            "positioning_01"
          ],

          principle:
            "Supporting an advancing frontline does not require standing in the same danger zone.",

          cue:
            "A durable ally moves forward into threat range.",

          action:
            "Maintain support access from a safer angle or depth.",

          reason:
            "Different heroes tolerate different levels of exposure.",

          exception:
            "Short deliberate forward movement may be justified to complete an important action.",

          resultCheck:
            "Did Rafaela preserve contribution without inheriting unnecessary frontline risk?"
        },

        {
          id: "positioning_03",
          name: "Escape Space",
          importance: 90,
          prerequisites: [
            "positioning_01"
          ],

          principle:
            "A good support position includes a realistic route for repositioning or disengagement.",

          cue:
            "Before settling into a position, inspect available movement routes.",

          action:
            "Prefer positions that preserve at least one practical response to pressure.",

          reason:
            "A position can appear safe until enemy pressure removes all exits.",

          exception:
            "A decisive commitment may intentionally sacrifice escape space.",

          resultCheck:
            "If pressure arrived, was there a realistic next position?"
        }
      ]
    },


    {
      id: "threats",
      name: "Threat Recognition and Management",
      category: "fundamental",

      concepts: [
        {
          id: "threats_01",
          name: "Primary Relevant Threat",
          importance: 100,
          prerequisites: [
            "information_01"
          ],

          principle:
            "Prioritize threats by their ability to meaningfully disrupt the current team objective.",

          cue:
            "Multiple enemies are present or potentially relevant.",

          action:
            "Identify which enemy creates the greatest immediate danger to the current plan.",

          reason:
            "Not every visible enemy deserves equal attention.",

          exception:
            "Threat priority changes when positioning, cooldowns, numbers, or objectives change.",

          resultCheck:
            "Was attention focused on the enemy most capable of disrupting the play?"
        },

        {
          id: "threats_02",
          name: "Threat Reach",
          importance: 95,
          prerequisites: [
            "threats_01",
            "positioning_01"
          ],

          principle:
            "Position relative to what the threat can realistically reach, not merely where the threat currently stands.",

          cue:
            "An enemy has movement, control, range, or an approach route toward Rafaela or an ally.",

          action:
            "Adjust spacing and angle before the threat obtains an easy initiation.",

          reason:
            "Reactive movement may be too late once the threat has already entered effective reach.",

          exception:
            "Known unavailable resources can temporarily reduce threat reach.",

          resultCheck:
            "Did positioning account for the threat's plausible next action?"
        }
      ]
    },


    {
      id: "support",
      name: "Support Priorities",
      category: "support",

      concepts: [
        {
          id: "support_01",
          name: "Enable the Relevant Ally",
          importance: 96,
          prerequisites: [
            "team_goal_01"
          ],

          principle:
            "Support the ally whose contribution best advances the current team objective, not automatically one fixed role.",

          cue:
            "Multiple allies could receive Rafaela's attention.",

          action:
            "Prioritize the ally whose survival, position, damage, control, or tempo matters most to the current play.",

          reason:
            "Support priority should follow the situation rather than a permanent hero-role rule.",

          exception:
            "Emergency protection can temporarily override normal priority.",

          resultCheck:
            "Did Rafaela's attention go to the ally most relevant to the current objective?"
        },

        {
          id: "support_02",
          name: "Protection Versus Aggression",
          importance: 93,
          prerequisites: [
            "support_01",
            "threats_01"
          ],

          principle:
            "Balance protecting allies with creating or extending useful opportunities.",

          cue:
            "Rafaela can either reinforce safety or contribute to forward pressure.",

          action:
            "Choose the action that creates the highest-value achievable outcome with acceptable risk.",

          reason:
            "Pure passivity loses opportunities; uncontrolled aggression abandons support responsibilities.",

          exception:
            "Extreme danger or decisive opportunity may heavily favor one side of the balance.",

          resultCheck:
            "Was the chosen level of aggression appropriate for the threat and opportunity?"
        }
      ]
    },


    {
      id: "tempo",
      name: "Tempo, Rotations, and Resets",
      category: "macro",

      concepts: [
        {
          id: "tempo_01",
          name: "Move With Purpose",
          importance: 88,
          prerequisites: [
            "team_goal_01",
            "information_01"
          ],

          principle:
            "A rotation should have a clear expected benefit relative to its cost and timing.",

          cue:
            "Rafaela is considering leaving the current area.",

          action:
            "Identify what the rotation enables before committing to it.",

          reason:
            "Movement consumes time and can temporarily reduce support elsewhere.",

          exception:
            "Emergency responses may require immediate movement before full evaluation.",

          resultCheck:
            "Did the rotation create enough value to justify the time and lost presence?"
        },

        {
          id: "tempo_02",
          name: "Reset Timing",
          importance: 86,
          prerequisites: [
            "tempo_01"
          ],

          principle:
            "Reset when the future value of restoring resources and synchronizing timing exceeds the value of staying.",

          cue:
            "Resources are reduced or the next important event is approaching.",

          action:
            "Compare staying value against the benefit of returning prepared.",

          reason:
            "Remaining on the map with poor resources can weaken the next important play.",

          exception:
            "Immediate pressure or a decisive opportunity may justify delaying the reset.",

          resultCheck:
            "Did the reset improve readiness for the next meaningful event?"
        }
      ]
    },


    {
      id: "objectives",
      name: "Objectives and Map Control",
      category: "macro",

      concepts: [
        {
          id: "objectives_01",
          name: "Prepare Before the Objective",
          importance: 95,
          prerequisites: [
            "tempo_01",
            "information_01",
            "positioning_01"
          ],

          principle:
            "Objective success often depends on preparation before direct contest begins.",

          cue:
            "A meaningful objective is approaching.",

          action:
            "Coordinate position, information, resources, routes, and ally readiness before the contest.",

          reason:
            "Late arrival forces worse decisions under pressure.",

          exception:
            "Unexpected events may require abandoning or delaying preparation.",

          resultCheck:
            "Did Rafaela arrive prepared rather than merely arrive?"
        }
      ]
    },


    {
      id: "teamfights",
      name: "Teamfights",
      category: "application",

      concepts: [
        {
          id: "teamfights_01",
          name: "Fight Participation Without Free Exposure",
          importance: 98,
          prerequisites: [
            "positioning_01",
            "threats_01",
            "support_01"
          ],

          principle:
            "Participate continuously while making enemies spend meaningful effort to reach Rafaela.",

          cue:
            "A teamfight begins or becomes likely.",

          action:
            "Maintain access to relevant allies and targets while adjusting away from the highest-value enemy reach.",

          reason:
            "Rafaela provides more total value when she survives long enough to contribute repeatedly.",

          exception:
            "A decisive action may justify accepting greater exposure.",

          resultCheck:
            "Did Rafaela remain useful throughout the fight instead of becoming an easy early target?"
        }
      ]
    },


    {
      id: "self_management",
      name: "Attention and Emotional Control",
      category: "performance",

      concepts: [
        {
          id: "self_01",
          name: "Next Decision Over Previous Error",
          importance: 80,
          prerequisites: [],

          principle:
            "After an error, attention should return to the next controllable decision.",

          cue:
            "A mistake, missed ability, ally death, or failed play occurs.",

          action:
            "Extract the immediate useful lesson and redirect attention to the current state.",

          reason:
            "Rumination consumes attention needed for subsequent decisions.",

          exception:
            "Deeper analysis belongs in replay review after the match.",

          resultCheck:
            "Did the previous mistake impair the next decision?"
        }
      ]
    }

  ],


  reviewRules: {

    weakConceptPriority:
      "Concepts with repeated errors return sooner.",

    strongConceptPriority:
      "Concepts demonstrated correctly across varied situations return later.",

    masteryRule:
      "One correct answer or one successful scenario does not establish mastery.",

    applicationRule:
      "Decision-practice scenarios measure decision application, not proven mechanical gameplay skill.",

    gameplayEvidenceRule:
      "Gameplay execution requires real evidence such as replay, screenshot sequence, or direct user report.",

    outcomeRule:
      "Judge decisions using information available at the time rather than only the final result."
  },


  teachingRules: {

    principleFormat: [
      "cue",
      "action",
      "reason",
      "exception",
      "resultCheck"
    ],

    feedbackPriority:
      "Give the most useful correction first.",

    scenarioRule:
      "Use competing priorities and credible tradeoffs rather than artificial trick questions.",

    interactionRule:
      "Prefer concrete actions and practical drills when application can be trained directly.",

    rigidityRule:
      "Avoid universal commands such as always follow one role, always initiate, always stay behind, or always save an ability."
  },


  accuracyRules: {

    stableCore:
      "Universal fundamentals and support principles should remain separate from patch-sensitive implementation.",

    patchSensitive:
      "Rafaela skills, passive, items, emblems, spells, roaming systems, and map-specific mechanics must be rechecked after relevant updates.",

    uncertainty:
      "Do not invent missing ranges, cooldowns, timings, thresholds, optimal builds, or win rates.",

    historical:
      "Historical scenarios must use mechanics appropriate to the referenced patch when known."
  }

};


/*
  Helper: return every concept in one flat list.
*/

window.RafaelaCurriculum.getAllConcepts =
  function() {

    const concepts = [];

    this.domains.forEach(
      function(domain) {

        domain.concepts.forEach(
          function(concept) {

            concepts.push({
              ...concept,
              domainId: domain.id,
              domainName: domain.name,
              category: domain.category
            });

          }
        );

      }
    );

    return concepts;
  };


/*
  Helper: find one concept by ID.
*/

window.RafaelaCurriculum.getConceptById =
  function(conceptId) {

    return this
      .getAllConcepts()
      .find(
        function(concept) {

          return concept.id === conceptId;

        }
      )
      || null;
  };


/*
  Helper: determine whether prerequisites are satisfied.

  masteredConceptIds should contain concept IDs already
  sufficiently learned for the current training stage.
*/

window.RafaelaCurriculum.prerequisitesMet =
  function(
    concept,
    masteredConceptIds
  ) {

    return concept.prerequisites.every(
      function(prerequisiteId) {

        return masteredConceptIds.includes(
          prerequisiteId
        );

      }
    );
  };
