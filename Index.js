const WA = "573226747868";
const BASE = "https://surticapilar.com/wp-content/uploads/";
const JSONBIN_API = "https://api.jsonbin.io/v3";

// ── CONFIGURACIÓN JSONBIN ─────────────────────────────
// Guardamos la Master Key y el BIN ID en localStorage del navegador de tu mamá
// (esto no es datos del catálogo, es solo la config de conexión)
let JSONBIN_KEY = localStorage.getItem("sc_jb_key") || "";
let JSONBIN_BIN = localStorage.getItem("sc_jb_bin") || "";

function saveJsonbinConfig() {
    const key = document.getElementById("jsonbinKey").value.trim();
    const bin = document.getElementById("jsonbinBin").value.trim();
    if (!key) {
        alert("Por favor ingresa la Master Key de JSONBin");
        return;
    }
    JSONBIN_KEY = key;
    JSONBIN_BIN = bin;
    localStorage.setItem("sc_jb_key", key);
    if (bin) localStorage.setItem("sc_jb_bin", bin);
    showToast("Configuración guardada ✓");
    // Si no hay BIN todavía, crear uno nuevo con los productos actuales
    if (!bin) {
        syncToJsonbin(true);
    } else {
        loadFromJsonbin();
    }
}

function updateSetupVisibility() {
    const setup = document.getElementById("jsonbinSetup");
    if (JSONBIN_KEY) {
        setup.style.display = "none";
        // Pre-rellenar si existe config
        document.getElementById("jsonbinKey").value = JSONBIN_KEY;
        document.getElementById("jsonbinBin").value = JSONBIN_BIN;
    } else {
        setup.style.display = "block";
    }
}

function setSyncStatus(state, msg) {
    const wrap = document.getElementById("syncStatusWrap");
    if (!wrap) return;
    const colors = { ok: "ok", loading: "loading", error: "error" };
    wrap.innerHTML = `<div class="sync-status ${colors[state] || "loading"}">
          <div class="sync-dot"></div><span>${msg}</span></div>`;
}

// ── CARGAR PRODUCTOS DESDE JSONBIN ───────────────────
async function loadFromJsonbin() {
    if (!JSONBIN_KEY || !JSONBIN_BIN) return false;
    setSyncStatus("loading", "Cargando catálogo...");
    try {
        const res = await fetch(`${JSONBIN_API}/b/${JSONBIN_BIN}/latest`, {
            headers: { "X-Master-Key": JSONBIN_KEY },
        });
        if (!res.ok) throw new Error("Error " + res.status);
        const data = await res.json();
        if (data.record && Array.isArray(data.record)) {
            products = data.record;
            setSyncStatus("ok", "Catálogo sincronizado ✓");
            renderProducts();
            buildBanner();
            updateCartUI();
            return true;
        }
    } catch (e) {
        setSyncStatus(
            "error",
            "No se pudo conectar con JSONBin. Mostrando catálogo local.",
        );
    }
    return false;
}

