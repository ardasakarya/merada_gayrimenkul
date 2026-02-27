// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const db = require("./config/db"); // mysql2 pool (callback'lı kullanım)

dotenv.config();

const app = express();

/* =======================
   ENV / SABİTLER
   ======================= */
const PORT = process.env.PORT || process.env.APP_PORT || 5000;
const BACKEND_URL =
  process.env.BACKEND_URL || `http://127.0.0.1:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES || "1h";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/* =======================
   MIDDLEWARE
   ======================= */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS – localhost üzerinde tüm portlara izin
app.use(
  cors({
    origin: [/^http:\/\/(localhost|127\.0\.0\.1):\d+$/],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =======================
   STATIC DOSYALAR
   ======================= */
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

const publicPath = path.join(__dirname, "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath)); // örn: /img/placeholder.webp
}

/* =======================
   YARDIMCI FONKSİYONLAR
   ======================= */

// Filtre için temizlik
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

// floor_location gibi INT kolonlar için güvenli cast
const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

// Fotoğraf URL normalizasyonu
const normalizePhotoUrl = (p) => {
  if (!p) return `${BACKEND_URL}/img/placeholder.webp`;

  let s = String(p).trim();

  if (s.startsWith("/uploads/http://") || s.startsWith("/uploads/https://")) {
    s = s.replace(/^\/uploads\//, "");
  }

  if (s.startsWith("uploads/http://") || s.startsWith("uploads/https://")) {
    s = s.replace(/^uploads\//, "");
  }

  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  if (s.startsWith("/uploads/")) return `${BACKEND_URL}${s}`;

  if (s.startsWith("uploads/")) return `${BACKEND_URL}/${s}`;

  s = s.replace(/^uploads[\\/]/, "");
  return `${BACKEND_URL}/uploads/${s}`;
};

// Özellik filtre haritası
const FEATURE_MAP = {
  transport: {
    alias: "ptf",
    cols: [
      "main_road",
      "avenue",
      "dolmus",
      "e5",
      "airport",
      "marmaray",
      "metrobus",
      "metro",
      "minibus",
      "coast",
      "bus_stop",
      "tem",
      "train_station",
      "tram",
    ],
  },
  view: {
    alias: "pvf",
    cols: ["sea", "nature", "lake", "pool", "river", "park", "city", "bosporus"],
  },
  exterior: {
    alias: "pef",
    cols: [
      "ev_charging",
      "security",
      "concierge",
      "steam_room",
      "playground",
      "hamam",
      "thermal_insulation",
      "hydrophore",
      "generator",
      "cable_tv",
      "camera_system",
      "kindergarten",
      "private_pool",
      "sauna",
      "sound_insulation",
      "siding",
      "sports_area",
      "water_tank",
      "tennis_court",
      "satellite",
      "fire_escape",
      "open_pool",
      "indoor_pool",
    ],
  },
  env: {
    alias: "penv",
    cols: [
      "mall",
      "cemevi",
      "entertainment",
      "lakefront",
      "seafront",
      "mosque",
      "municipality",
      "pharmacy",
      "fair",
      "hospital",
      "synagogue",
      "school",
      "fire_station",
      "church",
      "high_school",
      "market",
      "park",
      "beach",
      "police",
      "health_center",
      "bazaar",
      "gym",
      "city_center",
      "university",
    ],
  },
  access: {
    alias: "pacc",
    cols: [
      "accessible_parking",
      "accessible_kitchen",
      "wide_corridor",
      "accessible_wc",
      "accessible_elevator",
      "accessible_bathroom",
      "ramp",
      "handrails",
    ],
  },
};

/* =======================
   MULTER (UPLOAD)
   ======================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});
const upload = multer({ storage });

/* =======================
   SAĞLIK / ROOT
   ======================= */
app.get("/", (req, res) => res.send("Express sunucu çalışıyor ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

/* =======================
   AUTH MIDDLEWARE + LOGIN
   ======================= */

// Sadece admin token kontrolü
function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token gerekli" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Geçersiz veya süresi dolmuş token" });
  }
}

// Tek bir LOGIN endpoint (duplicate'ler silindi)
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Kullanıcı adı ve şifre zorunlu" });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res
      .status(401)
      .json({ error: "Geçersiz kullanıcı adı veya şifre" });
  }

  try {
    const token = jwt.sign(
      { username, role: "admin" },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    return res.json({ token });
  } catch (err) {
    console.error("❌ JWT oluşturulurken hata:", err);
    return res.status(500).json({ error: "Sunucu hatası (token)" });
  }
});

/* =======================
   FİLTRELİ LİSTE (PUBLIC)
   POST /api/properties/filter
   ======================= */
app.post("/api/properties/filter", (req, res) => {
  try {
    const f = req.body || {};
    const where = [];
    const values = [];
    const add = (sql, val) => {
      where.push(sql);
      values.push(val);
    };

    // --- Temel filtreler --- //
    const city = cleanStr(f.city);
    const district = cleanStr(f.district);
    if (city) add("pl.city = ?", city);
    if (district) add("pl.district = ?", district);
    const listing_type = cleanStr(f.listing_type);
    if (listing_type) add("p.listing_type = ?", listing_type);
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

    // --- Dinamik özellik filtreleri --- //
    const features = f.features || {};
    for (const group of Object.keys(FEATURE_MAP)) {
      const selected = Array.isArray(features[group]) ? features[group] : [];
      if (selected.length === 0) continue;

      const { alias, cols } = FEATURE_MAP[group];
      const safeCols = selected.filter((k) => cols.includes(k));

      for (const col of safeCols) {
        where.push(`${alias}.${col} = 1`);
      }
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.currency,
         p.listing_type,
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

    db.query(sql, values, (err, rows) => {
      if (err) {
        console.error("❌ Filtreleme hatası:", err);
        return res
          .status(500)
          .json({ error: "Filtreleme hatası", detail: err.message });
      }

      const mapped = (rows || []).map((r) => ({
        ...r,
        cover_photo: normalizePhotoUrl(r.cover_photo),
      }));

      return res.json(mapped);
    });
  } catch (err) {
    console.error("❌ Filtreleme genel hata:", err);
    res
      .status(500)
      .json({ error: "Filtreleme hatası", detail: err.message });
  }
});

/* =======================
   PROPERTIES LIST (PUBLIC)
   GET /properties
   ======================= */
app.get("/properties", (req, res) => {
  const sql = `
    SELECT p.id, p.title, p.price, p.currency,p.listing_type, p.description,
           l.city, l.district, l.neighborhood, l.street_address,
           l.latitude, l.longitude,
           s.rooms, s.bathrooms, s.gross_sqm,
           (SELECT photo_url FROM property_photos WHERE property_id = p.id ORDER BY id ASC LIMIT 1) AS photo_url
    FROM properties p
    LEFT JOIN property_location l ON l.property_id = p.id
    LEFT JOIN property_specifications s ON s.property_id = p.id
    ORDER BY p.id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ DB Hatası (/properties):", err);
      return res.status(500).json({ error: "DB Hatası" });
    }

    const mapped = (rows || []).map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      currency: r.currency,
      listing_type: r.listing_type,
      description: r.description,
      city: r.city,
      district: r.district,
      neighborhood: r.neighborhood,
      address: r.street_address,
      latitude: r.latitude,
      longitude: r.longitude,
      rooms: r.rooms,
      bathrooms: r.bathrooms,
      gross_sqm: r.gross_sqm,
      photo: normalizePhotoUrl(r.photo_url),
    }));

    res.json(mapped);
  });
});

