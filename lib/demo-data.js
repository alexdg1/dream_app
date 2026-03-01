export const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'archive', label: 'Archive' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'share', label: 'Share' },
];

export const modeCards = [
  {
    id: 'symbolic',
    label: 'Symbolic',
    title: 'White tigers at the Malta house',
    body: 'For numinous imagery, anomalous affect, and endings that feel unresolved rather than chaotic.',
  },
  {
    id: 'grounded',
    label: 'Grounded',
    title: 'Oxford tube, lost bag, breakup anxiety',
    body: 'For continuity dreams where emotional pressure converts into logistical disorientation.',
  },
  {
    id: 'support',
    label: 'Support-first',
    title: 'Laser quest, guilt, heart sacrifice',
    body: 'For dreams that still feel physically activating after waking and need containment before interpretation.',
  },
];

export const modeTemplates = {
  symbolic: {
    title: 'White tigers at the Malta house',
    narrative:
      'In the house in Malta with dad but it is even grander, two white tigers as pets. They come towards us and I stand on a bench and consider kicking them away but realise they will just bite me. So instead take a hand up to the higher roof. Unfazed that there are two white tigers at all.',
    prevailingEmotion: 'Calm alertness with restrained awe',
    ending: 'I reached the higher roof while the tigers remained below.',
    endingResolution: 'Contained but unresolved',
    knownPersonName: 'Dad',
    knownPersonRelationship: 'father',
    knownPersonAssociations: 'authority, structure, family setting',
    knownPersonAsPart: 'the part of me linked to inherited order and familial witness',
    reading:
      'The dream is less about panic than relationship to instinctive power. The strange feature is the composed reaction, not just the danger.',
    integration:
      'Notice where you are handling intensity by moving to a temporary vantage rather than entering a fuller relation with it.',
  },
  grounded: {
    title: 'Oxford tube, lost bag, breakup anxiety',
    narrative:
      'Gone up to Oxford. Cat puts her arm round my shoulders overly familiar. It feels like Joe is around and I cannot relax. It is 6pm and I need the Oxford tube. I realise I have left my bag with everything somewhere and start anxiously walking into town through busy crowds.',
    prevailingEmotion: 'Alienated, rushed, and increasingly distraught',
    ending: 'Still searching through the crowds with little chance of finding the bag.',
    endingResolution: 'Unresolved and escalating',
    knownPersonName: 'Cat',
    knownPersonRelationship: 'ex-partner',
    knownPersonAssociations: 'safety, emotional authority, familiarity, judgment',
    knownPersonAsPart: 'the part of me that seeks home and feels scrutinized at the same time',
    reading:
      'The dream turns relational destabilization into a practical scramble. The bag is likely the form the stress takes, not a hidden symbol first.',
    integration:
      'Name one current situation where emotional strain is making you less organized than usual, then simplify it before it compounds.',
  },
  support: {
    title: 'Laser quest and impossible heart choice',
    narrative:
      'Playing laser quest with real bullets. I shoot Anna several times and realise she might die. Surgeons say they may need my heart or my cat Bella’s heart, then realise it would have to be Billy’s. There is shame, grief, and helplessness.',
    prevailingEmotion: 'Shame, grief, helplessness',
    ending: 'Loss without repair',
    endingResolution: 'Uncontained distress',
    knownPersonName: 'Anna',
    knownPersonRelationship: 'friend / known figure',
    knownPersonAssociations: 'competition, consequence, vulnerability',
    knownPersonAsPart: 'the part of me wounded by reckless action and impossible repair',
    reading:
      'Delay interpretation. The body is still carrying the dream as crisis material.',
    integration:
      'Orient to the room first. Save only the strongest image, prevailing emotion, and ending state for later revisiting.',
  },
};

export const onboardingSteps = [
  {
    id: 'intro',
    title: 'This is not a dream dictionary.',
    body: 'The app listens before it interprets. It starts with prevailing emotion, ending state, dream type, and the role of known figures rather than fixed symbol meanings.',
  },
  {
    id: 'privacy',
    title: 'Dreams stay private by default.',
    body: 'Nothing is social by default. Selected dreams can be bundled for therapist work, but the archive remains user-controlled.',
  },
  {
    id: 'routing',
    title: 'Different dreams need different handling.',
    body: 'Some dreams want symbolic depth, some want grounded continuity, and some want containment before reflection. Known people are first explored as inner figures, not literalized immediately.',
  },
];