// ── GUARDAR PRODUCTOS EN JSONBIN ─────────────────────
async function syncToJsonbin(createNew = false) {
    if (!JSONBIN_KEY) {
        alert(
            "Primero configura la Master Key de JSONBin en el panel de administrador.",
        );
        return false;
    }
    setSyncStatus("loading", "Guardando cambios...");
    try {
        let res;
        if (createNew || !JSONBIN_BIN) {
            // Crear nuevo BIN
            res = await fetch(`${JSONBIN_API}/b`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": JSONBIN_KEY,
                    "X-Bin-Name": "surticapilar-productos",
                    "X-Bin-Private": "false",
                },
                body: JSON.stringify(products),
            });
            if (!res.ok) throw new Error("Error " + res.status);
            const data = await res.json();
            JSONBIN_BIN = data.metadata.id;
            localStorage.setItem("sc_jb_bin", JSONBIN_BIN);
            document.getElementById("jsonbinBin").value = JSONBIN_BIN;
            alert(
                `✅ BIN creado exitosamente.\n\nGuarda este ID en un lugar seguro:\n${JSONBIN_BIN}\n\nSi cambias de dispositivo, necesitarás este ID y tu Master Key.`,
            );
        } else {
            // Actualizar BIN existente
            res = await fetch(`${JSONBIN_API}/b/${JSONBIN_BIN}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": JSONBIN_KEY,
                },
                body: JSON.stringify(products),
            });
            if (!res.ok) throw new Error("Error " + res.status);
        }
        setSyncStatus("ok", "Cambios guardados y visibles para todos ✓");
        return true;
    } catch (e) {
        setSyncStatus(
            "error",
            "Error al guardar: " +
            e.message +
            ". Revisa tu Master Key y BIN ID.",
        );
        return false;
    }
}

// ── DATOS INICIALES ──────────────────────────────────
const initialProducts = [
    {
        id: 1,
        name: "Flash Mask Mantenimiento de Color x300ml",
        price: 77800,
        cat: "mascarilla",
        img: BASE + "2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png",
        instock: true,
        sizes: [{ label: "300ml", price: 77800 }],
        desc: "Mascarilla de mantenimiento de color para cabello tratado. Mantiene la viveza y luminosidad del color.",
        brand: "Hair Lab",
    },
    {
        id: 2,
        name: "Acondicionador Glow x500ml",
        price: 64900,
        cat: "acondicionador",
        img: BASE + "2026/05/Copia-de-Copia-de-pagina-web-2-300x300.png",
        instock: true,
        desc: "Acondicionador con efecto brillo intenso. Hidrata y aporta luminosidad excepcional al cabello.",
        brand: "Yellow",
    },
    {
        id: 3,
        name: "Shampoo Hidro-Nutritivo x500ml",
        price: 62900,
        cat: "shampoo",
        img: BASE + "2026/05/Copia-de-Copia-de-pagina-web-4-300x300.png",
        instock: true,
        desc: "Shampoo con nutricion profunda e hidratacion intensa. Ideal para cabello seco y opaco.",
        brand: "Yellow",
    },
    {
        id: 4,
        name: "Molecular Serum x150ml",
        price: 62900,
        cat: "leavein",
        img: BASE + "2026/05/Copia-de-Copia-de-pagina-web-3-300x300.png",
        instock: true,
        desc: "Serum molecular de accion profunda. Repara, alisa y protege sin dejar residuo.",
        brand: "Organic Fiber",
    },
    {
        id: 5,
        name: "Protector Thermal Yellow x250ml",
        price: 69000,
        cat: "tratamiento",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-23-300x300.png",
        instock: true,
        desc: "Termoprotector Yellow que protege el cabello hasta 230C. Ideal antes del secado o planchado.",
        brand: "Yellow",
    },
    {
        id: 6,
        name: "Crema de Peinar Curly Yellow x200ml",
        price: 43900,
        cat: "leavein",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-22-300x300.png",
        instock: true,
        desc: "Crema definidora de rizos Yellow. Aporta definicion, hidratacion y control del frizz sin peso.",
        brand: "Yellow",
    },
    {
        id: 7,
        name: "Shampoo Curly Yellow x500ml",
        price: 62900,
        cat: "shampoo",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-21-300x300.png",
        instock: true,
        desc: "Shampoo Yellow especial para rizos. Limpia sin resecar, potencia la definicion y el brillo natural.",
        brand: "Yellow",
    },
    {
        id: 8,
        name: "Acondicionador Curly Yellow x500ml",
        price: 64900,
        cat: "acondicionador",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-20-300x300.png",
        instock: true,
        desc: "Acondicionador Yellow para rizos. Hidratacion profunda, desenreda y define sin pesar.",
        brand: "Yellow",
    },
    {
        id: 9,
        name: "Mascarilla Reparadora Yellow x300ml",
        price: 62900,
        cat: "mascarilla",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-19-300x300.png",
        instock: true,
        desc: "Mascarilla reparadora Yellow con keratina y proteinas. Restaura la fibra capilar danada.",
        brand: "Yellow",
    },
    {
        id: 10,
        name: "Shampoo Liss Yellow x500ml",
        price: 62900,
        cat: "shampoo",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-18-300x300.png",
        instock: true,
        desc: "Shampoo Yellow para cabello liso. Controla el frizz, aporta suavidad y brillo espejo.",
        brand: "Yellow",
    },
    {
        id: 11,
        name: "Mascarilla Nutritiva Yellow x200ml",
        price: 62900,
        cat: "mascarilla",
        img: BASE + "2026/01/Copia-de-Copia-de-pagina-web-17-300x300.png",
        instock: true,
        sizes: [
            { label: "200ml", price: 62900 },
            { label: "500ml", price: 85700 },
        ],
        priceMax: 85700,
        desc: "Mascarilla nutritiva Yellow. Aporta nutricion intensa, suavidad y brillo. Disponible en dos tamanios.",
        brand: "Yellow",
    },
    {
        id: 12,
        name: "Reparative Mask Reestructurante",
        price: 98900,
        cat: "mascarilla",
        img: BASE + "2025/12/Copia-de-Copia-de-pagina-web-10-300x300.png",
        instock: true,
        sizes: [
            { label: "200ml", price: 98900 },
            { label: "500ml", price: 170000 },
        ],
        priceMax: 170000,
        desc: "Mascarilla reestructurante de alto rendimiento. Reconstruye la fibra desde adentro, devuelve fuerza y elasticidad.",
        brand: "Yellow",
        badge: "Premium",
    },
    {
        id: 13,
        name: "Illuminating Mask 200ml",
        price: 106000,
        cat: "mascarilla",
        img: BASE + "2025/12/Copia-de-Copia-de-pagina-web-14-300x300.png",
        instock: true,
        desc: "Mascarilla nutritiva iluminadora. Aporta brillo espejo, suavidad y nutricion profunda al cabello opaco.",
        brand: "Yellow",
        badge: "Premium",
    },
    {
        id: 14,
        name: "Thermal Protector 300ml",
        price: 93500,
        cat: "tratamiento",
        img: BASE + "2025/12/Copia-de-Copia-de-pagina-web-15-300x300.png",
        instock: true,
        desc: "Termoprotector sin fijacion. Protege el cabello del calor hasta 230C con acabado suave y brillante.",
        brand: "Organic Fiber",
    },
    {
        id: 15,
        name: "Shampoo Hydratation Cuida Color Terra",
        price: 59700,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/SHAMPOO-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png",
        instock: true,
        sizes: [
            { label: "300ml", price: 59700 },
            { label: "1L", price: 120000 },
        ],
        priceMax: 120000,
        desc: "Shampoo Terra by Lendan para cabello color. Cuida el color, hidrata y aporta brillo sin danar la fibra.",
        brand: "Terra by Lendan",
    },
    {
        id: 16,
        name: "Shampoo Hydration Profunda Terra by Lendan",
        price: 59700,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/SHAMPOO-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png",
        instock: true,
        desc: "Shampoo de hidratacion profunda Terra by Lendan. Para cabello muy seco y deshidratado.",
        brand: "Terra by Lendan",
    },
    {
        id: 17,
        name: "Shampoo Cuero Cabelludo Muy Seco Terra",
        price: 55000,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/SHAMPOO-CUERO-CABELLUDO-MUY-SECO-TERRABY-LENDAN-300x300.png",
        instock: false,
        desc: "Shampoo especializado para cuero cabelludo seco. Alivia la irritacion y nutre en profundidad.",
        brand: "Terra by Lendan",
    },
    {
        id: 18,
        name: "Conditioner Hydratation Cuida Color Terra",
        price: 67000,
        cat: "acondicionador",
        img:
            BASE +
            "2025/05/CONDITIONER-HYDRATATION-CUIDA-COLOR-TERRA-BYLENDAN-300x300.png",
        instock: true,
        desc: "Acondicionador Terra by Lendan que cuida el color y aporta hidratacion intensa.",
        brand: "Terra by Lendan",
    },
    {
        id: 19,
        name: "Leave-In Tratamiento Profundo sin enjuague Terra",
        price: 63500,
        cat: "leavein",
        img: BASE + "2025/05/TERRA_CURLY_ACTIVATOR_275ml_-300x300.png",
        instock: true,
        desc: "Leave-In sin enjuague Terra by Lendan. Nutricion profunda que permanece en el cabello durante todo el dia.",
        brand: "Terra by Lendan",
    },
    {
        id: 20,
        name: "Tratamiento Reparador Profundo Terra",
        price: 55000,
        cat: "tratamiento",
        img:
            BASE +
            "2025/05/TRATAMIENTO-REPARADOR-PROFUNDO-TERRABY-LENDAN-300x300.png",
        instock: true,
        desc: "Tratamiento reparador intensivo Terra by Lendan. Reconstruye el cabello danado desde la raiz.",
        brand: "Terra by Lendan",
    },
    {
        id: 21,
        name: "Mascarilla Hydration Profunda Terra 500ml",
        price: 98900,
        cat: "mascarilla",
        img:
            BASE +
            "2025/05/MASCARILLA-HYDRATION-PROFUNDA-TERRA-BYLENDAN-300x300.png",
        instock: false,
        desc: "Mascarilla de hidratacion profunda Terra by Lendan. Para cabello extremadamente seco y danado.",
        brand: "Terra by Lendan",
    },
    {
        id: 22,
        name: "Mascarilla Nutricion Cuida Color Terra 500ml",
        price: 98900,
        cat: "mascarilla",
        img:
            BASE +
            "2025/05/MASCARILLA-NUTRICION-CUIDA-COLOR-TERRABY-LENDAN-500M-300x300.png",
        instock: true,
        desc: "Mascarilla Terra by Lendan que nutre y protege el color. Cabello brillante y vibrante.",
        brand: "Terra by Lendan",
    },
    {
        id: 23,
        name: "Shampoo Plex Forte N.4 x300ml",
        price: 57900,
        cat: "shampoo",
        img: BASE + "2025/05/SHAMPOO-PLEX-FORTE-N4-LENDAN-300x300.png",
        instock: true,
        desc: "Shampoo Lendan Plex Forte N.4. Recupera la fuerza del cabello y prepara para el tratamiento Plex.",
        brand: "Lendan",
    },
    {
        id: 24,
        name: "Acondicionador Plex Forte N.5 x300ml",
        price: 62900,
        cat: "acondicionador",
        img: BASE + "2025/05/ACONDICIONADOR-PLEX-FORTE-N5-LENDAN-300x300.png",
        instock: true,
        desc: "Acondicionador Lendan Plex Forte N.5. Recupera la fuerza y sellado del cabello tratado con Plex.",
        brand: "Lendan",
    },
    {
        id: 25,
        name: "Ampolla Reparacion Instantanea Plex Forte N.3",
        price: 39000,
        cat: "tratamiento",
        img: BASE + "2025/05/AMPOLLA-PLEX-FORTE-N3-LENDAN-300x300.png",
        instock: true,
        sizes: [
            { label: "1 ampolla (13ml)", price: 39000 },
            { label: "Caja x12", price: 186000 },
        ],
        priceMax: 186000,
        desc: "Ampolla Lendan Plex Forte N.3. Reparacion instantanea e intensiva. Ideal para servicios de salon.",
        brand: "Lendan",
    },
    {
        id: 26,
        name: "Tratamiento Termoprotector Plex Forte N.2",
        price: 69000,
        cat: "tratamiento",
        img:
            BASE +
            "2025/05/TRATAMIENTO-TERMOPROTECTORLENDAN-PLEX-FORTE-N2-300x300.png",
        instock: false,
        desc: "Termoprotector Lendan Plex Forte N.2. Proteccion termal y reparacion simultanea durante el peinado.",
        brand: "Lendan",
    },
    {
        id: 27,
        name: "Oleo Capilar Reparador Plex Forte N.6 75ml",
        price: 114000,
        cat: "oleo",
        img:
            BASE +
            "2025/05/OLEO-CAPILAR-REPARADOR-Y-PROTECTORLENDAN-PLEX-FORTE-N6-300x300.png",
        instock: true,
        desc: "Oleo Lendan Plex Forte N.6. Sellado y proteccion final del cabello reparado. Brillo y suavidad extrema.",
        brand: "Lendan",
    },
    {
        id: 28,
        name: "Mascarilla Salerm 21 Original",
        price: 33700,
        cat: "mascarilla",
        img:
            BASE +
            "2025/05/Salerm-21-Original-Hair-Lab-Salerm-Cosmetic-Mascarilla_surticapilar-300x300.png",
        instock: true,
        desc: "Mascarilla clasica Salerm 21. La favorita de los profesionales para brillo, suavidad y nutricion.",
        brand: "Salerm",
    },
    {
        id: 29,
        name: "Ampollas Concentradas Boost 21 Salerm 13ml",
        price: 18900,
        cat: "tratamiento",
        img:
            BASE +
            "2025/05/Salerm-21-Boost-Hair-Lab-Salerm-Cosmetic-Mascarilla_surticapilar-300x300.png",
        instock: false,
        sizes: [
            { label: "1 ampolla", price: 18900 },
            { label: "Caja x6", price: 85000 },
            { label: "Caja x12", price: 141900 },
        ],
        priceMax: 141900,
        desc: "Ampollas concentradas Salerm 21 Boost. Tratamiento intensivo de choque para cabello danado.",
        brand: "Salerm",
    },
    {
        id: 30,
        name: "Salerm 21 Jazmin y Ambar",
        price: 37500,
        cat: "mascarilla",
        img: BASE + "2025/05/SALERM-21-JAZMIN-AMBAR-300x300.png",
        instock: true,
        desc: "Version perfumada de Salerm 21 con aroma a Jazmin y Ambar. Misma formula clasica, fragancia irresistible.",
        brand: "Salerm",
    },
    {
        id: 31,
        name: "Mascarilla Nutricion Germen de Trigo 200ml",
        price: 65900,
        cat: "mascarilla",
        img:
            BASE + "2025/05/MASCARILLA-NUTRICION-GERMEN-DE-TRIGO-300x300.png",
        instock: true,
        desc: "Mascarilla Hair Lab con germen de trigo. Rica en vitamina E, nutre y fortalece el cabello debil.",
        brand: "Hair Lab",
    },
    {
        id: 32,
        name: "Mascarilla Lisos Anti Frizz Hair Lab 300ml",
        price: 55000,
        cat: "mascarilla",
        img:
            BASE +
            "2025/05/mascarilla_para_alisado_hair_lab_cosmetic-300x300.png",
        instock: true,
        desc: "Mascarilla anti-frizz Hair Lab. Controla el encrespamiento y mantiene el liso perfecto.",
        brand: "Hair Lab",
    },
    {
        id: 33,
        name: "Shampoo Control Caspa Hair Lab 300ml",
        price: 35000,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/Shampoo-Control-Caspa-Hair-Lab-Salerm-Cosmetic-Shampoo-300x300.png",
        instock: true,
        desc: "Shampoo anticaspa Hair Lab. Elimina la caspa y regula el cuero cabelludo graso.",
        brand: "Hair Lab",
    },
    {
        id: 34,
        name: "Shampoo Proteinico Fuerza y Reparacion Hair Lab",
        price: 35000,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/SHAMPOO-PROTEINICO-FUERZA-Y-REPARACION-HAIRLAB-300x300.png",
        instock: false,
        desc: "Shampoo proteinico Hair Lab. Fortalece y repara el cabello debilitado o con caida.",
        brand: "Hair Lab",
    },
    {
        id: 35,
        name: "Impermeabilizante Protector Capilar Hair Lab",
        price: 48900,
        cat: "tratamiento",
        img:
            BASE +
            "2025/05/Spray-Impermeabilizante-Hair-Lab-Salerm-Cosmetic-Spray_surticapilar-300x300.png",
        instock: true,
        desc: "Spray impermeabilizante Hair Lab. Protege el cabello del calor y la humedad, sellando la cuticula.",
        brand: "Hair Lab",
    },
    {
        id: 36,
        name: "Acondicionador Color Hair Lab 300ml",
        price: 45000,
        cat: "acondicionador",
        img:
            BASE +
            "2025/05/ACONDICIONADOR-HIDRATANTE-PROTECTOR-COLOR-HAIRLAB-300x300.png",
        instock: true,
        desc: "Acondicionador Hair Lab para cabello con color. Protege el tinte, hidrata y aporta brillo.",
        brand: "Hair Lab",
    },
    {
        id: 37,
        name: "Tratamiento Moisture Kick Bonacure 200ml",
        price: 82000,
        cat: "tratamiento",
        img: BASE + "2025/05/TRATAMIENTO-MOISTURE-KICK-BONACURE-300x300.png",
        instock: true,
        desc: "Tratamiento Schwarzkopf Bonacure Moisture Kick. Hidratacion intensa para cabello normal a seco.",
        brand: "Bonacure",
    },
    {
        id: 38,
        name: "Tratamiento Repair Rescue Bonacure 200ml",
        price: 82000,
        cat: "tratamiento",
        img: BASE + "2025/05/REPAIR-RESCUE-BONACURE-300x300.png",
        instock: false,
        desc: "Tratamiento Schwarzkopf Bonacure Repair Rescue. Reconstruye el cabello muy danado o sobre-procesado.",
        brand: "Bonacure",
    },
    {
        id: 39,
        name: "Mascarilla Nutrition Rich Lendan 500ml",
        price: 93500,
        cat: "mascarilla",
        img: BASE + "2025/05/MASCARILLA-NUTRITION-RICH-LENDAN-300x300.png",
        instock: false,
        desc: "Mascarilla Lendan Nutrition Rich. Nutricion extrema para cabello seco, grueso o rizado.",
        brand: "Lendan",
    },
    {
        id: 40,
        name: "Dark & Lovely Alisador Regular Sin Lejia",
        price: 69000,
        cat: "alisadora",
        img: BASE + "2025/05/Dark-LovelyDark-Lovely-Alisador-300x300.png",
        instock: true,
        desc: "Alisador Dark & Lovely Regular Sin Lejia. El clasico de confianza para relajar el cabello con suavidad.",
        brand: "Dark & Lovely",
    },
    {
        id: 41,
        name: "Dark & Lovely Super Alisador Sin Lejia",
        price: 64800,
        cat: "alisadora",
        img:
            BASE +
            "2025/05/Aliser-DarkLovely-Super-Sin-Lejia-1-Aplicacion-300x300.png",
        instock: false,
        wasPrice: 69400,
        desc: "Alisador Dark & Lovely Super Sin Lejia. Mayor fuerza para cabello resistente.",
        brand: "Dark & Lovely",
        badge: "Oferta",
    },
    {
        id: 42,
        name: "Just For Me Relajante Sin Lejia",
        price: 55700,
        cat: "alisadora",
        img:
            BASE +
            "2025/05/Just-For-Me-Relajante-sin-Lejia-1-Aplicacion-300x300.png",
        instock: false,
        wasPrice: 59900,
        desc: "Relajante Just For Me Sin Lejia. Formulado especialmente para el cabello de ninas. Fragancia a coco.",
        brand: "Just For Me",
        badge: "Oferta",
    },
    {
        id: 43,
        name: "Ultra Sheen Supreme Kit Relajante x2 Aplicaciones",
        price: 78300,
        cat: "alisadora",
        img:
            BASE +
            "2025/05/Ultra-Sheen-Supreme-Regular-Kit-Relajante-sin-lejia-2-aplicaciones-300x300.png",
        instock: false,
        desc: "Kit relajante Ultra Sheen Supreme. Dos aplicaciones incluidas para cabello grueso.",
        brand: "Ultra Sheen",
    },
    {
        id: 44,
        name: "SheaMoisture Champu Aceite de Ricino Negro 586ml",
        price: 95000,
        cat: "shampoo",
        img:
            BASE +
            "2025/05/SHEAMOISTURE-CHAMPU-ACEITE-RICINO-NEGRO-300x300.png",
        instock: false,
        desc: "Champu SheaMoisture con aceite de ricino negro jamaicano. Limpia, fortalece y nutre el cabello danado.",
        brand: "SheaMoisture",
    },
    {
        id: 45,
        name: "SheaMoisture Acondicionador Aceite de Ricino 384ml",
        price: 85000,
        cat: "acondicionador",
        img:
            BASE +
            "2025/05/SHEAMOISTURE-ACONDICIONADOR-ACEITE-RICINO-NEGRO-300x300.png",
        instock: false,
        desc: "Acondicionador SheaMoisture con aceite de ricino negro. Fortalece, restaura y suaviza el cabello.",
        brand: "SheaMoisture",
    },
    {
        id: 46,
        name: "SheaMoisture Mascarilla Miel de Manuka 326gr",
        price: 88000,
        cat: "mascarilla",
        img: BASE + "2025/05/SHEAMOISTURE-MASCARILLA-MIEL-MANUKA-300x300.png",
        instock: true,
        desc: "Mascarilla SheaMoisture con miel de manuka y aceite de mafura. Hidratacion profunda e intensa para rizos secos.",
        brand: "SheaMoisture",
    },
    {
        id: 47,
        name: "Leave-In Shea Miracle African Pride 425gr",
        price: 22900,
        cat: "leavein",
        img: BASE + "2025/05/LEAVE-IN-SHEA-MIRACLE-AFRIKAN-PRIDE-300x300.png",
        instock: false,
        desc: "Leave-In African Pride con Shea Miracle. Hidratacion sin enjuague para rizos y cabello natural.",
        brand: "African Pride",
    },
    {
        id: 48,
        name: "Leave-In Conditioner Olive African Pride 425gr",
        price: 20900,
        cat: "leavein",
        img:
            BASE +
            "2025/05/LEAVE-IN-CONDITIONER-OLIVE-AFRICAN-PRIDE-300x300.png",
        instock: false,
        desc: "Acondicionador sin enjuague African Pride con aceite de oliva. Suaviza y controla el frizz.",
        brand: "African Pride",
    },
    {
        id: 49,
        name: "Leave-In Aceite de Coco y Baobab African Pride",
        price: 38900,
        cat: "leavein",
        img:
            BASE +
            "2025/05/LEAVE-IN-ACEITE-COCO-BAOBAB-AFRICAN-PRIDE-300x300.png",
        instock: false,
        desc: "Leave-In African Pride con aceite de coco y baobab. Nutricion y definicion para el cabello natural.",
        brand: "African Pride",
    },
    {
        id: 50,
        name: "Aceite 5 Esencias African Pride 118ml",
        price: 38900,
        cat: "oleo",
        img: BASE + "2025/05/ACEITE-5-ESENCIAS-AFRIKAN-PRIDE-300x300.png",
        instock: false,
        desc: "Aceite con 5 esencias naturales African Pride. Nutre, brilla y sella el cabello en un solo paso.",
        brand: "African Pride",
    },
    {
        id: 51,
        name: "OGX Aceite de Argan de Marruecos 100ml",
        price: 53900,
        cat: "oleo",
        img: BASE + "2025/05/aceite-de-argan-OGX-300x300.png",
        instock: true,
        wasPrice: 68000,
        desc: "Aceite de argan OGX. Hidrata, brilla y suaviza. El favorito para un acabado profesional en casa.",
        brand: "OGX",
        badge: "Oferta",
    },
    {
        id: 52,
        name: "Oleo Extraordinario Elvive 100ml",
        price: 47300,
        cat: "oleo",
        img:
            BASE +
            "2025/05/OLEO-EXTRAORDINARIO-ACEITE-CAPILAR-ELVIVE-300x300.png",
        instock: true,
        desc: "Oleo Elvive Extraordinario. Nutre en profundidad sin pesar. Para todo tipo de cabello.",
        brand: "L'Oreal",
    },
    {
        id: 53,
        name: "Oleo Capilar Thyms 60ml",
        price: 19900,
        cat: "oleo",
        img: BASE + "2025/05/OLEO-CAPILAR-THYMS-300x300.png",
        instock: false,
        desc: "Oleo capilar Thyms con extractos naturales. Protege y embellece el cabello dia a dia.",
        brand: "Thyms",
    },
    {
        id: 54,
        name: "Termoprotector Leche Pal Pelo",
        price: 36500,
        cat: "tratamiento",
        img: BASE + "2025/05/TERMOPROTECTOR-LECHE-PAL-PELO-300x300.png",
        instock: true,
        desc: "Termoprotector Leche Pal Pelo. Protege el cabello del calor con una textura tipo leche ligera y facil de aplicar.",
        brand: "Leche Pal Pelo",
    },
    {
        id: 55,
        name: "Salerm 21 Jazmin y Ambar Leave-In",
        price: 37500,
        cat: "leavein",
        img: BASE + "2025/05/SALERM-21-JAZMIN-AMBAR-300x300.png",
        instock: true,
        desc: "Leave-in Salerm 21 con aroma Jazmin y Ambar. Nutricion y brillo con fragancia premium.",
        brand: "Salerm",
    },
    {
        id: 56,
        name: "Gorro Malla para Rulos – Negro",
        price: 37500,
        cat: "accesorio",
        img: BASE + "2025/05/GORRO-MALLA-REDECILLA-RULOS-NEGRO-300x300.png",
        instock: true,
        desc: "Gorro de malla para proteger los rulos o el cabello al dormir. Color negro, talla unica.",
        brand: "Accesorios",
    },
    {
        id: 57,
        name: "Gorro Tubi Malla Tejida",
        price: 28900,
        cat: "accesorio",
        img: BASE + "2025/05/GORRO-TUBI-MALLA-TEJIDA-300x300.png",
        instock: false,
        desc: "Gorro Tubi de malla tejida. Protege el cabello natural y los rizos durante el descanso.",
        brand: "Accesorios",
    },
    {
        id: 58,
        name: "Rulos 1 Pulgada 3/4 x12 unidades – Morado",
        price: 26000,
        cat: "accesorio",
        img: BASE + "2025/05/RULOS-1-PULGADA-TRES-CUARTO-MORADO-300x300.png",
        instock: true,
        desc: "Set de 12 rulos medianos de 1 3/4 pulgada en color morado. Rizos definidos y uniformes.",
        brand: "Accesorios",
    },
    {
        id: 59,
        name: "Rulos 2 Pulgadas x12 unidades – Verde Oscuro",
        price: 29500,
        cat: "accesorio",
        img: BASE + "2025/05/RULOS-2-PULGADAS-VERDE-OSCURO-300x300.png",
        instock: true,
        desc: "Set de 12 rulos grandes de 2 pulgadas. Perfectos para rizos amplios y voluminosos.",
        brand: "Accesorios",
    },
    {
        id: 60,
        name: "Rulos 2 Pulgadas y Medio x6 unidades",
        price: 25900,
        cat: "accesorio",
        img: BASE + "2025/05/RULOS-2-PULGADAS-MEDIO-300x300.png",
        instock: true,
        desc: "Set de 6 rulos extra grandes de 2.5 pulgadas. Para ondas amplias y cuerpo maximo.",
        brand: "Accesorios",
    },
    {
        id: 61,
        name: "Rulos Extra Grande 3 Pulgadas x6 unidades",
        price: 27900,
        cat: "accesorio",
        img: BASE + "2025/05/RULOS-EXTRA-GRANDE-3-PULGADAS-300x300.png",
        instock: false,
        desc: "Set de 6 rulos extra grandes de 3 pulgadas. Ideal para cabello muy largo o voluminoso.",
        brand: "Accesorios",
    },
];

let products = [...initialProducts];
const tagClasses = {
    shampoo: "t-shampoo",
    acondicionador: "t-acondicionador",
    mascarilla: "t-mascarilla",
    tratamiento: "t-tratamiento",
    leavein: "t-leavein",
    oleo: "t-oleo",
    alisadora: "t-alisadora",
    accesorio: "t-accesorio",
    tinte: "t-tinte",
};
const tagNames = {
    shampoo: "Shampoo",
    acondicionador: "Acondicionador",
    mascarilla: "Mascarilla",
    tratamiento: "Tratamiento",
    leavein: "Leave-In",
    oleo: "Oleo",
    alisadora: "Alisadora",
    accesorio: "Accesorio",
    tinte: "Tinte",
};
let cart = [],
    activeCat = "all",
    currentProduct = null,
    detailQty = 1,
    selectedSize = null;

// ── BANNER ────────────────────────────────────────────
function buildBanner() {
    const avail = products.filter((p) => p.instock);
    const bg = document.getElementById("bannerBg");
    if (bg)
        bg.innerHTML = avail
            .slice(0, 24)
            .map(
                (p) =>
                    `<img src="${p.img}" alt="" loading="lazy" onerror="this.style.display='none'">`,
            )
            .join("");
    ["bf1", "bf2", "bf3", "bf4", "bf5", "bf6", "bf7"].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && avail[i]) el.src = avail[i].img;
    });
}

function fmt(n) {
    return "$" + Math.round(n).toLocaleString("es-CO");
}

// ── FILTER + RENDER ───────────────────────────────────
function filterCat(cat, btn) {
    activeCat = cat;
    document
        .querySelectorAll(".cat")
        .forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    renderProducts();
}

function renderProducts() {
    const q = document
        .getElementById("srchInput")
        .value.toLowerCase()
        .trim();
    let list = products.filter((p) => {
        const mc = activeCat === "all" || p.cat === activeCat;
        const mq =
            !q ||
            p.name.toLowerCase().includes(q) ||
            (p.desc || "").toLowerCase().includes(q) ||
            (p.brand || "").toLowerCase().includes(q);
        return mc && mq;
    });
    const g = document.getElementById("grid");
    if (!list.length) {
        g.innerHTML =
            '<p style="color:#aaa;grid-column:1/-1;padding:2rem 0">No se encontraron productos.</p>';
        return;
    }
    g.innerHTML = list.map((p) => renderCard(p)).join("");
}

function renderCard(p) {
    const badgeHtml = p.badge
        ? `<span class="card-badge${p.badge === "Oferta" ? " sale" : ""}">${p.badge}</span>`
        : "";
    return `<div class="card" onclick="openDetail(${p.id})">
          <div class="card-img-wrap">
            <img class="card-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="card-img-err"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>${p.brand || ""}</span></div>
            ${badgeHtml}
          </div>
          <div class="card-body">
            <span class="card-tag ${tagClasses[p.cat] || "t-otro"}">${tagNames[p.cat] || p.cat}</span>
            <p class="card-name">${p.name}${p.wasPrice ? '<span class="on-sale-badge">Oferta</span>' : ""}</p>
            ${p.wasPrice ? `<span class="card-offer">${fmt(p.wasPrice)}</span>` : ""}
            ${p.priceMax ? `<p class="card-price-range">${fmt(p.price)} – ${fmt(p.priceMax)}</p>` : `<p class="card-price">${fmt(p.price)}</p>`}
            <button class="add-btn" onclick="event.stopPropagation();quickAdd(${p.id})" ${p.instock ? "" : "disabled"}>${p.instock ? "Añadir al carrito" : "Sin stock"}</button>
            ${!p.instock ? '<p class="outofstock-lbl">Producto agotado</p>' : ""}
          </div>
        </div>`;
}

// ── CART ──────────────────────────────────────────────
function quickAdd(id) {
    const p = products.find((x) => x.id === id);
    if (!p || !p.instock) return;
    addToCart(p, 1, p.sizes ? p.sizes[0].label : null);
    showToast("Producto añadido al carrito");
}

function addToCart(p, qty, sizeLabel) {
    const key = p.id + (sizeLabel || "");
    const price =
        p.sizes && sizeLabel
            ? p.sizes.find((s) => s.label === sizeLabel)?.price || p.price
            : p.price;
    const ex = cart.find((x) => x.key === key);
    if (ex) ex.qty += qty;
    else
        cart.push({
            key,
            id: p.id,
            name: p.name,
            img: p.img,
            price,
            sizeLabel,
            qty,
        });
    updateCartUI();
}

// FIX CARRITO: actualiza AMBOS badges (principal y en detalle)
function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    // Actualizar TODOS los badges del carrito en la página
    document
        .querySelectorAll("#cartBadge, #detailCartBadge")
        .forEach((el) => (el.textContent = count));

    const ci = document.getElementById("cpItems");
    const cf = document.getElementById("cpFoot");
    if (!cart.length) {
        ci.innerHTML = `<div class="empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Tu carrito está vacío</p></div>`;
        cf.style.display = "none";
        return;
    }
    cf.style.display = "block";
    document.getElementById("cpTotal").textContent = fmt(total);
    ci.innerHTML = cart
        .map(
            (i) => `
          <div class="ci">
            <img class="ci-img" src="${i.img}" alt="" onerror="this.style.background='#f0e0e5'">
            <div class="ci-info">
              <p class="ci-name">${i.name}</p>
              ${i.sizeLabel ? `<p class="ci-sub">${i.sizeLabel}</p>` : ""}
              <p class="ci-price">${fmt(i.price)}</p>
              <div class="ci-ctrl">
                <button class="cq" onclick="cqChange('${i.key}',-1)">−</button>
                <span style="font-size:.85rem;font-weight:600;min-width:18px;text-align:center">${i.qty}</span>
                <button class="cq" onclick="cqChange('${i.key}',1)">+</button>
                <button class="ci-rm" onclick="cRemove('${i.key}')">×</button>
              </div>
            </div>
          </div>`,
        )
        .join("");
}

