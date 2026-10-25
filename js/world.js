/********************************************************************
 * FELLA'S GARDEN - MULTI-WORLD STORAGE & MANAGEMENT (js/world.js)
 ********************************************************************/

/********************************************************************
 * 10. MULTI-WORLD STORAGE & MANAGEMENT (INDEXEDDB ENGINE)
 * 100% Client-side: Save World, Create New World, Switch, Export/Import
 ********************************************************************/
const DB_NAME = "FellasGardenDB";
const DB_VERSION = 1;
const STORE_WORLDS = "worlds";
const CURRENT_WORLD_KEY = "fellas_garden_current_world_id";
const WORLDS_REGISTRY_KEY = "fellas_garden_worlds_registry_v1";

var currentWorldId = "world_default";
window.currentWorldId = currentWorldId;
var isWorldLoading = false;
var isWorldReady = false;
window.isWorldLoading = false;
window.isWorldReady = false;
let autoSaveTimer = null;
let dbInstance = null;

function getLocalWorldsRegistry() {
  try {
    const raw = localStorage.getItem(WORLDS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocalWorldsRegistry(worlds) {
  try {
    if (!Array.isArray(worlds)) return;
    const summary = worlds.map((w) => ({
      id: w.id,
      name: w.name || "Kebun Fella",
      lastPlayed: w.lastPlayed || new Date().toISOString(),
      flowerCount: typeof w.flowerCount === "number" ? w.flowerCount : (w.flowers ? w.flowers.length : 0),
    }));
    localStorage.setItem(WORLDS_REGISTRY_KEY, JSON.stringify(summary));
  } catch (e) {}
}

function openGardenDB() {
  return new Promise((resolve) => {
    if (dbInstance) return resolve(dbInstance);
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported on this browser.");
      return resolve(null);
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_WORLDS)) {
        const store = db.createObjectStore(STORE_WORLDS, { keyPath: "id" });
        store.createIndex("lastPlayed", "lastPlayed", { unique: false });
      }
    };
    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    req.onerror = (e) => {
      console.error("IndexedDB open error:", e);
      resolve(null);
    };
  });
}

async function dbGetAllWorlds() {
  const db = await openGardenDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_WORLDS, "readonly");
      const store = tx.objectStore(STORE_WORLDS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort(
          (a, b) => new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0),
        );
        resolve(list);
      };
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

async function dbGetWorld(id) {
  const db = await openGardenDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_WORLDS, "readonly");
      const store = tx.objectStore(STORE_WORLDS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function dbSaveWorld(worldObj) {
  const db = await openGardenDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_WORLDS, "readwrite");
      const store = tx.objectStore(STORE_WORLDS);
      const req = store.put(worldObj);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

async function dbDeleteWorld(id) {
  const db = await openGardenDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_WORLDS, "readwrite");
      const store = tx.objectStore(STORE_WORLDS);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatRelativeTime(isoString) {
  if (!isoString) return "Baru saja";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Baru saja";
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} jam lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch (e) {
    return "Baru saja";
  }
}

function generateWorldThumbnail() {
  try {
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 280;
    thumbCanvas.height = 175;
    const tctx = thumbCanvas.getContext("2d");

    // Warm pastel sky gradient background
    const grad = tctx.createLinearGradient(0, 0, 0, thumbCanvas.height);
    grad.addColorStop(0, "#E3EFE4");
    grad.addColorStop(1, "#EDF1DB");
    tctx.fillStyle = grad;
    tctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);

    // Crop area around the center of the world
    const cropW = 1200;
    const cropH = 750;
    const cropX = (WORLD_W - cropW) / 2;
    const cropY = (WORLD_H - cropH) / 2 + 30;

    // Draw 3D terrain layer (lush meadow, grass blades, shadows, 3D cliffs)
    tctx.drawImage(
      terrainLayerCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      thumbCanvas.width,
      thumbCanvas.height,
    );

    // Draw flowers scaled to thumbnail
    const scaleX = thumbCanvas.width / cropW;
    const scaleY = thumbCanvas.height / cropH;
    for (const f of flowers) {
      if (
        f.x >= cropX - 50 &&
        f.x <= cropX + cropW + 50 &&
        f.y >= cropY - 50 &&
        f.y <= cropY + cropH + 50
      ) {
        const tx = (f.x - cropX) * scaleX;
        const ty = (f.y - cropY) * scaleY;
        const tw = Math.max(12, f.width * scaleX * 1.3);
        const th = Math.max(14, f.height * scaleY * 1.3);
        if (f.imgCanvas) {
          tctx.drawImage(f.imgCanvas, tx - tw / 2, ty - th, tw, th);
        }
      }
    }

    // Draw animals on thumbnail
    for (const a of animals) {
      if (
        a.x >= cropX - 50 &&
        a.x <= cropX + cropW + 50 &&
        a.y >= cropY - 50 &&
        a.y <= cropY + cropH + 50
      ) {
        const tx = (a.x - cropX) * scaleX;
        const ty = (a.y - cropY) * scaleY;
        tctx.save();
        tctx.translate(tx, ty);
        tctx.scale(0.5, 0.5);
        if (a.type === "cat")
          drawCat(tctx, { ...a, x: 0, y: 0, petAnim: 0, state: "idle" }, 0);
        else if (a.type === "dog")
          drawDog(tctx, { ...a, x: 0, y: 0, petAnim: 0, state: "idle" }, 0);
        else if (a.type === "rabbit")
          drawRabbit(tctx, { ...a, x: 0, y: 0, petAnim: 0, state: "idle" }, 0);
        else if (a.type === "butterfly")
          drawButterfly(
            tctx,
            { ...a, x: 0, y: 0, petAnim: 0, state: "idle" },
            0,
          );
        else if (a.type === "fish")
          drawFish(tctx, { ...a, x: 0, y: 0, petAnim: 0, state: "idle" }, 0);
        else if (a.type === "custom")
          drawCustomAnimal(
            tctx,
            { ...a, x: 0, y: 0, petAnim: 0, state: "idle" },
            0,
          );
        else if (
          (a.type === "exclusive" ||
            (typeof isExclusivePetType === "function" &&
              isExclusivePetType(a.variant || a.type))) &&
          typeof drawExclusivePet === "function"
        )
          drawExclusivePet(
            tctx,
            { ...a, x: 0, y: 0, petAnim: 0, state: "idle" },
            0,
          );
        tctx.restore();
      }
    }

    return thumbCanvas.toDataURL("image/jpeg", 0.85);
  } catch (e) {
    return "";
  }
}