/* =======================
   TEK İLAN DETAYI (PUBLIC)
   GET /properties/:id
   ======================= */
app.get("/properties/:id", (req, res) => {
  const propertyId = req.params.id;

  const sql = `
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.currency,
    p.listing_type,
    p.created_at,

    a.name   AS agent_name,
    a.phone  AS agent_phone,
    a.email  AS agent_email,

    l.city,
    l.district,
    l.neighborhood,
    l.street,
    l.street_address,
    l.zip_code,
    l.latitude,
    l.longitude,

    s.listing_date        AS listingDate,
    s.gross_sqm           AS grossSqm,
    s.net_sqm             AS netSqm,
    s.rooms               AS rooms,
    s.building_age        AS buildingAge,
    s.floors              AS totalFloors,
    s.floor_location      AS floorLocation,
    s.heating_type        AS heatingType,
    s.bathrooms           AS bathrooms,

    i.adsl,
    i.wood_joinery,
    i.smart_home,
    i.alarm_burglar,
    i.alarm_fire,
    i.turkish_wc,
    i.aluminum_joinery,
    i.american_door,
    i.built_in_oven,
    i.barbecue,
    i.white_goods,
    i.painted,
    i.dishwasher,
    i.refrigerator,
    i.dryer,
    i.washing_machine,
    i.laundry_room,
    i.steel_door,
    i.shower_cabin,
    i.wallpaper,
    i.ensuite_bathroom,
    i.fiber,
    i.dressing_room,
    i.built_in_closet,
    i.video_intercom,
    i.hilton_bathroom,
    i.intercom_system,
    i.double_glazing,
    i.jacuzzi,
    i.cornice,
    i.pantry,
    i.air_conditioning,
    i.bathtub,
    i.laminate_floor,
    i.marley,
    i.furnished,
    i.built_in_kitchen,
    i.natural_gas_kitchen,
    i.shutter,
    i.parquet,
    i.pvc_joinery,
    i.ceramic_floor,
    i.set_top_stove,
    i.spot_lighting,
    i.water_heater,
    i.fireplace,
    i.terrace,
    i.vestiaire,
    i.wifi,
    i.biometric_system,

    e.ev_charging_station,
    e.security_24h,
    e.janitor,
    e.steam_room,
    e.playground,
    e.hammam,
    e.hydrofor,
    e.thermal_insulation,
    e.generator,
    e.cable_tv,
    e.camera_system,
    e.nursery,
    e.open_pool,
    e.indoor_pool,
    e.sauna,
    e.sound_insulation,
    e.siding,
    e.sports_area,
    e.water_tank,
    e.tennis_court,
    e.satellite,
    e.fire_escape,

    env.shopping_mall,
    env.municipality,
    env.mosque,
    env.cemevi,
    env.seafront,
    env.pharmacy,
    env.entertainment_center,
    env.fair,
    env.lakefront,
    env.hospital,
    env.synagogue,
    env.primary_school,
    env.fire_station,
    env.church,
    env.high_school,
    env.market,
    env.park,
    env.beach,
    env.police_station,
    env.health_center,
    env.street_market,
    env.gym,
    env.city_center,
    env.university,

    r.main_road,
    r.avenue,
    r.dolmus,
    r.e5,
    r.airport,
    r.marmaray,
    r.metro,
    r.metrobus,
    r.minibus,
    r.bus_stop,
    r.coast,
    r.tem,
    r.train_station,
    r.tram,

    v.bosporus,
    v.sea,
    v.nature,
    v.lake,
    v.pool,
    v.river,
    v.park,
    v.city,

    acc.accessible_parking,
    acc.accessible_kitchen,
    acc.wide_corridor,
    acc.accessible_wc,
    acc.accessible_elevator,
    acc.accessible_bathroom,
    acc.ramp,
    acc.handrails,

    ht.duplex,
    ht.top_floor,
    ht.middle_floor,
    ht.garden_duplex,
    ht.roof_duplex,
    ht.reverse_duplex,
    ht.triplex,

    f.west,
    f.east,
    f.south,
    f.north,

    (SELECT JSON_ARRAYAGG(photo_url) 
     FROM property_photos 
     WHERE property_id = p.id) AS photos

  FROM properties p
  LEFT JOIN property_location l ON l.property_id = p.id
  LEFT JOIN property_specifications s ON s.property_id = p.id
  LEFT JOIN property_interior_features i ON i.property_id = p.id
  LEFT JOIN property_exterior_features e ON e.property_id = p.id
  LEFT JOIN property_environmental_features env ON env.property_id = p.id
  LEFT JOIN property_transportation_features r ON r.property_id = p.id
  LEFT JOIN property_view_features v ON v.property_id = p.id
  LEFT JOIN property_accessibility_features acc ON acc.property_id = p.id
  LEFT JOIN property_housing_type ht ON ht.property_id = p.id
  LEFT JOIN property_facade f ON f.property_id = p.id
  LEFT JOIN property_agent a ON a.property_id = p.id
  WHERE p.id = ?;
`;

  db.query(sql, [propertyId], (err, rows) => {
    if (err) {
      console.error("❌ DB Hatası:", err);
      return res.status(500).json({ error: "DB Hatası" });
    }
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "İlan bulunamadı" });

    const r = rows[0];

    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      currency: r.currency,
      listing_type: r.listing_type,
      created_at: r.created_at,

      location: {
        city: r.city,
        district: r.district,
        neighborhood: r.neighborhood,
        street: r.street,
        street_address: r.street_address,
        zip_code: r.zip_code,
        latitude: r.latitude ? parseFloat(r.latitude) : null,
        longitude: r.longitude ? parseFloat(r.longitude) : null,
      },

      specifications: {
        listing_date: r.listingDate,
        gross_sqm: r.grossSqm,
        net_sqm: r.netSqm,
        rooms: r.rooms,
        bathrooms: r.bathrooms,
        building_age: r.buildingAge,
        floors: r.totalFloors,
        floor_location: r.floorLocation,
        heating_type: r.heatingType,
      },

      interior_features: {
        adsl: r.adsl,
        wood_joinery: r.wood_joinery,
        smart_home: r.smart_home,
        alarm_burglar: r.alarm_burglar,
        alarm_fire: r.alarm_fire,
        turkish_wc: r.turkish_wc,
        aluminum_joinery: r.aluminum_joinery,
        american_door: r.american_door,
        built_in_oven: r.built_in_oven,
        barbecue: r.barbecue,
        white_goods: r.white_goods,
        painted: r.painted,
        dishwasher: r.dishwasher,
        refrigerator: r.refrigerator,
        dryer: r.dryer,
        washing_machine: r.washing_machine,
        laundry_room: r.laundry_room,
        steel_door: r.steel_door,
        shower_cabin: r.shower_cabin,
        wallpaper: r.wallpaper,
        ensuite_bathroom: r.ensuite_bathroom,
        fiber: r.fiber,
        dressing_room: r.dressing_room,
        built_in_closet: r.built_in_closet,
        video_intercom: r.video_intercom,
        hilton_bathroom: r.hilton_bathroom,
        intercom_system: r.intercom_system,
        double_glazing: r.double_glazing,
        jacuzzi: r.jacuzzi,
        cornice: r.cornice,
        pantry: r.pantry,
        air_conditioning: r.air_conditioning,
        bathtub: r.bathtub,
        laminate_floor: r.laminate_floor,
        marley: r.marley,
        furnished: r.furnished,
        built_in_kitchen: r.built_in_kitchen,
        natural_gas_kitchen: r.natural_gas_kitchen,
        shutter: r.shutter,
        parquet: r.parquet,
        pvc_joinery: r.pvc_joinery,
        ceramic_floor: r.ceramic_floor,
        set_top_stove: r.set_top_stove,
        spot_lighting: r.spot_lighting,
        water_heater: r.water_heater,
        fireplace: r.fireplace,
        terrace: r.terrace,
        vestiaire: r.vestiaire,
        wifi: r.wifi,
        biometric_system: r.biometric_system,
      },

      exterior_features: {
        ev_charging_station: r.ev_charging_station,
        security_24h: r.security_24h,
        janitor: r.janitor,
        steam_room: r.steam_room,
        playground: r.playground,
        hammam: r.hammam,
        hydrofor: r.hydrofor,
        thermal_insulation: r.thermal_insulation,
        generator: r.generator,
        cable_tv: r.cable_tv,
        camera_system: r.camera_system,
        nursery: r.nursery,
        open_pool: r.open_pool,
        indoor_pool: r.indoor_pool,
        sauna: r.sauna,
        sound_insulation: r.sound_insulation,
        siding: r.siding,
        sports_area: r.sports_area,
        water_tank: r.water_tank,
        tennis_court: r.tennis_court,
        satellite: r.satellite,
        fire_escape: r.fire_escape,
      },

      environmental_features: {
        shopping_mall: r.shopping_mall,
        municipality: r.municipality,
        mosque: r.mosque,
        cemevi: r.cemevi,
        seafront: r.seafront,
        pharmacy: r.pharmacy,
        entertainment_center: r.entertainment_center,
        fair: r.fair,
        lakefront: r.lakefront,
        hospital: r.hospital,
        synagogue: r.synagogue,
        primary_school: r.primary_school,
        fire_station: r.fire_station,
        church: r.church,
        high_school: r.high_school,
        market: r.market,
        park: r.park,
        beach: r.beach,
        police_station: r.police_station,
        health_center: r.health_center,
        street_market: r.street_market,
        gym: r.gym,
        city_center: r.city_center,
        university: r.university,
      },

      transportation: {
        main_road: r.main_road,
        avenue: r.avenue,
        dolmus: r.dolmus,
        e5: r.e5,
        airport: r.airport,
        marmaray: r.marmaray,
        metro: r.metro,
        metrobus: r.metrobus,
        minibus: r.minibus,
        bus_stop: r.bus_stop,
        coast: r.coast,
        tem: r.tem,
        train_station: r.train_station,
        tram: r.tram,
      },

      views: {
        bosporus: r.bosporus,
        sea: r.sea,
        nature: r.nature,
        lake: r.lake,
        pool: r.pool,
        river: r.river,
        park: r.park,
        city: r.city,
      },

      accessibility: {
        accessible_parking: r.accessible_parking,
        accessible_kitchen: r.accessible_kitchen,
        wide_corridor: r.wide_corridor,
        accessible_wc: r.accessible_wc,
        accessible_elevator: r.accessible_elevator,
        accessible_bathroom: r.accessible_bathroom,
        ramp: r.ramp,
        handrails: r.handrails,
      },

      housingType: {
        duplex: r.duplex,
        top_floor: r.top_floor,
        middle_floor: r.middle_floor,
        garden_duplex: r.garden_duplex,
        roof_duplex: r.roof_duplex,
        reverse_duplex: r.reverse_duplex,
        triplex: r.triplex,
      },

      facade: {
        west: r.west,
        east: r.east,
        south: r.south,
        north: r.north,
      },

      agent: {
        name: r.agent_name,
        phone: r.agent_phone,
        email: r.agent_email,
      },

      photos: (() => {
        try {
          const arr =
            typeof r.photos === "string"
              ? JSON.parse(r.photos)
              : r.photos || [];
          return (arr || [])
            .filter(Boolean)
            .map(normalizePhotoUrl);
        } catch {
          return [];
        }
      })(),
    });
  });
});