function cqChange(key, d) {
    const i = cart.find((x) => x.key === key);
    if (!i) return;
    i.qty += d;
    if (i.qty <= 0) cart = cart.filter((x) => x.key !== key);
    updateCartUI();
}
function cRemove(key) {
    cart = cart.filter((x) => x.key !== key);
    updateCartUI();
}
function openCart() {
    document.getElementById("cartOverlay").classList.add("open");
    document.getElementById("cartPanel").classList.add("open");
}
function closeCart() {
    document.getElementById("cartOverlay").classList.remove("open");
    document.getElementById("cartPanel").classList.remove("open");
}

function sendCart() {
    if (!cart.length) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    let msg =
        "%C2%A1Hola! Quiero hacer el siguiente pedido en Surticapilar:%0A%0A";
    cart.forEach((i) => {
        msg += `%E2%80%A2 ${encodeURIComponent(i.name)}${i.sizeLabel ? " (" + encodeURIComponent(i.sizeLabel) + ")" : ""} x${i.qty} = ${encodeURIComponent(fmt(i.price * i.qty))}%0A`;
    });
    msg += `%0A*Total estimado: ${encodeURIComponent(fmt(total))}*%0A%0A%C2%BFComo coordino la compra?`;
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
}

// ── DETAIL PAGE ───────────────────────────────────────
function openDetail(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    currentProduct = p;
    detailQty = 1;
    selectedSize = p.sizes ? p.sizes[0].label : null;
    document.getElementById("detailNavTitle").textContent = p.name;
    const mainImg = document.getElementById("dMainImg");
    mainImg.src = p.img;
    document.getElementById("mainImgBox").classList.remove("is-zoomed");
    document.getElementById("dThumbs").innerHTML =
        `<div class="thumb active"><img src="${p.img}" alt="" onerror="this.parentElement.style.display='none'"></div>`;
    document.getElementById("dBrand").textContent = p.brand || "";
    document.getElementById("dName").textContent = p.name;
    document.getElementById("dDesc").textContent = p.desc || "";
    const catBadge = document.getElementById("dCatBadge");
    catBadge.textContent = tagNames[p.cat] || p.cat;
    catBadge.className = "d-cat-badge " + (tagClasses[p.cat] || "t-otro");
    const pw = document.getElementById("dPriceWrap");
    if (p.wasPrice) {
        pw.innerHTML = `<div style="display:flex;align-items:baseline;gap:10px"><span class="d-price">${fmt(p.sizes ? p.sizes[0].price : p.price)}</span><span style="text-decoration:line-through;color:#bbb;font-size:.95rem">${fmt(p.wasPrice)}</span></div>`;
    } else {
        pw.innerHTML = `<div class="d-price" id="dPriceLive">${fmt(p.sizes ? p.sizes[0].price : p.price)}</div>`;
    }
    const ds = document.getElementById("dSizes");
    if (p.sizes && p.sizes.length > 1) {
        ds.innerHTML = `<span class="d-label">Presentacion</span><div class="size-opts">${p.sizes.map((s, i) => `<button class="size-opt${i === 0 ? " sel" : ""}" onclick="selectSize(this,'${s.label}',${s.price})">${s.label}</button>`).join("")}</div>`;
        ds.style.display = "block";
    } else {
        ds.style.display = "none";
        ds.innerHTML = "";
    }
    document.getElementById("dQty").textContent = "1";
    const addBtn = document.getElementById("detailAddBtn");
    addBtn.disabled = !p.instock;
    addBtn.textContent = p.instock ? "Añadir al carrito" : "Sin stock";
    renderSimilar(p);
    document.getElementById("detailPage").classList.add("open");
    window.scrollTo(0, 0);
}