function dataUrlToCanvas(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 72;
      return resolve(c);
    }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width || 64;
      c.height = img.height || 72;
      const cCtx = c.getContext("2d");
      cCtx.drawImage(img, 0, 0);
      resolve(c);
    };
    img.onerror = () => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 72;
      resolve(c);
    };
    img.src = dataUrl;
  });
}

function loadTerrainFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      createDefaultOvalIsland();
      return resolve();
    }
    const img = new Image();
    img.onload = () => {
      maskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
      maskCtx.drawImage(img, 0, 0, WORLD_W, WORLD_H);
      populateGrassDetailsAcrossIsland();
      rebuildTerrain3DLayer();
      resolve();
    };
    img.onerror = () => {
      createDefaultOvalIsland();
      resolve();
    };
    img.src = dataUrl;
  });
}

function loadWaterFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    if (!waterMaskCtx) return resolve();
    waterMaskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
    if (!dataUrl) {
      return resolve();
    }
    const img = new Image();
    img.onload = () => {
      waterMaskCtx.drawImage(img, 0, 0, WORLD_W, WORLD_H);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = dataUrl;
  });
}

async function saveCurrentWorld(silent = false) {
  if (isWorldLoading || !isWorldReady) {
    return;
  }
  const indicator = document.getElementById("autoSaveText");
  if (indicator) indicator.textContent = "Menyimpan...";

  const titleEl = document.getElementById("gardenTitle");
  const titleText =
    (titleEl ? titleEl.innerText.trim() : "") || "Fella's Garden";

  const serializedFlowers = flowers.map((f) => ({
    id: f.id,
    x: Math.round(f.x),
    y: Math.round(f.y),
    width: f.width,
    height: f.height,
    hydration: Math.round(f.hydration),
    onGrass: !!f.onGrass,
    swayPhase: f.swayPhase,
    growthProgress:
      typeof f.growthProgress === "number"
        ? Number(f.growthProgress.toFixed(3))
        : 1.0,
    birthScale: 1,
    waterBounce: 0,
    spriteDataUrl: f.imgCanvas ? f.imgCanvas.toDataURL("image/png") : "",
  }));

  const serializedAnimals = animals.map((a) => ({
    id: a.id,
    type: a.type,
    name: a.name,
    variant: a.variant || "default",
    habitat:
      a.habitat ||
      (a.type === "fish"
        ? "water"
        : a.type === "butterfly"
          ? "flying"
          : "land"),
    x: Math.round(a.x),
    y: Math.round(a.y),
    width: a.width,
    height: a.height,
    spriteDataUrl: a.spriteDataUrl,
    sound: a.sound,
    colorHue: a.colorHue,
    friendship:
      typeof a.friendship === "number" ? Math.round(a.friendship) : 20,
    personality: a.personality || "playful",
    accessory: a.accessory || "none",
  }));

  const serializedDecorations =
    typeof decorations !== "undefined" && Array.isArray(decorations)
      ? decorations.map((d) => ({
          id: d.id,
          type: d.type,
          x: Math.round(d.x),
          y: Math.round(d.y),
          width: d.width,
          height: d.height,
          habitat: d.habitat || "land",
          rotation: d.rotation || 0,
        }))
      : [];

  const existingWorld = await dbGetWorld(currentWorldId);
  const nowIso = new Date().toISOString();

  const [terrainDataUrl, waterDataUrl] = await Promise.all([
    canvasToDataUrlAsync(maskCanvas),
    waterMaskCanvas ? canvasToDataUrlAsync(waterMaskCanvas) : Promise.resolve(""),
  ]);

  const worldObj = {
    id: currentWorldId,
    name: titleText,
    thumbnail: generateWorldThumbnail(),
    createdAt: existingWorld ? existingWorld.createdAt : nowIso,
    lastPlayed: nowIso,
    terrainData: terrainDataUrl,
    waterData: waterDataUrl,
    grassDetails: grassDetails,
    flowerCount: flowers.length,
    flowers: serializedFlowers,
    animals: serializedAnimals,
    decorations: serializedDecorations,
    camera: { panX: Math.round(panX), panY: Math.round(panY), zoom },
    settings: {
      witherModeIndex: currentWitherModeIndex,
      isNightMode: isNightMode,
      season: typeof currentSeason !== "undefined" ? currentSeason : "spring",
    },
    achievements:
      typeof playerStats !== "undefined" && typeof unlockedAchievements !== "undefined"
        ? { stats: playerStats, unlocked: unlockedAchievements }
        : null,
    mysteryEgg: (typeof mysteryEgg !== "undefined" && mysteryEgg) ? mysteryEgg : null,
    droppedSeeds: (typeof droppedSeeds !== "undefined" && Array.isArray(droppedSeeds)) ? droppedSeeds : [],
    dailyLoginState: (typeof dailyLoginState !== "undefined" && dailyLoginState) ? dailyLoginState : null,
    polaroidAlbum: (typeof polaroidAlbum !== "undefined" && Array.isArray(polaroidAlbum)) ? polaroidAlbum : [],
  };

  await dbSaveWorld(worldObj);
  localStorage.setItem(CURRENT_WORLD_KEY, currentWorldId);

  // Keep registry in sync & update garden counter badge immediately
  await updateWorldsBadge();

  if (indicator) indicator.textContent = "Tersimpan";

  if (!silent) {
    showGardenNotice(`Kebun "${titleText}" berhasil disimpan!`);
  }

  // Refresh World Manager grid if open
  const modal = document.getElementById("worldManagerModal");
  if (modal && !modal.classList.contains("hidden")) {
    renderWorldsGrid();
  }
}

