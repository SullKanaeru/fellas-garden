/********************************************************************
 * FELLA'S GARDEN - FLOWER STUDIO (js/studio.js)
 ********************************************************************/

        /********************************************************************
         * 4. FLOWER DRAWING STUDIO ("STUDIO GAMBAR BUNGA")
         ********************************************************************/
        let flowerPadCanvas = document.getElementById('flowerPadCanvas');
        let flowerPadCtx = flowerPadCanvas ? flowerPadCanvas.getContext('2d', { willReadFrequently: true }) : null;

        // Studio Tool State: 'pencil' | 'eraser' | 'eyedropper'
        let studioTool = 'pencil';
        let flowerColor = '#DF5645';
        let flowerBrushSize = 7;
        let isFlowerErasing = false;
        let isDrawingFlower = false;
        let flowerLastX = 0;
        let flowerLastY = 0;
        let flowerHistory = [];
        let flowerRedoHistory = [];

        // ==========================================
        // FLOWER STUDIO ZOOM & PAN STATE
        // ==========================================
        let flowerZoom = 1.0;
        let flowerPanX = 0;
        let flowerPanY = 0;
        let isStudioPanMode = false;
        let isStudioPanning = false;
        let panStartX = 0;
        let panStartY = 0;

        function applyFlowerTransform() {
            if (!flowerPadCanvas) return;
            flowerPadCanvas.style.transformOrigin = 'center center';
            flowerPadCanvas.style.transform = `translate(${flowerPanX}px, ${flowerPanY}px) scale(${flowerZoom})`;
            const txt = document.getElementById('flowerZoomLevelText');
            if (txt) txt.textContent = `${Math.round(flowerZoom * 100)}%`;
        }

        function zoomFlowerCanvas(delta) {
            const next = Math.min(3.0, Math.max(0.75, Math.round((flowerZoom + delta) * 100) / 100));
            flowerZoom = next;
            if (flowerZoom === 1.0) {
                flowerPanX = 0;
                flowerPanY = 0;
            }
            applyFlowerTransform();
        }

        function resetFlowerZoom() {
            flowerZoom = 1.0;
            flowerPanX = 0;
            flowerPanY = 0;
            isStudioPanMode = false;
            updatePanButtonUI();
            applyFlowerTransform();
        }

        function toggleStudioPanMode() {
            isStudioPanMode = !isStudioPanMode;
            updatePanButtonUI();
        }

        function updatePanButtonUI() {
            const panBtn = document.getElementById('studioPanToggleBtn');
            if (!panBtn) return;
            if (isStudioPanMode) {
                panBtn.className = 'w-6 h-6 flex items-center justify-center rounded-full bg-[#2B5B35] text-white shadow-sm ring-2 ring-[#7DB852] transition active:scale-90';
                if (flowerPadCanvas) flowerPadCanvas.style.cursor = 'grab';
            } else {
                panBtn.className = 'w-6 h-6 flex items-center justify-center rounded-full hover:bg-emerald-100 text-gray-700 transition active:scale-90';
                if (flowerPadCanvas) {
                    flowerPadCanvas.style.cursor = (studioTool === 'eyedropper') ? 'crosshair' : (studioTool === 'eraser' ? 'cell' : 'crosshair');
                }
            }
        }

        function setStudioTool(tool) {
            studioTool = tool;
            isFlowerErasing = (tool === 'eraser');
            isStudioPanMode = false;
            updatePanButtonUI();

            const pencilBtn = document.getElementById('studioToolPencil') || document.getElementById('brushTypeBtn-pencil');
            const eraserBtn = document.getElementById('studioToolEraser');
            const eyedropBtn = document.getElementById('studioToolEyedrop');

            if (tool === 'eraser' || tool === 'eyedropper') {
                const types = ['pencil', 'watercolor', 'crayon', 'glow'];
                types.forEach(t => {
                    const b = document.getElementById('brushTypeBtn-' + t);
                    if (b) {
                        b.classList.remove('bg-[#2B5B35]', 'text-white', 'ring-2', 'ring-[#7DB852]');
                        b.classList.add('bg-white/80', 'text-[#2B5B35]');
                    }
                });
            } else if (tool === 'pencil') {
                const bType = window.studioBrushType || 'pencil';
                const b = document.getElementById('brushTypeBtn-' + bType);
                if (b) {
                    b.classList.add('bg-[#2B5B35]', 'text-white', 'ring-2', 'ring-[#7DB852]');
                    b.classList.remove('bg-white/80', 'text-[#2B5B35]');
                }
            }

            if (eraserBtn) {
                if (tool === 'eraser') {
                    eraserBtn.className = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition bg-[#2B5B35] text-white shadow-xs ring-2 ring-[#7DB852] cursor-pointer';
                } else {
                    eraserBtn.className = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition hover:bg-[#eef5e6] text-gray-700 cursor-pointer';
                }
            }
            if (eyedropBtn) {
                if (tool === 'eyedropper') {
                    eyedropBtn.className = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition bg-[#2B5B35] text-white shadow-xs ring-2 ring-[#7DB852] cursor-pointer';
                } else {
                    eyedropBtn.className = 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition hover:bg-[#eef5e6] text-gray-700 cursor-pointer';
                }
            }

            if (tool === 'eyedropper') {
                flowerPadCanvas.style.cursor = 'crosshair';
            } else if (tool === 'eraser') {
                flowerPadCanvas.style.cursor = 'cell';
            } else {
                flowerPadCanvas.style.cursor = 'crosshair';
            }
        }

        function pickColorFromPad(pos) {
            const x = Math.floor(pos.x);
            const y = Math.floor(pos.y);
            if (x < 0 || y < 0 || x >= flowerPadCanvas.width || y >= flowerPadCanvas.height) return;

            const pixel = flowerPadCtx.getImageData(x, y, 1, 1).data;
            if (pixel[3] > 18) {
                const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
                selectFlowerColor(hex);
                showGardenNotice(`Warna disalin: ${hex}`);
                playWaterSound();
                setStudioTool('pencil');
            } else {
                showGardenNotice('Klik pada goresan bunga untuk menyalin warna');
            }
        }

        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const h = x.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('').toUpperCase();
        }

        function saveFlowerPadState() {
            if (flowerHistory.length >= 25) flowerHistory.shift();
            flowerHistory.push(flowerPadCtx.getImageData(0, 0, flowerPadCanvas.width, flowerPadCanvas.height));
            flowerRedoHistory = [];
        }

        function undoFlowerStroke() {
            if (flowerHistory.length > 0) {
                flowerRedoHistory.push(flowerPadCtx.getImageData(0, 0, flowerPadCanvas.width, flowerPadCanvas.height));
                const prev = flowerHistory.pop();
                flowerPadCtx.putImageData(prev, 0, 0);
                updatePendingSpriteFromPad();
                playPencilSound();
            }
        }

        function redoFlowerStroke() {
            if (flowerRedoHistory.length > 0) {
                flowerHistory.push(flowerPadCtx.getImageData(0, 0, flowerPadCanvas.width, flowerPadCanvas.height));
                const next = flowerRedoHistory.pop();
                flowerPadCtx.putImageData(next, 0, 0);
                updatePendingSpriteFromPad();
                playPencilSound();
            }
        }

        function clearFlowerPad() {
            if (!flowerPadCanvas) {
                flowerPadCanvas = document.getElementById('flowerPadCanvas');
                if (flowerPadCanvas) flowerPadCtx = flowerPadCanvas.getContext('2d', { willReadFrequently: true });
            }
            if (!flowerPadCanvas || !flowerPadCtx) return;
            saveFlowerPadState();
            flowerPadCtx.clearRect(0, 0, flowerPadCanvas.width, flowerPadCanvas.height);
            if (typeof resetPadPainterMetadata === 'function') resetPadPainterMetadata();
            const hint = document.getElementById('drawBoxHint');
            if (hint) hint.style.opacity = '0.4';
            pendingFlowerSprite = null;
            updateDraftBadge();
        }

        function selectFlowerColor(hexColor, btnEl) {
            flowerColor = hexColor;
            setStudioTool('pencil');
            document.querySelectorAll('.color-dot').forEach(el => el.classList.remove('active'));
            if (btnEl) {
                btnEl.classList.add('active');
            } else {
                // Find matching preset dot if any
                document.querySelectorAll('.color-dot').forEach(el => {
                    const bg = el.style.backgroundColor;
                    if (bg && bg.toLowerCase() === hexColor.toLowerCase()) {
                        el.classList.add('active');
                    }
                });
            }
            const customInput = document.getElementById('flowerCustomColorPicker');
            if (customInput && hexColor) {
                try { customInput.value = hexColor; } catch(e){}
            }
            const preview = document.getElementById('activeColorPreview');
            if (preview) preview.style.backgroundColor = hexColor;
        }

        function handleCustomColorPick(hexColor) {
            const pickerLabel = document.getElementById('customColorPickerLabel');
            selectFlowerColor(hexColor, pickerLabel);
        }

        function setFlowerBrushSize(size, btnEl) {
            flowerBrushSize = parseInt(size, 10);
            const slider = document.getElementById('flowerBrushSlider');
            if (slider) slider.value = flowerBrushSize;
            const txt = document.getElementById('flowerBrushValText');
            if (txt) txt.textContent = flowerBrushSize + 'px';
            document.querySelectorAll('.flower-size-btn').forEach(el => {
                el.classList.remove('bg-emerald-100', 'ring-1', 'ring-emerald-700');
            });
            if (btnEl) {
                btnEl.classList.add('bg-emerald-100', 'ring-1', 'ring-emerald-700');
            }
        }

        function setFlowerBrushSizeFromSlider(val) {
            flowerBrushSize = parseInt(val, 10);
            const txt = document.getElementById('flowerBrushValText');
            if (txt) txt.textContent = flowerBrushSize + 'px';
            document.querySelectorAll('.flower-size-btn').forEach(el => {
                el.classList.remove('bg-emerald-100', 'ring-1', 'ring-emerald-700');
            });
        }

        function playPencilSound() {
            try {
                if (!audioInitialized || typeof Tone === 'undefined') return;
                const synth = new Tone.Synth({
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.005, decay: 0.05, sustain: 0.0, release: 0.05 }
                }).toDestination();
                synth.volume.value = -18;
                synth.triggerAttackRelease('A5', '32n');
            } catch(e){}
        }

        // Quick inspiration stamp if user clicks ✨ button inside modal
        let templateIndex = 0;
        function stampStarterFlower() {
            saveFlowerPadState();
            flowerPadCtx.clearRect(0, 0, flowerPadCanvas.width, flowerPadCanvas.height);
            const hint = document.getElementById('drawBoxHint');
            if (hint) hint.style.opacity = '0';

            const presets = [
                { petalColor: '#EDA4BD', centerColor: '#F7CE68', innerDotColor: '#DF5645', stemColor: '#3A6A37', type: 'tulip', scale: 2.3 },
                { petalColor: '#DF5645', centerColor: '#F7CE68', innerDotColor: '#F29B4B', stemColor: '#3A6A37', type: 'poppy', scale: 2.3 },
                { petalColor: '#F29B4B', centerColor: '#DF5645', innerDotColor: '#F7CE68', stemColor: '#3A6A37', type: 'daisy', scale: 2.2 },
                { petalColor: '#84B4E8', centerColor: '#F7CE68', innerDotColor: '#FFFFFF', stemColor: '#3A6A37', type: 'cluster', scale: 2.3 },
                { petalColor: '#F7CE68', centerColor: '#F29B4B', innerDotColor: '#DF5645', stemColor: '#3A6A37', type: 'rosebud', scale: 2.3 }
            ];
            const preset = presets[templateIndex % presets.length];
            templateIndex++;

            drawProceduralFlowerOnCtx(flowerPadCtx, flowerPadCanvas.width * 0.5, flowerPadCanvas.height * 0.48, preset);
            updatePendingSpriteFromPad();
            updateDraftBadge();
            playPlantSound();
        }

        // Pointer events for the High-Resolution Flower Drawing Pad
        function getPadCoords(e) {
            const rect = flowerPadCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (flowerPadCanvas.width / rect.width),
                y: (clientY - rect.top) * (flowerPadCanvas.height / rect.height)
            };
        }

        flowerPadCanvas.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            initAudio();

            // Panning trigger: either Pan Mode active, middle mouse button, or Shift key
            if (isStudioPanMode || e.button === 1 || e.shiftKey) {
                isStudioPanning = true;
                panStartX = e.clientX - flowerPanX;
                panStartY = e.clientY - flowerPanY;
                if (flowerPadCanvas) flowerPadCanvas.style.cursor = 'grabbing';
                return;
            }

            const pos = getPadCoords(e);

            if (studioTool === 'eyedropper') {
                pickColorFromPad(pos);
                return;
            }

            saveFlowerPadState();
            isDrawingFlower = true;
            document.getElementById('flowerStudioModal')?.classList.add('drawing-active');
            const hint = document.getElementById('drawBoxHint');
            if (hint) hint.style.opacity = '0';
            flowerLastX = pos.x;
            flowerLastY = pos.y;

            const bType = window.studioBrushType || 'pencil';
            if (typeof startRecordingStroke === 'function') {
                startRecordingStroke(pos, studioTool, bType, flowerColor, flowerBrushSize);
            }
            if (typeof renderBrushDownOnCtx === 'function') {
                renderBrushDownOnCtx(flowerPadCtx, pos, studioTool, bType, flowerColor, flowerBrushSize);
            } else {
                flowerPadCtx.save();
                flowerPadCtx.globalCompositeOperation = (studioTool === 'eraser') ? 'destination-out' : 'source-over';
                flowerPadCtx.fillStyle = flowerColor;
                flowerPadCtx.beginPath();
                const rad = (studioTool === 'eraser') ? (flowerBrushSize * 1.8) / 2 : flowerBrushSize / 2;
                flowerPadCtx.arc(pos.x, pos.y, Math.max(1, rad), 0, Math.PI * 2);
                flowerPadCtx.fill();
                flowerPadCtx.restore();
            }
        });

        flowerPadCanvas.addEventListener('pointermove', (e) => {
            if (isStudioPanning) {
                flowerPanX = e.clientX - panStartX;
                flowerPanY = e.clientY - panStartY;
                const maxPan = 260 * flowerZoom;
                flowerPanX = Math.max(-maxPan, Math.min(maxPan, flowerPanX));
                flowerPanY = Math.max(-maxPan, Math.min(maxPan, flowerPanY));
                applyFlowerTransform();
                return;
            }

            if (!isDrawingFlower) return;
            e.stopPropagation();
            const pos = getPadCoords(e);

            const bType = window.studioBrushType || 'pencil';
            if (typeof appendRecordingStrokePoint === 'function') {
                appendRecordingStrokePoint(pos);
            }
            if (typeof renderBrushMoveOnCtx === 'function') {
                renderBrushMoveOnCtx(flowerPadCtx, { x: flowerLastX, y: flowerLastY }, pos, studioTool, bType, flowerColor, flowerBrushSize);
            } else {
                flowerPadCtx.save();
                flowerPadCtx.globalCompositeOperation = (studioTool === 'eraser') ? 'destination-out' : 'source-over';
                flowerPadCtx.strokeStyle = flowerColor;
                flowerPadCtx.lineWidth = (studioTool === 'eraser') ? flowerBrushSize * 1.8 : flowerBrushSize;
                flowerPadCtx.lineCap = 'round';
                flowerPadCtx.lineJoin = 'round';

                flowerPadCtx.beginPath();
                flowerPadCtx.moveTo(flowerLastX, flowerLastY);
                flowerPadCtx.lineTo(pos.x, pos.y);
                flowerPadCtx.stroke();
                flowerPadCtx.restore();
            }

            flowerLastX = pos.x;
            flowerLastY = pos.y;
        });

        window.addEventListener('pointerup', () => {
            if (isStudioPanning) {
                isStudioPanning = false;
                if (flowerPadCanvas) flowerPadCanvas.style.cursor = isStudioPanMode ? 'grab' : 'crosshair';
            }
            if (isDrawingFlower) {
                isDrawingFlower = false;
                document.getElementById('flowerStudioModal')?.classList.remove('drawing-active');
                if (typeof endRecordingStroke === 'function') endRecordingStroke();
                updatePendingSpriteFromPad();
                updateDraftBadge();
            }
        });

        window.addEventListener('pointercancel', () => {
            isDrawingFlower = false;
            isStudioPanning = false;
            document.getElementById('flowerStudioModal')?.classList.remove('drawing-active');
        });

        // Wheel Zoom on Canvas
        flowerPadCanvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY < 0 ? 0.2 : -0.2;
            zoomFlowerCanvas(delta);
        }, { passive: false });

        // Touch Pinch Zoom on Canvas
        let flowerPinchDist = 0;
        let flowerPinchStartZoom = 1.0;
        flowerPadCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isDrawingFlower = false;
                isStudioPanning = false;
                flowerPinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                flowerPinchStartZoom = flowerZoom;
            }
        }, { passive: true });

        flowerPadCanvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && flowerPinchDist > 0) {
                e.preventDefault();
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const scale = dist / flowerPinchDist;
                flowerZoom = Math.min(3.0, Math.max(0.75, Math.round(flowerPinchStartZoom * scale * 100) / 100));
                applyFlowerTransform();
            }
        }, { passive: false });

        /**
         * Crops the non-empty bounding box of the user's flower drawing on flowerPadCanvas
         * so it plants cleanly centered at the bottom of its stem.
         */
        function extractTrimmedFlowerCanvas() {
            const w = flowerPadCanvas.width;
            const h = flowerPadCanvas.height;
            const imgData = flowerPadCtx.getImageData(0, 0, w, h).data;

            let minX = w, minY = h, maxX = 0, maxY = 0;
            let foundPixel = false;

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const alpha = imgData[(y * w + x) * 4 + 3];
                    if (alpha > 15) {
                        foundPixel = true;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (!foundPixel) return null;

            const pad = 8;
            minX = Math.max(0, minX - pad);
            minY = Math.max(0, minY - pad);
            maxX = Math.min(w - 1, maxX + pad);
            maxY = Math.min(h - 1, maxY + pad);

            const cropW = Math.max(24, maxX - minX + 1);
            const cropH = Math.max(24, maxY - minY + 1);

            const cropped = document.createElement('canvas');
            cropped.width = cropW;
            cropped.height = cropH;
            cropped.getContext('2d').drawImage(
                flowerPadCanvas,
                minX, minY, cropW, cropH,
                0, 0, cropW, cropH
            );

            return cropped;
        }

        function updatePendingSpriteFromPad() {
            const trimmed = extractTrimmedFlowerCanvas();
            if (trimmed) {
                pendingFlowerSprite = trimmed;
            }
        }

        function updateDraftBadge() {
            const badge = document.getElementById('hasDraftBadge');
            if (badge) {
                const trimmed = extractTrimmedFlowerCanvas();
                if (trimmed) badge.classList.remove('hidden');
                else badge.classList.add('hidden');
            }
        }

        /**
         * Modal Studio Open / Close and Planting actions
         */
        function openFlowerStudioModal() {
            const modal = document.getElementById('flowerStudioModal');
            if (modal) modal.classList.remove('hidden');
            resetFlowerZoom();
            if (typeof renderStudioPainterBanner === 'function') renderStudioPainterBanner();
            const trimmed = extractTrimmedFlowerCanvas();
            const hint = document.getElementById('drawBoxHint');
            if (hint) {
                hint.style.opacity = trimmed ? '0' : '0.4';
            }
        }

        function closeFlowerStudioModal() {
            const modal = document.getElementById('flowerStudioModal');
            if (modal) modal.classList.add('hidden');
            updatePendingSpriteFromPad();
            updateDraftBadge();
        }

        function finishDrawingAndPlant() {
            const trimmed = extractTrimmedFlowerCanvas();
            if (!trimmed) {
                showGardenNotice('Silakan gambar bungamu di kanvas terlebih dahulu!');
                playErrorSound();
                return;
            }
            pendingFlowerSprite = trimmed;
            closeFlowerStudioModal();
            activatePlantingMode();
            showGardenNotice('Klik di atas atau sekitar rumput untuk menanam!');
        }

        function plantDirectlyRandom() {
            if (!pendingFlowerSprite || typeof plantFlowerAt !== 'function') return;
            const cx = (typeof WORLD_W !== 'undefined' ? WORLD_W : 4200) / 2;
            const cy = (typeof WORLD_H !== 'undefined' ? WORLD_H : 3200) / 2;
            let planted = false;
            for (let attempt = 0; attempt < 40; attempt++) {
                const rx = cx + (Math.random() - 0.5) * 420;
                const ry = cy + (Math.random() - 0.5) * 320;
                const onGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(rx, ry) : true;
                const onWater = typeof isPointOnWater === 'function' ? isPointOnWater(rx, ry) : false;
                const nearWater = typeof isNearWater === 'function' ? isNearWater(rx, ry, 24) : false;
                if (onGrass && !onWater && !nearWater) {
                    plantFlowerAt(rx, ry, pendingFlowerSprite);
                    planted = true;
                    break;
                }
            }
            if (!planted) {
                plantFlowerAt(cx, cy, pendingFlowerSprite);
            }
        }

        function finishDrawingAndPlantDirectly() {
            const trimmed = extractTrimmedFlowerCanvas();
            if (!trimmed) {
                showGardenNotice('Silakan gambar bungamu di kanvas terlebih dahulu!');
                playErrorSound();
                return;
            }
            pendingFlowerSprite = trimmed;
            closeFlowerStudioModal();
            plantDirectlyRandom();
        }

        // Global keyboard shortcuts for studio (Undo, Redo, P, E, I, Esc)
        window.addEventListener('keydown', (e) => {
            const modal = document.getElementById('flowerStudioModal');
            const isModalOpen = modal && !modal.classList.contains('hidden');

            if (isModalOpen) {
                if (e.key === 'Escape') {
                    closeFlowerStudioModal();
                    return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redoFlowerStroke();
                    else undoFlowerStroke();
                    return;
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    redoFlowerStroke();
                    return;
                }
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    const k = e.key.toLowerCase();
                    if (k === 'p') setStudioTool('pencil');
                    else if (k === 'e') setStudioTool('eraser');
                    else if (k === 'i') setStudioTool('eyedropper');
                }
            } else {
                if (e.key === 'Escape') {
                    if (currentTool === 'plant') exitPlantingMode();
                    closeGalleryModal();
                    closeSaveToGalleryDialog();
                }
            }
        });

        // Global function bindings on window for robust HTML onclick access
        window.openFlowerStudioModal = openFlowerStudioModal;
        window.closeFlowerStudioModal = closeFlowerStudioModal;
        window.setStudioTool = setStudioTool;
        window.selectFlowerColor = selectFlowerColor;
        window.handleCustomColorPick = handleCustomColorPick;
        window.setFlowerBrushSize = setFlowerBrushSize;
        window.clearFlowerPad = clearFlowerPad;
        window.undoFlowerStroke = undoFlowerStroke;
        window.redoFlowerStroke = redoFlowerStroke;
        window.finishDrawingAndPlant = finishDrawingAndPlant;
        window.finishDrawingAndPlantDirectly = finishDrawingAndPlantDirectly;
        window.stampStarterFlower = stampStarterFlower;
        window.extractTrimmedFlowerCanvas = extractTrimmedFlowerCanvas;
        window.zoomFlowerCanvas = zoomFlowerCanvas;
        window.resetFlowerZoom = resetFlowerZoom;
        window.toggleStudioPanMode = toggleStudioPanMode;