function closeDetail() {
    document.getElementById("detailPage").classList.remove("open");
}

function renderSimilar(p) {
    const similar = products
        .filter(
            (x) => x.id !== p.id && (x.cat === p.cat || x.brand === p.brand),
        )
        .slice(0, 8);
    const sg = document.getElementById("similarGrid");
    sg.innerHTML = similar.length
        ? similar.map((s) => renderCard(s)).join("")
        : '<p style="color:#aaa;font-size:.85rem">No hay productos similares en este momento.</p>';
}

function selectSize(btn, label, price) {
    selectedSize = label;
    document
        .querySelectorAll(".size-opt")
        .forEach((b) => b.classList.remove("sel"));
    btn.classList.add("sel");
    const pl = document.getElementById("dPriceLive");
    if (pl) pl.textContent = fmt(price);
}
function changeDetailQty(d) {
    detailQty = Math.max(1, detailQty + d);
    document.getElementById("dQty").textContent = detailQty;
}
function addFromDetail() {
    if (!currentProduct || !currentProduct.instock) return;
    addToCart(currentProduct, detailQty, selectedSize);
    showToast("Producto añadido al carrito");
}
function waFromDetail() {
    if (!currentProduct) return;
    const p = currentProduct;
    const price =
        p.sizes && selectedSize
            ? p.sizes.find((s) => s.label === selectedSize)?.price || p.price
            : p.price;
    const total = price * detailQty;
    const msg = `%C2%A1Hola! Me interesa este producto de Surticapilar:%0A%0A%E2%80%A2 *${encodeURIComponent(p.name)}*${selectedSize ? " (" + encodeURIComponent(selectedSize) + ")" : ""}%0AUnidades: ${detailQty}%0ATotal estimado: ${encodeURIComponent(fmt(total))}%0A%0A%C2%BFComo coordino la compra?`;
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
}

