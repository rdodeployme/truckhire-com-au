/* TruckRentals.com.au — prototype data
   Everything marked SAMPLE is demo content for the prototype, not real listings.
   Fees, cover tiers and age rules are PROPOSED and need sign-off before launch. */

const TH_CONFIG = {
  serviceFeePct: 0.10,          // PROPOSED renter service fee
  ownerCommissionPct: 0.12,     // PROPOSED owner commission
  gstPct: 0.10,
  minAge: { C: 21, LR: 21, MR: 25, HR: 25, HC: 25, MC: 25 }, // PROPOSED
  minYearsHeld: { C: 1, LR: 1, MR: 2, HR: 2, HC: 2, MC: 2 },    // PROPOSED (full licence years)
  cover: [
    { id: 'basic',    name: 'Basic',    perDay: 0,  excess: 5000, note: 'Included with every rental' },
    { id: 'standard', name: 'Standard', perDay: 29, excess: 2000, note: 'Most popular' },
    { id: 'premium',  name: 'Premium',  perDay: 49, excess: 500,  note: 'Lowest excess' }
  ],
  extras: [
    { id: 'trolley', name: 'Hand trolley',            price: 15, per: 'rental' },
    { id: 'straps',  name: 'Ratchet straps (×6)',     price: 12, per: 'rental' },
    { id: 'blankets',name: 'Furniture blankets (×10)',price: 20, per: 'rental' },
    { id: 'driver2', name: 'Additional driver',       price: 15, per: 'day' }
  ]
};

/* Australian heavy vehicle licence classes (rigid + combination). */
const TH_LICENCES = [
  { code: 'C',  rank: 1, name: 'Car (C)',             gvm: 'Up to 4.5 t GVM',            plain: 'Your normal car licence. Utes, vans and small trucks up to 4.5 tonnes GVM.', can: ['ute','van','box-small','tray-small'] },
  { code: 'LR', rank: 2, name: 'Light Rigid (LR)',    gvm: 'Over 4.5 t, up to 8 t GVM',  plain: 'Bigger pantechs, small tippers and trays between 4.5 and 8 tonnes GVM.',     can: [] },
  { code: 'MR', rank: 3, name: 'Medium Rigid (MR)',   gvm: 'Over 8 t GVM, 2 axles',      plain: 'Two-axle rigid trucks over 8 tonnes — typical 10–14 tonne trucks.',          can: [] },
  { code: 'HR', rank: 4, name: 'Heavy Rigid (HR)',    gvm: 'Over 8 t GVM, 3+ axles',     plain: 'Rigid trucks with three or more axles — tandem tippers, big curtainsiders.',   can: [] },
  { code: 'HC', rank: 5, name: 'Heavy Combination (HC)', gvm: 'Prime mover + single semi-trailer', plain: 'Semi-trailers. Covers HR and below.', can: [] },
  { code: 'MC', rank: 6, name: 'Multi Combination (MC)', gvm: 'B-doubles and road trains', plain: 'B-doubles and road trains. Covers every class below.', can: [] }
];
const TH_LIC_RANK = Object.fromEntries(TH_LICENCES.map(l => [l.code, l.rank]));

/* Licence class from GVM (kg) and axle count — rigid vehicles. */
function licenceForVehicle(gvmKg, axles) {
  gvmKg = Number(gvmKg) || 0; axles = Number(axles) || 2;
  if (gvmKg <= 4500) return 'C';
  if (gvmKg <= 8000) return 'LR';
  return axles >= 3 ? 'HR' : 'MR';
}

const TH_TYPES = [
  { id: 'ute',     name: 'Utes',              short: 'Ute',            blurb: 'Tip runs, tools, small loads' },
  { id: 'van',     name: 'Vans',              short: 'Van',            blurb: 'Couriers, small moves, trades' },
  { id: 'box',     name: 'Pantechs & moving', short: 'Pantech',        blurb: 'House moves, furniture, events' },
  { id: 'tray',    name: 'Tray & flatbed',    short: 'Tray',           blurb: 'Pallets, timber, machinery' },
  { id: 'tipper',  name: 'Tippers',           short: 'Tipper',         blurb: 'Soil, rubble, landscaping' },
  { id: 'curtain', name: 'Curtainsiders',     short: 'Curtainsider',   blurb: 'Freight, side loading, pallets' },
  { id: 'fridge',  name: 'Refrigerated',      short: 'Refrigerated',   blurb: 'Food, flowers, events' },
  { id: 'tilt',    name: 'Tilt trays',        short: 'Tilt tray',      blurb: 'Cars, machinery, plant' }
];
const TH_TYPE = Object.fromEntries(TH_TYPES.map(t => [t.id, t]));