function canvasToDataUrlAsync(canvas) {
  if (!canvas) return Promise.resolve("");
  if (typeof canvas.toBlob !== "function") {
    return Promise.resolve(canvas.toDataURL("image/png"));
  }
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    }, "image/png");
  });
}

function scheduleAutoSave() {
  const indicator = document.getElementById("autoSaveText");
  if (indicator) indicator.textContent = "Menyimpan...";
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (
      (typeof isPointerDown !== "undefined" && isPointerDown) ||
      (typeof isPaintingTerrain !== "undefined" && isPaintingTerrain)
    ) {
      scheduleAutoSave();
      return;
    }
    saveCurrentWorld(true);
  }, 3200);
}

async function loadWorldById(worldId) {
  isWorldLoading = true;
  isWorldReady = false;
  window.isWorldLoading = true;
  window.isWorldReady = false;
  try {
    const worldObj = await dbGetWorld(worldId);
    if (!worldObj) {
      showGardenNotice("Kebun tidak ditemukan!");
      return;
    }

    currentWorldId = worldObj.id;
    window.currentWorldId = currentWorldId;
    localStorage.setItem(CURRENT_WORLD_KEY, currentWorldId);

    // Update title
    const titleEl = document.getElementById("gardenTitle");
    if (titleEl) titleEl.innerText = worldObj.name || "Fella's Garden";

    // Restore camera
    if (worldObj.camera) {
      panX =
        typeof worldObj.camera.panX === "number" ? worldObj.camera.panX : panX;
      panY =
        typeof worldObj.camera.panY === "number" ? worldObj.camera.panY : panY;
      zoom =
        typeof worldObj.camera.zoom === "number" ? worldObj.camera.zoom : zoom;
      clampPan();
      updateZoomDisplay();
    } else {
      centerGardenView();
    }

    // Restore wither mode
    if (
      worldObj.settings &&
      typeof worldObj.settings.witherModeIndex === "number"
    ) {
      currentWitherModeIndex = worldObj.settings.witherModeIndex;
      updateWitherModeDisplay();
    }

    // Restore terrain
    await loadTerrainFromDataUrl(worldObj.terrainData);

    // Restore water terrain
    await loadWaterFromDataUrl(worldObj.waterData);

    // Restore custom painted grass details
    if (worldObj.grassDetails && Array.isArray(worldObj.grassDetails)) {
      grassDetails = worldObj.grassDetails;
    }

    if (typeof updateCollisionGrids === "function") {
      updateCollisionGrids();
    }
    rebuildTerrain3DLayer();

    // Restore flowers into local array first to prevent empty state race conditions
    const loadedFlowers = [];
    if (worldObj.flowers && Array.isArray(worldObj.flowers)) {
      for (const sf of worldObj.flowers) {
        let srcCanvas;
        if (sf.spriteDataUrl) {
          srcCanvas = await dataUrlToCanvas(sf.spriteDataUrl);
        } else {
          srcCanvas = makeProceduralFlowerSprite({});
        }
        const wilted = createWiltedSprite(srcCanvas);
        loadedFlowers.push({
          id: sf.id || "flw_" + Math.random().toString(36).slice(2, 7),
          x: sf.x,
          y: sf.y,
          width: sf.width || 64,
          height: sf.height || 72,
          imgCanvas: srcCanvas,
          wiltedCanvas: wilted,
          hydration: typeof sf.hydration === "number" ? sf.hydration : 100,
          onGrass:
            typeof sf.onGrass === "boolean"
              ? sf.onGrass
              : isPointOnGrass(sf.x, sf.y),
          swayPhase: sf.swayPhase || Math.random() * Math.PI * 2,
          growthProgress:
            typeof sf.growthProgress === "number" ? sf.growthProgress : 1.0,
          birthScale: 1,
          waterBounce: 0,
        });
      }
    }
    loadedFlowers.sort((a, b) => a.y - b.y);
    flowers = loadedFlowers;
    if (typeof window !== "undefined") window.flowers = flowers;
    updateStatusBadges();

    // Restore animals into local array first
    const loadedAnimals = [];
    if (worldObj.animals && Array.isArray(worldObj.animals)) {
      for (const sa of worldObj.animals) {
        let customImg = null;
        if (sa.spriteDataUrl) {
          customImg = new Image();
          customImg.src = sa.spriteDataUrl;
        }
        loadedAnimals.push({
          id: sa.id || "anm_" + Math.random().toString(36).slice(2, 6),
          type: sa.type || "rabbit",
          name: sa.name || "Sahabat",
          variant: sa.variant || "default",
          habitat:
            sa.habitat ||
            (sa.type === "fish"
              ? "water"
              : sa.type === "butterfly"
                ? "flying"
                : "land"),
          x: sa.x,
          y: sa.y,
          vx: 0,
          vy: 0,
          targetX: sa.x,
          targetY: sa.y,
          width: sa.width || 48,
          height: sa.height || 48,
          spriteDataUrl: sa.spriteDataUrl,
          customImg: customImg,
          sound: sa.sound || "chime",
          colorHue: sa.colorHue || Math.random() * 360,
          friendship: typeof sa.friendship === "number" ? sa.friendship : 20,
          personality: sa.personality || "playful",
          accessory: sa.accessory || "none",
          wingPhase: Math.random() * Math.PI * 2,
          wingSpeed: 16,
          perchedFlowerId: null,
          perchTimer: 0,
          state: "idle",
          stateTimer: 1 + Math.random() * 2,
          facingLeft: Math.random() < 0.5,
          hopPhase: 0,
          tailPhase: Math.random() * Math.PI,
          petAnim: 0,
          bubbleText: "",
          bubbleTimer: 0,
        });
      }
      animals = loadedAnimals;
    } else {
      spawnStarterAnimals();
    }
    if (typeof window !== "undefined") window.animals = animals;
    updateAnimalsBadge();

  // Restore Decorations
  if (typeof decorations !== "undefined") {
    decorations.length = 0;
    if (worldObj.decorations && Array.isArray(worldObj.decorations)) {
      for (const sd of worldObj.decorations) {
        decorations.push({
          id: sd.id || "dec_" + Math.random().toString(36).slice(2, 6),
          type: sd.type || "fence",
          x: sd.x,
          y: sd.y,
          width: sd.width || 48,
          height: sd.height || 40,
          habitat: sd.habitat || (sd.type === "bridge" ? "both" : "land"),
          rotation: sd.rotation || 0,
          birthScale: 1,
        });
      }
    }
  }

  // Restore Season
  if (
    worldObj.settings &&
    worldObj.settings.season &&
    typeof setSeason === "function"
  ) {
    setSeason(worldObj.settings.season, true);
  }

  // Restore Night Mode
  if (worldObj.settings && typeof worldObj.settings.isNightMode === "boolean") {
    if (isNightMode !== worldObj.settings.isNightMode) {
      if (typeof setDayNightMode === "function") {
        setDayNightMode(worldObj.settings.isNightMode, true);
      } else {
        toggleDayNightMode();
      }
    }
  }

  // Restore Achievements & Player Stats from World Save
  if (worldObj.achievements) {
    if (typeof playerStats !== "undefined" && worldObj.achievements.stats) {
      for (const [k, v] of Object.entries(worldObj.achievements.stats)) {
        if (typeof v === "number") {
          playerStats[k] = Math.max(playerStats[k] || 0, v);
        }
      }
    }
    if (typeof unlockedAchievements !== "undefined" && worldObj.achievements.unlocked) {
      for (const [k, v] of Object.entries(worldObj.achievements.unlocked)) {
        if (!unlockedAchievements[k]) {
          unlockedAchievements[k] = v;
        }
      }
    }
  }
  if (typeof saveAchievementsToStorage === "function") {
    saveAchievementsToStorage();
  }
  if (typeof syncAchievementsFromWorld === "function") {
    syncAchievementsFromWorld();
  }
  if (typeof updateAchievementsBadge === "function") {
    updateAchievementsBadge();
  }

  // Restore Mystery Egg & Dropped Seeds
  if (worldObj.mysteryEgg) {
    mysteryEgg = worldObj.mysteryEgg;
  } else {
    mysteryEgg = null;
  }
  if (typeof window !== "undefined") window.mysteryEgg = mysteryEgg;

  if (worldObj.droppedSeeds && Array.isArray(worldObj.droppedSeeds)) {
    droppedSeeds = worldObj.droppedSeeds;
  } else {
    droppedSeeds = [];
  }
  if (typeof window !== "undefined") window.droppedSeeds = droppedSeeds;

  // Restore Daily Quests & Star Shop State
  if (worldObj.dailyLoginState && typeof dailyLoginState !== "undefined") {
    dailyLoginState = Object.assign(dailyLoginState, worldObj.dailyLoginState);
    if (typeof window !== "undefined") window.dailyLoginState = dailyLoginState;
    if (typeof saveJournalToStorage === "function") {
      saveJournalToStorage();
    }
  }

  // Restore Polaroid Album
  if (worldObj.polaroidAlbum && Array.isArray(worldObj.polaroidAlbum) && typeof polaroidAlbum !== "undefined") {
    polaroidAlbum.length = 0;
    polaroidAlbum.push(...worldObj.polaroidAlbum);
    if (typeof window !== "undefined") window.polaroidAlbum = polaroidAlbum;
    if (typeof savePolaroidAlbumToStorage === "function") {
      savePolaroidAlbumToStorage();
    }
  }

  // Update last played
  worldObj.lastPlayed = new Date().toISOString();
  await dbSaveWorld(worldObj);
  await updateWorldsBadge();

  showGardenNotice(`Membuka "${worldObj.name}"`);

  // Refresh manager modal if open
  const modal = document.getElementById("worldManagerModal");
  if (modal && !modal.classList.contains("hidden")) {
    renderWorldsGrid();
  }
  } finally {
    isWorldLoading = false;
    isWorldReady = true;
    window.isWorldLoading = false;
    window.isWorldReady = true;
  }
}

