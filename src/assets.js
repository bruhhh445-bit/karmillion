// Real estate (rent income) and luxury items (fame = income bonus).

// Property: can own several units of each; every unit costs more.
export const PROPERTIES = [
  { id: 'garage',    name: 'Garage',          icon: '🛖', cost: 2500,  rent: 4 },
  { id: 'studio',    name: 'Studio Flat',     icon: '🏢', cost: 3e4,   rent: 40 },
  { id: 'house',     name: 'Family House',    icon: '🏠', cost: 3.5e5, rent: 400 },
  { id: 'villa',     name: 'Beach Villa',     icon: '🏡', cost: 4.5e6, rent: 4500 },
  { id: 'penthouse', name: 'Sky Penthouse',   icon: '🌆', cost: 6e7,   rent: 52000 },
  { id: 'mansion',   name: 'Mega Mansion',    icon: '🏰', cost: 8e8,   rent: 6e5 },
  { id: 'palace',    name: 'Golden Palace',   icon: '🕌', cost: 1.2e10, rent: 8e6 },
];
export const PROP_GROWTH = 1.12;
export const PROP_MAX = 10;
export const PROP_SELL = 0.7;   // you get 70% of the price back

export const propCost = (p, owned) => Math.ceil(p.cost * Math.pow(PROP_GROWTH, owned));

// Luxury: one of each. Fame points add +1% income each.
export const LUXURY = [
  { id: 'bike',      kind: 'car',   name: 'Rusty Bike',      icon: '🚲', cost: 300,    fame: 2 },
  { id: 'scooter',   kind: 'car',   name: 'Scooter',         icon: '🛵', cost: 3000,   fame: 4 },
  { id: 'watch',     kind: 'bling', name: 'Fancy Watch',     icon: '⌚', cost: 2e4,    fame: 5 },
  { id: 'sedan',     kind: 'car',   name: 'Used Sedan',      icon: '🚗', cost: 4e4,    fame: 8 },
  { id: 'chain',     kind: 'bling', name: 'Gold Chain',      icon: '📿', cost: 2.5e5,  fame: 10 },
  { id: 'sports',    kind: 'car',   name: 'Red Sports Car',  icon: '🏎️', cost: 8e5,    fame: 15 },
  { id: 'ring',      kind: 'bling', name: 'Diamond Ring',    icon: '💍', cost: 5e6,    fame: 15 },
  { id: 'supercar',  kind: 'car',   name: 'Gold Supercar',   icon: '🏎️', cost: 1.5e7,  fame: 30, gold: true },
  { id: 'yacht',     kind: 'toy',   name: 'Mega Yacht',      icon: '🛥️', cost: 8e7,    fame: 30 },
  { id: 'heli',      kind: 'toy',   name: 'Helicopter',      icon: '🚁', cost: 3e8,    fame: 40 },
  { id: 'jet',       kind: 'toy',   name: 'Private Jet',     icon: '🛩️', cost: 1.5e9,  fame: 60 },
  { id: 'rocketcar', kind: 'car',   name: 'Rocket Car',      icon: '🚀', cost: 2e10,   fame: 100 },
];
export const LUX_SELL = 0.5;

// What the stage shows behind and next to the hero.
export function homeOf(s) {
  let best = null;
  for (const p of PROPERTIES) if ((s.props?.[p.id] || 0) > 0) best = p;
  return best;
}
export function carOf(s) {
  let best = null;
  for (const l of LUXURY) if (l.kind === 'car' && s.lux?.includes(l.id)) best = l;
  return best;
}