/* =======================
   DELETE PROPERTY (ADMIN)
   DELETE /properties/:id
   ======================= */
app.delete("/properties/:id", authAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Geçersiz ID" });

  db.getConnection((connErr, conn) => {
    if (connErr)
      return res
        .status(500)
        .json({ error: "Veritabanı bağlantı hatası" });

    conn.query(
      "SELECT id FROM properties WHERE id = ? LIMIT 1",
      [id],
      (pErr, pRows) => {
        if (pErr) {
          conn.release();
          console.error("❌ properties select err:", pErr);
          return res.status(500).json({ error: "DB Hatası" });
        }
        if (!pRows || pRows.length === 0) {
          conn.release();
          return res.status(404).json({ error: "İlan bulunamadı" });
        }

        conn.query(
          "SELECT photo_url FROM property_photos WHERE property_id = ?",
          [id],
          (photoErr, photoRows) => {
            if (photoErr) {
              conn.release();
              console.error("❌ photo select err:", photoErr);
              return res
                .status(500)
                .json({ error: "Fotoğraflar okunamadı" });
            }

            const photoFiles = (photoRows || [])
              .map((r) => r.photo_url)
              .filter(Boolean)
              .map((p) => {
                const s = String(p).trim();
                const idx = s.lastIndexOf("/uploads/");
                if (idx !== -1) return s.slice(idx + 9);
                return s.replace(/^\/?uploads[\\/]/, "");
              });

            conn.beginTransaction((txErr) => {
              if (txErr) {
                conn.release();
                return res
                  .status(500)
                  .json({ error: "Transaction başlatılamadı" });
              }

              const steps = [
                ["DELETE FROM property_agent WHERE property_id = ?", [id]],
                ["DELETE FROM property_facade WHERE property_id = ?", [id]],
                [
                  "DELETE FROM property_housing_type WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_accessibility_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_view_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_transportation_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_environmental_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_exterior_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_interior_features WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_specifications WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_location WHERE property_id = ?",
                  [id],
                ],
                [
                  "DELETE FROM property_photos WHERE property_id = ?",
                  [id],
                ],
                ["DELETE FROM properties WHERE id = ?", [id]],
              ];

              const run = (i) => {
                if (i >= steps.length) {
                  return conn.commit(() => {
                    conn.release();

                    let deletedCount = 0;
                    for (const file of photoFiles) {
                      try {
                        const abs = path.join(uploadPath, file);
                        if (fs.existsSync(abs)) {
                          fs.unlinkSync(abs);
                          deletedCount++;
                        }
                      } catch (e) {
                        console.warn(
                          "⚠️ Dosya silinemedi:",
                          file,
                          e.message
                        );
                      }
                    }

                    return res.json({
                      success: true,
                      deletedId: id,
                      deletedFiles: deletedCount,
                    });
                  });
                }

                const [sqlStep, params] = steps[i];
                conn.query(sqlStep, params, (qErr) => {
                  if (qErr) {
                    console.error("❌ delete err:", sqlStep, qErr);
                    return conn.rollback(() => {
                      conn.release();
                      res.status(500).json({
                        error: "Silme işlemi başarısız",
                        detail: qErr.message,
                      });
                    });
                  }
                  run(i + 1);
                });
              };

              run(0);
            });
          }
        );
      }
    );
  });
});