async function createNewWorld(name, template = "classic") {
  // 1. Auto-save current world before switching
  await saveCurrentWorld(true);

  const newId =
    "world_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  currentWorldId = newId;
  window.currentWorldId = currentWorldId;
  localStorage.setItem(CURRENT_WORLD_KEY, currentWorldId);

  const titleEl = document.getElementById("gardenTitle");
  if (titleEl) titleEl.innerText = name;

  // Reset camera to center
  centerGardenView();

  // Setup initial landscape according to template
  if (waterMaskCtx) waterMaskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
  if (template === "classic") {
    createDefaultOvalIsland();
    flowers = [];
    createStarterFlowersMatchingReference();
    spawnStarterAnimals();
  } else if (template === "empty") {
    maskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
    grassDetails = [];
    if (typeof updateCollisionGrids === "function") updateCollisionGrids();
    rebuildTerrain3DLayer();
    flowers = [];
    animals = [];
  } else if (template === "clean_island") {
    createDefaultOvalIsland();
    flowers = [];
    spawnStarterAnimals();
  }

  updateStatusBadges();
  updateAnimalsBadge();

  // Save immediately so it persists in DB
  await saveCurrentWorld(true);
  await updateWorldsBadge();

  showGardenNotice(`Kebun "${name}" siap dirawat!`);

  closeNewWorldModal();
  closeWorldManagerModal();
}

