const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // senin db.js

const app = express();
app.use(cors());
app.use(express.json());

/* ================= FILTER ENDPOINT ================= */

app.post("/api/properties/filter", async (req, res) => {
  try {
    const f = req.body;

    let where = [];
    let values = [];

    const add = (condition, value) => {
      values.push(value);
      where.push(condition.replace("?", `$${values.length}`));
    };

    /* ================= KONUM ================= */
    if (f.city) add("pl.city = ?", f.city);
    if (f.district) add("pl.district = ?", f.district);

    /* ================= ANA ================= */
    if (f.usage_status) add("ps.usage_status = ?", f.usage_status);
    if (f.rooms) add("ps.rooms = ?", f.rooms);
    if (f.price_min) add("p.price >= ?", f.price_min);
    if (f.price_max) add("p.price <= ?", f.price_max);

    /* ================= İLAN ================= */
    if (f.category) add("ps.category = ?", f.category);
    if (f.listing_date) add("ps.listing_date >= ?", f.listing_date);

    /* ================= METREKARE ================= */
    if (f.gross_sqm) add("ps.gross_sqm >= ?", f.gross_sqm);
    if (f.net_sqm) add("ps.net_sqm >= ?", f.net_sqm);

    /* ================= BİNA ================= */
    if (f.building_age) add("ps.building_age <= ?", f.building_age);
    if (f.floors) add("ps.floors = ?", f.floors);
    if (f.floor_location) add("ps.floor_location = ?", f.floor_location);

    /* ================= ISINMA / CEPHE ================= */
    if (f.heating_type) add("ps.heating_type = ?", f.heating_type);
    if (f.facade) add("ps.facade = ?", f.facade);

    /* ================= İÇ ÖZELLİKLER ================= */
    if (f.central_air) where.push("pif.central_air = 1");
    if (f.fireplace) where.push("pif.fireplace = 1");
    if (f.smart_home_features) where.push("pif.smart_home_features = 1");
    if (f.walk_in_closet) where.push("pif.walk_in_closet = 1");
    if (f.ensuite_bathroom) where.push("pif.ensuite_bathroom = 1");
    if (f.modern_kitchen) where.push("pif.modern_kitchen = 1");

    /* ================= DIŞ ÖZELLİKLER ================= */
    if (f.parking) where.push("ef.parking = 1");
    if (f.garage) where.push("ef.garage = 1");
    if (f.garden) where.push("ef.garden = 1");
    if (f.terrace) where.push("ef.terrace = 1");
    if (f.swimming_pool) where.push("ef.swimming_pool = 1");
    if (f.playground) where.push("ef.playground = 1");

    /* ================= ÇEVRE ================= */
    if (f.sea_view) where.push("env.sea_view = 1");
    if (f.mountain_view) where.push("env.mountain_view = 1");
    if (f.park_nearby) where.push("env.park_nearby = 1");
    if (f.near_school) where.push("env.near_school = 1");
    if (f.near_hospital) where.push("env.near_hospital = 1");
    if (f.near_market) where.push("env.near_market = 1");
    if (f.near_transport) where.push("env.near_transport = 1");

    /* ================= FİNANS ================= */
    if (f.loan_status) where.push("ps.loan_status = 1");
    if (f.exchange_status) where.push("ps.exchange_status = 1");

    const whereSQL = where.length ? "WHERE " + where.join(" AND ") : "";

    const query = `
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
        ps.category,
        ps.usage_status

      FROM properties p
      JOIN property_location pl ON pl.property_id = p.id
      JOIN property_specifications ps ON ps.property_id = p.id
      LEFT JOIN property_interior_features pif ON pif.property_id = p.id
      LEFT JOIN exterior_features ef ON ef.property_id = p.id
      LEFT JOIN environmental_features env ON env.property_id = p.id

      ${whereSQL}
      ORDER BY p.created_at DESC
    `;

    const { rows } = await db.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Filtreleme hatası" });
  }
});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log("🚀 Server çalışıyor: http://localhost:3000");
});
