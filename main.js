/* =====================================================================
   GLOBAL BRIDGE ACAI · CONSULTORES ADUANALES
   main.js · Vanilla JS, sin dependencias

   Índice
   01. Utilidades
   02. Datos del globo (continentes, puertos, rutas)
   03. Motor del globo 3D (canvas 2D)
   04. Loader
   05. Scroll suave + bucle de animación
   06. Header, menú móvil y navegación
   07. Revelado al hacer scroll, titulares y contadores
   08. Efectos de puntero (tilt, spotlight, magnético, cursor)
   09. Proceso (línea de tiempo)
   10. Cobertura (globo interactivo)
   11. FAQ
   12. Formulario → WhatsApp
   13. WhatsApp flotante y detalles finales
   14. Avisos y noticias (datos en avisos.js)
   15. Arranque
   ===================================================================== */
(() => {
    'use strict';

    /* ------------------------------------------------------------------
       01. UTILIDADES
    ------------------------------------------------------------------ */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const TAU = Math.PI * 2;
    const DEG = Math.PI / 180;
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isMobile = () => window.innerWidth < 900;

    /* Número de WhatsApp del negocio (formato internacional sin "+") */
    const WA_NUMBER = '523141164135';

    const store = {
        get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* almacenamiento bloqueado */ } }
    };

    /* Promesa que se resuelve cuando el loader termina (para sincronizar intros) */
    let resolveReady;
    const ready = new Promise((res) => { resolveReady = res; });

    /* ------------------------------------------------------------------
       02. DATOS DEL GLOBO
       Máscara de tierra 360x180 (1°) empaquetada en bits y codificada en base64.
       Fuente: Natural Earth 110m (dominio público).
    ------------------------------------------------------------------ */
    const LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///8AAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////n///////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////7////////wAAAAA/gAABwAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAA///+A////////AAAAB//wAAAAAAAAAAH8gAAAAAAAAAAAAAAAAAAAAAAAcH3H//w////////+AAAAA/mAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAA4YABwP/Af///////+AAAAAPGAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAD4DA8+f+AP///////8AAAAAAAAAAAAAfwAAAAH/8AAAAAAAAAAAAAAAAAAAAAH/w83/8AAAf/////8AAAAAAAAAAAAH+AAAB////AAAB/gAAAAAAAAAAAAAAMA4AAw/8AAAP/////8AAAAAAAAAAAAeAAAAP///8AAAAAAAAAAAAAAAAAAAAf+AYe+d/gAAD/////4AAAAAAAAAAAB4AAAH/////+HwAOAAAAAAAAAAAAAAAf/+4/4//wAAB/////wAAAAAAAAAAADwAHk////////4Af4AAAAAwAAAAAAAAff/4O4///AAB/////wAAAAAAAAAAADwAf/////////4///gAAAAAAA//gAAAAP/+B8f//8AB/////wAAAAAAB/gAAAAAfv/////////////8AAAAAB///+P//H//n+D4f+AA/////AAAAAAA//8AAAA8fv///////////////P+wAP////////R+Hfz4f+AAf///4AAAAAAD///4ID/////////////////////8AD/////////////4Z/wA///4AAAAAAAP///+M////v//////////////////4H/////////////gD/8A///wAQYAAAAf///+v///////////////////////4f////////////+A/+4Af/8AA/8AAAA/8f+D///////////////////////BgP////////////3w//gAP/wAAf8AAAD/4/+f//////////////////////+AEB////////////DYA/gAP/gAADAAAAH/z/////////////////////////+AAH///////////8AwwPAAD/AAAAAAAA//H/////////////////////////+AAP///////////4AA/gAAB/AAAAAAAB//H//////////////////////3v/AAAP//z////////wAA/4AAAOAAAAAAAB//D/////////////////////+A/4AAAA/7AH///////wAA/4wAAAAAAAAAAB//g/////////////////////+DwAAAAAL4AA///////4AA//4AAAAAAAAAYA5+A///////////////////4AAHgAAAAAD4AAD//////8AAf/8AAAAAAAAA8AA+C///////////////////wAAfgAAAAAOAAAB///////wAf/+AAAAAAAAA8AO8H///////////////////AAA/gAAAABwAAAA///////+A///AAAAAAAAA8ANwH//////////////////+AAB/AAAAACAAAAAf///////x///4AAAAAAAHOAOD///////////////////+AAB+AAAAAAAAAABP///////x///8AAAAAAAPPB//////////////////////+AA8AAAAAAAAAAAH///////5///8AAAAAAAOfz//////////////////////+AA4AAAAAAAAAAAD///////////8AAAAAAAAfn//////////////////////+AAwAAAAAAAAAAAD///////////sAAAAAAAAcf//////////////////////7AAAAAAAAAAAAAAB/////////+APAAAAAAAAD///////////////////////7AAAAAAAAAAAAAAAf/////////gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAf/////////gfgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAP/////////5AAAAAAAAAD//////v/x//////////////DAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB/////Hf/B/////////////+AAAAAAAAAAAAAAAAP////////84AAAAAAAAAD//n/+AP+H/////////////8HAAAAAAAAAAAAAAAP////////wAAAAAAAAAH//jz/+AD+H/////////////4HwAAAAAAAAAAAAAAf////////wAAAAAAAAAH/4F4/8AB/B////////////+APAAAAAAAAAAAAAAAP////////wAAAAAAAAAH/4A+f+Ph/g////////////8AIAAAAAAAAAAAAAAAP///////+AAAAAAAAAAH/gMPfP///x////////////4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/AMGOP///h//////////+ZwAMAAAAAAAAAAAAAAAH///////4AAAAAAAAAAP/AAGHP///g//////////8B4AYAAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AAcHH///w//////////+w4A4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAB8f+ACD///////////////g8D4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAz/+AAAE//////////////A4f4AAAAAAAAAAAAAAAB///////gAAAAAAAAAAB//+AAAA//////////////Ax/gAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gD4AAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4GAB//////////////gDAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAP///8P4z//////////////wCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP/////////////////////wAAAAAAAAAAAAAAAAAAABf//zgYAAAAAAAAAAAP/////////v///////////wAAAAAAAAAAAAAAAAAAAAv//AAcAAAAAAAAAAA//////////n///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////9//j///////////gAAAAAAAAAAAAAAAAAAAAb/+AAMgAAAAAAAAAD///////8//wv//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAMAAAAAAAAAAH///////+f/8b//////////AAAAAAAAAAAAAAAAAAAAAM/+AAAAAAAAAAAAAH///////+f/84Af///////+wAAAAAAAAAAAAAAAAAAAAGf8AAAAAAAAAAAAAP////////P//+AP///////4wAAAAAAAAAAAAAAAAAAAAAP8AA/AAAAAAAAAAf////////n///AH///////ggAAAAAAAAAAAAAAAAAAAAAP+A4BgAAAAAAAAAf////////n///AD//+P//8AAAAAAAAAAAAAAAAAAAAAAAP+B4A4AAAAAAAAAf////////j//+AAf/4P/+IAAAAAAAAAAAAAAAgAAAAAAAH/B4AB4AAAAAAAAf////////j//8AAf/wH/8YAAAAAAAAAAAAAAAAAAAAAAAD//wAj5AAAAAAAAP////////x//4AAf/AD/8QAQAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAP////////4//wAAf+AD/+AA4AAAAAAAAAAAAAAAAAAAAAAP/wAAAAAAAAAAAf////////4f+AAAf8AD//AA4AAAAAAAAAAAAAAAAAAAAAAAP/AAAAAAAAAAAf////////8f8AAAP4AAP/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fwAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAf/////////+AAAAPwAAP/wA8AAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAf/////////4AAAAHwAAN/gACAAAAAAAAAAAAAAAAAAAAAAAADAB4AAAAAAAAP/////////g4AAAHwAAMfgALAAAAAAAAAAAAAAAAAAAAAAAADgP/eAAAAAAAH//////////4AAADwAAIPAAOAAAAAAAAAAAAAAAAAAAAAAAAByP/+AAAAAAAD//////////4AAADoAAMEAAFAAAAAAAAAAAAAAAAAAAAAAAAA9///AAAAAAAB//////////wAAABMAAMAAAHgAAAAAAAAAAAAAAAAAAAAAAAAM///wAAAAAAB//////////wAAAAMAAGAAAPgAAAAAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAf/////////gAAAAMAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAAADgAeAAAAAAAAAAAAAAAAAAAAAAAAAAA////wAAAAAACAA///////AAAAAAAAzwA+AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAH/////+AAAAAAAAZwB8AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAH/////8AAAAAAAAfwH8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAHwf8AYAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////wAAAAAAAAHwf8+YAAAAAAAAAAAAAAAAAAAAAAAAH/////AAAAAAAAAH/////gAAAAAAAADwf9AAgAAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAAD4P54BwAAAAAAAAAAAAAAAAAAAAAAAH//////AAAAAAAAD////+AAAAAAAAAB8P5wA74AAAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAB////8AAAAAAAAAA8Ax4gf/AIAAAAAAAAAAAAAAAAAAAAH//////+AAAAAAAB////8AAAAAAAAAAcAB4AH/wYAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAAAA/5wAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAHkAAAA/8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/8AAAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///8AAAAAAAAAAADmhgAvMAAAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///8AAAAAAAAAAAAAiAAAHACAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAf///+AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+DAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAA////+AwAAAAAAAAAAAAD8HAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+BwAAAAAAAAAAAB38HgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////+DwAAAAAAAAAAAD/+HwAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAB////8PwAAAAAAAAAAAH//HwAAAABAAAAAAAAAAAAAAAAAA/////4AAAAAAAB////wPwAAAAAAAAAAAP///wAAAACAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////gPgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAH////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf/////AAGAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAP///AfAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAP//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAP//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//4AAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/4AAAAAAAAAAAAAAf8AH//wAAAAAAAAAAAAAAAAAAAAAA///AAAAAAAAAAAAcAAAAAAAAAAAAAAAPAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAwAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADYAAAA+AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAADQAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH8AAAAGAB4P4Pz+AAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAB//jAAH//////////wAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAACA////4Af///////////gAAAAAAAAAAAAAAAAAAAAAA/4AAAAAAAAAAAAAAAP3////8D/////////////4AAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAB+/////////4f//////////////wAAAAAAAAAAAAAAAAAAAH/+AAAAAAAAf////////////4////////////////4AAAAAAAAAAAAAA8AAAA7+AAAAAAAB//////////////////////////////4AAAAAAAAAADAAB///nj/+AAAAAAAP//////////////////////////////wAAAAAAAA////4Af/////8AAAAAAAP/////////////////////////////8AAAAAAAD/////////////gAAAAAAD//////////////////////////////wAAAAAAAP////////////wAAAAAAf///////////////////////////////wAAAAAD/////////////4AAAAAAD////////////////////////////////wAAAABx/////////////gAAAD8A/////////////////////////////////+AAAAAwD////////////gAAAH+Af///////////////////////////////+AAAAAAAAH////////////gfA/4AA///////////////////////////////+AAAAAAAf//////////////4ADg//////////////////////////////////AAAAAAAH///////////////h////////////////////////////////////4AAAAAAH/////////////////////////////////////////////////////gAAAA///////////////////////////////////////////////////////gAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

    let landMask = null;
    function getLandMask() {
        if (landMask) return landMask;
        const bin = atob(LAND_B64);
        const W = 360, H = 180;
        landMask = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
            landMask[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
        }
        return landMask;
    }
    function isLand(lat, lon) {
        const m = getLandMask();
        const x = ((Math.floor(lon + 180) % 360) + 360) % 360;
        const y = clamp(Math.floor(90 - lat), 0, 179);
        return m[y * 360 + x] === 1;
    }
    const toVec = (lat, lon) => {
        const la = lat * DEG, lo = lon * DEG, c = Math.cos(la);
        return [c * Math.sin(lo), Math.sin(la), c * Math.cos(lo)];
    };

    /* Puntos de tierra distribuidos de forma uniforme sobre la esfera */
    let landDotsCache = null;
    function getLandDots(step = 2.1) {
        if (landDotsCache) return landDotsCache;
        const out = [];
        let ring = 0;
        for (let lat = -84; lat <= 84; lat += step, ring++) {
            const n = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / step));
            for (let i = 0; i < n; i++) {
                const lon = -180 + ((i + (ring % 2) * 0.5) * 360) / n;
                if (isLand(lat, lon)) out.push(...toVec(lat, lon));
            }
        }
        landDotsCache = new Float32Array(out);
        return landDotsCache;
    }

    const HUB = { name: 'Manzanillo', lat: 19.05, lon: -104.32 };
    const PORTS = [
        { n: 'Shanghái', lat: 31.23, lon: 121.47, lane: 'asia' },
        { n: 'Busan', lat: 35.10, lon: 129.04, lane: 'asia' },
        { n: 'Yokohama', lat: 35.44, lon: 139.64, lane: 'asia' },
        { n: 'Shenzhen', lat: 22.54, lon: 114.06, lane: 'asia' },
        { n: 'Singapur', lat: 1.26, lon: 103.82, lane: 'asia' },
        { n: 'Los Ángeles', lat: 33.74, lon: -118.27, lane: 'norte' },
        { n: 'Houston', lat: 29.73, lon: -95.27, lane: 'norte' },
        { n: 'Nueva York', lat: 40.66, lon: -74.0, lane: 'norte' },
        { n: 'Vancouver', lat: 49.29, lon: -123.11, lane: 'norte' },
        { n: 'Róterdam', lat: 51.95, lon: 4.14, lane: 'europa' },
        { n: 'Hamburgo', lat: 53.54, lon: 9.97, lane: 'europa' },
        { n: 'Valencia', lat: 39.45, lon: -0.32, lane: 'europa' },
        { n: 'Algeciras', lat: 36.13, lon: -5.45, lane: 'europa' },
        { n: 'Panamá', lat: 8.95, lon: -79.57, lane: 'latam' },
        { n: 'Cartagena', lat: 10.39, lon: -75.51, lane: 'latam' },
        { n: 'Callao', lat: -12.05, lon: -77.15, lane: 'latam' },
        { n: 'Valparaíso', lat: -33.03, lon: -71.62, lane: 'latam' },
        { n: 'Santos', lat: -23.96, lon: -46.33, lane: 'latam' }
    ];

    /* Vista (centro del globo) al elegir cada corredor */
    const LANE_VIEW = {
        asia: { lon: -170, tilt: 44 },
        norte: { lon: -100, tilt: 36 },
        europa: { lon: -50, tilt: 30 },
        latam: { lon: -84, tilt: 2 }
    };
    const LANE_COPY = {
        asia: ['Asia-Pacífico', 'El corredor más dinámico de Manzanillo. Coordinamos importaciones desde China, Corea, Japón y el Sudeste Asiático con documentación impecable y clasificación precisa.'],
        norte: ['Norteamérica', 'Operaciones con Estados Unidos y Canadá bajo el marco del T-MEC: preferencias arancelarias y certificados de origen bien sustentados.'],
        europa: ['Europa', 'Importa y exporta con el Viejo Continente con cumplimiento regulatorio sólido, clasificación arancelaria precisa y trámites ordenados.'],
        latam: ['Latinoamérica', 'Conecta con Panamá, Colombia, Perú, Chile y Brasil, aprovechando los acuerdos comerciales vigentes entre México y la región.']
    };

    /* ------------------------------------------------------------------
       03. MOTOR DEL GLOBO 3D  (canvas 2D, proyección ortográfica)
    ------------------------------------------------------------------ */
    function makeArc(a, b, N = 56) {
        const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
        const om = Math.acos(dot);
        const so = Math.sin(om) || 1e-6;
        const alt = 0.045 + 0.27 * (om / Math.PI);
        const pts = new Float32Array((N + 1) * 3);
        for (let i = 0; i <= N; i++) {
            const t = i / N;
            const k1 = Math.sin((1 - t) * om) / so;
            const k2 = Math.sin(t * om) / so;
            const h = 1 + alt * Math.sin(Math.PI * t);
            pts[i * 3] = (k1 * a[0] + k2 * b[0]) * h;
            pts[i * 3 + 1] = (k1 * a[1] + k2 * b[1]) * h;
            pts[i * 3 + 2] = (k1 * a[2] + k2 * b[2]) * h;
        }
        return pts;
    }

    class GlobeScene {
        /**
         * cfg.hero        → capa extra: cintas de luz, red de nodos y partículas
         * cfg.layout(w,h) → { cx, cy, R }
         * cfg.interactive → arrastre con puntero
         */
        constructor(canvas, cfg) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.cfg = cfg;
            this.hero = !!cfg.hero;
            this.interactive = !!cfg.interactive;
            // Con "reducir animaciones" activo en el equipo, el globo SIGUE girando (es la animación de marca
            // que el cliente espera ver), pero a ritmo más calmado y sin parallax de puntero ni giro por scroll.
            this.calm = reduceMotion;
            this.lon = cfg.lon;
            this.tilt = cfg.tilt;
            this.baseSpeed = cfg.speed;       // °/s (la Tierra gira hacia el este: lon disminuye)
            this.spin = cfg.spinUp || 0;      // impulso inicial que decae
            this.target = null;
            this.lane = cfg.lane || null;
            this.visible = false;
            this.dragging = false;
            this.vLon = 0;
            this.idleFor = 99;
            this.free = true;
            this.mouse = { x: 0, y: 0, sx: 0, sy: 0 };
            this.scrollP = 0;
            this.extraLon = 0;
            this.time = 0;
            this._p = new Float32Array(5);
            this.W = 0; this.H = 0; this.dpr = 1;
            this.cx = 0; this.cy = 0; this.R = 100;

            this.dots = getLandDots(cfg.dotStep || 2.1);
            this.buildNodes();
            this.buildArcs();
            this.buildParticles();
            this.bindPointer();
            this.resize();
        }

        /* ---- construcción de datos ---- */
        buildNodes() {
            // Nodos dorados = puntos de tierra que "parpadean" como centros de datos
            const n = this.dots.length / 3;
            const count = this.hero ? 46 : 30;
            this.nodeIdx = [];
            for (let i = 0; i < count; i++) this.nodeIdx.push(Math.floor(Math.random() * n));
            this.nodePh = this.nodeIdx.map(() => Math.random() * TAU);
        }

        buildArcs() {
            const hub = toVec(HUB.lat, HUB.lon);
            this.hubVec = hub;
            const list = this.cfg.ports || PORTS;
            this.arcs = list.map((p, i) => ({
                port: p,
                vec: toVec(p.lat, p.lon),
                pts: makeArc(hub, toVec(p.lat, p.lon)),
                phase: Math.random(),
                speed: 0.16 + Math.random() * 0.14,
                gold: i % 3 !== 1
            }));
        }

        buildParticles() {
            const n = this.hero ? (isMobile() ? 34 : 70) : 26;
            this.parts = Array.from({ length: n }, () => ({
                x: Math.random(), y: Math.random(),
                z: 0.3 + Math.random() * 0.9,
                vx: (Math.random() - 0.5) * 0.004,
                vy: -0.002 - Math.random() * 0.006,
                ph: Math.random() * TAU,
                gold: Math.random() < 0.55
            }));
            this.netNodes = Array.from({ length: isMobile() ? 16 : 26 }, () => ({
                a: Math.random() * TAU,
                r: 1.12 + Math.random() * 1.0,
                sp: (Math.random() - 0.5) * 0.06,
                ph: Math.random() * TAU
            }));
        }

        /* ---- tamaño ---- */
        resize() {
            const rect = this.canvas.getBoundingClientRect();
            const W = Math.max(1, Math.round(rect.width));
            const H = Math.max(1, Math.round(rect.height));
            this.dpr = this.lite ? 1 : Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 1.75);
            this.W = W; this.H = H;
            this.canvas.width = Math.round(W * this.dpr);
            this.canvas.height = Math.round(H * this.dpr);
            const l = this.cfg.layout(W, H);
            this.cx = l.cx; this.cy = l.cy; this.R = l.R;
            // ribbons: gradientes reutilizables
            this.ribbons = null;
            if (this.hero) this.buildRibbons();
            if (!this.visible) this.render(0, 0);
        }

        /* Modo ligero: menos resolución y menos hilos de luz (ver watchPerf) */
        setLite() {
            this.lite = true;
            this.resize();
        }

        buildRibbons() {
            const { W, H, ctx } = this;
            const defs = [
                { ax: -0.12, ay: 1.02, bx: 1.12, by: 0.02, amp: 0.20, ph: 0.0, col: '94,234,240', a: 0.55, w: 1 },
                { ax: -0.12, ay: 0.72, bx: 1.12, by: -0.12, amp: 0.16, ph: 2.1, col: '127,214,216', a: 0.38, w: 0.8 },
                { ax: 0.1, ay: 1.12, bx: 1.12, by: 0.42, amp: 0.14, ph: 4.2, col: '227,196,111', a: 0.30, w: 0.7 }
            ];
            this.ribbons = defs.map((d) => {
                const g = ctx.createLinearGradient(d.ax * W, d.ay * H, d.bx * W, d.by * H);
                g.addColorStop(0, `rgba(${d.col},0)`);
                g.addColorStop(0.28, `rgba(${d.col},${d.a})`);
                g.addColorStop(0.7, `rgba(${d.col},${d.a})`);
                g.addColorStop(1, `rgba(${d.col},0)`);
                return { ...d, g };
            });
        }

        /* ---- interacción ---- */
        bindPointer() {
            if (this.interactive) {
                let lx = 0, ly = 0;
                const c = this.canvas;
                c.addEventListener('pointerdown', (e) => {
                    this.dragging = true; this.free = false; this.target = null;
                    lx = e.clientX; ly = e.clientY; this.vLon = 0;
                    c.classList.add('is-drag');
                    try { c.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
                });
                c.addEventListener('pointermove', (e) => {
                    if (!this.dragging) return;
                    const dx = e.clientX - lx, dy = e.clientY - ly;
                    lx = e.clientX; ly = e.clientY;
                    const k = 180 / this.R;
                    this.lon -= dx * k * 0.85;
                    this.vLon = -dx * k * 0.85 * 60;
                    if (e.pointerType !== 'touch') this.tilt = clamp(this.tilt + dy * k * 0.5, -55, 65);
                });
                const end = () => { this.dragging = false; this.idleFor = 0; c.classList.remove('is-drag'); };
                c.addEventListener('pointerup', end);
                c.addEventListener('pointercancel', end);
            }
        }

        focusOn(view, lane) {
            this.target = { lon: view.lon, tilt: view.tilt };
            this.lane = lane;
            this.free = false;
            this.vLon = 0;
        }

        /* ---- proyección ---- */
        setView() {
            const L = this.lon * DEG, T = this.tilt * DEG;
            this.cL = Math.cos(L); this.sL = Math.sin(L);
            this.cT = Math.cos(T); this.sT = Math.sin(T);
        }
        proj(x, y, z) {
            const x1 = x * this.cL - z * this.sL;
            const z1 = x * this.sL + z * this.cL;
            const y2 = y * this.cT - z1 * this.sT;
            const z2 = y * this.sT + z1 * this.cT;
            const p = this._p;
            p[0] = this.cx + this.R * x1;
            p[1] = this.cy - this.R * y2;
            p[2] = z2; p[3] = x1; p[4] = y2;
            return p;
        }

        /* ---- actualización de estado ---- */
        update(dt) {
            this.time += dt;
            // pointer suavizado
            this.mouse.sx = lerp(this.mouse.sx, this.mouse.x, 0.05);
            this.mouse.sy = lerp(this.mouse.sy, this.mouse.y, 0.05);

            if (this.target && !this.dragging) {
                let d = this.target.lon - this.lon;
                d = ((d + 540) % 360) - 180;
                const k = 1 - Math.exp(-dt * 3.2);
                this.lon += d * k;
                this.tilt += (this.target.tilt - this.tilt) * k;
                if (Math.abs(d) < 0.05) this.lon = this.target.lon;
                // leve balanceo sobre el corredor elegido
                this.lon += Math.sin(this.time * 0.5) * 0.02;
            } else if (!this.dragging) {
                if (Math.abs(this.vLon) > 0.5) {
                    this.lon += this.vLon * dt;
                    this.vLon *= Math.exp(-dt * 2.6);
                }
                this.idleFor += dt;
                if (this.free || this.idleFor > 3) {
                    this.spin *= Math.exp(-dt / 1.5);
                    this.lon -= (this.baseSpeed * (this.calm ? 0.75 : 1) + this.spin) * dt;
                    if (this.idleFor > 3 && !this.free && this.interactive) this.free = true;
                }
            }
            if (this.hero && !this.calm) this.lon -= this.extraLon;
            this.extraLon = 0;

            for (const a of this.arcs) a.phase = (a.phase + a.speed * dt * 0.5) % 1.4;
        }

        /* ---- dibujo ---- */
        frame(t, dt) {
            this.update(dt);
            this.render(t, dt);
        }

        render(t, dt) {
            const ctx = this.ctx;
            ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            ctx.clearRect(0, 0, this.W, this.H);
            this.setView();

            const ox = this.hero ? this.mouse.sx * -14 : 0;
            const oy = this.hero ? this.mouse.sy * -10 : 0;
            const cx0 = this.cx, cy0 = this.cy, R0 = this.R;
            this.cx += ox; this.cy += oy;
            if (this.hero) this.R = R0 * (1 + this.scrollP * 0.1);

            if (this.hero) {
                this.drawRibbons(ctx, this.time);
                this.drawNetwork(ctx, this.time);
            }
            this.drawOrbits(ctx, this.time, false);
            this.drawGlobe(ctx, this.time);
            this.drawArcs(ctx, this.time);
            this.drawOrbits(ctx, this.time, true);
            this.drawParticles(ctx, this.time);

            this.cx = cx0; this.cy = cy0; this.R = R0;
        }

        drawRibbons(ctx, t) {
            if (!this.ribbons) return;
            const { W, H } = this;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            const px = this.mouse.sx * 18;
            for (const r of this.ribbons) {
                const x0 = r.ax * W + px, y0 = r.ay * H, x3 = r.bx * W + px, y3 = r.by * H;
                const strands = this.lite ? 3 : 7;
                for (let k = 0; k < strands; k++) {
                    const o = (k - (strands - 1) / 2);
                    const w1 = Math.sin(t * 0.32 + r.ph + k * 0.11) * W * r.amp;
                    const w2 = Math.cos(t * 0.27 + r.ph * 1.3 + k * 0.09) * H * r.amp;
                    const c1x = lerp(x0, x3, 0.32) + w1 + o * 5;
                    const c1y = lerp(y0, y3, 0.32) + w2 + o * 3;
                    const c2x = lerp(x0, x3, 0.68) - w1 * 0.8 + o * 9;
                    const c2y = lerp(y0, y3, 0.68) - w2 * 0.9 - o * 4;
                    ctx.beginPath();
                    ctx.moveTo(x0, y0);
                    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x3, y3);
                    ctx.strokeStyle = r.g;
                    ctx.lineWidth = (k === strands >> 1 ? 1.8 : 0.8) * r.w;
                    ctx.globalAlpha = k === strands >> 1 ? 0.95 : 0.55;
                    ctx.stroke();
                }
                // resplandor suave bajo el haz
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.bezierCurveTo(lerp(x0, x3, 0.32) + Math.sin(t * 0.32 + r.ph) * W * r.amp, lerp(y0, y3, 0.32) + Math.cos(t * 0.27 + r.ph * 1.3) * H * r.amp,
                    lerp(x0, x3, 0.68) - Math.sin(t * 0.32 + r.ph) * W * r.amp * 0.8, lerp(y0, y3, 0.68) - Math.cos(t * 0.27 + r.ph * 1.3) * H * r.amp * 0.9, x3, y3);
                ctx.lineWidth = 16 * r.w;
                ctx.globalAlpha = 0.06;
                ctx.stroke();
            }
            ctx.restore();
        }

        drawNetwork(ctx, t) {
            const { cx, cy, R } = this;
            const pts = this.netNodes.map((n) => {
                const a = n.a + t * n.sp;
                const r = R * (n.r + Math.sin(t * 0.3 + n.ph) * 0.04);
                return [cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 0.86];
            });
            const D = R * 0.62;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = 0.8;
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
                    const d = Math.hypot(dx, dy);
                    if (d < D) {
                        ctx.strokeStyle = `rgba(127,214,216,${((1 - d / D) * 0.28).toFixed(3)})`;
                        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
                    }
                }
            }
            ctx.fillStyle = 'rgba(166,236,238,.75)';
            for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, TAU); ctx.fill(); }
            ctx.restore();
        }

        drawOrbits(ctx, t, front) {
            const { cx, cy, R } = this;
            const rings = [
                { r: 1.34, tilt: 68 * DEG, roll: -18 * DEG, sp: 0.35, gold: true, ph: 0.4 },
                { r: 1.62, tilt: 74 * DEG, roll: 26 * DEG, sp: -0.22, gold: false, ph: 2.6 }
            ];
            ctx.save();
            for (const ring of rings) {
                const cT = Math.cos(ring.tilt), sT = Math.sin(ring.tilt);
                const cR = Math.cos(ring.roll), sR = Math.sin(ring.roll);
                const N = 90;
                let pen = false;
                ctx.beginPath();
                for (let i = 0; i <= N; i++) {
                    const a = (i / N) * TAU;
                    const x = Math.cos(a) * ring.r, z0 = Math.sin(a) * ring.r;
                    const y1 = -z0 * sT, z1 = z0 * cT;
                    const X = x * cR - y1 * sR, Y = x * sR + y1 * cR;
                    const isFront = z1 >= 0;
                    if (isFront === front) {
                        const sx = cx + R * X, sy = cy - R * Y;
                        if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
                    } else pen = false;
                }
                ctx.strokeStyle = ring.gold ? `rgba(227,196,111,${front ? 0.5 : 0.2})` : `rgba(94,234,240,${front ? 0.42 : 0.16})`;
                ctx.lineWidth = front ? 1.2 : 0.9;
                ctx.stroke();

                // satélite
                const a = t * ring.sp + ring.ph;
                const x = Math.cos(a) * ring.r, z0 = Math.sin(a) * ring.r;
                const y1 = -z0 * sT, z1 = z0 * cT;
                if ((z1 >= 0) === front) {
                    const X = x * cR - y1 * sR, Y = x * sR + y1 * cR;
                    const sx = cx + R * X, sy = cy - R * Y;
                    const behind = z1 < 0 && Math.hypot(X, Y) < 1;
                    if (!behind) {
                        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.05);
                        const c = ring.gold ? '241,220,155' : '166,236,238';
                        g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.3, `rgba(${c},.5)`); g.addColorStop(1, `rgba(${c},0)`);
                        ctx.fillStyle = g;
                        ctx.beginPath(); ctx.arc(sx, sy, R * 0.05, 0, TAU); ctx.fill();
                    }
                }
            }
            ctx.restore();
        }

        drawGlobe(ctx, t) {
            const { cx, cy, R } = this;

            // atmósfera exterior (halo del cristal)
            let g = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.5);
            g.addColorStop(0, 'rgba(126,228,234,.42)');
            g.addColorStop(0.3, 'rgba(60,160,170,.18)');
            g.addColorStop(1, 'rgba(42,143,151,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, TAU); ctx.fill();

            // cuerpo de cristal: océano en teal luminoso, como el globo del logotipo
            g = ctx.createRadialGradient(cx - R * 0.36, cy - R * 0.44, R * 0.05, cx + R * 0.08, cy + R * 0.1, R * 1.08);
            g.addColorStop(0, 'rgba(132,200,206,.98)');
            g.addColorStop(0.26, 'rgba(70,142,152,.98)');
            g.addColorStop(0.6, 'rgba(27,88,100,.98)');
            g.addColorStop(1, 'rgba(6,32,42,.99)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

            ctx.save();
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();

            // barrido tipo radar (sutil)
            if (ctx.createConicGradient) {
                const cg = ctx.createConicGradient(t * 0.6, cx, cy);
                cg.addColorStop(0, 'rgba(94,234,240,0)');
                cg.addColorStop(0.86, 'rgba(94,234,240,0)');
                cg.addColorStop(1, 'rgba(94,234,240,.10)');
                ctx.fillStyle = cg;
                ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
            }

            // tierra: se proyecta una sola vez y se reparte por brillo
            const d = this.dots, n = d.length / 3;
            const rr = R * 0.0092;
            const bed = [], back = [], b = [[], [], [], []];
            for (let i = 0; i < n; i++) {
                const p = this.proj(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]);
                const z = p[2];
                if (z > 0.03) { b[Math.min(3, Math.floor(z * 4))].push(p[0], p[1], z); bed.push(p[0], p[1]); }
                else if (z < -0.05) back.push(p[0], p[1]);
            }

            // continentes oscuros (base) sobre el océano claro
            const rb = R * 0.0235;
            ctx.fillStyle = 'rgba(8,40,50,.84)';
            ctx.beginPath();
            for (let i = 0; i < bed.length; i += 2) { ctx.moveTo(bed[i] + rb, bed[i + 1]); ctx.arc(bed[i], bed[i + 1], rb, 0, TAU); }
            ctx.fill();

            // retícula de meridianos y paralelos (sobre océano y tierra)
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = 'rgba(196,238,240,.2)';
            ctx.beginPath();
            for (let lat = -75; lat <= 75; lat += 15) this.strokeParallel(ctx, lat);
            for (let lon = -180; lon < 180; lon += 15) this.strokeMeridian(ctx, lon);
            ctx.stroke();

            // trama de puntos: cara trasera (tenue, efecto cristal) + delantera por niveles de brillo
            ctx.fillStyle = 'rgba(170,230,234,.10)';
            ctx.beginPath();
            const rbk = rr * 0.7;
            for (let i = 0; i < back.length; i += 2) { ctx.moveTo(back[i] + rbk, back[i + 1]); ctx.arc(back[i], back[i + 1], rbk, 0, TAU); }
            ctx.fill();
            const alphas = [0.42, 0.64, 0.86, 1];
            for (let k = 0; k < 4; k++) {
                const arr = b[k];
                ctx.fillStyle = `rgba(214,246,247,${alphas[k]})`;
                ctx.beginPath();
                for (let i = 0; i < arr.length; i += 3) {
                    const r = rr * (0.55 + 0.5 * arr[i + 2]);
                    ctx.moveTo(arr[i] + r, arr[i + 1]);
                    ctx.arc(arr[i], arr[i + 1], r, 0, TAU);
                }
                ctx.fill();
            }

            // nodos de datos dorados con parpadeo
            ctx.globalCompositeOperation = 'lighter';
            for (let k = 0; k < this.nodeIdx.length; k++) {
                const i = this.nodeIdx[k];
                const p = this.proj(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]);
                if (p[2] > 0.1) {
                    const pulse = 0.55 + 0.45 * Math.sin(t * 2 + this.nodePh[k]);
                    const rad = R * 0.024 * (0.7 + pulse * 0.6);
                    const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad * 2.4);
                    gg.addColorStop(0, `rgba(255,238,176,${0.98 * p[2]})`);
                    gg.addColorStop(0.35, `rgba(240,196,100,${0.55 * p[2]})`);
                    gg.addColorStop(1, 'rgba(240,196,100,0)');
                    ctx.fillStyle = gg;
                    ctx.beginPath(); ctx.arc(p[0], p[1], rad * 2.4, 0, TAU); ctx.fill();
                }
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();

            // brillo de borde (fresnel)
            g = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
            g.addColorStop(0, 'rgba(150,236,240,0)');
            g.addColorStop(0.86, 'rgba(150,236,240,.14)');
            g.addColorStop(1, 'rgba(170,240,244,.52)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

            // destello especular amplio (arriba-izquierda)
            g = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.5, 0, cx - R * 0.42, cy - R * 0.5, R * 0.66);
            g.addColorStop(0, 'rgba(255,255,255,.22)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

            // reflejo curvo del cristal (media luna que se desvanece en los extremos)
            ctx.lineWidth = R * 0.03;
            ctx.lineCap = 'butt';
            const SEG = 22, a0 = Math.PI * 1.04, a1 = Math.PI * 1.56;
            for (let i = 0; i < SEG; i++) {
                const s = Math.sin(Math.PI * (i + 0.5) / SEG);
                ctx.strokeStyle = `rgba(255,255,255,${(0.5 * s * s).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(cx, cy, R * 0.955, a0 + (a1 - a0) * i / SEG, a0 + (a1 - a0) * (i + 1) / SEG + 0.004);
                ctx.stroke();
            }

            // doble aro de cristal
            ctx.strokeStyle = 'rgba(190,240,244,.2)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, R * 1.016, 0, TAU); ctx.stroke();
            const rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
            rim.addColorStop(0, 'rgba(190,244,246,.9)');
            rim.addColorStop(0.5, 'rgba(94,234,240,.28)');
            rim.addColorStop(1, 'rgba(227,196,111,.6)');
            ctx.strokeStyle = rim;
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
        }

        strokeParallel(ctx, lat) {
            const y = Math.sin(lat * DEG), r = Math.cos(lat * DEG);
            let pen = false;
            for (let lon = -180; lon <= 180; lon += 6) {
                const p = this.proj(r * Math.sin(lon * DEG), y, r * Math.cos(lon * DEG));
                if (p[2] > 0) { if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]); } else pen = false;
            }
        }
        strokeMeridian(ctx, lon) {
            const s = Math.sin(lon * DEG), c = Math.cos(lon * DEG);
            let pen = false;
            for (let lat = -90; lat <= 90; lat += 6) {
                const r = Math.cos(lat * DEG);
                const p = this.proj(r * s, Math.sin(lat * DEG), r * c);
                if (p[2] > 0) { if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]); } else pen = false;
            }
        }

        drawArcs(ctx, t) {
            const { R } = this;
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const lane = this.lane;

            for (const a of this.arcs) {
                const active = !lane || a.port.lane === lane;
                const pts = a.pts, N = pts.length / 3;
                const col = active ? (a.gold || lane ? '241,214,140' : '127,235,240') : '127,214,216';
                const alpha = active ? 0.85 : 0.13;

                // trazo del arco (con oclusión tras el globo)
                let pen = false;
                ctx.beginPath();
                for (let i = 0; i < N; i++) {
                    const p = this.proj(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
                    const vis = !(p[2] < 0 && p[3] * p[3] + p[4] * p[4] < 1);
                    if (vis) { if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]); } else pen = false;
                }
                ctx.strokeStyle = `rgba(${col},${alpha * 0.16})`;
                ctx.lineWidth = active ? 4.5 : 2;
                ctx.stroke();
                ctx.strokeStyle = `rgba(${col},${alpha * 0.8})`;
                ctx.lineWidth = active ? 1.15 : 0.7;
                ctx.stroke();

                // paquete de datos viajando por la ruta
                if (active) {
                    const ph = a.phase;
                    if (ph <= 1) {
                        const trail = 7;
                        for (let k = trail; k >= 0; k--) {
                            const tt = clamp(ph - k * 0.012, 0, 1);
                            const fi = tt * (N - 1), i0 = Math.floor(fi), f = fi - i0, i1 = Math.min(N - 1, i0 + 1);
                            const x = lerp(pts[i0 * 3], pts[i1 * 3], f), y = lerp(pts[i0 * 3 + 1], pts[i1 * 3 + 1], f), z = lerp(pts[i0 * 3 + 2], pts[i1 * 3 + 2], f);
                            const p = this.proj(x, y, z);
                            if (p[2] < 0 && p[3] * p[3] + p[4] * p[4] < 1) continue;
                            const sz = R * 0.011 * (1 - k / (trail + 2));
                            ctx.fillStyle = `rgba(255,244,205,${(1 - k / (trail + 1)) * 0.95})`;
                            ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(0.6, sz), 0, TAU); ctx.fill();
                            if (k === 0) {
                                const gg = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], R * 0.05);
                                gg.addColorStop(0, 'rgba(255,240,190,.75)');
                                gg.addColorStop(1, 'rgba(255,240,190,0)');
                                ctx.fillStyle = gg;
                                ctx.beginPath(); ctx.arc(p[0], p[1], R * 0.05, 0, TAU); ctx.fill();
                            }
                        }
                    }
                }
            }

            // puertos de destino (con etiquetas sin encimarse)
            const showLabels = !!lane && this.interactive;
            ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
            ctx.textBaseline = 'middle';
            const placed = [];
            const cands = [];
            for (const a of this.arcs) {
                const active = !lane || a.port.lane === lane;
                const p = this.proj(a.vec[0], a.vec[1], a.vec[2]);
                if (p[2] <= 0.02) continue;
                ctx.fillStyle = active ? 'rgba(255,236,170,.98)' : 'rgba(166,236,238,.35)';
                ctx.beginPath(); ctx.arc(p[0], p[1], active ? 3 : 1.8, 0, TAU); ctx.fill();
                if (active) {
                    ctx.strokeStyle = 'rgba(255,236,170,.4)';
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(p[0], p[1], 5.5 + 2 * Math.sin(t * 2.4 + a.phase * 6), 0, TAU); ctx.stroke();
                    if (showLabels && p[2] > 0.3) cands.push({ name: a.port.n.toUpperCase(), x: p[0], y: p[1], z: p[2] });
                }
            }
            // los puertos más de frente se rotulan primero; si chocan con otro, se omiten
            cands.sort((u, v) => v.z - u.z);
            for (const c of cands) {
                const w = ctx.measureText(c.name).width;
                const rect = { x: c.x + 9, y: c.y - 17, w: w + 4, h: 15 };
                if (placed.some((r) => rect.x < r.x + r.w && rect.x + rect.w > r.x && rect.y < r.y + r.h && rect.y + rect.h > r.y)) continue;
                placed.push(rect);
                ctx.fillStyle = `rgba(230,240,241,${Math.min(1, c.z * 1.4)})`;
                ctx.fillText(c.name, rect.x, c.y - 9);
            }

            // hub: Manzanillo
            const h = this.proj(this.hubVec[0], this.hubVec[1], this.hubVec[2]);
            if (h[2] > 0.02) {
                const k = Math.min(1, h[2] * 3);
                for (let i = 0; i < 3; i++) {
                    const ph = ((t * 0.5 + i / 3) % 1);
                    ctx.strokeStyle = `rgba(241,220,155,${(1 - ph) * 0.65 * k})`;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.arc(h[0], h[1], 4 + ph * R * 0.075, 0, TAU); ctx.stroke();
                }
                const gg = ctx.createRadialGradient(h[0], h[1], 0, h[0], h[1], 14);
                gg.addColorStop(0, `rgba(255,244,205,${k})`);
                gg.addColorStop(0.4, `rgba(227,196,111,${0.7 * k})`);
                gg.addColorStop(1, 'rgba(227,196,111,0)');
                ctx.fillStyle = gg;
                ctx.beginPath(); ctx.arc(h[0], h[1], 14, 0, TAU); ctx.fill();
                ctx.fillStyle = `rgba(255,250,230,${k})`;
                ctx.beginPath(); ctx.arc(h[0], h[1], 3.4, 0, TAU); ctx.fill();

                if (h[2] > 0.35) {
                    // la etiqueta sale hacia el lado con más espacio, para no recortarse en el borde del canvas
                    const dir = h[0] < this.W * 0.42 ? 1 : -1;
                    const lx = h[0] + dir * Math.max(56, R * 0.2), ly = h[1] - Math.max(42, R * 0.16);
                    ctx.strokeStyle = `rgba(241,220,155,${0.75 * k})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(h[0] + dir * 4, h[1] - 4); ctx.lineTo(lx - dir * 4, ly + 6); ctx.lineTo(lx + dir * 100, ly + 6); ctx.stroke();
                    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
                    ctx.textBaseline = 'alphabetic';
                    ctx.textAlign = dir > 0 ? 'left' : 'right';
                    ctx.fillStyle = `rgba(255,244,205,${k})`;
                    ctx.fillText('MANZANILLO · COL.', dir > 0 ? lx : lx + 4, ly);
                    ctx.textAlign = 'left';
                }
            }
            ctx.restore();
        }

        drawParticles(ctx, t) {
            const { W, H } = this;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (const p of this.parts) {
                p.x += p.vx * 0.016 * 3; p.y += p.vy * 0.016 * 3;
                if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
                if (p.x < -0.02) p.x = 1.02; else if (p.x > 1.02) p.x = -0.02;
                const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + p.ph);
                const x = p.x * W + this.mouse.sx * -22 * p.z, y = p.y * H;
                const r = 0.7 + p.z * 1.1;
                ctx.fillStyle = p.gold ? `rgba(241,214,140,${0.18 + tw * 0.5})` : `rgba(148,238,242,${0.15 + tw * 0.45})`;
                ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
            }
            ctx.restore();
        }
    }

    /* Bucle único de animación para todas las escenas */
    const scenes = [];
    const frameHooks = [];
    let lastT = performance.now();
    function mainLoop(now) {
        requestAnimationFrame(mainLoop);
        // Tope generoso: en equipos lentos (pocos FPS) el globo conserva su velocidad real de giro
        // en lugar de arrastrarse; solo se limita el salto tras volver de otra pestaña.
        const dt = Math.min(0.12, (now - lastT) / 1000);
        lastT = now;
        if (document.hidden) return;
        watchPerf(now);
        for (const s of scenes) if (s.visible) s.frame(now / 1000, dt);
        for (const fn of frameHooks) fn(dt);
    }

    /* Modo ligero automático: si el equipo no sostiene ~24 FPS con la portada visible, se simplifica el
       fondo decorativo (auroras, grano, desenfoques) y el canvas. El globo sigue girando a su velocidad real. */
    const perf = { t0: 0, frames: 0, done: false };
    function watchPerf(now) {
        if (perf.done || window.scrollY > window.innerHeight * 0.5) return;
        const hero = $('.hero');
        if (!hero || !hero.classList.contains('is-ready')) return;
        if (!perf.t0) { perf.t0 = now; return; }
        const el = now - perf.t0;
        if (el < 1200) return;                          // calentamiento tras el loader
        perf.frames++;
        if (el > 4200) {                                // ~3 s de muestra
            perf.done = true;
            const fps = perf.frames / ((el - 1200) / 1000);
            if (fps < 24) {
                document.documentElement.classList.add('is-lite');
                scenes.forEach((s) => s.setLite());
            }
        }
    }

    function trackVisibility(scene, el) {
        if (!('IntersectionObserver' in window)) { scene.visible = true; return; }
        new IntersectionObserver((entries) => {
            scene.visible = entries[0].isIntersecting;
        }, { rootMargin: '80px 0px' }).observe(el);
    }

    function initHeroGlobe() {
        const canvas = $('#hero-canvas');
        if (!canvas) return null;
        const scene = new GlobeScene(canvas, {
            hero: true,
            lon: 140, tilt: 20, speed: 9, spinUp: 150,
            layout: (w, h) => {
                const head = w >= 900 ? 82 : 68;
                if (w >= 900) {
                    const R = Math.min(w * 0.27, h * 0.4);
                    return { cx: w * 0.73, cy: h * 0.5 + head * 0.2, R };
                }
                const R = Math.min(w * 0.42, 200);
                return { cx: w / 2, cy: head + 14 + R, R };
            }
        });
        scenes.push(scene);
        trackVisibility(scene, canvas.parentElement);

        // parallax de puntero (no con "reducir animaciones")
        const hero = canvas.parentElement;
        if (finePointer && !reduceMotion) {
            hero.addEventListener('pointermove', (e) => {
                const r = hero.getBoundingClientRect();
                scene.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
                scene.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
            });
            hero.addEventListener('pointerleave', () => { scene.mouse.x = 0; scene.mouse.y = 0; });
        }
        return scene;
    }

    /* ------------------------------------------------------------------
       04. LOADER
    ------------------------------------------------------------------ */
    function initLoader() {
        const loader = $('#loader');
        const hero = $('.hero');
        const finishSite = () => {
            document.body.classList.remove('is-locked');
            if (hero) hero.classList.add('is-ready');
            resolveReady();
        };
        if (!loader) { finishSite(); return; }

        document.body.classList.add('is-locked');
        const pctEl = $('#loader-pct'), barEl = $('#loader-bar'), statusEl = $('#loader-status');
        const seen = store.get('gb-seen') === '1';
        // La intro de marca (loader) se muestra completa también con "reducir animaciones": dura pocos segundos.
        const minTime = seen ? 1100 : 2800;
        const steps = [
            [0, 'Iniciando aduana digital'],
            [28, 'Conectando puertos'],
            [58, 'Validando fracciones arancelarias'],
            [84, 'Preparando tu experiencia'],
            [100, 'Bienvenido']
        ];
        let loaded = document.readyState === 'complete';
        if (!loaded) window.addEventListener('load', () => { loaded = true; }, { once: true });

        const t0 = performance.now();
        let pct = 0, finished = false, lastMsg = -1;

        const finish = () => {
            if (finished) return;
            finished = true;
            pctEl.textContent = '100';
            barEl.style.transform = 'scaleX(1)';
            statusEl.textContent = 'Bienvenido';
            loader.classList.add('is-logo');
            store.set('gb-seen', '1');
            const logoHold = seen ? 700 : 1500;
            setTimeout(() => {
                loader.classList.add('is-done');
                setTimeout(finishSite, 450);
                setTimeout(() => { loader.classList.add('is-gone'); loader.setAttribute('aria-hidden', 'true'); }, 1350);
            }, logoHold);
        };

        const tick = (now) => {
            if (finished) return;
            const elapsed = now - t0;
            let target = clamp(elapsed / minTime, 0, 1) * 100;
            if (!loaded) target = Math.min(target, 90);
            pct += (target - pct) * 0.12;
            if (target - pct < 0.3) pct = target;
            const shown = Math.min(99, Math.floor(pct));
            pctEl.textContent = shown;
            barEl.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
            let m = 0;
            for (let i = 0; i < steps.length - 1; i++) if (pct >= steps[i][0]) m = i;
            if (m !== lastMsg) { statusEl.textContent = steps[m][1]; lastMsg = m; }

            if ((pct >= 99.4 && loaded) || elapsed > 9000) finish();
            else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ------------------------------------------------------------------
       05. SCROLL SUAVE + BUCLE DE ACTUALIZACIÓN POR SCROLL
    ------------------------------------------------------------------ */
    let scrollTo_ = (y) => window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });

    function initSmoothScroll() {
        if (reduceMotion || !finePointer) return;
        const html = document.documentElement;
        html.classList.add('has-smooth');
        let target = window.scrollY, current = target, running = false;
        const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        const loop = () => {
            const diff = target - current;
            if (Math.abs(diff) < 0.4) {
                current = target;
                window.scrollTo(0, current);
                running = false;
                return;
            }
            current += diff * 0.085;
            window.scrollTo(0, current);
            requestAnimationFrame(loop);
        };
        const start = () => {
            if (!running) { running = true; requestAnimationFrame(loop); }
        };

        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.defaultPrevented) return;
            if (document.body.classList.contains('is-locked')) return;
            if (e.target.closest && e.target.closest('textarea, select, iframe, [data-no-smooth]')) return;
            e.preventDefault();
            if (!running) { current = window.scrollY; target = current; }
            const dy = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
            target = clamp(target + dy * 1.1, 0, maxScroll());
            start();
        }, { passive: false });

        window.addEventListener('scroll', () => {
            if (!running) { current = target = window.scrollY; }
        }, { passive: true });

        scrollTo_ = (y) => {
            if (!running) current = window.scrollY;
            target = clamp(y, 0, maxScroll());
            start();
        };
    }

    /* Actualizaciones ligadas al scroll (barra, header, hero, parallax) */
    function initScrollEffects(heroScene) {
        const header = $('#site-header');
        const bar = $('.scroll-progress span');
        const hero = $('.hero');
        const heroCopy = $('#hero-copy');
        const toTop = $('#to-top');
        const parallax = $$('[data-parallax]').map((el) => ({
            el, speed: parseFloat(el.dataset.parallax) || 0.1,
            clampTo: el.tagName === 'IMG' ? el.parentElement : null
        }));
        let lastY = -1, lastVh = 0;

        const update = () => {
            const y = window.scrollY;
            const vh = window.innerHeight;
            if (y === lastY && vh === lastVh) return;
            const dy = lastY < 0 ? 0 : y - lastY;
            lastY = y; lastVh = vh;

            const max = Math.max(1, document.documentElement.scrollHeight - vh);
            bar.style.setProperty('--sp', (y / max).toFixed(4));
            header.classList.toggle('is-scrolled', y > 24);

            // hero: fundido/desplazamiento del texto + rotación extra del globo
            if (hero) {
                const hh = hero.offsetHeight;
                const p = clamp(y / (hh * 0.9), 0, 1);
                if (heroCopy) {
                    heroCopy.style.transform = `translate3d(0,${(p * 70).toFixed(1)}px,0)`;
                    heroCopy.style.opacity = (1 - p * 1.15).toFixed(3);
                }
                if (heroScene) {
                    heroScene.scrollP = p;
                    heroScene.extraLon += dy * 0.06;
                }
            }

            // parallax genérico
            for (const it of parallax) {
                const r = it.el.getBoundingClientRect();
                if (r.bottom < -200 || r.top > vh + 200) continue;
                const parent = it.clampTo || it.el;
                const rc = it.clampTo ? it.clampTo.getBoundingClientRect() : r;
                let off = (rc.top + rc.height / 2 - vh / 2) * -it.speed;
                if (it.clampTo) {
                    const slack = it.clampTo.offsetHeight * 0.1;
                    off = clamp(off, -slack, slack);
                }
                it.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
                void parent;
            }

            if (toTop) toTop.style.opacity = y > vh ? 1 : 0.55;
        };
        frameHooks.push(update);
        window.addEventListener('resize', () => { lastVh = 0; });
        return update;
    }

    /* ------------------------------------------------------------------
       06. HEADER, MENÚ MÓVIL Y NAVEGACIÓN
    ------------------------------------------------------------------ */
    function initNav() {
        const burger = $('.burger');
        const nav = $('#nav');
        const header = $('#site-header');

        const setMenu = (open) => {
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            nav.classList.toggle('is-open', open);
            document.body.classList.toggle('is-locked', open);
            if (open) { const first = $('a', nav); if (first) setTimeout(() => first.focus({ preventScroll: true }), 350); }
        };
        burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
        });
        window.addEventListener('resize', () => { if (window.innerWidth >= 1020 && nav.classList.contains('is-open')) setMenu(false); });

        // Anclas con scroll suave
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (!id || id === '#') return;
                const el = id === '#inicio' ? document.body : $(id);
                if (!el) return;
                e.preventDefault();
                if (nav.classList.contains('is-open')) setMenu(false);
                const offset = header ? header.offsetHeight - 6 : 0;
                const y = id === '#inicio' ? 0 : el.getBoundingClientRect().top + window.scrollY - offset;
                requestAnimationFrame(() => scrollTo_(y));
                try { history.pushState(null, '', id); } catch (err) { /* noop */ }
            });
        });

        const toTop = $('#to-top');
        if (toTop) toTop.addEventListener('click', () => scrollTo_(0));

        // Enlace activo según la sección visible
        const links = $$('.nav__list a');
        const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        links.forEach((l) => l.classList.remove('is-active'));
                        const l = map.get(en.target.id);
                        if (l) l.classList.add('is-active');
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            $$('main section[id]').forEach((s) => io.observe(s));
        }
    }

    /* ------------------------------------------------------------------
       07. REVELADO, TITULARES DIVIDIDOS Y CONTADORES
    ------------------------------------------------------------------ */
    function initReveal() {
        // Titulares: cada palabra sube desde una máscara
        $$('[data-split]').forEach((el) => {
            const words = el.textContent.trim().split(/\s+/);
            el.textContent = '';
            words.forEach((w, i) => {
                const outer = document.createElement('span');
                outer.className = 'w';
                const inner = document.createElement('span');
                inner.className = 'wi';
                inner.style.setProperty('--i', i);
                inner.textContent = w;
                outer.appendChild(inner);
                el.appendChild(outer);
                if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
            });
            el.classList.add('split');
        });

        const targets = $$('[data-reveal], .split');
        const settle = (el) => { if (el.hasAttribute('data-tilt')) setTimeout(() => el.classList.add('is-settled'), 1500); };

        if (reduceMotion || !('IntersectionObserver' in window)) {
            targets.forEach((el) => { el.classList.add('is-in'); settle(el); });
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (!en.isIntersecting) return;
                en.target.classList.add('is-in');
                settle(en.target);
                io.unobserve(en.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        targets.forEach((el) => io.observe(el));
    }

    function initCounters() {
        const els = $$('[data-count]');
        const run = (el) => {
            const end = parseFloat(el.dataset.count);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            if (reduceMotion) { el.textContent = prefix + end + suffix; return; }
            const dur = 1900;
            const t0 = performance.now();
            const step = (now) => {
                const p = clamp((now - t0) / dur, 0, 1);
                el.textContent = prefix + Math.round(end * easeOutExpo(p)) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        els.forEach((el) => {
            const end = parseFloat(el.dataset.count);
            el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
            const inHero = !!el.closest('.hero');
            if (!('IntersectionObserver' in window)) { run(el); return; }
            const io = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) return;
                io.disconnect();
                if (inHero) ready.then(() => setTimeout(() => run(el), 1100));
                else run(el);
            }, { threshold: 0.6 });
            io.observe(el);
            void end;
        });
    }

    /* ------------------------------------------------------------------
       08. EFECTOS DE PUNTERO
    ------------------------------------------------------------------ */
    function initPointerFX() {
        if (!finePointer || reduceMotion) return;

        // luz ambiental que sigue al cursor
        const glow = $('.cursor-glow');
        let gx = -999, gy = -999, tx = -999, ty = -999, seen = false;
        window.addEventListener('pointermove', (e) => {
            tx = e.clientX; ty = e.clientY;
            if (!seen) { seen = true; gx = tx; gy = ty; document.documentElement.classList.add('has-pointer'); }
        }, { passive: true });
        frameHooks.push(() => {
            if (!glow || !seen) return;
            gx = lerp(gx, tx, 0.12); gy = lerp(gy, ty, 0.12);
            glow.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;
        });

        // spotlight
        $$('[data-spotlight]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--x', (e.clientX - r.left) + 'px');
                el.style.setProperty('--y', (e.clientY - r.top) + 'px');
            });
        });

        // tilt 3D
        $$('[data-tilt]').forEach((el) => {
            const max = el.classList.contains('logo-plate') ? 7 : 4.5;
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });

        // botones magnéticos
        $$('[data-magnetic]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.setProperty('--mx', (dx * 0.2).toFixed(1) + 'px');
                el.style.setProperty('--my', (dy * 0.28).toFixed(1) + 'px');
            });
            el.addEventListener('pointerleave', () => {
                el.style.setProperty('--mx', '0px');
                el.style.setProperty('--my', '0px');
            });
        });
    }

    /* ------------------------------------------------------------------
       09. PROCESO: LÍNEA DE TIEMPO LIGADA AL SCROLL
    ------------------------------------------------------------------ */
    function initTimeline() {
        const tl = $('#timeline');
        if (!tl) return;
        const steps = $$('.step', tl);
        const line = $('.timeline__line', tl);
        const now = $('#process-now');
        let lastActive = -1;

        const update = () => {
            const vh = window.innerHeight;
            const tr = tl.getBoundingClientRect();
            if (tr.bottom < -100 || tr.top > vh + 100) return;
            const mark = vh * 0.58;
            const lr = line.getBoundingClientRect();
            tl.style.setProperty('--p', clamp((mark - lr.top) / lr.height, 0, 1).toFixed(4));
            let active = -1;
            steps.forEach((s, i) => {
                const r = s.getBoundingClientRect();
                const passed = r.top + 40 < mark;
                s.classList.toggle('is-passed', passed);
                if (passed) active = i;
            });
            steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
            if (active !== lastActive) {
                lastActive = active;
                if (now) now.textContent = String(Math.max(active, 0) + 1).padStart(2, '0');
            }
        };
        frameHooks.push(update);
    }

    /* ------------------------------------------------------------------
       10. COBERTURA: GLOBO INTERACTIVO
    ------------------------------------------------------------------ */
    function initCoverage() {
        const canvas = $('#globe-canvas');
        if (!canvas) return;
        const scene = new GlobeScene(canvas, {
            interactive: true,
            lon: -170, tilt: 44, speed: 6, lane: 'asia', dotStep: 2.1,
            layout: (w, h) => ({ cx: w / 2, cy: h / 2, R: Math.min(w, h) * 0.37 })
        });
        scene.focusOn(LANE_VIEW.asia, 'asia');
        scenes.push(scene);
        trackVisibility(scene, canvas);

        const buttons = $$('.lane');
        const info = $('#lane-info');
        const title = $('#lane-title'), text = $('#lane-text');
        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.lane;
                buttons.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
                scene.focusOn(LANE_VIEW[key], key);
                if (reduceMotion) { scene.lon = LANE_VIEW[key].lon; scene.tilt = LANE_VIEW[key].tilt; scene.render(0, 0); }
                title.textContent = LANE_COPY[key][0];
                text.textContent = LANE_COPY[key][1];
                info.classList.remove('is-swap');
                void info.offsetWidth;
                info.classList.add('is-swap');
            });
        });
        return scene;
    }

    /* ------------------------------------------------------------------
       11. FAQ
    ------------------------------------------------------------------ */
    function initFaq() {
        const items = $$('.faq__item');
        const setOpen = (item, open) => {
            item.classList.toggle('is-open', open);
            $('.faq__q', item).setAttribute('aria-expanded', String(open));
        };
        items.forEach((item) => {
            $('.faq__q', item).addEventListener('click', () => {
                const open = item.classList.contains('is-open');
                items.forEach((i) => setOpen(i, false));
                setOpen(item, !open);
            });
        });
        if (items[0]) setOpen(items[0], true);
    }

    /* ------------------------------------------------------------------
       12. FORMULARIO → WHATSAPP
    ------------------------------------------------------------------ */
    function initForm() {
        const form = $('#contact-form');
        if (!form) return;
        const status = $('#form-status');
        const rules = {
            nombre: (v) => (v.trim().length < 2 ? 'Escribe tu nombre para poder atenderte.' : ''),
            telefono: (v) => {
                const digits = v.replace(/\D/g, '');
                return digits.length < 10 || digits.length > 13 ? 'Ingresa un teléfono válido (10 dígitos).' : '';
            },
            tipo: (v) => (!v ? 'Selecciona el tipo de operación.' : '')
        };
        const errId = { nombre: 'e-nombre', telefono: 'e-tel', tipo: 'e-tipo' };

        const validateField = (name) => {
            const input = form.elements[name];
            const msg = rules[name](input.value || '');
            const wrap = input.closest('.field');
            wrap.classList.toggle('has-error', !!msg);
            input.setAttribute('aria-invalid', msg ? 'true' : 'false');
            $('#' + errId[name]).textContent = msg;
            return !msg;
        };
        Object.keys(rules).forEach((name) => {
            const input = form.elements[name];
            input.addEventListener('blur', () => validateField(name));
            input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(name); });
            input.addEventListener('change', () => { if (input.closest('.field').classList.contains('has-error')) validateField(name); });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const ok = Object.keys(rules).map(validateField).every(Boolean);
            if (!ok) {
                const bad = form.querySelector('.has-error input, .has-error select');
                if (bad) bad.focus();
                status.textContent = 'Revisa los campos marcados.';
                return;
            }
            const f = form.elements;
            const lines = [
                `Hola, soy *${f.nombre.value.trim()}*${f.empresa.value.trim() ? ' de ' + f.empresa.value.trim() : ''}.`,
                `Me interesa una cotización de: *${f.tipo.value}*.`
            ];
            if (f.mercancia.value.trim()) lines.push(`Mercancía: ${f.mercancia.value.trim()}`);
            if (f.mensaje.value.trim()) lines.push(`Detalles: ${f.mensaje.value.trim()}`);
            lines.push(`Mi teléfono: ${f.telefono.value.trim()}`);
            lines.push('(Mensaje enviado desde el sitio web)');
            const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

            const win = window.open(url, '_blank', 'noopener');
            if (!win) window.location.href = url;
            form.classList.add('is-sent');
            status.innerHTML = '¡Listo! Abrimos WhatsApp con tu mensaje. ¿No se abrió? <a href="' + url + '" target="_blank" rel="noopener noreferrer">Haz clic aquí</a>.';
            form.reset();
            setTimeout(() => form.classList.remove('is-sent'), 8000);
        });
    }

    /* ------------------------------------------------------------------
       13. WHATSAPP FLOTANTE, HUD Y DETALLES
    ------------------------------------------------------------------ */
    function initWhatsApp() {
        const box = $('#wa-float');
        if (!box) return;
        const close = $('#wa-close');
        ready.then(() => {
            setTimeout(() => box.classList.add('is-visible'), 900);
            if (store.get('gb-wa-tip') !== '1') {
                setTimeout(() => box.classList.add('show-tip'), 5200);
                setTimeout(() => box.classList.remove('show-tip'), 15000);
            }
        });
        close.addEventListener('click', () => { box.classList.remove('show-tip'); store.set('gb-wa-tip', '1'); });
    }

    function initHud() {
        const hud = $('#hud-flow');
        if (!hud || reduceMotion) return;
        const items = $$('.hud__list li', hud);
        const bar = $('.hud__bar span', hud);
        let n = 0, acc = 0;
        frameHooks.push((dt) => {
            if (window.scrollY > window.innerHeight) return;
            acc += dt;
            if (acc < 1.25) return;
            acc = 0;
            n++;
            if (n > items.length + 1) { n = 0; items.forEach((li) => li.classList.remove('is-done')); }
            else if (n <= items.length) items[n - 1].classList.add('is-done');
            bar.style.width = Math.min(100, (n / items.length) * 100) + '%';
        });
    }

    /* ------------------------------------------------------------------
       14. AVISOS Y NOTICIAS  (los datos viven en avisos.js)
    ------------------------------------------------------------------ */
    function initNotices() {
        const section = $('#avisos');
        if (!section) return;
        const list = $('#notices-list');
        const empty = $('#notices-empty');
        const rateBox = $('#notices-rate');
        const cfg = window.GB_AVISOS;

        // Sin datos que mostrar: se oculta la sección y también sus accesos (menú y pie de página)
        const hideAll = () => {
            section.hidden = true;
            $$('a[href="#avisos"]').forEach((a) => { (a.closest('li') || a).hidden = true; });
        };
        if (!cfg || typeof cfg !== 'object') { hideAll(); return; }

        const TYPES = { aduana: 'Circular de la aduana', puerto: 'Aviso del puerto', clima: 'Clima', noticia: 'Noticia' };
        const pad = (n) => String(n).padStart(2, '0');
        const now = new Date();
        const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
        const fmtDate = (iso) => {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
            if (!m) return '';
            const d = new Date(+m[1], +m[2] - 1, +m[3]);
            return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        };
        const safeUrl = (u) => {
            try { const url = new URL(String(u || '').trim()); return /^https?:$/.test(url.protocol) ? url.href : ''; } catch (e) { return ''; }
        };
        const make = (tag, cls, text) => {
            const n = document.createElement(tag);
            if (cls) n.className = cls;
            if (text != null) n.textContent = text;
            return n;
        };

        // Tipo de cambio (opcional)
        const tc = cfg.tipoCambio || {};
        const valor = String(tc.valor || '').trim();
        const hasRate = !!(valor && rateBox);
        if (hasRate) {
            $('#rate-value').textContent = '$' + valor + ' MXN por USD';
            const meta = [fmtDate(tc.fecha) && 'Actualizado: ' + fmtDate(tc.fecha), String(tc.fuente || '').trim() && 'Fuente: ' + String(tc.fuente).trim()].filter(Boolean);
            $('#rate-meta').textContent = meta.join(' · ');
            rateBox.hidden = false;
        }

        // Avisos vigentes, del más reciente al más antiguo
        const items = (Array.isArray(cfg.items) ? cfg.items : [])
            .filter((it) => it && typeof it === 'object' && it.activo !== false && String(it.titulo || '').trim())
            .filter((it) => !String(it.vigencia || '').trim() || String(it.vigencia).trim() >= today)
            .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
            .slice(0, 6);

        if (!items.length && !hasRate && cfg.mostrarSiVacio === false) { hideAll(); return; }

        if (items.length) {
            if (empty) empty.remove();
            items.forEach((it, i) => {
                const tipo = TYPES[it.tipo] ? it.tipo : 'noticia';
                const card = make('article', 'notice notice--' + tipo);
                card.setAttribute('data-reveal', 'up');
                if (i % 3) card.setAttribute('data-delay', String(i % 3));

                const meta = make('div', 'notice__meta');
                meta.appendChild(make('span', 'notice__tag', TYPES[tipo]));
                const dateTxt = fmtDate(it.fecha);
                if (dateTxt) {
                    const t = make('time', 'notice__date', dateTxt);
                    t.setAttribute('datetime', String(it.fecha).trim());
                    meta.appendChild(t);
                }
                card.appendChild(meta);
                card.appendChild(make('h3', null, String(it.titulo).trim()));
                if (String(it.texto || '').trim()) card.appendChild(make('p', null, String(it.texto).trim()));
                const href = safeUrl(it.enlace);
                if (href) {
                    const a = make('a', 'notice__link', tipo === 'aduana' ? 'Ver circular' : 'Más información');
                    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
                    card.appendChild(a);
                }
                list.appendChild(card);
            });
        }
    }

    /* ------------------------------------------------------------------
       15. ARRANQUE
    ------------------------------------------------------------------ */
    function init() {
        if ('scrollRestoration' in history && !location.hash) {
            history.scrollRestoration = 'manual';
            window.scrollTo(0, 0);
        }
        const year = $('#year');
        if (year) year.textContent = new Date().getFullYear();

        initLoader();
        initSmoothScroll();
        const heroScene = initHeroGlobe();
        initCoverage();
        initNotices();
        initNav();
        initReveal();
        initCounters();
        initPointerFX();
        initTimeline();
        initFaq();
        initForm();
        initWhatsApp();
        initHud();
        initScrollEffects(heroScene);

        // re-dibujar los canvas cuando cambia el tamaño
        let rz;
        window.addEventListener('resize', () => {
            clearTimeout(rz);
            rz = setTimeout(() => scenes.forEach((s) => s.resize()), 120);
        });

        // El bucle corre siempre: el globo debe girar en cualquier equipo. Con "reducir animaciones"
        // activo el globo gira a ritmo calmado y se desactivan parallax, giro por scroll y efectos de puntero.
        requestAnimationFrame(mainLoop);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
