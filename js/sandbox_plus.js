/********************************************************************
 * FELLA'S GARDEN - COZY SANDBOX PLUS EXPANSION (js/sandbox_plus.js)
 * Mengimplementasikan seluruh fitur lanjutan dari Game Design Ideas:
 * 1. Siklus 4 Musim (Semi 🌸, Panas ☀️, Gugur 🍂, Salju ❄️)
 * 2. Objek Dekorasi & Bangunan Mini Kebun (Drag & Drop + Fisika Medan)
 * 3. Kedekatan Hewan (Friendship ❤️), Kepribadian 🎭, Kostum/Aksesori 👑,
 *    Interaksi Antar-Hewan 🐱🐶, & Meramu Teh Bunga 🫖
 * 4. Buku Jurnal / Diary Kebun 📓, Katalog Ensiklopedia 📖, & Daily Streak 📅
 * 5. Mode ASMR / Ambience Focus + Pomodoro Timer 🎧⏱️ & Suara Kontekstual 🔉
 ********************************************************************/

// ============================================================================
// 1. SIKLUS 4 MUSIM (SPRING 🌸, SUMMER ☀️, AUTUMN 🍂, WINTER ❄️)
// ============================================================================
var currentSeason = 'spring'; // 'spring' | 'summer' | 'autumn' | 'winter'
var seasonalParticles = [];
var seasonsVisitedSet = new Set(['spring']);

const SEASON_DEFINITIONS = {
    spring: {
        id: 'spring',
        icon: '<svg class="w-4 h-4 text-pink-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12"/></svg>',
        label: 'Semi',
        fullName: 'Musim Semi Sakura',
        growthMult: 1.25,
        witherMult: 0.9,
        tintOverlay: 'rgba(255, 192, 215, 0.045)',
        desc: 'Kelopak sakura berterbangan & bunga tumbuh 25% lebih cepat!'
    },
    summer: {
        id: 'summer',
        icon: '<svg class="w-4 h-4 text-amber-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
        label: 'Panas',
        fullName: 'Musim Panas Cerah',
        growthMult: 1.1,
        witherMult: 1.15,
        tintOverlay: 'rgba(255, 210, 110, 0.06)',
        desc: 'Cahaya mentari keemasan hangat menyinari pulau kebunmu.'
    },
    autumn: {
        id: 'autumn',
        icon: '<svg class="w-4 h-4 text-orange-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
        label: 'Gugur',
        fullName: 'Musim Gugur Syahdu',
        growthMult: 1.0,
        witherMult: 0.95,
        tintOverlay: 'rgba(225, 135, 65, 0.075)',
        desc: 'Daun-daun maple oranye gugur berterbangan tertiup angin.'
    },
    winter: {
        id: 'winter',
        icon: '<svg class="w-4 h-4 text-sky-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>',
        label: 'Salju',
        fullName: 'Musim Salju Dingin',
        growthMult: 0.85,
        witherMult: 0.5,
        tintOverlay: 'rgba(195, 228, 255, 0.11)',
        desc: 'Butiran salju putih turun perlahan & hewan memakai syal hangat!'
    }
};

function setSeason(seasonId, silent = false) {
    if (!SEASON_DEFINITIONS[seasonId]) seasonId = 'spring';
    currentSeason = seasonId;
    window.currentSeason = currentSeason;
    seasonsVisitedSet.add(seasonId);

    if (typeof setStatMax === 'function') {
        setStatMax('seasonsExperienced', seasonsVisitedSet.size);
    }

    updateSeasonBadgeUI();

    if (!silent && typeof showGardenNotice === 'function') {
        const info = SEASON_DEFINITIONS[seasonId];
        showGardenNotice(`${info.icon} ${info.fullName}: ${info.desc}`);
    }
    if (!silent && typeof playChimeSound === 'function') {
        playChimeSound();
    }
    if (!silent && typeof resetSeasonCycleTimer === 'function') {
        resetSeasonCycleTimer();
    }
    if (typeof scheduleAutoSave === 'function' && !silent) {
        scheduleAutoSave();
    }
}

function cycleSeason() {
    const order = ['spring', 'summer', 'autumn', 'winter'];
    const idx = order.indexOf(currentSeason);
    const next = order[(idx + 1) % order.length];
    setSeason(next, false);
}

function updateSeasonBadgeUI() {
    const btn = document.getElementById('seasonStatusBtn');
    if (!btn) return;
    const info = SEASON_DEFINITIONS[currentSeason] || SEASON_DEFINITIONS.spring;
    btn.innerHTML = `<span>${info.icon}</span><span class="font-bold">${info.label}</span>`;
}