async function duplicateWorld(worldId) {
  const original = await dbGetWorld(worldId);
  if (!original) return;

  const newId =
    "world_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
  const cloned = JSON.parse(JSON.stringify(original));
  cloned.id = newId;
  cloned.name = original.name + " (Salinan)";
  cloned.createdAt = new Date().toISOString();
  cloned.lastPlayed = new Date().toISOString();

  await dbSaveWorld(cloned);
  await updateWorldsBadge();
  await renderWorldsGrid();
  showGardenNotice(`Kebun "${original.name}" diduplikasi!`);
}

async function deleteWorld(worldId) {
  const allWorlds = await dbGetAllWorlds();
  if (allWorlds.length <= 1) {
    if (typeof cuteAlert === "function") {
      await cuteAlert(
        "Tidak bisa menghapus kebun satu-satunya! Buat kebun baru terlebih dahulu.",
        "Perhatian",
        "🌱",
      );
    } else {
      showGardenNotice("Tidak bisa menghapus kebun satu-satunya!");
    }
    return;
  }

  const target = allWorlds.find((w) => w.id === worldId);
  const targetName = target ? target.name : "kebun ini";

  let confirmed = true;
  if (typeof cuteConfirm === "function") {
    confirmed = await cuteConfirm(
      `Yakin ingin menghapus "${targetName}" selamanya? Tindakan ini tidak bisa dibatalkan.`,
      "Hapus Kebun",
      true,
      "Ya, Hapus Kebun",
      "🗑️",
    );
  } else {
    confirmed = confirm(
      `Yakin ingin menghapus "${targetName}" selamanya? Tindakan ini tidak bisa dibatalkan.`,
    );
  }

  if (!confirmed) return;

  await dbDeleteWorld(worldId);
  await updateWorldsBadge();

  // If deleting the currently active world, switch to another world
  if (worldId === currentWorldId) {
    const remaining = allWorlds.filter((w) => w.id !== worldId);
    if (remaining.length > 0) {
      await loadWorldById(remaining[0].id);
    }
  }

  await renderWorldsGrid();
  showGardenNotice(`"${targetName}" telah dihapus.`);
}