/* =======================
   UPDATE PROPERTY (ADMIN)
   PUT /properties/:id
   ======================= */
app.put("/properties/:id", authAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Geçersiz id" });

  const b = req.body || {};
  if (b.id !== undefined && Number(b.id) !== id) {
    return res
      .status(400)
      .json({ error: "Body id ile URL id uyuşmuyor" });
  }

  const loc = b.location || {};
  const spec = b.specifications || {};
  const agent = b.agent || {};

  const featureGroups = [
    {
      bodyKeys: ["interior_features", "interior"],
      tableCandidates: ["property_interior_features"],
    },
    {
      bodyKeys: ["exterior_features", "exterior"],
      tableCandidates: ["property_exterior_features"],
    },
    {
      bodyKeys: ["environmental_features", "environmental"],
      tableCandidates: ["property_environmental_features"],
    },
    {
      bodyKeys: ["transportation"],
      tableCandidates: ["property_transportation_features"],
    },
    {
      bodyKeys: ["views"],
      tableCandidates: ["property_view_features"],
    },
    {
      bodyKeys: ["accessibility"],
      tableCandidates: ["property_accessibility_features"],
    },
    {
      bodyKeys: ["housingType", "housing_type"],
      tableCandidates: [
        "property_housing_type",
        "property_housing_type_features",
        "property_housing_features",
        "property_housing_types",
      ],
    },
    {
      bodyKeys: ["facade"],
      tableCandidates: ["property_facade", "property_facade_features"],
    },
  ];

  const photos = Array.isArray(b.photos)
    ? b.photos.map((x) => String(x || "").trim()).filter(Boolean)
    : [];

  db.getConnection((connErr, conn) => {
    if (connErr)
      return res.status(500).json({ error: "DB bağlantı hatası" });

    const q = (sql, params = []) =>
      new Promise((resolve, reject) => {
        conn.query(sql, params, (err, result) =>
          err ? reject(err) : resolve(result)
        );
      });

    const rollbackAndSend = (status, message) => {
      conn.rollback(() => {
        conn.release();
        res.status(status).json({ error: message });
      });
    };

    const tableExistenceCache = new Map();
    const resolveExistingTable = async (candidates = []) => {
      for (const tableName of candidates) {
        if (tableExistenceCache.has(tableName)) {
          if (tableExistenceCache.get(tableName)) return tableName;
          continue;
        }

        const rows = await q("SHOW TABLES LIKE ?", [tableName]);
        const exists =
          Array.isArray(rows) && rows.length > 0;
        tableExistenceCache.set(tableName, exists);
        if (exists) return tableName;
      }
      return null;
    };

    conn.beginTransaction(async (txErr) => {
      if (txErr) {
        conn.release();
        return res
          .status(500)
          .json({ error: "Transaction açılamadı" });
      }

      try {
        const exists = await q(
          "SELECT id FROM properties WHERE id = ? LIMIT 1",
          [id]
        );
        if (!exists || exists.length === 0) {
          return rollbackAndSend(404, "İlan bulunamadı");
        }

              const listingTypeForUpdate = b.listing_type ?? b.listingType ?? null;

        await q(
          "UPDATE properties SET title=?, description=?, price=?, currency=?, listing_type=? WHERE id=?",
          [
            b.title ?? null,
            b.description ?? null,
            b.price ?? null,
            b.currency ?? null,
            listingTypeForUpdate,
            id,
          ]
        );

        const upsertByPropertyId = async (table, valuesObj) => {
          const clean = Object.fromEntries(
            Object.entries(valuesObj || {}).filter(
              ([k]) => k !== "property_id"
            )
          );
          const keys = Object.keys(clean);
          if (keys.length === 0) return;

          const updateRes = await q(
            `UPDATE ${table} SET ? WHERE property_id=?`,
            [clean, id]
          );
          if (!updateRes || updateRes.affectedRows === 0) {
            await q(`INSERT INTO ${table} SET ?`, [
              { property_id: id, ...clean },
            ]);
          }
        };

        await upsertByPropertyId("property_location", {
          district: loc.district ?? null,
          city: loc.city ?? null,
          neighborhood: loc.neighborhood ?? null,
          street: loc.street ?? null,
          street_address: loc.street_address ?? null,
          zip_code: loc.zip_code ?? null,
          latitude: loc.latitude ?? null,
          longitude: loc.longitude ?? null,
        });

        await upsertByPropertyId("property_specifications", {
          rooms: spec.rooms ?? null,
          bathrooms: spec.bathrooms ?? null,
          gross_sqm: spec.gross_sqm ?? null,
          net_sqm: spec.net_sqm ?? null,
          listing_date: spec.listing_date ?? null,
          building_age: spec.building_age ?? null,
          floors: spec.floors ?? null,
          // 🔧 Burada 'on' gibi saçma değerleri NULL'a çeviriyoruz
          floor_location: toIntOrNull(spec.floor_location),
          heating_type: spec.heating_type ?? null,
        });

        await upsertByPropertyId("property_agent", {
          name: agent.name ?? null,
          phone: agent.phone ?? null,
          email: agent.email ?? null,
        });

        for (const group of featureGroups) {
          let payload = {};
          for (const bodyKey of group.bodyKeys) {
            if (b[bodyKey] && typeof b[bodyKey] === "object") {
              payload = b[bodyKey];
              break;
            }
          }
          if (Object.keys(payload).length > 0) {
            const existingTable = await resolveExistingTable(
              group.tableCandidates || []
            );
            if (!existingTable) {
              console.warn(
                `⚠️ Özellik tablosu bulunamadı, atlanıyor: ${(
                  group.tableCandidates || []
                ).join(", ")}`
              );
              continue;
            }
            await upsertByPropertyId(existingTable, payload);
          }
        }

        if (Array.isArray(b.photos)) {
          await q("DELETE FROM property_photos WHERE property_id=?", [id]);
          if (photos.length > 0) {
            const values = photos.map((url) => [id, url, new Date()]);
            await q(
              "INSERT INTO property_photos (property_id, photo_url, created_at) VALUES ?",
              [values]
            );
          }
        }

        conn.commit((cErr) => {
          if (cErr) return rollbackAndSend(500, cErr.message);
          conn.release();
          res.json({
            success: true,
            id,
            updatedSections: [
              "properties",
              "property_location",
              "property_specifications",
              "property_agent",
              "features",
              ...(Array.isArray(b.photos) ? ["property_photos"] : []),
            ],
          });
        });
      } catch (err) {
        console.error("❌ update err:", err);
        return rollbackAndSend(500, err.message);
      }
    });
  });
});

