/********************************************************************
 * FELLA'S GARDEN - CUSTOM ANIMAL CREATOR STUDIO (js/animal_studio.js)
 * Studio gambar hewan custom dengan peralatan lengkap mirip Studio Bunga:
 * Pensil, Penghapus, Eyedropper, Undo/Redo, Palet Warna + Color Picker,
 * Pilihan Nama, Pilihan Suara, dan Pilihan Sifat/Habitat (Darat, Terbang, Air).
 ********************************************************************/

var animalPadCanvas = null;
var animalPadCtx = null;
var animalStudioTool = 'pencil';
var animalStudioCurrentColor = '#2c2c2c';
var animalStudioBrushSize = 7;
var isDrawingAnimalStudio = false;
var animalStudioStrokes = [];
var animalStudioRedoStack = [];
var selectedAnimalHabitat = 'land';
var animalZoom = 1.0;
var animalPanX = 0;
var animalPanY = 0;
var isAnimalPanMode = false;
var isAnimalPanning = false;
var animalPanStartX = 0;
var animalPanStartY = 0;

// Multi-touch 2-finger zoom & pan state
var isTwoFingerTransformingAnimal = false;
var animalGestureInitialDist = 0;
var animalGestureInitialZoom = 1.0;
var animalGestureInitialMidX = 0;
var animalGestureInitialMidY = 0;
var animalGestureInitialPanX = 0;
var animalGestureInitialPanY = 0;
var suppressAnimalDrawUntilAllUp = false;
var activeAnimalTouchPointers = new Set();

function applyAnimalTransform(immediate = false) {
    const paper = document.getElementById('animalCanvasPaper');
    if (paper) {
        paper.style.transformOrigin = 'center center';
        paper.style.transition = immediate ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)';
        paper.style.transform = `translate3d(${animalPanX}px, ${animalPanY}px, 0) scale(${animalZoom})`;
    }
    if (animalPadCanvas) {
        animalPadCanvas.style.transform = 'none';
    }
    const txt = document.getElementById('animalZoomLevelText');
    if (txt) txt.textContent = `${Math.round(animalZoom * 100)}%`;
}

function zoomAnimalCanvas(delta) {
    const next = Math.min(3.0, Math.max(0.75, Math.round((animalZoom + delta) * 100) / 100));
    animalZoom = next;
    applyAnimalTransform(false);
}

function resetAnimalZoom() {
    animalZoom = 1.0;
    animalPanX = 0;
    animalPanY = 0;
    isAnimalPanMode = false;
    updateAnimalPanButtonUI();
    applyAnimalTransform(false);
}

function cancelAnimalStrokeImmediately() {
    if (isDrawingAnimalStudio) {
        isDrawingAnimalStudio = false;
        document.getElementById('animalStudioModal')?.classList.remove('drawing-active');
        try { animalPadCtx.restore(); } catch (err) {}
        if (typeof currentStroke !== 'undefined') currentStroke = null;
        redrawAnimalPadFromStrokes();
    }
}

function toggleAnimalPanMode() {
    isAnimalPanMode = !isAnimalPanMode;
    updateAnimalPanButtonUI();
}

function updateAnimalPanButtonUI() {
    const panBtn = document.getElementById('animalPanToggleBtn');
    if (!panBtn) return;
    if (isAnimalPanMode) {
        panBtn.className = 'w-6 h-6 flex items-center justify-center rounded-full bg-[#2B5B35] text-white shadow-sm ring-2 ring-[#7DB852] transition active:scale-90';
        if (animalPadCanvas) animalPadCanvas.style.cursor = 'grab';
    } else {
        panBtn.className = 'w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100 text-gray-700 transition active:scale-90';
        if (animalPadCanvas) {
            animalPadCanvas.style.cursor = (animalStudioTool === 'eyedropper') ? 'crosshair' : (animalStudioTool === 'eraser' ? 'cell' : 'crosshair');
        }
    }
}

function initAnimalStudioCanvas() {
    if (!animalPadCanvas) {
        animalPadCanvas = document.getElementById('animalPadCanvas');
    }
    if (animalPadCanvas && !animalPadCtx) {
        animalPadCtx = animalPadCanvas.getContext('2d', { willReadFrequently: true });
        initAnimalStudioEventListeners();
    }
}

