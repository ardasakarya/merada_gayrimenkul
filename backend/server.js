const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db"); // mysql2/promise pool

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));


const path = require("path");

// uploads klasörünü public yap
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const cleanStr = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
};
const cleanNum = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const isChecked = (v) => v === 1 || v === true || v === "1";

/** Feature whitelist: group -> { tableAlias, columnWhitelist[] } */
const FEATURE_MAP = {
  transport: { alias: "ptf", cols: ["main_road","avenue","dolmus","e5","airport","marmaray","metrobus","metro","minibus","coast","bus_stop","tem","train_station","tram"] },
  view:      { alias: "pvf", cols: ["sea","nature","lake","pool","river","park","city","bosporus"] },
  exterior:  { alias: "pef", cols: ["ev_charging","security","concierge","steam_room","playground","hamam","thermal_insulation","hydrophore","generator","cable_tv","camera_system","kindergarten","private_pool","sauna","sound_insulation","siding","sports_area","water_tank","tennis_court","satellite","fire_escape","open_pool","indoor_pool"] },
  env:       { alias: "penv", cols: ["mall","cemevi","entertainment","lakefront","seafront","mosque","municipality","pharmacy","fair","hospital","synagogue","school","fire_station","church","high_school","market","park","beach","police","health_center","bazaar","gym","city_center","university"] },
  access:    { alias: "pacc", cols: ["accessible_parking","accessible_kitchen","wide_corridor","accessible_wc","accessible_elevator","accessible_bathroom","ramp","handrails"] },
};

app.post("/api/properties/filter", async (req, res) => {
  try {
    const f = req.body || {};
    const where = [];
    const values = [];
    const add = (sql, val) => { where.push(sql); values.push(val); };

    // ===== Base filters =====
    const city = cleanStr(f.city);
    const district = cleanStr(f.district);
    if (city) add("pl.city = ?", city);
    if (district) add("pl.district = ?", district);


    const rooms = cleanStr(f.rooms);
   


    if (rooms) add("ps.rooms = ?", rooms);
 

    const priceMin = cleanNum(f.price_min);
    const priceMax = cleanNum(f.price_max);
    if (priceMin !== null) add("p.price >= ?", priceMin);
    if (priceMax !== null) add("p.price <= ?", priceMax);

    const listing_date = cleanStr(f.listing_date);
    if (listing_date) add("DATE(ps.listing_date) >= DATE(?)", listing_date);

    const grossMin = cleanNum(f.gross_sqm_min);
    const netMin = cleanNum(f.net_sqm_min);
    if (grossMin !== null) add("ps.gross_sqm >= ?", grossMin);
    if (netMin !== null) add("ps.net_sqm >= ?", netMin);

    const buildingAgeMax = cleanNum(f.building_age_max);
    const floors = cleanNum(f.floors);
    const floor_location = cleanStr(f.floor_location);

    if (buildingAgeMax !== null) add("ps.building_age <= ?", buildingAgeMax);
    if (floors !== null) add("ps.floors = ?", floors);
    if (floor_location) add("ps.floor_location = ?", floor_location);

    const heating_type = cleanStr(f.heating_type);
    if (heating_type) add("ps.heating_type = ?", heating_type);

    if (isChecked(f.loan_status)) where.push("ps.loan_status = 1");
    if (isChecked(f.exchange_status)) where.push("ps.exchange_status = 1");
    if (isChecked(f.balcony)) where.push("ps.balcony = 1");
    if (isChecked(f.furnished)) where.push("ps.furnished = 1");

    // ===== Feature filters (dynamic) =====
    const features = f.features || {};
    for (const group of Object.keys(FEATURE_MAP)) {
      const selected = Array.isArray(features[group]) ? features[group] : [];
      if (selected.length === 0) continue;

      const { alias, cols } = FEATURE_MAP[group];

      // only keep whitelisted columns
      const safeCols = selected.filter((k) => cols.includes(k));
      for (const col of safeCols) {
        where.push(`${alias}.${col} = 1`);
      }
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // ===== SQL (joins) =====
    const sql = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.created_at,

        pl.city,
        pl.district,
        pl.neighborhood,

        ps.rooms,
 

        ps.gross_sqm,
        ps.net_sqm,

        MIN(pp.photo_url) AS cover_photo

      FROM properties p
      JOIN property_location pl ON pl.property_id = p.id
      JOIN property_specifications ps ON ps.property_id = p.id

      LEFT JOIN property_photos pp ON pp.property_id = p.id

      LEFT JOIN property_transportation_features ptf ON ptf.property_id = p.id
      LEFT JOIN property_view_features pvf ON pvf.property_id = p.id
      LEFT JOIN property_exterior_features pef ON pef.property_id = p.id
      LEFT JOIN property_environmental_features penv ON penv.property_id = p.id
      LEFT JOIN property_accessibility_features pacc ON pacc.property_id = p.id

      ${whereSQL}
      GROUP BY
        p.id,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.created_at,
        pl.city,
        pl.district,
        pl.neighborhood,
        ps.rooms,
        ps.gross_sqm,
        ps.net_sqm
      ORDER BY p.created_at DESC
      LIMIT 300
    `;

    const [rows] = await db.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error("❌ Filtreleme hatası:", err);
    res.status(500).json({ error: "Filtreleme hatası", detail: err.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