function updateAndDrawSeasonalEffects(targetCtx, dt, now) {
    const info = SEASON_DEFINITIONS[currentSeason] || SEASON_DEFINITIONS.spring;
    const cx = WORLD_W * 0.5;
    const cy = WORLD_H * 0.52;

    // 1. Subtle seasonal atmosphere tint over the island
    if (info.tintOverlay && (typeof nightTransition === 'undefined' || nightTransition < 0.7)) {
        targetCtx.save();
        targetCtx.fillStyle = info.tintOverlay;
        targetCtx.beginPath();
        targetCtx.ellipse(cx, cy, 560, 360, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.restore();
    }

    // 2. In Winter, draw soft frosty snow caps along island rim / pond shimmer
    if (currentSeason === 'winter' || (typeof dynamicWeather !== 'undefined' && dynamicWeather === 'blizzard')) {
        targetCtx.save();
        targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
        targetCtx.lineWidth = 5;
        targetCtx.beginPath();
        targetCtx.ellipse(cx, cy - 4, 415, 232, 0, 0, Math.PI * 2);
        targetCtx.stroke();
        targetCtx.restore();
    }

    // 3. Spawn seasonal ambient particles (sakura petals, autumn leaves, snowflakes, summer sunbeams)
    const maxParticles = currentSeason === 'winter' ? 42 : (currentSeason === 'spring' || currentSeason === 'autumn' ? 28 : 14);
    if (seasonalParticles.length < maxParticles && Math.random() < 0.25) {
        if (currentSeason === 'spring') {
            seasonalParticles.push({
                kind: 'sakura',
                x: cx + (Math.random() - 0.5) * 980,
                y: cy - 360 - Math.random() * 80,
                vx: 14 + Math.random() * 16,
                vy: 22 + Math.random() * 14,
                size: 5 + Math.random() * 4,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 2.5,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.85,
                life: 14
            });
        } else if (currentSeason === 'autumn') {
            const colors = ['#E07A5F', '#F4A261', '#E9C46A', '#D64933'];
            seasonalParticles.push({
                kind: 'leaf',
                x: cx + (Math.random() - 0.5) * 980,
                y: cy - 360 - Math.random() * 80,
                vx: 18 + Math.random() * 20,
                vy: 24 + Math.random() * 16,
                size: 6 + Math.random() * 4.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 3.0,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.9,
                life: 14
            });
        } else if (currentSeason === 'winter') {
            seasonalParticles.push({
                kind: 'snow',
                x: cx + (Math.random() - 0.5) * 1020,
                y: cy - 380 - Math.random() * 80,
                vx: (Math.random() - 0.5) * 12,
                vy: 18 + Math.random() * 15,
                size: 2.5 + Math.random() * 3.2,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.9,
                life: 16
            });
        } else if (currentSeason === 'summer') {
            seasonalParticles.push({
                kind: 'sunmote',
                x: cx + (Math.random() - 0.5) * 820,
                y: cy + (Math.random() - 0.5) * 440,
                vx: (Math.random() - 0.5) * 8,
                vy: -6 - Math.random() * 6,
                size: 2.5 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.65,
                life: 6
            });
        }
    }

    // 4. Update & draw seasonal particles
    for (let i = seasonalParticles.length - 1; i >= 0; i--) {
        const p = seasonalParticles[i];
        p.life -= dt;
        if (p.life <= 0 || p.y > cy + 380) {
            seasonalParticles.splice(i, 1);
            continue;
        }

        p.x += (p.vx + Math.sin(now * 0.002 + p.phase) * 10) * dt;
        p.y += p.vy * dt;
        if (p.rot !== undefined) p.rot += (p.vRot || 1) * dt;

        targetCtx.save();
        targetCtx.globalAlpha = Math.min(1, p.life * 0.5) * p.alpha;
        targetCtx.translate(p.x, p.y);

        if (p.kind === 'sakura') {
            targetCtx.rotate(p.rot);
            targetCtx.fillStyle = '#F9A8D4';
            targetCtx.beginPath();
            targetCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            targetCtx.fill();
        } else if (p.kind === 'leaf') {
            targetCtx.rotate(p.rot);
            targetCtx.fillStyle = p.color;
            targetCtx.beginPath();
            targetCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.strokeStyle = '#7C2D12';
            targetCtx.lineWidth = 0.8;
            targetCtx.beginPath();
            targetCtx.moveTo(-p.size, 0);
            targetCtx.lineTo(p.size, 0);
            targetCtx.stroke();
        } else if (p.kind === 'snow') {
            targetCtx.fillStyle = '#FFFFFF';
            targetCtx.beginPath();
            targetCtx.arc(0, 0, p.size, 0, Math.PI * 2);
            targetCtx.fill();
        } else if (p.kind === 'sunmote') {
            const pulse = (Math.sin(now * 0.005 + p.phase) + 1) * 0.5;
            targetCtx.fillStyle = `rgba(253, 224, 71, ${0.35 + pulse * 0.5})`;
            targetCtx.beginPath();
            targetCtx.arc(0, 0, p.size * (0.8 + pulse * 0.4), 0, Math.PI * 2);
            targetCtx.fill();
        }

        targetCtx.restore();
    }
}


// ============================================================================
// 2. OBJEK DEKORASI & BANGUNAN MINI KEBUN (DRAG & DROP + FISIKA MEDAN)
// ============================================================================
var decorations = [];
window.decorations = decorations;
var selectedDecoration = null;
window.selectedDecoration = selectedDecoration;
var draggedDecoration = null;
var draggedDecorationOrigX = 0;
var draggedDecorationOrigY = 0;
var draggedDecorationOffset = { x: 0, y: 0 };

function normalizeCardinalDirection(rot) {
    const r = ((Number(rot) || 0) % 360 + 360) % 360;
    if (r >= 45 && r < 135) return 90;   // Timur (Kanan →)
    if (r >= 135 && r < 225) return 180; // Utara (Belakang ↑)
    if (r >= 225 && r < 315) return 270; // Barat (Kiri ←)
    return 0;                            // Selatan (Depan ↓)
}

function getSensibleRotationAngles(type) {
    return [0];
}

function getDecorationRotationLabel(d) {
    return '';
}

function setDecorationDirection(id, dirAngle) {
    // Rotation disabled per user preference
}
window.setDecorationDirection = setDecorationDirection;

function rotateDecoration(d) {
    // Rotation disabled per user preference
}

function rotateDecorationById(id) {
    // Rotation disabled per user preference
}

const DECORATION_CATALOG = [
    {
        type: 'fence',
        name: 'Pagar Kayu Taman',
        icon: '<svg class="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6v14M8 6v14M12 6v14M16 6v14M20 6v14M2 9h20M2 15h20M4 6l2-3 2 3M8 6l2-3 2 3M12 6l2-3 2 3M16 6l2-3 2 3M20 6l2-3 2 3"/></svg>',
        habitat: 'land',
        width: 58,
        height: 36
    },
    {
        type: 'fence_side',
        name: 'Pagar Kayu Samping',
        icon: '<svg class="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M7 7h10M7 17h10M9 3l3-2 3 2M9 21l3 2 3-2"/></svg>',
        habitat: 'land',
        width: 28,
        height: 56
    },
    {
        type: 'stepping_stone',
        name: 'Batu Setapak Lumut',
        icon: '<svg class="w-6 h-6 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="8" cy="14" rx="5" ry="3"/><ellipse cx="16" cy="10" rx="6" ry="3.5"/></svg>',
        habitat: 'land',
        width: 48,
        height: 28
    },
    {
        type: 'mushroom',
        name: 'Jamur Polkadot Lucu',
        icon: '<svg class="w-6 h-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13a8 8 0 0 1 16 0c0 1.5-2 1.5-3 1.5H7c-1 0-3 0-3-1.5z"/><path d="M10 14.5v5a2 2 0 0 0 4 0v-5"/><circle cx="9" cy="8" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/></svg>',
        habitat: 'land',
        width: 38,
        height: 40
    },
    {
        type: 'bench',
        name: 'Bangku Taman Kayu',
        icon: '<svg class="w-6 h-6 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13h18M3 9h18M5 9v11M19 9v11M3 16h18"/></svg>',
        habitat: 'land',
        width: 66,
        height: 44
    },
    {
        type: 'lantern',
        name: 'Lentera Taman Malam',
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h8M9 2h6M10 4v3h4V4M6 7h12l-2 12H8L6 7zM9 19v3h6v-3"/></svg>',
        habitat: 'land',
        width: 36,
        height: 56
    },
    {
        type: 'bridge',
        name: 'Jembatan Kayu Sungai',
        icon: '<svg class="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17c5-5 13-5 18 0M3 12c5-5 13-5 18 0M6 14v4M12 11v7M18 14v4"/></svg>',
        habitat: 'both',
        width: 84,
        height: 46
    },
    {
        type: 'pet_house',
        name: 'Pondok Kayu Hewan',
        icon: '<svg class="w-6 h-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><path d="M10 21v-6a2 2 0 0 1 4 0v6"/></svg>',
        habitat: 'land',
        width: 64,
        height: 58
    },
    {
        type: 'fountain',
        name: 'Air Mancur Taman',
        icon: '<svg class="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6M9 5c0-1.6 1.3-3 3-3s3 1.4 3 3M7 9c0-2.8 2.2-5 5-5s5 2.2 5 5M5 14h14v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-2zM12 14v6"/></svg>',
        habitat: 'land',
        width: 68,
        height: 58
    },
    {
        type: 'gazebo',
        name: 'Gazebo Kayu Klasik',
        icon: '<svg class="w-6 h-6 text-amber-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 9 22 9 12 2"/><path d="M4 9v11M20 9v11M9 9v11M15 9v11M2 20h20M4 15h16"/></svg>',
        habitat: 'land',
        width: 86,
        height: 76
    },
    {
        type: 'flower_arch',
        name: 'Gapura Bunga Mawar',
        icon: '<svg class="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V11a8 8 0 0 1 16 0v10"/><path d="M7 21V11a5 5 0 0 1 10 0v10"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="4" r="1.5" fill="currentColor"/><circle cx="17" cy="7" r="1.5" fill="currentColor"/></svg>',
        habitat: 'land',
        width: 70,
        height: 72
    },
    {
        type: 'windmill',
        name: 'Kincir Angin Belanda',
        icon: '<svg class="w-6 h-6 text-orange-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8l-1.5-11h-5L8 21z"/><path d="M12 10L4 4l2-2 6 8zM12 10l8-6-2-2-6 8zM12 10l-6 8-2-2 8-6zM12 10l6 8 2-2-8-6z"/></svg>',
        habitat: 'land',
        width: 66,
        height: 84
    },
    {
        type: 'wishing_well',
        name: 'Sumur Harapan Batu',
        icon: '<svg class="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-6 9 6"/><path d="M6 9v6M18 9v6M12 9v5"/><rect x="5" y="15" width="14" height="6" rx="1"/></svg>',
        habitat: 'land',
        width: 58,
        height: 66
    },
    {
        type: 'birdbath',
        name: 'Tempat Mandi Burung',
        icon: '<svg class="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="10" rx="8" ry="3"/><path d="M4 10c0 3 3.5 5 8 5s8-2 8-5"/><path d="M10 15v5h4v-5"/><path d="M7 20h10"/></svg>',
        habitat: 'land',
        width: 48,
        height: 52
    },
    {
        type: 'picnic_set',
        name: 'Set Tikar Piknik & Teh',
        icon: '<svg class="w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 16 8 10 21 12 16 19 3 16"/><rect x="8" y="7" width="6" height="5" rx="1"/><path d="M9 7V5a2 2 0 0 1 4 0v2"/></svg>',
        habitat: 'land',
        width: 74,
        height: 44
    },
    {
        type: 'statue',
        name: 'Patung Kelinci Batu',
        icon: '<svg class="w-6 h-6 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3c-1 2-1.5 5-.5 7M15 3c1 2 1.5 5 .5 7"/><ellipse cx="12" cy="13" rx="4.5" ry="4"/><rect x="6" y="17" width="12" height="4" rx="1"/></svg>',
        habitat: 'land',
        width: 46,
        height: 58
    },
    {
        type: 'flower_cart',
        name: 'Gerobak Bunga Kayu',
        icon: '<svg class="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="18" r="3"/><path d="M4 11h13l-2 6H6L4 11z"/><path d="M17 11l3-2M15 17v3"/><circle cx="8" cy="8" r="2"/><circle cx="13" cy="8" r="2"/></svg>',
        habitat: 'land',
        width: 68,
        height: 54
    },
    {
        type: 'lantern_mushroom',
        name: 'Lampu Jamur Berpendar',
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14a8 8 0 0 1 16 0c0 1.5-2 1.5-3 1.5H7c-1 0-3 0-3-1.5z"/><path d="M10 15.5v5a2 2 0 0 0 4 0v-5"/><circle cx="12" cy="8" r="2" fill="currentColor"/></svg>',
        habitat: 'land',
        width: 44,
        height: 48,
        starShopItemId: 'decor_lantern_mushroom'
    },
    {
        type: 'tree_swing',
        name: 'Ayunan Pohon Bunga',
        icon: '<svg class="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V10a6 6 0 0 1 12-3"/><path d="M10 9v7M14 9v7M8 16h8"/></svg>',
        habitat: 'land',
        width: 72,
        height: 76,
        starShopItemId: 'decor_tree_swing'
    },
    {
        type: 'golden_lotus',
        name: 'Kolam Teratai Emas',
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2a5 5 0 0 1 5 5c0 4-5 8-5 8s-5-4-5-8a5 5 0 0 1 5-5z"/><path d="M4 18c4 2 12 2 16 0"/></svg>',
        habitat: 'water',
        width: 58,
        height: 40,
        starShopItemId: 'decor_golden_lotus'
    }
];

function openDecorModal() {
    const modal = document.getElementById('decorModal');
    if (!modal) return;
    renderDecorModalCatalog();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDecorModal() {
    const modal = document.getElementById('decorModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function renderDecorModalCatalog() {
    const catalogEl = document.getElementById('decorCatalogGrid');
    const activeEl = document.getElementById('activeDecorListContainer');
    const countPill = document.getElementById('decorCountBadge');
    const modalPill = document.getElementById('modalDecorCounterPill');

    if (countPill) countPill.textContent = decorations.length;
    if (modalPill) modalPill.textContent = `${decorations.length} Dekorasi`;

    if (catalogEl) {
        catalogEl.innerHTML = DECORATION_CATALOG.map(item => {
            const isStarItem = !!item.starShopItemId;
            const isLocked = isStarItem && (!dailyLoginState.unlockedStarItems || !dailyLoginState.unlockedStarItems.includes(item.starShopItemId));
            return `
            <div class="bg-white rounded-2xl border-2 ${isLocked ? 'border-amber-200 bg-[#fffdfa]' : 'border-[#d2e0cb] hover:border-[#7DB852]'} p-3 flex flex-col items-center text-center transition group shadow-xs">
                <div class="w-12 h-12 rounded-2xl ${isLocked ? 'bg-amber-50 border border-amber-200' : 'bg-[#f4faee] border border-[#c5d9b7]'} flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    ${item.icon}
                </div>
                <h4 class="font-hand font-bold text-sm sm:text-base text-[#2B5B35] leading-tight flex items-center justify-center gap-1">
                    <span>${item.name}</span>
                    ${isStarItem ? '<span class="text-xs text-amber-500">⭐</span>' : ''}
                </h4>
                <span class="mt-1 text-[10px] px-2 py-0.5 rounded-full ${isLocked ? 'bg-amber-100 text-amber-800 border border-amber-300' : (item.habitat === 'both' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')} font-bold inline-flex items-center gap-1">
                    ${isLocked 
                        ? '<span>Toko Bintang Kebun ⭐</span>'
                        : (item.habitat === 'both' 
                            ? '<svg class="w-3 h-3 text-sky-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span>Bisa di Atas Air / Darat</span>' 
                            : '<svg class="w-3 h-3 text-emerald-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg><span>Objek Darat</span>')}
                </span>
                ${isLocked ? `
                    <button onclick="closeDecorModal(); openJournalModal('daily');" class="mt-3 w-full py-1.5 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs active:scale-95 inline-flex items-center justify-center gap-1">
                        <span>⭐ Buka di Toko Bintang</span>
                    </button>
                ` : `
                    <button onclick="startPlacingDecoration('${item.type}')" class="mt-3 w-full py-1.5 px-3 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white text-xs font-bold transition shadow-xs active:scale-95">
                        + Pasang ke Kebun
                    </button>
                `}
            </div>
            `;
        }).join('');
    }

    if (activeEl) {
        if (decorations.length === 0) {
            activeEl.innerHTML = `
                <div class="p-4 text-center bg-[#fdfbf7] rounded-xl border border-dashed border-[#d2e0cb] text-xs text-gray-500">
                    Belum ada dekorasi terpasang. Pilih dekorasi di atas lalu geser posisinya di kebun dengan alat <b>Geser & Atur</b>!
                </div>
            `;
        } else {
            activeEl.innerHTML = decorations.map(d => {
                const info = DECORATION_CATALOG.find(c => c.type === d.type) || DECORATION_CATALOG[0];
                return `
                    <div class="flex items-center justify-between gap-2 p-2.5 bg-[#fdfbf7] rounded-xl border border-[#e2d5bc] shadow-xs">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <span class="w-8 h-8 rounded-xl bg-white border border-[#c5d9b7] flex items-center justify-center shrink-0">${info.icon}</span>
                            <div class="min-w-0">
                                <div class="font-hand font-bold text-xs sm:text-sm text-[#2B5B35] truncate leading-tight">${info.name}</div>
                            </div>
                        </div>
                        <button onclick="removeDecorationById('${d.id}')" class="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold transition active:scale-95 shadow-2xs shrink-0">
                            Hapus
                        </button>
                    </div>
                `;
            }).join('');
        }
    }
}

var pendingDecorationSpec = null;
window.pendingDecorationSpec = null;

function startPlacingDecoration(type) {
    const spec = DECORATION_CATALOG.find(c => c.type === type);
    if (!spec) return null;

    pendingDecorationSpec = spec;
    window.pendingDecorationSpec = spec;

    closeDecorModal();

    if (typeof setWorldTool === 'function') {
        setWorldTool('place-decor');
    }

    const banner = document.getElementById('decorPlacementBanner');
    const bannerText = document.getElementById('decorPlacementBannerText');
    const bannerIcon = document.getElementById('decorPlacementBannerIcon');
    if (banner) {
        if (bannerText) bannerText.textContent = `Pasang ${spec.name}: Klik di kebun pada posisi yang kamu inginkan!`;
        if (bannerIcon) bannerIcon.innerHTML = spec.icon;
        banner.classList.remove('hidden');
        banner.classList.add('flex');
    }

    if (typeof showGardenNotice === 'function') {
        showGardenNotice(`Pilih lokasi di kebun untuk menaruh ${spec.name} 📍`);
    }
    return spec;
}

function cancelPlacingDecoration() {
    pendingDecorationSpec = null;
    window.pendingDecorationSpec = null;

    const banner = document.getElementById('decorPlacementBanner');
    if (banner) {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
    }

    if (typeof currentTool !== 'undefined' && currentTool === 'place-decor' && typeof setWorldTool === 'function') {
        setWorldTool('hand');
    }
}

function spawnDecoration(type) {
    // Alur penempatan manual: langsung mengaktifkan mode letakkan dekorasi
    return startPlacingDecoration(type);
}

function removeDecorationById(id) {
    decorations = decorations.filter(d => d.id !== id);
    window.decorations = decorations;
    renderDecorModalCatalog();
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}

function findDecorationAt(wx, wy) {
    for (let i = decorations.length - 1; i >= 0; i--) {
        const d = decorations[i];
        const dir = normalizeCardinalDirection(d.rotation);
        const isSideways = (dir === 90 || dir === 270);
        const hw = (isSideways ? (d.height || 44) : (d.width || 48)) * 0.6;
        const hh = (d.height || 44);
        if (wx >= d.x - hw && wx <= d.x + hw && wy >= d.y - hh && wy <= d.y + 18) {
            return d;
        }
    }
    return null;
}

// ============================================================================
// 2B. SISTEM TABRAKAN (COLLISION) DEKORASI & PENYEBERANGAN JEMBATAN REALISTIS
// ============================================================================

function getDecorationCollisionFootprint(d) {
    if (!d) return { x: 0, y: 0, rx: 16, ry: 12 };
    const dir = normalizeCardinalDirection(d.rotation);
    const isEastWest = (dir === 90 || dir === 270);
    let rx = (d.width || 48) * 0.44;
    let ry = 14;

    switch (d.type) {
        case 'fence':
            rx = 28;
            ry = 8;
            break;
        case 'fence_side':
            rx = 10;
            ry = 26;
            break;
        case 'bench':
            rx = isEastWest ? 13 : 29;
            ry = isEastWest ? 24 : 11;
            break;
        case 'stepping_stone':
            rx = isEastWest ? 16 : 22;
            ry = isEastWest ? 20 : 12;
            break;
        case 'mushroom':
            rx = 17;
            ry = 11;
            break;
        case 'lantern':
            rx = 12;
            ry = 9;
            break;
        case 'pet_house':
            rx = isEastWest ? 25 : 26;
            ry = isEastWest ? 20 : 16;
            break;
        case 'fountain':
            rx = 30;
            ry = 14;
            break;
        case 'gazebo':
            rx = 38;
            ry = 20;
            break;
        case 'flower_arch':
            rx = isEastWest ? 14 : 31;
            ry = isEastWest ? 28 : 12;
            break;
        case 'windmill':
            rx = 26;
            ry = 16;
            break;
        case 'wishing_well':
            rx = 24;
            ry = 14;
            break;
        case 'birdbath':
            rx = 18;
            ry = 11;
            break;
        case 'picnic_set':
            rx = isEastWest ? 21 : 33;
            ry = isEastWest ? 30 : 17;
            break;
        case 'statue':
            rx = 19;
            ry = 12;
            break;
        case 'flower_cart':
            rx = isEastWest ? 18 : 30;
            ry = isEastWest ? 28 : 15;
            break;
        default:
            break;
    }
    return { x: d.x, y: d.y - 3, rx, ry };
}

/**
 * Mengembalikan objek jembatan jika titik (x, y) berada di atas jalur lantai jembatan (walkable deck).
 */
function getBridgeAtPoint(x, y, margin = 0) {
    if (typeof decorations === 'undefined') return null;
    for (let i = 0; i < decorations.length; i++) {
        const d = decorations[i];
        if (d.type !== 'bridge') continue;
        const dir = normalizeCardinalDirection(d.rotation);
        const dx = x - d.x;
        const dy = y - d.y;
        if (dir === 90 || dir === 270) {
            // Jembatan Vertikal (Utara <-> Selatan): masuk dari atas/bawah, pagar di kiri & kanan
            if (Math.abs(dx) <= 14 + margin && Math.abs(dy) <= 38 + margin) {
                return d;
            }
        } else {
            // Jembatan Horizontal (Barat <-> Timur): masuk dari kiri/kanan, pagar di atas & bawah
            if (Math.abs(dx) <= 42 + margin && dy >= -11 - margin && dy <= 8 + margin) {
                return d;
            }
        }
    }
    return null;
}

function isPointOnBridgeDeck(x, y) {
    return getBridgeAtPoint(x, y, 2) !== null;
}

/**
 * Menghitung tinggi lengkungan lantai jembatan (arch elevation) pada titik (x, y)
 * agar hewan terlihat naik mengikuti lengkungan jembatan saat menyeberang!
 */
function getBridgeDeckElevation(x, y) {
    const b = getBridgeAtPoint(x, y, 4);
    if (!b) return 0;
    const dir = normalizeCardinalDirection(b.rotation);
    if (dir === 90 || dir === 270) {
        const norm = Math.max(-1, Math.min(1, (y - b.y) / 35));
        return Math.max(0, Math.cos(norm * 1.35) * 8.5);
    } else {
        const norm = Math.max(-1, Math.min(1, (x - b.x) / 38));
        return Math.max(0, Math.cos(norm * 1.35) * 11.0);
    }
}

/**
 * Menghasilkan titik-titik waypoint masuk -> puncak tengah -> keluar jembatan
 * agar hewan menyeberangi jembatan dari ujung ke ujung secara masuk akal.
 */
function getBridgeCrossingWaypoints(b, fromX, fromY) {
    if (!b) return null;
    const dir = normalizeCardinalDirection(b.rotation);
    let endA, endB, mid;
    if (dir === 90 || dir === 270) {
        // Jembatan Utara <-> Selatan
        endA = { x: b.x, y: b.y - 44 };
        mid  = { x: b.x, y: b.y };
        endB = { x: b.x, y: b.y + 44 };
    } else {
        // Jembatan Barat <-> Timur
        endA = { x: b.x - 48, y: b.y - 1 };
        mid  = { x: b.x, y: b.y - 2 };
        endB = { x: b.x + 48, y: b.y - 1 };
    }
    const distA = Math.hypot(fromX - endA.x, fromY - endA.y);
    const distB = Math.hypot(fromX - endB.x, fromY - endB.y);
    if (distA <= distB) {
        return [endA, mid, endB];
    } else {
        return [endB, mid, endA];
    }
}

/**
 * Mengecek apakah titik (x, y) terhalang oleh objek dekorasi.
 * - Semua objek dekorasi selain jembatan TIDAK BISA dilewati hewan.
 * - Untuk jembatan: lantai tengah jembatan bisa dilewati, tetapi pagar samping jembatan tetap solid (tidak bisa ditembus dari samping).
 */
function isPointBlockedByDecoration(x, y, animalRadius = 9) {
    if (typeof decorations === 'undefined' || decorations.length === 0) return false;

    for (let i = 0; i < decorations.length; i++) {
        const d = decorations[i];
        if (d.type === 'bridge') {
            const dir = normalizeCardinalDirection(d.rotation);
            const dx = x - d.x;
            const dy = y - d.y;
            if (dir === 90 || dir === 270) {
                // Jembatan Vertikal: Pagar samping kiri & kanan adalah penghalang solid
                if (Math.abs(dy) < 35 && Math.abs(dx) > 13.5 && Math.abs(dx) < 23 + animalRadius * 0.5) {
                    return true;
                }
            } else {
                // Jembatan Horizontal: Pagar atas & bawah adalah penghalang solid
                if (Math.abs(dx) < 38) {
                    if ((dy < -10.5 && dy > -22 - animalRadius * 0.4) || (dy > 7.5 && dy < 17 + animalRadius * 0.4)) {
                        return true;
                    }
                }
            }
            continue;
        }

        const fp = getDecorationCollisionFootprint(d);
        const rx = fp.rx + animalRadius;
        const ry = fp.ry + animalRadius * 0.75;
        const nx = (x - fp.x) / rx;
        const ny = (y - fp.y) / ry;
        if (nx * nx + ny * ny <= 1.0) {
            return true;
        }
    }
    return false;
}

/**
 * Jika dekorasi baru dipasang atau digeser ke atas posisi hewan, geser hewan keluar dari batas kolisi dekorasi.
 */
function resolveAnimalDecorationCollisions() {
    if (typeof animals === 'undefined' || !Array.isArray(animals)) return;
    for (const a of animals) {
        if (a.type === 'butterfly' || a.habitat === 'flying') continue;
        if (!isPointBlockedByDecoration(a.x, a.y, 9)) continue;

        for (let r = 14; r <= 96; r += 10) {
            let moved = false;
            for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 6) {
                const tx = a.x + Math.cos(ang) * r;
                const ty = a.y + Math.sin(ang) * r;
                if (isPointBlockedByDecoration(tx, ty, 10)) continue;
                if (a.habitat === 'water' || a.type === 'fish') {
                    if (typeof isPointOnWater === 'function' && isPointOnWater(tx, ty)) {
                        a.x = tx;
                        a.y = ty;
                        a.targetX = tx;
                        a.targetY = ty;
                        moved = true;
                        break;
                    }
                } else {
                    const onG = typeof isPointOnGrass === 'function' && isPointOnGrass(tx, ty);
                    const onW = typeof isPointOnWater === 'function' && isPointOnWater(tx, ty);
                    const onB = isPointOnBridgeDeck(tx, ty);
                    if (onB || (onG && !onW)) {
                        a.x = tx;
                        a.y = ty;
                        a.targetX = tx;
                        a.targetY = ty;
                        moved = true;
                        break;
                    }
                }
            }
            if (moved) break;
        }
    }
}

function checkDecorationsSurvival() {
    for (let i = decorations.length - 1; i >= 0; i--) {
        const d = decorations[i];
        const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(d.x, d.y);
        const onWater = typeof isPointOnWater === 'function' && isPointOnWater(d.x, d.y);
        if (d.habitat === 'both') {
            if (!onGrass && !onWater) {
                decorations.splice(i, 1);
            }
        } else {
            if (!onGrass || onWater) {
                decorations.splice(i, 1);
            }
        }
    }
    window.decorations = decorations;
}

function drawRealisticFence(ctx, d, now) {
    // Horizontal rails with realistic wood grain
    const railGrad = ctx.createLinearGradient(0, -22, 0, -10);
    railGrad.addColorStop(0, '#C28B57');
    railGrad.addColorStop(1, '#8A5222');
    ctx.fillStyle = railGrad;
    ctx.strokeStyle = '#4E2C0C';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.roundRect(-27, -21, 54, 5.5, 2);
    ctx.roundRect(-27, -11, 54, 5.5, 2);
    ctx.fill();
    ctx.stroke();

    // 4 Vertical Pickets with bevels and gothic pointed caps
    const xs = [-21, -7, 7, 21];
    for (let i = 0; i < xs.length; i++) {
        const px = xs[i];
        const pickGrad = ctx.createLinearGradient(px - 5, 0, px + 5, 0);
        pickGrad.addColorStop(0, '#DCAB7E');
        pickGrad.addColorStop(0.3, '#C7925F');
        pickGrad.addColorStop(1, '#935B29');
        ctx.fillStyle = pickGrad;
        ctx.strokeStyle = '#4E2C0C';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(px - 5, 1);
        ctx.lineTo(px - 5, -24);
        ctx.lineTo(px, -31);
        ctx.lineTo(px + 5, -24);
        ctx.lineTo(px + 5, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wood grain line
        ctx.strokeStyle = 'rgba(78, 44, 12, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px - 1, -26);
        ctx.lineTo(px - 1, -2);
        ctx.stroke();

        // 2 Iron Nails
        ctx.fillStyle = '#2B1705';
        ctx.beginPath();
        ctx.arc(px, -18.5, 1.3, 0, Math.PI * 2);
        ctx.arc(px, -8.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Realistic Ivy Vine winding around 2nd and 3rd pickets
    ctx.strokeStyle = '#3F6212';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-10, 1);
    ctx.quadraticCurveTo(-4, -12, -7, -20);
    ctx.quadraticCurveTo(-10, -26, -5, -28);
    ctx.stroke();

    // Ivy Leaves
    const ivyLeaves = [
        { x: -7, y: -8, r: 2.8, a: -0.4 },
        { x: -5, y: -15, r: 3.2, a: 0.5 },
        { x: -8, y: -22, r: 2.6, a: -0.8 },
        { x: -4, y: -27, r: 2.2, a: 0.3 }
    ];
    for (const leaf of ivyLeaves) {
        ctx.fillStyle = '#65A30D';
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y, leaf.r, leaf.r * 0.65, leaf.a, 0, Math.PI * 2);
        ctx.fill();
    }
    // Tiny white chamomile flower bud
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-4, -15, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.arc(-4, -15, 0.7, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticSteppingStones(ctx, d, now, rot) {
    // Dirt bedding under stones
    ctx.fillStyle = 'rgba(65, 45, 20, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 23, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    const stones = [
        { x: -9, y: -4, rx: 14, ry: 8.5, a: -0.15, c1: '#94A3B8', c2: '#475569' },
        { x: 10, y: -2, rx: 11.5, ry: 7.0, a: 0.22, c1: '#A8B7CB', c2: '#576579' },
        { x: -2, y: 6.5, rx: 8.5, ry: 5.5, a: 0.1, c1: '#8D9FB5', c2: '#3F4D60' },
        { x: 17, y: 5.0, rx: 4.5, ry: 3.2, a: -0.3, c1: '#94A3B8', c2: '#475569' }
    ];

    for (const s of stones) {
        // Stone bevel shadow
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.ellipse(s.x, s.y + 1.6, s.rx, s.ry, s.a, 0, Math.PI * 2);
        ctx.fill();

        // Stone body gradient
        const g = ctx.createLinearGradient(s.x - s.rx, s.y - s.ry, s.x + s.rx, s.y + s.ry);
        g.addColorStop(0, s.c1);
        g.addColorStop(1, s.c2);
        ctx.fillStyle = g;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.rx, s.ry, s.a, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Top surface chisel highlight
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.45)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(s.x - 1, s.y - 1.2, s.rx * 0.7, s.ry * 0.6, s.a, 0.8 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
    }

    // Natural botanical moss clumps
    const mossPads = [
        { x: -14, y: -7, r: 3.2 },
        { x: -5, y: -3, r: 2.6 },
        { x: 4, y: -6, r: 3.4 },
        { x: 8, y: 2, r: 2.8 },
        { x: -7, y: 5, r: 2.5 }
    ];
    for (const m of mossPads) {
        ctx.fillStyle = '#365314';
        ctx.beginPath();
        ctx.arc(m.x, m.y + 0.5, m.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#65A30D';
        ctx.beginPath();
        ctx.arc(m.x - 0.4, m.y, m.r * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#A3E635';
        ctx.beginPath();
        ctx.arc(m.x - 0.7, m.y - 0.5, m.r * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRealisticMushroom(ctx, d, now, rot) {
    // Little sprout mushroom
    ctx.save();
    ctx.translate(13, 0);
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#57412E';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-2.5, -9, 5, 10, 2);
    ctx.fill();
    ctx.stroke();

    const spCapGrad = ctx.createRadialGradient(-1, -12, 1, 0, -10, 7);
    spCapGrad.addColorStop(0, '#F43F5E');
    spCapGrad.addColorStop(1, '#9F1239');
    ctx.fillStyle = spCapGrad;
    ctx.beginPath();
    ctx.arc(0, -9, 6.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-1, -12, 1.2, 0, Math.PI * 2);
    ctx.arc(2, -10, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main Stalk
    const stalkGrad = ctx.createLinearGradient(-7, -22, 7, 0);
    stalkGrad.addColorStop(0, '#FFFFFF');
    stalkGrad.addColorStop(0.6, '#FFF8E7');
    stalkGrad.addColorStop(1, '#D8C3A5');
    ctx.fillStyle = stalkGrad;
    ctx.strokeStyle = '#57412E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, 1);
    ctx.quadraticCurveTo(-7.5, -12, -5, -20);
    ctx.lineTo(5, -20);
    ctx.quadraticCurveTo(7.5, -12, 6, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ruffled collar ring
    ctx.fillStyle = '#FFFBEB';
    ctx.beginPath();
    ctx.ellipse(0, -15, 7.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cap Underside Gills
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#D4B996';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, -18, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let gx = -13; gx <= 13; gx += 3.2) {
        ctx.beginPath();
        ctx.moveTo(gx * 0.4, -18);
        ctx.lineTo(gx, -18);
        ctx.stroke();
    }

    // Velvet Red Cap
    const capGrad = ctx.createRadialGradient(-4, -28, 2, 0, -22, 19);
    capGrad.addColorStop(0, '#FB7185');
    capGrad.addColorStop(0.35, '#E11D48');
    capGrad.addColorStop(0.8, '#BE123C');
    capGrad.addColorStop(1, '#881337');
    ctx.fillStyle = capGrad;
    ctx.strokeStyle = '#4C0519';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(-17, -18);
    ctx.quadraticCurveTo(-18, -32, 0, -35);
    ctx.quadraticCurveTo(18, -32, 17, -18);
    ctx.quadraticCurveTo(0, -15, -17, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White Polkadot spots
    const spots = [
        { x: -3, y: -30, rx: 3.5, ry: 2.8, a: -0.2 },
        { x: 7, y: -28, rx: 3.2, ry: 2.5, a: 0.3 },
        { x: -10, y: -24, rx: 2.6, ry: 2.2, a: -0.4 },
        { x: 3, y: -23, rx: 2.8, ry: 2.2, a: 0.1 },
        { x: 12, y: -21, rx: 2.2, ry: 1.8, a: 0.5 },
        { x: -4, y: -18, rx: 1.8, ry: 1.4, a: 0 }
    ];
    for (const sp of spots) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, sp.a, 0, Math.PI * 2);
        ctx.fill();
    }

    // Base Moss
    ctx.fillStyle = '#65A30D';
    ctx.beginPath();
    ctx.arc(-6, 1, 2.5, 0, Math.PI * 2);
    ctx.arc(-2, 2, 2.0, 0, Math.PI * 2);
    ctx.arc(5, 1, 2.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticBench(ctx, d, now, rot) {
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';

    // Back leg & backrest spine
    ctx.beginPath();
    ctx.moveTo(-23, 2);
    ctx.lineTo(-24, -26);
    ctx.moveTo(23, 2);
    ctx.lineTo(24, -26);
    ctx.stroke();

    // Front scrolled legs
    ctx.beginPath();
    ctx.moveTo(-22, -10);
    ctx.quadraticCurveTo(-26, -2, -24, 3);
    ctx.moveTo(22, -10);
    ctx.quadraticCurveTo(26, -2, 24, 3);
    ctx.stroke();

    // Curved armrest scrolls
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-24, -18);
    ctx.quadraticCurveTo(-26, -15, -23, -11);
    ctx.moveTo(24, -18);
    ctx.quadraticCurveTo(26, -15, 23, -11);
    ctx.stroke();

    // Teak Wood Slats (Backrest)
    const backPlanksY = [-26, -20, -14];
    for (const by of backPlanksY) {
        const bg = ctx.createLinearGradient(-27, by, 27, by + 5);
        bg.addColorStop(0, '#B45309');
        bg.addColorStop(0.5, '#D97706');
        bg.addColorStop(1, '#92400E');
        ctx.fillStyle = bg;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.roundRect(-27, by, 54, 4.8, 1.8);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-22, by + 2.2);
        ctx.lineTo(22, by + 2.2);
        ctx.stroke();

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(-22, by + 2.4, 1.0, 0, Math.PI * 2);
        ctx.arc(22, by + 2.4, 1.0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Teak Wood Slats (Seat)
    const seatPlanksY = [-10, -5.5];
    for (const sy of seatPlanksY) {
        const sg = ctx.createLinearGradient(0, sy, 0, sy + 4.5);
        sg.addColorStop(0, '#F59E0B');
        sg.addColorStop(1, '#B45309');
        ctx.fillStyle = sg;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.roundRect(-28, sy, 56, 4.2, 1.6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(-21, sy + 2.1, 1.0, 0, Math.PI * 2);
        ctx.arc(21, sy + 2.1, 1.0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRealisticLantern(ctx, d, now, rot) {
    const isNight = typeof nightTransition !== 'undefined' && nightTransition > 0.15;

    if (isNight) {
        const flicker = Math.sin(now * 0.007) * 2;
        const rad = 56 + flicker + nightTransition * 12;
        const g = ctx.createRadialGradient(8, -34, 3, 8, -34, rad);
        g.addColorStop(0, `rgba(255, 220, 110, ${0.75 * nightTransition})`);
        g.addColorStop(0.4, `rgba(251, 146, 60, ${0.35 * nightTransition})`);
        g.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(8, -34, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fluted base
    ctx.fillStyle = '#27272A';
    ctx.strokeStyle = '#09090B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, 2);
    ctx.lineTo(6, 2);
    ctx.lineTo(3.5, -4);
    ctx.lineTo(-3.5, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Post & hook
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, -42);
    ctx.quadraticCurveTo(0, -50, 8, -48);
    ctx.stroke();

    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(4, -40, 3.5, 0.2 * Math.PI, 1.4 * Math.PI);
    ctx.stroke();

    // Hanging chain
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, -48);
    ctx.lineTo(8, -44);
    ctx.stroke();

    // Tiered cap
    ctx.fillStyle = '#27272A';
    ctx.strokeStyle = '#09090B';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(1, -41);
    ctx.lineTo(8, -45);
    ctx.lineTo(15, -41);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glass body
    const glassGrad = ctx.createLinearGradient(1, -41, 15, -28);
    if (isNight) {
        glassGrad.addColorStop(0, '#FEF08A');
        glassGrad.addColorStop(0.5, '#FDE047');
        glassGrad.addColorStop(1, '#F59E0B');
    } else {
        glassGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        glassGrad.addColorStop(1, 'rgba(253, 224, 71, 0.2)');
    }
    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(1, -41, 14, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Glowing core
    ctx.fillStyle = isNight ? '#FFFFFF' : '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(8, -34, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom finial
    ctx.fillStyle = '#27272A';
    ctx.beginPath();
    ctx.moveTo(4, -27);
    ctx.lineTo(8, -24.5);
    ctx.lineTo(12, -27);
    ctx.closePath();
    ctx.fill();
}

function drawRealisticBridge(ctx, d, now, rot) {
    if (rot === 90) {
        // Vertical Bridge running North-South
        ctx.fillStyle = 'rgba(12, 30, 40, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 38, 0, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 12; i++) {
            const py = -32 + i * 5.4;
            const archOffset = (1 - Math.pow(i / 5.5 - 1, 2)) * 3;
            ctx.fillStyle = (i % 2 === 0) ? '#B45309' : '#92400E';
            ctx.strokeStyle = '#451A03';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.roundRect(-16 - archOffset, py, 32 + archOffset * 2, 4.8, 1.5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#2D1505';
            ctx.beginPath();
            ctx.arc(-13, py + 2.4, 0.9, 0, Math.PI * 2);
            ctx.arc(13, py + 2.4, 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#78350F';
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.8;
        const hys = [-28, 0, 28];
        for (const hy of hys) {
            ctx.beginPath();
            ctx.rect(-17, hy - 6, 3, 12);
            ctx.rect(14, hy - 6, 3, 12);
            ctx.fill();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-16, -32); ctx.lineTo(-16, 32);
        ctx.moveTo(15, -32);  ctx.lineTo(15, 32);
        ctx.stroke();
        return;
    }

    if (rot === 45 || rot === 135) {
        ctx.rotate((rot * Math.PI) / 180);
    }

    // Horizontal Bridge
    ctx.fillStyle = 'rgba(10, 30, 42, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 37, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5A2A08';
    ctx.strokeStyle = '#381602';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.quadraticCurveTo(0, -18, 36, 0);
    ctx.lineTo(36, 6);
    ctx.quadraticCurveTo(0, -11, -36, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 13; i++) {
        const px = -34 + i * 5.4;
        const norm = (i / 6) - 1;
        const py = -Math.cos(norm * 1.3) * 11 + 2;

        const plankGrad = ctx.createLinearGradient(px, py, px + 5, py + 10);
        plankGrad.addColorStop(0, (i % 2 === 0) ? '#D97706' : '#B45309');
        plankGrad.addColorStop(1, '#78350F');
        ctx.fillStyle = plankGrad;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.roundRect(px, py, 4.8, 8, 1);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2B1403';
        ctx.beginPath();
        ctx.arc(px + 2.4, py + 2, 0.9, 0, Math.PI * 2);
        ctx.arc(px + 2.4, py + 6, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    const postXs = [-33, 0, 33];
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 2.0;

    for (const hx of postXs) {
        const hy = hx === 0 ? -11 : -1;
        ctx.beginPath();
        ctx.rect(hx - 2, hy - 17, 4.2, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.moveTo(hx - 2.5, hy - 17);
        ctx.lineTo(hx + 0.1, hy - 20);
        ctx.lineTo(hx + 2.5, hy - 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#92400E';
    }

    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-34, -18);
    ctx.quadraticCurveTo(0, -30, 34, -18);
    ctx.stroke();

    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-33, -10);
    ctx.quadraticCurveTo(0, -22, 33, -10);
    ctx.stroke();
}

function drawRealisticPetHouse(ctx, d, now, rot) {
    // Stone foundation
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-24, 0, 48, 4, 1.5);
    ctx.fill();
    ctx.stroke();

    // Horizontal Shiplap Walls
    const wallGrad = ctx.createLinearGradient(-23, -33, 23, 0);
    wallGrad.addColorStop(0, '#FEF08A');
    wallGrad.addColorStop(0.5, '#FDE047');
    wallGrad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = wallGrad;
    ctx.strokeStyle = '#5C3A1E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-22, -33, 44, 33, 3);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(92, 58, 30, 0.4)';
    ctx.lineWidth = 1.0;
    const planksY = [-26, -19, -12, -5];
    for (const py of planksY) {
        ctx.beginPath();
        ctx.moveTo(-21, py);
        ctx.lineTo(21, py);
        ctx.stroke();
    }

    // Arched Doorway with cozy interior
    ctx.fillStyle = '#1C0E06';
    ctx.strokeStyle = '#5C3A1E';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -11, 9.5, Math.PI, 0, false);
    ctx.lineTo(9.5, 1);
    ctx.lineTo(-9.5, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red fleece cushion peek inside
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 3.0, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scalloped Alpine Roof
    const roofTiers = [
        { y: -30, w: 29 },
        { y: -38, w: 21 },
        { y: -46, w: 12 }
    ];
    for (const t of roofTiers) {
        const rg = ctx.createLinearGradient(-t.w, t.y, t.w, t.y + 8);
        rg.addColorStop(0, '#F43F5E');
        rg.addColorStop(0.5, '#E11D48');
        rg.addColorStop(1, '#9F1239');
        ctx.fillStyle = rg;
        ctx.strokeStyle = '#4C0519';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-t.w, t.y);
        ctx.lineTo(0, t.y - 10);
        ctx.lineTo(t.w, t.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Carved ridge cap
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.roundRect(-3, -56, 6, 4, 1.5);
    ctx.fill();

    // Carved Wooden Paw Plaque
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#5C3A1E';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -23.5, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.ellipse(0, -22.8, 2.0, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-1.8, -25.2, 0.7, 0, Math.PI * 2);
    ctx.arc(0, -25.8, 0.7, 0, Math.PI * 2);
    ctx.arc(1.8, -25.2, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Pet water bowl
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(15, 2, 4.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawRealisticFountain(ctx, d, now, rot) {
    // Sculpted limestone base
    const baseGrad = ctx.createLinearGradient(-16, 2, 16, -8);
    baseGrad.addColorStop(0, '#CBD5E1');
    baseGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(16, 2);
    ctx.lineTo(10, -6);
    ctx.lineTo(-10, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wide Lower Basin
    const basinGrad = ctx.createLinearGradient(-29, -15, 29, 2);
    basinGrad.addColorStop(0, '#F1F5F9');
    basinGrad.addColorStop(0.5, '#E2E8F0');
    basinGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = basinGrad;
    ctx.beginPath();
    ctx.ellipse(0, -6, 29, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lower Water Pool with animated rippling caustics
    const waterRipple = Math.sin(now * 0.005) * 0.4;
    const waterGrad = ctx.createRadialGradient(0, -7, 2, 0, -7, 25);
    waterGrad.addColorStop(0, '#7DD3FC');
    waterGrad.addColorStop(0.7, '#0284C7');
    waterGrad.addColorStop(1, '#0369A1');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(0, -7, 24 + waterRipple, 7.5 + waterRipple * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central Baluster Column
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-4.5, -28, 9, 22, 2.5);
    ctx.fill();
    ctx.stroke();

    // Upper Stone Basin Bowl
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.ellipse(0, -28, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Upper Water Pool
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(0, -28.5, 12, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top Nozzle
    ctx.fillStyle = '#CA8A04';
    ctx.beginPath();
    ctx.roundRect(-2, -32, 4, 4, 1);
    ctx.fill();

    // Animated Water Plume & Cascades
    const phase = (now * 0.0055) % 1;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.quadraticCurveTo(0, -42 - Math.sin(phase * Math.PI) * 4, -1, -38);
    ctx.stroke();

    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(-9, -40, -13, -29);
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(9, -40, 13, -29);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, -27);
    ctx.quadraticCurveTo(-18, -17, -19, -8);
    ctx.moveTo(14, -27);
    ctx.quadraticCurveTo(18, -17, 19, -8);
    ctx.stroke();

    ctx.fillStyle = '#E0F2FE';
    const drops = [
        { x: -19, y: -7 + Math.sin(now * 0.01) * 2 },
        { x: 19, y: -7 + Math.cos(now * 0.01) * 2 },
        { x: -7, y: -29 + Math.sin(now * 0.012) * 1.5 },
        { x: 7, y: -29 + Math.cos(now * 0.012) * 1.5 }
    ];
    for (const dp of drops) {
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRealisticFenceSide(ctx, d, now) {
    // Vertical side fence running North-South (2.5D perspective)
    // 1. Crossbar rails connecting posts vertically
    const railGrad = ctx.createLinearGradient(-4, 0, 4, 0);
    railGrad.addColorStop(0, '#A77042');
    railGrad.addColorStop(0.5, '#C28B57');
    railGrad.addColorStop(1, '#7E471C');
    ctx.fillStyle = railGrad;
    ctx.strokeStyle = '#4A2808';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.roundRect(-2.5, -24, 5, 48, 1.5);
    ctx.fill();
    ctx.stroke();

    // 2. Three vertical pickets with 2.5D depth, sorted back to front (top to bottom)
    const postsY = [-18, 0, 18];
    for (let i = 0; i < postsY.length; i++) {
        const py = postsY[i];

        // Soft ground shadow under each post base
        ctx.fillStyle = 'rgba(20, 35, 15, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, py + 7, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Post 3D body
        const postGrad = ctx.createLinearGradient(-7, 0, 7, 0);
        postGrad.addColorStop(0, '#E0B58B');
        postGrad.addColorStop(0.35, '#C7925F');
        postGrad.addColorStop(1, '#8A5222');
        ctx.fillStyle = postGrad;
        ctx.strokeStyle = '#4A2808';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.moveTo(-6, py + 6);
        ctx.lineTo(-6, py - 12);
        ctx.lineTo(0, py - 17);
        ctx.lineTo(6, py - 12);
        ctx.lineTo(6, py + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3D Bevel facet on pointed top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(-6, py - 12);
        ctx.lineTo(0, py - 17);
        ctx.lineTo(0, py - 12);
        ctx.closePath();
        ctx.fill();

        // Wood grain subtle vertical line
        ctx.strokeStyle = 'rgba(74, 40, 8, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-1, py - 11);
        ctx.lineTo(-1, py + 4);
        ctx.stroke();

        // Iron nail on post center
        ctx.fillStyle = '#261204';
        ctx.beginPath();
        ctx.arc(0, py - 3, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Delicate winding ivy vine with tiny leaves and white blossoms
    ctx.strokeStyle = '#3F6212';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(3, 22);
    ctx.quadraticCurveTo(-4, 10, 2, -2);
    ctx.quadraticCurveTo(6, -12, -2, -22);
    ctx.stroke();

    const ivyLeaves = [
        { x: 3, y: 16, rx: 2.8, ry: 1.8, rot: 0.3 },
        { x: -2, y: 7, rx: 3.0, ry: 2.0, rot: -0.4 },
        { x: 3, y: -4, rx: 2.6, ry: 1.7, rot: 0.5 },
        { x: -1, y: -16, rx: 2.4, ry: 1.6, rot: -0.3 }
    ];
    for (const leaf of ivyLeaves) {
        ctx.fillStyle = '#65A30D';
        ctx.beginPath();
        ctx.ellipse(leaf.x, leaf.y, leaf.rx, leaf.ry, leaf.rot, 0, Math.PI * 2);
        ctx.fill();
    }

    // Tiny white flower bud
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(3, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.arc(3, -4, 0.6, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticGazebo(ctx, d, now) {
    // 1. Octagonal wooden floor foundation
    ctx.fillStyle = '#8C7456';
    ctx.strokeStyle = '#4A3B2C';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wood floor planks
    ctx.fillStyle = '#C49767';
    ctx.beginPath();
    ctx.ellipse(0, -2, 33, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Plank lines
    ctx.strokeStyle = 'rgba(74, 59, 44, 0.45)';
    ctx.lineWidth = 1;
    [-20, -10, 0, 10, 20].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px, -11);
        ctx.lineTo(px, 7);
        ctx.stroke();
    });

    // 2. Pillars (4 wooden columns)
    const pillars = [-26, -10, 10, 26];
    pillars.forEach(px => {
        const pGrad = ctx.createLinearGradient(px - 2.5, 0, px + 2.5, 0);
        pGrad.addColorStop(0, '#E8C29D');
        pGrad.addColorStop(1, '#8A5930');
        ctx.fillStyle = pGrad;
        ctx.strokeStyle = '#4A2808';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(px - 2.5, -44, 5, 42, 1);
        ctx.fill();
        ctx.stroke();
    });

    // Back & side wooden railings
    ctx.strokeStyle = '#683A14';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-26, -14);
    ctx.lineTo(-10, -16);
    ctx.lineTo(10, -16);
    ctx.lineTo(26, -14);
    ctx.stroke();

    // 3. Ornate Terracotta Roof Pagoda/Octagonal Style
    const roofGrad = ctx.createLinearGradient(0, -68, 0, -42);
    roofGrad.addColorStop(0, '#DC2626');
    roofGrad.addColorStop(0.5, '#B91C1C');
    roofGrad.addColorStop(1, '#7F1D1D');
    ctx.fillStyle = roofGrad;
    ctx.strokeStyle = '#450A0A';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.lineTo(38, -43);
    ctx.quadraticCurveTo(0, -38, -38, -43);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Roof finial ball
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -69, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hanging flower pot in gazebo center
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.lineTo(0, -32);
    ctx.stroke();
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(0, -30, 3.5, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(-2, -32, 2.2, 0, Math.PI * 2);
    ctx.arc(2, -32, 2.2, 0, Math.PI * 2);
    ctx.arc(0, -34, 2.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticFlowerArch(ctx, d, now) {
    // 1. Two ornate white wrought-iron arch trellis legs
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-24, -36);
    ctx.bezierCurveTo(-24, -62, 24, -62, 24, -36);
    ctx.lineTo(24, 0);
    ctx.stroke();

    // Outer lattice outline
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-29, 0);
    ctx.lineTo(-29, -36);
    ctx.bezierCurveTo(-29, -68, 29, -68, 29, -36);
    ctx.lineTo(29, 0);
    ctx.stroke();

    // Lattice cross rungs
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.2;
    for (let y = -8; y >= -36; y -= 7) {
        ctx.beginPath();
        ctx.moveTo(-29, y);
        ctx.lineTo(-24, y);
        ctx.moveTo(24, y);
        ctx.lineTo(29, y);
        ctx.stroke();
    }

    // 2. Thick green rose vines entwining the arch
    ctx.strokeStyle = '#2D6A28';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-25, 2);
    ctx.quadraticCurveTo(-19, -20, -25, -40);
    ctx.bezierCurveTo(-15, -60, 15, -60, 25, -40);
    ctx.quadraticCurveTo(19, -20, 25, 2);
    ctx.stroke();

    // Lush leaves along the arch
    const leafNodes = [
        { x: -26, y: -12, r: 3.5 }, { x: -21, y: -24, r: 3.2 }, { x: -24, y: -38, r: 3.6 },
        { x: -16, y: -50, r: 3.5 }, { x: -7, y: -56, r: 3.8 }, { x: 0, y: -58, r: 4.0 },
        { x: 8, y: -56, r: 3.8 }, { x: 17, y: -50, r: 3.5 }, { x: 24, y: -38, r: 3.6 },
        { x: 21, y: -24, r: 3.2 }, { x: 26, y: -12, r: 3.5 }
    ];
    for (const lf of leafNodes) {
        ctx.fillStyle = '#4E8C2B';
        ctx.beginPath();
        ctx.arc(lf.x, lf.y, lf.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#68A838';
        ctx.beginPath();
        ctx.arc(lf.x + 1, lf.y - 1, lf.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Blooming Roses (Pink, Rose Red, Cream)
    const roses = [
        { x: -26, y: -18, c: '#F43F5E', r: 4.5 },
        { x: -22, y: -34, c: '#FB7185', r: 4.2 },
        { x: -14, y: -48, c: '#FDA4AF', r: 4.0 },
        { x: -5, y: -55, c: '#E11D48', r: 4.6 },
        { x: 5, y: -55, c: '#F43F5E', r: 4.6 },
        { x: 15, y: -48, c: '#FB7185', r: 4.0 },
        { x: 22, y: -34, c: '#FDA4AF', r: 4.2 },
        { x: 26, y: -18, c: '#E11D48', r: 4.5 }
    ];
    for (const rose of roses) {
        ctx.fillStyle = rose.c;
        ctx.beginPath();
        ctx.arc(rose.x, rose.y, rose.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(rose.x - 0.5, rose.y - 0.5, rose.r * 0.45, 0, Math.PI * 1.5);
        ctx.stroke();
    }
}

function drawRealisticWindmill(ctx, d, now) {
    // 1. Round Stone / Brick Tower base
    const towerGrad = ctx.createLinearGradient(-18, 0, 18, 0);
    towerGrad.addColorStop(0, '#CBD5E1');
    towerGrad.addColorStop(0.35, '#F1F5F9');
    towerGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = towerGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-12, -44);
    ctx.lineTo(12, -44);
    ctx.lineTo(18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arched Wooden Door at bottom
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-4.5, -12, 9, 12, [4, 4, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Little high window
    ctx.fillStyle = '#60A5FA';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-3.5, -34, 7, 8, 2);
    ctx.fill();
    ctx.stroke();

    // 2. Conical thatched roof cap
    const roofGrad = ctx.createLinearGradient(0, -62, 0, -44);
    roofGrad.addColorStop(0, '#92400E');
    roofGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = roofGrad;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -62);
    ctx.lineTo(16, -44);
    ctx.lineTo(-16, -44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Central rotor hub with 4 wooden lattice sails gently rotating
    const hubY = -48;
    const bladeAngle = now * 0.001;
    ctx.save();
    ctx.translate(0, hubY);
    ctx.rotate(bladeAngle);

    // Hub center pin
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4 Blades with wooden frame and canvas lattice
    for (let b = 0; b < 4; b++) {
        ctx.save();
        ctx.rotate((b * Math.PI) / 2);
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -32);
        ctx.stroke();

        ctx.fillStyle = 'rgba(254, 243, 199, 0.85)';
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.rect(1.5, -29, 6.5, 22);
        ctx.fill();
        ctx.stroke();

        for (let ry = -26; ry <= -10; ry += 5) {
            ctx.beginPath();
            ctx.moveTo(1.5, ry);
            ctx.lineTo(8, ry);
            ctx.stroke();
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawRealisticWishingWell(ctx, d, now) {
    // 1. Stone Well Basin
    const basinGrad = ctx.createLinearGradient(-19, 0, 19, 0);
    basinGrad.addColorStop(0, '#94A3B8');
    basinGrad.addColorStop(0.35, '#E2E8F0');
    basinGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = basinGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-19, -15, 38, 15, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(0, -15, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dark water inside well
    ctx.fillStyle = '#0369A1';
    ctx.beginPath();
    ctx.ellipse(0, -14.5, 14, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bricks lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    [-10, 0, 10].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx, -14);
        ctx.lineTo(bx, -2);
        ctx.stroke();
    });

    // 2. Wooden roof posts
    const postGrad = ctx.createLinearGradient(-15, 0, -11, 0);
    postGrad.addColorStop(0, '#C28B57');
    postGrad.addColorStop(1, '#78350F');
    ctx.fillStyle = postGrad;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.roundRect(-15, -45, 4, 32, 1);
    ctx.roundRect(11, -45, 4, 32, 1);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#A16207';
    ctx.beginPath();
    ctx.roundRect(-13, -33, 26, 4, 1);
    ctx.fill();
    ctx.stroke();

    // Rope & bucket
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -31);
    ctx.lineTo(0, -20);
    ctx.stroke();

    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-4, -20);
    ctx.lineTo(-3, -13);
    ctx.lineTo(3, -13);
    ctx.lineTo(4, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Pitched Shingled Roof
    const roofGrad = ctx.createLinearGradient(0, -56, 0, -42);
    roofGrad.addColorStop(0, '#DC2626');
    roofGrad.addColorStop(1, '#991B1B');
    ctx.fillStyle = roofGrad;
    ctx.strokeStyle = '#450A0A';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(21, -42);
    ctx.lineTo(-21, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawRealisticBirdbath(ctx, d, now) {
    // 1. Classical carved stone base & pedestal
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const pedGrad = ctx.createLinearGradient(-5, 0, 5, 0);
    pedGrad.addColorStop(0, '#94A3B8');
    pedGrad.addColorStop(0.4, '#F1F5F9');
    pedGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = pedGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -1);
    ctx.lineTo(-3, -22);
    ctx.lineTo(3, -22);
    ctx.lineTo(5, -1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Wide fluted water bowl basin
    const bowlGrad = ctx.createLinearGradient(-19, 0, 19, 0);
    bowlGrad.addColorStop(0, '#94A3B8');
    bowlGrad.addColorStop(0.35, '#F8FAFC');
    bowlGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = bowlGrad;
    ctx.beginPath();
    ctx.ellipse(0, -22, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const waterGrad = ctx.createRadialGradient(0, -22, 1, 0, -22, 14);
    waterGrad.addColorStop(0, '#7DD3FC');
    waterGrad.addColorStop(0.7, '#38BDF8');
    waterGrad.addColorStop(1, '#0284C7');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(0, -22, 15, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();

    const ripple = (Math.sin(now * 0.004) + 1) * 0.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + ripple * 0.4})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, -22, 5 + ripple * 4, 2 + ripple * 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Cute Bluebird perched on rim
    const birdX = 12;
    const birdY = -27;
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.ellipse(birdX, birdY, 4, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.arc(birdX - 1.5, birdY + 1.2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.arc(birdX - 3.5, birdY - 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(birdX - 5.5, birdY - 1.5);
    ctx.lineTo(birdX - 8, birdY - 1);
    ctx.lineTo(birdX - 5.5, birdY - 0.5);
    ctx.fill();
}

function drawRealisticPicnicSet(ctx, d, now) {
    // 1. Red & White Checkered Picnic Blanket
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#FEE2E2';
    ctx.fillRect(-35, -20, 70, 40);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.72)';
    for (let x = -35; x <= 35; x += 8) {
        ctx.fillRect(x, -20, 4, 40);
    }
    for (let y = -20; y <= 20; y += 8) {
        ctx.fillRect(-35, y, 70, 4);
    }
    ctx.restore();

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Wicker Picnic Basket (left side)
    const bGrad = ctx.createLinearGradient(-24, 0, -8, 0);
    bGrad.addColorStop(0, '#B45309');
    bGrad.addColorStop(0.5, '#F59E0B');
    bGrad.addColorStop(1, '#92400E');
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.roundRect(-24, -13, 16, 11, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-16, -13, 7, Math.PI, 0);
    ctx.stroke();

    // 3. Porcelain Teapot & Teacups (right side)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(8, -4, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(13, -4);
    ctx.lineTo(17, -7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(3, -4, 3, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    const steamPulse = (Math.sin(now * 0.005) + 1) * 0.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + steamPulse * 0.4})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(17, -8);
    ctx.quadraticCurveTo(15 + steamPulse * 2, -14, 18, -18);
    ctx.stroke();

    // Two little cupcakes
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(19, 2, 3, 0, Math.PI * 2);
    ctx.arc(12, 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(19, 0.5, 1.3, 0, Math.PI * 2);
    ctx.arc(12, 3.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticStatue(ctx, d, now) {
    // 1. Classical stone pedestal
    const plinthGrad = ctx.createLinearGradient(-12, 0, 12, 0);
    plinthGrad.addColorStop(0, '#94A3B8');
    plinthGrad.addColorStop(0.35, '#F1F5F9');
    plinthGrad.addColorStop(1, '#64748B');
    ctx.fillStyle = plinthGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(-10, -10, 20, 10, 2);
    ctx.fill();
    ctx.stroke();

    // Moss patches
    ctx.fillStyle = '#65A30D';
    ctx.beginPath();
    ctx.ellipse(-7, -2, 3, 1.5, 0.3, 0, Math.PI * 2);
    ctx.ellipse(6, -6, 2.5, 1.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Carved Stone Rabbit Statue
    const stoneGrad = ctx.createLinearGradient(-7, 0, 7, 0);
    stoneGrad.addColorStop(0, '#CBD5E1');
    stoneGrad.addColorStop(0.35, '#FFFFFF');
    stoneGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = stoneGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    ctx.ellipse(0, -16, 7.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -26, 6, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-3, -35, 2.2, 5.5, -0.15, 0, Math.PI * 2);
    ctx.ellipse(3, -35, 2.2, 5.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-2.5, -18, 2.2, 0, Math.PI * 2);
    ctx.arc(2.5, -18, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, -11, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(-6, -11, 0.9, 0, Math.PI * 2);
    ctx.fill();
}

function drawRealisticFlowerCart(ctx, d, now) {
    // 1. Rustic Wooden Cart Bed
    const cartGrad = ctx.createLinearGradient(-26, 0, 26, 0);
    cartGrad.addColorStop(0, '#B45309');
    cartGrad.addColorStop(0.5, '#D97706');
    cartGrad.addColorStop(1, '#78350F');
    ctx.fillStyle = cartGrad;
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.roundRect(-24, -18, 48, 12, 3);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(24, -12);
    ctx.lineTo(34, -4);
    ctx.stroke();

    // 2. Terracotta Flower Pots
    const pots = [
        { x: -16, c: '#A855F7', fc: '#C084FC' },
        { x: -6,  c: '#EAB308', fc: '#FACC15' },
        { x: 5,   c: '#F97316', fc: '#FB923C' },
        { x: 15,  c: '#EC4899', fc: '#F472B6' }
    ];
    for (const pot of pots) {
        ctx.fillStyle = '#C2410C';
        ctx.strokeStyle = '#7C2D12';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(pot.x - 4, -18);
        ctx.lineTo(pot.x - 3, -24);
        ctx.lineTo(pot.x + 3, -24);
        ctx.lineTo(pot.x + 4, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pot.c;
        ctx.beginPath();
        ctx.arc(pot.x - 2, -27, 3, 0, Math.PI * 2);
        ctx.arc(pot.x + 2, -27, 3, 0, Math.PI * 2);
        ctx.arc(pot.x, -30, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pot.fc;
        ctx.beginPath();
        ctx.arc(pot.x, -28, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Two large spoked wooden wagon wheels
    const wheels = [-15, 15];
    for (const wx of wheels) {
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2.4;
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.arc(wx, -2, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(wx, -2, 7.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#1C1917';
        ctx.beginPath();
        ctx.arc(wx, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.3;
        for (let sp = 0; sp < 4; sp++) {
            const rad = (sp * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(wx + Math.cos(rad) * 2, -2 + Math.sin(rad) * 2);
            ctx.lineTo(wx + Math.cos(rad) * 7.5, -2 + Math.sin(rad) * 7.5);
            ctx.moveTo(wx - Math.cos(rad) * 2, -2 - Math.sin(rad) * 2);
            ctx.lineTo(wx - Math.cos(rad) * 7.5, -2 - Math.sin(rad) * 7.5);
            ctx.stroke();
        }
    }
}

function drawRealisticLanternMushroom(ctx, d, now) {
    const isNight = typeof isNightMode !== 'undefined' && isNightMode;
    const pulse = Math.sin(now * 0.005) * 0.5 + 0.5;

    // Bioluminescent glow around cap
    const glowRadius = 32 + pulse * 8 + (isNight ? 14 : 0);
    const glowGrad = ctx.createRadialGradient(0, -18, 4, 0, -18, glowRadius);
    glowGrad.addColorStop(0, `rgba(250, 204, 21, ${isNight ? 0.65 : 0.35})`);
    glowGrad.addColorStop(0.6, `rgba(245, 158, 11, ${isNight ? 0.3 : 0.12})`);
    glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, -18, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stalks
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-4, -18, 8, 20, 3);
    ctx.fill();
    ctx.stroke();

    // Side little stalk
    ctx.beginPath();
    ctx.roundRect(5, -10, 5, 12, 2.5);
    ctx.fill();
    ctx.stroke();

    // Main cap (golden-amber with inner light)
    const capGrad = ctx.createLinearGradient(0, -32, 0, -14);
    capGrad.addColorStop(0, '#FDE047');
    capGrad.addColorStop(0.5, '#F59E0B');
    capGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(0, -18, 14, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Luminous spots on cap
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-5, -24, 2, 0, Math.PI * 2);
    ctx.arc(4, -26, 2.3, 0, Math.PI * 2);
    ctx.arc(0, -20, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Little side cap
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(7, -10, 7.5, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawRealisticTreeSwing(ctx, d, now) {
    // Tree branch arched from right to left
    ctx.save();
    ctx.strokeStyle = '#57412E';
    ctx.fillStyle = '#6F4E37';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(34, 4);
    ctx.quadraticCurveTo(30, -50, -30, -44);
    ctx.stroke();

    // Foliage & sakura clusters at the top branch
    const clusters = [
        { x: -28, y: -48, r: 14, c: '#FBCFE8' },
        { x: -16, y: -54, r: 16, c: '#F472B6' },
        { x: 0, y: -56, r: 18, c: '#FBCFE8' },
        { x: 18, y: -50, r: 15, c: '#F472B6' },
        { x: 28, y: -42, r: 13, c: '#FDA4AF' }
    ];
    clusters.forEach(cl => {
        ctx.fillStyle = cl.c;
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#BE185D';
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
    });

    // Hanging ropes with gentle swing
    const swayAngle = Math.sin(now * 0.0025) * 0.08;
    ctx.translate(0, -46);
    ctx.rotate(swayAngle);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-10, 36);
    ctx.moveTo(10, 0);
    ctx.lineTo(10, 36);
    ctx.stroke();

    // Wooden swing plank
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-15, 36, 30, 6, 2);
    ctx.fill();
    ctx.stroke();

    // Little floral garland on ropes
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(-10, 14, 2.5, 0, Math.PI * 2);
    ctx.arc(-10, 26, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 18, 2.5, 0, Math.PI * 2);
    ctx.arc(10, 30, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawRealisticGoldenLotus(ctx, d, now) {
    const pulse = Math.sin(now * 0.004) * 0.5 + 0.5;

    // Glowing golden water shimmer ripple
    ctx.save();
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.45 + pulse * 0.35})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 4, 26 + pulse * 4, 11 + pulse * 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lily pad base (golden-emerald)
    ctx.fillStyle = '#065F46';
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 3, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden Lotus Petals
    const petalCount = 7;
    for (let i = 0; i < petalCount; i++) {
        const ang = (i / petalCount) * Math.PI * 2;
        const px = Math.cos(ang) * 9;
        const py = Math.sin(ang) * 5 - 6;

        ctx.fillStyle = i % 2 === 0 ? '#FBBF24' : '#FDE047';
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(px, py, 5.5, 9, ang * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Glowing Lotus core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawDecorationInstance(ctx, d, now, dt) {
    if (!d) return;
    if (d.birthScale !== undefined && d.birthScale < 1) {
        d.birthScale = Math.min(1, d.birthScale + (dt || 0.016) * 5.0);
    }
    const scale = d.birthScale || 1;
    const isSelected = (typeof selectedDecoration !== 'undefined' && selectedDecoration && selectedDecoration.id === d.id);

    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 0. Selected Halo on ground plane (subtle, clean, without any text handle)
    if (isSelected) {
        const pulse = (Math.sin(now * 0.007) + 1) * 0.5;
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.55 + pulse * 0.4})`;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.ellipse(0, 3, (d.width || 48) * 0.58 + 4, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 1. Ambient Occlusion Ground Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(25, 45, 20, 0.22)';
    ctx.beginPath();
    const shadowW = (d.width || 48) * 0.52;
    const shadowH = (d.type === 'bridge' || d.type === 'fountain' || d.type === 'gazebo') ? 9 : 6;
    ctx.ellipse(0, 3, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Realistic 2.5D Drawing per Decoration Type
    ctx.save();
    if (d.type === 'fence') {
        drawRealisticFence(ctx, d, now);
    } else if (d.type === 'fence_side') {
        drawRealisticFenceSide(ctx, d, now);
    } else if (d.type === 'stepping_stone') {
        drawRealisticSteppingStones(ctx, d, now);
    } else if (d.type === 'mushroom') {
        drawRealisticMushroom(ctx, d, now);
    } else if (d.type === 'bench') {
        drawRealisticBench(ctx, d, now);
    } else if (d.type === 'lantern') {
        drawRealisticLantern(ctx, d, now);
    } else if (d.type === 'bridge') {
        drawRealisticBridge(ctx, d, now);
    } else if (d.type === 'pet_house') {
        drawRealisticPetHouse(ctx, d, now);
    } else if (d.type === 'fountain') {
        drawRealisticFountain(ctx, d, now);
    } else if (d.type === 'gazebo') {
        drawRealisticGazebo(ctx, d, now);
    } else if (d.type === 'flower_arch') {
        drawRealisticFlowerArch(ctx, d, now);
    } else if (d.type === 'windmill') {
        drawRealisticWindmill(ctx, d, now);
    } else if (d.type === 'wishing_well') {
        drawRealisticWishingWell(ctx, d, now);
    } else if (d.type === 'birdbath') {
        drawRealisticBirdbath(ctx, d, now);
    } else if (d.type === 'picnic_set') {
        drawRealisticPicnicSet(ctx, d, now);
    } else if (d.type === 'statue') {
        drawRealisticStatue(ctx, d, now);
    } else if (d.type === 'flower_cart') {
        drawRealisticFlowerCart(ctx, d, now);
    } else if (d.type === 'lantern_mushroom') {
        drawRealisticLanternMushroom(ctx, d, now);
    } else if (d.type === 'tree_swing') {
        drawRealisticTreeSwing(ctx, d, now);
    } else if (d.type === 'golden_lotus') {
        drawRealisticGoldenLotus(ctx, d, now);
    }
    ctx.restore();

    ctx.restore();
}


// ============================================================================
// 3. KEDEKATAN HEWAN (FRIENDSHIP ❤️), KEPRIBADIAN 🎭, AKSESORI 👑,
//    INTERAKSI ANTAR-HEWAN 🐱🐶 & MERAMU TEH BUNGA 🫖
// ============================================================================
const ANIMAL_PERSONALITIES = [
    { id: 'playful', label: 'Ceria', speedMult: 1.2 },
    { id: 'lazy', label: 'Pemalas', speedMult: 0.78 },
    { id: 'affectionate', label: 'Penyayang', speedMult: 1.0 },
    { id: 'shy', label: 'Pemalu', speedMult: 1.05 },
    { id: 'curious', label: 'Penjelajah', speedMult: 1.15 }
];

const ANIMAL_ACCESSORIES = [
    { id: 'none', icon: '<svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', name: 'Polos' },
    { id: 'crown', icon: '<svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>', name: 'Mahkota Bunga' },
    { id: 'bow', icon: '<svg class="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M9 12c-3-3-6-2-6 0s3 3 6 0zM15 12c3-3 6-2 6 0s-3 3-6 0zM10 14l-2 5M14 14l2 5"/></svg>', name: 'Pita Pink' },
    { id: 'hat', icon: '<svg class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 18h20M5 18V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"/></svg>', name: 'Topi Pesulap' },
    { id: 'scarf', icon: '<svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a4 4 0 0 1 8 0v8a2 2 0 0 0 4 0V8M10 14h4v6h-4z"/></svg>', name: 'Syal Hangat' },
    { id: 'glasses', icon: '<svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="2" y1="10" x2="3" y2="12"/><line x1="22" y1="10" x2="21" y2="12"/></svg>', name: 'Kacamata Keren' },
    { id: 'santa', icon: '<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 14H5l7-14zM4 16h16v4H4z"/><circle cx="12" cy="2" r="2"/></svg>', name: 'Topi Musim Salju' },
    { id: 'sakura_crown', icon: '<svg class="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/><circle cx="12" cy="8" r="1.5" fill="#f472b6"/></svg>', name: 'Mahkota Sakura ⭐' },
    { id: 'golden_bell', icon: '<svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="4"/><path d="M12 4v6M8 8h8M10 18v2h4v-2"/></svg>', name: 'Pita & Lonceng ⭐' },
    { id: 'magic_cape', icon: '<svg class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 16 8-16-8 4-8-4z"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/></svg>', name: 'Jubah Bintang ⭐' }
];

function ensureAnimalRpgProps(a) {
    if (!a) return;
    if (typeof a.friendship !== 'number') {
        a.friendship = 20; // Starts at 20/100 (Kenal)
    }
    if (!a.personality) {
        const hash = (a.id || 'a').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        a.personality = ANIMAL_PERSONALITIES[hash % ANIMAL_PERSONALITIES.length].id;
    }
    if (!a.accessory) {
        a.accessory = 'none';
    }
}

function getAnimalPersonalityInfo(a) {
    ensureAnimalRpgProps(a);
    return ANIMAL_PERSONALITIES.find(p => p.id === a.personality) || ANIMAL_PERSONALITIES[0];
}

function getAnimalFriendshipTier(a) {
    ensureAnimalRpgProps(a);
    const val = Math.round(a.friendship || 0);
    if (val >= 90) return { level: 4, label: 'Sahabat Sejati (BFF)', pct: val, color: '#E11D48' };
    if (val >= 60) return { level: 3, label: 'Sahabat Dekat', pct: val, color: '#EA580C' };
    if (val >= 30) return { level: 2, label: 'Teman Akrab', pct: val, color: '#D97706' };
    return { level: 1, label: 'Baru Kenal', pct: val, color: '#477431' };
}

function boostAnimalFriendship(a, amount = 8) {
    if (!a) return;
    ensureAnimalRpgProps(a);
    const prevTier = getAnimalFriendshipTier(a).level;
    a.friendship = Math.min(100, (a.friendship || 0) + amount);
    const newTier = getAnimalFriendshipTier(a).level;

    if (newTier > prevTier && newTier === 4) {
        if (typeof incrementStat === 'function') incrementStat('bffAnimalsCount', 1);
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`${a.name} kini menjadi Sahabat Sejati (BFF) denganmu!`);
        }
    }
}

function cycleAnimalAccessory(animalId) {
    if (typeof animals === 'undefined') return;
    const a = animals.find(item => item.id === animalId);
    if (!a) return;
    ensureAnimalRpgProps(a);

    const isUnlocked = (accId) => {
        if (accId === 'sakura_crown') return dailyLoginState.unlockedStarItems && dailyLoginState.unlockedStarItems.includes('acc_sakura_crown');
        if (accId === 'golden_bell') return dailyLoginState.unlockedStarItems && dailyLoginState.unlockedStarItems.includes('acc_golden_bell');
        if (accId === 'magic_cape') return dailyLoginState.unlockedStarItems && dailyLoginState.unlockedStarItems.includes('acc_magic_cape');
        return true;
    };

    let idx = ANIMAL_ACCESSORIES.findIndex(ac => ac.id === a.accessory);
    let nextAcc = null;
    for (let step = 1; step <= ANIMAL_ACCESSORIES.length; step++) {
        const candidate = ANIMAL_ACCESSORIES[(idx + step) % ANIMAL_ACCESSORIES.length];
        if (isUnlocked(candidate.id)) {
            nextAcc = candidate;
            break;
        }
    }
    if (!nextAcc) nextAcc = ANIMAL_ACCESSORIES[0];
    a.accessory = nextAcc.id;

    a.petAnim = 0.8;
    a.bubbleText = '( ˶˘ ³˘)♡';
    a.bubbleTimer = 2.5;

    if (typeof incrementQuestProgress === 'function') {
        incrementQuestProgress('change_accessory', 1);
    }

    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof renderActiveAnimalsList === 'function') renderActiveAnimalsList();
    if (typeof updateFollowBanner === 'function') updateFollowBanner();
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}

function drawAnimalAccessory(ctx, a, now) {
    ensureAnimalRpgProps(a);
    // In winter season, if animal has no accessory and is a land animal, give a cozy winter scarf!
    let acc = a.accessory;
    if ((!acc || acc === 'none') && currentSeason === 'winter' && a.type !== 'fish' && a.type !== 'butterfly') {
        acc = 'scarf';
    }
    if (!acc || acc === 'none') return;

    ctx.save();
    ctx.translate(a.x, a.y);

    const dragLift = a.isBeingDragged ? -16 : 0;
    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;
    const walkHop = a.state === 'walking' ? Math.abs(Math.sin(a.hopPhase || 0)) * 3.5 : 0;
    ctx.translate(0, -petBounce - walkHop + dragLift);

    if (a.facingLeft) ctx.scale(-1, 1);

    // Determine head & neck anchor by species
    let headX = 8, headY = -25, neckX = 5, neckY = -12;
    if (a.type === 'rabbit') {
        headX = 7; headY = -23; neckX = 4; neckY = -11;
    } else if (a.type === 'butterfly') {
        headX = 0; headY = -14; neckX = 0; neckY = -6;
    } else if (a.type === 'fish') {
        headX = 5; headY = -8; neckX = 2; neckY = -2;
    } else if (a.type === 'custom') {
        const h = a.height || 48;
        headX = 0; headY = -h * 0.88; neckX = 0; neckY = -h * 0.45;
    }

    if (acc === 'crown') {
        // Cute floral crown
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.arc(headX - 4, headY, 3, 0, Math.PI * 2);
        ctx.arc(headX + 4, headY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(headX, headY - 1, 3.4, 0, Math.PI * 2);
        ctx.fill();
    } else if (acc === 'bow') {
        // Cute pink ribbon bow
        ctx.fillStyle = '#EC4899';
        ctx.strokeStyle = '#9D174D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(headX - 4, headY, 4, 2.5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(headX + 4, headY, 4, 2.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FBCFE8';
        ctx.beginPath();
        ctx.arc(headX, headY, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (acc === 'hat') {
        // Tiny wizard / top hat
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(headX, headY, 7, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(headX - 4.5, headY - 8, 9, 8, 2);
        ctx.fill();
        ctx.stroke();
    } else if (acc === 'scarf') {
        // Cozy red knitted scarf around neck
        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(neckX - 6, neckY - 2, 12, 4.5, 2.5);
        ctx.roundRect(neckX + 1, neckY + 1, 4, 6, 1.5);
        ctx.fill();
        ctx.stroke();
    } else if (acc === 'glasses') {
        // Cool tiny sunglasses
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.roundRect(headX - 3, headY + 4, 5, 3.5, 1);
        ctx.roundRect(headX + 3, headY + 4, 5, 3.5, 1);
        ctx.fill();
        ctx.stroke();
    } else if (acc === 'santa') {
        // Festive red winter hat with white pom-pom
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(headX - 6, headY);
        ctx.lineTo(headX + 2, headY - 9);
        ctx.lineTo(headX + 6, headY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(headX - 6.5, headY - 1.5, 13, 3, 1.5);
        ctx.arc(headX + 2, headY - 9.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (acc === 'sakura_crown') {
        // Glowing sakura floral crown
        const colors = ['#F472B6', '#FBCFE8', '#F472B6', '#FBCFE8', '#F472B6'];
        for (let i = 0; i < 5; i++) {
            const petX = headX - 6 + i * 3;
            const petY = headY - Math.sin((i / 4) * Math.PI) * 3;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(petX, petY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FACC15';
            ctx.beginPath();
            ctx.arc(petX, petY, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (acc === 'golden_bell') {
        // Red collar with gleaming golden bell
        ctx.fillStyle = '#DC2626';
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(neckX - 5, neckY - 1, 10, 3.5, 1.5);
        ctx.fill();
        ctx.stroke();

        // Little bell
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(neckX, neckY + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(neckX - 0.8, neckY + 3.2, 0.9, 0, Math.PI * 2);
        ctx.fill();
    } else if (acc === 'magic_cape') {
        // Magic starry cape flowing behind
        ctx.fillStyle = '#4C1D95';
        ctx.strokeStyle = '#2E1065';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(neckX - 3, neckY);
        ctx.quadraticCurveTo(neckX - 12, neckY + 8, neckX - 14, neckY + 16);
        ctx.quadraticCurveTo(neckX - 4, neckY + 14, neckX + 2, neckY + 16);
        ctx.lineTo(neckX + 3, neckY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tiny gold stars embroidered on cape
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(neckX - 6, neckY + 8, 1.2, 0, Math.PI * 2);
        ctx.arc(neckX - 10, neckY + 12, 1.0, 0, Math.PI * 2);
        ctx.arc(neckX - 2, neckY + 11, 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Interaksi sosial antar-hewan secara alami
var socialCheckTimer = 0;
function updateAnimalSocialInteractions(dt, now) {
    if (typeof animals === 'undefined' || animals.length < 2) return;
    socialCheckTimer += dt;
    if (socialCheckTimer < 4.5) return;
    socialCheckTimer = 0;

    for (let i = 0; i < animals.length; i++) {
        const a = animals[i];
        ensureAnimalRpgProps(a);
        if (a.isBeingDragged || a.bubbleTimer > 0) continue;

        // Check if near another animal
        for (let j = i + 1; j < animals.length; j++) {
            const b = animals[j];
            if (b.isBeingDragged) continue;
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 58 && Math.random() < 0.35) {
                // Cute social interaction!
                if (a.type === 'cat' && b.type === 'fish') {
                    a.bubbleText = '(๑•᎑•๑)';
                    a.bubbleTimer = 2.8;
                } else {
                    a.bubbleText = '( ˶˘ ³˘)♡';
                    a.bubbleTimer = 2.6;
                    b.bubbleText = '(˶˃ ᵕ ˂˶)';
                    b.bubbleTimer = 2.6;
                }
                break;
            }
        }
    }
}

// Meramu Teh Bunga (Crafting) untuk disajikan ke seluruh hewan di kebun
function brewAndServeFlowerTea() {
    if (typeof flowers === 'undefined' || flowers.length < 3) {
        if (typeof showGardenNotice === 'function') {
            showGardenNotice('Kamu butuh minimal 3 bunga di kebun untuk menyeduh Teh Bunga.');
        }
        return;
    }
    if (typeof animals === 'undefined' || animals.length === 0) {
        if (typeof showGardenNotice === 'function') {
            showGardenNotice('Panggil hewan terlebih dahulu untuk menikmati Teh Bunga buatanmu.');
        }
        return;
    }

    animals.forEach(a => {
        boostAnimalFriendship(a, 18);
        a.petAnim = 1.0;
        a.state = 'happy';
        a.stateTimer = 4.0;
        a.bubbleText = '(˶ˆᗜˆ˵)♡';
        a.bubbleTimer = 3.5;

        if (typeof particles !== 'undefined') {
            for (let i = 0; i < 4; i++) {
                particles.push({
                    type: 'heart',
                    x: a.x + (Math.random() - 0.5) * 28,
                    y: a.y - 20 - Math.random() * 15,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: -1.3 - Math.random() * 1.0,
                    size: 16 + Math.random() * 6,
                    alpha: 1.0
                });
            }
        }
    });

    if (typeof incrementStat === 'function') incrementStat('teaBrewed', 1);
    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice('Teh Bunga Harum disajikan! Semua hewan di kebun sangat bahagia (+18 Kedekatan)!');
    }
    if (typeof renderActiveAnimalsList === 'function') renderActiveAnimalsList();
    if (typeof renderJournalModalContent === 'function') renderJournalModalContent();
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}


// ============================================================================
// 4. BUKU JURNAL / DIARY KEBUN 📓, ENSIKLOPEDIA 📖 & DAILY STREAK 📅
// ============================================================================
const JOURNAL_STORAGE_KEY = 'fella_garden_journal_v1';
const POLAROID_STORAGE_KEY = 'fella_garden_polaroid_v1';
var currentJournalTab = 'diary'; // 'diary' | 'encyclopedia' | 'daily' | 'album'
var diaryEntries = [];
var encyclopediaUnlocked = {};
var polaroidAlbum = [];

var dailyLoginState = {
    streak: 1,
    lastClaimDate: '',
    stars: 5,
    unlockedStarItems: [],
    dailyQuests: [],
    questDate: ''
};

const STAR_SHOP_CATALOG = [
    {
        id: 'decor_lantern_mushroom',
        type: 'decor',
        itemType: 'lantern_mushroom',
        name: 'Lampu Jamur Berpendar',
        cost: 3,
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14a8 8 0 0 1 16 0c0 1.5-2 1.5-3 1.5H7c-1 0-3 0-3-1.5z"/><path d="M10 15.5v5a2 2 0 0 0 4 0v-5"/><circle cx="12" cy="8" r="2" fill="currentColor"/></svg>',
        desc: 'Jamur bercahaya hangat lembut yang menyinari kebun di malam hari.'
    },
    {
        id: 'decor_tree_swing',
        type: 'decor',
        itemType: 'tree_swing',
        name: 'Ayunan Pohon Bunga',
        cost: 5,
        icon: '<svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V10a6 6 0 0 1 12-3"/><path d="M10 9v7M14 9v7M8 16h8"/></svg>',
        desc: 'Cabang pohon rindang dengan ayunan kayu berhias kuntum bunga sakura.'
    },
    {
        id: 'decor_golden_lotus',
        type: 'decor',
        itemType: 'golden_lotus',
        name: 'Kolam Teratai Emas',
        cost: 6,
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2a5 5 0 0 1 5 5c0 4-5 8-5 8s-5-4-5-8a5 5 0 0 1 5-5z"/><path d="M4 18c4 2 12 2 16 0"/></svg>',
        desc: 'Teratai emas langka terapung di air dengan riak kilau memukau.'
    },
    {
        id: 'acc_sakura_crown',
        type: 'accessory',
        itemType: 'sakura_crown',
        name: 'Mahkota Sakura Emas',
        cost: 4,
        icon: '<svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/><circle cx="12" cy="8" r="1.5" fill="#f472b6"/></svg>',
        desc: 'Mahkota kelopak bunga sakura berhias kilau emas untuk hewan peliharaan.'
    },
    {
        id: 'acc_golden_bell',
        type: 'accessory',
        itemType: 'golden_bell',
        name: 'Pita & Lonceng Emas',
        cost: 3,
        icon: '<svg class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="4"/><path d="M12 4v6M8 8h8M10 18v2h4v-2"/></svg>',
        desc: 'Pita beludru merah berlonceng emas mungil yang berdenting gembira.'
    },
    {
        id: 'acc_magic_cape',
        type: 'accessory',
        itemType: 'magic_cape',
        name: 'Jubah Bintang Ajaib',
        cost: 5,
        icon: '<svg class="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l8 16 8-16-8 4-8-4z"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/></svg>',
        desc: 'Jubah kecil sutra ungu malam bertabur rasi bintang magis.'
    }
];

const QUEST_POOL = [
    { id: 'water_flowers', title: 'Segarkan Kebun', desc: 'Siram bunga di kebun sebanyak 5 kali', target: 5, reward: 2, icon: '💧' },
    { id: 'pet_animals', title: 'Beri Kasih Sayang', desc: 'Belai atau sapa hewan kesayanganmu 4 kali', target: 4, reward: 2, icon: '🐾' },
    { id: 'plant_flower', title: 'Tunas Baru Mekar', desc: 'Rawat bunga hingga mekar sempurna 2 kali', target: 2, reward: 3, icon: '🌱' },
    { id: 'brew_tea', title: 'Aroma Teh Bunga', desc: 'Seduh dan sajikan teh bunga untuk hewan', target: 1, reward: 2, icon: '🍵' },
    { id: 'take_photo', title: 'Abadikan Momen', desc: 'Ambil foto estetik di Mode Kamera Polaroid', target: 1, reward: 2, icon: '📸' },
    { id: 'change_accessory', title: 'Gaya Hewan Kesayangan', desc: 'Ganti aksesoris hewan peliharaan 2 kali', target: 2, reward: 2, icon: '🎀' },
    { id: 'collect_seed', title: 'Panen Benih Alami', desc: 'Pungut benih hasil penyerbukan kupu-kupu', target: 1, reward: 3, icon: '✨' }
];

function generateDailyQuests() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dailyLoginState.questDate === todayStr && Array.isArray(dailyLoginState.dailyQuests) && dailyLoginState.dailyQuests.length >= 3) {
        return;
    }
    const pool = [...QUEST_POOL];
    const picked = [];
    while (picked.length < 3 && pool.length > 0) {
        const randIdx = Math.floor(Math.random() * pool.length);
        const q = pool.splice(randIdx, 1)[0];
        picked.push({
            id: q.id,
            title: q.title,
            desc: q.desc,
            target: q.target,
            reward: q.reward,
            icon: q.icon,
            current: 0,
            completed: false,
            claimed: false
        });
    }
    dailyLoginState.questDate = todayStr;
    dailyLoginState.dailyQuests = picked;
    saveJournalToStorage();
}

function incrementQuestProgress(action, amount = 1) {
    if (!dailyLoginState.dailyQuests || !Array.isArray(dailyLoginState.dailyQuests)) return;
    let anyCompleted = false;
    dailyLoginState.dailyQuests.forEach(q => {
        if (q.id === action && !q.completed) {
            q.current = Math.min(q.target, (q.current || 0) + amount);
            if (q.current >= q.target) {
                q.completed = true;
                anyCompleted = true;
                if (typeof showGardenNotice === 'function') {
                    showGardenNotice(`🎯 Misi Selesai: "${q.title}"! Buka Jurnal untuk klaim +${q.reward} ⭐`);
                }
                if (typeof playChimeSound === 'function') playChimeSound();
            }
        }
    });
    if (anyCompleted || amount > 0) {
        saveJournalToStorage();
        if (document.getElementById('journalModal') && !document.getElementById('journalModal').classList.contains('hidden')) {
            renderJournalModalContent();
        }
    }
}

function awardStars(amount = 1) {
    if (typeof dailyLoginState !== 'undefined') {
        dailyLoginState.stars = (dailyLoginState.stars || 0) + amount;
        saveJournalToStorage();
        if (typeof renderJournalModalContent === 'function') {
            const modal = document.getElementById('journalModal');
            if (modal && !modal.classList.contains('hidden')) {
                renderJournalModalContent();
            }
        }
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }
}

function claimQuestReward(index) {
    if (!dailyLoginState.dailyQuests || !dailyLoginState.dailyQuests[index]) return;
    const q = dailyLoginState.dailyQuests[index];
    if (q.completed && !q.claimed) {
        q.claimed = true;
        dailyLoginState.stars = (dailyLoginState.stars || 0) + q.reward;
        saveJournalToStorage();
        renderJournalModalContent();
        if (typeof playChimeSound === 'function') playChimeSound();
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`🌟 Hadiah Misi Diklaim! Kamu mendapat +${q.reward} Bintang Kebun!`);
        }
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }
}

function buyStarShopItem(itemId) {
    const item = STAR_SHOP_CATALOG.find(it => it.id === itemId);
    if (!item) return;

    dailyLoginState.unlockedStarItems = dailyLoginState.unlockedStarItems || [];
    if (dailyLoginState.unlockedStarItems.includes(itemId)) {
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`Kamu sudah memiliki "${item.name}"!`);
        }
        return;
    }

    if ((dailyLoginState.stars || 0) < item.cost) {
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`⭐ Bintang Kebunmu tidak cukup (${dailyLoginState.stars || 0}/${item.cost}). Selesaikan misi harian untuk menambah bintang!`);
        }
        return;
    }

    dailyLoginState.stars = (dailyLoginState.stars || 0) - item.cost;
    dailyLoginState.unlockedStarItems.push(itemId);
    saveJournalToStorage();
    renderJournalModalContent();
    if (typeof renderDecorModalCatalog === 'function') renderDecorModalCatalog();

    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice(`🎉 Berhasil menukarkan "${item.name}"! Kini siap digunakan di kebunmu.`);
    }
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}

function loadJournalFromStorage() {
    try {
        const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.diaryEntries)) diaryEntries = parsed.diaryEntries;
            if (parsed.encyclopediaUnlocked) encyclopediaUnlocked = parsed.encyclopediaUnlocked;
            if (parsed.dailyLoginState) {
                dailyLoginState = { 
                    ...dailyLoginState, 
                    ...parsed.dailyLoginState,
                    unlockedStarItems: Array.isArray(parsed.dailyLoginState.unlockedStarItems) ? parsed.dailyLoginState.unlockedStarItems : [],
                    dailyQuests: Array.isArray(parsed.dailyLoginState.dailyQuests) ? parsed.dailyLoginState.dailyQuests : []
                };
            }
        }
    } catch (e) {
        console.warn('Failed to load journal state:', e);
    }
    loadPolaroidAlbumFromStorage();
    generateDailyQuests();
    checkDailyStreakStatus();
}

function saveJournalToStorage() {
    try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify({
            diaryEntries,
            encyclopediaUnlocked,
            dailyLoginState
        }));
    } catch (e) {}
}

function loadPolaroidAlbumFromStorage() {
    try {
        const raw = localStorage.getItem(POLAROID_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) polaroidAlbum = parsed;
        }
    } catch (e) {}
}

function savePolaroidAlbumToStorage() {
    try {
        localStorage.setItem(POLAROID_STORAGE_KEY, JSON.stringify(polaroidAlbum.slice(0, 12)));
    } catch (e) {}
}

function deleteAlbumPhoto(id) {
    polaroidAlbum = polaroidAlbum.filter(p => p.id !== id);
    savePolaroidAlbumToStorage();
    renderJournalModalContent();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice('Foto kenangan telah dihapus dari Album.');
    }
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}

function downloadAlbumPhoto(id) {
    const photo = polaroidAlbum.find(p => p.id === id);
    if (!photo || !photo.dataUrl) return;
    const a = document.createElement('a');
    a.download = `polaroid-${photo.id}.jpg`;
    a.href = photo.dataUrl;
    a.click();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice('Foto Polaroid berhasil diunduh ke komputermu! 📸');
    }
}

function getDailyPetLetter() {
    if (typeof animals === 'undefined' || !Array.isArray(animals) || animals.length === 0) {
        return {
            sender: 'Peri Kebun 🧚',
            text: 'Halo teman! Terima kasih telah berkunjung ke kebun hari ini. Rawatlah tanaman dengan penuh kasih sayang, dan kebun akan membalas senyummu!'
        };
    }
    let bestPet = animals[0];
    for (let i = 1; i < animals.length; i++) {
        if ((animals[i].friendship || 0) > (bestPet.friendship || 0)) {
            bestPet = animals[i];
        }
    }
    const name = bestPet.name || 'Sahabat';
    const personality = bestPet.personality || 'playful';
    const type = bestPet.type || 'pet';

    let msgs = [];
    if (personality === 'gentle') {
        msgs = [
            `Selamat pagi! Bersamamu di bawah semilir angin kebun membuat hatiku selalu tenang dan hangat. 💤🌸`,
            `Terima kasih sudah selalu merawat bunga-bunga dengan lembut. Duduk di dekatmu adalah saat terbaikku hari ini. 🍵✨`,
            `Aroma tanah sehabis disiram terasa menenangkan sekali. Semoga harimu penuh berkah dan kebahagiaan ya! 🌿💚`
        ];
    } else if (personality === 'curious') {
        msgs = [
            `Tadi aku menemukan batu kecil berkilau di dekat petak bunga! Kebun ini penuh rahasia ajaib yang menyenangkan! 🔍✨`,
            `Air kolam tampak sangat jernih hari ini! Aku penasaran apa yang sedang dibicarakan ikan-ikan di sana? 🌊🐟`,
            `Kupu-kupu terbang tinggi sekali tadi siang. Aku mencoba mengejarnya tapi kakiku tergelincir rumput, hihi! 🦋🌻`
        ];
    } else {
        msgs = [
            `Halo sahabatku tersayang! Ayo kita main kejar-kejaran lagi di antara rerumputan hijau kebun nanti sore! 🐾🎉`,
            `Aku tadi bermimpi tentang taman bunga warna-warni yang sangat luas! Terima kasih sudah menciptakan kebun seindah ini! 💖🌻`,
            `Melihatmu tersenyum merawat kebun membuat ekorku tak henti-hentinya bergoyang gembira! 🐕✨`
        ];
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) hash = (hash * 31 + todayStr.charCodeAt(i)) >>> 0;
    const msg = msgs[hash % msgs.length];

    const typeIcons = { cat: '🐱', dog: '🐶', rabbit: '🐰', butterfly: '🦋', fish: '🐟' };
    const icon = typeIcons[type] || '🐾';

    return {
        sender: `${name} ${icon} (Friendship ${Math.round(bestPet.friendship || 20)}/100)`,
        text: msg
    };
}

function unlockEncyclopediaEntry(entryKey) {
    if (!encyclopediaUnlocked[entryKey]) {
        encyclopediaUnlocked[entryKey] = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        saveJournalToStorage();
    }
}

function checkDailyStreakStatus() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const badge = document.getElementById('journalNotificationDot');
    if (badge) {
        if (dailyLoginState.lastClaimDate !== todayStr) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function claimDailyReward() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dailyLoginState.lastClaimDate === todayStr) {
        if (typeof showGardenNotice === 'function') {
            showGardenNotice('Kamu sudah mengklaim hadiah bintang harian hari ini! Kembali lagi besok ya 🌟');
        }
        return;
    }

    if (dailyLoginState.lastClaimDate) {
        dailyLoginState.streak = (dailyLoginState.streak || 0) + 1;
    } else {
        dailyLoginState.streak = 1;
    }
    dailyLoginState.lastClaimDate = todayStr;
    const bonusStars = dailyLoginState.streak % 7 === 0 ? 5 : 2;
    dailyLoginState.stars = (dailyLoginState.stars || 0) + bonusStars;

    saveJournalToStorage();
    checkDailyStreakStatus();
    renderJournalModalContent();

    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice(`🌟 Hari ke-${dailyLoginState.streak}! Kamu mendapat +${bonusStars} Bintang Kebun!`);
    }
}

function openJournalModal(tab = null) {
    const modal = document.getElementById('journalModal');
    if (!modal) return;
    if (tab) currentJournalTab = tab;
    renderJournalModalContent();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeJournalModal() {
    const modal = document.getElementById('journalModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function switchJournalTab(tab) {
    currentJournalTab = tab;
    renderJournalModalContent();
}

function addDiaryEntry() {
    const input = document.getElementById('diaryNoteInput');
    const note = (input ? input.value.trim() : '') || 'Hari yang damai merawat bunga dan hewan di kebun kecilku.';
    const thumb = typeof generateWorldThumbnail === 'function' ? generateWorldThumbnail() : '';
    const sInfo = SEASON_DEFINITIONS[currentSeason] || SEASON_DEFINITIONS.spring;
    const wIcon = (typeof WEATHER_STATES !== 'undefined' && WEATHER_STATES[dynamicWeather]) ? WEATHER_STATES[dynamicWeather].icon : '☀️';

    const entry = {
        id: 'diary_' + Date.now(),
        date: new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        gardenName: (document.getElementById('gardenTitle')?.innerText || "Fella's Garden").trim(),
        seasonLabel: `${sInfo.icon} ${sInfo.label}`,
        weatherIcon: wIcon,
        note: note,
        thumbnail: thumb
    };

    diaryEntries.unshift(entry);
    if (input) input.value = '';
    saveJournalToStorage();
    renderJournalModalContent();

    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice('📓 Catatan kenangan hari ini berhasil disimpan ke Jurnal Kebun!');
    }
}

function deleteDiaryEntry(id) {
    diaryEntries = diaryEntries.filter(e => e.id !== id);
    saveJournalToStorage();
    renderJournalModalContent();
}

function renderJournalModalContent() {
    const container = document.getElementById('journalTabContent');
    if (!container) return;

    // Update tab button styles
    ['diary', 'encyclopedia', 'daily', 'album'].forEach(t => {
        const btn = document.getElementById('journalTabBtn-' + t);
        if (btn) {
            if (t === currentJournalTab) {
                btn.className = 'px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-hand font-bold bg-[#2B5B35] text-white shadow-xs transition';
            } else {
                btn.className = 'px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-hand font-bold bg-white text-[#2B5B35] border border-[#c5d9b7] hover:bg-[#eef5e6] transition';
            }
        }
    });

    if (currentJournalTab === 'diary') {
        const petLetter = getDailyPetLetter();
        container.innerHTML = `
            <div class="space-y-4">
                <!-- Daily Letter from Pet -->
                <div class="bg-gradient-to-r from-[#fffbf0] to-[#fef3c7] p-3.5 rounded-2xl border-2 border-amber-300 shadow-xs flex items-start gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-xl shadow-xs">
                        💌
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1 flex-wrap">
                            <span class="font-hand font-bold text-xs sm:text-sm text-amber-900">Surat Sahabat Kebun Hari Ini</span>
                            <span class="text-[10px] text-amber-700 font-bold px-2 py-0.5 rounded-full bg-amber-200/60">${petLetter.sender}</span>
                        </div>
                        <p class="font-hand text-xs sm:text-sm text-amber-950 mt-1 leading-snug">"${petLetter.text}"</p>
                    </div>
                </div>

                <div class="bg-white/90 p-3.5 rounded-2xl border-2 border-[#d2e0cb] space-y-2.5">
                    <label class="block font-hand font-bold text-sm text-[#2B5B35] flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        <span>Tulis Kenangan Kebun Hari Ini (Otomatis Menyimpan Foto Snapshot Kebun):</span>
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input id="diaryNoteInput" type="text" maxlength="140" placeholder="Ceritakan apa yang tumbuh atau terjadi di kebunmu hari ini..." class="flex-1 px-3.5 py-2 rounded-xl border border-[#b5cca3] bg-[#fdfbf7] text-xs sm:text-sm text-[#2B5B35] focus:outline-none focus:ring-2 focus:ring-[#7DB852]" />
                        <button onclick="addDiaryEntry()" class="px-4 py-2 rounded-xl bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs sm:text-sm shadow-sm transition shrink-0 inline-flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            <span>Simpan ke Diary</span>
                        </button>
                    </div>
                </div>

                ${diaryEntries.length === 0 ? `
                    <div class="py-10 text-center bg-white/60 rounded-2xl border border-dashed border-[#c5d9b7] flex flex-col items-center justify-center">
                        <div class="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </div>
                        <p class="font-hand font-bold text-base text-[#2B5B35]">Belum Ada Catatan Kenangan</p>
                        <p class="text-xs text-gray-500 mt-0.5">Tulis catatan pertamamu di atas untuk mengabadikan perkembangan kebunmu!</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${diaryEntries.map(e => `
                            <div class="bg-white rounded-2xl border-2 border-[#d7e2ce] p-3 flex gap-3 items-start shadow-xs">
                                ${e.thumbnail ? `<img src="${e.thumbnail}" class="w-24 h-16 object-cover rounded-xl border border-[#c5d9b7] shrink-0" />` : ''}
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-1 text-[10px] text-[#477431] font-bold">
                                        <span>${e.date} • ${e.seasonLabel}</span>
                                        <button onclick="deleteDiaryEntry('${e.id}')" class="text-rose-400 hover:text-rose-600" title="Hapus">✕</button>
                                    </div>
                                    <p class="font-hand font-bold text-sm text-[#2B5B35] mt-1 leading-snug break-words">"${e.note}"</p>
                                    <span class="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                        <svg class="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
                                        <span>${e.gardenName}</span>
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    } else if (currentJournalTab === 'encyclopedia') {
        const flowerSpeciesCount = (typeof flowers !== 'undefined' ? flowers.length : 0) + (typeof galleryFlowers !== 'undefined' ? galleryFlowers.length : 0);
        const animalSpeciesCount = (typeof animals !== 'undefined' ? animals.length : 0);
        const decorPlacedCount = decorations.length;

        container.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-3 gap-2.5 text-center">
                    <div class="bg-white p-3 rounded-2xl border border-[#d2e0cb] flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 mb-1">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12"/></svg>
                        </div>
                        <div class="font-hand font-bold text-base text-[#2B5B35]">${flowerSpeciesCount}</div>
                        <div class="text-[10px] text-gray-500">Koleksi Bunga</div>
                    </div>
                    <div class="bg-white p-3 rounded-2xl border border-[#d2e0cb] flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-1">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05L6.5 17a4.5 4.5 0 0 1 2.5-7Z"/></svg>
                        </div>
                        <div class="font-hand font-bold text-base text-[#2B5B35]">${animalSpeciesCount}</div>
                        <div class="text-[10px] text-gray-500">Sahabat Hewan Aktif</div>
                    </div>
                    <div class="bg-white p-3 rounded-2xl border border-[#d2e0cb] flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-1">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13h18M3 9h18M5 9v11M19 9v11M3 16h18"/></svg>
                        </div>
                        <div class="font-hand font-bold text-base text-[#2B5B35]">${decorPlacedCount}</div>
                        <div class="text-[10px] text-gray-500">Dekorasi Terpasang</div>
                    </div>
                </div>

                <div>
                    <h4 class="font-hand font-bold text-sm text-[#2B5B35] mb-2">Katalog Spesies & Objek Kebun:</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 4.25-.86 5.51A8.34 8.34 0 0 1 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.25.29-2.43.8-3.49C4.36 7.25 2.54 3.58 3.94 3c1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26z"/></svg>
                            </div>
                            <div><div class="font-hand font-bold text-xs text-[#2B5B35]">Kucing Kebun</div><div class="text-[10px] text-gray-400">Oyen, Kuro, Calico</div></div>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .107.94 1.134 1.127 1.868.563C4.84 10.207 5.5 8 7 8c1 0 1.5.5 2 1.5l1.5-1.5C11 7 10 5.5 10 5.172z"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.107.94-1.134 1.127-1.868.563C19.16 10.207 18.5 8 17 8c-1 0-1.5.5-2 1.5l-1.5-1.5C13 7 14 5.5 14 5.172z"/><ellipse cx="12" cy="14" rx="7" ry="6"/></svg>
                            </div>
                            <div><div class="font-hand font-bold text-xs text-[#2B5B35]">Anjing Penjaga</div><div class="text-[10px] text-gray-400">Golden, Choco, Dalmatian</div></div>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3c-1.5 2-2 6-1 9M16 3c1.5 2 2 6 1 9"/><ellipse cx="12" cy="16" rx="6" ry="5"/></svg>
                            </div>
                            <div><div class="font-hand font-bold text-xs text-[#2B5B35]">Kelinci Padang</div><div class="text-[10px] text-gray-400">Putih, Moka, Abu</div></div>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 12-4-5a3 3 0 0 0-4.5 4 4 4 0 0 0 4.5 4l4-3zM12 12l4-5a3 3 0 0 1 4.5 4 4 4 0 0 1-4.5 4l-4-3z"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                            </div>
                            <div><div class="font-hand font-bold text-xs text-[#2B5B35]">Kupu-Kupu</div><div class="text-[10px] text-gray-400">Ungu, Biru, Monarch</div></div>
                        </div>
                        <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12c-2.5 0-4-2-4-4"/><path d="m2 16 4.5-4L2 8"/></svg>
                            </div>
                            <div><div class="font-hand font-bold text-xs text-[#2B5B35]">Ikan Kolam</div><div class="text-[10px] text-gray-400">Koi, Koki, Cupang</div></div>
                        </div>
                        ${DECORATION_CATALOG.slice(0, 3).map(d => `
                            <div class="p-2.5 rounded-xl bg-white border border-[#d2e0cb] flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-[#f0f7ec] flex items-center justify-center text-[#2B5B35]">
                                    ${d.icon}
                                </div>
                                <div><div class="font-hand font-bold text-xs text-[#2B5B35]">${d.name}</div><div class="text-[10px] text-gray-400">Dekorasi Taman</div></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (currentJournalTab === 'album') {
        // Feature 10: Polaroid Photo Album Gallery
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-[#d2e0cb]">
                    <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </span>
                        <div>
                            <h4 class="font-hand font-bold text-base text-[#2B5B35] leading-tight">Album Foto Polaroid</h4>
                            <p class="text-[11px] text-gray-500">Koleksi kenangan indah kebunmu (Maksimal 12 foto tersimpan aman di browser)</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full bg-white border border-[#c5d9b7] font-hand font-bold text-xs text-[#2B5B35]">
                        ${polaroidAlbum.length} / 12 Foto
                    </span>
                </div>

                ${polaroidAlbum.length === 0 ? `
                    <div class="py-12 text-center bg-white/60 rounded-2xl border border-dashed border-[#c5d9b7] flex flex-col items-center justify-center">
                        <div class="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-2">
                            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        </div>
                        <p class="font-hand font-bold text-lg text-[#2B5B35]">Album Foto Polaroid Kosong</p>
                        <p class="text-xs text-gray-500 mt-1 max-w-sm">Abadikan sudut terindah kebunmu menggunakan Mode Kamera Polaroid di bilah alat bawah. Semua fotomu akan tersimpan rapi di sini!</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        ${polaroidAlbum.map(p => `
                            <div class="bg-white p-3 rounded-2xl border-2 border-[#d7e2ce] shadow-xs flex flex-col items-center group transition hover:-translate-y-0.5">
                                <div class="w-full aspect-4/3 bg-[#fdfbf4] rounded-xl overflow-hidden border border-[#e2d9c5] p-1.5 flex items-center justify-center shadow-inner">
                                    <img src="${p.dataUrl}" class="w-full h-full object-cover rounded-lg" alt="${p.title || 'Foto Polaroid'}" />
                                </div>
                                <div class="w-full mt-2.5 flex items-center justify-between text-[11px] text-[#477431] font-bold">
                                    <span class="truncate max-w-[130px] font-hand text-sm">${p.title || 'Foto Kebun'}</span>
                                    <span class="text-gray-400 font-normal">${p.date || ''}</span>
                                </div>
                                <div class="w-full mt-2 pt-2 border-t border-[#f0f4ec] flex gap-2">
                                    <button onclick="downloadAlbumPhoto('${p.id}')" class="flex-1 py-1 px-2 rounded-lg bg-[#2B5B35] hover:bg-[#1f4627] text-white text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs active:scale-95">
                                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        <span>Unduh</span>
                                    </button>
                                    <button onclick="deleteAlbumPhoto('${p.id}')" class="py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold transition flex items-center justify-center" title="Hapus Foto">
                                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    } else {
        // Daily Check-in, Quests & Star Shop Tab
        const todayStr = new Date().toISOString().slice(0, 10);
        const claimedToday = dailyLoginState.lastClaimDate === todayStr;
        generateDailyQuests();

        container.innerHTML = `
            <div class="space-y-5">
                <!-- Top Row: Check-in & Flower Tea -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Card 1: Daily Login & Streak -->
                    <div class="bg-gradient-to-br from-[#fffdf5] to-[#fef3c7] rounded-2xl border-2 border-amber-300 p-4 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    <span>Streak: ${dailyLoginState.streak} Hari</span>
                                </span>
                                <span class="font-hand font-bold text-sm text-amber-900 inline-flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <span>${dailyLoginState.stars || 0} Bintang</span>
                                </span>
                            </div>
                            <h4 class="font-hand font-bold text-lg text-[#2B5B35]">Hadiah Kunjungan Harian</h4>
                            <p class="text-xs text-[#477431] mt-1">
                                Kunjungi kebunmu setiap hari untuk mengumpulkan Bintang Kebun! (Tanpa penalti jika kamu lupa masuk).
                            </p>
                        </div>
                        <button onclick="claimDailyReward()" ${claimedToday ? 'disabled' : ''} class="mt-4 w-full py-2 rounded-full ${claimedToday ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95'} font-bold text-xs sm:text-sm transition inline-flex items-center justify-center gap-1.5">
                            ${claimedToday ? '<svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Sudah Diklaim Hari Ini</span>' : '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg><span>Klaim +2 Bintang Hari Ini</span>'}
                        </button>
                    </div>

                    <!-- Card 2: Tea Crafting for Pets -->
                    <div class="bg-gradient-to-br from-[#f4faee] to-[#dcfce7] rounded-2xl border-2 border-[#86efac] p-4 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                                    <span>Dapur Teh Kebun</span>
                                </span>
                                <span class="text-xs text-emerald-700 font-bold inline-flex items-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-rose-500 fill-rose-500" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                    <span>+18 Kedekatan</span>
                                </span>
                            </div>
                            <h4 class="font-hand font-bold text-lg text-[#2B5B35]">Seduh Teh Kelopak Bunga</h4>
                            <p class="text-xs text-[#477431] mt-1">
                                Racik teh hangat dari aroma bunga di kebunmu dan sajikan untuk meningkatkan kedekatan (Friendship) semua hewan sekaligus!
                            </p>
                        </div>
                        <button onclick="brewAndServeFlowerTea()" class="mt-4 w-full py-2 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 inline-flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                            <span>Seduh & Sajikan Teh Bunga Sekarang</span>
                        </button>
                    </div>
                </div>

                <!-- Feature 3: Daily Quests Section -->
                <div class="bg-white rounded-2xl border-2 border-[#d2e0cb] p-4 shadow-xs">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">🎯</span>
                            <h4 class="font-hand font-bold text-base text-[#2B5B35]">Misi Harian Kebun</h4>
                        </div>
                        <span class="text-[11px] text-gray-400">Berganti otomatis setiap hari</span>
                    </div>

                    <div class="space-y-2.5">
                        ${(dailyLoginState.dailyQuests || []).map((q, idx) => {
                            const percent = Math.min(100, Math.round(((q.current || 0) / q.target) * 100));
                            return `
                                <div class="p-3 rounded-xl bg-[#fdfbf7] border border-[#e2d9c5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <span class="text-base">${q.icon || '🌱'}</span>
                                            <span class="font-hand font-bold text-sm text-[#2B5B35]">${q.title}</span>
                                            <span class="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold inline-flex items-center gap-1">
                                                <span>+${q.reward} ⭐</span>
                                            </span>
                                        </div>
                                        <p class="text-xs text-gray-500 mt-0.5">${q.desc}</p>
                                        <div class="mt-2 flex items-center gap-2">
                                            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div class="h-full bg-emerald-500 rounded-full transition-all" style="width: ${percent}%"></div>
                                            </div>
                                            <span class="text-[10px] font-bold text-[#477431] shrink-0">${q.current || 0} / ${q.target}</span>
                                        </div>
                                    </div>
                                    <div class="shrink-0 w-full sm:w-auto">
                                        ${q.claimed ? `
                                            <button disabled class="w-full sm:w-auto px-3 py-1.5 rounded-full bg-gray-100 border border-gray-300 text-gray-400 text-xs font-bold cursor-not-allowed">
                                                ✓ Diklaim
                                            </button>
                                        ` : q.completed ? `
                                            <button onclick="claimQuestReward(${idx})" class="w-full sm:w-auto px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs active:scale-95 animate-pulse inline-flex items-center justify-center gap-1">
                                                <span>⭐ Klaim Hadiah</span>
                                            </button>
                                        ` : `
                                            <span class="inline-block text-center w-full sm:w-auto px-3 py-1.5 rounded-full bg-[#f4faee] border border-[#c5d9b7] text-[#477431] text-[11px] font-bold">
                                                Berjalan
                                            </span>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Feature 1: Toko Bintang Kebun (Star Shop) -->
                <div class="bg-gradient-to-br from-[#fffdf5] to-[#fef9c3] rounded-2xl border-2 border-amber-300 p-4 shadow-xs">
                    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center text-sm font-bold">⭐</span>
                            <div>
                                <h4 class="font-hand font-bold text-base text-amber-950">Toko Bintang Kebun</h4>
                                <p class="text-[11px] text-amber-800">Tukarkan Bintang Kebunmu dengan dekorasi & aksesoris eksklusif!</p>
                            </div>
                        </div>
                        <div class="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 font-hand font-bold text-xs text-amber-900 inline-flex items-center gap-1">
                            <span>Saldo:</span>
                            <span class="text-sm text-amber-700">${dailyLoginState.stars || 0} ⭐</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        ${STAR_SHOP_CATALOG.map(item => {
                            const isOwned = dailyLoginState.unlockedStarItems && dailyLoginState.unlockedStarItems.includes(item.id);
                            const canAfford = (dailyLoginState.stars || 0) >= item.cost;
                            return `
                                <div class="bg-white rounded-xl border border-amber-200 p-3 flex flex-col justify-between shadow-xs">
                                    <div>
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                                                ${item.icon}
                                            </div>
                                            <span class="px-2 py-0.5 rounded-full ${isOwned ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'} text-[10px] font-bold">
                                                ${isOwned ? '✓ Dimiliki' : `${item.cost} ⭐`}
                                            </span>
                                        </div>
                                        <h5 class="font-hand font-bold text-sm text-[#2B5B35] leading-tight">${item.name}</h5>
                                        <p class="text-[11px] text-gray-500 mt-1 leading-snug">${item.desc}</p>
                                    </div>
                                    <div class="mt-3">
                                        ${isOwned ? `
                                            <button disabled class="w-full py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
                                                Sudah Dimiliki
                                            </button>
                                        ` : `
                                            <button onclick="buyStarShopItem('${item.id}')" ${canAfford ? '' : 'disabled'} class="w-full py-1.5 rounded-lg ${canAfford ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} text-xs font-bold transition flex items-center justify-center gap-1">
                                                <span>⭐ Tukar ${item.cost} Bintang</span>
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}


// ============================================================================
// 5. MODE ASMR / AMBIENCE FOCUS + POMODORO TIMER & SUARA KONTEKSTUAL
// ============================================================================
var isAsmrFocusMode = false;
var pomodoroFocusDurationMins = 25;
var pomodoroSecondsLeft = 25 * 60;
var pomodoroIsRunning = false;
var pomodoroMode = 'focus'; // 'focus' | 'break' (5m)
var pomodoroIntervalId = null;
var natureAmbienceEnabled = true;
var ambientBirdTimer = 0;

function setPomodoroDuration(mins) {
    if (typeof mins !== 'number' || mins <= 0) return;
    pomodoroFocusDurationMins = mins;
    if (pomodoroMode === 'focus' && !pomodoroIsRunning) {
        pomodoroSecondsLeft = mins * 60;
    }
    updatePomodoroUI();
}

function toggleAsmrFocusMode() {
    isAsmrFocusMode = !isAsmrFocusMode;
    const bar = document.getElementById('asmrFocusBar');
    const uiSelectors = [
        'header', 
        '#soundWidgetContainer', 
        '.sidebar-launchers', 
        'aside', 
        '#bottomDockNav', 
        'nav', 
        '#animalFollowBanner', 
        '#flowerCountBadgeContainer',
        '#exclusiveSpawnerQuickContainer'
    ];

    uiSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            if (isAsmrFocusMode) {
                el.style.display = 'none';
                el.style.pointerEvents = 'none';
            } else {
                el.style.display = '';
                el.style.pointerEvents = '';
            }
        });
    });

    if (bar) {
        if (isAsmrFocusMode) {
            bar.classList.remove('hidden');
            bar.classList.add('flex');
            updatePomodoroUI();
        } else {
            bar.classList.add('hidden');
            bar.classList.remove('flex');
        }
    }
}

function togglePomodoroTimer() {
    pomodoroIsRunning = !pomodoroIsRunning;
    if (pomodoroIsRunning) {
        if (!pomodoroIntervalId) {
            pomodoroIntervalId = setInterval(() => {
                if (!pomodoroIsRunning) return;
                pomodoroSecondsLeft--;
                if (pomodoroSecondsLeft <= 0) {
                    if (pomodoroMode === 'focus') {
                        pomodoroMode = 'break';
                        pomodoroSecondsLeft = 5 * 60;
                        if (typeof playChimeSound === 'function') playChimeSound();
                        if (typeof showGardenNotice === 'function') {
                            showGardenNotice(`Sesi Fokus ${pomodoroFocusDurationMins} menit selesai! Saatnya istirahat sejenak.`);
                        }
                    } else {
                        pomodoroMode = 'focus';
                        pomodoroSecondsLeft = pomodoroFocusDurationMins * 60;
                        if (typeof playChimeSound === 'function') playChimeSound();
                    }
                }
                updatePomodoroUI();
            }, 1000);
        }
    }
    updatePomodoroUI();
}

function resetPomodoroTimer() {
    pomodoroIsRunning = false;
    pomodoroMode = 'focus';
    pomodoroSecondsLeft = pomodoroFocusDurationMins * 60;
    updatePomodoroUI();
}

function updatePomodoroUI() {
    const timeEl = document.getElementById('pomodoroTimeText');
    const btnEl = document.getElementById('pomodoroToggleBtn');
    const modeEl = document.getElementById('pomodoroModeBadge');

    const mins = String(Math.floor(pomodoroSecondsLeft / 60)).padStart(2, '0');
    const secs = String(pomodoroSecondsLeft % 60).padStart(2, '0');

    if (timeEl) timeEl.textContent = `${mins}:${secs}`;
    
    if (btnEl) {
        if (pomodoroIsRunning) {
            btnEl.innerHTML = `
                <svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <span>Jeda</span>
            `;
        } else {
            btnEl.innerHTML = `
                <svg class="w-3.5 h-3.5 inline" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Mulai</span>
            `;
        }
    }

    if (modeEl) {
        if (pomodoroMode === 'focus') {
            modeEl.className = 'px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 shadow-xs shrink-0';
            modeEl.title = `Fokus (${pomodoroFocusDurationMins}m)`;
            modeEl.innerHTML = `
                <svg class="w-3.5 h-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <circle cx="12" cy="12" r="9"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="hidden sm:inline">Fokus (${pomodoroFocusDurationMins}m)</span>
            `;
        } else {
            modeEl.className = 'px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 shadow-xs shrink-0';
            modeEl.title = 'Istirahat (5m)';
            modeEl.innerHTML = `
                <svg class="w-3.5 h-3.5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                    <line x1="6" y1="2" x2="6" y2="4"/>
                    <line x1="10" y1="2" x2="10" y2="4"/>
                    <line x1="14" y1="2" x2="14" y2="4"/>
                </svg>
                <span class="hidden sm:inline">Istirahat (5m)</span>
            `;
        }
    }

    // Update active highlight on duration preset buttons
    [15, 25, 45, 60].forEach(m => {
        const durBtn = document.getElementById(`pomodoroDurBtn-${m}`);
        if (durBtn) {
            if (m === pomodoroFocusDurationMins) {
                durBtn.className = 'px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#2B5B35] text-white shadow-xs transition';
            } else {
                durBtn.className = 'px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-white/70 hover:bg-emerald-50 text-emerald-900 border border-emerald-200 transition';
            }
        }
    });
}

// Suara Kontekstual Alam (Kicau burung lembut di siang hari, jangkrik syahdu di malam hari)
function updateContextualNatureAmbience(dt) {
    if (!natureAmbienceEnabled) return;
    if (typeof isMusicMuted !== 'undefined' && isMusicMuted) return;

    ambientBirdTimer += dt;
    if (ambientBirdTimer < 14) return;
    ambientBirdTimer = 0;

    if (Math.random() > 0.45) return;

    try {
        if (typeof audioCtx === 'undefined' || !audioCtx || audioCtx.state !== 'running') return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (typeof isNightMode !== 'undefined' && isNightMode) {
            // Soft night cricket chirp
            osc.type = 'sine';
            osc.frequency.setValueAtTime(4200, now);
            osc.frequency.setValueAtTime(4350, now + 0.06);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.015, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.14);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } else {
            // Gentle morning bird tweet
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1950, now);
            osc.frequency.exponentialRampToValueAtTime(2650, now + 0.09);
            osc.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.022, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.20);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.21);
        }
    } catch (e) {}
}

if (typeof window !== 'undefined') {
    window.SEASON_DEFINITIONS = SEASON_DEFINITIONS;
    window.setSeason = setSeason;
    window.cycleSeason = cycleSeason;
    window.updateAndDrawSeasonalEffects = updateAndDrawSeasonalEffects;

    window.DECORATION_CATALOG = DECORATION_CATALOG;
    window.openDecorModal = openDecorModal;
    window.closeDecorModal = closeDecorModal;
    window.renderDecorModalCatalog = renderDecorModalCatalog;
    window.startPlacingDecoration = startPlacingDecoration;
    window.cancelPlacingDecoration = cancelPlacingDecoration;
    window.spawnDecoration = spawnDecoration;
    window.removeDecorationById = removeDecorationById;
    window.findDecorationAt = findDecorationAt;
    window.checkDecorationsSurvival = checkDecorationsSurvival;
    window.drawDecorationInstance = drawDecorationInstance;
    window.selectedDecoration = selectedDecoration;
    window.getDecorationCollisionFootprint = getDecorationCollisionFootprint;
    window.isPointBlockedByDecoration = isPointBlockedByDecoration;
    window.getBridgeAtPoint = getBridgeAtPoint;
    window.getBridgeDeckElevation = getBridgeDeckElevation;
    window.getBridgeCrossingWaypoints = getBridgeCrossingWaypoints;
    window.resolveAnimalDecorationCollisions = resolveAnimalDecorationCollisions;

    window.ANIMAL_PERSONALITIES = ANIMAL_PERSONALITIES;
    window.ANIMAL_ACCESSORIES = ANIMAL_ACCESSORIES;
    window.ensureAnimalRpgProps = ensureAnimalRpgProps;
    window.getAnimalPersonalityInfo = getAnimalPersonalityInfo;
    window.getAnimalFriendshipTier = getAnimalFriendshipTier;
    window.boostAnimalFriendship = boostAnimalFriendship;
    window.cycleAnimalAccessory = cycleAnimalAccessory;
    window.drawAnimalAccessory = drawAnimalAccessory;
    window.updateAnimalSocialInteractions = updateAnimalSocialInteractions;
    window.brewAndServeFlowerTea = brewAndServeFlowerTea;

    window.loadJournalFromStorage = loadJournalFromStorage;
    window.openJournalModal = openJournalModal;
    window.closeJournalModal = closeJournalModal;
    window.switchJournalTab = switchJournalTab;
    window.addDiaryEntry = addDiaryEntry;
    window.deleteDiaryEntry = deleteDiaryEntry;
    window.claimDailyReward = claimDailyReward;
    window.renderJournalModalContent = renderJournalModalContent;
    window.incrementQuestProgress = incrementQuestProgress;
    window.claimQuestReward = claimQuestReward;
    window.buyStarShopItem = buyStarShopItem;
    window.awardStars = awardStars;
    window.downloadAlbumPhoto = downloadAlbumPhoto;
    window.deleteAlbumPhoto = deleteAlbumPhoto;
    window.polaroidAlbum = polaroidAlbum;
    window.STAR_SHOP_CATALOG = STAR_SHOP_CATALOG;
    window.QUEST_POOL = QUEST_POOL;
    window.dailyLoginState = dailyLoginState;

    window.toggleAsmrFocusMode = toggleAsmrFocusMode;
    window.setPomodoroDuration = setPomodoroDuration;
    window.togglePomodoroTimer = togglePomodoroTimer;
    window.resetPomodoroTimer = resetPomodoroTimer;
    window.updateContextualNatureAmbience = updateContextualNatureAmbience;
}