// ── ZOOM ─────────────────────────────────────────────
function handleZoom(e) {
    const box = document.getElementById("mainImgBox");
    const img = document.getElementById("dMainImg");
    const rect = box.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    img.style.transform = `scale(2.5)`;
    box.classList.add("is-zoomed");
}
function handleZoomTouch(e) {
    e.preventDefault();
    const t = e.touches[0];
    handleZoom({ clientX: t.clientX, clientY: t.clientY });
}
function resetZoom() {
    const box = document.getElementById("mainImgBox");
    const img = document.getElementById("dMainImg");
    img.style.transform = "scale(1)";
    box.classList.remove("is-zoomed");
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
}

// ── ADMIN PANEL ───────────────────────────────────────
function toggleAdminPanel() {
    const container = document.getElementById("adminContainer");
    container.classList.toggle("open");
    if (container.classList.contains("open")) {
        updateSetupVisibility();
        // Si ya tiene configuración, intentar cargar desde JSONBin
        if (JSONBIN_KEY && JSONBIN_BIN) loadFromJsonbin();
        renderAdminTable();
    }
}

function renderAdminTable() {
    const tbody = document.getElementById("adminTableBody");
    tbody.innerHTML = products
        .map(
            (p) => `
          <tr>
            <td><strong>${p.brand || ""}</strong> – ${p.name}</td>
            <td>${fmt(p.price)}</td>
            <td>${p.instock ? "🟢 Con Stock" : "🔴 Agotado"}</td>
            <td style="display:flex;gap:4px;flex-wrap:wrap">
              <button class="btn-stock" onclick="toggleStockAdmin(${p.id})">${p.instock ? "Agotar" : "Reponer"}</button>
              <button class="btn-edit" onclick="openEditModal(${p.id})">Editar</button>
              <button class="btn-del" onclick="deleteProductAdmin(${p.id})">Eliminar</button>
            </td>
          </tr>`,
        )
        .join("");
}