/* "What are you moving?" presets — volume (m³) and weight (kg) estimates. */
const TH_LOADS = [
  { id: 'studio', name: 'Studio / 1-bed apartment', m3: 12,  kg: 900,  type: ['van','box'] },
  { id: '2bed',   name: '2-bedroom home',           m3: 22,  kg: 1800, type: ['box'] },
  { id: '3bed',   name: '3-bedroom home',           m3: 34,  kg: 2800, type: ['box'] },
  { id: '4bed',   name: '4+ bedroom home',          m3: 48,  kg: 4200, type: ['box','curtain'] },
  { id: 'pallets',name: '4–6 pallets of stock',     m3: 10,  kg: 3500, type: ['tray','curtain'] },
  { id: 'soil',   name: 'Soil, sand or rubble',     m3: 4,   kg: 6000, type: ['tipper'] },
  { id: 'timber', name: 'Timber & building supplies', m3: 8, kg: 2500, type: ['tray','tipper'] },
  { id: 'car',    name: 'A car or small machine',   m3: 0,   kg: 2000, type: ['tilt'] },
  { id: 'event',  name: 'Event gear or market stall', m3: 14, kg: 1200, type: ['box','van'] },
  { id: 'cold',   name: 'Chilled or frozen goods',  m3: 10,  kg: 1500, type: ['fridge'] }
];

