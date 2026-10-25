/********************************************************************
 * FELLA'S GARDEN - EXCLUSIVE PETS SYSTEM (js/exclusive_pets.js)
 * Unique, Crazy & Mythical Chibi Companions Exclusive to Mystery Eggs!
 * Features 15 Special Pets across 4 Rarity Tiers,
 * Discovery Index (Gallery '???'), Unique Behaviors & Particle FX.
 ********************************************************************/

(function () {
    'use strict';

    // 1. PET DEFINITIONS & RARITY METADATA
    const EXCLUSIVE_PETS = {
        // --- TIER: LEGENDARY (5% Drop Rate) ---
        kurama: {
            id: 'kurama',
            name: 'Chibi Kurama',
            fullName: 'Chibi Kurama (Ekor Sembilan)',
            title: 'Rubah Ekor Sembilan Legendaris',
            tier: 'legendary',
            tierLabel: 'LEGENDARY',
            tierColor: '#EA580C',
            tierBg: '#FFEDD5',
            tierBorder: '#F97316',
            tierEmoji: '🔥',
            habitat: 'land',
            emoji: '🦊',
            sound: 'fox',
            desc: 'Rubah legendaris berkilau api jingga dengan sembilan ekor melambai anggun dan menenangkan.',
            detailDesc: 'Dipercaya sebagai penjaga kebun kuno, Kurama kecil gemar berjemur dan meninggalkan jejak bara hangat di rumput.',
            stars: 5,
            weight: 1.67
        },
        baby_dragon: {
            id: 'baby_dragon',
            name: 'Naga Zamrud',
            fullName: 'Baby Dragon Zamrud',
            title: 'Naga Bayi Penguasa Langit',
            tier: 'legendary',
            tierLabel: 'LEGENDARY',
            tierColor: '#EA580C',
            tierBg: '#FFEDD5',
            tierBorder: '#F97316',
            tierEmoji: '🔥',
            habitat: 'flying',
            emoji: '🐉',
            sound: 'dragon',
            desc: 'Naga mini berwarna zamrud berkilau dengan sayap berselaput sutra dan tanduk mutiara.',
            detailDesc: 'Melayang anggun di atas hamparan bunga, sesekali menghembuskan bintik kilau zamrud yang menyuburkan tanah.',
            stars: 5,
            weight: 1.67
        },
        crystal_deer: {
            id: 'crystal_deer',
            name: 'Rusa Kristal',
            fullName: 'Rusa Kristal Prismatic',
            title: 'Roh Hutan Bermahkota Kristal',
            tier: 'legendary',
            tierLabel: 'LEGENDARY',
            tierColor: '#EA580C',
            tierBg: '#FFEDD5',
            tierBorder: '#F97316',
            tierEmoji: '🔥',
            habitat: 'land',
            emoji: '🦌',
            sound: 'chime',
            desc: 'Rusa anggun mungil dengan tubuh putih kebiruan dan tanduk kristal yang membiaskan cahaya pelangi.',
            detailDesc: 'Tanduk kristalnya memancarkan spektrum warna pastel yang membuat tanaman di dekatnya bermekaran lebih cerah.',
            stars: 5,
            weight: 1.66
        },

        // --- TIER: EPIC (15% Drop Rate) ---
        sakura_kitsune: {
            id: 'sakura_kitsune',
            name: 'Sakura Kitsune',
            fullName: 'Kitsune Kelopak Sakura',
            title: 'Rubah Roh Penjaga Musim Semi',
            tier: 'epic',
            tierLabel: 'EPIC',
            tierColor: '#9333EA',
            tierBg: '#F3E8FF',
            tierBorder: '#A855F7',
            tierEmoji: '⭐',
            habitat: 'land',
            emoji: '🌸',
            sound: 'fox',
            desc: 'Rubah putih jelita berbulu sutra dengan ekor ganda menyerupai kelopak sakura bertumpuk.',
            detailDesc: 'Langkahnya sangat ringan menaburkan kelopak sakura segar, menghadirkan nuansa musim semi abadi ke kebunmu.',
            stars: 4,
            weight: 3.0
        },
        phoenix_chick: {
            id: 'phoenix_chick',
            name: 'Bayi Phoenix',
            fullName: 'Anak Burung Phoenix Api',
            title: 'Burung Cahaya Abadi',
            tier: 'epic',
            tierLabel: 'EPIC',
            tierColor: '#9333EA',
            tierBg: '#F3E8FF',
            tierBorder: '#A855F7',
            tierEmoji: '⭐',
            habitat: 'flying',
            emoji: '🔥',
            sound: 'chime',
            desc: 'Anak burung phoenix dengan bulu gradasi api emas, jambul membara, dan aura hangat bersahabat.',
            detailDesc: 'Mengepakkan sayap kecilnya dengan ceria, menghangatkan tanah saat malam dingin tiba.',
            stars: 4,
            weight: 3.0
        },
        moon_rabbit: {
            id: 'moon_rabbit',
            name: 'Kelinci Rembulan',
            fullName: 'Kelinci Angkasa Malam',
            title: 'Penjelajah Bulan Purnama',
            tier: 'epic',
            tierLabel: 'EPIC',
            tierColor: '#9333EA',
            tierBg: '#F3E8FF',
            tierBorder: '#A855F7',
            tierEmoji: '⭐',
            habitat: 'land',
            emoji: '🌙',
            sound: 'rabbit',
            desc: 'Kelinci malam berbulu biru dongker berbintang dengan lambang bulan sabit emas di dahinya.',
            detailDesc: 'Sangat menyukai suasana malam hari, lompatannya seakan mengambang di gravitasi rendah.',
            stars: 4,
            weight: 3.0
        },
        mushroom_sprite: {
            id: 'mushroom_sprite',
            name: 'Roh Jamur',
            fullName: 'Kurcaci Jamur Hutan',
            title: 'Penjaga Spora Cahaya',
            tier: 'epic',
            tierLabel: 'EPIC',
            tierColor: '#9333EA',
            tierBg: '#F3E8FF',
            tierBorder: '#A855F7',
            tierEmoji: '⭐',
            habitat: 'land',
            emoji: '🍄',
            sound: 'pop',
            desc: 'Makhluk jamur mungil berwajah lucu dengan topi polkadot merah menyala yang berbioluminesensi.',
            detailDesc: 'Berjalan bergoyang-goyang lucu, mengeluarkan spora keemasan yang menumbuhkan lumut halus di sekitarnya.',
            stars: 4,
            weight: 3.0
        },
        cloud_spirit: {
            id: 'cloud_spirit',
            name: 'Gumpalan Awan',
            fullName: 'Roh Awan Pelangi',
            title: 'Gumpalan Awan Mini Ceria',
            tier: 'epic',
            tierLabel: 'EPIC',
            tierColor: '#9333EA',
            tierBg: '#F3E8FF',
            tierBorder: '#A855F7',
            tierEmoji: '⭐',
            habitat: 'flying',
            emoji: '☁️',
            sound: 'chime',
            desc: 'Gumpalan awan putih empuk yang melayang di udara, membawa senyum manis dan pelangi kecil di atasnya.',
            detailDesc: 'Selalu riang dan lembut, melayang santai mengikuti hembusan angin sepoi-sepoi di kebun.',
            stars: 4,
            weight: 3.0
        },

        // --- TIER: RARE (35% Drop Rate) ---
        star_jellyfish: {
            id: 'star_jellyfish',
            name: 'Ubur-Ubur Bintang',
            fullName: 'Ubur-Ubur Kosmis Cahaya',
            title: 'Ubur-Ubur Bintang Berkilau',
            tier: 'rare',
            tierLabel: 'RARE',
            tierColor: '#0284C7',
            tierBg: '#E0F2FE',
            tierBorder: '#38BDF8',
            tierEmoji: '💎',
            habitat: 'flying',
            emoji: '🪼',
            sound: 'bubble',
            desc: 'Ubur-ubur semi-transparan bercahaya kosmis yang melayang anggun di udara maupun di atas air.',
            detailDesc: 'Tentakel lembutnya berpendar biru safir dan ungu, menciptakan irama denyut cahaya yang menenangkan.',
            stars: 3,
            weight: 8.75
        },
        axolotl_spirit: {
            id: 'axolotl_spirit',
            name: 'Axolotl Ajaib',
            fullName: 'Axolotl Merah Muda Ajaib',
            title: 'Sahabat Air & Darat Abadi',
            tier: 'rare',
            tierLabel: 'RARE',
            tierColor: '#0284C7',
            tierBg: '#E0F2FE',
            tierBorder: '#38BDF8',
            tierEmoji: '💎',
            habitat: 'land',
            emoji: '🦎',
            sound: 'bubble',
            desc: 'Axolotl merah muda manis dengan insang rumbai bercahaya toska dan senyuman abadi yang menggemaskan.',
            detailDesc: 'Suka berjalan santai di tepi rumput maupun mendekati air sambil tersenyum ramah.',
            stars: 3,
            weight: 8.75
        },
        tanuki_spirit: {
            id: 'tanuki_spirit',
            name: 'Tanuki Jenaka',
            fullName: 'Tanuki Berdaun Ajaib',
            title: 'Rakun Pembawa Keberuntungan',
            tier: 'rare',
            tierLabel: 'RARE',
            tierColor: '#0284C7',
            tierBg: '#E0F2FE',
            tierBorder: '#38BDF8',
            tierEmoji: '💎',
            habitat: 'land',
            emoji: '🐾',
            sound: 'chirp',
            desc: 'Rakun bundar lucu dari negeri dongeng dengan sehelai daun hijau ajaib di kepalanya.',
            detailDesc: 'Suka tidur siang di rerumputan lebat dan sesekali mengedipkan mata jenaka kepada bunga.',
            stars: 3,
            weight: 8.75
        },
        mandragora: {
            id: 'mandragora',
            name: 'Mandragora',
            fullName: 'Mandragora Roh Tumbuhan',
            title: 'Akar Ajaib Berdaun Lebat',
            tier: 'rare',
            tierLabel: 'RARE',
            tierColor: '#0284C7',
            tierBg: '#E0F2FE',
            tierBorder: '#38BDF8',
            tierEmoji: '💎',
            habitat: 'land',
            emoji: '🌿',
            sound: 'pop',
            desc: 'Tanaman akar mungil bertubuh kayu ceria dengan tunas daun segar di kepalanya.',
            detailDesc: 'Kadang mengubur kakinya ke tanah untuk menyerap nutrisi kebun lalu melompat bangun dengan ceria.',
            stars: 3,
            weight: 8.75
        },

        // --- TIER: UNCOMMON (45% Drop Rate) ---
        rainbow_snail: {
            id: 'rainbow_snail',
            name: 'Siput Pelangi',
            fullName: 'Siput Cangkang Pelangi',
            title: 'Penyusur Berkilau Emas',
            tier: 'uncommon',
            tierLabel: 'UNCOMMON',
            tierColor: '#16A34A',
            tierBg: '#DCFCE7',
            tierBorder: '#4ADE80',
            tierEmoji: '🌱',
            habitat: 'land',
            emoji: '🐌',
            sound: 'bubble',
            desc: 'Siput mini bertubuh mutiara dengan cangkang spiral yang berpendar spektrum warna pelangi pastel.',
            detailDesc: 'Menjelajahi kebun dengan sangat santai, meninggalkan jejak kilau mutiara yang cepat menyerap ke tanah.',
            stars: 2,
            weight: 15.0
        },
        starlight_hedgehog: {
            id: 'starlight_hedgehog',
            name: 'Landak Bintang',
            fullName: 'Landak Mini Berduri Emas',
            title: 'Penjaga Kilau Malam',
            tier: 'uncommon',
            tierLabel: 'UNCOMMON',
            tierColor: '#16A34A',
            tierBg: '#DCFCE7',
            tierBorder: '#4ADE80',
            tierEmoji: '🌱',
            habitat: 'land',
            emoji: '🦔',
            sound: 'chirp',
            desc: 'Landak kecil ramah dengan duri-duri halus yang bersinar bagaikan gugusan bintang jatuh.',
            detailDesc: 'Saat kaget atau bahagia, duri-durinya berkedip lembut memancarkan kehangatan.',
            stars: 2,
            weight: 15.0
        },
        jade_frog: {
            id: 'jade_frog',
            name: 'Katak Giok',
            fullName: 'Katak Batu Giok Zamrud',
            title: 'Pembawa Berkah Kolam',
            tier: 'uncommon',
            tierLabel: 'UNCOMMON',
            tierColor: '#16A34A',
            tierBg: '#DCFCE7',
            tierBorder: '#4ADE80',
            tierEmoji: '🌱',
            habitat: 'land',
            emoji: '🐸',
            sound: 'croak',
            desc: 'Katak giok zamrud berkilau dengan mata keemasan dan bintik mutiara yang gemar melompat gembira.',
            detailDesc: 'Suka melompat di dekat daun teratai dan tepian danau, membawa kedamaian dan suasana sejuk.',
            stars: 2,
            weight: 15.0
        }
    };

    const EXCLUSIVE_PET_LIST = Object.values(EXCLUSIVE_PETS);
    const DISCOVERY_STORAGE_KEY = 'fellas_garden_discovered_pets_v1';

    // 2. DISCOVERY LOGIC (LocalStorage persistence)
    function getDiscoveredPets() {
        try {
            const raw = localStorage.getItem(DISCOVERY_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function isPetDiscovered(petId) {
        if (!petId) return false;
        const list = getDiscoveredPets();
        return list.includes(petId);
    }

    function markPetDiscovered(petId) {
        if (!petId || !EXCLUSIVE_PETS[petId]) return false;
        const list = getDiscoveredPets();
        if (!list.includes(petId)) {
            list.push(petId);
            try {
                localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(list));
            } catch (e) {
                console.warn('Gagal menyimpan status penemuan pet:', e);
            }
            if (typeof updateGalleryBadge === 'function') updateGalleryBadge();
            return true; // Baru pertama kali ditemukan!
        }
        return false; // Sudah pernah ditemukan sebelumnya
    }

    function getExclusivePetDef(petId) {
        return EXCLUSIVE_PETS[petId] || null;
    }

    function isExclusivePetType(petIdOrType) {
        return Boolean(EXCLUSIVE_PETS[petIdOrType]);
    }

    // 3. WEIGHTED DROP RATE PICKER
    function pickRandomExclusivePet() {
        const roll = Math.random() * 100;
        let targetTier = 'uncommon';
        if (roll < 5.0) targetTier = 'legendary';      // 5%
        else if (roll < 20.0) targetTier = 'epic';      // 15%
        else if (roll < 55.0) targetTier = 'rare';      // 35%
        else targetTier = 'uncommon';                   // 45%

        const pool = EXCLUSIVE_PET_LIST.filter(p => p.tier === targetTier);
        if (pool.length === 0) return EXCLUSIVE_PET_LIST[0];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // 4. INSTANCE SPAWNER FOR GARDEN
    function spawnExclusivePet(petId, customName, spawnX, spawnY) {
        const def = getExclusivePetDef(petId);
        if (!def) return null;

        const cx = (typeof WORLD_W !== 'undefined' ? WORLD_W : 4200) * 0.5;
        const cy = (typeof WORLD_H !== 'undefined' ? WORLD_H : 3200) * 0.52;

        let sx = typeof spawnX === 'number' ? spawnX : cx;
        let sy = typeof spawnY === 'number' ? spawnY : cy;

        // If no spawn coordinates provided, find a cozy spot on grass
        if (typeof spawnX !== 'number') {
            for (let i = 0; i < 40; i++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 320;
                const tx = cx + Math.cos(ang) * dist;
                const ty = cy + Math.sin(ang) * (dist * 0.55);
                if (typeof isPointOnGrass === 'function' && isPointOnGrass(tx, ty)) {
                    sx = tx;
                    sy = ty;
                    break;
                }
            }
        }

        const animal = {
            id: 'pet_ex_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            type: 'exclusive',
            variant: def.id,
            species: def.id,
            petId: def.id,
            name: customName || def.name,
            tier: def.tier,
            habitat: def.habitat || 'land',
            x: sx,
            y: sy,
            vx: 0,
            vy: 0,
            targetX: sx,
            targetY: sy,
            state: 'idle',
            stateTimer: 2 + Math.random() * 2,
            facingLeft: Math.random() < 0.5,
            hopPhase: 0,
            tailPhase: Math.random() * Math.PI,
            wingPhase: Math.random() * Math.PI * 2,
            wingSpeed: 18,
            petAnim: 0,
            bubbleText: '(｡♥‿♥｡)',
            bubbleTimer: 2.5,
            colorHue: Math.random() * 360,
            friendship: 30,
            personality: 'playful',
            accessory: 'none'
        };

        if (typeof animals !== 'undefined' && Array.isArray(animals)) {
            animals.push(animal);
            if (typeof updateAnimalsBadge === 'function') updateAnimalsBadge();
            if (typeof renderActiveAnimalsList === 'function') renderActiveAnimalsList();
        }

        // Auto mark as discovered in gallery
        markPetDiscovered(def.id);

        // Spawn welcoming stars & hearts particles
        if (typeof particles !== 'undefined') {
            for (let i = 0; i < 8; i++) {
                particles.push({
                    type: 'sparkle',
                    x: sx + (Math.random() - 0.5) * 32,
                    y: sy - 18 + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 1.6,
                    vy: -1.2 - Math.random() * 1.5,
                    size: 4 + Math.random() * 3,
                    color: def.tierColor,
                    alpha: 1.0
                });
            }
        }

        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
        return animal;
    }

    // 5. MASTER DRAWING DISPATCHER & CHIBI REALISTIC PET ART
    function drawExclusivePet(ctx, a, now) {
        if (!a) return;
        const petId = a.variant || a.petId || a.type;
        const def = getExclusivePetDef(petId);

        // Convert millisecond timestamp (from requestAnimationFrame) into seconds
        // plus a deterministic per-pet phase offset so multiple pets never move in robotic lockstep
        const rawSec = (typeof now === 'number' && now > 0) ? (now * 0.001) : (performance.now() * 0.001);
        const idSeed = a.id ? String(a.id).charCodeAt(String(a.id).length - 1) : 0;
        const phaseOffset = ((a.colorHue || 0) * 0.04) + (idSeed * 0.31);
        const t = rawSec + phaseOffset;

        ctx.save();
        ctx.translate(a.x, a.y);

        const isScared = Boolean(a.isBeingDragged || a.state === 'scared');
        const isWalking = a.state === 'walking';
        const isSleeping = a.state === 'sleeping';
        const isHappy = a.state === 'happy' || (a.petAnim || 0) > 0;
        const dragLift = a.isBeingDragged ? -16 : 0;
        const tremble = isScared ? (Math.sin(rawSec * 36) * 1.4) : 0;
        const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;

        // Smooth walking hop & stride cycle
        const stride = isWalking ? ((a.hopPhase || 0) * 1.15) : (isScared ? rawSec * 18 : 0);
        const walkHop = isWalking ? Math.abs(Math.sin(stride)) * 3.2 : 0;
        const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;

        // Ground shadow (pulses slightly with height/hop)
        const baseShadowRadius = (def && def.tier === 'legendary') ? 18 : 14;
        const shadowScale = Math.max(0.7, 1 - (walkHop + petBounce) * 0.018);
        ctx.fillStyle = 'rgba(20, 35, 15, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 2 - dragLift, (isScared ? baseShadowRadius * 0.75 : baseShadowRadius) * shadowScale, (isScared ? 4 : 5.5) * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);
        if (a.facingLeft) ctx.scale(-1, 1);

        // Locomotion & secondary-motion state passed to individual pet renderers
        const legSwing = isWalking ? Math.sin(stride) * 3.8 : (isScared ? Math.sin(rawSec * 20) * 3.0 : 0);
        const legLiftL = isWalking ? Math.max(0, -Math.sin(stride)) * 2.8 : (isScared ? 1.5 : 0);
        const legLiftR = isWalking ? Math.max(0, Math.sin(stride)) * 2.8 : (isScared ? 1.5 : 0);
        const walkTilt = isWalking ? Math.sin(stride) * 0.055 : 0;
        const headBob = isWalking ? Math.sin(stride * 2) * 1.1 : Math.sin(t * 2.0) * 0.45;
        const breath = isSleeping ? Math.sin(t * 1.4) * 0.04 : Math.sin(t * 2.2) * 0.024;
        const tailDynamic = (a.tailPhase || 0) * 0.6 + t * (isHappy ? 2.8 : (isWalking ? 2.2 : 1.5));
        const isBlinking = isSleeping || ((t * 0.85) % 4.4 > 4.22);

        const anim = {
            t,
            rawSec,
            isWalking,
            isSleeping,
            isHappy,
            isScared,
            stride,
            walkHop,
            legSwing,
            legLiftL,
            legLiftR,
            walkTilt,
            headBob,
            breath,
            tailDynamic,
            isBlinking
        };

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Subtle breathing & walking pitch on body
        ctx.rotate(walkTilt);
        ctx.scale(1 + breath * 0.6, 1 - breath * 0.6);

        // Draw individual pet
        switch (petId) {
            case 'kurama':
                drawChibiKurama(ctx, a, anim);
                break;
            case 'baby_dragon':
                drawBabyDragon(ctx, a, anim);
                break;
            case 'crystal_deer':
                drawCrystalDeer(ctx, a, anim);
                break;
            case 'sakura_kitsune':
                drawSakuraKitsune(ctx, a, anim);
                break;
            case 'phoenix_chick':
                drawPhoenixChick(ctx, a, anim);
                break;
            case 'moon_rabbit':
                drawMoonRabbit(ctx, a, anim);
                break;
            case 'mushroom_sprite':
                drawMushroomSprite(ctx, a, anim);
                break;
            case 'cloud_spirit':
                drawCloudSpirit(ctx, a, anim);
                break;
            case 'star_jellyfish':
                drawStarJellyfish(ctx, a, anim);
                break;
            case 'axolotl_spirit':
                drawAxolotlSpirit(ctx, a, anim);
                break;
            case 'tanuki_spirit':
                drawTanukiSpirit(ctx, a, anim);
                break;
            case 'mandragora':
                drawMandragora(ctx, a, anim);
                break;
            case 'rainbow_snail':
                drawRainbowSnail(ctx, a, anim);
                break;
            case 'starlight_hedgehog':
                drawStarlightHedgehog(ctx, a, anim);
                break;
            case 'jade_frog':
                drawJadeFrog(ctx, a, anim);
                break;
            default:
                drawChibiKurama(ctx, a, anim);
                break;
        }

        ctx.restore();
    }

    // Helper for sleeping / blinking eye arcs
    function drawClosedEyeArc(ctx, x, y, radius, color, lineWidth = 1.5) {
        ctx.save();
        ctx.strokeStyle = color || '#292524';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
        ctx.restore();
    }

    // -------------------------------------------------------------
    // DETAILED CHIBI PET DRAWING IMPLEMENTATIONS (WITH SMOOTH LOCOMOTION)
    // -------------------------------------------------------------

    // 1. 🦊 CHIBI KURAMA (Nine-Tailed Fox with Fluid Chakra Flame Tails & Quadruped Gait)
    function drawChibiKurama(ctx, a, anim) {
        const { t, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyColor = '#EA580C';
        const darkFur = '#9A3412';
        const lightFur = '#FED7AA';
        const outlineColor = '#431407';

        // Ambient Flame Tails (9 tails fanning out in a calm, majestic wave)
        for (let i = 0; i < 9; i++) {
            const spread = (i - 4) * 0.21;
            const wave = Math.sin(tailDynamic * 0.95 + i * 0.55) * 0.14;
            const tipFlick = Math.cos(tailDynamic * 1.2 + i * 0.7) * 2.2;
            const tailAngle = -Math.PI * 0.45 + spread + wave;
            ctx.save();
            ctx.translate(-8, -10);
            ctx.rotate(tailAngle);

            const tailGrad = ctx.createLinearGradient(0, 0, 25, 0);
            tailGrad.addColorStop(0, darkFur);
            tailGrad.addColorStop(0.5, '#F97316');
            tailGrad.addColorStop(0.88, '#FDE047');
            tailGrad.addColorStop(1, '#FFFBEB');

            ctx.fillStyle = tailGrad;
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.quadraticCurveTo(12, -7 + tipFlick * 0.3, 24, tipFlick);
            ctx.quadraticCurveTo(12, 7 + tipFlick * 0.3, 0, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Flame core highlight
            ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
            ctx.beginPath();
            ctx.ellipse(13, tipFlick * 0.35, 5.5, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Far-side Legs (Back-Right & Front-Left)
        ctx.fillStyle = darkFur;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-7 - legSwing * 0.75, -0.5 - legLiftR, 3.8, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(3 + legSwing * 0.75, -0.5 - legLiftL, 3.6, 2.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chubby Chibi Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 14);
        bodyGrad.addColorStop(0, '#FB923C');
        bodyGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -9, 13, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chest / Belly Fluff
        ctx.fillStyle = lightFur;
        ctx.beginPath();
        ctx.ellipse(2.5, -7.2, 6.8, 5.8, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Near-side Legs (Back-Left & Front-Right stepping in opposite phase)
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.4;
        // Back near leg
        ctx.beginPath();
        ctx.ellipse(-4.5 + legSwing * 0.85, 0.5 - legLiftL, 4.1, 3.0, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Front near leg
        ctx.beginPath();
        ctx.ellipse(6.2 - legSwing * 0.85, 0.5 - legLiftR, 3.9, 2.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Dark paw tips on near legs
        ctx.fillStyle = darkFur;
        ctx.beginPath();
        ctx.ellipse(-3.8 + legSwing * 0.85, 1.2 - legLiftL, 2.4, 1.5, 0, 0, Math.PI * 2);
        ctx.ellipse(6.8 - legSwing * 0.85, 1.2 - legLiftR, 2.3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Big Cute Chibi Fox Head (with stride headBob)
        ctx.save();
        ctx.translate(4, -18 + headBob);

        // Pointy Fox Ears (with gentle independent ear twitch)
        [-7, 7].forEach((ex, idx) => {
            const earTwitch = Math.sin(t * 2.1 + idx * 1.7) * 0.06;
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate((idx === 0 ? -0.25 : 0.25) + earTwitch);
            ctx.fillStyle = darkFur;
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-5, 5);
            ctx.lineTo(0, -13);
            ctx.lineTo(5, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Inner ear
            ctx.fillStyle = lightFur;
            ctx.beginPath();
            ctx.moveTo(-2.5, 4);
            ctx.lineTo(0, -9);
            ctx.lineTo(2.5, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // Head Base
        const headGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 13);
        headGrad.addColorStop(0, '#FB923C');
        headGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cheek Fur Fluffs
        ctx.fillStyle = '#FB923C';
        ctx.beginPath();
        ctx.moveTo(-11, 1); ctx.lineTo(-15, 2); ctx.lineTo(-11, 5); ctx.closePath(); ctx.fill();
        ctx.moveTo(11, 1); ctx.lineTo(15, 2); ctx.lineTo(11, 5); ctx.closePath(); ctx.fill();

        // Dark Fox Whisker Markings (Kurama signature marks)
        ctx.strokeStyle = darkFur;
        ctx.lineWidth = 1.2;
        [-1, 1].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(side * 5, -1); ctx.lineTo(side * 11, -3);
            ctx.moveTo(side * 5, 2); ctx.lineTo(side * 10, 3);
            ctx.stroke();
        });

        // Eyes (Blinking / Sleeping support)
        if (isBlinking) {
            drawClosedEyeArc(ctx, -4, -0.5, 2.8, outlineColor, 1.6);
            drawClosedEyeArc(ctx, 4, -0.5, 2.8, outlineColor, 1.6);
        } else {
            ctx.fillStyle = '#7F1D1D';
            ctx.beginPath();
            ctx.ellipse(-4, -1, 3.2, 3.8, 0, 0, Math.PI * 2);
            ctx.ellipse(4, -1, 3.2, 3.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.ellipse(-4, 0, 2, 2.4, 0, 0, Math.PI * 2);
            ctx.ellipse(4, 0, 2, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-4.8, -1.8, 1.2, 0, Math.PI * 2);
            ctx.arc(3.2, -1.8, 1.2, 0, Math.PI * 2);
            ctx.arc(-3.2, 0.5, 0.6, 0, Math.PI * 2);
            ctx.arc(4.8, 0.5, 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Button Nose & Smile
        ctx.fillStyle = outlineColor;
        ctx.beginPath();
        ctx.ellipse(0, 3.5, 1.4, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(-1.6, 5, 1.6, 0.2, Math.PI - 0.2);
        ctx.arc(1.6, 5, 1.6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    // 2. 🐉 BABY DRAGON (Emerald Miniature Sky Dragon)
    function drawBabyDragon(ctx, a, anim) {
        const { t, headBob, tailDynamic, isBlinking } = anim;
        const hoverLift = Math.sin(t * 2.2) * 3.5;
        ctx.translate(0, -6 + hoverLift);

        const emeraldDark = '#065F46';
        const emeraldMain = '#059669';
        const emeraldLight = '#34D399';
        const bellyColor = '#D1FAE5';
        const outline = '#022C22';

        // Dragon Tail with Spade (smooth serpentine wave)
        ctx.save();
        const tailWag = Math.sin(tailDynamic * 1.1) * 0.22;
        const tipCurve = Math.cos(t * 2.6) * 2.5;
        ctx.translate(-10, -3);
        ctx.rotate(tailWag);
        ctx.strokeStyle = emeraldDark;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, 4 + tipCurve * 0.4, -16, -2 + tipCurve);
        ctx.stroke();
        // Tail Spade
        ctx.fillStyle = emeraldLight;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-16, -2 + tipCurve);
        ctx.lineTo(-20, -7 + tipCurve);
        ctx.lineTo(-22, -2 + tipCurve);
        ctx.lineTo(-20, 3 + tipCurve);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Dragon Wings (smooth rhythmic wingbeat)
        const wingFlap = Math.sin(t * 4.6) * 0.30;
        [-1, 1].forEach(side => {
            ctx.save();
            ctx.translate(-2, -15);
            ctx.scale(side, 1);
            ctx.rotate(wingFlap * side - 0.2);
            ctx.fillStyle = 'rgba(110, 231, 183, 0.85)';
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-12, -16, -18, -12);
            ctx.quadraticCurveTo(-12, -4, -14, 4);
            ctx.quadraticCurveTo(-6, 2, 0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Dangling Back Foot
        const footKick = Math.sin(t * 3.0) * 1.8;
        ctx.fillStyle = emeraldDark;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4 + footKick, 1.5 - Math.abs(footKick) * 0.3, 3.6, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Plump Emerald Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 12);
        bodyGrad.addColorStop(0, emeraldLight);
        bodyGrad.addColorStop(1, emeraldMain);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 11, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Belly scale plates
        ctx.fillStyle = bellyColor;
        ctx.beginPath();
        ctx.ellipse(3, -6, 6, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Dangling Front Foot & Cute Little Arm
        ctx.fillStyle = emeraldMain;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(4 - footKick, 1.8 - Math.abs(footKick) * 0.3, 3.8, 2.6, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cute Dragon Head
        ctx.save();
        ctx.translate(4, -17 + headBob * 0.7);

        // Tiny Horns with golden sheen
        [-4, 4].forEach((hx, idx) => {
            ctx.save();
            ctx.translate(hx, -8);
            ctx.rotate(idx === 0 ? -0.2 : 0.2);
            ctx.fillStyle = '#FDE047';
            ctx.strokeStyle = '#854D0E';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-2, 3);
            ctx.lineTo(0, -7);
            ctx.lineTo(2, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Head Base
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Snout
        ctx.fillStyle = emeraldLight;
        ctx.beginPath();
        ctx.ellipse(4, 2, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nostril dots
        ctx.fillStyle = emeraldDark;
        ctx.beginPath();
        ctx.arc(6, 1.5, 0.9, 0, Math.PI * 2);
        ctx.arc(8, 2.5, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Huge Gem Eyes (Golden Amber with emerald ring)
        if (isBlinking) {
            drawClosedEyeArc(ctx, -3, -0.5, 2.8, outline, 1.6);
            drawClosedEyeArc(ctx, 3, -0.5, 2.8, outline, 1.6);
        } else {
            ctx.fillStyle = '#78350F';
            ctx.beginPath();
            ctx.ellipse(-3, -1, 3.2, 3.8, 0, 0, Math.PI * 2);
            ctx.ellipse(3, -1, 3.2, 3.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FBBF24';
            ctx.beginPath();
            ctx.ellipse(-3, 0, 2.2, 2.5, 0, 0, Math.PI * 2);
            ctx.ellipse(3, 0, 2.2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-3.8, -1.8, 1.2, 0, Math.PI * 2);
            ctx.arc(2.2, -1.8, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // 3. 🦌 CRYSTAL DEER (Prismatic Rainbow Antlers & Graceful Prancing Legs)
    function drawCrystalDeer(ctx, a, anim) {
        const { t, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyColor = '#E0F2FE';
        const shadeColor = '#BAE6FD';
        const outline = '#0369A1';

        // Helper to draw a slender deer leg with hoof
        const drawDeerLeg = (hipX, hipY, swingX, liftY, isFar) => {
            const footX = hipX + swingX;
            const footY = 0.5 - liftY;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(hipX, hipY);
            ctx.quadraticCurveTo(hipX + swingX * 0.5, (hipY + footY) * 0.5 - liftY * 0.3, footX, footY);
            ctx.stroke();

            ctx.strokeStyle = isFar ? shadeColor : bodyColor;
            ctx.lineWidth = 1.9;
            ctx.beginPath();
            ctx.moveTo(hipX, hipY);
            ctx.quadraticCurveTo(hipX + swingX * 0.5, (hipY + footY) * 0.5 - liftY * 0.3, footX, footY);
            ctx.stroke();

            // Crystal Blue Hoof
            ctx.fillStyle = '#0284C7';
            ctx.beginPath();
            ctx.ellipse(footX, footY + 0.5, 2.1, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
        };

        // Far-side Deer Legs
        drawDeerLeg(-6.5, -5, -legSwing * 0.85, legLiftR, true);
        drawDeerLeg(4.0, -5, legSwing * 0.85, legLiftL, true);

        // Fluffy White Deer Tail (flicking gently)
        ctx.save();
        ctx.translate(-11, -11);
        ctx.rotate(Math.sin(tailDynamic * 1.2) * 0.25);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(-5, -3, -3, -6);
        ctx.quadraticCurveTo(1, -4, 1, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Slender Body
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -9.5, 12, 8.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near-side Deer Legs
        drawDeerLeg(-3.5, -5, legSwing * 0.9, legLiftL, false);
        drawDeerLeg(7.0, -5, -legSwing * 0.9, legLiftR, false);

        // Dappled Starry White Spots
        ctx.fillStyle = '#FFFFFF';
        [[-4, -11.5], [1, -12.5], [-2, -8.5], [4, -9.5]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Elegant Neck & Head (bobbing gracefully)
        ctx.save();
        ctx.translate(6, -18 + headBob);

        // Prismatic Rainbow Crystal Antlers (smooth, slow color cycle)
        [-4, 4].forEach((ax, idx) => {
            ctx.save();
            ctx.translate(ax, -7);
            ctx.rotate(idx === 0 ? -0.3 : 0.3);

            const prismGrad = ctx.createLinearGradient(0, 0, 0, -18);
            const hueOffset = (t * 24 + idx * 60) % 360;
            prismGrad.addColorStop(0, `hsl(${hueOffset}, 80%, 75%)`);
            prismGrad.addColorStop(0.5, `hsl(${(hueOffset + 120) % 360}, 85%, 80%)`);
            prismGrad.addColorStop(1, `hsl(${(hueOffset + 240) % 360}, 90%, 88%)`);

            ctx.fillStyle = prismGrad;
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-1.5, 2);
            ctx.lineTo(-2, -14);
            ctx.lineTo(-7, -19);
            ctx.lineTo(-5, -19);
            ctx.lineTo(0, -14);
            ctx.lineTo(6, -20);
            ctx.lineTo(8, -19);
            ctx.lineTo(2, -13);
            ctx.lineTo(2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(-6, -19, 1.4, 0, Math.PI * 2);
            ctx.arc(7, -19, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Ears (pivoting gently)
        const earPivot = Math.sin(t * 2.2) * 0.08;
        ctx.fillStyle = shadeColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-7, -3, 5, 2.5, -0.4 - earPivot, 0, Math.PI * 2);
        ctx.ellipse(7, -3, 5, 2.5, 0.4 + earPivot, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chibi Deer Face
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Soft dark deer eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, -3, -0.5, 2.4, outline, 1.5);
            drawClosedEyeArc(ctx, 3, -0.5, 2.4, outline, 1.5);
        } else {
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.ellipse(-3, -1, 2.6, 3.2, 0, 0, Math.PI * 2);
            ctx.ellipse(3, -1, 2.6, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-3.6, -1.8, 1.1, 0, Math.PI * 2);
            ctx.arc(2.4, -1.8, 1.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Little nose
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.ellipse(0, 3.2, 1.4, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 4. 🌸 SAKURA KITSUNE (Cherry Blossom Petal Fox)
    function drawSakuraKitsune(ctx, a, anim) {
        const { t, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyColor = '#FFF5F7';
        const pinkAccent = '#F472B6';
        const pinkDeep = '#DB2777';
        const outline = '#831843';

        // Twin Sakura Petal Tails (smooth swaying)
        [-1, 1].forEach((side, idx) => {
            ctx.save();
            const wag = Math.sin(tailDynamic + idx * 0.9) * 0.18;
            ctx.translate(-8, -8);
            ctx.rotate(-Math.PI * 0.4 + side * 0.28 + wag);

            const petalGrad = ctx.createLinearGradient(0, 0, 22, 0);
            petalGrad.addColorStop(0, '#FDF2F8');
            petalGrad.addColorStop(0.6, pinkAccent);
            petalGrad.addColorStop(1, pinkDeep);

            ctx.fillStyle = petalGrad;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.quadraticCurveTo(10, -8, 22, 0);
            ctx.quadraticCurveTo(10, 8, 0, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Far-side Paws
        ctx.fillStyle = pinkAccent;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-6.5 - legSwing * 0.75, -0.5 - legLiftR, 3.3, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(3.0 + legSwing * 0.75, -0.5 - legLiftL, 3.3, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Porcelain Body
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8.5, 12, 9.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near-side Paws (stepping in opposite phase)
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4.0 + legSwing * 0.85, 0.5 - legLiftL, 3.6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(5.8 - legSwing * 0.85, 0.5 - legLiftR, 3.6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Pink toe tips
        ctx.fillStyle = pinkAccent;
        ctx.beginPath();
        ctx.ellipse(-3.5 + legSwing * 0.85, 1.0 - legLiftL, 2.0, 1.3, 0, 0, Math.PI * 2);
        ctx.ellipse(6.3 - legSwing * 0.85, 1.0 - legLiftR, 2.0, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.save();
        ctx.translate(4, -17 + headBob);

        // Ears with pink tips
        [-6, 6].forEach((ex, idx) => {
            const earSway = Math.sin(t * 2.2 + idx * 1.5) * 0.06;
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate((idx === 0 ? -0.25 : 0.25) + earSway);
            ctx.fillStyle = bodyColor;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(-4, 4);
            ctx.lineTo(0, -11);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = pinkAccent;
            ctx.beginPath();
            ctx.moveTo(-1.5, -6); ctx.lineTo(0, -10.5); ctx.lineTo(1.5, -6); ctx.closePath(); ctx.fill();
            ctx.restore();
        });

        // Head Base
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sakura Forehead Mark
        ctx.fillStyle = pinkDeep;
        ctx.beginPath();
        ctx.ellipse(0, -4, 1.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soft ruby eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, -3.5, 0, 2.5, outline, 1.5);
            drawClosedEyeArc(ctx, 3.5, 0, 2.5, outline, 1.5);
        } else {
            ctx.fillStyle = pinkDeep;
            ctx.beginPath();
            ctx.ellipse(-3.5, -0.5, 2.8, 3.4, 0, 0, Math.PI * 2);
            ctx.ellipse(3.5, -0.5, 2.8, 3.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-4.2, -1.2, 1.1, 0, Math.PI * 2);
            ctx.arc(2.8, -1.2, 1.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nose
        ctx.fillStyle = pinkDeep;
        ctx.beginPath();
        ctx.ellipse(0, 3, 1.2, 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 5. 🔥 PHOENIX CHICK (Fiery Radiant Chick)
    function drawPhoenixChick(ctx, a, anim) {
        const { t, tailDynamic, isBlinking } = anim;
        const hoverLift = Math.sin(t * 2.5) * 3.0;
        ctx.translate(0, -6 + hoverLift);

        const fireRed = '#DC2626';
        const fireOrange = '#F97316';
        const fireYellow = '#FDE047';
        const outline = '#450A0A';

        // Flowing flame tail ribbons (smooth wave)
        for (let i = 0; i < 3; i++) {
            const spread = (i - 1) * 0.25;
            const wave = Math.sin(tailDynamic * 1.1 + i * 0.8) * 0.18;
            ctx.save();
            ctx.translate(-7, -4);
            ctx.rotate(-Math.PI * 0.6 + spread + wave);
            ctx.strokeStyle = fireOrange;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(10, 4, 18, 0);
            ctx.stroke();
            ctx.fillStyle = fireYellow;
            ctx.beginPath();
            ctx.arc(18, 0, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Far Wing
        const wingFlap = Math.sin(t * 5.2) * 0.34;
        ctx.save();
        ctx.translate(3, -10);
        ctx.scale(-1, 1);
        ctx.rotate(-wingFlap * 0.8);
        ctx.fillStyle = fireRed;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-9, -8, -12, -2);
        ctx.quadraticCurveTo(-7, 4, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Little Golden Talons tucked underneath
        const clawSwing = Math.sin(t * 3.2) * 1.5;
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(-2 + clawSwing, 1.5, 2.6, 1.8, 0.2, 0, Math.PI * 2);
        ctx.ellipse(2.5 - clawSwing, 1.5, 2.6, 1.8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Round Fiery Body
        const bodyGrad = ctx.createRadialGradient(0, -7, 2, 0, -7, 11);
        bodyGrad.addColorStop(0, fireYellow);
        bodyGrad.addColorStop(0.6, fireOrange);
        bodyGrad.addColorStop(1, fireRed);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -7, 10, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near Flapping Wing
        ctx.save();
        ctx.translate(-2, -9);
        ctx.rotate(wingFlap);
        ctx.fillStyle = fireOrange;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, -10, -14, -2);
        ctx.quadraticCurveTo(-8, 4, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Glowing Crest Feathers on head
        [-3, 0, 3].forEach((cx, idx) => {
            ctx.save();
            ctx.translate(2 + cx, -16);
            ctx.rotate((idx - 1) * 0.2 + Math.sin(t * 2.6 + idx) * 0.09);
            ctx.fillStyle = fireYellow;
            ctx.strokeStyle = fireRed;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-1.5, 2);
            ctx.lineTo(0, -7 - idx * 1.5);
            ctx.lineTo(1.5, 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Large Cute Bird Eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, 2, -7.8, 2.4, outline, 1.5);
        } else {
            ctx.fillStyle = '#450A0A';
            ctx.beginPath();
            ctx.ellipse(2, -8, 2.8, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(1.5, -9, 1.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cute golden beak
        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(6, -7);
        ctx.lineTo(10, -6);
        ctx.lineTo(6, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // 6. 🌙 MOON RABBIT (Celestial Indigo Bunny with Springy Hop & Floppy Ears)
    function drawMoonRabbit(ctx, a, anim) {
        const { t, isWalking, stride, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyColor = '#1E1B4B';
        const midBlue = '#312E81';
        const outline = '#0F172A';
        const crescentColor = '#FDE047';

        // Luminous White Cotton Tail (wiggling softly)
        ctx.save();
        ctx.translate(-11, -7 + Math.sin(tailDynamic * 1.5) * 1.1);
        ctx.fillStyle = '#F8FAFC';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Far Front Paw
        ctx.fillStyle = midBlue;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(4.5 - legSwing * 0.7, 0.2 - legLiftR, 3.2, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Midnight Fur Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 12);
        bodyGrad.addColorStop(0, '#4338CA');
        bodyGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8.5, 12, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Springy Back Hind Foot & Near Front Paw
        const backFootAngle = isWalking ? Math.sin(stride) * 0.25 : 0;
        ctx.fillStyle = midBlue;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(-5.5 + legSwing * 0.85, 0.5 - legLiftL, 5.2, 3.1, backFootAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(6.5 + legSwing * 0.75, 0.5 - legLiftL * 0.8, 3.4, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.save();
        ctx.translate(5, -16 + headBob);

        // Long Silky Ears (flopping gently with hop & breeze)
        const earFlop = isWalking ? Math.sin(stride - 0.6) * 0.16 : Math.sin(t * 1.9) * 0.06;
        [-4, 3].forEach((ex, idx) => {
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate((idx === 0 ? -0.18 : 0.18) - earFlop * (idx === 0 ? 1 : 0.7));
            ctx.fillStyle = bodyColor;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(0, -9, 3.5, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Inner Ear Luminescence
            ctx.fillStyle = '#818CF8';
            ctx.beginPath();
            ctx.ellipse(0, -8, 1.8, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Face
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Crescent Rune on Forehead
        ctx.fillStyle = crescentColor;
        ctx.beginPath();
        ctx.arc(0, -4.5, 2.5, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.arc(-0.8, -4.5, 2.0, 1.5 * Math.PI, 0.5 * Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Starlight Specks on cheeks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(-6, 2, 0.8, 0, Math.PI * 2);
        ctx.arc(6, 2, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Ruby Moon Eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, -3, 0.2, 2.4, '#818CF8', 1.5);
            drawClosedEyeArc(ctx, 3, 0.2, 2.4, '#818CF8', 1.5);
        } else {
            ctx.fillStyle = '#BE123C';
            ctx.beginPath();
            ctx.ellipse(-3, 0, 2.6, 3.2, 0, 0, Math.PI * 2);
            ctx.ellipse(3, 0, 2.6, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-3.6, -0.8, 1.0, 0, Math.PI * 2);
            ctx.arc(2.4, -0.8, 1.0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nose & Whisker twitch
        const noseTwitch = Math.sin(t * 4.5) * 0.35;
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(0, 3.2 + noseTwitch, 1.2, 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 7. 🍄 MUSHROOM SPRITE (Waddling Shroom with Glowing Cap)
    function drawMushroomSprite(ctx, a, anim) {
        const { t, isWalking, stride, legSwing, legLiftL, legLiftR, headBob, isBlinking } = anim;
        const outline = '#450A0A';
        const waddle = isWalking ? Math.sin(stride) * 0.10 : Math.sin(t * 1.6) * 0.025;
        ctx.rotate(waddle);

        // Stubby feet (alternating step and lift)
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4.2 + legSwing * 0.65, 0.4 - legLiftL, 3.6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4.2 - legSwing * 0.65, 0.4 - legLiftR, 3.6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Far Stubby Arm
        const armSwing = isWalking ? Math.sin(stride) * 0.35 : Math.sin(t * 2.0) * 0.1;
        ctx.save();
        ctx.translate(7.5, -6.5);
        ctx.rotate(-0.3 - armSwing);
        ctx.fillStyle = '#FFFBEB';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(1.5, 0, 2.8, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Chubby Pear Body
        ctx.fillStyle = '#FFFBEB';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -7, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near Stubby Arm
        ctx.save();
        ctx.translate(-7.5, -6.5);
        ctx.rotate(0.3 + armSwing);
        ctx.fillStyle = '#FFFBEB';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-1.5, 0, 2.8, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Face features on body
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.ellipse(-3, -7, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(3, -7, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-3.5, -7.8, 0.8, 0, Math.PI * 2);
        ctx.arc(2.5, -7.8, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Rosy Blushing Cheeks
        ctx.fillStyle = '#FDA4AF';
        ctx.beginPath();
        ctx.arc(-5.5, -4.5, 1.8, 0, Math.PI * 2);
        ctx.arc(5.5, -4.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Huge Vibrant Scarlet Mushroom Cap
        ctx.save();
        const capSquish = isWalking ? Math.sin(stride * 2) * 0.04 : Math.sin(t * 2.2) * 0.02;
        ctx.translate(0, -14 + headBob * 0.6);
        ctx.scale(1 + capSquish, 1 - capSquish);

        // Gills underneath
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mushroom Cap Dome
        const capGrad = ctx.createRadialGradient(0, -6, 2, 0, -4, 15);
        capGrad.addColorStop(0, '#EF4444');
        capGrad.addColorStop(1, '#991B1B');
        ctx.fillStyle = capGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-15, 2);
        ctx.bezierCurveTo(-15, -16, 15, -16, 15, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White Polka Dots with soft glow
        ctx.fillStyle = '#FFFFFF';
        [[-7, -7, 3], [7, -6, 2.8], [0, -11, 3.2], [-11, -1, 2], [10, -1, 2.2]].forEach(([px, py, pr]) => {
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // 8. ☁️ CLOUD SPIRIT (Fluffy Cumulus with Billowing Lobes & Mini Rainbow)
    function drawCloudSpirit(ctx, a, anim) {
        const { t } = anim;
        const floatBob = Math.sin(t * 1.8) * 3.4;
        ctx.translate(0, -12 + floatBob);

        // Mini Rainbow Arch overhead
        ctx.save();
        ctx.translate(0, -18 + Math.sin(t * 2.2) * 0.8);
        const rainbowColors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
        rainbowColors.forEach((rc, idx) => {
            ctx.strokeStyle = rc;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 11 - idx * 1.5, Math.PI, 0);
            ctx.stroke();
        });
        ctx.restore();

        // Little trailing cloud puff feet underneath
        const puffSwing = Math.sin(t * 2.6) * 2.0;
        ctx.fillStyle = '#E0F2FE';
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(-4.5 + puffSwing, 7.5, 3.2, 0, Math.PI * 2);
        ctx.arc(4.5 - puffSwing, 7.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Multi-lobed Puffy Cloud Body (each lobe breathes gently out of phase)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = '#BAE6FD';
        ctx.lineWidth = 2;

        const lobes = [
            [-8, 0, 9],
            [8, 0, 9],
            [0, -4, 11],
            [-5, 4, 7],
            [5, 4, 7]
        ];

        lobes.forEach(([lx, ly, lr], idx) => {
            const rPulse = lr + Math.sin(t * 2.1 + idx * 1.1) * 0.55;
            ctx.beginPath();
            ctx.arc(lx, ly, rPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Sky-blue bottom shadow
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath();
        ctx.ellipse(0, 6, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Smiling Face
        ctx.strokeStyle = '#0369A1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-4, -2, 2.5, Math.PI, 0);
        ctx.arc(4, -2, 2.5, Math.PI, 0);
        ctx.stroke();

        // Rosy Blushing Cheeks
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(-7, 2, 2, 0, Math.PI * 2);
        ctx.arc(7, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Sweet Smile
        ctx.beginPath();
        ctx.arc(0, 1, 2, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }

    // 9. 🪼 STAR JELLYFISH (Bioluminescent Cosmic Bell with Calm Hypnotic Ocean Pulse)
    function drawStarJellyfish(ctx, a, anim) {
        const { t } = anim;
        const floatBob = Math.sin(t * 1.5) * 3.5;
        const pulse = 1.0 + Math.sin(t * 1.8) * 0.085;
        ctx.translate(0, -10 + floatBob);
        ctx.scale(1 / pulse, pulse);

        // Flowing Ribbon Tentacles (5 tentacles swaying in a slow travelling wave)
        for (let i = 0; i < 5; i++) {
            const spread = (i - 2) * 3.6;
            const wave1 = Math.sin(t * 2.0 + i * 0.65) * 2.6;
            const wave2 = Math.cos(t * 1.8 + i * 0.85) * 3.2;
            ctx.strokeStyle = (i % 2 === 0) ? 'rgba(56, 189, 248, 0.78)' : 'rgba(192, 132, 252, 0.78)';
            ctx.lineWidth = (i === 2) ? 2.2 : 1.8;
            ctx.beginPath();
            ctx.moveTo(spread, 4);
            ctx.bezierCurveTo(
                spread + wave1, 11,
                spread - wave1 * 0.8, 17,
                spread + wave2, 23
            );
            ctx.stroke();

            // Tiny bioluminescent bead at tentacle tip
            ctx.fillStyle = '#FEF08A';
            ctx.beginPath();
            ctx.arc(spread + wave2, 23, 1.1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bioluminescent Bell Cap
        const bellGrad = ctx.createRadialGradient(0, -6, 2, 0, -4, 15);
        bellGrad.addColorStop(0, '#E0F2FE');
        bellGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.88)');
        bellGrad.addColorStop(1, 'rgba(168, 85, 247, 0.75)');

        ctx.fillStyle = bellGrad;
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-13, 4);
        ctx.bezierCurveTo(-14, -15, 14, -15, 13, 4);
        ctx.bezierCurveTo(7, 6.5, -7, 6.5, -13, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner glowing star core
        const starScale = 1.0 + Math.sin(t * 2.4) * 0.12;
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(0, -3, 3.0 * starScale, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle points on cap
        ctx.fillStyle = '#FFFFFF';
        [[-5, -6], [5, -6], [0, -10]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 10. 🦎 AXOLOTL SPIRIT (Sweet Pink Aquatic Salamander with Waddling Feet & Fluttering Gills)
    function drawAxolotlSpirit(ctx, a, anim) {
        const { t, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyPink = '#FBCFE8';
        const darkPink = '#F472B6';
        const gillCyan = '#22D3EE';
        const outline = '#9D174D';

        // Flat swimming tail
        ctx.save();
        const tailWag = Math.sin(tailDynamic * 1.1) * 0.22;
        ctx.translate(-8, -4);
        ctx.rotate(tailWag);
        ctx.fillStyle = '#F472B6';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -3.5);
        ctx.quadraticCurveTo(-10, -7.5, -17, Math.sin(t * 2.5) * 1.5);
        ctx.quadraticCurveTo(-10, 7.5, 0, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Far-side Paws
        ctx.fillStyle = darkPink;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-6 - legSwing * 0.75, -0.3 - legLiftR, 3.3, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4 + legSwing * 0.75, -0.3 - legLiftL, 3.3, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chubby Body
        ctx.fillStyle = bodyPink;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -6.5, 12, 8.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near-side Paws
        ctx.fillStyle = darkPink;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4 + legSwing * 0.85, 0.7 - legLiftL, 3.6, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(6 - legSwing * 0.85, 0.7 - legLiftR, 3.6, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Axolotl Wide Head
        ctx.save();
        ctx.translate(5, -13 + headBob * 0.8);

        // 6 Branching Feathery External Gills
        [-1, 1].forEach((side) => {
            for (let g = 0; g < 3; g++) {
                const wave = Math.sin(t * 2.1 + g * 0.7) * 0.11;
                ctx.save();
                ctx.translate(side * 8, -4 + g * 3.5);
                ctx.rotate(side * (0.3 + g * 0.2) + wave);
                ctx.strokeStyle = darkPink;
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(side * 6, -1);
                ctx.stroke();
                ctx.fillStyle = gillCyan;
                ctx.beginPath();
                ctx.arc(side * 6, -1, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        // Face Base
        ctx.fillStyle = bodyPink;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sweet Round Bead Eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, -4, -0.8, 2.0, outline, 1.4);
            drawClosedEyeArc(ctx, 4, -0.8, 2.0, outline, 1.4);
        } else {
            ctx.fillStyle = '#831843';
            ctx.beginPath();
            ctx.arc(-4, -1, 2.2, 0, Math.PI * 2);
            ctx.arc(4, -1, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-4.6, -1.6, 0.9, 0, Math.PI * 2);
            ctx.arc(3.4, -1.6, 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Axolotl Wide Happy Smile :D
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 1.5, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    // 11. 🐾 TANUKI SPIRIT (Japanese Raccoon with Stepping Feet, Paws & Magic Leaf)
    function drawTanukiSpirit(ctx, a, anim) {
        const { t, isWalking, stride, legSwing, legLiftL, legLiftR, headBob, tailDynamic, isBlinking } = anim;
        const bodyBrown = '#78350F';
        const tanBelly = '#FEF3C7';
        const darkMask = '#292524';
        const outline = '#451A03';

        // Striped Fluffy Tail
        ctx.save();
        const tailWag = Math.sin(tailDynamic * 1.15) * 0.24;
        ctx.translate(-9, -6);
        ctx.rotate(-0.3 + tailWag);
        ctx.fillStyle = bodyBrown;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Tail Dark Stripe
        ctx.fillStyle = darkMask;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 4, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dark Stubby Feet (stepping left and right)
        ctx.fillStyle = darkMask;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4.5 + legSwing * 0.75, 0.6 - legLiftL, 3.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4.5 - legSwing * 0.75, 0.6 - legLiftR, 3.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Round Chubby Body
        ctx.fillStyle = bodyBrown;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 12, 10.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Potbelly Patch
        ctx.fillStyle = tanBelly;
        ctx.beginPath();
        ctx.ellipse(2, -6, 7.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Little Front Paws (swinging gently with step)
        const armSwing = isWalking ? Math.sin(stride) * 1.8 : Math.sin(t * 2.0) * 0.5;
        ctx.fillStyle = darkMask;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-7.5, -6.5 + armSwing, 2.8, 2.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(8.5, -6.5 - armSwing, 2.8, 2.2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.save();
        ctx.translate(4, -17 + headBob);

        // Rounded Ears
        [-5, 5].forEach(ex => {
            ctx.fillStyle = bodyBrown;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(ex, -6, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = tanBelly;
            ctx.beginPath();
            ctx.arc(ex, -6, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Face
        ctx.fillStyle = bodyBrown;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bandit Eye Mask
        ctx.fillStyle = darkMask;
        ctx.beginPath();
        ctx.ellipse(-3.5, 0, 4, 3, -0.2, 0, Math.PI * 2);
        ctx.ellipse(3.5, 0, 4, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        if (isBlinking) {
            drawClosedEyeArc(ctx, -3.5, 0.2, 2.0, '#FEF3C7', 1.3);
            drawClosedEyeArc(ctx, 3.5, 0.2, 2.0, '#FEF3C7', 1.3);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(-3.5, 0, 1.6, 0, Math.PI * 2);
            ctx.arc(3.5, 0, 1.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-3.2, 0, 1.0, 0, Math.PI * 2);
            ctx.arc(3.8, 0, 1.0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Button Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 3, 1.2, 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Signature Magic Green Leaf perched atop head!
        ctx.save();
        ctx.translate(0, -9);
        const leafWobble = Math.sin(t * 2.4) * 0.14;
        ctx.rotate(leafWobble);
        ctx.fillStyle = '#22C55E';
        ctx.strokeStyle = '#15803D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.quadraticCurveTo(-5, -3, 0, -8);
        ctx.quadraticCurveTo(5, -3, 0, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    // 12. 🌿 MANDRAGORA (Root Sprite with Marching Root Feet, Arms & 3 Sprout Leaves)
    function drawMandragora(ctx, a, anim) {
        const { t, isWalking, stride, legSwing, legLiftL, legLiftR, headBob } = anim;
        const rootWood = '#B45309';
        const lightBark = '#D97706';
        const outline = '#451A03';

        // Root Feet (marching left and right)
        ctx.fillStyle = rootWood;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(-4 + legSwing * 0.7, 0.8 - legLiftL, 3.2, 2.2, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4 - legSwing * 0.7, 0.8 - legLiftR, 3.2, 2.2, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Little Root Arms waving on sides
        const armWave = isWalking ? Math.sin(stride) * 0.35 : Math.sin(t * 2.0) * 0.12;
        [-1, 1].forEach(side => {
            ctx.save();
            ctx.translate(side * 8.5, -7);
            ctx.rotate(side * 0.4 + armWave);
            ctx.fillStyle = rootWood;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(side * 2, 0, 2.8, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Mandrake Root Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 11);
        bodyGrad.addColorStop(0, lightBark);
        bodyGrad.addColorStop(1, rootWood);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 10, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3 Fresh Sprouting Leaves on top (smooth gentle sway)
        [-4, 0, 4].forEach((lx, idx) => {
            ctx.save();
            ctx.translate(lx, -18 + headBob * 0.5);
            const leafSway = Math.sin(t * 2.2 + idx * 0.85) * 0.16;
            ctx.rotate((idx - 1) * 0.35 + leafSway);
            ctx.fillStyle = '#4ADE80';
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 2);
            ctx.quadraticCurveTo(-4, -5, 0, -11 - (idx === 1 ? 3 : 0));
            ctx.quadraticCurveTo(4, -5, 0, 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // Sleeping / Happy Face (^-^)
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-3, -7, 2, Math.PI, 0);
        ctx.arc(3, -7, 2, Math.PI, 0);
        ctx.stroke();

        // Rosy Cheeks
        ctx.fillStyle = '#F87171';
        ctx.beginPath();
        ctx.arc(-5.5, -4, 1.5, 0, Math.PI * 2);
        ctx.arc(5.5, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute O-mouth
        ctx.fillStyle = outline;
        ctx.beginPath();
        ctx.arc(0, -4.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 13. 🐌 RAINBOW SNAIL (Iridescent Pastel Spiral Shell with Rippling Foot & Swaying Eyestalks)
    function drawRainbowSnail(ctx, a, anim) {
        const { t, isWalking, stride, isBlinking } = anim;
        const bodyCream = '#FEF9C3';
        const outline = '#78350F';

        // Soft Snail Body with rippling muscular foot wave along the bottom
        const waveSpeed = isWalking ? 4.2 : 2.0;
        const w1 = Math.sin(t * waveSpeed) * 1.1;
        const w2 = Math.cos(t * waveSpeed) * 1.1;
        ctx.fillStyle = bodyCream;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-12, 1);
        ctx.bezierCurveTo(-4, 2.8 + w1, 5, 2.8 + w2, 14, 1);
        ctx.quadraticCurveTo(16, -6, 12, -7);
        ctx.quadraticCurveTo(8, -4, 0, -3);
        ctx.quadraticCurveTo(-10, -2, -12, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyestalks with swaying & blinking eyes
        ctx.save();
        ctx.translate(12, -7);
        [[-2, -5, 0], [2, -5, 1]].forEach(([ex, ey, idx]) => {
            const swayX = ex + Math.sin(t * 2.2 + idx * 1.2) * 0.9;
            const swayY = ey + Math.cos(t * 2.0 + idx) * 0.5;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(ex * 0.5, 0);
            ctx.lineTo(swayX, swayY);
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(swayX, swayY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            if (!isBlinking) {
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(swayX + 0.3, swayY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();

        // Large Rainbow Spiral Shell (rocking gently as snail glides)
        ctx.save();
        const shellRock = Math.sin(t * 2.0 + (isWalking ? stride * 0.3 : 0)) * 0.06;
        ctx.translate(-2, -9);
        ctx.rotate(shellRock);
        const rainbowTiers = ['#FCA5A5', '#FDE047', '#86EFAC', '#93C5FD', '#D8B4FE'];
        rainbowTiers.forEach((col, idx) => {
            const rad = 10 - idx * 1.8;
            ctx.fillStyle = col;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Iridescent Shell Sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(-3, -4, 3, 6, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 14. 🦔 STARLIGHT HEDGEHOG (Golden Starry Quills & Scurrying Paws)
    function drawStarlightHedgehog(ctx, a, anim) {
        const { t, legSwing, legLiftL, legLiftR, isBlinking } = anim;
        const creamBody = '#FFFBEB';
        const quillBrown = '#78350F';
        const starGold = '#FDE047';
        const outline = '#451A03';

        // Radiating Starry Quills Mantle (ruffling gently)
        for (let i = 0; i < 9; i++) {
            const ruffle = Math.sin(t * 2.0 + i * 0.45) * 0.05;
            const ang = Math.PI * 0.9 + (i / 8) * Math.PI * 1.1 + ruffle;
            ctx.save();
            ctx.translate(-2, -7);
            ctx.rotate(ang);
            ctx.strokeStyle = quillBrown;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(13, 0);
            ctx.stroke();
            // Golden Star Glint at tip
            const glintRadius = 1.6 + Math.sin(t * 2.8 + i) * 0.35;
            ctx.fillStyle = starGold;
            ctx.beginPath();
            ctx.arc(13, 0, glintRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Far-side Paws
        ctx.fillStyle = '#FCD34D';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(-5.2 - legSwing * 0.7, -0.2 - legLiftR, 2.8, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(3.0 + legSwing * 0.7, -0.2 - legLiftL, 2.8, 1.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chubby Face & Body
        ctx.fillStyle = creamBody;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -6, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Near-side Scurrying Paws
        ctx.fillStyle = '#FDE68A';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-3.5 + legSwing * 0.8, 0.6 - legLiftL, 3.1, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4.8 - legSwing * 0.8, 0.6 - legLiftR, 3.1, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Snout & Sniffing Nose
        const sniff = Math.sin(t * 3.5) * 0.5;
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.ellipse(6, -4 + sniff * 0.4, 4.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Button Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(9.5, -4.5 + sniff, 1.3, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Round Shiny Eye
        if (isBlinking) {
            drawClosedEyeArc(ctx, 3.5, -6.3, 1.9, outline, 1.4);
        } else {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(3.5, -6.5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(3.0, -7.2, 0.9, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 15. 🐸 JADE FROG (Polished Emerald Gem Frog with Springy Hind Legs & Calm Throat Sac)
    function drawJadeFrog(ctx, a, anim) {
        const { t, walkHop, legSwing, legLiftL, legLiftR, isBlinking } = anim;
        const jadeMain = '#059669';
        const jadeLight = '#34D399';
        const bellyCream = '#D1FAE5';
        const outline = '#022C22';

        // Webbed Back Legs (extend downward when hopping in the air, fold neatly on ground)
        const hopExtend = walkHop * 0.9;
        ctx.fillStyle = jadeMain;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        [-9, 9].forEach((fx, idx) => {
            const side = idx === 0 ? -1 : 1;
            ctx.beginPath();
            ctx.ellipse(fx + side * 0.5, 1 + hopExtend, 4.8, 2.6, side * (0.1 + hopExtend * 0.08), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // Plump Round Frog Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 12);
        bodyGrad.addColorStop(0, jadeLight);
        bodyGrad.addColorStop(1, jadeMain);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cream Throat Sac (pulsing calmly with breath)
        const sacPulse = 1.0 + Math.sin(t * 2.1) * 0.09;
        ctx.fillStyle = bellyCream;
        ctx.beginPath();
        ctx.ellipse(0, -5, 6 * sacPulse, 5 * sacPulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Front Frog Hands (stepping / bracing)
        ctx.fillStyle = jadeLight;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-4.5 + legSwing * 0.4, 1.0 - legLiftL * 0.6 + hopExtend * 0.5, 3.0, 2.0, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(4.5 - legSwing * 0.4, 1.0 - legLiftR * 0.6 + hopExtend * 0.5, 3.0, 2.0, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Giant Gemstone Eyes sitting atop head
        [-5, 5].forEach((ex) => {
            ctx.fillStyle = bodyGrad;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(ex, -16, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (isBlinking) {
                drawClosedEyeArc(ctx, ex, -16, 2.4, outline, 1.4);
            } else {
                // Golden Gem Iris
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath();
                ctx.arc(ex, -16, 2.8, 0, Math.PI * 2);
                ctx.fill();

                // Horizontal Slit Pupil
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.ellipse(ex, -16, 2.2, 0.9, 0, 0, Math.PI * 2);
                ctx.fill();

                // Specular Glint
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(ex - 1.2, -17.5, 1.0, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Wide Froggy Smile
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -7, 6, 0.3, Math.PI - 0.3);
        ctx.stroke();
    }

    // 6. RENDER PET PREVIEW ON CANVAS (For Gallery & Cards)
    function renderPetPreviewToCanvas(canvas, petId, customNow) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const nowMs = typeof customNow === 'number' ? customNow : performance.now();
        const fakeAnimal = {
            variant: petId,
            petId: petId,
            type: 'exclusive',
            x: 0,
            y: 0,
            facingLeft: false,
            state: 'walking',
            hopPhase: nowMs * 0.0055,
            tailPhase: nowMs * 0.002,
            wingPhase: nowMs * 0.004,
            petAnim: 0
        };

        ctx.save();
        ctx.translate(w * 0.5, h * 0.68);
        const scaleFactor = Math.min(w, h) / 54;
        ctx.scale(scaleFactor, scaleFactor);

        drawExclusivePet(ctx, fakeAnimal, nowMs);
        ctx.restore();
    }

    // 7. EXPORT TO GLOBAL WINDOW OBJECT
    window.EXCLUSIVE_PETS = EXCLUSIVE_PETS;
    window.EXCLUSIVE_PET_LIST = EXCLUSIVE_PET_LIST;
    window.getDiscoveredPets = getDiscoveredPets;
    window.isPetDiscovered = isPetDiscovered;
    window.markPetDiscovered = markPetDiscovered;
    window.getExclusivePetDef = getExclusivePetDef;
    window.isExclusivePetType = isExclusivePetType;
    window.pickRandomExclusivePet = pickRandomExclusivePet;
    window.spawnExclusivePet = spawnExclusivePet;
    window.drawExclusivePet = drawExclusivePet;
    window.renderPetPreviewToCanvas = renderPetPreviewToCanvas;

})();