async function toggleStockAdmin(id) {
    const p = products.find((x) => x.id === id);
    if (p) {
        p.instock = !p.instock;
        await saveProductsState();
    }
}

async function deleteProductAdmin(id) {
    if (
        confirm("¿Seguro que deseas eliminar este producto del catálogo?")
    ) {
        products = products.filter((x) => x.id !== id);
        await saveProductsState();
    }
}

async function addProductAdmin() {
    const name = document.getElementById("admName").value.trim();
    const price = parseFloat(document.getElementById("admPrice").value);
    const cat = document.getElementById("admCat").value;
    const brand = document.getElementById("admBrand").value.trim();
    const desc = document.getElementById("admDesc").value.trim();
    const imgUrl = document.getElementById("admImg").value.trim();
    if (!name || !price) {
        alert("Por favor escribe al menos el Nombre y el Precio.");
        return;
    }
    const newId = products.length
        ? Math.max(...products.map((x) => x.id)) + 1
        : 1;
    products.unshift({
        id: newId,
        name,
        price,
        cat,
        img:
            imgUrl ||
            BASE + "2026/05/Copia-de-Copia-de-pagina-web-1-300x300.png",
        instock: true,
        brand,
        desc,
    });
    ["admName", "admPrice", "admBrand", "admDesc", "admImg"].forEach(
        (id) => (document.getElementById(id).value = ""),
    );
    await saveProductsState();
    showToast("¡Producto agregado!");
}