/* SAMPLE listings — demo only. */
const TH_TRUCKS_SAMPLE = [
  { id:'th-1001', title:'Toyota HiLux tray ute',              type:'ute',    make:'Toyota', model:'HiLux SR', year:2022, gvm:3050, axles:2, payload:950,  deck:'2.4 × 1.8 m', m3:2.5, trans:'Auto', fuel:'Diesel', seats:2, features:['Tow bar','Tie-down points'], suburb:'Brunswick', city:'Melbourne', state:'VIC', dayRate:89,  kmDay:150, extraKm:0.35, bond:300,  owner:'Business', instant:true },
  { id:'th-1002', title:'Hyundai iLoad van',                  type:'van',    make:'Hyundai',model:'iLoad',    year:2021, gvm:3160, axles:2, payload:1100, deck:'2.4 × 1.6 m', m3:6.0, trans:'Auto', fuel:'Diesel', seats:3, features:['Barn doors','Side door','Reversing camera'], suburb:'Footscray', city:'Melbourne', state:'VIC', dayRate:119, kmDay:200, extraKm:0.35, bond:400,  owner:'Private', instant:true },
  { id:'th-1003', title:'4.5 t pantech with tail-lift',       type:'box',    make:'Isuzu',  model:'NLR 45-150', year:2020, gvm:4500, axles:2, payload:1600, deck:'4.2 × 2.1 m', m3:20, trans:'Auto', fuel:'Diesel', seats:3, features:['Tail-lift','Car licence','Tie rails','Reversing camera'], suburb:'Dandenong', city:'Melbourne', state:'VIC', dayRate:189, kmDay:150, extraKm:0.45, bond:600, owner:'Business', instant:true },
  { id:'th-1004', title:'Moving truck 30 m³ — car licence',   type:'box',    make:'Hino',   model:'300 616',  year:2021, gvm:4495, axles:2, payload:1500, deck:'5.1 × 2.2 m', m3:30, trans:'Auto', fuel:'Diesel', seats:3, features:['Loading ramp','Car licence','Tie rails'], suburb:'Moorabbin', city:'Melbourne', state:'VIC', dayRate:219, kmDay:150, extraKm:0.49, bond:800, owner:'Business', instant:false },
  { id:'th-1005', title:'8 t tipper — light rigid',           type:'tipper', make:'Isuzu',  model:'NPR 75-190', year:2019, gvm:7500, axles:2, payload:3500, deck:'3.5 × 2.0 m', m3:3.8, trans:'Manual', fuel:'Diesel', seats:3, features:['Hydraulic tipper','Tarp'], suburb:'Campbellfield', city:'Melbourne', state:'VIC', dayRate:299, kmDay:150, extraKm:0.60, bond:1000, owner:'Business', instant:false },
  { id:'th-1006', title:'6 m tray truck with crane-ready deck', type:'tray', make:'Fuso', model:'Canter 815', year:2020, gvm:7500, axles:2, payload:4000, deck:'6.0 × 2.3 m', m3:0, trans:'Auto', fuel:'Diesel', seats:3, features:['Drop sides','Rope rails','Forklift loadable'], suburb:'Laverton North', city:'Melbourne', state:'VIC', dayRate:279, kmDay:150, extraKm:0.55, bond:1000, owner:'Business', instant:true },
  { id:'th-1007', title:'12 pallet curtainsider',             type:'curtain',make:'Isuzu',  model:'FRR 107-210', year:2018, gvm:11000, axles:2, payload:5500, deck:'8.4 × 2.4 m', m3:46, trans:'Auto', fuel:'Diesel', seats:3, features:['Tail-lift','Curtain sides','12 pallets'], suburb:'Truganina', city:'Melbourne', state:'VIC', dayRate:419, kmDay:200, extraKm:0.75, bond:1500, owner:'Business', instant:false },
  { id:'th-1008', title:'Tandem tipper 10 m³',               type:'tipper', make:'Hino',   model:'500 FM 2628', year:2017, gvm:22500, axles:3, payload:12000, deck:'4.8 × 2.4 m', m3:10, trans:'Auto', fuel:'Diesel', seats:2, features:['Hydraulic tipper','Electric tarp','Tow hitch'], suburb:'Epping', city:'Melbourne', state:'VIC', dayRate:689, kmDay:200, extraKm:1.10, bond:2500, owner:'Business', instant:false },
  { id:'th-1009', title:'Refrigerated pantech −20 °C',        type:'fridge', make:'Isuzu',  model:'NNR 45-150', year:2021, gvm:4500, axles:2, payload:1300, deck:'3.6 × 2.0 m', m3:14, trans:'Auto', fuel:'Diesel', seats:3, features:['Freezer to −20 °C','Car licence','Standby power'], suburb:'Rocklea', city:'Brisbane', state:'QLD', dayRate:249, kmDay:150, extraKm:0.50, bond:1000, owner:'Business', instant:true },
  { id:'th-1010', title:'Tilt tray car carrier',             type:'tilt',   make:'Hino',   model:'300 921',  year:2019, gvm:8500, axles:2, payload:4300, deck:'6.5 × 2.4 m', m3:0, trans:'Manual', fuel:'Diesel', seats:3, features:['Hydraulic tilt','Winch','Ramps'], suburb:'Eagle Farm', city:'Brisbane', state:'QLD', dayRate:399, kmDay:150, extraKm:0.80, bond:2000, owner:'Business', instant:false },
  { id:'th-1011', title:'Ford Transit high-roof van',         type:'van',    make:'Ford',   model:'Transit 350L', year:2023, gvm:3550, axles:2, payload:1300, deck:'3.5 × 1.8 m', m3:11, trans:'Auto', fuel:'Diesel', seats:3, features:['High roof','Side door','Apple CarPlay'], suburb:'Woolloongabba', city:'Brisbane', state:'QLD', dayRate:139, kmDay:200, extraKm:0.39, bond:500, owner:'Private', instant:true },
  { id:'th-1012', title:'Pantech 40 m³ — light rigid',       type:'box',    make:'Isuzu',  model:'NPR 65-190', year:2019, gvm:6500, axles:2, payload:2600, deck:'6.1 × 2.4 m', m3:40, trans:'Auto', fuel:'Diesel', seats:3, features:['Tail-lift','Tie rails','Furniture blankets'], suburb:'Coopers Plains', city:'Brisbane', state:'QLD', dayRate:279, kmDay:150, extraKm:0.55, bond:1000, owner:'Business', instant:false },
  { id:'th-1013', title:'Tipper ute — car licence',          type:'tipper', make:'Isuzu',  model:'D-Max tipper', year:2022, gvm:3100, axles:2, payload:1000, deck:'2.6 × 1.9 m', m3:1.5, trans:'Auto', fuel:'Diesel', seats:2, features:['Electric tipper','Car licence','Tow bar'], suburb:'Capalaba', city:'Brisbane', state:'QLD', dayRate:129, kmDay:150, extraKm:0.40, bond:400, owner:'Private', instant:true },
  { id:'th-1014', title:'14 pallet curtainsider — medium rigid', type:'curtain', make:'Hino', model:'500 FD 1124', year:2019, gvm:11000, axles:2, payload:6000, deck:'9.0 × 2.5 m', m3:52, trans:'Auto', fuel:'Diesel', seats:3, features:['Tail-lift','Curtain sides','GPS'], suburb:'Wacol', city:'Brisbane', state:'QLD', dayRate:449, kmDay:200, extraKm:0.80, bond:1500, owner:'Business', instant:false }
];
TH_TRUCKS_SAMPLE.forEach(t => { t.licence = licenceForVehicle(t.gvm, t.axles); t.sample = true; });
