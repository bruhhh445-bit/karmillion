// Real estate (rent income) and luxury (fame = income bonus): cars, boats, aircraft, bling.
import { carSVG } from './art/cars.js';
import { boatSVG, airSVG, blingSVG } from './art/boats.js';
import { homeSVG } from './art/homes.js';

// Property: can own several units of each; every unit costs more.
export const PROPERTIES = [
  { id: 'garage',    name: 'Garage',         cost: 2500,   rent: 4 },
  { id: 'studio',    name: 'Studio Flat',    cost: 3e4,    rent: 40 },
  { id: 'house',     name: 'Family House',   cost: 3.5e5,  rent: 400 },
  { id: 'villa',     name: 'Beach Villa',    cost: 4.5e6,  rent: 4500 },
  { id: 'penthouse', name: 'Sky Penthouse',  cost: 6e7,    rent: 52000 },
  { id: 'mansion',   name: 'Mega Mansion',   cost: 8e8,    rent: 6e5 },
  { id: 'palace',    name: 'Golden Palace',  cost: 1.2e10, rent: 8e6 },
];
export const PROP_GROWTH = 1.12;
export const PROP_MAX = 10;
export const PROP_SELL = 0.7;
export const propCost = (p, owned) => Math.ceil(p.cost * Math.pow(PROP_GROWTH, owned));
export const propArt = (id) => homeSVG(id);

// Luxury: one of each. Fame points add +1% income each.
export const LUXURY = [
  // cars
  { id: 'bike',      kind: 'car',  name: 'Rusty Bike',      cost: 300,    fame: 2,   art: { type: 'bike', color: '#e8345a' } },
  { id: 'scooter',   kind: 'car',  name: 'Scooter',         cost: 3000,   fame: 4,   art: { type: 'scooter', color: '#36c25a' } },
  { id: 'hatch',     kind: 'car',  name: 'Old Hatchback',   cost: 1.5e4,  fame: 6,   art: { type: 'hatch', color: '#3d7be0' } },
  { id: 'sedan',     kind: 'car',  name: 'Family Sedan',    cost: 6e4,    fame: 8,   art: { type: 'sedan', color: '#9a98aa' } },
  { id: 'muscle',    kind: 'car',  name: 'Muscle Car',      cost: 2.5e5,  fame: 12,  art: { type: 'muscle', color: '#ff8a1f', accent: '#1a1030' } },
  { id: 'sports',    kind: 'car',  name: 'Red Sports Car',  cost: 9e5,    fame: 16,  art: { type: 'sports', color: '#e8345a' } },
  { id: 'suv',       kind: 'car',  name: 'Luxury SUV',      cost: 3e6,    fame: 20,  art: { type: 'suv', color: '#2c2a3a' } },
  { id: 'super',     kind: 'car',  name: 'Supercar',        cost: 1.2e7,  fame: 28,  art: { type: 'super', color: '#ffb000' } },
  { id: 'limo',      kind: 'car',  name: 'Stretch Limo',    cost: 4e7,    fame: 32,  art: { type: 'limo', color: '#f4f3fa' } },
  { id: 'gold',      kind: 'car',  name: 'Gold Supercar',   cost: 1.5e8,  fame: 45,  art: { type: 'super', gold: true } },
  { id: 'hyper',     kind: 'car',  name: 'Hypercar',        cost: 6e8,    fame: 60,  art: { type: 'hyper', color: '#7a3cff' } },
  { id: 'rocketcar', kind: 'car',  name: 'Rocket Car',      cost: 5e9,    fame: 100, art: { type: 'hyper', color: '#00c2ff', flame: true } },
  // boats
  { id: 'jetski',    kind: 'boat', name: 'Jet Ski',         cost: 5e4,    fame: 5,   art: { type: 'jetski', stripe: '#e8345a' } },
  { id: 'speedboat', kind: 'boat', name: 'Speedboat',       cost: 8e5,    fame: 12,  art: { type: 'speedboat', stripe: '#e8345a' } },
  { id: 'sailboat',  kind: 'boat', name: 'Sailing Yacht',   cost: 4e6,    fame: 18,  art: { type: 'sailboat', stripe: '#3d7be0' } },
  { id: 'yacht',     kind: 'boat', name: 'Yacht',           cost: 5e7,    fame: 30,  art: { type: 'yacht', stripe: '#3d7be0' } },
  { id: 'megayacht', kind: 'boat', name: 'Mega Yacht',      cost: 6e8,    fame: 50,  art: { type: 'mega', stripe: '#ffc928' } },
  { id: 'gigayacht', kind: 'boat', name: 'Giga Yacht',      cost: 1e10,   fame: 90,  art: { type: 'giga' } },
  // aircraft
  { id: 'heli',      kind: 'air',  name: 'Helicopter',      cost: 3e8,    fame: 40,  art: { type: 'heli', color: '#f4f3fa', stripe: '#e8345a' } },
  { id: 'jet',       kind: 'air',  name: 'Private Jet',     cost: 2e9,    fame: 70,  art: { type: 'jet', stripe: '#4321a8' } },
  { id: 'jumbo',     kind: 'air',  name: 'Personal Jumbo',  cost: 2e10,   fame: 110, art: { type: 'jumbo', stripe: '#ffc928' } },
  { id: 'ship',      kind: 'air',  name: 'Spaceship',       cost: 2e11,   fame: 200, art: { type: 'ship', stripe: '#e8345a' } },
  // bling
  { id: 'watch',     kind: 'bling', name: 'Gold Watch',     cost: 2e4,    fame: 5,   art: 'watch' },
  { id: 'chain',     kind: 'bling', name: 'Gold Chain',     cost: 2.5e5,  fame: 10,  art: 'chain' },
  { id: 'ring',      kind: 'bling', name: 'Diamond Ring',   cost: 5e6,    fame: 15,  art: 'ring' },
  { id: 'statue',    kind: 'bling', name: 'Golden Statue',  cost: 1e9,    fame: 50,  art: 'statue' },
];
export const LUX_SELL = 0.5;
export const LUX_KINDS = [['car', 'Cars'], ['boat', 'Boats'], ['air', 'Air'], ['bling', 'Bling']];

export function luxArt(l, bare = false) {
  if (l.kind === 'car') return carSVG(l.art);
  if (l.kind === 'boat') return boatSVG(l.art, bare);
  if (l.kind === 'air') return airSVG(l.art);
  return blingSVG(l.art);
}

// What the stage shows.
export function homeOf(s) {
  let best = null;
  for (const p of PROPERTIES) if ((s.props?.[p.id] || 0) > 0) best = p;
  return best;
}
const bestOf = (s, kind) => {
  let best = null;
  for (const l of LUXURY) if (l.kind === kind && s.lux?.includes(l.id)) best = l;
  return best;
};
export function carOf(s) {
  const chosen = LUXURY.find((l) => l.id === s.ride && s.lux?.includes(l.id));
  return chosen || bestOf(s, 'car');
}
export const boatOf = (s) => bestOf(s, 'boat');
export const airOf = (s) => bestOf(s, 'air');