// ── MODAL EDITAR ──────────────────────────────────────
function openEditModal(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    document.getElementById("editId").value = id;
    document.getElementById("editName").value = p.name;
    document.getElementById("editPrice").value = p.price;
    document.getElementById("editBrand").value = p.brand || "";
    document.getElementById("editCat").value = p.cat;
    document.getElementById("editDesc").value = p.desc || "";
    document.getElementById("editImg").value = p.img || "";
    document.getElementById("editModal").classList.add("open");
}
function closeEditModal() {
    document.getElementById("editModal").classList.remove("open");
}
async function saveEdit() {
    const id = parseInt(document.getElementById("editId").value);
    const p = products.find((x) => x.id === id);
    if (!p) return;
    p.name = document.getElementById("editName").value.trim();
    p.price = parseFloat(document.getElementById("editPrice").value);
    p.brand = document.getElementById("editBrand").value.trim();
    p.cat = document.getElementById("editCat").value;
    p.desc = document.getElementById("editDesc").value.trim();
    const newImg = document.getElementById("editImg").value.trim();
    if (newImg) p.img = newImg;
    closeEditModal();
    await saveProductsState();
    showToast("Cambios guardados ✓");
}

// ── GUARDAR ESTADO (JSONBin + localStorage como respaldo) ──
async function saveProductsState() {
    // Siempre guardar en localStorage como respaldo local
    localStorage.setItem("sc_products_backup", JSON.stringify(products));
    // Intentar sincronizar con JSONBin si está configurado
    if (JSONBIN_KEY && JSONBIN_BIN) {
        await syncToJsonbin(false);
    } else if (JSONBIN_KEY && !JSONBIN_BIN) {
        await syncToJsonbin(true); // crear BIN nuevo
    } else {
        setSyncStatus(
            "error",
            "⚠️ JSONBin no configurado. Los cambios solo se guardan en este dispositivo.",
        );
    }
    renderProducts();
    buildBanner();
    renderAdminTable();
    updateCartUI();
}

// ── INIT ──────────────────────────────────────────────
async function init() {
    // Intentar cargar desde JSONBin si está configurado
    if (JSONBIN_KEY && JSONBIN_BIN) {
        const loaded = await loadFromJsonbin();
        if (!loaded) {
            // Si falla JSONBin, usar respaldo local
            const backup = localStorage.getItem("sc_products_backup");
            if (backup) {
                try {
                    products = JSON.parse(backup);
                } catch (e) { }
            }
        }
    } else {
        // Sin JSONBin, usar respaldo local si existe
        const backup = localStorage.getItem("sc_products_backup");
        if (backup) {
            try {
                products = JSON.parse(backup);
            } catch (e) { }
        }
    }
    buildBanner();
    renderProducts();
    updateCartUI();
}

init();