/* =======================
   ADD PROPERTY (ADMIN)
   POST /add-property
   ======================= */
app.post("/add-property", authAdmin, (req, res) => {
  const {
    title,
    price,
    currency,
    description,
    listing_type,
    location,
    specifications,
    features,
    agent,
  } = req.body;
  if (!title || !price || !currency || !description || !listing_type) {
    return res.status(400).json({ error: "Zorunlu alanlar eksik (ilan türü dahil)" });
  }
  const loc = location || {};
  const spec = specifications || {};
  const feat = features || {};

  const interior = feat.interior || {};
  const exterior = feat.exterior || {};
  const environmental = feat.environmental || {};
  const transportation = feat.transportation || {};
  const view = feat.view || {};
  const accessibility = feat.accessibility || {};
  const housingType = feat.housingType || {};
  const facade = feat.facade || {};

  db.getConnection((connErr, conn) => {
    if (connErr)
      return res
        .status(500)
        .json({ error: "Veritabanı bağlantı hatası" });

    conn.beginTransaction((txErr) => {
      if (txErr) {
        conn.release();
        return res
          .status(500)
          .json({ error: "Transaction başlatılamadı" });
      }

           const sqlProp =
        "INSERT INTO properties (title, price, currency, listing_type, description) VALUES (?, ?, ?, ?, ?)";
      conn.query(
        sqlProp,
        [title, price, currency, listing_type, description],
        (err, result) => {
          if (err) {
            console.error("add-property err:", err);
            return conn.rollback(() => {
              conn.release();
              res
                .status(500)
                .json({ error: "İlan eklenemedi" });
            });
          }

          const propertyId = result.insertId;

          const sqlLoc = `
          INSERT INTO property_location
          (property_id, district, city, neighborhood, street, street_address, zip_code, latitude, longitude)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

          conn.query(
            sqlLoc,
            [
              propertyId,
              loc.district || null,
              loc.city || "Mersin",
              loc.neighborhood || null,
              loc.street || null,
              loc.streetAddress || null,
              loc.zipCode || null,
              loc.latitude ? parseFloat(loc.latitude) : null,
              loc.longitude ? parseFloat(loc.longitude) : null,
            ],
            (locErr) => {
              if (locErr) {
                console.error("location insert err:", locErr);
                return conn.rollback(() => {
                  conn.release();
                  res
                    .status(500)
                    .json({ error: "Lokasyon eklenemedi" });
                });
              }

              const sqlSpec = `
              INSERT INTO property_specifications
              (property_id, rooms, bathrooms, gross_sqm, net_sqm, listing_date, building_age, floor_location, heating_type)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

              conn.query(
                sqlSpec,
                [
                  propertyId,
                  spec.rooms || null,
                  spec.bathrooms || null,
                  spec.gross_sqm || null,
                  spec.net_sqm || null,
                  spec.listing_date || null,
                  spec.building_age || null,
                  // 🔧 burada da sorun çıkmasın diye cast ediyoruz
                  toIntOrNull(spec.floor_location),
                  spec.heating_type || null,
                ],
                (specErr) => {
                  if (specErr) {
                    console.error("spec insert err:", specErr);
                    return conn.rollback(() => {
                      conn.release();
                      res.status(500).json({
                        error: "Specifications eklenemedi",
                      });
                    });
                  }

                  const interiorData = {
                    property_id: propertyId,
                    ...interior,
                  };
                  conn.query(
                    "INSERT INTO property_interior_features SET ?",
                    interiorData,
                    (intErr) => {
                      if (intErr) {
                        console.error(
                          "Interior insert error:",
                          intErr
                        );
                        return conn.rollback(() => {
                          conn.release();
                          res.status(500).json({
                            error:
                              "Interior features eklenemedi",
                          });
                        });
                      }

                      const exteriorData = {
                        property_id: propertyId,
                        ...exterior,
                      };
                      conn.query(
                        "INSERT INTO property_exterior_features SET ?",
                        exteriorData,
                        (extErr) => {
                          if (extErr) {
                            console.error(
                              "Exterior insert error:",
                              extErr
                            );
                            return conn.rollback(() => {
                              conn.release();
                              res.status(500).json({
                                error:
                                  "Exterior features eklenemedi",
                              });
                            });
                          }

                          const { notes, ...environmentalRest } =
                            environmental || {};
                          const envData = {
                            property_id: propertyId,
                            ...environmentalRest,
                          };
                          conn.query(
                            "INSERT INTO property_environmental_features SET ?",
                            envData,
                            (envErr) => {
                              if (envErr) {
                                console.error(
                                  "Environmental insert error:",
                                  envErr
                                );
                                return conn.rollback(() => {
                                  conn.release();
                                  res.status(500).json({
                                    error:
                                      "Environmental features eklenemedi",
                                  });
                                });
                              }

                              const transportData = {
                                property_id: propertyId,
                                ...transportation,
                              };
                              conn.query(
                                "INSERT INTO property_transportation_features SET ?",
                                transportData,
                                (transportErr) => {
                                  if (transportErr) {
                                    console.error(
                                      "Transportation insert error:",
                                      transportErr
                                    );
                                    return conn.rollback(() => {
                                      conn.release();
                                      res.status(500).json({
                                        error:
                                          "Transportation features eklenemedi",
                                      });
                                    });
                                  }

                                  const viewData = {
                                    property_id: propertyId,
                                    ...view,
                                  };
                                  conn.query(
                                    "INSERT INTO property_view_features SET ?",
                                    viewData,
                                    (viewErr) => {
                                      if (viewErr) {
                                        console.error(
                                          "View insert error:",
                                          viewErr
                                        );
                                        return conn.rollback(
                                          () => {
                                            conn.release();
                                            res.status(
                                              500
                                            ).json({
                                              error:
                                                "View features eklenemedi",
                                            });
                                          }
                                        );
                                      }

                                      const accessData =
                                        {
                                          property_id:
                                            propertyId,
                                          ...accessibility,
                                        };
                                      conn.query(
                                        "INSERT INTO property_accessibility_features SET ?",
                                        accessData,
                                        (accessErr) => {
                                          if (accessErr) {
                                            console.error(
                                              "Accessibility insert error:",
                                              accessErr
                                            );
                                            return conn.rollback(
                                              () => {
                                                conn.release();
                                                res.status(
                                                  500
                                                ).json({
                                                  error:
                                                    "Accessibility features eklenemedi",
                                                });
                                              }
                                            );
                                          }

                                          const housingData =
                                            {
                                              property_id:
                                                propertyId,
                                              ...housingType,
                                            };
                                          conn.query(
                                            "INSERT INTO property_housing_type SET ?",
                                            housingData,
                                            (housingErr) => {
                                              if (
                                                housingErr
                                              ) {
                                                console.error(
                                                  "Housing type insert error:",
                                                  housingErr
                                                );
                                                return conn.rollback(
                                                  () => {
                                                    conn.release();
                                                    res
                                                      .status(
                                                        500
                                                      )
                                                      .json({
                                                        error:
                                                          "Housing type eklenemedi",
                                                      });
                                                  }
                                                );
                                              }

                                              const facadeData =
                                                {
                                                  property_id:
                                                    propertyId,
                                                  ...facade,
                                                };
                                              conn.query(
                                                "INSERT INTO property_facade SET ?",
                                                facadeData,
                                                (facadeErr) => {
                                                  if (
                                                    facadeErr
                                                  ) {
                                                    console.error(
                                                      "Facade insert error:",
                                                      facadeErr
                                                    );
                                                    return conn.rollback(
                                                      () => {
                                                        conn.release();
                                                        res
                                                          .status(
                                                            500
                                                          )
                                                          .json({
                                                            error:
                                                              "Facade eklenemedi",
                                                          });
                                                      }
                                                    );
                                                  }

                                                  const insertAgent =
                                                    (cb) => {
                                                      if (
                                                        !agent
                                                      )
                                                        return cb();
                                                      const sqlAgent = `
                                    INSERT INTO property_agent (property_id, name, phone, email)
                                    VALUES (?, ?, ?, ?)
                                  `;
                                                      conn.query(
                                                        sqlAgent,
                                                        [
                                                          propertyId,
                                                          agent.name ||
                                                            null,
                                                          agent.phone ||
                                                            null,
                                                          agent.email ||
                                                            null,
                                                        ],
                                                        (
                                                          agentErr
                                                        ) =>
                                                          cb(
                                                            agentErr ||
                                                              null
                                                          )
                                                      );
                                                    };

                                                  insertAgent(
                                                    (agentErr) => {
                                                      if (
                                                        agentErr
                                                      ) {
                                                        return conn.rollback(
                                                          () => {
                                                            conn.release();
                                                            res
                                                              .status(
                                                                500
                                                              )
                                                              .json({
                                                                error:
                                                                  "Danışman kaydedilemedi",
                                                              });
                                                          }
                                                        );
                                                      }

                                                      conn.commit(
                                                        (
                                                          commitErr
                                                        ) => {
                                                          if (
                                                            commitErr
                                                          ) {
                                                            console.error(
                                                              "commit err:",
                                                              commitErr
                                                            );
                                                            return conn.rollback(
                                                              () => {
                                                                conn.release();
                                                                res
                                                                  .status(
                                                                    500
                                                                  )
                                                                  .json({
                                                                    error:
                                                                      "Commit hatası",
                                                                  });
                                                              }
                                                            );
                                                          }
                                                          conn.release();
                                                          res.json(
                                                            {
                                                              message:
                                                                "✅ İlan eklendi",
                                                              propertyId,
                                                            }
                                                          );
                                                        }
                                                      );
                                                    }
                                                  );
                                                }
                                              );
                                            }
                                          );
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

/* =======================
   UPLOAD PHOTOS (ADMIN)
   POST /upload-photos
   ======================= */
app.post(
  "/upload-photos",
  authAdmin,
  upload.array("photos", 20),
  (req, res) => {
    const { propertyId } = req.body;
    const files = req.files || [];

    if (!propertyId)
      return res
        .status(400)
        .json({ error: "propertyId zorunludur" });
    if (!files.length)
      return res.status(400).json({
        error: "Yüklenecek fotoğraf bulunamadı",
      });

    const values = files.map((f) => [propertyId, f.filename]);
    const sql =
      "INSERT INTO property_photos (property_id, photo_url, created_at) VALUES " +
      values.map(() => "(?, ?, NOW())").join(", ");

    const flat = values.flat();

    db.query(sql, flat, (err) => {
      if (err) {
        console.error("upload-photos insert err:", err);
        return res.status(500).json({
          error: "Fotoğraflar veritabanına kaydedilemedi",
        });
      }

      const urls = files.map((f) =>
        normalizePhotoUrl(f.filename)
      );
      res.json({
        message: "✅ Fotoğraflar yüklendi",
        count: files.length,
        photos: urls,
      });
    });
  }
);

/* =======================
   SERVER LISTEN
   ======================= */
app.listen(PORT, () =>
  console.log(`🚀 Server ${PORT} portunda çalışıyor...`)
);