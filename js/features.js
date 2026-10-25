/********************************************************************
 * FELLA'S GARDEN - COZY SANDBOX FEATURES (js/features.js)
 * 1. Pertumbuhan Tanaman Bertahap (Biji -> Tunas -> Kuncup -> Mekar)
 * 2. Cuaca Dinamis Otomatis & Pelangi Langka (☀️ 🍃 🌦️ 🌈)
 * 3. Sistem Prestasi / Achievement (dengan Toast & Modal Lengkap)
 * 4. Mode Fotografi / Kamera Polaroid Estetik (Filter & Bingkai)
 ********************************************************************/

// ============================================================================
// 1. SISTEM PRESTASI / ACHIEVEMENTS & STATISTIK PEMAIN
// ============================================================================
const ACHIEVEMENTS_STORAGE_KEY = 'fella_garden_achievements_v1';

const ACHIEVEMENT_DEFINITIONS = [
    {
        id: 'first_plant',
        title: 'Tunas Pertama',
        desc: 'Tanam bunga pertamamu di kebun',
        icon: '<svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12"/></svg>',
        statKey: 'flowersPlanted',
        target: 1
    },
    {
        id: 'flower_lover',
        title: 'Pecinta Bunga',
        desc: 'Tanam 50 bunga di kebunmu',
        icon: '<svg class="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 10V2M12 2C8 6 6 8 6 12a6 6 0 0 0 12 0c0-4-2-6-6-10z"/><path d="M12 22v-6"/></svg>',
        statKey: 'flowersPlanted',
        target: 50
    },
    {
        id: 'bloom_master',
        title: 'Keajaiban Tumbuh',
        desc: 'Rawat 5 bunga dari biji hingga mekar penuh',
        icon: '<svg class="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
        statKey: 'flowersBloomed',
        target: 5
    },
    {
        id: 'best_friend',
        title: 'Sahabat Sejati',
        desc: 'Elus dan sayangi hewan di kebun 20 kali',
        icon: '<svg class="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05L6.5 17a4.5 4.5 0 0 1 2.5-7Z"/></svg>',
        statKey: 'animalsPetted',
        target: 20
    },
    {
        id: 'rainbow_hunter',
        title: 'Pemburu Pelangi',
        desc: 'Saksikan pelangi indah muncul setelah hujan',
        icon: '<svg class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17a10 10 0 0 0-20 0M6 17a6 6 0 0 1 12 0M10 17a2 2 0 0 1 4 0"/></svg>',
        statKey: 'rainbowsSeen',
        target: 1
    },
    {
        id: 'night_watcher',
        title: 'Pengamat Malam',
        desc: 'Nikmati suasana kebun di malam hari bersama kunang-kunang',
        icon: '<svg class="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
        statKey: 'nightsVisited',
        target: 1
    },
    {
        id: 'true_artist',
        title: 'Seniman Sejati',
        desc: 'Gambar atau simpan 3 kreasi bunga/hewan di Studio',
        icon: '<svg class="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
        statKey: 'customCreations',
        target: 3
    },
    {
        id: 'fish_keeper',
        title: 'Pemancing Handal',
        desc: 'Pelihara 3 ikan berenang di kolam air kebunmu',
        icon: '<svg class="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12c-2.5 0-4-2-4-4"/><path d="m2 16 4.5-4L2 8"/></svg>',
        statKey: 'maxFishInPond',
        target: 3
    },
    {
        id: 'aesthetic_photographer',
        title: 'Fotografer Estetik',
        desc: 'Abadikan momen kebun di Mode Kamera Polaroid',
        icon: '<svg class="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
        statKey: 'photosTaken',
        target: 1
    },
    {
        id: 'perfect_garden',
        title: 'Taman Sempurna',
        desc: 'Miliki minimal 10 bunga yang semuanya segar 100% bersamaan',
        icon: '<svg class="w-6 h-6 text-amber-500 fill-amber-500" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        statKey: 'perfectGardenReached',
        target: 1
    }
];

var playerStats = {
    flowersPlanted: 0,
    flowersBloomed: 0,
    animalsPetted: 0,
    rainbowsSeen: 0,
    nightsVisited: 0,
    customCreations: 0,
    maxFishInPond: 0,
    photosTaken: 0,
    perfectGardenReached: 0
};

var unlockedAchievements = {}; // { [id]: { unlockedAt: '24 Okt' } }
var toastQueue = [];
var isShowingToast = false;

function loadAchievementsFromStorage() {
    try {
        const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.stats && typeof parsed.stats === 'object') {
                for (const [k, v] of Object.entries(parsed.stats)) {
                    if (typeof v === 'number') {
                        playerStats[k] = Math.max(playerStats[k] || 0, v);
                    }
                }
            }
            if (parsed.unlocked && typeof parsed.unlocked === 'object') {
                unlockedAchievements = { ...unlockedAchievements, ...parsed.unlocked };
            }
        }
    } catch (e) {
        console.warn('Failed to load achievements:', e);
    }
    if (typeof window !== 'undefined') {
        window.playerStats = playerStats;
        window.unlockedAchievements = unlockedAchievements;
    }
    updateAchievementsBadge();
}

// Load immediately on script initialization
loadAchievementsFromStorage();

function saveAchievementsToStorage() {
    try {
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify({
            stats: playerStats,
            unlocked: unlockedAchievements
        }));
    } catch (e) {}

    if (typeof window !== 'undefined') {
        window.playerStats = playerStats;
        window.unlockedAchievements = unlockedAchievements;
    }
}

function syncAchievementsFromWorld() {
    let changed = false;

    // 1. Flowers Planted and Bloomed
    if (typeof flowers !== 'undefined' && Array.isArray(flowers)) {
        if (flowers.length > (playerStats.flowersPlanted || 0)) {
            playerStats.flowersPlanted = flowers.length;
            changed = true;
        }
        const bloomed = flowers.filter(f => !f.growthProgress || f.growthProgress >= 1.0).length;
        if (bloomed > (playerStats.flowersBloomed || 0)) {
            playerStats.flowersBloomed = bloomed;
            changed = true;
        }
        if (flowers.length >= 10 && flowers.every(f => (f.hydration || 0) >= 95)) {
            if ((playerStats.perfectGardenReached || 0) < 1) {
                playerStats.perfectGardenReached = 1;
                changed = true;
            }
        }
    }

    // 2. Animals & Fish
    if (typeof animals !== 'undefined' && Array.isArray(animals)) {
        const fishCount = animals.filter(a => a.type === 'fish' || a.habitat === 'water').length;
        if (fishCount > (playerStats.maxFishInPond || 0)) {
            playerStats.maxFishInPond = fishCount;
            changed = true;
        }
    }

    // 3. Custom Creations (from Gallery storage in localStorage)
    try {
        const rawF = localStorage.getItem('fella_custom_flowers');
        const rawA = localStorage.getItem('fella_custom_animals');
        const fCount = rawF ? JSON.parse(rawF).length : 0;
        const aCount = rawA ? JSON.parse(rawA).length : 0;
        const totalCreations = fCount + aCount;
        if (totalCreations > (playerStats.customCreations || 0)) {
            playerStats.customCreations = totalCreations;
            changed = true;
        }
    } catch (e) {}

    // 4. Night visit
    if (typeof isNightMode !== 'undefined' && isNightMode) {
        if ((playerStats.nightsVisited || 0) < 1) {
            playerStats.nightsVisited = 1;
            changed = true;
        }
    }

    checkAllAchievements();
    if (changed) {
        saveAchievementsToStorage();
    }
    updateAchievementsBadge();
}