async function exportWorld(worldId) {
  const world = await dbGetWorld(worldId);
  if (!world) {
    showGardenNotice("Gagal mengekspor: kebun tidak ditemukan.");
    return;
  }
  const cleanJson = JSON.stringify(world, null, 2);
  const blob = new Blob([cleanJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (world.name || "fellas-garden")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  a.href = url;
  a.download = `${safeName}-world.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showGardenNotice(`File cadangan "${world.name}" terunduh!`);
}

function triggerImportWorldFile() {
  const fileInput = document.getElementById("importWorldFileInput");
  if (fileInput) {
    fileInput.value = "";
    fileInput.click();
  }
}

async function handleImportWorldFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || (!data.terrainData && !data.flowers)) {
      if (typeof cuteAlert === "function") {
        await cuteAlert(
          "File JSON tidak valid atau bukan file cadangan Fella's Garden.",
          "Format Salah",
          "⚠️",
        );
      } else {
        alert("File JSON tidak valid atau bukan file cadangan Fella's Garden.");
      }
      return;
    }

    const newId =
      "world_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    data.id = newId;
    data.name = (data.name || "Kebun Impor") + " (Impor)";
    data.lastPlayed = new Date().toISOString();

    await dbSaveWorld(data);
    await renderWorldsGrid();
    showGardenNotice(`Kebun "${data.name}" berhasil diimpor!`);

    let openNow = true;
    if (typeof cuteConfirm === "function") {
      openNow = await cuteConfirm(
        `Kebun "${data.name}" berhasil diimpor! Ingin langsung membukanya sekarang?`,
        "Kebun Siap",
        false,
        "Buka Sekarang",
        "✨",
      );
    } else {
      openNow = confirm(
        `Kebun "${data.name}" berhasil diimpor! Ingin langsung membukanya?`,
      );
    }

    if (openNow) {
      await loadWorldById(newId);
      closeWorldManagerModal();
    }
  } catch (e) {
    console.error("Import error:", e);
    if (typeof cuteAlert === "function") {
      await cuteAlert(
        "Terjadi kesalahan saat membaca file JSON.",
        "Gagal Mengimpor",
        "❌",
      );
    } else {
      alert("Terjadi kesalahan saat membaca file JSON.");
    }
  }
}

function openWorldManagerModal() {
  const modal = document.getElementById("worldManagerModal");
  if (modal) {
    saveCurrentWorld(true).then(() => {
      modal.classList.remove("hidden");
      renderWorldsGrid();
    });
  }
}

function closeWorldManagerModal() {
  const modal = document.getElementById("worldManagerModal");
  if (modal) modal.classList.add("hidden");
}

async function promptCreateNewWorld() {
  const all = await dbGetAllWorlds();
  const input = document.getElementById("newWorldNameInput");
  if (input) {
    input.value = `Kebun Fella #${all.length + 1}`;
  }
  const modal = document.getElementById("newWorldModal");
  if (modal) modal.classList.remove("hidden");
  setTimeout(() => {
    if (input) {
      input.focus();
      input.select();
    }
  }, 100);
}

function closeNewWorldModal() {
  const modal = document.getElementById("newWorldModal");
  if (modal) modal.classList.add("hidden");
}

function confirmCreateNewWorld() {
  const input = document.getElementById("newWorldNameInput");
  let name = input ? input.value.trim() : "";
  if (!name) name = "Kebun Baru";

  const radio = document.querySelector(
    'input[name="worldTemplateChoice"]:checked',
  );
  const template = radio ? radio.value : "classic";

  createNewWorld(name, template);
}

async function updateWorldsBadge() {
  try {
    let worlds = await dbGetAllWorlds();
    if (!worlds || worlds.length === 0) {
      worlds = getLocalWorldsRegistry();
    } else {
      setLocalWorldsRegistry(worlds);
    }
    const count = worlds && worlds.length ? worlds.length : 1;
    const sideBadge = document.getElementById("worldsCounterBadgeSide");
    if (sideBadge) sideBadge.textContent = count;
    const countPill = document.getElementById("worldsCounterPill");
    if (countPill) countPill.textContent = count;
  } catch (e) {
    console.warn("Could not update worlds badge:", e);
    const fallback = getLocalWorldsRegistry();
    const count = fallback && fallback.length ? fallback.length : 1;
    const sideBadge = document.getElementById("worldsCounterBadgeSide");
    if (sideBadge) sideBadge.textContent = count;
    const countPill = document.getElementById("worldsCounterPill");
    if (countPill) countPill.textContent = count;
  }
}

function renderWorldsGrid(filterText = "") {
  const container = document.getElementById("worldsGridContainer");
  if (!container) return;

  dbGetAllWorlds().then((worlds) => {
    updateWorldsBadge();

    const filtered = filterText.trim()
      ? worlds.filter((w) =>
          (w.name || "")
            .toLowerCase()
            .includes(filterText.toLowerCase().trim()),
        )
      : worlds;

    if (filtered.length === 0) {
      container.innerHTML = `
                        <div class="py-12 flex flex-col items-center justify-center text-center text-[#477431]">
                            <div class="w-14 h-14 rounded-full bg-emerald-100/60 flex items-center justify-center mb-3">
                                <svg class="w-7 h-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                            </div>
                            <p class="font-hand text-xl text-[#2B5B35] font-bold">Tidak ada kebun yang cocok</p>
                            <p class="text-xs text-gray-500 mt-1">Coba kata kunci lain atau buat kebun baru sekarang!</p>
                        </div>
                    `;
      return;
    }

    container.innerHTML = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        ${filtered
                          .map((w) => {
                            const isActive = w.id === currentWorldId;
                            const dateFormatted = formatRelativeTime(
                              w.lastPlayed,
                            );
                            const flowerCount =
                              typeof w.flowerCount === "number"
                                ? w.flowerCount
                                : w.flowers
                                  ? w.flowers.length
                                  : 0;
                            const thumb = w.thumbnail || "";
                            return `
                                <div class="group relative bg-white rounded-2xl border-2 ${isActive ? "border-[#2B5B35] ring-2 ring-[#7DB852]/50 shadow-md" : "border-[#d2e0cb] hover:border-[#7DB852]"} overflow-hidden transition-all duration-200 flex flex-col">
                                    
                                    <!-- Thumbnail Area -->
                                    <div class="relative w-full h-36 bg-[#E3EFE4] overflow-hidden flex items-center justify-center border-b border-[#e2edd9]">
                                        ${
                                          thumb
                                            ? `
                                            <img src="${thumb}" alt="${escapeHtml(w.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                        `
                                            : `
                                            <div class="flex flex-col items-center justify-center text-[#477431]/60">
                                                <svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                                <span class="text-[11px] mt-1 font-medium">Pratinjau Kebun</span>
                                            </div>
                                        `
                                        }
                                        
                                        ${
                                          isActive
                                            ? `
                                            <div class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#2B5B35] text-white text-[11px] font-bold shadow-md flex items-center gap-1.5">
                                                <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                                                <span>Sedang Aktif</span>
                                            </div>
                                        `
                                            : ""
                                        }

                                        <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
                                            <svg class="w-3 h-3 text-pink-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9z"/></svg>
                                            <span>${flowerCount} Bunga</span>
                                        </div>
                                    </div>

                                    <!-- Card Body -->
                                    <div class="p-3.5 flex flex-col flex-1 justify-between gap-3">
                                        <div>
                                            <div class="flex items-start justify-between gap-2">
                                                <h3 class="font-hand font-bold text-lg text-[#2B5B35] leading-snug line-clamp-1" title="${escapeHtml(w.name)}">
                                                    ${escapeHtml(w.name || "Kebun Tanpa Nama")}
                                                </h3>
                                            </div>
                                            <p class="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                                                <svg class="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                <span>Dibuka: ${dateFormatted}</span>
                                            </p>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="flex items-center justify-between gap-1.5 pt-2 border-t border-[#f0f5eb]">
                                            ${
                                              isActive
                                                ? `
                                                <button onclick="closeWorldManagerModal()" class="flex-1 py-1 px-3 rounded-full bg-[#eef5e6] text-[#2B5B35] text-xs font-bold border border-[#c5d9b7] flex items-center justify-center gap-1.5 hover:bg-[#e2efd7] transition">
                                                    <svg class="w-3.5 h-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span>Lanjut Rawat</span>
                                                </button>
                                            `
                                                : `
                                                <button onclick="loadWorldById('${w.id}'); closeWorldManagerModal();" class="flex-1 py-1 px-3 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95">
                                                    <svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                                    <span>Buka Kebun</span>
                                                </button>
                                            `
                                            }

                                            <div class="flex items-center gap-1">
                                                <button onclick="duplicateWorld('${w.id}')" class="w-7 h-7 rounded-full bg-[#f4faee] hover:bg-emerald-100 border border-[#c5d9b7] text-[#2B5B35] flex items-center justify-center transition active:scale-95" title="Duplikat Kebun">
                                                    <svg class="w-3.5 h-3.5 text-[#2B5B35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                                </button>
                                                <button onclick="exportWorld('${w.id}')" class="w-7 h-7 rounded-full bg-[#f4faee] hover:bg-emerald-100 border border-[#c5d9b7] text-[#2B5B35] flex items-center justify-center transition active:scale-95" title="Unduh File Cadangan (.json)">
                                                    <svg class="w-3.5 h-3.5 text-[#2B5B35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                </button>
                                                <button onclick="deleteWorld('${w.id}')" class="w-7 h-7 rounded-full bg-[#fff5f5] hover:bg-red-100 border border-red-200 text-red-600 flex items-center justify-center transition active:scale-95 ${worlds.length <= 1 ? "opacity-40 cursor-not-allowed" : ""}" title="${worlds.length <= 1 ? "Kebun satu-satunya tidak bisa dihapus" : "Hapus Kebun"}">
                                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                `;
  });
}

async function initWorldManager() {
  await openGardenDB();
  await updateWorldsBadge();
  const existingWorlds = await dbGetAllWorlds();

  const savedWorldId = localStorage.getItem(CURRENT_WORLD_KEY);

  if (!existingWorlds || existingWorlds.length === 0) {
    // First ever launch: initialize default world
    currentWorldId = "world_default";
    localStorage.setItem(CURRENT_WORLD_KEY, currentWorldId);
    createDefaultOvalIsland();
    createStarterFlowersMatchingReference();
    spawnStarterAnimals();
    isWorldReady = true;
    window.isWorldReady = true;
    await saveCurrentWorld(true);
  } else {
    // Load saved world or most recent world
    let targetWorld = existingWorlds.find((w) => w.id === savedWorldId);
    if (!targetWorld) {
      targetWorld = existingWorlds[0];
    }
    await loadWorldById(targetWorld.id);
    if (animals.length === 0) {
      spawnStarterAnimals();
      await saveCurrentWorld(true);
    }
  }
  updateAnimalsBadge();
  await updateWorldsBadge();

  // Attach listener to garden title for inline auto-renaming and auto-save
  const titleEl = document.getElementById("gardenTitle");
  if (titleEl) {
    titleEl.addEventListener("input", () => {
      scheduleAutoSave();
    });
    titleEl.addEventListener("blur", () => {
      scheduleAutoSave();
    });
    titleEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        titleEl.blur();
      }
    });
  }

  // Also auto-save on page hide/unload
  window.addEventListener("beforeunload", () => {
    saveCurrentWorld(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveCurrentWorld(true);
    }
  });
}

// Global function bindings on window for robust HTML onclick access
window.initWorldManager = initWorldManager;
window.openWorldManagerModal = openWorldManagerModal;
window.closeWorldManagerModal = closeWorldManagerModal;
window.renderWorldsGrid = renderWorldsGrid;
window.promptCreateNewWorld = promptCreateNewWorld;
window.closeNewWorldModal = closeNewWorldModal;
window.confirmCreateNewWorld = confirmCreateNewWorld;
window.loadWorldById = loadWorldById;
window.duplicateWorld = duplicateWorld;
window.deleteWorld = deleteWorld;
window.exportWorld = exportWorld;
window.triggerImportWorldFile = triggerImportWorldFile;
window.handleImportWorldFile = handleImportWorldFile;
window.saveCurrentWorld = saveCurrentWorld;
window.scheduleAutoSave = scheduleAutoSave;
window.updateWorldsBadge = updateWorldsBadge;

// Self-invoke immediately on load to guarantee accurate badge count
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateWorldsBadge();
    });
  } else {
    updateWorldsBadge();
  }
}