function openAnimalStudioModal() {
    initAnimalStudioCanvas();
    const modal = document.getElementById('animalStudioModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    const configModal = document.getElementById('animalConfigModal');
    if (configModal) configModal.classList.add('hidden');
    resetAnimalZoom();
    clearAnimalPad();
    setAnimalStudioTool('pencil');
    selectAnimalColor('#2c2c2c');
    updateAnimalHabitatUI('land');
    updateAnimalInfoPillText();
}

function closeAnimalStudioModal() {
    const modal = document.getElementById('animalStudioModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    const configModal = document.getElementById('animalConfigModal');
    if (configModal) configModal.classList.add('hidden');
}

function clearAnimalPad() {
    initAnimalStudioCanvas();
    if (!animalPadCanvas || !animalPadCtx) return;
    animalPadCtx.clearRect(0, 0, animalPadCanvas.width, animalPadCanvas.height);
    animalStudioStrokes = [];
    animalStudioRedoStack = [];
    const hint = document.getElementById('drawAnimalBoxHint');
    if (hint) hint.style.opacity = '0.4';
}

function setAnimalStudioTool(toolName) {
    animalStudioTool = toolName;
    isAnimalPanMode = false;
    updateAnimalPanButtonUI();
    const pencilBtn = document.getElementById('animalStudioToolPencil');
    const eraserBtn = document.getElementById('animalStudioToolEraser');
    const eyedropBtn = document.getElementById('animalStudioToolEyedrop');

    const activeCls = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition bg-[#2B5B35] text-white shadow-xs ring-2 ring-[#7DB852] cursor-pointer';
    const inactiveCls = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition hover:bg-[#eef5e6] text-gray-700 cursor-pointer';

    if (pencilBtn) pencilBtn.className = (toolName === 'pencil') ? activeCls : inactiveCls;
    if (eraserBtn) eraserBtn.className = (toolName === 'eraser') ? activeCls : inactiveCls;
    if (eyedropBtn) eyedropBtn.className = (toolName === 'eyedropper') ? activeCls : inactiveCls;

    if (animalPadCanvas) {
        if (toolName === 'eyedropper') animalPadCanvas.style.cursor = 'crosshair';
        else if (toolName === 'eraser') animalPadCanvas.style.cursor = 'cell';
        else animalPadCanvas.style.cursor = 'crosshair';
    }
}

function setAnimalBrushSize(size, btnEl) {
    animalStudioBrushSize = size;
    const slider = document.getElementById('animalBrushSlider');
    if (slider) slider.value = size;
    const valText = document.getElementById('animalBrushValText');
    if (valText) valText.textContent = size + 'px';

    document.querySelectorAll('.animal-size-btn').forEach(b => {
        b.classList.remove('bg-emerald-100', 'ring-1', 'ring-emerald-700');
        b.classList.add('hover:bg-gray-100');
    });
    if (btnEl) {
        btnEl.classList.add('bg-emerald-100', 'ring-1', 'ring-emerald-700');
        btnEl.classList.remove('hover:bg-gray-100');
    }
}

function setAnimalBrushSizeFromSlider(val) {
    animalStudioBrushSize = parseInt(val, 10);
    const valText = document.getElementById('animalBrushValText');
    if (valText) valText.textContent = val + 'px';
}

function selectAnimalColor(hexColor, btnEl) {
    animalStudioCurrentColor = hexColor;
    setAnimalStudioTool('pencil');
    document.querySelectorAll('#animalStudioModal .color-dot').forEach(el => el.classList.remove('active'));
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        document.querySelectorAll('#animalStudioModal .color-dot').forEach(el => {
            const bg = el.style.backgroundColor;
            if (bg && bg.toLowerCase() === hexColor.toLowerCase()) {
                el.classList.add('active');
            }
        });
    }
    const picker = document.getElementById('animalCustomColorPicker');
    if (picker && hexColor) {
        try { picker.value = hexColor; } catch (e) {}
    }
    const preview = document.getElementById('activeAnimalColorPreview');
    if (preview) preview.style.backgroundColor = hexColor;
}

function handleCustomAnimalColorPick(hexColor) {
    const pickerLabel = document.getElementById('customAnimalColorPickerLabel');
    selectAnimalColor(hexColor, pickerLabel);
}

function updateAnimalHabitatUI(habitat) {
    selectedAnimalHabitat = habitat;
    const habitats = ['land', 'flying', 'water'];
    habitats.forEach(h => {
        const card = document.getElementById('animalHabitatCard-' + h);
        if (card) {
            if (h === habitat) {
                card.className = 'relative flex items-center gap-2 p-2 rounded-xl border-2 border-[#2B5B35] bg-emerald-50/70 cursor-pointer transition shadow-2xs hover:border-[#2B5B35]';
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            } else {
                card.className = 'relative flex items-center gap-2 p-2 rounded-xl border-2 border-gray-200 bg-white cursor-pointer transition shadow-2xs hover:border-[#2B5B35]';
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            }
        }
    });
    updateAnimalInfoPillText();
}

function toggleAnimalConfigModal() {
    const modal = document.getElementById('animalConfigModal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        updateAnimalInfoPillText();
    }
}

function updateAnimalInfoPillText() {
    const txt = document.getElementById('animalInfoPillText');
    const nameInput = document.getElementById('customAnimalNameInput');
    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Pupu';
    const habitat = selectedAnimalHabitat || 'land';
    const habitatMap = { land: 'Darat', flying: 'Terbang', water: 'Air' };
    if (txt) txt.textContent = `${name} (${habitatMap[habitat] || 'Darat'})`;
}

function undoAnimalStroke() {
    if (animalStudioStrokes.length === 0) return;
    const last = animalStudioStrokes.pop();
    animalStudioRedoStack.push(last);
    redrawAnimalPadFromStrokes();
    if (typeof playPencilSound === 'function') playPencilSound();
}

function redoAnimalStroke() {
    if (animalStudioRedoStack.length === 0) return;
    const next = animalStudioRedoStack.pop();
    animalStudioStrokes.push(next);
    redrawAnimalPadFromStrokes();
    if (typeof playPencilSound === 'function') playPencilSound();
}

function redrawAnimalPadFromStrokes() {
    if (!animalPadCanvas || !animalPadCtx) return;
    animalPadCtx.clearRect(0, 0, animalPadCanvas.width, animalPadCanvas.height);
    const hint = document.getElementById('drawAnimalBoxHint');
    if (hint) {
        hint.style.opacity = animalStudioStrokes.length === 0 ? '0.4' : '0';
    }
    for (const stroke of animalStudioStrokes) {
        if (!stroke.points || stroke.points.length === 0) continue;
        animalPadCtx.save();
        animalPadCtx.beginPath();
        animalPadCtx.lineCap = 'round';
        animalPadCtx.lineJoin = 'round';
        animalPadCtx.lineWidth = stroke.size;
        if (stroke.tool === 'eraser') {
            animalPadCtx.globalCompositeOperation = 'destination-out';
            animalPadCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            animalPadCtx.globalCompositeOperation = 'source-over';
            animalPadCtx.strokeStyle = stroke.color;
        }
        animalPadCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            animalPadCtx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        animalPadCtx.stroke();
        animalPadCtx.restore();
    }
}

function initAnimalStudioEventListeners() {
    if (!animalPadCanvas) return;

    let currentStroke = null;

    function getPos(e) {
        const rect = animalPadCanvas.getBoundingClientRect();
        const scaleX = animalPadCanvas.width / rect.width;
        const scaleY = animalPadCanvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    const animalStudioViewport = document.getElementById('animalStudioViewport');
    if (animalStudioViewport) {
        animalStudioViewport.addEventListener('touchstart', (e) => {
            if (e.touches.length >= 2) {
                cancelAnimalStrokeImmediately();
                suppressAnimalDrawUntilAllUp = true;
                isTwoFingerTransformingAnimal = true;
                isAnimalPanning = false;

                const t1 = e.touches[0];
                const t2 = e.touches[1];
                animalGestureInitialDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                animalGestureInitialZoom = animalZoom;
                animalGestureInitialMidX = (t1.clientX + t2.clientX) / 2;
                animalGestureInitialMidY = (t1.clientY + t2.clientY) / 2;
                animalGestureInitialPanX = animalPanX;
                animalGestureInitialPanY = animalPanY;
            } else if (e.touches.length === 1) {
                if (suppressAnimalDrawUntilAllUp) return;
                const isOutside = (e.target !== animalPadCanvas);
                if (isAnimalPanMode || isOutside) {
                    isAnimalPanning = true;
                    animalPanStartX = e.touches[0].clientX - animalPanX;
                    animalPanStartY = e.touches[0].clientY - animalPanY;
                }
            }
        }, { passive: false });

        animalStudioViewport.addEventListener('touchmove', (e) => {
            if (e.touches.length >= 2 && isTwoFingerTransformingAnimal && animalGestureInitialDist > 0) {
                e.preventDefault();
                const t1 = e.touches[0];
                const t2 = e.touches[1];
                const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
                const currentMidX = (t1.clientX + t2.clientX) / 2;
                const currentMidY = (t1.clientY + t2.clientY) / 2;

                const scale = currentDist / animalGestureInitialDist;
                animalZoom = Math.min(3.0, Math.max(0.75, Math.round(animalGestureInitialZoom * scale * 100) / 100));

                const deltaX = currentMidX - animalGestureInitialMidX;
                const deltaY = currentMidY - animalGestureInitialMidY;

                const maxPan = Math.max(350, 420 * animalZoom);
                animalPanX = Math.max(-maxPan, Math.min(maxPan, animalGestureInitialPanX + deltaX));
                animalPanY = Math.max(-maxPan, Math.min(maxPan, animalGestureInitialPanY + deltaY));

                applyAnimalTransform(true);
            } else if (e.touches.length === 1 && isAnimalPanning) {
                e.preventDefault();
                const maxPan = Math.max(350, 420 * animalZoom);
                animalPanX = Math.max(-maxPan, Math.min(maxPan, e.touches[0].clientX - animalPanStartX));
                animalPanY = Math.max(-maxPan, Math.min(maxPan, e.touches[0].clientY - animalPanStartY));
                applyAnimalTransform(true);
            }
        }, { passive: false });

        const endAnimalTouch = (e) => {
            if (e.touches.length < 2) {
                isTwoFingerTransformingAnimal = false;
            }
            if (e.touches.length === 0) {
                suppressAnimalDrawUntilAllUp = false;
                isAnimalPanning = false;
                activeAnimalTouchPointers.clear();
            }
        };
        animalStudioViewport.addEventListener('touchend', endAnimalTouch);
        animalStudioViewport.addEventListener('touchcancel', endAnimalTouch);

        animalStudioViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.2 : -0.2;
            zoomAnimalCanvas(delta);
        }, { passive: false });

        animalStudioViewport.addEventListener('pointerdown', (e) => {
            if (e.target !== animalPadCanvas) {
                isAnimalPanning = true;
                animalPanStartX = e.clientX - animalPanX;
                animalPanStartY = e.clientY - animalPanY;
            }
        });
    }

    animalPadCanvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') {
            activeAnimalTouchPointers.add(e.pointerId);
            if (activeAnimalTouchPointers.size >= 2 || suppressAnimalDrawUntilAllUp || !e.isPrimary) {
                cancelAnimalStrokeImmediately();
                suppressAnimalDrawUntilAllUp = true;
                return;
            }
        }

        if (suppressAnimalDrawUntilAllUp) return;

        if (isAnimalPanMode || e.button === 1 || e.shiftKey) {
            isAnimalPanning = true;
            animalPanStartX = e.clientX - animalPanX;
            animalPanStartY = e.clientY - animalPanY;
            if (animalPadCanvas) animalPadCanvas.style.cursor = 'grabbing';
            return;
        }

        if (e.button !== 0 && e.pointerType === 'mouse') return;

        const pos = getPos(e);

        if (animalStudioTool === 'eyedropper') {
            const pixel = animalPadCtx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
            if (pixel[3] > 10) {
                const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
                selectAnimalColor(hex);
                if (typeof showGardenNotice === 'function') showGardenNotice(`Warna disalin: ${hex}`);
            }
            return;
        }

        const hint = document.getElementById('drawAnimalBoxHint');
        if (hint) hint.style.opacity = '0';

        isDrawingAnimalStudio = true;
        document.getElementById('animalStudioModal')?.classList.add('drawing-active');
        currentStroke = {
            tool: animalStudioTool,
            color: animalStudioCurrentColor,
            size: animalStudioBrushSize,
            points: [pos]
        };

        animalPadCtx.save();
        animalPadCtx.beginPath();
        animalPadCtx.lineCap = 'round';
        animalPadCtx.lineJoin = 'round';
        animalPadCtx.lineWidth = animalStudioBrushSize;
        if (animalStudioTool === 'eraser') {
            animalPadCtx.globalCompositeOperation = 'destination-out';
            animalPadCtx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            animalPadCtx.globalCompositeOperation = 'source-over';
            animalPadCtx.strokeStyle = animalStudioCurrentColor;
        }
        animalPadCtx.moveTo(pos.x, pos.y);
    });

    window.addEventListener('pointermove', (e) => {
        if (isAnimalPanning) {
            animalPanX = e.clientX - animalPanStartX;
            animalPanY = e.clientY - animalPanStartY;
            const maxPan = Math.max(350, 420 * animalZoom);
            animalPanX = Math.max(-maxPan, Math.min(maxPan, animalPanX));
            animalPanY = Math.max(-maxPan, Math.min(maxPan, animalPanY));
            applyAnimalTransform(true);
            return;
        }

        if (!isDrawingAnimalStudio || !currentStroke || suppressAnimalDrawUntilAllUp || isTwoFingerTransformingAnimal) return;
        const pos = getPos(e);
        currentStroke.points.push(pos);
        animalPadCtx.lineTo(pos.x, pos.y);
        animalPadCtx.stroke();
    });

    function endDrawing(e) {
        if (e && e.pointerType === 'touch') {
            activeAnimalTouchPointers.delete(e.pointerId);
            if (activeAnimalTouchPointers.size === 0) {
                suppressAnimalDrawUntilAllUp = false;
            }
        }
        if (isAnimalPanning) {
            isAnimalPanning = false;
            if (animalPadCanvas) animalPadCanvas.style.cursor = isAnimalPanMode ? 'grab' : 'crosshair';
        }
        if (!isDrawingAnimalStudio) return;
        isDrawingAnimalStudio = false;
        document.getElementById('animalStudioModal')?.classList.remove('drawing-active');
        if (currentStroke && currentStroke.points.length > 0) {
            animalStudioStrokes.push(currentStroke);
            animalStudioRedoStack = [];
            currentStroke = null;
        }
        try { animalPadCtx.restore(); } catch (err) {}
    }

    window.addEventListener('pointerup', endDrawing);
    window.addEventListener('pointercancel', endDrawing);
}