function incrementStat(statKey, amount = 1) {
    if (typeof playerStats[statKey] !== 'number') {
        playerStats[statKey] = 0;
    }
    playerStats[statKey] += amount;
    saveAchievementsToStorage();
    checkAllAchievements();
}

function setStatMax(statKey, val) {
    if (typeof playerStats[statKey] !== 'number') {
        playerStats[statKey] = 0;
    }
    if (val > playerStats[statKey]) {
        playerStats[statKey] = val;
        saveAchievementsToStorage();
        checkAllAchievements();
    }
}

function checkAllAchievements() {
    // Check contextual garden states dynamically
    if (typeof animals !== 'undefined' && Array.isArray(animals)) {
        const fishCount = animals.filter(a => a.type === 'fish' || a.habitat === 'water').length;
        if (fishCount > playerStats.maxFishInPond) {
            playerStats.maxFishInPond = fishCount;
        }
    }
    if (typeof flowers !== 'undefined' && Array.isArray(flowers)) {
        if (flowers.length > playerStats.flowersPlanted) {
            playerStats.flowersPlanted = flowers.length;
        }
        const bloomed = flowers.filter(f => !f.growthProgress || f.growthProgress >= 1.0).length;
        if (bloomed > playerStats.flowersBloomed) {
            playerStats.flowersBloomed = bloomed;
        }
        if (flowers.length >= 10 && flowers.every(f => (f.hydration || 0) >= 95)) {
            playerStats.perfectGardenReached = Math.max(playerStats.perfectGardenReached || 0, 1);
        }
    }
    if (typeof isNightMode !== 'undefined' && isNightMode) {
        playerStats.nightsVisited = Math.max(playerStats.nightsVisited || 0, 1);
    }

    let newlyUnlocked = false;
    const nowStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    for (const ach of ACHIEVEMENT_DEFINITIONS) {
        if (!unlockedAchievements[ach.id]) {
            const currentVal = playerStats[ach.statKey] || 0;
            if (currentVal >= ach.target) {
                unlockedAchievements[ach.id] = {
                    unlockedAt: nowStr
                };
                newlyUnlocked = true;
                queueAchievementToast(ach);
            }
        }
    }

    if (newlyUnlocked) {
        saveAchievementsToStorage();
        updateAchievementsBadge();
        const modal = document.getElementById('achievementModal');
        if (modal && !modal.classList.contains('hidden')) {
            renderAchievementsModalContent();
        }
    }
}

function updateAchievementsBadge() {
    const badge = document.getElementById('achievementsCountBadge');
    const unlockedCount = Object.keys(unlockedAchievements).length;
    const totalCount = ACHIEVEMENT_DEFINITIONS.length;
    if (badge) {
        badge.textContent = `${unlockedCount}/${totalCount}`;
    }
}

function queueAchievementToast(ach) {
    toastQueue.push(ach);
    if (!isShowingToast) {
        processNextAchievementToast();
    }
}

function processNextAchievementToast() {
    if (toastQueue.length === 0) {
        isShowingToast = false;
        return;
    }
    isShowingToast = true;
    const ach = toastQueue.shift();

    if (typeof playChimeSound === 'function') {
        playChimeSound();
    }

    const toastEl = document.getElementById('achievementToast');
    const iconEl = document.getElementById('achievementToastIcon');
    const titleEl = document.getElementById('achievementToastTitle');
    const descEl = document.getElementById('achievementToastDesc');

    if (!toastEl) {
        isShowingToast = false;
        return;
    }

    if (iconEl) iconEl.innerHTML = ach.icon;
    if (titleEl) titleEl.textContent = ach.title;
    if (descEl) descEl.textContent = ach.desc;

    toastEl.classList.remove('hidden', 'opacity-0', '-translate-y-6');
    toastEl.classList.add('flex', 'opacity-100', 'translate-y-0');

    setTimeout(() => {
        toastEl.classList.remove('opacity-100', 'translate-y-0');
        toastEl.classList.add('opacity-0', '-translate-y-6');
        setTimeout(() => {
            toastEl.classList.add('hidden');
            toastEl.classList.remove('flex');
            processNextAchievementToast();
        }, 350);
    }, 4200);
}

