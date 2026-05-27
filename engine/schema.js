import { detectMeta } from './db_by_colour.js';

export const SCHEMA = {
  Mob: {
    required: ['id', 'color'],
    defaults: { 
      name: '', level: 1, hp: 50, atk: 5, def: 0, atkSpeed: 1.0, tier: 'normal', isBoss: false,
      animations: ['static', 'walk', 'attack'] // auto cek file ini
    },
    required: ['id', 'color'],
    defaults: { name: '', level: 1, hp: 50, atk: 5, def: 0, atkSpeed: 1.0, tier: 'normal', isBoss: false },
    types: { hp: 'number', atk: 'number', tier: ['easy','normal','hard','boss'] },
    fromColor: true
  },
  Item: {
    required: ['id', 'color'],
    defaults: { name: '', subtype: 'consumable', heal: 0, atk: 0 },
    types: { heal: 'number', atk: 'number' },
    fromColor: true
  },
  Prop: {
    required: ['id', 'color'],
    defaults: { name: '', solid: false, subtype: 'terrain' },
    types: { solid: 'boolean' },
    fromColor: true
  },
  Warper: {
    required: ['id', 'color', 'target'],
    defaults: { target: { map: 'world_01', x: 0, y: 0 } },
    fromColor: true
  },
  Map: {
    required: ['id', 'width', 'height'],
    defaults: { name: '', objects: [], instance: false },
    types: { width: 'number', height: 'number', instance: 'boolean' }
  },
  Soul: {
    required: ['id', 'color'],
    defaults: { name: '', power: 10 },
    fromColor: true
  },
  Recipe: {
    required: ['id', 'cost', 'result'],
    defaults: { name: '', color: '#ffa500' }
  }
};

export const REGISTRY = {};

export function validateAndFill(type, rawData) {
  const sch = SCHEMA[type];
  if (!sch) throw new Error(`Unknown type: ${type}`);
  
  let data = {...rawData};
  
  if (sch.fromColor) {
    const meta = detectMeta(data.id, data.color);
    data = {...meta,...data};
    delete data.folder;
  }
  
  for (const [key, val] of Object.entries(sch.defaults)) {
    if (data[key] === undefined) data[key] = val;
  }
  
  for (const field of sch.required) {
    if (data[field] === undefined) throw new Error(`${type} ${data.id} missing ${field}`);
  }
  
  if (sch.types) {
    for (const [field, typeCheck] of Object.entries(sch.types)) {
      if (data[field] === undefined) continue;
      if (Array.isArray(typeCheck)) {
        if (!typeCheck.includes(data[field])) throw new Error(`${type} ${data.id} ${field} must be one of ${typeCheck}`);
      } else if (typeof data[field]!== typeCheck) {
        throw new Error(`${type} ${data.id} ${field} must be ${typeCheck}`);
      }
    }
  }
  
  return data;
}

export function register(type, id, data) {
  if (!REGISTRY[type]) REGISTRY[type] = {};
  REGISTRY[type][id] = validateAndFill(type, data);
}
