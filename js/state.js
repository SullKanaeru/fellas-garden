/********************************************************************
 * FELLA'S GARDEN - STATE & GLOBAL CONFIGURATION (js/state.js)
 ********************************************************************/

// Main World Canvas
var worldCanvas = typeof document !== 'undefined' ? document.getElementById('worldCanvas') : null;
var ctx = worldCanvas ? worldCanvas.getContext('2d') : null;

// World Canvas Dimensions
var WORLD_W = 4200;
var WORLD_H = 3200;

// Camera Viewport (Pan & Zoom)
var zoom = 1.0;
var MIN_ZOOM = 0.35;
var MAX_ZOOM = 2.4;
var panX = 0;
var panY = 0;
var isDraggingCanvas = false;
var dragStartScreenX = 0;
var dragStartScreenY = 0;
var dragStartPanX = 0;
var dragStartPanY = 0;
var isSpacePressed = false;

// Multi-touch tracking for pinch-to-zoom & smooth touch pan
var activeTouchPointers = new Map();
var initialPinchDist = 0;
var initialPinchZoom = 1;
var initialPinchMidX = 0;
var initialPinchMidY = 0;
var initialPinchPanX = 0;
var initialPinchPanY = 0;
var isPinching = false;

// Offscreen masks & layers for the 3D Grass Island (GPU-accelerated)
var maskCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
var maskCtx = maskCanvas ? maskCanvas.getContext('2d') : null;

var terrainLayerCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
var terrainLayerCtx = terrainLayerCanvas ? terrainLayerCanvas.getContext('2d') : null;

var tempExtrudeCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
var tempExtrudeCtx = tempExtrudeCanvas ? tempExtrudeCanvas.getContext('2d') : null;

// Offscreen mask for Water Terrain (Kolam Air & Sungai - GPU-accelerated)
var waterMaskCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
var waterMaskCtx = waterMaskCanvas ? waterMaskCanvas.getContext('2d') : null;

var waterLayerCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
var waterLayerCtx = waterLayerCanvas ? waterLayerCanvas.getContext('2d') : null;

// Small reusable scratch canvases for ultra-fast real-time dirty-rect 3D extrusion
var dirtyExtrudeCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (dirtyExtrudeCanvas) {
    dirtyExtrudeCanvas.width = 640;
    dirtyExtrudeCanvas.height = 640;
}
var dirtyExtrudeCtx = dirtyExtrudeCanvas ? dirtyExtrudeCanvas.getContext('2d') : null;

var dirtyWaterCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (dirtyWaterCanvas) {
    dirtyWaterCanvas.width = 640;
    dirtyWaterCanvas.height = 640;
}
var dirtyWaterCtx = dirtyWaterCanvas ? dirtyWaterCanvas.getContext('2d') : null;

var pendingTerrainDirtyRect = null;
var lastGrassPaintX = -9999;
var lastGrassPaintY = -9999;

var screenW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 800;
var screenH = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 600;
var terrainNeedsRebuild = false;
var isInitialSetupComplete = false;

// Fast in-memory collision grid buffer (Eliminates synchronous getImageData GPU pipeline stalls)
var COLL_SCALE = 8;
var COLL_W = Math.ceil(WORLD_W / COLL_SCALE); // 525
var COLL_H = Math.ceil(WORLD_H / COLL_SCALE); // 400
var collCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (collCanvas) {
    collCanvas.width = COLL_W;
    collCanvas.height = COLL_H;
}
var collCtx = collCanvas ? collCanvas.getContext('2d', { willReadFrequently: true }) : null;
var grassGrid = new Uint8Array(COLL_W * COLL_H);
var waterGrid = new Uint8Array(COLL_W * COLL_H);
var lastTerrainRebuildTime = 0;
var isPaintingTerrain = false;

// Day / Night System ('day' | 'night')
var isNightMode = false;
var nightTransition = 0; // 0 = full day, 1 = full night
var fireflies = [];

// Rain Shower System (duration in seconds)
var isRainingShower = false;
var rainShowerTimer = 0;
var rainShowerDuration = 8.0;

// Current active tool: 'hand' | 'land' | 'grass' | 'water' | 'erase' | 'plant'
var currentTool = 'hand';
var terrainBrushSize = 44;

// Wither speed modes: 1 = Normal, 0.45 = Santai (Default), 0 = Abadi (Never wither)
var witherModes = [
    { label: 'Santai', rate: 0.45 },
    { label: 'Normal', rate: 1.15 },
    { label: 'Abadi', rate: 0 }
];
var currentWitherModeIndex = 0;

// Decorative grass tufts & clover patches living on the island
var grassDetails = [];

// Planted flowers in the garden
var flowers = [];

// Active custom flower sprite ready to be planted
var pendingFlowerSprite = null;

// Interactive particles (water droplets, sparkles, soil puffs, rain, hearts)
var particles = [];

// Animal companions living in the garden (cats, dogs, rabbits, butterflies, custom)
var animals = [];
var followedAnimal = null;
var hoveredAnimal = null;
var activeHoverAnimalId = null;
var animalHoverTimer = null;
var animalLongPressTimer = null;
var animalLongPressTriggered = false;
var animalPointerDownPos = { x: 0, y: 0 };
var pendingPetAnimal = null;

// Custom Animal Creator Studio state
var animalStudioStrokes = [];
var animalStudioRedoStack = [];
var animalStudioCurrentColor = '#E76F51';
var animalStudioTool = 'pencil'; // 'pencil' | 'eraser' | 'eyedropper'
var animalStudioBrushSize = 6;
var isDrawingAnimalStudio = false;
var customAnimalTypes = []; // list of custom animal blueprints { id, name, spriteDataUrl, width, height, sound: 'cat'|'dog'|'rabbit'|'chime' }

// Dragging & Pointer state (in world coordinates)
var isPointerDown = false;
var currentWorldX = 0;
var currentWorldY = 0;
var lastWorldX = 0;
var lastWorldY = 0;
var draggedFlower = null;
var draggedFlowerOrigX = 0;
var draggedFlowerOrigY = 0;
var draggedFlowerOffset = { x: 0, y: 0 };
var hoveredFlower = null;
var draggedAnimal = null;
var draggedAnimalOrigX = 0;
var draggedAnimalOrigY = 0;
var draggedAnimalOffset = { x: 0, y: 0 };
var pendingPetAnimal = null;
var animalPointerDownPos = { x: 0, y: 0 };
var animalLongPressTimer = null;
var animalLongPressTriggered = false;

// Animation & Status Timers
var lastFrameTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
var statusRefreshTimer = 0;

// Terrain Undo & Redo History
var terrainUndoStack = [];
var terrainRedoStack = [];
var MAX_TERRAIN_UNDO = 10;

// Falling Objects Animation (Bunga & Hewan Darat Jatuh & Menghilang)
var fallingObjects = [];