function openAchievementModal() {
    if (typeof syncAchievementsFromWorld === 'function') {
        syncAchievementsFromWorld();
    }
    checkAllAchievements();
    renderAchievementsModalContent();
    const modal = document.getElementById('achievementModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAchievementModal() {
    const modal = document.getElementById('achievementModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function renderAchievementsModalContent() {
    const container = document.getElementById('achievementsListContainer');
    const progressText = document.getElementById('achievementsProgressSummary');
    const progressBar = document.getElementById('achievementsProgressBarFill');
    const statsSummary = document.getElementById('achievementsStatsSummary');

    if (!container) return;

    const unlockedCount = Object.keys(unlockedAchievements).length;
    const totalCount = ACHIEVEMENT_DEFINITIONS.length;
    const pct = Math.round((unlockedCount / totalCount) * 100);

    if (progressText) {
        progressText.textContent = `${unlockedCount} dari ${totalCount} Prestasi Terbuka (${pct}%)`;
    }
    if (progressBar) {
        progressBar.style.width = `${pct}%`;
    }
    if (statsSummary) {
        statsSummary.innerHTML = `
            <div class="bg-white/80 rounded-xl px-3 py-2 border border-[#d7e2ce] flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12"/></svg>
                </div>
                <div>
                    <div class="text-[10px] text-gray-500">Bunga Ditanam</div>
                    <div class="font-hand font-bold text-sm text-[#2B5B35]">${playerStats.flowersPlanted || 0}</div>
                </div>
            </div>
            <div class="bg-white/80 rounded-xl px-3 py-2 border border-[#d7e2ce] flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>
                </div>
                <div>
                    <div class="text-[10px] text-gray-500">Mekar dari Biji</div>
                    <div class="font-hand font-bold text-sm text-[#2B5B35]">${playerStats.flowersBloomed || 0}</div>
                </div>
            </div>
            <div class="bg-white/80 rounded-xl px-3 py-2 border border-[#d7e2ce] flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05L6.5 17a4.5 4.5 0 0 1 2.5-7Z"/></svg>
                </div>
                <div>
                    <div class="text-[10px] text-gray-500">Hewan Disayang</div>
                    <div class="font-hand font-bold text-sm text-[#2B5B35]">${playerStats.animalsPetted || 0}x</div>
                </div>
            </div>
            <div class="bg-white/80 rounded-xl px-3 py-2 border border-[#d7e2ce] flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17a10 10 0 0 0-20 0M6 17a6 6 0 0 1 12 0M10 17a2 2 0 0 1 4 0"/></svg>
                </div>
                <div>
                    <div class="text-[10px] text-gray-500">Pelangi Dilihat</div>
                    <div class="font-hand font-bold text-sm text-[#2B5B35]">${playerStats.rainbowsSeen || 0}x</div>
                </div>
            </div>
        `;
    }

    container.innerHTML = ACHIEVEMENT_DEFINITIONS.map(ach => {
        const isUnlocked = !!unlockedAchievements[ach.id];
        const unlockedData = unlockedAchievements[ach.id];
        const curVal = Math.min(ach.target, playerStats[ach.statKey] || 0);
        const itemPct = Math.round((curVal / ach.target) * 100);

        return `
            <div class="rounded-2xl p-3 sm:p-3.5 border-2 transition flex items-center gap-3 ${
                isUnlocked
                    ? 'bg-gradient-to-r from-[#fffdf5] to-[#f4faee] border-[#7DB852] shadow-sm'
                    : 'bg-white/60 border-[#e2e8dd] opacity-80'
            }">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                        ? 'bg-amber-100/90 border-amber-300 shadow-xs'
                        : 'bg-gray-100 border-gray-200 grayscale'
                }">
                    ${ach.icon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 min-w-0">
                        <h4 class="font-hand font-bold text-base sm:text-lg text-[#2B5B35] truncate min-w-0 flex-1" title="${ach.title}">
                            ${ach.title}
                        </h4>
                        <div class="shrink-0 ml-1">
                            ${isUnlocked ? `
                                <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-sans font-bold inline-flex items-center gap-1 shadow-2xs whitespace-nowrap">
                                    <svg class="w-3 h-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span>Terbuka</span>
                                </span>
                            ` : `
                                <span class="text-[11px] font-mono font-bold text-gray-400 whitespace-nowrap">
                                    ${curVal}/${ach.target}
                                </span>
                            `}
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-[#477431] mt-0.5 gap-2 min-w-0">
                        <p class="truncate min-w-0 flex-1 text-xs" title="${ach.desc}">${ach.desc}</p>
                    </div>
                    <div class="w-full h-1.5 bg-[#e5efe0] rounded-full overflow-hidden mt-2">
                        <div class="h-full rounded-full transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-r from-[#7DB852] to-[#2B5B35]' : 'bg-[#94b87c]'}" style="width: ${itemPct}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// ============================================================================
// 2. PERTUMBUHAN TANAMAN BERTAHAP (BIJI -> TUNAS -> KUNCUP -> MEKAR)
// ============================================================================

function getFlowerStageInfo(f) {
    const prog = typeof f.growthProgress === 'number' ? f.growthProgress : 1.0;
    if (prog < 0.25) {
        return { stage: 0, label: 'Biji', pct: Math.round(prog * 100) };
    } else if (prog < 0.58) {
        return { stage: 1, label: 'Tunas', pct: Math.round(prog * 100) };
    } else if (prog < 1.0) {
        return { stage: 2, label: 'Kuncup', pct: Math.round(prog * 100) };
    }
    return { stage: 3, label: 'Mekar', pct: 100 };
}

function updateFlowerGrowth(f, dt) {
    if (typeof f.growthProgress !== 'number') {
        f.growthProgress = 1.0;
        return;
    }
    if (f.growthProgress >= 1.0) return;

    // Only grows when hydrated (> 30%)
    if (f.hydration < 30) return;

    // Base growth speed: ~32 seconds from seed to full bloom
    let rate = 0.031;
    if (typeof isRainingShower !== 'undefined' && isRainingShower) {
        rate *= 2.4;
    } else if (dynamicWeather === 'drizzle') {
        rate *= 1.8;
    }

    const prevProg = f.growthProgress;
    f.growthProgress = Math.min(1.0, f.growthProgress + dt * rate);

    // Stage transition mini-bounce
    if ((prevProg < 0.25 && f.growthProgress >= 0.25) ||
        (prevProg < 0.58 && f.growthProgress >= 0.58)) {
        f.waterBounce = 0.75;
        if (typeof particles !== 'undefined') {
            for (let i = 0; i < 4; i++) {
                particles.push({
                    type: 'sparkle',
                    x: f.x + (Math.random() - 0.5) * 20,
                    y: f.y - 12 - Math.random() * 14,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: -0.8 - Math.random() * 1.0,
                    size: 3,
                    color: '#7DB852',
                    alpha: 0.95
                });
            }
        }
    }

    // Reached full bloom! (Feature 12: Efek Khusus Saat Bunga Mekar Penuh)
    if (prevProg < 1.0 && f.growthProgress >= 1.0) {
        f.growthProgress = 1.0;
        f.waterBounce = 1.2;
        if (typeof playChimeSound === 'function') playChimeSound();
        if (typeof particles !== 'undefined') {
            const colors = ['#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
            // 1. Burst of fluttering flower petals
            for (let i = 0; i < 16; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 1.2 + Math.random() * 2.5;
                particles.push({
                    type: 'petal',
                    x: f.x + Math.cos(ang) * 6,
                    y: f.y - 22 + Math.sin(ang) * 6,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 1.2,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 6,
                    size: 3.5 + Math.random() * 3,
                    color: colors[i % colors.length],
                    alpha: 1.0
                });
            }
            // 2. Rising glowing floating text
            particles.push({
                type: 'floatingText',
                x: f.x,
                y: f.y - 32,
                vx: 0,
                vy: -0.65,
                text: '+1 Mekar (+1⭐)',
                color: '#F59E0B',
                alpha: 1.2
            });
        }
        // Award Star
        if (typeof dailyLoginState !== 'undefined') {
            dailyLoginState.stars = (dailyLoginState.stars || 0) + 1;
            if (typeof saveJournalToStorage === 'function') saveJournalToStorage();
        }
        if (typeof incrementQuestProgress === 'function') {
            incrementQuestProgress('plant_flower', 1);
        }
        incrementStat('flowersBloomed', 1);
        if (typeof showGardenNotice === 'function') {
            showGardenNotice('🌸 Bunga mekar sempurna! (+1 ⭐ Bintang Kebun)');
        }
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }
}

function boostFlowerGrowthOnWater(f, amount = 0.14) {
    if (typeof f.growthProgress !== 'number' || f.growthProgress >= 1.0) return;
    const prevProg = f.growthProgress;
    f.growthProgress = Math.min(1.0, f.growthProgress + amount);
    if (prevProg < 1.0 && f.growthProgress >= 1.0) {
        f.waterBounce = 1.2;
        if (typeof playChimeSound === 'function') playChimeSound();
        if (typeof particles !== 'undefined') {
            const colors = ['#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
            for (let i = 0; i < 16; i++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 1.2 + Math.random() * 2.5;
                particles.push({
                    type: 'petal',
                    x: f.x + Math.cos(ang) * 6,
                    y: f.y - 22 + Math.sin(ang) * 6,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 1.2,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 6,
                    size: 3.5 + Math.random() * 3,
                    color: colors[i % colors.length],
                    alpha: 1.0
                });
            }
            particles.push({
                type: 'floatingText',
                x: f.x,
                y: f.y - 32,
                vx: 0,
                vy: -0.65,
                text: '+1 Mekar (+1⭐)',
                color: '#F59E0B',
                alpha: 1.2
            });
        }
        if (typeof dailyLoginState !== 'undefined') {
            dailyLoginState.stars = (dailyLoginState.stars || 0) + 1;
            if (typeof saveJournalToStorage === 'function') saveJournalToStorage();
        }
        if (typeof incrementQuestProgress === 'function') {
            incrementQuestProgress('plant_flower', 1);
        }
        incrementStat('flowersBloomed', 1);
        if (typeof showGardenNotice === 'function') {
            showGardenNotice('🌸 Bunga mekar sempurna! (+1 ⭐ Bintang Kebun)');
        }
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }
}

function drawGrowingFlowerStage(targetCtx, f, now, wiltFactor) {
    const prog = typeof f.growthProgress === 'number' ? f.growthProgress : 1.0;

    // Ground soil mound for growing stages
    targetCtx.fillStyle = '#7A583B';
    targetCtx.strokeStyle = '#3A2814';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.ellipse(0, 2, 11, 4.5, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    if (prog < 0.25) {
        // STAGE 0: BIJI / BENIH (Seed with tiny green tip)
        const subProg = prog / 0.25;
        targetCtx.fillStyle = '#D9A05B';
        targetCtx.beginPath();
        targetCtx.ellipse(0, -1, 5.5, 4.2, -0.15, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        // Tiny green sprout tip emerging
        const tipH = 3 + subProg * 6;
        targetCtx.strokeStyle = '#589A38';
        targetCtx.lineWidth = 2.5;
        targetCtx.lineCap = 'round';
        targetCtx.beginPath();
        targetCtx.moveTo(0, -3);
        targetCtx.quadraticCurveTo(2, -3 - tipH * 0.6, 1, -3 - tipH);
        targetCtx.stroke();
        return;
    }

    if (prog < 0.58) {
        // STAGE 1: TUNAS MUDA (Sprout with two baby cotyledon leaves)
        const subProg = (prog - 0.25) / 0.33;
        const stemH = 12 + subProg * 14;

        // Green stem
        targetCtx.strokeStyle = '#3F7D28';
        targetCtx.lineWidth = 3.2;
        targetCtx.lineCap = 'round';
        targetCtx.beginPath();
        targetCtx.moveTo(0, 1);
        targetCtx.quadraticCurveTo(-2, -stemH * 0.5, 0, -stemH);
        targetCtx.stroke();

        // Left baby leaf
        const leafScale = 0.65 + subProg * 0.45;
        targetCtx.save();
        targetCtx.translate(0, -stemH + 2);
        targetCtx.scale(leafScale, leafScale);

        targetCtx.fillStyle = '#7DB852';
        targetCtx.strokeStyle = '#2B5B35';
        targetCtx.lineWidth = 1.8;
        targetCtx.beginPath();
        targetCtx.ellipse(-6, -2, 6.5, 3.6, -0.45, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();

        // Right baby leaf
        targetCtx.beginPath();
        targetCtx.ellipse(6, -2, 6.5, 3.6, 0.45, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.stroke();
        targetCtx.restore();
        return;
    }

    // STAGE 2: KUNCUP BUNGA (Taller stem + leaves + scaled bud preview of actual flower)
    const subProg = (prog - 0.58) / 0.42;
    const budScale = 0.38 + subProg * 0.48;
    const stemH = 18 + subProg * 10;

    // Stem
    targetCtx.strokeStyle = '#3F7D28';
    targetCtx.lineWidth = 3.5;
    targetCtx.lineCap = 'round';
    targetCtx.beginPath();
    targetCtx.moveTo(0, 1);
    targetCtx.lineTo(0, -stemH);
    targetCtx.stroke();

    // Side leaves
    targetCtx.fillStyle = '#7DB852';
    targetCtx.strokeStyle = '#2B5B35';
    targetCtx.lineWidth = 1.8;
    targetCtx.beginPath();
    targetCtx.ellipse(-7, -stemH * 0.48, 7, 3.5, -0.4, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.beginPath();
    targetCtx.ellipse(7, -stemH * 0.55, 7, 3.5, 0.4, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Draw scaled flower bud at top
    targetCtx.save();
    targetCtx.translate(0, -stemH * 0.35);
    targetCtx.scale(budScale, budScale);
    const drawX = -f.width / 2;
    const drawY = -f.height + 6;
    targetCtx.drawImage(f.imgCanvas, drawX, drawY, f.width, f.height);
    targetCtx.restore();
}


// ============================================================================
// 3. CUACA DINAMIS OTOMATIS & PELANGI LANGKA (☀️ 🍃 🌦️ 🌈)
// ============================================================================

var dynamicWeather = 'clear'; // 'clear' | 'breeze' | 'drizzle' | 'rainbow'
var dynamicWeatherTimer = 65; // seconds until next natural weather transition
var rainbowAlpha = 0;
var thunderstormFlashTimer = 0;
var lightningScreenFlash = 0;

const WEATHER_STATES = {
    clear: { 
        icon: '<svg class="w-4 h-4 text-amber-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>', 
        label: 'Cerah', 
        minDur: 180, 
        maxDur: 260 
    },
    breeze: { 
        icon: '<svg class="w-4 h-4 text-teal-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>', 
        label: 'Semilir', 
        minDur: 90, 
        maxDur: 150 
    },
    drizzle: { 
        icon: '<svg class="w-4 h-4 text-sky-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="17" x2="12" y2="19"/><line x1="16" y1="19" x2="16" y2="21"/></svg>', 
        label: 'Gerimis', 
        minDur: 80, 
        maxDur: 130 
    },
    rainbow: { 
        icon: '<svg class="w-4 h-4 text-indigo-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 17a10 10 0 0 0-20 0M6 17a6 6 0 0 1 12 0M10 17a2 2 0 0 1 4 0"/></svg>', 
        label: 'Pelangi! 🌈', 
        minDur: 75, 
        maxDur: 110 
    },
    thunderstorm: {
        icon: '<svg class="w-4 h-4 text-yellow-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        label: 'Badai Petir ⚡',
        minDur: 60,
        maxDur: 95
    },
    sakura_storm: {
        icon: '<svg class="w-4 h-4 text-pink-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2a5 5 0 0 1 5 5c0 4-5 8-5 8s-5-4-5-8a5 5 0 0 1 5-5z"/></svg>',
        label: 'Hujan Sakura 🌸',
        minDur: 75,
        maxDur: 120
    },
    blizzard: {
        icon: '<svg class="w-4 h-4 text-blue-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>',
        label: 'Salju Lebat ❄️',
        minDur: 80,
        maxDur: 125
    },
    heatwave: {
        icon: '<svg class="w-4 h-4 text-orange-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        label: 'Siang Terik ☀️',
        minDur: 90,
        maxDur: 130
    }
};

function triggerAnimalWeatherReactions(newWeather) {
    if (typeof animals === 'undefined' || !Array.isArray(animals) || animals.length === 0) return;
    const dialogs = {
        thunderstorm: [
            'Waa ada petir kilat! Ayo berlari berteduh! ⚡🏠',
            'Suara petirnya menggelegar! Tapi aku berani! ⛈️🐾',
            'Hujan deras sekali! Buluku basah kuyup! 🌧️🐱'
        ],
        drizzle: [
            'Rintik gerimis sejuk sekali... 🌧️🌱',
            'Tanah kebun jadi wangi sehabis gerimis! 💧🐕',
            'Aku suka suara tetesan hujan di atas daun! 🍃🌧️'
        ],
        rainbow: [
            'Lihat ke atas! Ada pelangi indah sekali di langit! 🌈✨',
            'Warna-warni langit yang ajaib! ✨💖',
            'Pelanginya berkilau indah di atas kebun kita! 🌈🐾'
        ],
        sakura_storm: [
            'Kelopak bunga sakura beterbangan di mana-mana! 🌸🍃',
            'Angin sakura ini wangi sekali! 🌸✨',
            'Ayo menari di antara kelopak bunga! 🌸🐱'
        ],
        blizzard: [
            'Salju turun begitu lebat! Dingin tapi seru! ❄️🧣',
            'Semuanya memutih tertutup salju halus! ⛄❄️',
            'Brrr~ Untung aku punya bulu yang hangat! 🐾❄️'
        ],
        heatwave: [
            'Matahari terik sekali hari ini, ayo siram bunga! ☀️💧',
            'Hangatnya siang ini, enak untuk berjemur santai~ ☀️🐱',
            'Jangan lupa minum dan dinginkan diri di kolam! 🌊🐟'
        ],
        clear: [
            'Cuaca cerah yang indah untuk merawat kebun! ☀️🌸',
            'Semangat merawat kebun hari ini! 🌱✨'
        ],
        breeze: [
            'Semilir angin sejuk... Rasanya ingin tidur siang 🍃💤',
            'Dedaunan berbisik ditiup angin sepoi~ 🍃'
        ]
    };

    const pool = dialogs[newWeather] || dialogs.clear;
    const count = Math.min(animals.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...animals].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
        const a = shuffled[i];
        a.bubbleText = pool[Math.floor(Math.random() * pool.length)];
        a.bubbleTimer = 4.5;
    }
}

function setDynamicWeather(newWeather, durationOverride, notify = true) {
    if (!WEATHER_STATES[newWeather]) newWeather = 'clear';
    const oldWeather = dynamicWeather;
    dynamicWeather = newWeather;
    const info = WEATHER_STATES[newWeather];
    dynamicWeatherTimer = durationOverride || (info.minDur + Math.random() * (info.maxDur - info.minDur));

    if (newWeather === 'drizzle' || newWeather === 'thunderstorm') {
        if (typeof playRainSound === 'function' && (typeof isRainingShower === 'undefined' || !isRainingShower)) {
            playRainSound(dynamicWeatherTimer);
        }
        if (notify && typeof showGardenNotice === 'function') {
            if (newWeather === 'thunderstorm') {
                showGardenNotice('⚡ Badai petir & hujan deras menerpa kebun! Hewan-hewan mencari perlindungan.');
            } else {
                showGardenNotice('Awan sejuk berkumpul, gerimis membasahi dan menyegarkan bunga-bunga... 🌧️');
            }
        }
    } else if ((oldWeather === 'drizzle' || oldWeather === 'thunderstorm') && (typeof isRainingShower === 'undefined' || !isRainingShower)) {
        if (typeof stopRainSound === 'function') {
            stopRainSound();
        }
    }

    if (newWeather === 'rainbow') {
        incrementStat('rainbowsSeen', 1);
        if (notify && typeof showGardenNotice === 'function') {
            showGardenNotice('Hujan reda! Pelangi ganda memukau membentang di langit kebun! 🌈✨');
        }
        if (typeof playChimeSound === 'function') {
            playChimeSound();
        }
        if (typeof spawnMysteryEgg === 'function' && Math.random() < 0.7) {
            spawnMysteryEgg();
        }
    } else if (oldWeather === 'thunderstorm' && typeof spawnMysteryEgg === 'function' && Math.random() < 0.5) {
        spawnMysteryEgg();
    } else if (newWeather === 'breeze' && notify && typeof showGardenNotice === 'function') {
        showGardenNotice('Angin sepoi berhembus sejuk membelai dedaunan kebun... 🍃');
    } else if (newWeather === 'sakura_storm' && notify && typeof showGardenNotice === 'function') {
        showGardenNotice('🌸 Angin kencang membawa badai kelopak sakura harum ke kebun!');
    } else if (newWeather === 'blizzard' && notify && typeof showGardenNotice === 'function') {
        showGardenNotice('❄️ Salju lebat turun tiba-tiba menyelimuti kebun dengan kristal es!');
    } else if (newWeather === 'heatwave' && notify && typeof showGardenNotice === 'function') {
        showGardenNotice('☀️ Siang terik menyengat! Pastikan bungamu tidak kehausan.');
    }

    if (typeof adaptAudioAtmosphere === 'function') {
        const curNight = (typeof isNightTime === 'boolean') ? isNightTime : false;
        const curSeason = (typeof currentSeason === 'string') ? currentSeason : 'spring';
        adaptAudioAtmosphere(curNight, newWeather, curSeason);
    }

    triggerAnimalWeatherReactions(newWeather);
    updateWeatherBadgeUI();
}

function triggerRainbowAfterRain() {
    setDynamicWeather('rainbow', 65, true);
}

function cycleDynamicWeather() {
    const order = ['clear', 'breeze', 'drizzle', 'thunderstorm', 'rainbow', 'sakura_storm', 'blizzard', 'heatwave'];
    const idx = order.indexOf(dynamicWeather);
    const next = order[(idx + 1) % order.length];
    setDynamicWeather(next, null, true);
}

function updateWeatherBadgeUI() {
    const btn = document.getElementById('weatherStatusBtn');
    if (!btn) return;
    const info = WEATHER_STATES[dynamicWeather] || WEATHER_STATES.clear;
    btn.innerHTML = `<span>${info.icon}</span><span class="font-bold">${info.label}</span>`;
}

// ============================================================================
// 4. SIKLUS ATMOSFER OTOMATIS: Hari (Siang/Malam) & 4 Musim Berganti Alami
// ============================================================================
var DAY_DURATION = 270;    // 4.5 menit siang
var NIGHT_DURATION = 150;  // 2.5 menit malam
var dayCycleTimer = DAY_DURATION;

var SEASON_DURATION = 720; // 12 menit per musim (setara ~2 siklus siang-malam penuh)
var seasonCycleTimer = SEASON_DURATION;

function resetDayCycleTimer() {
    dayCycleTimer = (typeof isNightMode !== 'undefined' && isNightMode) ? NIGHT_DURATION : DAY_DURATION;
}

function resetSeasonCycleTimer() {
    seasonCycleTimer = SEASON_DURATION;
}

function updateAtmosphereSimulation(dt) {
    // 1. Siklus Otomatis Siang / Malam
    dayCycleTimer -= dt;
    if (dayCycleTimer <= 0) {
        if (typeof isNightMode !== 'undefined' && isNightMode) {
            // Malam -> Siang!
            dayCycleTimer = DAY_DURATION;
            if (typeof setDayNightMode === 'function') {
                setDayNightMode(false, false);
            }
        } else {
            // Siang -> Malam!
            dayCycleTimer = NIGHT_DURATION;
            if (typeof setDayNightMode === 'function') {
                setDayNightMode(true, false);
            }
        }
    }

    // 2. Siklus Otomatis 4 Musim (Semi -> Panas -> Gugur -> Salju)
    seasonCycleTimer -= dt;
    if (seasonCycleTimer <= 0) {
        seasonCycleTimer = SEASON_DURATION;
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const curSeason = (typeof currentSeason !== 'undefined') ? currentSeason : 'spring';
        const curIdx = seasons.indexOf(curSeason);
        const nextSeason = seasons[(curIdx + 1) % seasons.length];
        if (typeof setSeason === 'function') {
            setSeason(nextSeason, false);
        }
    }
}

function updateDynamicWeather(dt, now) {
    // Smooth rainbow fade in/out
    if (dynamicWeather === 'rainbow') {
        rainbowAlpha = Math.min(1, rainbowAlpha + dt * 0.6);
    } else {
        rainbowAlpha = Math.max(0, rainbowAlpha - dt * 0.5);
    }

    // Natural weather timer countdown
    dynamicWeatherTimer -= dt;
    if (dynamicWeatherTimer <= 0) {
        if (dynamicWeather === 'drizzle') {
            const next = Math.random() < 0.76 ? 'rainbow' : 'clear';
            setDynamicWeather(next, null, true);
        } else if (dynamicWeather === 'thunderstorm') {
            // Thunderstorm ends: spectacular double rainbow and high chance of mystery egg!
            setDynamicWeather('rainbow', 90, true);
            if (typeof spawnMysteryEgg === 'function' && Math.random() < 0.6) {
                spawnMysteryEgg();
            }
        } else if (dynamicWeather === 'rainbow') {
            if (typeof spawnMysteryEgg === 'function' && Math.random() < 0.45) {
                spawnMysteryEgg();
            }
            setDynamicWeather('clear', null, true);
        } else if (dynamicWeather === 'sakura_storm' || dynamicWeather === 'blizzard' || dynamicWeather === 'heatwave') {
            setDynamicWeather('clear', null, true);
        } else if (dynamicWeather === 'clear') {
            const s = (typeof currentSeason !== 'undefined') ? currentSeason : 'spring';
            const roll = Math.random();
            if (s === 'spring') {
                if (roll < 0.35) setDynamicWeather('breeze', null, true);
                else if (roll < 0.60) setDynamicWeather('drizzle', null, true);
                else if (roll < 0.75) setDynamicWeather('sakura_storm', null, true);
                else if (roll < 0.88) setDynamicWeather('thunderstorm', null, true);
                else setDynamicWeather('clear', null, false);
            } else if (s === 'summer') {
                if (roll < 0.32) setDynamicWeather('breeze', null, true);
                else if (roll < 0.55) setDynamicWeather('drizzle', null, true);
                else if (roll < 0.72) setDynamicWeather('heatwave', null, true);
                else if (roll < 0.86) setDynamicWeather('thunderstorm', null, true);
                else setDynamicWeather('clear', null, false);
            } else if (s === 'autumn') {
                if (roll < 0.45) setDynamicWeather('breeze', null, true);
                else if (roll < 0.75) setDynamicWeather('drizzle', null, true);
                else if (roll < 0.88) setDynamicWeather('thunderstorm', null, true);
                else setDynamicWeather('clear', null, false);
            } else { // winter
                if (roll < 0.35) setDynamicWeather('breeze', null, true);
                else if (roll < 0.68) setDynamicWeather('blizzard', null, true);
                else if (roll < 0.82) setDynamicWeather('drizzle', null, true);
                else setDynamicWeather('clear', null, false);
            }
        } else {
            // breeze -> clear or drizzle
            setDynamicWeather(Math.random() < 0.35 ? 'drizzle' : 'clear', null, true);
        }
    }

    // Weather-specific ambient effects in world coordinates
    if (typeof particles === 'undefined') return;

    const minX = Math.max(0, -panX / zoom - 80);
    const maxX = Math.min(WORLD_W, (-panX + screenW) / zoom + 80);
    const minY = Math.max(0, -panY / zoom - 80);
    const maxY = Math.min(WORLD_H, (-panY + screenH) / zoom + 80);

    if (dynamicWeather === 'breeze') {
        // Floating wind leaves & pink blossom petals
        if (Math.random() < 0.18) {
            const isPetal = Math.random() < 0.45;
            particles.push({
                type: 'leaf',
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                vx: 1.4 + Math.random() * 1.4,
                vy: 0.4 + Math.random() * 0.6,
                size: isPetal ? 3.5 : 4.2,
                color: isPetal ? '#F4A6C1' : '#7DB852',
                alpha: 0.85
            });
        }
    } else if (dynamicWeather === 'drizzle' && !isRainingShower) {
        // Actively hydrate flowers during drizzle (menyirami bunga hingga segar 100%)
        if (typeof flowers !== 'undefined' && flowers.length > 0) {
            let anyHydrated = false;
            for (let i = 0; i < flowers.length; i++) {
                const f = flowers[i];
                if (f.hydration < 100) {
                    f.hydration = Math.min(100, f.hydration + dt * 18.0);
                    anyHydrated = true;
                    if (Math.random() < 0.06) {
                        f.waterBounce = Math.max(f.waterBounce || 0, 0.45);
                        if (typeof particles !== 'undefined' && Math.random() < 0.35) {
                            particles.push({
                                type: 'droplet',
                                x: f.x + (Math.random() - 0.5) * 16,
                                y: f.y - 8 - Math.random() * 10,
                                vx: (Math.random() - 0.5) * 0.8,
                                vy: -0.8 - Math.random() * 0.8,
                                size: 2.5 + Math.random() * 1.5,
                                alpha: 0.85
                            });
                        }
                    }
                }
            }
            if (anyHydrated && typeof updateStatusBadges === 'function') {
                updateStatusBadges();
            }
        }
    } else if (dynamicWeather === 'thunderstorm') {
        // Occasional lightning flash & thunder
        thunderstormFlashTimer -= dt;
        if (thunderstormFlashTimer <= 0) {
            thunderstormFlashTimer = 7 + Math.random() * 8;
            lightningScreenFlash = 0.16;
            if (typeof playThunderSound === 'function') {
                playThunderSound();
            }
        }
        // Rapid flower hydration
        if (typeof flowers !== 'undefined' && flowers.length > 0) {
            for (let i = 0; i < flowers.length; i++) {
                const f = flowers[i];
                if (f.hydration < 100) {
                    f.hydration = Math.min(100, f.hydration + dt * 28.0);
                    f.waterBounce = Math.max(f.waterBounce || 0, 0.6);
                }
            }
        }
    } else if (dynamicWeather === 'sakura_storm') {
        // Swirling cherry blossom petals
        for (let i = 0; i < 2; i++) {
            particles.push({
                type: 'petal',
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                vx: 3.0 + Math.random() * 2.5,
                vy: 0.8 + Math.random() * 1.2,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 5,
                size: 3.8 + Math.random() * 2.5,
                color: Math.random() < 0.5 ? '#F472B6' : '#FBCFE8',
                alpha: 0.95
            });
        }
    } else if (dynamicWeather === 'blizzard') {
        // Soft drifting snow particles
        for (let i = 0; i < 4; i++) {
            particles.push({
                type: 'leaf',
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                vx: 1.5 + Math.random() * 1.5,
                vy: 2.0 + Math.random() * 1.8,
                size: 3.2 + Math.random() * 2.2,
                color: '#FFFFFF',
                alpha: 0.85
            });
        }
    } else if (dynamicWeather === 'heatwave') {
        if (Math.random() < 0.22) {
            particles.push({
                type: 'sparkle',
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.7 - Math.random() * 0.7,
                size: 2.8,
                color: '#FBBF24',
                alpha: 0.8
            });
        }
    } else if (dynamicWeather === 'rainbow') {
        // Shimmering rainbow light sparkles in the air
        if (Math.random() < 0.22) {
            const rainbowColors = ['#FF758F', '#FFB347', '#F7CE68', '#7DB852', '#64B5F6', '#BA68C8'];
            particles.push({
                type: 'sparkle',
                x: minX + Math.random() * (maxX - minX),
                y: minY + Math.random() * (maxY - minY),
                vx: (Math.random() - 0.5) * 0.6,
                vy: -0.4 - Math.random() * 0.5,
                size: 3 + Math.random() * 2.5,
                color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
                alpha: 0.9
            });
        }
    }
}

function drawRainbowInWorld(targetCtx, now) {
    if (rainbowAlpha <= 0.01) return;

    const cx = WORLD_W * 0.5;
    const cy = WORLD_H * 0.52 - 40;

    targetCtx.save();
    targetCtx.lineCap = 'round';

    // Primary Rainbow Arc
    targetCtx.globalAlpha = rainbowAlpha * 0.42;
    const bands = [
        { color: '#FF6B8B', r: 530 },
        { color: '#FFA35C', r: 516 },
        { color: '#FFE066', r: 502 },
        { color: '#7CE08A', r: 488 },
        { color: '#64C2FF', r: 474 },
        { color: '#9D85FF', r: 460 }
    ];
    targetCtx.lineWidth = 15;
    for (const b of bands) {
        targetCtx.strokeStyle = b.color;
        targetCtx.beginPath();
        targetCtx.arc(cx, cy + 120, b.r, Math.PI * 1.12, Math.PI * 1.88);
        targetCtx.stroke();
    }

    // Secondary Outer Arc (Double Rainbow Magic!)
    targetCtx.globalAlpha = rainbowAlpha * 0.18;
    targetCtx.lineWidth = 11;
    const outerBands = [
        { color: '#9D85FF', r: 610 },
        { color: '#64C2FF', r: 600 },
        { color: '#7CE08A', r: 590 },
        { color: '#FFE066', r: 580 },
        { color: '#FFA35C', r: 570 },
        { color: '#FF6B8B', r: 560 }
    ];
    for (const ob of outerBands) {
        targetCtx.strokeStyle = ob.color;
        targetCtx.beginPath();
        targetCtx.arc(cx, cy + 120, ob.r, Math.PI * 1.14, Math.PI * 1.86);
        targetCtx.stroke();
    }

    targetCtx.restore();
}


// ============================================================================
// 4. MODE FOTOGRAFI / KAMERA POLAROID ESTETIK (FILTER & BINGKAI)
// ============================================================================

var currentPhotoFilter = 'normal'; // 'normal' | 'golden' | 'vintage' | 'sakura' | 'twilight'
var currentPhotoFrame = 'polaroid'; // 'polaroid' | 'botanical' | 'sakura_frame' | 'full'
var capturedGardenImageCanvas = null;

function openPhotoStudioModal() {
    if (typeof playClickSound === 'function') playClickSound();

    // Capture clean live garden canvas snapshot immediately
    if (typeof worldCanvas !== 'undefined' && worldCanvas) {
        capturedGardenImageCanvas = document.createElement('canvas');
        capturedGardenImageCanvas.width = worldCanvas.width;
        capturedGardenImageCanvas.height = worldCanvas.height;
        const cctx = capturedGardenImageCanvas.getContext('2d');
        cctx.drawImage(worldCanvas, 0, 0);
    }

    const modal = document.getElementById('photoStudioModal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    updatePhotoStudioButtonsUI();
    renderPhotoStudioPreview();
}

function closePhotoStudioModal() {
    const modal = document.getElementById('photoStudioModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function setPhotoFilter(filterId) {
    currentPhotoFilter = filterId;
    updatePhotoStudioButtonsUI();
    renderPhotoStudioPreview();
}

function setPhotoFrame(frameId) {
    currentPhotoFrame = frameId;
    updatePhotoStudioButtonsUI();
    renderPhotoStudioPreview();
}

function updatePhotoStudioButtonsUI() {
    const filters = ['normal', 'golden', 'vintage', 'sakura', 'twilight'];
    filters.forEach(f => {
        const btn = document.getElementById('photoFilterBtn-' + f);
        if (btn) {
            if (f === currentPhotoFilter) {
                btn.className = 'px-3 py-1.5 rounded-full text-xs font-hand font-bold bg-[#2B5B35] text-white shadow-sm border border-[#2B5B35] transition';
            } else {
                btn.className = 'px-3 py-1.5 rounded-full text-xs font-hand font-bold bg-white hover:bg-[#eef5e6] text-[#2B5B35] border border-[#c5d9b7] transition';
            }
        }
    });

    const frames = ['polaroid', 'botanical', 'sakura_frame', 'full'];
    frames.forEach(fr => {
        const btn = document.getElementById('photoFrameBtn-' + fr);
        if (btn) {
            if (fr === currentPhotoFrame) {
                btn.className = 'px-3 py-1.5 rounded-full text-xs font-hand font-bold bg-[#2B5B35] text-white shadow-sm border border-[#2B5B35] transition';
            } else {
                btn.className = 'px-3 py-1.5 rounded-full text-xs font-hand font-bold bg-white hover:bg-[#eef5e6] text-[#2B5B35] border border-[#c5d9b7] transition';
            }
        }
    });
}

function renderPhotoStudioPreview() {
    const previewCanvas = document.getElementById('photoPreviewCanvas');
    if (!previewCanvas || !capturedGardenImageCanvas) return;

    const captionInput = document.getElementById('photoCaptionInput');
    const captionText = (captionInput && captionInput.value.trim()) ? captionInput.value.trim() : "Sore tenang di kebun kecilku 🌿🌸";
    const gardenTitle = document.getElementById('gardenTitle')?.innerText || "Fella's Garden";
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const photoW = 800;
    const photoH = 560;

    let padTop = 38, padSide = 38, padBottom = 115;
    if (currentPhotoFrame === 'full') {
        padTop = 0; padSide = 0; padBottom = 0;
    } else if (currentPhotoFrame === 'botanical') {
        padTop = 44; padSide = 44; padBottom = 105;
    }

    const totalW = photoW + padSide * 2;
    const totalH = photoH + padTop + padBottom;

    previewCanvas.width = totalW;
    previewCanvas.height = totalH;
    const pctx = previewCanvas.getContext('2d');

    // 1. Draw Frame Background
    if (currentPhotoFrame === 'polaroid') {
        pctx.fillStyle = '#FDFBF4';
        pctx.fillRect(0, 0, totalW, totalH);
        pctx.strokeStyle = '#E2D9C5';
        pctx.lineWidth = 4;
        pctx.strokeRect(2, 2, totalW - 4, totalH - 4);
    } else if (currentPhotoFrame === 'botanical') {
        pctx.fillStyle = '#F4EFE0';
        pctx.fillRect(0, 0, totalW, totalH);
        // Double vintage gold-green border
        pctx.strokeStyle = '#6B8E4E';
        pctx.lineWidth = 3;
        pctx.strokeRect(14, 14, totalW - 28, totalH - 28);
        pctx.strokeStyle = '#C5A869';
        pctx.lineWidth = 1.5;
        pctx.strokeRect(20, 20, totalW - 40, totalH - 40);
    } else if (currentPhotoFrame === 'sakura_frame') {
        const grad = pctx.createLinearGradient(0, 0, totalW, totalH);
        grad.addColorStop(0, '#FFF0F5');
        grad.addColorStop(1, '#FCE4EC');
        pctx.fillStyle = grad;
        pctx.fillRect(0, 0, totalW, totalH);
        pctx.strokeStyle = '#F48FB1';
        pctx.lineWidth = 4;
        pctx.strokeRect(2, 2, totalW - 4, totalH - 4);
    }

    // 2. Crop center-aspect of capturedGardenImageCanvas into photoW x photoH
    const srcW = capturedGardenImageCanvas.width;
    const srcH = capturedGardenImageCanvas.height;
    const targetRatio = photoW / photoH;
    const srcRatio = srcW / srcH;

    let sx = 0, sy = 0, sw = srcW, sh = srcH;
    if (srcRatio > targetRatio) {
        sw = srcH * targetRatio;
        sx = (srcW - sw) / 2;
    } else {
        sh = srcW / targetRatio;
        sy = (srcH - sh) / 2;
    }

    pctx.save();
    // Apply CSS canvas filter if supported
    if (currentPhotoFilter === 'golden') {
        pctx.filter = 'sepia(0.28) saturate(1.35) brightness(1.04) contrast(1.04)';
    } else if (currentPhotoFilter === 'vintage') {
        pctx.filter = 'sepia(0.45) contrast(0.95) brightness(0.98) saturate(0.85)';
    } else if (currentPhotoFilter === 'sakura') {
        pctx.filter = 'saturate(1.2) brightness(1.05) hue-rotate(-8deg)';
    } else if (currentPhotoFilter === 'twilight') {
        pctx.filter = ' brightness(0.92) contrast(1.12) saturate(1.18) hue-rotate(12deg)';
    }

    pctx.drawImage(capturedGardenImageCanvas, sx, sy, sw, sh, padSide, padTop, photoW, photoH);
    pctx.filter = 'none';

    // Color tint overlays for aesthetic filters
    if (currentPhotoFilter === 'golden') {
        const g = pctx.createLinearGradient(padSide, padTop, padSide + photoW, padTop + photoH);
        g.addColorStop(0, 'rgba(255, 190, 90, 0.18)');
        g.addColorStop(1, 'rgba(255, 120, 50, 0.12)');
        pctx.fillStyle = g;
        pctx.fillRect(padSide, padTop, photoW, photoH);
    } else if (currentPhotoFilter === 'vintage') {
        // Soft vignette
        const rad = pctx.createRadialGradient(
            padSide + photoW / 2, padTop + photoH / 2, photoW * 0.25,
            padSide + photoW / 2, padTop + photoH / 2, photoW * 0.65
        );
        rad.addColorStop(0, 'rgba(0,0,0,0)');
        rad.addColorStop(1, 'rgba(65, 45, 25, 0.28)');
        pctx.fillStyle = rad;
        pctx.fillRect(padSide, padTop, photoW, photoH);
    } else if (currentPhotoFilter === 'sakura') {
        pctx.fillStyle = 'rgba(255, 182, 193, 0.15)';
        pctx.fillRect(padSide, padTop, photoW, photoH);
    } else if (currentPhotoFilter === 'twilight') {
        pctx.fillStyle = 'rgba(30, 45, 95, 0.18)';
        pctx.fillRect(padSide, padTop, photoW, photoH);
    }

    // Inner photo border
    if (currentPhotoFrame !== 'full') {
        pctx.strokeStyle = 'rgba(60, 80, 50, 0.18)';
        pctx.lineWidth = 2;
        pctx.strokeRect(padSide, padTop, photoW, photoH);
    }
    pctx.restore();

    // 3. Draw Frame Ornaments & Caption
    if (currentPhotoFrame !== 'full') {
        const centerY = padTop + photoH + padBottom * 0.46;

        // Handwritten caption
        pctx.fillStyle = currentPhotoFrame === 'sakura_frame' ? '#880E4F' : '#2B5B35';
        pctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText(captionText, totalW / 2, centerY);

        // Subtitle: Garden Title & Date
        pctx.fillStyle = currentPhotoFrame === 'sakura_frame' ? '#AD1457' : '#6B8E4E';
        pctx.font = '14px "Plus Jakarta Sans", sans-serif';
        pctx.fillText(`🌿 ${gardenTitle}  •  ${dateStr}`, totalW / 2, centerY + 30);

        if (currentPhotoFrame === 'sakura_frame') {
            pctx.font = '24px sans-serif';
            pctx.fillText('🌸', 34, 38);
            pctx.fillText('🌸', totalW - 34, 38);
            pctx.fillText('🎀', totalW - 42, totalH - 28);
        } else if (currentPhotoFrame === 'botanical') {
            pctx.font = '22px sans-serif';
            pctx.fillText('🌿', 36, 40);
            pctx.fillText('🌿', totalW - 36, 40);
        }
    } else {
        // Subtle corner watermark on Full HD photo
        pctx.fillStyle = 'rgba(253, 251, 242, 0.88)';
        pctx.strokeStyle = '#3a5a40';
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.roundRect(totalW - 235, totalH - 46, 218, 32, 16);
        pctx.fill();
        pctx.stroke();

        pctx.fillStyle = '#2B5B35';
        pctx.font = 'bold 14px "Patrick Hand", cursive, sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText(`🌿 ${gardenTitle} • ${dateStr}`, totalW - 126, totalH - 25);
    }
}

function downloadPolaroidPhoto() {
    const previewCanvas = document.getElementById('photoPreviewCanvas');
    if (!previewCanvas) return;

    renderPhotoStudioPreview();

    const titleText = (document.getElementById('gardenTitle')?.innerText || 'fellas-garden')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
    const fullPng = previewCanvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.download = `${titleText}-polaroid-${Date.now()}.png`;
    link.href = fullPng;
    link.click();

    // Feature 10: Save to Polaroid Album in Journal (compact JPEG format to save storage)
    try {
        const thumbDataUrl = previewCanvas.toDataURL('image/jpeg', 0.82);
        const albumItem = {
            id: 'photo_' + Date.now(),
            dataUrl: thumbDataUrl,
            title: document.getElementById('gardenTitle')?.innerText || "Fella's Garden",
            filter: currentPhotoFilter,
            frame: currentPhotoFrame,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        if (typeof polaroidAlbum !== 'undefined' && Array.isArray(polaroidAlbum)) {
            polaroidAlbum.unshift(albumItem);
            if (polaroidAlbum.length > 12) polaroidAlbum.pop();
            if (typeof savePolaroidAlbumToStorage === 'function') savePolaroidAlbumToStorage();
        }
    } catch (e) {
        console.warn('Failed to save to polaroid album:', e);
    }

    incrementStat('photosTaken', 1);
    if (typeof incrementQuestProgress === 'function') {
        incrementQuestProgress('take_photo', 1);
    }
    if (typeof playChimeSound === 'function') playChimeSound();
    if (typeof showGardenNotice === 'function') {
        showGardenNotice('📸 Foto Polaroid berhasil disimpan & ditambahkan ke Album Jurnal!');
    }
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.playerStats = playerStats;
    window.unlockedAchievements = unlockedAchievements;
    window.loadAchievementsFromStorage = loadAchievementsFromStorage;
    window.saveAchievementsToStorage = saveAchievementsToStorage;
    window.syncAchievementsFromWorld = syncAchievementsFromWorld;
    window.incrementStat = incrementStat;
    window.setStatMax = setStatMax;
    window.checkAllAchievements = checkAllAchievements;
    window.openAchievementModal = openAchievementModal;
    window.closeAchievementModal = closeAchievementModal;

    window.getFlowerStageInfo = getFlowerStageInfo;
    window.updateFlowerGrowth = updateFlowerGrowth;
    window.boostFlowerGrowthOnWater = boostFlowerGrowthOnWater;
    window.drawGrowingFlowerStage = drawGrowingFlowerStage;

    window.WEATHER_STATES = WEATHER_STATES;
    window.triggerAnimalWeatherReactions = triggerAnimalWeatherReactions;
    window.setDynamicWeather = setDynamicWeather;
    window.triggerRainbowAfterRain = triggerRainbowAfterRain;
    window.cycleDynamicWeather = cycleDynamicWeather;
    window.updateDynamicWeather = updateDynamicWeather;
    window.drawRainbowInWorld = drawRainbowInWorld;

    window.updateAtmosphereSimulation = updateAtmosphereSimulation;
    window.resetDayCycleTimer = resetDayCycleTimer;
    window.resetSeasonCycleTimer = resetSeasonCycleTimer;

    window.openPhotoStudioModal = openPhotoStudioModal;
    window.closePhotoStudioModal = closePhotoStudioModal;
    window.setPhotoFilter = setPhotoFilter;
    window.setPhotoFrame = setPhotoFrame;
    window.renderPhotoStudioPreview = renderPhotoStudioPreview;
    window.downloadPolaroidPhoto = downloadPolaroidPhoto;
}

