// Story episodes, one per Trinoko short. Add a new object here for each new video.
//
// kind 'choice':  scenes play one by one, then the player makes the choice the video left open.
// kind 'buttons': mini-game, pick one of three buttons.
//
// Stage actors: 'hero', 'girl', 'rich', 'richBroke'; each with a mood:
// happy | sad | shock | smug | cry.  Props are emoji shown on the stage.

export const EPISODES = [
  {
    id: 'ep1',
    kind: 'choice',
    title: 'She Left Him',
    hook: 'She left him for a millionaire… then karma hit.',
    unlockTier: 0,
    rewardMinutes: 10,
    minReward: 300,
    scenes: [
      { actors: [['hero', 'happy'], ['girl', 'happy']], props: '🌹', caption: 'He gives her his only flower.' },
      { actors: [['hero', 'shock'], ['rich', 'smug'], ['girl', 'happy']], props: '🚗', caption: 'She leaves with a rich guy.' },
      { actors: [['hero', 'cry']], props: '🌧️', caption: 'Rain. Heartbreak.', rain: true },
      { actors: [['hero', 'smug']], props: '💰💰💰', caption: 'Years later… he is a MILLIONAIRE.', tierBoost: 4 },
      { actors: [['richBroke', 'sad']], props: '💨', caption: 'Her rich guy? Broke. KARMA.' },
      { actors: [['girl', 'sad'], ['hero', 'smug']], props: '🌹', caption: 'She comes back with his flower…', tierBoost: 4 },
    ],
    choice: {
      question: 'SHOULD HE FORGIVE HER?',
      a: { label: 'Forgive 💞', karma: 10, outcome: 'He took the flower back. Kind heart, +10 karma.' },
      b: { label: 'Walk away 😎', karma: -10, outcome: 'He drove off in a gold supercar. Cold boss, −10 karma.' },
    },
  },
  {
    id: 'ep2',
    kind: 'buttons',
    title: 'One Button, One Wish',
    hook: 'Three buttons. One changes everything.',
    unlockTier: 1,
    rewardMinutes: 15,
    minReward: 800,
    scenes: [
      { actors: [['hero', 'shock']], props: '🔴🟢🔵', caption: 'Three magic buttons appear.' },
      { actors: [['hero', 'happy']], props: '✨', caption: 'Only one press. Choose wisely.' },
    ],
    // weights for the hidden prizes behind the buttons
    prizes: [
      { label: 'A house for Mom 🏠', mult: 3, karma: 5 },
      { label: 'Bag of cash 💰', mult: 2, karma: 0 },
      { label: 'Old sock 🧦', mult: 0.5, karma: 0 },
    ],
  },
  {
    id: 'ep3',
    kind: 'soon',
    title: 'Save the Dog',
    hook: 'He saved a puppy. The puppy found treasure.',
    unlockTier: 2,
  },
  {
    id: 'ep4',
    kind: 'soon',
    title: 'Last 10 Seconds',
    hook: 'Find the key before time runs out.',
    unlockTier: 3,
  },
];
