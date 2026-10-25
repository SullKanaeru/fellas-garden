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

        ctx.save();
        ctx.translate(a.x, a.y);

        const isScared = a.isBeingDragged || a.state === 'scared';
        const dragLift = a.isBeingDragged ? -16 : 0;
        const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;
        const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;
        const walkHop = (a.state === 'walking') ? Math.abs(Math.sin((a.hopPhase || 0))) * 3.5 : 0;
        const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;

        // Ground shadow
        const shadowRadius = (def && def.tier === 'legendary') ? 18 : 14;
        ctx.fillStyle = 'rgba(20, 35, 15, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 2 - dragLift, isScared ? shadowRadius * 0.75 : shadowRadius, isScared ? 4 : 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);
        if (a.facingLeft) ctx.scale(-1, 1);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw individual pet
        switch (petId) {
            case 'kurama':
                drawChibiKurama(ctx, a, now);
                break;
            case 'baby_dragon':
                drawBabyDragon(ctx, a, now);
                break;
            case 'crystal_deer':
                drawCrystalDeer(ctx, a, now);
                break;
            case 'sakura_kitsune':
                drawSakuraKitsune(ctx, a, now);
                break;
            case 'phoenix_chick':
                drawPhoenixChick(ctx, a, now);
                break;
            case 'moon_rabbit':
                drawMoonRabbit(ctx, a, now);
                break;
            case 'mushroom_sprite':
                drawMushroomSprite(ctx, a, now);
                break;
            case 'cloud_spirit':
                drawCloudSpirit(ctx, a, now);
                break;
            case 'star_jellyfish':
                drawStarJellyfish(ctx, a, now);
                break;
            case 'axolotl_spirit':
                drawAxolotlSpirit(ctx, a, now);
                break;
            case 'tanuki_spirit':
                drawTanukiSpirit(ctx, a, now);
                break;
            case 'mandragora':
                drawMandragora(ctx, a, now);
                break;
            case 'rainbow_snail':
                drawRainbowSnail(ctx, a, now);
                break;
            case 'starlight_hedgehog':
                drawStarlightHedgehog(ctx, a, now);
                break;
            case 'jade_frog':
                drawJadeFrog(ctx, a, now);
                break;
            default:
                drawChibiKurama(ctx, a, now);
                break;
        }

        ctx.restore();
    }

    // -------------------------------------------------------------
    // DETAILED CHIBI PET DRAWING IMPLEMENTATIONS
    // -------------------------------------------------------------

    // 1. 🦊 CHIBI KURAMA (Nine-Tailed Fox with Flame Tails)
    function drawChibiKurama(ctx, a, now) {
        const bodyColor = '#EA580C';
        const darkFur = '#9A3412';
        const lightFur = '#FED7AA';
        const outlineColor = '#431407';

        // Ambient Flame Tails (9 tails fanning out)
        for (let i = 0; i < 9; i++) {
            const spread = (i - 4) * 0.22;
            const wave = Math.sin(now * 4 + i * 0.6) * 0.15;
            const tailAngle = -Math.PI * 0.45 + spread + wave;
            ctx.save();
            ctx.translate(-8, -10);
            ctx.rotate(tailAngle);

            // Tail Flame Gradient
            const tailGrad = ctx.createLinearGradient(0, 0, 24, 0);
            tailGrad.addColorStop(0, darkFur);
            tailGrad.addColorStop(0.5, '#F97316');
            tailGrad.addColorStop(0.9, '#FDE047');
            tailGrad.addColorStop(1, '#FFFBEB');

            ctx.fillStyle = tailGrad;
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.quadraticCurveTo(12, -7, 24, 0);
            ctx.quadraticCurveTo(12, 7, 0, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Flame core highlight
            ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
            ctx.beginPath();
            ctx.ellipse(14, 0, 6, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Paws
        ctx.fillStyle = darkFur;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 4, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(4, 0, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chubby Chibi Body
        const bodyGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, 14);
        bodyGrad.addColorStop(0, '#FB923C');
        bodyGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -9, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chest / Belly Fluff
        ctx.fillStyle = lightFur;
        ctx.beginPath();
        ctx.ellipse(2, -7, 7, 6, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Big Cute Chibi Fox Head
        ctx.save();
        ctx.translate(4, -18);

        // Pointy Fox Ears
        [-7, 7].forEach((ex, idx) => {
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate(idx === 0 ? -0.25 : 0.25);
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

        // Cute Shiny Fox Eyes with red liner
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

        // Eye glints
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-4.8, -1.8, 1.2, 0, Math.PI * 2);
        ctx.arc(3.2, -1.8, 1.2, 0, Math.PI * 2);
        ctx.arc(-3.2, 0.5, 0.6, 0, Math.PI * 2);
        ctx.arc(4.8, 0.5, 0.6, 0, Math.PI * 2);
        ctx.fill();

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
    function drawBabyDragon(ctx, a, now) {
        const hoverLift = Math.sin(now * 3.5) * 4;
        ctx.translate(0, -6 + hoverLift);

        const emeraldDark = '#065F46';
        const emeraldMain = '#059669';
        const emeraldLight = '#34D399';
        const bellyColor = '#D1FAE5';
        const outline = '#022C22';

        // Dragon Tail with Spade
        ctx.save();
        const tailWag = Math.sin(now * 4) * 0.2;
        ctx.translate(-10, -3);
        ctx.rotate(tailWag);
        ctx.strokeStyle = emeraldDark;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, 4, -16, -2);
        ctx.stroke();
        // Tail Spade
        ctx.fillStyle = emeraldLight;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-16, -2);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-22, -2);
        ctx.lineTo(-20, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Dragon Wings (flapping gracefully)
        const wingFlap = Math.sin(now * 7) * 0.35;
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

        // Cute Dragon Head
        ctx.save();
        ctx.translate(4, -17);

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

        // Highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-3.8, -1.8, 1.2, 0, Math.PI * 2);
        ctx.arc(2.2, -1.8, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 3. 🦌 CRYSTAL DEER (Prismatic Rainbow Antlers)
    function drawCrystalDeer(ctx, a, now) {
        const bodyColor = '#E0F2FE';
        const shadeColor = '#BAE6FD';
        const outline = '#0369A1';

        // Delicate hooves
        ctx.fillStyle = '#0284C7';
        [-6, -2, 3, 7].forEach(hx => {
            ctx.beginPath();
            ctx.ellipse(hx, 0, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Slender Body
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -9, 12, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dappled Starry White Spots
        ctx.fillStyle = '#FFFFFF';
        [[-4, -11], [1, -12], [-2, -8], [4, -9]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Elegant Neck & Head
        ctx.save();
        ctx.translate(6, -18);

        // Prismatic Rainbow Crystal Antlers
        [-4, 4].forEach((ax, idx) => {
            ctx.save();
            ctx.translate(ax, -7);
            ctx.rotate(idx === 0 ? -0.3 : 0.3);

            // Shimmering rainbow gradient cycling with time
            const prismGrad = ctx.createLinearGradient(0, 0, 0, -18);
            const hueOffset = (now * 40 + idx * 60) % 360;
            prismGrad.addColorStop(0, `hsl(${hueOffset}, 80%, 75%)`);
            prismGrad.addColorStop(0.5, `hsl(${(hueOffset + 120) % 360}, 85%, 80%)`);
            prismGrad.addColorStop(1, `hsl(${(hueOffset + 240) % 360}, 90%, 88%)`);

            ctx.fillStyle = prismGrad;
            ctx.strokeStyle = '#0284C7';
            ctx.lineWidth = 1.2;
            // Antler branches
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

            // Antler crystal sparkle glints
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(-6, -19, 1.4, 0, Math.PI * 2);
            ctx.arc(7, -19, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Ears
        ctx.fillStyle = shadeColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-7, -3, 5, 2.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(7, -3, 5, 2.5, 0.4, 0, Math.PI * 2);
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

        // Little nose
        ctx.fillStyle = '#0284C7';
        ctx.beginPath();
        ctx.ellipse(0, 3.2, 1.4, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 4. 🌸 SAKURA KITSUNE (Cherry Blossom Petal Fox)
    function drawSakuraKitsune(ctx, a, now) {
        const bodyColor = '#FFF5F7';
        const pinkAccent = '#F472B6';
        const pinkDeep = '#DB2777';
        const outline = '#831843';

        // Twin Sakura Petal Tails
        [-1, 1].forEach((side, idx) => {
            ctx.save();
            const wag = Math.sin(now * 3 + idx) * 0.2;
            ctx.translate(-8, -8);
            ctx.rotate(-Math.PI * 0.4 + side * 0.3 + wag);

            // Petal gradient
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

        // Paws
        ctx.fillStyle = pinkAccent;
        ctx.beginPath();
        ctx.ellipse(-5, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(4, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Porcelain Body
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.save();
        ctx.translate(4, -17);

        // Ears with pink tips
        [-6, 6].forEach((ex, idx) => {
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate(idx === 0 ? -0.25 : 0.25);
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
            ctx.moveTo(-1, -7); ctx.lineTo(0, -10); ctx.lineTo(1, -7); ctx.closePath(); ctx.fill();
            ctx.restore();
        });

        // Head
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

        // Nose
        ctx.fillStyle = pinkDeep;
        ctx.beginPath();
        ctx.ellipse(0, 3, 1.2, 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 5. 🔥 PHOENIX CHICK (Fiery Radiant Chick)
    function drawPhoenixChick(ctx, a, now) {
        const hoverLift = Math.sin(now * 4.5) * 3;
        ctx.translate(0, -6 + hoverLift);

        const fireRed = '#DC2626';
        const fireOrange = '#F97316';
        const fireYellow = '#FDE047';
        const outline = '#450A0A';

        // Flowing flame tail ribbons
        for (let i = 0; i < 3; i++) {
            const spread = (i - 1) * 0.25;
            const wave = Math.sin(now * 5 + i) * 0.2;
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

        // Flapping wings
        const wingFlap = Math.sin(now * 12) * 0.4;
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

        // Glowing Crest Feathers on head
        [-3, 0, 3].forEach((cx, idx) => {
            ctx.save();
            ctx.translate(2 + cx, -16);
            ctx.rotate((idx - 1) * 0.2 + Math.sin(now * 4 + idx) * 0.1);
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
        ctx.fillStyle = '#450A0A';
        ctx.beginPath();
        ctx.ellipse(2, -8, 2.8, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(1.5, -9, 1.1, 0, Math.PI * 2);
        ctx.fill();

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

    // 6. 🌙 MOON RABBIT (Celestial Indigo Bunny with Crescent Rune)
    function drawMoonRabbit(ctx, a, now) {
        const bodyColor = '#1E1B4B';
        const midBlue = '#312E81';
        const outline = '#0F172A';
        const crescentColor = '#FDE047';

        // Luminous White Cotton Tail
        ctx.save();
        ctx.translate(-11, -7);
        ctx.fillStyle = '#F8FAFC';
        ctx.shadowColor = '#60A5FA';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Back Paw
        ctx.fillStyle = midBlue;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 5, 3.2, 0, 0, Math.PI * 2);
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
        ctx.ellipse(0, -8, 12, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.save();
        ctx.translate(5, -16);

        // Long Silky Ears
        [-4, 3].forEach((ex, idx) => {
            ctx.save();
            ctx.translate(ex, -6);
            ctx.rotate(idx === 0 ? -0.15 : 0.2);
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

        // Nose & Whisker twitch
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(0, 3.2, 1.1, 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // 7. 🍄 MUSHROOM SPRITE (Waddling Shroom with Glowing Cap)
    function drawMushroomSprite(ctx, a, now) {
        const outline = '#450A0A';
        const waddle = (a.state === 'walking') ? Math.sin(now * 10) * 0.15 : 0;
        ctx.rotate(waddle);

        // Stubby feet
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-4, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(4, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chubby Pear Body
        ctx.fillStyle = '#FFFBEB';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -7, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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
        ctx.translate(0, -14);

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

    // 8. ☁️ CLOUD SPIRIT (Fluffy Cumulus with Mini Rainbow)
    function drawCloudSpirit(ctx, a, now) {
        const floatBob = Math.sin(now * 3) * 4;
        ctx.translate(0, -12 + floatBob);

        // Mini Rainbow Arch overhead
        ctx.save();
        ctx.translate(0, -18);
        const rainbowColors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
        rainbowColors.forEach((rc, idx) => {
            ctx.strokeStyle = rc;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 11 - idx * 1.5, Math.PI, 0);
            ctx.stroke();
        });
        ctx.restore();

        // Multi-lobed Puffy Cloud Body
        const outline = '#0284C7';
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

        lobes.forEach(([lx, ly, lr]) => {
            ctx.beginPath();
            ctx.arc(lx, ly, lr, 0, Math.PI * 2);
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
        // Happy Arc Eyes (^^)
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

    // 9. 🪼 STAR JELLYFISH (Bioluminescent Cosmic Bell)
    function drawStarJellyfish(ctx, a, now) {
        const floatBob = Math.sin(now * 2.5) * 4;
        const pulse = 1.0 + Math.sin(now * 3.5) * 0.12;
        ctx.translate(0, -10 + floatBob);
        ctx.scale(1 / pulse, pulse);

        // Flowing Ribbon Tentacles (4 tentacles swaying)
        for (let i = 0; i < 4; i++) {
            const spread = (i - 1.5) * 4.5;
            const wave = Math.sin(now * 4 + i) * 3;
            ctx.strokeStyle = (i % 2 === 0) ? 'rgba(56, 189, 248, 0.75)' : 'rgba(192, 132, 252, 0.75)';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(spread, 4);
            ctx.bezierCurveTo(spread + wave, 12, spread - wave, 18, spread + wave * 0.5, 24);
            ctx.stroke();
        }

        // Bioluminescent Bell Cap
        const bellGrad = ctx.createRadialGradient(0, -6, 2, 0, -4, 15);
        bellGrad.addColorStop(0, '#E0F2FE');
        bellGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
        bellGrad.addColorStop(1, 'rgba(168, 85, 247, 0.7)');

        ctx.fillStyle = bellGrad;
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-13, 4);
        ctx.bezierCurveTo(-14, -15, 14, -15, 13, 4);
        ctx.bezierCurveTo(7, 6, -7, 6, -13, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner glowing star core
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(0, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle points on cap
        ctx.fillStyle = '#FFFFFF';
        [[-5, -6], [5, -6], [0, -10]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 10. 🦎 AXOLOTL SPIRIT (Sweet Pink Aquatic Salamander)
    function drawAxolotlSpirit(ctx, a, now) {
        const bodyPink = '#FBCFE8';
        const darkPink = '#F472B6';
        const gillCyan = '#22D3EE';
        const outline = '#9D174D';

        // Flat swimming tail
        ctx.save();
        const tailWag = Math.sin(now * 4) * 0.2;
        ctx.translate(-8, -4);
        ctx.rotate(tailWag);
        ctx.fillStyle = '#F472B6';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.quadraticCurveTo(-10, -7, -16, 0);
        ctx.quadraticCurveTo(-10, 7, 0, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Paws
        ctx.fillStyle = darkPink;
        ctx.beginPath();
        ctx.ellipse(-5, 0, 3.5, 2.2, 0, 0, Math.PI * 2);
        ctx.ellipse(5, 0, 3.5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chubby Body
        ctx.fillStyle = bodyPink;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -6, 12, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Axolotl Wide Head
        ctx.save();
        ctx.translate(5, -13);

        // 6 Branching Feathery External Gills (3 each side with cyan tips)
        [-1, 1].forEach((side, sIdx) => {
            for (let g = 0; g < 3; g++) {
                const wave = Math.sin(now * 3 + g) * 0.15;
                ctx.save();
                ctx.translate(side * 8, -4 + g * 3.5);
                ctx.rotate(side * (0.3 + g * 0.2) + wave);
                ctx.strokeStyle = darkPink;
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(side * 6, -1);
                ctx.stroke();
                // Cyan feather tips
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

        // Axolotl Wide Happy Smile :D
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 1.5, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    // 11. 🐾 TANUKI SPIRIT (Japanese Raccoon with Magic Leaf)
    function drawTanukiSpirit(ctx, a, now) {
        const bodyBrown = '#78350F';
        const tanBelly = '#FEF3C7';
        const darkMask = '#292524';
        const outline = '#451A03';

        // Striped Fluffy Tail
        ctx.save();
        const tailWag = Math.sin(now * 3.5) * 0.25;
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

        // Round Chubby Body
        ctx.fillStyle = bodyBrown;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, -8, 12, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Potbelly Patch
        ctx.fillStyle = tanBelly;
        ctx.beginPath();
        ctx.ellipse(2, -6, 7.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.save();
        ctx.translate(4, -17);

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

        // Button Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 3, 1.2, 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Signature Magic Green Leaf perched atop head!
        ctx.save();
        ctx.translate(0, -9);
        const leafWobble = Math.sin(now * 5) * 0.15;
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

    // 12. 🌿 MANDRAGORA (Root Sprite with 3 Sprout Leaves)
    function drawMandragora(ctx, a, now) {
        const rootWood = '#B45309';
        const lightBark = '#D97706';
        const outline = '#451A03';

        // Root Feet
        ctx.fillStyle = rootWood;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-4, 1, 3, 2, -0.2, 0, Math.PI * 2);
        ctx.ellipse(4, 1, 3, 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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

        // 3 Fresh Sprouting Leaves on top
        [-4, 0, 4].forEach((lx, idx) => {
            ctx.save();
            ctx.translate(lx, -18);
            const leafSway = Math.sin(now * 3.5 + idx) * 0.2;
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

    // 13. 🐌 RAINBOW SNAIL (Iridescent Pastel Spiral Shell)
    function drawRainbowSnail(ctx, a, now) {
        const bodyCream = '#FEF9C3';
        const outline = '#78350F';

        // Soft Snail Body
        ctx.fillStyle = bodyCream;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-12, 1);
        ctx.quadraticCurveTo(0, 3, 14, 1);
        ctx.quadraticCurveTo(16, -6, 12, -7);
        ctx.quadraticCurveTo(8, -4, 0, -3);
        ctx.quadraticCurveTo(-10, -2, -12, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyestalks with blinking eyes
        ctx.save();
        ctx.translate(12, -7);
        [[-2, -5], [2, -5]].forEach(([ex, ey]) => {
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(ex * 0.5, 0);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(ex, ey, 1, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Large Rainbow Spiral Shell
        ctx.save();
        ctx.translate(-2, -9);
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

    // 14. 🦔 STARLIGHT HEDGEHOG (Golden Starry Quills)
    function drawStarlightHedgehog(ctx, a, now) {
        const creamBody = '#FFFBEB';
        const quillBrown = '#78350F';
        const starGold = '#FDE047';
        const outline = '#451A03';

        // Radiating Starry Quills Mantle
        for (let i = 0; i < 9; i++) {
            const ang = Math.PI * 0.9 + (i / 8) * Math.PI * 1.1;
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
            ctx.fillStyle = starGold;
            ctx.beginPath();
            ctx.arc(13, 0, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Paws
        ctx.fillStyle = '#FDE68A';
        ctx.beginPath();
        ctx.ellipse(-4, 0, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(4, 0, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chubby Face & Body
        ctx.fillStyle = creamBody;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -6, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Snout
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        ctx.ellipse(6, -4, 4.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Button Nose
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(9.5, -4.5, 1.3, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Round Shiny Eye
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(3.5, -6.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(3.0, -7.2, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    // 15. 🐸 JADE FROG (Polished Emerald Gem Frog)
    function drawJadeFrog(ctx, a, now) {
        const jadeDark = '#064E3B';
        const jadeMain = '#059669';
        const jadeLight = '#34D399';
        const bellyCream = '#D1FAE5';
        const outline = '#022C22';

        // Webbed Back Feet
        ctx.fillStyle = jadeMain;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.2;
        [-9, 9].forEach(fx => {
            ctx.beginPath();
            ctx.ellipse(fx, 1, 4.5, 2.5, 0, 0, Math.PI * 2);
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

        // Cream Throat Sac (pulsing with breath)
        const sacPulse = 1.0 + Math.sin(now * 4) * 0.12;
        ctx.fillStyle = bellyCream;
        ctx.beginPath();
        ctx.ellipse(0, -5, 6 * sacPulse, 5 * sacPulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Giant Gemstone Eyes sitting atop head
        [-5, 5].forEach((ex, idx) => {
            ctx.fillStyle = bodyGrad;
            ctx.strokeStyle = outline;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(ex, -16, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

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
        });

        // Wide Froggy Smile
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -7, 6, 0.3, Math.PI - 0.3);
        ctx.stroke();
    }

    // 6. RENDER PET PREVIEW ON CANVAS (For Gallery & Cards)
    function renderPetPreviewToCanvas(canvas, petId) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const fakeAnimal = {
            variant: petId,
            petId: petId,
            type: 'exclusive',
            x: 0,
            y: 0,
            facingLeft: false,
            state: 'idle',
            hopPhase: 0,
            tailPhase: 0,
            wingPhase: 0,
            petAnim: 0
        };

        ctx.save();
        ctx.translate(w * 0.5, h * 0.68);
        const scaleFactor = Math.min(w, h) / 54;
        ctx.scale(scaleFactor, scaleFactor);

        drawExclusivePet(ctx, fakeAnimal, 0);
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