/**
 * Memotong bounding-box gambar hewan custom agar rapi dan proporsional
 */
function extractTrimmedAnimalCanvas() {
    if (!animalPadCanvas || !animalPadCtx) return null;
    const w = animalPadCanvas.width;
    const h = animalPadCanvas.height;
    const imgData = animalPadCtx.getImageData(0, 0, w, h).data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const alpha = imgData[(y * w + x) * 4 + 3];
            if (alpha > 12) {
                hasPixels = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (!hasPixels) return null;

    const pad = 6;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);

    const cropW = Math.max(16, maxX - minX);
    const cropH = Math.max(16, maxY - minY);

    const trimmed = document.createElement('canvas');
    trimmed.width = cropW;
    trimmed.height = cropH;
    const tCtx = trimmed.getContext('2d');
    tCtx.drawImage(animalPadCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    return trimmed;
}

/**
 * Menyimpan hewan custom hasil gambar dan langsung melepaskannya ke kebun!
 */
async function finishDrawingAndSpawnAnimal() {
    const trimmed = extractTrimmedAnimalCanvas();
    if (!trimmed) {
        if (typeof cuteAlert === 'function') {
            await cuteAlert('Gambarlah tubuh atau bentuk hewanmu terlebih dahulu sebelum melepaskannya!', 'Kanvas Kosong', '🎨');
        } else {
            alert('Gambarlah hewanmu terlebih dahulu!');
        }
        return;
    }

    const nameInput = document.getElementById('customAnimalNameInput');
    const soundSelect = document.getElementById('customAnimalSoundSelect');
    const animalName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Hewan Ajaib';
    const animalSound = (soundSelect && soundSelect.value) ? soundSelect.value : 'chime';
    const habitat = selectedAnimalHabitat || 'land';

    const spriteDataUrl = trimmed.toDataURL('image/png');

    // Spawn animal into the world with chosen habitat
    const customAnimal = spawnCustomAnimalInstance({
        name: animalName,
        spriteDataUrl: spriteDataUrl,
        sound: animalSound,
        habitat: habitat,
        width: Math.min(68, Math.max(34, trimmed.width * 0.45)),
        height: Math.min(68, Math.max(34, trimmed.height * 0.45))
    });

    if (!customAnimal) {
        // Warning was already shown by spawnCustomAnimalInstance
        return;
    }

    // Also save custom animal into favorite gallery
    if (typeof galleryAnimals !== 'undefined' && Array.isArray(galleryAnimals)) {
        galleryAnimals.unshift({
            id: 'fav_custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name: animalName,
            type: 'custom',
            variant: 'custom',
            habitat: habitat,
            sound: animalSound,
            spriteDataUrl: spriteDataUrl,
            createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        });
        if (typeof saveGalleryAnimalsToStorage === 'function') saveGalleryAnimalsToStorage();
        if (typeof updateGalleryBadge === 'function') updateGalleryBadge();
    }

    closeAnimalStudioModal();
    if (typeof incrementStat === 'function') {
        incrementStat('customCreations', 1);
    }
    if (typeof showGardenNotice === 'function') {
        const habitatLabel = habitat === 'water' ? 'air' : (habitat === 'flying' ? 'terbang' : 'darat');
        showGardenNotice(`Hewan ${habitatLabel} ciptaanmu "${animalName}" telah dilepas ke kebun!`);
    }

    // Play appropriate sound
    if (animalSound === 'cat' && typeof playCatMeowSound === 'function') playCatMeowSound();
    else if (animalSound === 'dog' && typeof playDogBarkSound === 'function') playDogBarkSound();
    else if (animalSound === 'rabbit' && typeof playRabbitSound === 'function') playRabbitSound();
    else if (animalSound === 'butterfly' && typeof playButterflySound === 'function') playButterflySound();
    else if (animalSound === 'fish' && typeof playFishSound === 'function') playFishSound();
    else if (typeof playChimeSound === 'function') playChimeSound();

    if (typeof startFollowingAnimal === 'function') {
        startFollowingAnimal(customAnimal);
    }
}

// Global function bindings on window
window.initAnimalStudioCanvas = initAnimalStudioCanvas;
window.openAnimalStudioModal = openAnimalStudioModal;
window.closeAnimalStudioModal = closeAnimalStudioModal;
window.clearAnimalPad = clearAnimalPad;
window.setAnimalStudioTool = setAnimalStudioTool;
window.setAnimalBrushSize = setAnimalBrushSize;
window.setAnimalBrushSizeFromSlider = setAnimalBrushSizeFromSlider;
window.selectAnimalColor = selectAnimalColor;
window.handleCustomAnimalColorPick = handleCustomAnimalColorPick;
window.updateAnimalHabitatUI = updateAnimalHabitatUI;
window.setAnimalStudioHabitat = updateAnimalHabitatUI;
window.undoAnimalStroke = undoAnimalStroke;
window.redoAnimalStroke = redoAnimalStroke;
window.extractTrimmedAnimalCanvas = extractTrimmedAnimalCanvas;
window.finishDrawingAndSpawnAnimal = finishDrawingAndSpawnAnimal;
window.zoomAnimalCanvas = zoomAnimalCanvas;
window.resetAnimalZoom = resetAnimalZoom;
window.toggleAnimalPanMode = toggleAnimalPanMode;
window.toggleAnimalConfigModal = toggleAnimalConfigModal;
window.updateAnimalInfoPillText = updateAnimalInfoPillText;
