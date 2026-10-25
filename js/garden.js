/********************************************************************
 * FELLA'S GARDEN - 3D ISLAND ENGINE & GARDEN SIMULATION (js/garden.js)
 ********************************************************************/

        // 3D Grass Island Engine & Viewport (state in js/state.js)

        // High-DPI backing store multiplier for razor-sharp Retina/Mobile rendering
        var canvasDpr = 1.0;

        function initCanvases() {
            if (!worldCanvas && typeof document !== 'undefined') {
                worldCanvas = document.getElementById('worldCanvas');
            }
            if (worldCanvas && !ctx) {
                ctx = worldCanvas.getContext('2d');
            }

            initGardenEventListeners();

            const rect = worldCanvas ? worldCanvas.getBoundingClientRect() : null;
            screenW = Math.max(320, Math.floor(window.innerWidth || (rect && rect.width) || (typeof document !== 'undefined' && document.documentElement.clientWidth) || 800));
            screenH = Math.max(320, Math.floor(window.innerHeight || (rect && rect.height) || (typeof document !== 'undefined' && document.documentElement.clientHeight) || 600));

            // Support high-DPI (Retina / mobile) displays up to 2.25x for crisp HD without GPU lag
            const rawDpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1.0;
            canvasDpr = Math.min(Math.max(1.0, rawDpr), 2.25);

            if (worldCanvas) {
                worldCanvas.width = Math.round(screenW * canvasDpr);
                worldCanvas.height = Math.round(screenH * canvasDpr);
                worldCanvas.style.width = screenW + 'px';
                worldCanvas.style.height = screenH + 'px';
            }

            // Ensure offscreen world canvases match full world dimensions
            if (maskCanvas && (maskCanvas.width !== WORLD_W || maskCanvas.height !== WORLD_H)) {
                maskCanvas.width = WORLD_W;
                maskCanvas.height = WORLD_H;
                terrainLayerCanvas.width = WORLD_W;
                terrainLayerCanvas.height = WORLD_H;
            }
            if (waterMaskCanvas && (waterMaskCanvas.width !== WORLD_W || waterMaskCanvas.height !== WORLD_H)) {
                waterMaskCanvas.width = WORLD_W;
                waterMaskCanvas.height = WORLD_H;
            }

            // On mobile devices (portrait or landscape phone), default to collapsed sidebar so view is clean and clear from the start
            const isMobileDevice = screenW <= 768 || (screenH <= 500 && screenW <= 1024);
            if (isMobileDevice && !isInitialSetupComplete) {
                const sb = document.getElementById('sidebarLaunchers');
                if (sb) sb.classList.add('sidebar-collapsed');
            }

            if (!isInitialSetupComplete) {
                centerGardenView();
            } else {
                clampPan();
            }
        }

        /**
         * Accommodates camera pan allowing virtually boundless exploration
         * so the user can draw anywhere without restrictive barriers.
         */
        function clampPan() {
            const margin = 2400 * zoom;
            const scaledW = WORLD_W * zoom;
            const scaledH = WORLD_H * zoom;

            const minX = screenW - scaledW - margin;
            const maxX = margin;
            panX = Math.max(minX, Math.min(maxX, panX));

            const minY = screenH - scaledH - margin;
            const maxY = margin;
            panY = Math.max(minY, Math.min(maxY, panY));
        }

        /**
         * Re-centers camera view to the middle of the lush oval island,
         * with adaptive zoom for portrait mobile screens and landscape orientations.
         */
        function centerGardenView() {
            const isPortrait = screenH > screenW;
            if (screenW < 640 || isPortrait) {
                // Adaptive framing for mobile phones in portrait mode
                zoom = Math.max(MIN_ZOOM, Math.min(0.70, (screenW * 0.92) / 960));
            } else if (screenW < 960) {
                zoom = 0.85;
            } else {
                zoom = 1.0;
            }
            panX = Math.round((screenW - WORLD_W * zoom) / 2);
            panY = Math.round((screenH - WORLD_H * zoom) / 2);
            clampPan();
            updateZoomDisplay();
        }

        /**
         * Smoothly zooms canvas around a given screen center point
         */
        function zoomBy(factor, centerX = screenW / 2, centerY = screenH / 2) {
            if (typeof stopFollowingAnimal === 'function') {
                stopFollowingAnimal();
            } else if (typeof followedAnimal !== 'undefined' && followedAnimal) {
                followedAnimal = null;
            }

            const worldBefore = screenToWorld(centerX, centerY);
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
            if (Math.abs(newZoom - zoom) < 0.0001) return;

            panX = Math.round(centerX - worldBefore.x * newZoom);
            panY = Math.round(centerY - worldBefore.y * newZoom);
            zoom = newZoom;
            clampPan();
            updateZoomDisplay();
        }

        function zoomIn() {
            if (typeof stopFollowingAnimal === 'function') {
                stopFollowingAnimal();
            } else if (typeof followedAnimal !== 'undefined' && followedAnimal) {
                followedAnimal = null;
            }
            zoomBy(1.22);
        }

        function zoomOut() {
            if (typeof stopFollowingAnimal === 'function') {
                stopFollowingAnimal();
            } else if (typeof followedAnimal !== 'undefined' && followedAnimal) {
                followedAnimal = null;
            }
            zoomBy(1 / 1.22);
        }

        function resetZoom() {
            if (typeof stopFollowingAnimal === 'function') {
                stopFollowingAnimal();
            } else if (typeof followedAnimal !== 'undefined' && followedAnimal) {
                followedAnimal = null;
            }
            zoomBy(1.0 / zoom);
        }

        function updateZoomDisplay() {
            const el = document.getElementById('zoomLevelBadge');
            if (el) {
                el.textContent = `${Math.round(zoom * 100)}%`;
            }
        }

        function screenToWorld(sx, sy) {
            return {
                x: (sx - panX) / zoom,
                y: (sy - panY) / zoom
            };
        }

        function worldToScreen(wx, wy) {
            return {
                x: wx * zoom + panX,
                y: wy * zoom + panY
            };
        }

        /**
         * Draws the lush organic OVAL grass island (replaces previous crescent/banana shape).
         * Soft, natural rounded contours with gentle undulating curves.
         */
        function createDefaultOvalIsland() {
            maskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
            if (waterMaskCtx) waterMaskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
            grassDetails = [];

            const cx = WORLD_W * 0.5;
            const cy = WORLD_H * 0.52;
            const rx = 440;
            const ry = 280;

            maskCtx.save();
            maskCtx.translate(cx, cy);

            // Natural, organic oval shape with gentle harmonic curves
            maskCtx.beginPath();
            const points = 72;
            for (let i = 0; i <= points; i++) {
                const theta = (i / points) * Math.PI * 2;
                // Subtle organic variation (3-4%) for a hand-painted feeling, completely convex rounded oval
                const rWobble = 1 + Math.sin(theta * 3) * 0.035 + Math.cos(theta * 5) * 0.018;
                const px = Math.cos(theta) * rx * rWobble;
                const py = Math.sin(theta) * ry * rWobble;
                if (i === 0) maskCtx.moveTo(px, py);
                else maskCtx.lineTo(px, py);
            }
            maskCtx.closePath();

            maskCtx.fillStyle = '#FFFFFF';
            maskCtx.fill();
            maskCtx.restore();

            // Populate rich painterly grass tufts & clover patches inside the oval island
            populateGrassDetailsAcrossIsland();
            rebuildTerrain3DLayer();
            updateCollisionGrids();
        }

        /**
         * Rebuilds fast in-memory collision buffers for grass and water.
         * Eliminates synchronous getImageData GPU pipeline stalls completely.
         */
        function updateCollisionGrids() {
            if (!collCtx || !maskCanvas) return;
            try {
                // 1. Grass mask to collision grid
                collCtx.clearRect(0, 0, COLL_W, COLL_H);
                collCtx.drawImage(maskCanvas, 0, 0, COLL_W, COLL_H);
                const gData = collCtx.getImageData(0, 0, COLL_W, COLL_H).data;
                const total = COLL_W * COLL_H;
                for (let i = 0; i < total; i++) {
                    grassGrid[i] = gData[i * 4 + 3] > 80 ? 1 : 0;
                }

                // 2. Water mask to collision grid
                if (waterMaskCanvas) {
                    collCtx.clearRect(0, 0, COLL_W, COLL_H);
                    collCtx.drawImage(waterMaskCanvas, 0, 0, COLL_W, COLL_H);
                    const wData = collCtx.getImageData(0, 0, COLL_W, COLL_H).data;
                    for (let i = 0; i < total; i++) {
                        waterGrid[i] = wData[i * 4 + 3] > 60 ? 1 : 0;
                    }
                } else {
                    waterGrid.fill(0);
                }
            } catch (e) {
                console.warn('Collision update error:', e);
            }
        }
        window.updateCollisionGrids = updateCollisionGrids;

        /**
         * Checks whether a given (worldX, worldY) point is directly on the green grass surface
         * Uses 1-nanosecond in-memory TypedArray lookup without touching the GPU!
         */
        function isPointOnGrass(x, y) {
            if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return false;
            const gx = (x / COLL_SCALE) | 0;
            const gy = (y / COLL_SCALE) | 0;
            if (gx < 0 || gy < 0 || gx >= COLL_W || gy >= COLL_H) return false;
            return grassGrid[gy * COLL_W + gx] === 1;
        }
        window.isPointOnGrass = isPointOnGrass;

        /**
         * Checks whether a given (worldX, worldY) point is on water terrain
         * Uses 1-nanosecond in-memory TypedArray lookup without touching the GPU!
         */
        function isPointOnWater(x, y) {
            if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return false;
            const gx = (x / COLL_SCALE) | 0;
            const gy = (y / COLL_SCALE) | 0;
            if (gx < 0 || gy < 0 || gx >= COLL_W || gy >= COLL_H) return false;
            return waterGrid[gy * COLL_W + gx] === 1;
        }
        window.isPointOnWater = isPointOnWater;

        /**
         * Checks whether a given (worldX, worldY) point is on or in the immediate vicinity of water.
         * Pure fast in-memory radius lookup with ZERO getImageData!
         */
        function isNearWater(x, y, maxDist = 24) {
            if (isPointOnWater(x, y)) return true;
            const r = Math.max(1, (maxDist / COLL_SCALE) | 0);
            const gx = (x / COLL_SCALE) | 0;
            const gy = (y / COLL_SCALE) | 0;
            const rSq = r * r;
            for (let dy = -r; dy <= r; dy++) {
                const ny = gy + dy;
                if (ny < 0 || ny >= COLL_H) continue;
                const row = ny * COLL_W;
                for (let dx = -r; dx <= r; dx++) {
                    if (dx * dx + dy * dy > rSq) continue;
                    const nx = gx + dx;
                    if (nx >= 0 && nx < COLL_W) {
                        if (waterGrid[row + nx] === 1) return true;
                    }
                }
            }
            return false;
        }
        window.isNearWater = isNearWater;

        /**
         * Checks whether a given (worldX, worldY) point is on or in the immediate vicinity of grass.
         * Pure fast in-memory radius lookup with ZERO getImageData!
         */
        function isNearGrass(x, y, maxDist = 44) {
            if (isPointOnGrass(x, y)) return true;
            const r = Math.max(1, (maxDist / COLL_SCALE) | 0);
            const gx = (x / COLL_SCALE) | 0;
            const gy = (y / COLL_SCALE) | 0;
            const rSq = r * r;
            for (let dy = -r; dy <= r; dy++) {
                const ny = gy + dy;
                if (ny < 0 || ny >= COLL_H) continue;
                const row = ny * COLL_W;
                for (let dx = -r; dx <= r; dx++) {
                    if (dx * dx + dy * dy > rSq) continue;
                    const nx = gx + dx;
                    if (nx >= 0 && nx < COLL_W) {
                        if (grassGrid[row + nx] === 1) return true;
                    }
                }
            }
            return false;
        }
        window.isNearGrass = isNearGrass;

        /**
         * Floating notice toast for friendly feedback
         */
        function showGardenNotice(msg) {
            let toast = document.getElementById('gardenNoticeToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'gardenNoticeToast';
                toast.className = 'fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 z-40 bg-[#2B5B35] text-[#FDFBF2] px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-2xl border-2 border-[#7DB852] font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 pointer-events-none transition-all duration-300 opacity-0 -translate-y-3 max-w-[90vw] text-center justify-center';
                document.body.appendChild(toast);
            }
            toast.innerHTML = `<svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A7D97B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-13"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z"/></svg><span>${msg}</span>`;
            toast.classList.remove('opacity-0', '-translate-y-3');
            toast.classList.add('opacity-100', 'translate-y-0');
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => {
                toast.classList.remove('opacity-100', 'translate-y-0');
                toast.classList.add('opacity-0', '-translate-y-3');
            }, 2500);
        }

        function playErrorSound() {
            try {
                if (!audioInitialized || typeof Tone === 'undefined') return;
                const synth = new Tone.Synth({
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.01, decay: 0.15, sustain: 0.0, release: 0.1 }
                }).toDestination();
                synth.volume.value = -12;
                synth.triggerAttackRelease('D3', '16n');
            } catch (e) {}
        }

        // ====================================================================
        // MYSTERY EGGS, POLLINATION SEEDS & WILD ANIMAL VISITORS
        // ====================================================================
        var mysteryEgg = null;
        var droppedSeeds = [];
        var wildVisitors = [];
        var wildVisitorTimer = 18;
        var gardenHiddenTimestamp = null;

        function spawnMysteryEgg() {
            if (mysteryEgg) return;
            const minX = Math.max(100, Math.floor(WORLD_W * 0.5 - 380));
            const maxX = Math.min(WORLD_W - 100, Math.floor(WORLD_W * 0.5 + 380));
            const minY = Math.max(100, Math.floor(WORLD_H * 0.52 - 250));
            const maxY = Math.min(WORLD_H - 100, Math.floor(WORLD_H * 0.52 + 250));

            let spawnX = WORLD_W * 0.5;
            let spawnY = WORLD_H * 0.52;
            let found = false;

            for (let attempts = 0; attempts < 35; attempts++) {
                const tx = minX + Math.random() * (maxX - minX);
                const ty = minY + Math.random() * (maxY - minY);
                if (typeof isPointOnGrass === 'function' && isPointOnGrass(tx, ty)) {
                    spawnX = tx;
                    spawnY = ty;
                    found = true;
                    break;
                }
            }
            if (!found) return;

            const candidates = [
                { type: 'cat', variant: 'sakura', name: 'Kucing Sakura' },
                { type: 'dog', variant: 'starry', name: 'Anjing Bintang' },
                { type: 'rabbit', variant: 'sakura_rabbit', name: 'Kelinci Sakura' },
                { type: 'butterfly', variant: 'aurora', name: 'Kupu-kupu Aurora' },
                { type: 'fish', variant: 'golden_dragon', name: 'Ikan Naga Emas' }
            ];
            const pick = candidates[Math.floor(Math.random() * candidates.length)];

            mysteryEgg = {
                id: 'egg_' + Date.now(),
                x: spawnX,
                y: spawnY,
                taps: 0,
                maxTaps: 4,
                wobble: 0,
                wobbleTimer: 0,
                species: pick.type,
                variant: pick.variant,
                animalName: pick.name,
                createdTime: Date.now()
            };

            if (typeof showGardenNotice === 'function') {
                showGardenNotice('✨ Sesuatu berkilau di rumput... Telur misterius muncul! Ketuk atau siram untuk melihat isinya! 🥚');
            }
            if (typeof playChimeSound === 'function') {
                playChimeSound();
            }
        }

        function tapMysteryEgg(fromWater = false) {
            if (!mysteryEgg) return;
            mysteryEgg.taps += fromWater ? 0.6 : 1.0;
            mysteryEgg.wobble = 1.0;
            mysteryEgg.wobbleTimer = 0.45;

            for (let i = 0; i < 6; i++) {
                particles.push({
                    type: 'sparkle',
                    x: mysteryEgg.x + (Math.random() - 0.5) * 20,
                    y: mysteryEgg.y - 15 + (Math.random() - 0.5) * 15,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -1.2 - Math.random() * 1.5,
                    size: 3.5,
                    color: '#FDE047',
                    alpha: 1.0
                });
            }

            if (typeof playClickSound === 'function') {
                playClickSound();
            }

            if (mysteryEgg.taps >= mysteryEgg.maxTaps) {
                hatchMysteryEgg();
            } else {
                const remaining = Math.ceil(mysteryEgg.maxTaps - mysteryEgg.taps);
                particles.push({
                    type: 'floatingText',
                    x: mysteryEgg.x,
                    y: mysteryEgg.y - 30,
                    text: fromWater ? 'Segar! 💧' : `Ketuk lagi! (${remaining})`,
                    color: '#FEF08A',
                    fontSize: 15,
                    alpha: 1.0,
                    decay: 0.8
                });
            }
        }

        function hatchMysteryEgg() {
            if (!mysteryEgg) return;
            const egg = mysteryEgg;
            mysteryEgg = null;

            for (let i = 0; i < 20; i++) {
                const ang = (i / 20) * Math.PI * 2;
                particles.push({
                    type: 'petal',
                    x: egg.x,
                    y: egg.y - 12,
                    vx: Math.cos(ang) * (50 + Math.random() * 60),
                    vy: Math.sin(ang) * (50 + Math.random() * 60) - 20,
                    size: 6,
                    color: ['#F472B6', '#FBBF24', '#60A5FA', '#34D399'][i % 4],
                    rotation: Math.random() * Math.PI,
                    vRot: 4,
                    alpha: 1.0,
                    decay: 0.6
                });
            }

            particles.push({
                type: 'floatingText',
                x: egg.x,
                y: egg.y - 36,
                text: '✨ Menetas! Varian Langka! (+3⭐) ✨',
                color: '#FACC15',
                fontSize: 18,
                alpha: 1.2,
                decay: 0.45
            });

            if (typeof awardStars === 'function') {
                awardStars(3);
            }
            if (typeof playChimeSound === 'function') {
                playChimeSound();
            }

            if (typeof spawnAnimal === 'function') {
                const spawned = spawnAnimal(egg.species, egg.animalName, egg.variant);
                if (spawned && egg.species !== 'fish') {
                    spawned.x = egg.x;
                    spawned.y = egg.y;
                    spawned.targetX = egg.x;
                    spawned.targetY = egg.y;
                }
            }

            if (typeof incrementStat === 'function') {
                incrementStat('animalsPetted', 1);
            }
            if (typeof incrementQuestProgress === 'function') {
                incrementQuestProgress('pet_animals', 1);
            }

            if (typeof showGardenNotice === 'function') {
                showGardenNotice(`🥚 Telur menetas! Kamu menyambut ${egg.animalName} langka ke kebunmu! 🎉 (+3⭐)`);
            }

            if (typeof scheduleAutoSave === 'function') {
                scheduleAutoSave();
            }
        }

        function drawMysteryEgg(targetCtx, egg, now, dt) {
            if (!egg) return;
            targetCtx.save();
            targetCtx.translate(egg.x, egg.y);

            if (egg.wobbleTimer > 0) {
                egg.wobbleTimer -= dt;
                const wAngle = Math.sin(now * 0.035) * 0.3 * (egg.wobbleTimer / 0.45);
                targetCtx.rotate(wAngle);
            }

            // Ground shadow
            targetCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            targetCtx.beginPath();
            targetCtx.ellipse(0, 4, 16, 7, 0, 0, Math.PI * 2);
            targetCtx.fill();

            // Golden glow aura
            const glowPulse = 0.7 + Math.sin(now * 0.005) * 0.3;
            const gradGlow = targetCtx.createRadialGradient(0, -14, 4, 0, -14, 28);
            gradGlow.addColorStop(0, `rgba(253, 224, 71, ${0.45 * glowPulse})`);
            gradGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
            targetCtx.fillStyle = gradGlow;
            targetCtx.beginPath();
            targetCtx.arc(0, -14, 28, 0, Math.PI * 2);
            targetCtx.fill();

            // Egg body
            targetCtx.save();
            targetCtx.beginPath();
            targetCtx.moveTo(0, -32);
            targetCtx.bezierCurveTo(16, -32, 17, -10, 16, 0);
            targetCtx.bezierCurveTo(15, 8, -15, 8, -16, 0);
            targetCtx.bezierCurveTo(-17, -10, -16, -32, 0, -32);
            targetCtx.closePath();

            const eggGrad = targetCtx.createLinearGradient(-12, -30, 12, 4);
            eggGrad.addColorStop(0, '#FEF08A');
            eggGrad.addColorStop(0.5, '#F472B6');
            eggGrad.addColorStop(1, '#A78BFA');
            targetCtx.fillStyle = eggGrad;
            targetCtx.fill();

            targetCtx.strokeStyle = '#6D28D9';
            targetCtx.lineWidth = 1.6;
            targetCtx.stroke();

            // Decorative stars on egg shell
            targetCtx.fillStyle = '#FFFFFF';
            targetCtx.beginPath();
            targetCtx.arc(-4, -12, 2.5, 0, Math.PI * 2);
            targetCtx.arc(5, -18, 2, 0, Math.PI * 2);
            targetCtx.arc(2, -6, 2.8, 0, Math.PI * 2);
            targetCtx.fill();

            // Shiny egg highlight
            targetCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            targetCtx.beginPath();
            targetCtx.ellipse(-5, -20, 3.5, 6.5, -0.4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();

            // Small progress indicators (dots)
            const totalDots = egg.maxTaps;
            const filledDots = Math.floor(egg.taps);
            const startX = -((totalDots - 1) * 7) / 2;
            for (let d = 0; d < totalDots; d++) {
                targetCtx.fillStyle = d < filledDots ? '#FDE047' : 'rgba(255, 255, 255, 0.45)';
                targetCtx.strokeStyle = '#78350F';
                targetCtx.lineWidth = 1;
                targetCtx.beginPath();
                targetCtx.arc(startX + d * 7, -37, 2.8, 0, Math.PI * 2);
                targetCtx.fill();
                targetCtx.stroke();
            }

            targetCtx.restore();
        }

        function spawnDroppedSeedFromPollination(x, y, flowerId) {
            if (!Array.isArray(droppedSeeds)) droppedSeeds = [];
            if (droppedSeeds.length >= 8) return;

            droppedSeeds.push({
                id: 'seed_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                x: x,
                y: y,
                flowerId: flowerId,
                bobTimer: Math.random() * 10,
                createdTime: Date.now()
            });

            for (let i = 0; i < 8; i++) {
                particles.push({
                    type: 'sparkle',
                    x: x + (Math.random() - 0.5) * 16,
                    y: y - 10 + (Math.random() - 0.5) * 16,
                    vx: (Math.random() - 0.5) * 1.8,
                    vy: -1 - Math.random() * 1.2,
                    size: 3.2,
                    color: '#FACC15',
                    alpha: 1.0
                });
            }

            particles.push({
                type: 'floatingText',
                x: x,
                y: y - 24,
                text: '✨ Benih Organik Terjatuh! ✨',
                color: '#FDE047',
                fontSize: 14,
                alpha: 1.0,
                decay: 0.7
            });
        }

        function pickupDroppedSeed(id) {
            if (!Array.isArray(droppedSeeds)) return;
            const idx = droppedSeeds.findIndex(s => s.id === id);
            if (idx === -1) return;
            const seed = droppedSeeds.splice(idx, 1)[0];

            for (let i = 0; i < 10; i++) {
                particles.push({
                    type: 'sparkle',
                    x: seed.x + (Math.random() - 0.5) * 18,
                    y: seed.y - 8 + (Math.random() - 0.5) * 18,
                    vx: (Math.random() - 0.5) * 2.2,
                    vy: -1.2 - Math.random() * 1.5,
                    size: 3.8,
                    color: '#34D399',
                    alpha: 1.0
                });
            }

            particles.push({
                type: 'floatingText',
                x: seed.x,
                y: seed.y - 28,
                text: '+1 Benih Segar (+1⭐)',
                color: '#FACC15',
                fontSize: 16,
                alpha: 1.1,
                decay: 0.6
            });

            if (typeof awardStars === 'function') {
                awardStars(1);
            }
            if (typeof playChimeSound === 'function') {
                playChimeSound();
            }
            if (typeof incrementStat === 'function') {
                incrementStat('seedsHarvested', 1);
            }
            if (typeof incrementQuestProgress === 'function') {
                incrementQuestProgress('pollinate', 1);
            }
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('🌱 Kamu memungut benih organik hasil penyerbukan kupu-kupu! (+1⭐)');
            }
        }

        function drawDroppedSeed(targetCtx, seed, now, dt) {
            if (!seed) return;
            targetCtx.save();
            const bob = Math.sin(now * 0.004 + seed.bobTimer) * 4;
            targetCtx.translate(seed.x, seed.y + bob);

            targetCtx.fillStyle = 'rgba(0, 0, 0, 0.16)';
            targetCtx.beginPath();
            targetCtx.ellipse(0, 4 - bob * 0.5, 10, 4, 0, 0, Math.PI * 2);
            targetCtx.fill();

            const glowPulse = 0.6 + Math.sin(now * 0.006 + seed.bobTimer) * 0.4;
            targetCtx.fillStyle = `rgba(52, 211, 153, ${0.35 * glowPulse})`;
            targetCtx.beginPath();
            targetCtx.arc(0, -6, 14, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#D97706';
            targetCtx.beginPath();
            targetCtx.arc(0, -6, 6.5, 0, Math.PI);
            targetCtx.quadraticCurveTo(6.5, -12, 0, -14);
            targetCtx.quadraticCurveTo(-6.5, -12, -6.5, -6);
            targetCtx.fill();
            targetCtx.strokeStyle = '#78350F';
            targetCtx.lineWidth = 1.2;
            targetCtx.stroke();

            targetCtx.fillStyle = '#4ADE80';
            targetCtx.beginPath();
            targetCtx.ellipse(3, -15, 4.5, 2.2, Math.PI / 4, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#FEF08A';
            targetCtx.beginPath();
            targetCtx.arc(-2, -8, 1.5, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.restore();
        }

        function updateAndDrawWildVisitors(targetCtx, dt, now) {
            wildVisitorTimer -= dt;
            if (wildVisitorTimer <= 0) {
                wildVisitorTimer = 45 + Math.random() * 45;
                if (wildVisitors.length < 2) {
                    spawnWildVisitor();
                }
            }

            for (let i = wildVisitors.length - 1; i >= 0; i--) {
                const v = wildVisitors[i];
                v.timer += dt;

                if (v.type === 'sparrow') {
                    updateWildSparrow(v, dt);
                    drawWildSparrow(targetCtx, v, now);
                } else if (v.type === 'frog') {
                    updateWildFrog(v, dt);
                    drawWildFrog(targetCtx, v, now);
                }

                if (v.state === 'done') {
                    wildVisitors.splice(i, 1);
                }
            }
        }

        function spawnWildVisitor() {
            const isFrog = Math.random() < 0.45;
            if (isFrog) {
                const centerGrassX = WORLD_W * 0.5;
                const centerGrassY = WORLD_H * 0.52;
                wildVisitors.push({
                    id: 'wild_' + Date.now(),
                    type: 'frog',
                    x: centerGrassX + (Math.random() - 0.5) * 360,
                    y: centerGrassY + (Math.random() - 0.5) * 220,
                    vx: 0,
                    vy: 0,
                    hopProgress: 0,
                    state: 'idle',
                    timer: 0,
                    bubbleTimer: 2.5,
                    bubbleText: 'Krok~ 🐸',
                    hopsRemaining: 4
                });
            } else {
                const side = Math.random() < 0.5 ? -1 : 1;
                const startX = WORLD_W * 0.5 + side * 600;
                const landX = WORLD_W * 0.5 + (Math.random() - 0.5) * 400;
                const landY = WORLD_H * 0.52 + (Math.random() - 0.5) * 260;
                wildVisitors.push({
                    id: 'wild_' + Date.now(),
                    type: 'sparrow',
                    x: startX,
                    y: landY - 260,
                    targetX: landX,
                    targetY: landY,
                    startX: startX,
                    startY: landY - 260,
                    flightProgress: 0,
                    state: 'flying_in',
                    timer: 0,
                    facing: side < 0 ? 1 : -1,
                    peckTimer: 0,
                    perchDuration: 8 + Math.random() * 6,
                    bubbleTimer: 0,
                    bubbleText: 'Cuit cuit~ 🎵'
                });
            }
        }

        function updateWildSparrow(v, dt) {
            if (v.state === 'flying_in') {
                v.flightProgress += dt * 0.6;
                v.x = v.startX + (v.targetX - v.startX) * Math.min(1, v.flightProgress);
                v.y = v.startY + (v.targetY - v.startY) * Math.min(1, v.flightProgress);
                if (v.flightProgress >= 1) {
                    v.state = 'perched';
                    v.timer = 0;
                    v.bubbleTimer = 2.5;
                }
            } else if (v.state === 'perched') {
                v.timer += dt;
                v.peckTimer += dt;
                if (v.peckTimer > 1.8) {
                    v.peckTimer = 0;
                    v.isPecking = true;
                    setTimeout(() => { v.isPecking = false; }, 250);
                }
                if (v.timer >= v.perchDuration) {
                    v.state = 'flying_out';
                    v.flightProgress = 0;
                    v.startX = v.x;
                    v.startY = v.y;
                    v.targetX = v.x + (v.facing * 700);
                    v.targetY = v.y - 350;
                }
            } else if (v.state === 'flying_out') {
                v.flightProgress += dt * 0.75;
                v.x = v.startX + (v.targetX - v.startX) * Math.min(1, v.flightProgress);
                v.y = v.startY + (v.targetY - v.startY) * Math.min(1, v.flightProgress);
                if (v.flightProgress >= 1) {
                    v.state = 'done';
                }
            }
        }

        function drawWildSparrow(targetCtx, v, now) {
            targetCtx.save();
            targetCtx.translate(v.x, v.y);
            targetCtx.scale(v.facing, 1);

            if (v.state === 'perched') {
                targetCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                targetCtx.beginPath();
                targetCtx.ellipse(0, 3, 9, 4, 0, 0, Math.PI * 2);
                targetCtx.fill();
            }

            const peckAngle = v.isPecking ? 0.35 : 0;
            targetCtx.rotate(peckAngle);

            const isFlapping = v.state !== 'perched';
            const flap = isFlapping ? Math.sin(now * 0.04) * 0.6 : 0;

            targetCtx.fillStyle = '#8B5A2B';
            targetCtx.beginPath();
            targetCtx.ellipse(0, -6, 9, 6.5, -0.2, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#EEDC82';
            targetCtx.beginPath();
            targetCtx.ellipse(2, -4, 6, 4.5, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#654321';
            targetCtx.beginPath();
            targetCtx.arc(7, -11, 4.5, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#111827';
            targetCtx.beginPath();
            targetCtx.arc(8.5, -12, 1, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#F59E0B';
            targetCtx.beginPath();
            targetCtx.moveTo(11, -12);
            targetCtx.lineTo(15, -10.5);
            targetCtx.lineTo(11, -9.5);
            targetCtx.closePath();
            targetCtx.fill();

            targetCtx.save();
            targetCtx.translate(-2, -8);
            targetCtx.rotate(flap);
            targetCtx.fillStyle = '#5C3817';
            targetCtx.beginPath();
            targetCtx.ellipse(0, 0, 7, 4, -0.4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();

            targetCtx.fillStyle = '#4A2E12';
            targetCtx.beginPath();
            targetCtx.moveTo(-7, -7);
            targetCtx.lineTo(-14, -8);
            targetCtx.lineTo(-12, -4);
            targetCtx.closePath();
            targetCtx.fill();

            targetCtx.restore();

            if (v.bubbleTimer > 0) {
                v.bubbleTimer -= 0.016;
                drawVisitorBubble(targetCtx, v.x, v.y - 20, v.bubbleText);
            }
        }

        function updateWildFrog(v, dt) {
            if (v.state === 'idle') {
                v.timer += dt;
                if (v.timer > 2.0 && v.hopsRemaining > 0) {
                    v.state = 'hopping';
                    v.timer = 0;
                    v.hopProgress = 0;
                    v.hopStartX = v.x;
                    v.hopStartY = v.y;
                    v.hopTargetX = v.x + (Math.random() - 0.5) * 55;
                    v.hopTargetY = v.y + (Math.random() - 0.5) * 45;
                    v.hopsRemaining--;
                } else if (v.hopsRemaining <= 0 && v.timer > 3.0) {
                    v.state = 'done';
                    particles.push({
                        type: 'ripple',
                        x: v.x,
                        y: v.y,
                        r: 4,
                        maxR: 20,
                        alpha: 0.8
                    });
                }
            } else if (v.state === 'hopping') {
                v.hopProgress += dt * 2.8;
                const t = Math.min(1, v.hopProgress);
                v.x = v.hopStartX + (v.hopTargetX - v.hopStartX) * t;
                v.y = v.hopStartY + (v.hopTargetY - v.hopStartY) * t;
                if (v.hopProgress >= 1) {
                    v.state = 'idle';
                    v.timer = 0;
                    particles.push({
                        type: 'ripple',
                        x: v.x,
                        y: v.y,
                        r: 2,
                        maxR: 12,
                        alpha: 0.6
                    });
                }
            }
        }

        function drawWildFrog(targetCtx, v, now) {
            targetCtx.save();
            const hopHeight = v.state === 'hopping' ? Math.sin(v.hopProgress * Math.PI) * 16 : 0;
            targetCtx.translate(v.x, v.y - hopHeight);

            targetCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            targetCtx.beginPath();
            targetCtx.ellipse(0, 3 + hopHeight, 10, 5, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#22C55E';
            targetCtx.beginPath();
            targetCtx.ellipse(0, -5, 8.5, 6.5, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#BBF7D0';
            targetCtx.beginPath();
            targetCtx.ellipse(0, -3.5, 5.5, 4, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#15803D';
            targetCtx.beginPath();
            targetCtx.arc(-4, -10, 3, 0, Math.PI * 2);
            targetCtx.arc(4, -10, 3, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = '#111827';
            targetCtx.beginPath();
            targetCtx.arc(-4, -10, 1.4, 0, Math.PI * 2);
            targetCtx.arc(4, -10, 1.4, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.restore();

            if (v.bubbleTimer > 0) {
                v.bubbleTimer -= 0.016;
                drawVisitorBubble(targetCtx, v.x, v.y - 18, v.bubbleText);
            }
        }

        function drawVisitorBubble(targetCtx, bx, by, text) {
            targetCtx.save();
            targetCtx.font = "12px 'Patrick Hand', sans-serif";
            const tw = targetCtx.measureText(text).width;
            const bw = tw + 12;
            const bh = 18;

            targetCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            targetCtx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
            targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            if (typeof targetCtx.roundRect === 'function') {
                targetCtx.roundRect(bx - bw / 2, by - bh, bw, bh, 6);
            } else {
                targetCtx.rect(bx - bw / 2, by - bh, bw, bh);
            }
            targetCtx.fill();
            targetCtx.stroke();

            targetCtx.fillStyle = '#1F2937';
            targetCtx.textAlign = 'center';
            targetCtx.textBaseline = 'middle';
            targetCtx.fillText(text, bx, by - bh / 2);
            targetCtx.restore();
        }

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    gardenHiddenTimestamp = Date.now();
                } else {
                    if (gardenHiddenTimestamp && (Date.now() - gardenHiddenTimestamp) > 120000) {
                        const awayMinutes = Math.round((Date.now() - gardenHiddenTimestamp) / 60000);
                        gardenHiddenTimestamp = null;
                        if (typeof showGardenNotice === 'function') {
                            showGardenNotice(`🌸 Kamu kembali setelah ${awayMinutes} menit! Sahabat kebunmu merindukanmu 💕`);
                        }
                    }
                }
            });
        }

        if (typeof window !== 'undefined') {
            window.mysteryEgg = mysteryEgg;
            window.droppedSeeds = droppedSeeds;
            window.wildVisitors = wildVisitors;
            window.spawnMysteryEgg = spawnMysteryEgg;
            window.tapMysteryEgg = tapMysteryEgg;
            window.spawnDroppedSeedFromPollination = spawnDroppedSeedFromPollination;
            window.pickupDroppedSeed = pickupDroppedSeed;
        }

        /**
         * Generates painterly grass blades, dark/light moss patches, and edge tufts
         * so the island looks hand-painted like the reference.
         */
        function populateGrassDetailsAcrossIsland() {
            grassDetails = [];
            const step = 22;
            const minX = Math.max(40, Math.floor(WORLD_W * 0.5 - 480));
            const maxX = Math.min(WORLD_W - 40, Math.floor(WORLD_W * 0.5 + 480));
            const minY = Math.max(40, Math.floor(WORLD_H * 0.52 - 320));
            const maxY = Math.min(WORLD_H - 40, Math.floor(WORLD_H * 0.52 + 320));

            for (let y = minY; y <= maxY; y += step) {
                for (let x = minX; x <= maxX; x += step) {
                    const jitterX = x + (Math.random() - 0.5) * 18;
                    const jitterY = y + (Math.random() - 0.5) * 18;
                    if (isPointOnGrass(jitterX, jitterY)) {
                        addGrassDetailAt(jitterX, jitterY, false);
                    }
                }
            }
        }

        function addGrassDetailAt(x, y, forceTuft = false) {
            const rand = Math.random();
            if (forceTuft || rand < 0.35) {
                // Bushy grass blade cluster (like the tall strokes in reference)
                grassDetails.push({
                    type: 'tuft',
                    x,
                    y,
                    size: 10 + Math.random() * 14,
                    color: Math.random() > 0.45 ? '#4E8832' : '#5E9A3E',
                    blades: 5 + Math.floor(Math.random() * 6),
                    spread: 0.5 + Math.random() * 0.4
                });
            } else if (rand < 0.72) {
                // Small clover / moss dot cluster
                grassDetails.push({
                    type: 'clover',
                    x,
                    y,
                    size: 4 + Math.random() * 6,
                    color: Math.random() > 0.5 ? '#589239' : '#92C967'
                });
            } else {
                // Soft painterly mottled patch
                grassDetails.push({
                    type: 'patch',
                    x,
                    y,
                    rx: 14 + Math.random() * 20,
                    ry: 8 + Math.random() * 12,
                    color: Math.random() > 0.5 ? 'rgba(92, 150, 56, 0.35)' : 'rgba(148, 202, 102, 0.35)'
                });
            }
        }

        /**
         * Calculates the active bounding box of the island in world coordinates.
         * Dramatically accelerates 3D extrusion by avoiding full 4200x3200 blitting.
         */
        var cachedIslandBB = null;

        function expandIslandBoundingBox(x, y, radius = 60) {
            if (!cachedIslandBB) {
                cachedIslandBB = getIslandBoundingBox();
            }
            const pad = radius + 60;
            const newMinX = Math.max(0, Math.min(cachedIslandBB.x, x - pad));
            const newMinY = Math.max(0, Math.min(cachedIslandBB.y, y - pad));
            const newMaxX = Math.min(WORLD_W, Math.max(cachedIslandBB.x + cachedIslandBB.w, x + pad));
            const newMaxY = Math.min(WORLD_H, Math.max(cachedIslandBB.y + cachedIslandBB.h, y + pad + 60));
            cachedIslandBB.x = newMinX;
            cachedIslandBB.y = newMinY;
            cachedIslandBB.w = newMaxX - newMinX;
            cachedIslandBB.h = newMaxY - newMinY;
        }

        function getIslandBoundingBox() {
            if (cachedIslandBB && isPaintingTerrain) {
                return cachedIslandBB;
            }
            let minGX = COLL_W, maxGX = 0, minGY = COLL_H, maxGY = 0;
            let found = false;
            for (let gy = 0; gy < COLL_H; gy++) {
                const row = gy * COLL_W;
                for (let gx = 0; gx < COLL_W; gx++) {
                    if (grassGrid[row + gx] === 1 || waterGrid[row + gx] === 1) {
                        if (gx < minGX) minGX = gx;
                        if (gx > maxGX) maxGX = gx;
                        if (gy < minGY) minGY = gy;
                        if (gy > maxGY) maxGY = gy;
                        found = true;
                    }
                }
            }
            if (!found) {
                cachedIslandBB = { x: 0, y: 0, w: WORLD_W, h: WORLD_H };
                return cachedIslandBB;
            }
            const pad = 96;
            const x = Math.max(0, minGX * COLL_SCALE - pad);
            const y = Math.max(0, minGY * COLL_SCALE - pad);
            const w = Math.min(WORLD_W - x, (maxGX - minGX + 1) * COLL_SCALE + pad * 2);
            const h = Math.min(WORLD_H - y, (maxGY - minGY + 1) * COLL_SCALE + pad * 2);
            cachedIslandBB = { x, y, w, h };
            return cachedIslandBB;
        }

        /**
         * Updates the downsampled collision grid directly in RAM along a brush stroke
         * in ~0.002ms, avoiding expensive 4200x3200 canvas downscaling and getImageData.
         */
        function paintCollisionGridStroke(grid, x1, y1, x2, y2, radius, val) {
            if (!Number.isFinite(x1) || !Number.isFinite(y1) || !Number.isFinite(x2) || !Number.isFinite(y2) || !Number.isFinite(radius)) return;
            // Bound coordinates within world bounds
            x1 = Math.max(0, Math.min(WORLD_W, x1));
            y1 = Math.max(0, Math.min(WORLD_H, y1));
            x2 = Math.max(0, Math.min(WORLD_W, x2));
            y2 = Math.max(0, Math.min(WORLD_H, y2));
            radius = Math.max(1, Math.min(250, radius));

            const dist = Math.hypot(x2 - x1, y2 - y1);
            // Cap steps to 45 max to completely prevent tab freezes on rapid pointer moves or window defocus
            const steps = Math.min(45, Math.max(1, Math.ceil(dist / (COLL_SCALE * 1.5))));
            const rCells = Math.ceil(radius / COLL_SCALE);
            const rSq = (radius / COLL_SCALE) * (radius / COLL_SCALE);
            for (let s = 0; s <= steps; s++) {
                const t = steps === 0 ? 0 : s / steps;
                const cx = ((x1 + (x2 - x1) * t) / COLL_SCALE) | 0;
                const cy = ((y1 + (y2 - y1) * t) / COLL_SCALE) | 0;
                const minGY = Math.max(0, cy - rCells);
                const maxGY = Math.min(COLL_H - 1, cy + rCells);
                const minGX = Math.max(0, cx - rCells);
                const maxGX = Math.min(COLL_W - 1, cx + rCells);
                for (let gy = minGY; gy <= maxGY; gy++) {
                    const dy = gy - cy;
                    const row = gy * COLL_W;
                    for (let gx = minGX; gx <= maxGX; gx++) {
                        const dx = gx - cx;
                        if (dx * dx + dy * dy <= rSq) {
                            grid[row + gx] = val;
                        }
                    }
                }
            }
        }

        function queueTerrainDirtyRect(minX, minY, maxX, maxY) {
            if (!pendingTerrainDirtyRect) {
                pendingTerrainDirtyRect = { minX, minY, maxX, maxY };
            } else {
                if (minX < pendingTerrainDirtyRect.minX) pendingTerrainDirtyRect.minX = minX;
                if (minY < pendingTerrainDirtyRect.minY) pendingTerrainDirtyRect.minY = minY;
                if (maxX > pendingTerrainDirtyRect.maxX) pendingTerrainDirtyRect.maxX = maxX;
                if (maxY > pendingTerrainDirtyRect.maxY) pendingTerrainDirtyRect.maxY = maxY;
            }
            terrainNeedsRebuild = true;
        }

        /**
         * Renders a clipped chunk (dx, dy, dw, dh) of the 3D-extruded grass island
         * using the reusable 640x640 scratch canvases (dirtyExtrudeCanvas & dirtyWaterCanvas).
         * Avoids full-canvas 4200x3200 'source-in' clears and delivers <4ms real-time 3D strokes!
         */
        function renderTerrainChunk(dx, dy, dw, dh) {
            if (dw <= 0 || dh <= 0) return;

            const padL = 16, padR = 16, padT = 48, padB = 16;
            const sx = Math.max(0, dx - padL);
            const sy = Math.max(0, dy - padT);
            const sw = Math.min(WORLD_W - sx, dw + (dx - sx) + padR);
            const sh = Math.min(WORLD_H - sy, dh + (dy - sy) + padB);
            if (sw <= 0 || sh <= 0) return;

            if (dirtyExtrudeCanvas.width < sw || dirtyExtrudeCanvas.height < sh) {
                dirtyExtrudeCanvas.width = Math.max(dirtyExtrudeCanvas.width, sw);
                dirtyExtrudeCanvas.height = Math.max(dirtyExtrudeCanvas.height, sh);
                dirtyWaterCanvas.width = dirtyExtrudeCanvas.width;
                dirtyWaterCanvas.height = dirtyExtrudeCanvas.height;
            }

            const sCtx = dirtyExtrudeCtx;
            const wCtx = dirtyWaterCtx;

            terrainLayerCtx.save();
            terrainLayerCtx.beginPath();
            terrainLayerCtx.rect(dx, dy, dw, dh);
            terrainLayerCtx.clip();
            terrainLayerCtx.clearRect(dx, dy, dw, dh);

            // 1. DROP SHADOW LAYER (Offset down-left & down-right)
            sCtx.save();
            sCtx.beginPath();
            sCtx.rect(0, 0, sw, sh);
            sCtx.clip();

            sCtx.clearRect(0, 0, sw, sh);
            sCtx.globalCompositeOperation = 'source-over';
            sCtx.drawImage(maskCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
            sCtx.globalCompositeOperation = 'source-in';
            sCtx.fillStyle = '#2B3725';
            sCtx.fillRect(0, 0, sw, sh);
            sCtx.globalCompositeOperation = 'source-over';

            const shadowSteps = [22, 32, 42];
            for (let i = 0; i < shadowSteps.length; i++) {
                const sY = shadowSteps[i];
                terrainLayerCtx.drawImage(dirtyExtrudeCanvas, 0, 0, sw, sh, sx - Math.floor(sY * 0.28), sy + sY, sw, sh);
            }

            // 2. 3D EXTRUDED SIDE WALL LAYER
            sCtx.globalCompositeOperation = 'source-in';
            sCtx.fillStyle = '#477431';
            sCtx.fillRect(0, 0, sw, sh);
            sCtx.globalCompositeOperation = 'source-over';

            const wallSteps = [5, 11, 18, 25];
            for (let i = 0; i < wallSteps.length; i++) {
                const wY = wallSteps[i];
                terrainLayerCtx.drawImage(dirtyExtrudeCanvas, 0, 0, sw, sh, sx - Math.floor(wY * 0.08), sy + wY, sw, sh);
            }

            // 3. TOP GRASS SURFACE LAYER
            sCtx.globalCompositeOperation = 'source-in';
            const grad = sCtx.createLinearGradient(0, WORLD_H * 0.2 - sy, 0, WORLD_H * 0.8 - sy);
            grad.addColorStop(0, '#7AB650');
            grad.addColorStop(0.5, '#82BD57');
            grad.addColorStop(1, '#73AE49');
            sCtx.fillStyle = grad;
            sCtx.fillRect(0, 0, sw, sh);

            // Draw soft mottled patches & clovers inside chunk
            sCtx.globalCompositeOperation = 'source-atop';
            for (let i = 0; i < grassDetails.length; i++) {
                const d = grassDetails[i];
                if (d.x < sx - 25 || d.x > sx + sw + 25 || d.y < sy - 25 || d.y > sy + sh + 25) continue;
                const lx = d.x - sx;
                const ly = d.y - sy;
                if (d.type === 'patch') {
                    sCtx.fillStyle = d.color;
                    sCtx.beginPath();
                    sCtx.ellipse(lx, ly, d.rx, d.ry, 0, 0, Math.PI * 2);
                    sCtx.fill();
                } else if (d.type === 'clover') {
                    sCtx.fillStyle = d.color;
                    for (let c = 0; c < 4; c++) {
                        const angle = (c / 4) * Math.PI * 2;
                        sCtx.beginPath();
                        sCtx.arc(
                            lx + Math.cos(angle) * d.size * 0.7,
                            ly + Math.sin(angle) * d.size * 0.5,
                            2.1,
                            0,
                            Math.PI * 2
                        );
                        sCtx.fill();
                    }
                }
            }

            // Composite Water Bodies on the meadow
            if (waterMaskCanvas) {
                wCtx.save();
                wCtx.beginPath();
                wCtx.rect(0, 0, sw, sh);
                wCtx.clip();

                wCtx.clearRect(0, 0, sw, sh);
                wCtx.globalCompositeOperation = 'source-over';
                wCtx.drawImage(waterMaskCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
                wCtx.globalCompositeOperation = 'source-in';

                const wGrad = wCtx.createLinearGradient(0, WORLD_H * 0.2 - sy, 0, WORLD_H * 0.8 - sy);
                wGrad.addColorStop(0, '#389CD6');
                wGrad.addColorStop(0.5, '#4EC0E9');
                wGrad.addColorStop(1, '#2E85BF');
                wCtx.fillStyle = wGrad;
                wCtx.fillRect(0, 0, sw, sh);
                wCtx.restore();

                sCtx.save();
                sCtx.globalCompositeOperation = 'source-atop';
                sCtx.drawImage(waterMaskCanvas, sx, sy, sw, sh, 0, 3.5, sw, sh);
                sCtx.fillStyle = 'rgba(38, 62, 28, 0.45)';
                sCtx.fillRect(0, 0, sw, sh);

                sCtx.drawImage(dirtyWaterCanvas, 0, 0, sw, sh, 0, 0, sw, sh);
                sCtx.restore();
            }

            sCtx.restore();
            terrainLayerCtx.drawImage(dirtyExtrudeCanvas, 0, 0, sw, sh, sx, sy, sw, sh);

            // 4. DRAW GRASS BLADES & TUFTS IN REAL-TIME
            for (let i = 0; i < grassDetails.length; i++) {
                const d = grassDetails[i];
                if (d.type === 'tuft') {
                    if (d.x < dx - 24 || d.x > dx + dw + 24 || d.y < dy - 24 || d.y > dy + dh + 24) continue;
                    if (isPointOnWater(d.x, d.y)) continue;
                    drawGrassTuft(terrainLayerCtx, d.x, d.y, d.size, d.blades, d.color);
                }
            }

            terrainLayerCtx.restore();
        }

        function rebuildTerrainRegion(x, y, w, h) {
            const tileSize = 480;
            for (let ty = y; ty < y + h; ty += tileSize) {
                const th = Math.min(tileSize, y + h - ty);
                for (let tx = x; tx < x + w; tx += tileSize) {
                    const tw = Math.min(tileSize, x + w - tx);
                    renderTerrainChunk(tx, ty, tw, th);
                }
            }
        }

        function rebuildTerrainDirtyRect(rect) {
            if (!rect) return;
            const dx = Math.max(0, Math.floor(rect.minX - 24));
            const dy = Math.max(0, Math.floor(rect.minY - 28));
            const dw = Math.min(WORLD_W - dx, Math.ceil(rect.maxX - rect.minX + 48));
            const dh = Math.min(WORLD_H - dy, Math.ceil(rect.maxY - rect.minY + 74));
            rebuildTerrainRegion(dx, dy, dw, dh);
        }

        /**
         * Renders the full 3D-extruded grass island from maskCanvas onto terrainLayerCanvas
         * using tiled 480x480 chunks.
         */
        function rebuildTerrain3DLayer() {
            if (WORLD_W <= 0 || WORLD_H <= 0 || maskCanvas.width <= 0 || maskCanvas.height <= 0) {
                terrainNeedsRebuild = false;
                pendingTerrainDirtyRect = null;
                return;
            }

            if (terrainLayerCanvas.width !== WORLD_W || terrainLayerCanvas.height !== WORLD_H) {
                terrainLayerCanvas.width = WORLD_W;
                terrainLayerCanvas.height = WORLD_H;
            }

            const bb = getIslandBoundingBox();
            terrainLayerCtx.clearRect(0, 0, WORLD_W, WORLD_H);
            rebuildTerrainRegion(bb.x, bb.y, bb.w, bb.h);

            pendingTerrainDirtyRect = null;
            terrainNeedsRebuild = false;
        }

        function drawGrassTuft(targetCtx, x, y, height, bladeCount, color) {
            targetCtx.save();
            targetCtx.strokeStyle = color;
            targetCtx.lineCap = 'round';
            targetCtx.lineWidth = 1.6;

            // Soft darker shadow at base of tuft
            targetCtx.fillStyle = 'rgba(62, 108, 42, 0.28)';
            targetCtx.beginPath();
            targetCtx.ellipse(x, y + 2, height * 0.65, height * 0.25, 0, 0, Math.PI * 2);
            targetCtx.fill();

            for (let i = 0; i < bladeCount; i++) {
                const t = (i / (bladeCount - 1 || 1)) - 0.5; // -0.5 to 0.5
                const startX = x + t * height * 0.9;
                const startY = y + (Math.sin(i * 2.3) * 2);
                const lean = t * height * 1.15;
                const bladeH = height * (0.7 + Math.sin(i * 1.7 + 0.5) * 0.35);

                targetCtx.beginPath();
                targetCtx.moveTo(startX, startY);
                targetCtx.quadraticCurveTo(
                    startX + lean * 0.45,
                    startY - bladeH * 0.6,
                    startX + lean,
                    startY - bladeH
                );
                targetCtx.stroke();
            }
            targetCtx.restore();
        }

        /********************************************************************
         * 4B. ANIMATED LIVING LAKE & FLOATING WATER LILIES (POND DEPTH & REALISM)
         ********************************************************************/
        var waterLilyPads = [];
        /********************************************************************
         * 4B. ANIMATED LIVING LAKE & SUNLIGHT WAVELETS (OPTIMIZED 60 FPS)
         ********************************************************************/
         var waterLilyPads = [];
         window.waterLilyPads = waterLilyPads;
         var lakeSparkleGrid = [];
         var lakeSparklesInitialized = false;

         function initLakeSparkles() {
             lakeSparklesInitialized = true;
             lakeSparkleGrid = [];
             if (!waterMaskCanvas) return;
             // Coarse scan with hard cap at 28 sparkles for ultra-smooth 60 FPS performance
             for (let gx = 450; gx <= WORLD_W - 450; gx += 110) {
                 for (let gy = 320; gy <= WORLD_H - 320; gy += 90) {
                     if (isPointOnWater(gx, gy)) {
                         lakeSparkleGrid.push({
                             x: gx + (Math.random() - 0.5) * 35,
                             y: gy + (Math.random() - 0.5) * 25,
                             phase: Math.random() * Math.PI * 2,
                             speed: 0.0022 + Math.random() * 0.0028,
                             width: 14 + Math.random() * 18
                         });
                         if (lakeSparkleGrid.length >= 28) return;
                     }
                 }
             }
         }

         function populatePondWaterLilies() {
             waterLilyPads = [];
             window.waterLilyPads = [];
             initLakeSparkles();
         }

         function drawWaterLilyPad(targetCtx, lp, now) {
             // Teratai di laut/danau dinonaktifkan sesuai permintaan pengguna
         }

         function drawAnimatedLivingLake(targetCtx, now, dt) {
             if (!waterMaskCanvas) return;
             if (!lakeSparklesInitialized) {
                 initLakeSparkles();
             }
             if (lakeSparkleGrid.length === 0) return;

             const minX = -panX / zoom - 60;
             const maxX = (-panX + screenW) / zoom + 60;
             const minY = -panY / zoom - 60;
             const maxY = (-panY + screenH) / zoom + 60;

             targetCtx.save();
             targetCtx.lineCap = 'round';
             targetCtx.lineWidth = 1.8;
             targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';

             targetCtx.beginPath();
             let waveCount = 0;
             for (let i = 0; i < lakeSparkleGrid.length; i++) {
                 const sp = lakeSparkleGrid[i];
                 if (sp.x < minX || sp.x > maxX || sp.y < minY || sp.y > maxY) continue;
                 const wave = Math.sin(now * sp.speed + sp.phase);
                 if (wave > -0.2) {
                     waveCount++;
                     const driftX = Math.cos(now * 0.0012 + sp.phase) * 3;
                     const waveY = Math.sin(now * 0.002 + sp.phase) * 1.5;
                     targetCtx.moveTo(sp.x + driftX - sp.width * 0.5, sp.y + waveY);
                     targetCtx.quadraticCurveTo(sp.x + driftX, sp.y - waveY * 2, sp.x + driftX + sp.width * 0.5, sp.y + waveY);
                 }
             }
             if (waveCount > 0) {
                 targetCtx.stroke();
             }
             targetCtx.restore();
         }

        /**
         * Paints or erases green land terrain (Tanah Hijau) along a stroke between (x1, y1) and (x2, y2)
         * Creates smooth, organic 3D land without forced grass blades everywhere.
         */
        function modifyGrassTerrain(x1, y1, x2, y2, isErasing) {
            maskCtx.save();
            maskCtx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
            maskCtx.strokeStyle = '#FFFFFF';
            maskCtx.fillStyle = '#FFFFFF';
            maskCtx.lineCap = 'round';
            maskCtx.lineJoin = 'round';
            maskCtx.lineWidth = terrainBrushSize * 2;

            maskCtx.beginPath();
            maskCtx.moveTo(x1, y1);
            maskCtx.lineTo(x2, y2);
            maskCtx.stroke();

            maskCtx.beginPath();
            maskCtx.arc(x2, y2, terrainBrushSize, 0, Math.PI * 2);
            maskCtx.fill();
            maskCtx.restore();

            // When painting grass over water, grass replaces water directly!
            if (!isErasing && waterMaskCtx) {
                waterMaskCtx.save();
                waterMaskCtx.globalCompositeOperation = 'destination-out';
                waterMaskCtx.lineCap = 'round';
                waterMaskCtx.lineJoin = 'round';
                waterMaskCtx.lineWidth = terrainBrushSize * 2;

                waterMaskCtx.beginPath();
                waterMaskCtx.moveTo(x1, y1);
                waterMaskCtx.lineTo(x2, y2);
                waterMaskCtx.stroke();

                waterMaskCtx.beginPath();
                waterMaskCtx.arc(x2, y2, terrainBrushSize, 0, Math.PI * 2);
                waterMaskCtx.fill();
                waterMaskCtx.restore();

                paintCollisionGridStroke(waterGrid, x1, y1, x2, y2, terrainBrushSize, 0);
            }

            paintCollisionGridStroke(grassGrid, x1, y1, x2, y2, terrainBrushSize, isErasing ? 0 : 1);

            if (isErasing) {
                const rSq = (terrainBrushSize * 1.05) * (terrainBrushSize * 1.05);
                grassDetails = grassDetails.filter(d => {
                    const dx = d.x - x2;
                    const dy = d.y - y2;
                    return dx * dx + dy * dy > rSq;
                });
            }

            expandIslandBoundingBox(x2, y2, terrainBrushSize);
            queueTerrainDirtyRect(
                Math.min(x1, x2) - terrainBrushSize,
                Math.min(y1, y2) - terrainBrushSize,
                Math.max(x1, x2) + terrainBrushSize,
                Math.max(y1, y2) + terrainBrushSize
            );
        }

        /**
         * Paints decorative grass tufts, clovers & moss patches (Kuas Rumput)
         * onto existing green ground with sparse ("jarang-jarang") natural spacing
         */
        function paintDecorativeGrass(x1, y1, x2, y2) {
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const stepSpacing = Math.max(26, terrainBrushSize * 0.65);
            const steps = Math.max(1, Math.floor(dist / stepSpacing));
            const minDistSq = 20 * 20;

            for (let s = 0; s < steps; s++) {
                const t = steps <= 1 ? 1 : (s + 1) / steps;
                const bx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * terrainBrushSize * 0.45;
                const by = y1 + (y2 - y1) * t + (Math.random() - 0.5) * terrainBrushSize * 0.45;
                if (isPointOnGrass(bx, by) && !isPointOnWater(bx, by)) {
                    let tooClose = false;
                    for (let i = grassDetails.length - 1; i >= 0; i--) {
                        const gd = grassDetails[i];
                        if (gd.type === 'tuft') {
                            const dx = gd.x - bx;
                            const dy = gd.y - by;
                            if (dx * dx + dy * dy < minDistSq) {
                                tooClose = true;
                                break;
                            }
                        }
                    }
                    if (!tooClose) {
                        addGrassDetailAt(bx, by, true);
                        queueTerrainDirtyRect(bx - 28, by - 28, bx + 28, by + 28);

                        if (Math.random() < 0.35) {
                            particles.push({
                                type: 'sparkle',
                                x: bx,
                                y: by,
                                vx: (Math.random() - 0.5) * 1.2,
                                vy: -0.6 - Math.random() * 1.0,
                                size: 2.5 + Math.random() * 2,
                                color: '#82BD57',
                                alpha: 0.85
                            });
                        }
                    }
                }
            }
        }

        /**
         * Paints or erases water terrain (Kolam Air & Aliran Sungai)
         */
        function modifyWaterTerrain(x1, y1, x2, y2, isErasing) {
            if (!waterMaskCtx) return;
            waterMaskCtx.save();
            waterMaskCtx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
            waterMaskCtx.strokeStyle = '#FFFFFF';
            waterMaskCtx.fillStyle = '#FFFFFF';
            waterMaskCtx.lineCap = 'round';
            waterMaskCtx.lineJoin = 'round';
            waterMaskCtx.lineWidth = terrainBrushSize * 2;

            waterMaskCtx.beginPath();
            waterMaskCtx.moveTo(x1, y1);
            waterMaskCtx.lineTo(x2, y2);
            waterMaskCtx.stroke();

            waterMaskCtx.beginPath();
            waterMaskCtx.arc(x2, y2, terrainBrushSize, 0, Math.PI * 2);
            waterMaskCtx.fill();
            waterMaskCtx.restore();

            paintCollisionGridStroke(waterGrid, x1, y1, x2, y2, terrainBrushSize, isErasing ? 0 : 1);

            if (!isErasing) {
                const rSq = (terrainBrushSize * 0.95) * (terrainBrushSize * 0.95);
                grassDetails = grassDetails.filter(d => {
                    const dx = d.x - x2;
                    const dy = d.y - y2;
                    return dx * dx + dy * dy > rSq;
                });
                if (Math.random() < 0.25) {
                    particles.push({
                        type: 'droplet',
                        x: x2 + (Math.random() - 0.5) * terrainBrushSize,
                        y: y2 + (Math.random() - 0.5) * terrainBrushSize,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: -1.0 - Math.random() * 1.2,
                        size: 3.5 + Math.random() * 2,
                        alpha: 0.9
                    });
                }
            }

            expandIslandBoundingBox(x2, y2, terrainBrushSize);
            queueTerrainDirtyRect(
                Math.min(x1, x2) - terrainBrushSize,
                Math.min(y1, y2) - terrainBrushSize,
                Math.max(x1, x2) + terrainBrushSize,
                Math.max(y1, y2) + terrainBrushSize
            );
        }

        /**
         * Erases grass details exclusively (leaves land, flowers, and water completely intact)
         */
        function eraseGrassAt(wx, wy) {
            const prevLen = grassDetails.length;
            grassDetails = grassDetails.filter(d => {
                const dist = Math.hypot(d.x - wx, d.y - wy);
                return dist > terrainBrushSize;
            });
            if (grassDetails.length !== prevLen) {
                queueTerrainDirtyRect(
                    wx - terrainBrushSize - 24,
                    wy - terrainBrushSize - 24,
                    wx + terrainBrushSize + 24,
                    wy + terrainBrushSize + 24
                );
                if (Math.random() < 0.35) {
                    particles.push({
                        type: 'leaf',
                        x: wx + (Math.random() - 0.5) * terrainBrushSize,
                        y: wy + (Math.random() - 0.5) * terrainBrushSize,
                        vx: (Math.random() - 0.5) * 1.4,
                        vy: -1.2 - Math.random() * 1.0,
                        size: 3 + Math.random() * 3,
                        color: '#5C9638',
                        alpha: 0.9
                    });
                }
            }
        }

        function eraseGrassLine(x1, y1, x2, y2) {
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(1, Math.floor(dist / (terrainBrushSize * 0.4)));
            for (let s = 0; s <= steps; s++) {
                const t = steps === 0 ? 0 : s / steps;
                const bx = x1 + (x2 - x1) * t;
                const by = y1 + (y2 - y1) * t;
                eraseGrassAt(bx, by);
            }
        }

        function refreshFlowersGrassStatus() {
            for (const f of flowers) {
                f.onGrass = isPointOnGrass(f.x, f.y);
            }
        }


        function plantFlowerAt(x, y, sourceCanvas) {
            if (!sourceCanvas) return;

            const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(x, y);
            const onWater = typeof isPointOnWater === 'function' && isPointOnWater(x, y);
            const nearWater = typeof isNearWater === 'function' && isNearWater(x, y, 22);

            if (onWater || nearWater) {
                if (typeof showGardenNotice === 'function') showGardenNotice('Bunga tidak bisa ditanam di kolam air atau tepian air! 💧🌸');
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }
            if (!onGrass) {
                if (typeof showGardenNotice === 'function') showGardenNotice('Bunga hanya bisa ditanam di atas tanah rumput! 🌿');
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }

            // Normalize max display size so huge drawings still look cute in the garden
            const maxDim = 68;
            let dispW = sourceCanvas.width;
            let dispH = sourceCanvas.height;
            if (dispW > maxDim || dispH > maxDim) {
                const ratio = maxDim / Math.max(dispW, dispH);
                dispW *= ratio;
                dispH *= ratio;
            }
            // Also ensure very tiny drawings aren't invisible
            if (dispW < 28 && dispH < 28) {
                dispW *= 1.35;
                dispH *= 1.35;
            }

            // Create both healthy and wilted versions of the sprite for smooth blending
            const wiltedCanvas = createWiltedSprite(sourceCanvas);

            const newFlower = {
                id: 'flw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                x,
                y,
                width: dispW,
                height: dispH,
                imgCanvas: sourceCanvas,
                wiltedCanvas: wiltedCanvas,
                hydration: 100, // Starts 100% fresh
                growthProgress: 0.05, // Starts as a tiny seed (Biji -> Tunas -> Kuncup -> Mekar)
                onGrass: onGrass,
                swayPhase: Math.random() * Math.PI * 2,
                birthScale: 0.1,
                waterBounce: 0
            };

            flowers.push(newFlower);
            if (typeof incrementStat === 'function') incrementStat('flowersPlanted', 1);
            // Sort flowers by Y coordinate for natural depth overlap
            flowers.sort((a, b) => a.y - b.y);

            // Spawn happy planting sparkles
            for (let i = 0; i < 8; i++) {
                particles.push({
                    type: 'sparkle',
                    x: x + (Math.random() - 0.5) * 26,
                    y: y - Math.random() * 26,
                    vx: (Math.random() - 0.5) * 1.6,
                    vy: -0.8 - Math.random() * 1.5,
                    size: 3 + Math.random() * 3,
                    color: onGrass ? '#7DB852' : '#F29B4B',
                    alpha: 1
                });
            }

            playPlantSound();
            updateStatusBadges();
            scheduleAutoSave();
        }

        /**
         * Creates a desaturated brownish-olive wilted version of a flower canvas
         */
        function createWiltedSprite(srcCanvas) {
            const c = document.createElement('canvas');
            c.width = srcCanvas.width;
            c.height = srcCanvas.height;
            const cCtx = c.getContext('2d');
            cCtx.drawImage(srcCanvas, 0, 0);

            const imgData = cCtx.getImageData(0, 0, c.width, c.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] > 10) {
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
                    // Tint towards dry autumn sepia/olive
                    d[i]     = Math.min(255, lum * 0.75 + 48);
                    d[i + 1] = Math.min(255, lum * 0.68 + 38);
                    d[i + 2] = Math.min(255, lum * 0.45 + 20);
                }
            }
            cCtx.putImageData(imgData, 0, 0);
            return c;
        }


        /********************************************************************
         * 5. PROCEDURAL HAND-DRAWN STARTER FLOWERS (EXACT REFERENCE MATCH)
         ********************************************************************/
        function drawProceduralFlowerOnCtx(targetCtx, cx, cy, opts) {
            const {
                petalColor = '#EDA4BD',
                centerColor = '#F7CE68',
                innerDotColor = '#DF5645',
                stemColor = '#3A6A37',
                type = 'daisy',
                scale = 1
            } = opts;

            targetCtx.save();
            targetCtx.translate(cx, cy);
            targetCtx.scale(scale, scale);
            targetCtx.lineCap = 'round';
            targetCtx.lineJoin = 'round';

            // 1. Hand-drawn Stem & Little Leaves
            targetCtx.strokeStyle = stemColor;
            targetCtx.lineWidth = 4;
            targetCtx.beginPath();
            targetCtx.moveTo(0, 4);
            targetCtx.quadraticCurveTo(5, 22, -2, 38);
            targetCtx.stroke();

            // Leaves
            targetCtx.beginPath();
            targetCtx.moveTo(1, 24);
            targetCtx.quadraticCurveTo(14, 17, 16, 22);
            targetCtx.quadraticCurveTo(9, 28, 1, 26);
            targetCtx.fillStyle = stemColor;
            targetCtx.fill();

            if (Math.random() > 0.35) {
                targetCtx.beginPath();
                targetCtx.moveTo(-1, 28);
                targetCtx.quadraticCurveTo(-13, 22, -14, 27);
                targetCtx.quadraticCurveTo(-8, 32, -1, 30);
                targetCtx.fill();
            }

            // 2. Flower Blossom Head Variations matching reference doodles
            if (type === 'daisy') {
                const petals = 6;
                targetCtx.fillStyle = petalColor;
                for (let i = 0; i < petals; i++) {
                    const ang = (i / petals) * Math.PI * 2;
                    const px = Math.cos(ang) * 12;
                    const py = Math.sin(ang) * 12;
                    targetCtx.beginPath();
                    targetCtx.arc(px, py, 8.5, 0, Math.PI * 2);
                    targetCtx.fill();
                }
                targetCtx.fillStyle = centerColor;
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 8.5, 0, Math.PI * 2);
                targetCtx.fill();

                targetCtx.fillStyle = innerDotColor;
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 4, 0, Math.PI * 2);
                targetCtx.fill();

            } else if (type === 'outline_daisy') {
                // Like the pink outlined daisy on the left & bottom of the island in reference
                const petals = 6;
                targetCtx.strokeStyle = petalColor;
                targetCtx.lineWidth = 3.2;
                for (let i = 0; i < petals; i++) {
                    const ang = (i / petals) * Math.PI * 2;
                    const px = Math.cos(ang) * 11;
                    const py = Math.sin(ang) * 11;
                    targetCtx.beginPath();
                    targetCtx.arc(px, py, 6.5, 0, Math.PI * 2);
                    targetCtx.stroke();
                }
                targetCtx.fillStyle = centerColor;
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 5.5, 0, Math.PI * 2);
                targetCtx.fill();

            } else if (type === 'tulip') {
                // Tulip with 3 pointed petals like top-right of island in reference
                targetCtx.fillStyle = petalColor;
                targetCtx.beginPath();
                targetCtx.moveTo(-14, 2);
                targetCtx.quadraticCurveTo(-16, -18, -7, -16);
                targetCtx.quadraticCurveTo(-3, -8, 0, -19);
                targetCtx.quadraticCurveTo(3, -8, 7, -16);
                targetCtx.quadraticCurveTo(16, -18, 14, 2);
                targetCtx.quadraticCurveTo(0, 12, -14, 2);
                targetCtx.closePath();
                targetCtx.fill();

                // Inner highlight
                targetCtx.strokeStyle = centerColor;
                targetCtx.lineWidth = 2.2;
                targetCtx.beginPath();
                targetCtx.moveTo(-4, 0);
                targetCtx.lineTo(-5, -9);
                targetCtx.moveTo(4, 0);
                targetCtx.lineTo(5, -9);
                targetCtx.stroke();

            } else if (type === 'poppy') {
                // Concentric round poppy on top-left of reference
                targetCtx.fillStyle = petalColor;
                for (let i = 0; i < 5; i++) {
                    const ang = (i / 5) * Math.PI * 2;
                    targetCtx.beginPath();
                    targetCtx.arc(Math.cos(ang) * 7, Math.sin(ang) * 7, 10, 0, Math.PI * 2);
                    targetCtx.fill();
                }
                targetCtx.fillStyle = centerColor;
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 9.5, 0, Math.PI * 2);
                targetCtx.fill();

                targetCtx.fillStyle = innerDotColor;
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 4.5, 0, Math.PI * 2);
                targetCtx.fill();

            } else if (type === 'rosebud') {
                // Swirly orange/red rosebud in top right of reference
                targetCtx.fillStyle = petalColor;
                targetCtx.beginPath();
                targetCtx.arc(0, -3, 11, 0, Math.PI * 2);
                targetCtx.fill();

                targetCtx.strokeStyle = centerColor;
                targetCtx.lineWidth = 2.6;
                targetCtx.beginPath();
                targetCtx.arc(0, -4, 6, 0.2, Math.PI * 1.85);
                targetCtx.stroke();

            } else if (type === 'cluster') {
                // Red mini star-blossom cluster near right edge of island in reference
                const offsets = [[-9, -6], [9, -5], [0, -14]];
                for (const [ox, oy] of offsets) {
                    targetCtx.strokeStyle = stemColor;
                    targetCtx.lineWidth = 2.2;
                    targetCtx.beginPath();
                    targetCtx.moveTo(0, 8);
                    targetCtx.lineTo(ox, oy);
                    targetCtx.stroke();

                    targetCtx.fillStyle = petalColor;
                    for (let p = 0; p < 4; p++) {
                        const a = (p / 4) * Math.PI * 2 + 0.4;
                        targetCtx.beginPath();
                        targetCtx.ellipse(ox + Math.cos(a) * 5, oy + Math.sin(a) * 5, 4.5, 2.3, a, 0, Math.PI * 2);
                        targetCtx.fill();
                    }
                    targetCtx.fillStyle = centerColor;
                    targetCtx.beginPath();
                    targetCtx.arc(ox, oy, 2.2, 0, Math.PI * 2);
                    targetCtx.fill();
                }
            }

            targetCtx.restore();
        }

        function makeProceduralFlowerSprite(opts) {
            const c = document.createElement('canvas');
            c.width = 90;
            c.height = 100;
            const cCtx = c.getContext('2d');
            drawProceduralFlowerOnCtx(cCtx, 45, 46, opts);
            return c;
        }

        /**
         * Populates the initial garden with flowers positioned gracefully on and around
         * the lush oval island in world coordinates.
         */
        function createStarterFlowersMatchingReference() {
            flowers = [];

            const cx = WORLD_W * 0.5;
            const cy = WORLD_H * 0.52;

            const starterSpecs = [
                // Upper region of Oval
                { x: cx - 120, y: cy - 130, opts: { type: 'tulip', petalColor: '#F29B4B', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.95 } },
                { x: cx + 130, y: cy - 140, opts: { type: 'poppy', petalColor: '#DF5645', centerColor: '#F7CE68', innerDotColor: '#F29B4B', stemColor: '#3A6A37', scale: 1.0 } },
                { x: cx + 10,  y: cy - 170, opts: { type: 'daisy', petalColor: '#EDA4BD', centerColor: '#DF5645', innerDotColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.9 } },
                
                // Mid-island spread
                { x: cx - 290, y: cy - 30, opts: { type: 'outline_daisy', petalColor: '#EDA4BD', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.95 } },
                { x: cx - 150, y: cy + 10, opts: { type: 'rosebud', petalColor: '#DF5645', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.9 } },
                { x: cx,       y: cy - 15, opts: { type: 'cluster', petalColor: '#DF5645', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.95 } },
                { x: cx + 170, y: cy - 20, opts: { type: 'tulip', petalColor: '#DF5645', centerColor: '#EDA4BD', stemColor: '#3A6A37', scale: 0.95 } },
                { x: cx + 310, y: cy - 10, opts: { type: 'daisy', petalColor: '#84B4E8', centerColor: '#F7CE68', innerDotColor: '#FFFFFF', stemColor: '#3A6A37', scale: 0.9 } },

                // Lower region & gentle rim of the Oval
                { x: cx - 230, y: cy + 90, opts: { type: 'daisy', petalColor: '#EDA4BD', centerColor: '#F7CE68', innerDotColor: '#DF5645', stemColor: '#3A6A37', scale: 0.92 } },
                { x: cx - 70,  y: cy + 140, opts: { type: 'outline_daisy', petalColor: '#EDA4BD', centerColor: '#F29B4B', stemColor: '#3A6A37', scale: 0.95 } },
                { x: cx + 90,  y: cy + 130, opts: { type: 'tulip', petalColor: '#F29B4B', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.92 } },
                { x: cx + 240, y: cy + 95, opts: { type: 'rosebud', petalColor: '#F29B4B', centerColor: '#DF5645', stemColor: '#3A6A37', scale: 0.88 } },
                { x: cx + 10,  y: cy + 190, opts: { type: 'cluster', petalColor: '#DF5645', centerColor: '#F7CE68', stemColor: '#3A6A37', scale: 0.95 } }
            ];

            starterSpecs.forEach(spec => {
                const sprite = makeProceduralFlowerSprite(spec.opts);
                const wilted = createWiltedSprite(sprite);
                flowers.push({
                    id: 'starter_' + Math.random().toString(36).slice(2, 7),
                    x: spec.x,
                    y: spec.y,
                    width: 64,
                    height: 72,
                    imgCanvas: sprite,
                    wiltedCanvas: wilted,
                    hydration: 85 + Math.random() * 15,
                    onGrass: isPointOnGrass(spec.x, spec.y),
                    swayPhase: Math.random() * Math.PI * 2,
                    birthScale: 1,
                    waterBounce: 0
                });
            });

            flowers.sort((a, b) => a.y - b.y);
            updateStatusBadges();
        }


        /********************************************************************
         * 6. WATERING, WILTING & GARDEN TOOLS LOGIC
         ********************************************************************/
        function setWorldTool(toolName) {
            currentTool = toolName;
            if (toolName !== 'plant') {
                const pb = document.getElementById('plantingBanner');
                if (pb) pb.classList.add('hidden');
            }
            if (toolName !== 'place-decor') {
                const db = document.getElementById('decorPlacementBanner');
                if (db) {
                    db.classList.add('hidden');
                    db.classList.remove('flex');
                }
                if (typeof window.pendingDecorationSpec !== 'undefined' && window.pendingDecorationSpec) {
                    window.pendingDecorationSpec = null;
                }
            }
            closeAllToolDropdowns();
            updateToolbarUI();
        }

        function togglePencilDropdown(e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            const pencilMenu = document.getElementById('pencilDropdownMenu');
            const eraserMenu = document.getElementById('eraserDropdownMenu');
            const brushCtrl = document.getElementById('terrainBrushControls');
            if (eraserMenu) eraserMenu.classList.add('hidden');
            if (pencilMenu) {
                const willOpen = pencilMenu.classList.contains('hidden');
                if (willOpen) {
                    if (currentTool !== 'land' && currentTool !== 'water-terrain' && currentTool !== 'grass') {
                        setWorldTool('land');
                    }
                    pencilMenu.classList.remove('hidden');
                    if (brushCtrl) {
                        brushCtrl.classList.add('hidden');
                        brushCtrl.classList.remove('flex');
                    }
                } else {
                    pencilMenu.classList.add('hidden');
                    updateToolbarUI();
                }
            }
        }

        function toggleEraserDropdown(e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            const pencilMenu = document.getElementById('pencilDropdownMenu');
            const eraserMenu = document.getElementById('eraserDropdownMenu');
            const brushCtrl = document.getElementById('terrainBrushControls');
            if (pencilMenu) pencilMenu.classList.add('hidden');
            if (eraserMenu) {
                const willOpen = eraserMenu.classList.contains('hidden');
                if (willOpen) {
                    if (currentTool !== 'erase-land' && currentTool !== 'erase-water' && currentTool !== 'erase-grass') {
                        setWorldTool('erase-land');
                    }
                    eraserMenu.classList.remove('hidden');
                    if (brushCtrl) {
                        brushCtrl.classList.add('hidden');
                        brushCtrl.classList.remove('flex');
                    }
                } else {
                    eraserMenu.classList.add('hidden');
                    updateToolbarUI();
                }
            }
        }

        function closeAllToolDropdowns() {
            const pencilMenu = document.getElementById('pencilDropdownMenu');
            const eraserMenu = document.getElementById('eraserDropdownMenu');
            let wasOpen = false;
            if (pencilMenu && !pencilMenu.classList.contains('hidden')) {
                pencilMenu.classList.add('hidden');
                wasOpen = true;
            }
            if (eraserMenu && !eraserMenu.classList.contains('hidden')) {
                eraserMenu.classList.add('hidden');
                wasOpen = true;
            }
            if (wasOpen) {
                updateToolbarUI();
            }
        }

        function selectPencilSubTool(toolName) {
            setWorldTool(toolName);
            closeAllToolDropdowns();
        }

        function selectEraserSubTool(toolName) {
            setWorldTool(toolName);
            closeAllToolDropdowns();
        }

        function updateToolbarUI() {
            // Standalone buttons
            const buttons = ['hand', 'water'];
            buttons.forEach(t => {
                const el = document.getElementById('tool-' + t);
                if (el) {
                    if (currentTool === t) el.classList.add('active');
                    else el.classList.remove('active');
                }
            });

            // Pencil group parent button & subtools
            const isPencil = (currentTool === 'land' || currentTool === 'water-terrain' || currentTool === 'grass');
            const pencilMainBtn = document.getElementById('tool-pencil-main');
            if (pencilMainBtn) {
                if (isPencil) pencilMainBtn.classList.add('active');
                else pencilMainBtn.classList.remove('active');
            }

            ['land', 'water-terrain', 'grass'].forEach(st => {
                const subEl = document.getElementById('subtool-' + st);
                if (subEl) {
                    if (currentTool === st) {
                        subEl.classList.add('active', 'bg-emerald-100', 'ring-2', 'ring-emerald-500');
                    } else {
                        subEl.classList.remove('active', 'bg-emerald-100', 'ring-2', 'ring-emerald-500');
                    }
                }
            });

            // Eraser group parent button & subtools
            const isEraser = (currentTool === 'erase-land' || currentTool === 'erase-water' || currentTool === 'erase-grass' || currentTool === 'erase');
            const eraserMainBtn = document.getElementById('tool-eraser-main');
            if (eraserMainBtn) {
                if (isEraser) eraserMainBtn.classList.add('active');
                else eraserMainBtn.classList.remove('active');
            }

            ['erase-land', 'erase-water', 'erase-grass'].forEach(st => {
                const subEl = document.getElementById('subtool-' + st);
                if (subEl) {
                    if (currentTool === st || (st === 'erase-land' && currentTool === 'erase')) {
                        subEl.classList.add('active', 'bg-amber-100', 'ring-2', 'ring-amber-500');
                    } else {
                        subEl.classList.remove('active', 'bg-amber-100', 'ring-2', 'ring-amber-500');
                    }
                }
            });

            // Dynamically reflect equipped subtool in parent button icons
            const pencilIconEl = document.getElementById('pencilMainIcon');
            if (pencilIconEl) {
                if (currentTool === 'land') {
                    pencilIconEl.innerHTML = `<svg class="w-5 h-5 text-[#2B5B35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5c0-2.76-2.24-5-5-5h-1a6 6 0 0 0-11-2c0 .34.03.67.08 1A5 5 0 0 0 2 17z"/><path d="M7 16h10"/></svg>`;
                } else if (currentTool === 'water-terrain') {
                    pencilIconEl.innerHTML = `<svg class="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14c2.5-2 5.5-2 8 0s5.5 2 8 0 4-2 6 0"/><path d="M2 18c2.5-2 5.5-2 8 0s5.5 2 8 0 4-2 6 0"/><circle cx="12" cy="7" r="3.2" fill="#38BDF8" stroke="currentColor"/></svg>`;
                } else if (currentTool === 'grass') {
                    pencilIconEl.innerHTML = `<svg class="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-13"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4.1 1-4.9 2z"/></svg>`;
                } else {
                    pencilIconEl.innerHTML = `<svg class="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4-14 14H4v-4L18 2z"/><path d="m14.5 5.5 4 4"/></svg>`;
                }
            }

            const eraserIconEl = document.getElementById('eraserMainIcon');
            if (eraserIconEl) {
                if (currentTool === 'erase-land') {
                    eraserIconEl.innerHTML = `<svg class="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><line x1="16" y1="4" x2="20" y2="8" stroke="#D97706" stroke-width="2.5"/></svg>`;
                } else if (currentTool === 'erase-water') {
                    eraserIconEl.innerHTML = `<svg class="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><line x1="16" y1="4" x2="20" y2="8" stroke="#0284C7" stroke-width="2.5"/></svg>`;
                } else if (currentTool === 'erase-grass') {
                    eraserIconEl.innerHTML = `<svg class="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><line x1="17" y1="3" x2="21" y2="7" stroke="#059669" stroke-width="2.5"/></svg>`;
                } else {
                    eraserIconEl.innerHTML = `<svg class="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`;
                }
            }

            // Brush controls
            const brushCtrl = document.getElementById('terrainBrushControls');
            const brushLabel = document.getElementById('terrainBrushLabel');
            const pencilMenu = document.getElementById('pencilDropdownMenu');
            const eraserMenu = document.getElementById('eraserDropdownMenu');
            const isAnyDropdownOpen = (pencilMenu && !pencilMenu.classList.contains('hidden')) || (eraserMenu && !eraserMenu.classList.contains('hidden'));

            if ((isPencil || isEraser) && !isAnyDropdownOpen) {
                if (brushCtrl) {
                    brushCtrl.classList.remove('hidden');
                    brushCtrl.classList.add('flex');
                }
                if (brushLabel) {
                    if (currentTool === 'land') brushLabel.textContent = 'Ukuran Medan Hijau:';
                    else if (currentTool === 'water-terrain') brushLabel.textContent = 'Ukuran Medan Air:';
                    else if (currentTool === 'grass') brushLabel.textContent = 'Ukuran Rumput:';
                    else if (currentTool === 'erase-land') brushLabel.textContent = 'Ukuran Hapus Tanah:';
                    else if (currentTool === 'erase-water') brushLabel.textContent = 'Ukuran Hapus Air:';
                    else if (currentTool === 'erase-grass') brushLabel.textContent = 'Ukuran Hapus Rumput:';
                    else brushLabel.textContent = 'Ukuran Hapus:';
                }
            } else {
                if (brushCtrl) {
                    brushCtrl.classList.add('hidden');
                    brushCtrl.classList.remove('flex');
                }
            }

            // Set appropriate cursor
            const hoveredAnimal = currentTool === 'hand' ? findAnimalAt(currentWorldX, currentWorldY) : null;
            if (isDraggingCanvas || draggedFlower || draggedAnimal || draggedDecoration) worldCanvas.style.cursor = 'grabbing';
            else if (currentTool === 'hand') worldCanvas.style.cursor = (hoveredFlower || hoveredAnimal) ? 'pointer' : 'grab';
            else if (currentTool === 'water') worldCanvas.style.cursor = 'pointer';
            else if (currentTool === 'plant' || currentTool === 'place-decor') worldCanvas.style.cursor = 'copy';
            else worldCanvas.style.cursor = 'crosshair';
        }

        function updateTerrainBrushSize(val) {
            terrainBrushSize = parseInt(val, 10);
            const txt = document.getElementById('terrainBrushValText');
            if (txt) txt.textContent = terrainBrushSize;
        }

        function cycleWitherSpeed() {
            currentWitherModeIndex = (currentWitherModeIndex + 1) % witherModes.length;
            updateWitherModeDisplay();
            scheduleAutoSave();
        }

        function updateWitherModeDisplay() {
            const txt = document.getElementById('witherModeText');
            if (txt && witherModes[currentWitherModeIndex]) {
                txt.textContent = witherModes[currentWitherModeIndex].label;
            }
        }

        /**
         * Pours water at (wx, wy), hydrating any flowers within splash radius
         * and spawning cute water droplets + splash rings
         */
        let lastWaterSoundTime = 0;
        function pourWaterAt(wx, wy) {
            const splashRadius = 75;

            // Spawn falling water droplets
            for (let i = 0; i < 4; i++) {
                particles.push({
                    type: 'droplet',
                    x: wx + (Math.random() - 0.5) * 48,
                    y: wy - 22 - Math.random() * 20,
                    vx: (Math.random() - 0.5) * 1.4,
                    vy: 2.2 + Math.random() * 2.2,
                    targetY: wy + (Math.random() - 0.5) * 24,
                    size: 4 + Math.random() * 3,
                    alpha: 0.95
                });
            }

            // Ground ripple
            if (Math.random() < 0.45) {
                particles.push({
                    type: 'ripple',
                    x: wx + (Math.random() - 0.5) * 25,
                    y: wy + (Math.random() - 0.5) * 15,
                    r: 4,
                    maxR: 22 + Math.random() * 16,
                    alpha: 0.75
                });
            }

            // Hydrate nearby flowers
            let wateredAny = false;
            for (const f of flowers) {
                const dist = Math.hypot(f.x - wx, (f.y - 15) - wy);
                if (dist <= splashRadius) {
                    const prevHydration = f.hydration;
                    f.hydration = Math.min(100, f.hydration + 18);
                    f.waterBounce = 1.0;
                    if (typeof boostFlowerGrowthOnWater === 'function') {
                        boostFlowerGrowthOnWater(f, 0.045);
                    }
                    wateredAny = true;

                    // If flower just recovered from wilted/thirsty, spawn happy green/blue sparkles!
                    if (prevHydration < 75 && f.hydration >= 75) {
                        for (let s = 0; s < 5; s++) {
                            particles.push({
                                type: 'sparkle',
                                x: f.x + (Math.random() - 0.5) * 30,
                                y: f.y - 20 - Math.random() * 25,
                                vx: (Math.random() - 0.5) * 1.5,
                                vy: -1 - Math.random() * 1.5,
                                size: 3.5,
                                color: '#4EA8DE',
                                alpha: 1
                            });
                        }
                    }
                }
            }

            if (mysteryEgg) {
                const eggDist = Math.hypot(mysteryEgg.x - wx, mysteryEgg.y - wy);
                if (eggDist <= splashRadius) {
                    if (!mysteryEgg._lastWaterTime || Date.now() - mysteryEgg._lastWaterTime > 1200) {
                        mysteryEgg._lastWaterTime = Date.now();
                        tapMysteryEgg(true);
                    }
                }
            }

            const now = performance.now();
            if (now - lastWaterSoundTime > 95) {
                playWaterSound();
                lastWaterSoundTime = now;
            }

            if (wateredAny) updateStatusBadges();
        }

        /**
         * Hujan Alami Panjang: Efek hujan rintik yang lebih lama (8 detik)
         * dengan audio realistis assets/sounds/rain/raining.mp3,
         * tetesan air terus-menerus, dan menyegarkan seluruh bunga di kebun.
         */
        function rainShowerAll() {
            initAudio();
            isRainingShower = true;
            rainShowerDuration = 8.0;
            rainShowerTimer = 8.0;

            // Memainkan suara hujan dari assets/sounds/rain/raining.mp3
            if (typeof playRainSound === 'function') {
                playRainSound(8.0);
            }

            // Langsung menyegarkan bunga & beri animasi membal bahagia
            flowers.forEach(f => {
                f.hydration = 100;
                f.waterBounce = 1.0;
            });
            updateStatusBadges();
            scheduleAutoSave();

            if (typeof showGardenNotice === 'function') {
                showGardenNotice("Hujan segar menyirami seluruh kebun... 🌧️🌱");
            }
        }

        /**
         * Mencari koordinat target titik jatuh hujan yang secara akurat berada
         * di atas medan hijau (grass) atau medan air (water) yang tampak di layar kamera.
         */
        function getRainTargetOnTerrain(customMinX, customMaxX, customMinY, customMaxY) {
            const currentZoom = Math.max(0.1, zoom || 1.0);
            const camMinX = customMinX !== undefined ? customMinX : Math.max(0, -panX / currentZoom - 40);
            const camMaxX = customMaxX !== undefined ? customMaxX : Math.min(WORLD_W, (-panX + screenW) / currentZoom + 40);
            const camMinY = customMinY !== undefined ? customMinY : Math.max(0, -panY / currentZoom - 40);
            const camMaxY = customMaxY !== undefined ? customMaxY : Math.min(WORLD_H, (-panY + screenH) / currentZoom + 40);

            const bb = getIslandBoundingBox();
            const startX = Math.max(camMinX, bb.x);
            const endX = Math.min(camMaxX, bb.x + bb.w);
            const startY = Math.max(camMinY, bb.y);
            const endY = Math.min(camMaxY, bb.y + bb.h);

            // Jika kamera dan pulau beririsan, coba temukan titik acak di rumput atau air
            if (startX < endX && startY < endY) {
                for (let attempt = 0; attempt < 12; attempt++) {
                    const rx = startX + Math.random() * (endX - startX);
                    const ry = startY + Math.random() * (endY - startY);
                    const onWater = isPointOnWater(rx, ry);
                    const onGrass = !onWater && isPointOnGrass(rx, ry);
                    if (onWater || onGrass) {
                        return { x: rx, y: ry, onWater: onWater, onGrass: onGrass };
                    }
                }
            }

            // Jika sampling acak belum dapat (misal bagian pulau melengkung), cari dari kumpulan bunga yang tampak
            if (flowers && flowers.length > 0) {
                const visibleFlowers = flowers.filter(f => f.x >= camMinX && f.x <= camMaxX && f.y >= camMinY && f.y <= camMaxY);
                const pool = visibleFlowers.length > 0 ? visibleFlowers : flowers;
                const f = pool[Math.floor(Math.random() * pool.length)];
                if (f) {
                    const jx = f.x + (Math.random() - 0.5) * 50;
                    const jy = f.y + (Math.random() - 0.5) * 40;
                    const onWater = isPointOnWater(jx, jy);
                    const onGrass = !onWater && isPointOnGrass(jx, jy);
                    if (onWater || onGrass) {
                        return { x: jx, y: jy, onWater: onWater, onGrass: onGrass };
                    }
                    return { x: f.x, y: f.y, onWater: false, onGrass: true };
                }
            }

            // Fallback: pusat pulau
            if (bb && bb.w > 0 && bb.h > 0) {
                const cx = bb.x + bb.w * 0.5;
                const cy = bb.y + bb.h * 0.5;
                const onWater = isPointOnWater(cx, cy);
                return { x: cx, y: cy, onWater: onWater, onGrass: !onWater };
            }

            return null;
        }

        /**
         * Update proses hujan berkelanjutan per frame selama durasi hujan
         */
        function updateRainShower(dt) {
            if (!isRainingShower || rainShowerTimer <= 0) return;

            rainShowerTimer -= dt;

            // Munculkan 6 - 10 tetesan hujan diagonal setiap frame yang jatuh pas di rumput atau air
            const count = Math.floor(6 + Math.random() * 5);
            for (let i = 0; i < count; i++) {
                const target = getRainTargetOnTerrain();
                if (!target) continue;

                const rx = target.x;
                const ry = target.y;
                const fallDist = 130 + Math.random() * 160;
                const vy = 11 + Math.random() * 5;
                const vx = -1.4;
                const fallTime = fallDist / vy;
                const startX = rx - (vx * fallTime);
                const startY = ry - fallDist;

                particles.push({
                    type: 'rainStreak',
                    x: startX,
                    y: startY,
                    vx: vx,
                    vy: vy,
                    targetY: ry,
                    landingX: rx,
                    targetType: target.onWater ? 'water' : 'grass',
                    length: 15 + Math.random() * 12,
                    alpha: 0.65 + Math.random() * 0.3
                });
            }

            // Selama hujan berlangsung, bunga tetap terhidrasi maksimal
            flowers.forEach(f => {
                f.hydration = 100;
                if (Math.random() < 0.035) {
                    f.waterBounce = Math.max(f.waterBounce, 0.45);
                }
            });

            // Ketika durasi hujan selesai
            if (rainShowerTimer <= 0) {
                isRainingShower = false;
                rainShowerTimer = 0;
                flowers.forEach(f => {
                    f.hydration = 100;
                    f.waterBounce = 1.0;
                });
                updateStatusBadges();
                scheduleAutoSave();
                if (typeof triggerRainbowAfterRain === 'function') {
                    triggerRainbowAfterRain();
                } else if (typeof showGardenNotice === 'function') {
                    showGardenNotice("Hujan telah reda... Bunga-bunga kembali segar dan berseri! 🌧️🌸");
                }
                if (typeof playPlantSound === 'function') {
                    setTimeout(playPlantSound, 120);
                }
            }
        }

        function findFlowerAt(wx, wy) {
            // Iterate top-down (front-to-back) in world coordinates
            for (let i = flowers.length - 1; i >= 0; i--) {
                const f = flowers[i];
                const halfW = f.width * 0.52;
                if (
                    wx >= f.x - halfW &&
                    wx <= f.x + halfW &&
                    wy >= f.y - f.height * 0.95 &&
                    wy <= f.y + 12
                ) {
                    return f;
                }
            }
            return null;
        }

        function updateStatusBadges() {
            const countEl = document.getElementById('flowerCountBadge');
            const statusEl = document.getElementById('hydrationStatusBadge');
            const alertDot = document.getElementById('thirstyAlertDot');

            countEl.innerHTML = `<svg class="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3m4.5 9a4.5 4.5 0 1 1-4.5 4.5M16.5 12H21m-9 4.5a4.5 4.5 0 1 1-4.5-4.5M12 16.5V21m-4.5-9H3"/><circle cx="12" cy="12" r="2.5" fill="#F7CE68"/></svg><span>${flowers.length} Bunga</span>`;

            const wiltedCount = flowers.filter(f => f.hydration < 30).length;
            const thirstyCount = flowers.filter(f => f.hydration >= 30 && f.hydration < 60).length;

            if (wiltedCount > 0) {
                statusEl.innerHTML = `<svg class="w-3.5 h-3.5 text-rose-500 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${wiltedCount} Layu (Siram Air!)</span>`;
                statusEl.className = 'font-bold text-rose-700 inline-flex items-center gap-1.5 animate-pulse';
                alertDot.classList.remove('hidden');
            } else if (thirstyCount > 0) {
                statusEl.innerHTML = `<svg class="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span>${thirstyCount} Mulai Haus</span>`;
                statusEl.className = 'font-medium text-sky-700 inline-flex items-center gap-1.5';
                alertDot.classList.remove('hidden');
            } else {
                statusEl.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg><span>Semua Segar</span>`;
                statusEl.className = 'font-medium text-emerald-700 inline-flex items-center gap-1.5';
                alertDot.classList.add('hidden');
            }
        }


        /********************************************************************
         * 6B. TERRAIN UNDO & REDO SYSTEM (CROPPED TO ISLAND BOUNDING BOX)
         ********************************************************************/
        function captureTerrainSnapshot() {
            const bb = getIslandBoundingBox();
            const sx = Math.max(0, bb.x);
            const sy = Math.max(0, bb.y);
            const sw = Math.max(1, Math.min(WORLD_W - sx, bb.w));
            const sh = Math.max(1, Math.min(WORLD_H - sy, bb.h));

            const snapMask = document.createElement('canvas');
            snapMask.width = sw;
            snapMask.height = sh;
            snapMask.getContext('2d').drawImage(maskCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

            let snapWater = null;
            if (waterMaskCanvas) {
                snapWater = document.createElement('canvas');
                snapWater.width = sw;
                snapWater.height = sh;
                snapWater.getContext('2d').drawImage(waterMaskCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
            }

            return {
                x: sx,
                y: sy,
                w: sw,
                h: sh,
                mask: snapMask,
                water: snapWater,
                grassDetails: grassDetails.slice(),
                flowers: flowers.map(f => ({ ...f })),
                animals: typeof animals !== 'undefined' ? animals.map(a => ({ ...a })) : []
            };
        }

        function pushTerrainUndoState() {
            try {
                const snapshot = captureTerrainSnapshot();
                terrainUndoStack.push(snapshot);
                if (terrainUndoStack.length > MAX_TERRAIN_UNDO) {
                    terrainUndoStack.shift();
                }
                terrainRedoStack = [];
                updateTerrainUndoRedoUI();
            } catch (e) {
                console.warn('Failed to capture terrain snapshot:', e);
            }
        }

        function undoTerrainAction() {
            if (terrainUndoStack.length === 0) return;
            if (typeof playClickSound === 'function') playClickSound();

            const current = captureTerrainSnapshot();
            terrainRedoStack.push(current);

            const prev = terrainUndoStack.pop();
            applyTerrainSnapshot(prev);
            updateTerrainUndoRedoUI();
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Perubahan medan diurungkan (Undo) ↩️');
            }
        }

        function redoTerrainAction() {
            if (terrainRedoStack.length === 0) return;
            if (typeof playClickSound === 'function') playClickSound();

            const current = captureTerrainSnapshot();
            terrainUndoStack.push(current);

            const next = terrainRedoStack.pop();
            applyTerrainSnapshot(next);
            updateTerrainUndoRedoUI();
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Perubahan medan diulangi (Redo) ↪️');
            }
        }

        function applyTerrainSnapshot(snap) {
            if (!snap) return;
            const sx = snap.x || 0;
            const sy = snap.y || 0;
            maskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
            if (snap.mask) {
                maskCtx.drawImage(snap.mask, sx, sy);
            }

            if (waterMaskCtx && snap.water) {
                waterMaskCtx.clearRect(0, 0, WORLD_W, WORLD_H);
                waterMaskCtx.drawImage(snap.water, sx, sy);
            }

            grassDetails = snap.grassDetails ? snap.grassDetails.slice() : [];
            if (snap.flowers) {
                flowers = snap.flowers.map(f => ({ ...f }));
            }
            if (snap.animals && typeof animals !== 'undefined') {
                animals.length = 0;
                snap.animals.forEach(a => animals.push({ ...a }));
                if (typeof updateAnimalsBadge === 'function') updateAnimalsBadge();
            }

            fallingObjects = [];
            cachedIslandBB = null;
            updateCollisionGrids();
            rebuildTerrain3DLayer();
            refreshFlowersGrassStatus();
            scheduleAutoSave();
        }

        function updateTerrainUndoRedoUI() {
            const canUndo = terrainUndoStack.length > 0;
            const canRedo = terrainRedoStack.length > 0;

            const undoBtns = [
                document.getElementById('terrainUndoBtn'),
                document.getElementById('dockTerrainUndoBtn')
            ];
            undoBtns.forEach(b => {
                if (b) {
                    b.disabled = !canUndo;
                    b.style.opacity = canUndo ? '1' : '0.35';
                }
            });

            const redoBtns = [
                document.getElementById('terrainRedoBtn'),
                document.getElementById('dockTerrainRedoBtn')
            ];
            redoBtns.forEach(b => {
                if (b) {
                    b.disabled = !canRedo;
                    b.style.opacity = canRedo ? '1' : '0.35';
                }
            });
        }

        window.undoTerrainAction = undoTerrainAction;
        window.redoTerrainAction = redoTerrainAction;
        window.pushTerrainUndoState = pushTerrainUndoState;
        window.updateTerrainUndoRedoUI = updateTerrainUndoRedoUI;


        /********************************************************************
         * 6C. FALLING & DISAPPEARING ANIMATION ENGINE (OBJEK & HEWAN DARAT JATUH)
         ********************************************************************/
        function createWaterSplash(x, y, count = 4) {
            if (typeof particles === 'undefined' || !Array.isArray(particles)) return;
            const cnt = Math.max(1, Math.min(16, count || 4));
            for (let i = 0; i < cnt; i++) {
                particles.push({
                    type: 'droplet',
                    x: x + (Math.random() - 0.5) * 16,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 2.2,
                    vy: -1.6 - Math.random() * 2.2,
                    targetY: y + 6 + Math.random() * 8,
                    size: 3 + Math.random() * 2.5,
                    alpha: 0.95
                });
            }
            particles.push({
                type: 'ripple',
                x: x,
                y: y,
                r: 3,
                maxR: 18 + Math.random() * 12,
                alpha: 0.8
            });
        }
        window.createWaterSplash = createWaterSplash;

        function triggerFallingFlower(flower, sinkIntoWater) {
            fallingObjects.push({
                kind: 'flower',
                flower: flower,
                x: flower.x,
                y: flower.y,
                imgCanvas: flower.imgCanvas,
                width: flower.width,
                height: flower.height,
                sinkIntoWater: sinkIntoWater,
                vx: (Math.random() - 0.5) * 28,
                vy: sinkIntoWater ? 20 : -45,
                rot: (Math.random() - 0.5) * 0.35,
                vRot: (Math.random() - 0.5) * 5.5,
                scale: 1.0,
                alpha: 1.0,
                life: 0.95,
                maxLife: 0.95
            });

            if (sinkIntoWater) {
                if (typeof createWaterSplash === 'function') createWaterSplash(flower.x, flower.y, 6);
                if (typeof playFishSound === 'function') playFishSound();
            } else {
                if (typeof createWaterSplash === 'function') createWaterSplash(flower.x, flower.y, 2);
            }
        }

        function triggerFallingLandAnimal(animal, sinkIntoWater) {
            fallingObjects.push({
                kind: 'animal',
                animal: animal,
                x: animal.x,
                y: animal.y,
                sinkIntoWater: sinkIntoWater,
                vx: (Math.random() - 0.5) * 35,
                vy: sinkIntoWater ? 25 : -55,
                rot: (Math.random() - 0.5) * 0.4,
                vRot: (Math.random() - 0.5) * 5.0,
                scale: 1.0,
                alpha: 1.0,
                life: 1.1,
                maxLife: 1.1
            });

            if (sinkIntoWater) {
                if (typeof createWaterSplash === 'function') createWaterSplash(animal.x, animal.y, 8);
                if (typeof playFishSound === 'function') playFishSound();
            } else {
                if (typeof createWaterSplash === 'function') createWaterSplash(animal.x, animal.y, 3);
            }
        }

        function checkLandObjectsSurvival() {
            // 1. Check Flowers
            for (let i = flowers.length - 1; i >= 0; i--) {
                const f = flowers[i];
                const onWater = typeof isPointOnWater === 'function' && isPointOnWater(f.x, f.y);
                const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(f.x, f.y);
                if (onWater || !onGrass) {
                    flowers.splice(i, 1);
                    triggerFallingFlower(f, onWater);
                }
            }
            updateStatusBadges();

            // 2. Check Land Animals
            if (typeof animals !== 'undefined' && Array.isArray(animals)) {
                for (let i = animals.length - 1; i >= 0; i--) {
                    const a = animals[i];
                    const effectiveHabitat = a.habitat || (a.type === 'fish' ? 'water' : (a.type === 'butterfly' ? 'flying' : 'land'));
                    if (effectiveHabitat === 'land') {
                        const onWater = typeof isPointOnWater === 'function' && isPointOnWater(a.x, a.y);
                        const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(a.x, a.y);
                        const onBridge = typeof isPointOnBridgeDeck === 'function' && isPointOnBridgeDeck(a.x, a.y);
                        if ((onWater || !onGrass) && !onBridge) {
                            // Coba selamatkan hewan ke petak rumput kering terdekat terlebih dahulu
                            let safeSpot = null;
                            if (typeof isPointOnGrass === 'function' && typeof isPointOnWater === 'function') {
                                for (let r = 24; r <= 140; r += 20) {
                                    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 4) {
                                        const sx = a.x + Math.cos(ang) * r;
                                        const sy = a.y + Math.sin(ang) * r;
                                        if (isPointOnGrass(sx, sy) && !isPointOnWater(sx, sy)) {
                                            safeSpot = { x: sx, y: sy };
                                            break;
                                        }
                                    }
                                    if (safeSpot) break;
                                }
                            }
                            if (safeSpot) {
                                a.x = safeSpot.x;
                                a.y = safeSpot.y;
                                a.targetX = safeSpot.x;
                                a.targetY = safeSpot.y;
                                a.state = 'scared';
                                a.bubbleText = '💦 (⊙_⊙;) !';
                                a.bubbleTimer = 2.0;
                                if (typeof createWaterSplash === 'function') createWaterSplash(a.x, a.y, 4);
                                continue;
                            }

                            animals.splice(i, 1);
                            if (typeof followedAnimal !== 'undefined' && followedAnimal === a) {
                                if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                            }
                            triggerFallingLandAnimal(a, onWater);
                            if (typeof showGardenNotice === 'function') {
                                showGardenNotice(`${a.name} terjatuh dan kembali beristirahat! 🐾`);
                            }
                            if (typeof updateAnimalsBadge === 'function') {
                                updateAnimalsBadge();
                            }
                        }
                    } else if (effectiveHabitat === 'water') {
                        const onWater = typeof isPointOnWater === 'function' && isPointOnWater(a.x, a.y);
                        if (!onWater) {
                            let safeWater = null;
                            if (typeof isPointOnWater === 'function') {
                                for (let r = 20; r <= 120; r += 20) {
                                    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 4) {
                                        const sx = a.x + Math.cos(ang) * r;
                                        const sy = a.y + Math.sin(ang) * r;
                                        if (isPointOnWater(sx, sy)) {
                                            safeWater = { x: sx, y: sy };
                                            break;
                                        }
                                    }
                                    if (safeWater) break;
                                }
                            }
                            if (safeWater) {
                                a.x = safeWater.x;
                                a.y = safeWater.y;
                                a.targetX = safeWater.x;
                                a.targetY = safeWater.y;
                                if (typeof createWaterSplash === 'function') createWaterSplash(a.x, a.y, 4);
                                continue;
                            }

                            animals.splice(i, 1);
                            if (typeof followedAnimal !== 'undefined' && followedAnimal === a) {
                                if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                            }
                            triggerFallingLandAnimal(a, false);
                            if (typeof showGardenNotice === 'function') {
                                showGardenNotice(`${a.name} kembali melompat beristirahat karena air tertimbun rumput! 🐟`);
                            }
                            if (typeof updateAnimalsBadge === 'function') {
                                updateAnimalsBadge();
                            }
                        }
                    }
                }
            }
        }

        function updateAndDrawFallingObjects(targetCtx, dt, now) {
            if (!fallingObjects || !fallingObjects.length) return;
            for (let i = fallingObjects.length - 1; i >= 0; i--) {
                const o = fallingObjects[i];
                try {
                    o.life -= dt;
                    if (o.life <= 0) {
                        fallingObjects.splice(i, 1);
                        continue;
                    }

                    const progress = 1 - (o.life / o.maxLife);

                    // Gravity & velocity
                    o.vy += 380 * dt;
                    o.x += o.vx * dt;
                    o.y += o.vy * dt;
                    o.rot += o.vRot * dt;

                    // Shrink and fade
                    o.scale = Math.max(0.01, 1 - progress * 0.75);
                    o.alpha = Math.max(0, 1 - Math.pow(progress, 1.8));

                    if (o.sinkIntoWater && Math.random() < 0.3) {
                        if (typeof createWaterSplash === 'function') {
                            createWaterSplash(o.x, o.y, 1);
                        }
                    }

                    targetCtx.save();
                    targetCtx.globalAlpha = o.alpha;
                    targetCtx.translate(o.x, o.y);
                    targetCtx.rotate(o.rot);
                    targetCtx.scale(o.scale, o.scale);

                    if (o.kind === 'flower') {
                        if (o.imgCanvas) {
                            const w = o.width || 44;
                            const h = o.height || 44;
                            targetCtx.drawImage(o.imgCanvas, -w / 2, -h / 2, w, h);
                        }
                    } else if (o.kind === 'animal') {
                        const a = o.animal;
                        if (a) {
                            const fakeAnim = { ...a, x: 0, y: 0, isBeingDragged: true, state: 'scared' };
                            if (a.type === 'cat' && typeof drawCat === 'function') drawCat(targetCtx, fakeAnim, now);
                            else if (a.type === 'dog' && typeof drawDog === 'function') drawDog(targetCtx, fakeAnim, now);
                            else if (a.type === 'rabbit' && typeof drawRabbit === 'function') drawRabbit(targetCtx, fakeAnim, now);
                            else if (a.type === 'custom' && typeof drawCustomAnimal === 'function') drawCustomAnimal(targetCtx, fakeAnim, now);
                            else if (a.type === 'fish' && typeof drawFish === 'function') drawFish(targetCtx, fakeAnim, now);

                            targetCtx.font = 'bold 13px system-ui, sans-serif';
                            targetCtx.fillStyle = '#E11D48';
                            targetCtx.textAlign = 'center';
                            targetCtx.fillText('.·°՞(っ-ᯅ-ς)՞°·.', 0, -28);
                        }
                    }

                    targetCtx.restore();
                } catch (err) {
                    fallingObjects.splice(i, 1);
                }
            }
        }

        window.triggerFallingFlower = triggerFallingFlower;
        window.triggerFallingLandAnimal = triggerFallingLandAnimal;
        window.checkLandObjectsSurvival = checkLandObjectsSurvival;
        window.updateAndDrawFallingObjects = updateAndDrawFallingObjects;

        /********************************************************************
         * 7. WORLD CANVAS POINTER INTERACTION & SCREEN DRAGGING / PINCH ZOOM
         ********************************************************************/
        let gardenListenersInitialized = false;

        function placePendingDecorationAt(x, y) {
            const spec = window.pendingDecorationSpec;
            if (!spec) return;

            const onGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(x, y) : true;
            const onWater = typeof isPointOnWater === 'function' ? isPointOnWater(x, y) : false;
            const nearWater = typeof isNearWater === 'function' ? isNearWater(x, y, 16) : false;
            const blocked = typeof isPointBlockedByDecoration === 'function' ? isPointBlockedByDecoration(x, y, 14) : false;

            if (blocked) {
                if (typeof showGardenNotice === 'function') {
                    showGardenNotice('Posisi ini terhalang dekorasi lain! 🌿');
                }
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }

            if (spec.habitat !== 'both' && (!onGrass || onWater || nearWater)) {
                if (typeof showGardenNotice === 'function') {
                    showGardenNotice('Dekorasi darat hanya bisa ditaruh di atas tanah rumput! 🌿');
                }
                if (typeof playErrorSound === 'function') playErrorSound();
                return;
            }

            const newDec = {
                id: 'dec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                type: spec.type,
                x: Math.round(x),
                y: Math.round(y),
                width: spec.width,
                height: spec.height,
                habitat: spec.habitat,
                birthScale: 0.2
            };

            if (typeof decorations !== 'undefined') {
                decorations.push(newDec);
            }
            selectedDecoration = newDec;
            if (typeof window !== 'undefined') window.selectedDecoration = newDec;

            if (typeof resolveAnimalDecorationCollisions === 'function') {
                resolveAnimalDecorationCollisions();
            }
            if (typeof incrementStat === 'function') {
                incrementStat('decorationsPlaced', 1);
            }
            if (typeof unlockEncyclopediaEntry === 'function') {
                unlockEncyclopediaEntry('decor_' + spec.type);
            }

            for (let p = 0; p < 12; p++) {
                particles.push({
                    type: 'sparkle',
                    x: x + (Math.random() - 0.5) * 24,
                    y: y - 10 + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 2.2,
                    vy: -1.2 - Math.random() * 2.0,
                    size: 3 + Math.random() * 2.5,
                    color: '#82BD57',
                    alpha: 1.0
                });
            }

            if (typeof playPlantSound === 'function') {
                playPlantSound();
            }
            if (typeof showGardenNotice === 'function') {
                showGardenNotice(`${spec.name} berhasil dipasang! ✨`);
            }
            if (typeof scheduleAutoSave === 'function') {
                scheduleAutoSave();
            }
            if (typeof cancelPlacingDecoration === 'function') {
                cancelPlacingDecoration();
            }
        }
        window.placePendingDecorationAt = placePendingDecorationAt;

        function initGardenEventListeners() {
            if (gardenListenersInitialized) return;
            if (!worldCanvas && typeof document !== 'undefined') {
                worldCanvas = document.getElementById('worldCanvas');
            }
            if (!worldCanvas) return;
            gardenListenersInitialized = true;

            worldCanvas.addEventListener('pointerdown', (e) => {
                if (typeof initAudio === 'function') initAudio();
                try {
                    worldCanvas.setPointerCapture(e.pointerId);
                } catch (err) {}

                // On mobile, if sidebar is open and user interacts with garden, auto-collapse sidebar to maximize view
                const isMobileScreen = window.innerWidth <= 768 || (window.innerHeight <= 500 && window.innerWidth <= 1024);
                if (isMobileScreen) {
                    const sb = document.getElementById('sidebarLaunchers');
                    if (sb && !sb.classList.contains('sidebar-collapsed')) {
                        sb.classList.add('sidebar-collapsed');
                    }
                }

                activeTouchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

                // If 2 pointers down -> start multi-touch pinch-to-zoom & two-finger pan
                if (activeTouchPointers.size === 2) {
                    if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                    const pts = Array.from(activeTouchPointers.values());
                    initialPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                    initialPinchZoom = zoom;
                    initialPinchMidX = (pts[0].x + pts[1].x) / 2;
                    initialPinchMidY = (pts[0].y + pts[1].y) / 2;
                    initialPinchPanX = panX;
                    initialPinchPanY = panY;
                    isPinching = true;
                    isDraggingCanvas = false;
                    draggedFlower = null;
                    return;
                }

                const worldPos = screenToWorld(e.clientX, e.clientY);
                currentWorldX = worldPos.x;
                currentWorldY = worldPos.y;
                lastWorldX = worldPos.x;
                lastWorldY = worldPos.y;
                isPointerDown = true;

                // Middle click (button 1), right click (button 2), or Spacebar held -> Pan canvas freely
                if (e.button === 1 || e.button === 2 || isSpacePressed) {
                    if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                    isDraggingCanvas = true;
                    dragStartScreenX = e.clientX;
                    dragStartScreenY = e.clientY;
                    dragStartPanX = panX;
                    dragStartPanY = panY;
                    worldCanvas.style.cursor = 'grabbing';
                    return;
                }

                if (e.button !== undefined && e.button !== 0) return; // Only process left click for tools

                if (currentTool === 'place-decor' && window.pendingDecorationSpec) {
                    placePendingDecorationAt(worldPos.x, worldPos.y);
                    return;
                }

                if (currentTool === 'plant') {
                    const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(worldPos.x, worldPos.y);
                    const onWater = typeof isPointOnWater === 'function' && isPointOnWater(worldPos.x, worldPos.y);
                    const nearWater = typeof isNearWater === 'function' && isNearWater(worldPos.x, worldPos.y, 22);

                    if (onWater || nearWater) {
                        showGardenNotice('Bunga tidak bisa ditanam di kolam air atau tepian air! 💧🌸');
                        if (typeof playErrorSound === 'function') playErrorSound();
                        return;
                    }
                    if (!onGrass) {
                        showGardenNotice('Bunga hanya bisa ditanam di atas tanah rumput! 🌿');
                        if (typeof playErrorSound === 'function') playErrorSound();
                        return;
                    }
                    if (!pendingFlowerSprite && typeof extractTrimmedFlowerCanvas === 'function') {
                        pendingFlowerSprite = extractTrimmedFlowerCanvas();
                    }
                    if (pendingFlowerSprite) {
                        plantFlowerAt(worldPos.x, worldPos.y, pendingFlowerSprite);
                    }
                    return;
                }

                if (currentTool === 'hand') {
                    if (Array.isArray(droppedSeeds) && droppedSeeds.length > 0) {
                        const hitSeed = droppedSeeds.find(s => Math.hypot(s.x - worldPos.x, s.y - worldPos.y) < 28);
                        if (hitSeed) {
                            pickupDroppedSeed(hitSeed.id);
                            return;
                        }
                    }

                    if (mysteryEgg && Math.hypot(mysteryEgg.x - worldPos.x, mysteryEgg.y - worldPos.y) < 34) {
                        tapMysteryEgg();
                        return;
                    }

                    const hitAnimal = typeof findAnimalAt === 'function' ? findAnimalAt(worldPos.x, worldPos.y) : null;
                    if (hitAnimal) {
                        animalPointerDownPos = { x: e.clientX, y: e.clientY };
                        pendingPetAnimal = hitAnimal;
                        animalLongPressTriggered = false;
                        clearTimeout(animalLongPressTimer);
                        animalLongPressTimer = setTimeout(() => {
                            animalLongPressTriggered = true;
                            if (typeof startFollowingAnimal === 'function') {
                                startFollowingAnimal(hitAnimal);
                            }
                        }, 480);
                        return;
                    }

                    // Clicked on empty or non-animal area -> stop following
                    if (followedAnimal) {
                        if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                        else followedAnimal = null;
                    }

                    const hit = findFlowerAt(worldPos.x, worldPos.y);
                    const hitDecor = (!hit && typeof findDecorationAt === 'function') ? findDecorationAt(worldPos.x, worldPos.y) : null;
                    if (hit) {
                        draggedFlower = hit;
                        draggedFlowerOrigX = hit.x;
                        draggedFlowerOrigY = hit.y;
                        draggedFlowerOffset = { x: hit.x - worldPos.x, y: hit.y - worldPos.y };
                        selectedDecoration = null;
                        if (typeof window !== 'undefined') window.selectedDecoration = null;
                        worldCanvas.style.cursor = 'grabbing';
                    } else if (hitDecor) {
                        selectedDecoration = hitDecor;
                        if (typeof window !== 'undefined') window.selectedDecoration = hitDecor;
                        draggedDecoration = hitDecor;
                        draggedDecorationOrigX = hitDecor.x;
                        draggedDecorationOrigY = hitDecor.y;
                        draggedDecorationOffset = { x: hitDecor.x - worldPos.x, y: hitDecor.y - worldPos.y };
                        dragStartScreenX = e.clientX;
                        dragStartScreenY = e.clientY;
                        worldCanvas.style.cursor = 'grabbing';
                    } else {
                        selectedDecoration = null;
                        if (typeof window !== 'undefined') window.selectedDecoration = null;
                        // Smoothly drag garden canvas on empty area!
                        isDraggingCanvas = true;
                        dragStartScreenX = e.clientX;
                        dragStartScreenY = e.clientY;
                        dragStartPanX = panX;
                        dragStartPanY = panY;
                        worldCanvas.style.cursor = 'grabbing';
                    }
                } else if (currentTool === 'water') {
                    pourWaterAt(worldPos.x, worldPos.y);
                } else if (currentTool === 'land' || currentTool === 'water-terrain' || currentTool === 'grass' || currentTool === 'erase-grass' || currentTool === 'erase-land' || currentTool === 'erase-water' || currentTool === 'erase') {
                    isPaintingTerrain = true;
                    pushTerrainUndoState();
                    if (currentTool === 'land') {
                        modifyGrassTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, false);
                    } else if (currentTool === 'water-terrain') {
                        modifyWaterTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, false);
                    } else if (currentTool === 'grass') {
                        lastGrassPaintX = worldPos.x;
                        lastGrassPaintY = worldPos.y;
                        paintDecorativeGrass(worldPos.x, worldPos.y, worldPos.x, worldPos.y);
                    } else if (currentTool === 'erase-grass') {
                        eraseGrassLine(worldPos.x, worldPos.y, worldPos.x, worldPos.y);
                    } else if (currentTool === 'erase-land') {
                        modifyGrassTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, true);
                    } else if (currentTool === 'erase-water') {
                        modifyWaterTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, true);
                    } else if (currentTool === 'erase') {
                        const hit = findFlowerAt(worldPos.x, worldPos.y);
                        if (hit) {
                            flowers = flowers.filter(f => f.id !== hit.id);
                            triggerFallingFlower(hit, false);
                            updateStatusBadges();
                            scheduleAutoSave();
                        } else {
                            modifyGrassTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, true);
                            modifyWaterTerrain(worldPos.x, worldPos.y, worldPos.x, worldPos.y, true);
                        }
                    }
                }
            });

            function handlePointerMove(e) {
                if (activeTouchPointers.has(e.pointerId)) {
                    activeTouchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                }

                // Cancel long press & initiate animal drag if pointer moves beyond threshold
                if (pendingPetAnimal && !draggedAnimal) {
                    const distMoved = Math.hypot(e.clientX - animalPointerDownPos.x, e.clientY - animalPointerDownPos.y);
                    if (distMoved > 8) {
                        clearTimeout(animalLongPressTimer);
                        animalLongPressTimer = null;
                        draggedAnimal = pendingPetAnimal;
                        pendingPetAnimal = null;
                        draggedAnimalOrigX = draggedAnimal.x;
                        draggedAnimalOrigY = draggedAnimal.y;
                        draggedAnimalOffset = { x: draggedAnimal.x - worldPos.x, y: draggedAnimal.y - worldPos.y };
                        draggedAnimal.isBeingDragged = true;
                        draggedAnimal.state = 'scared';
                        draggedAnimal.bubbleText = '(⸝⸝๑﹏๑⸝⸝)';
                        draggedAnimal.bubbleTimer = 999;
                        if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                        worldCanvas.style.cursor = 'grabbing';
                    }
                }

                // Multi-touch pinch-to-zoom & smooth two-finger pan
                if (isPinching && activeTouchPointers.size >= 2) {
                    if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                    const pts = Array.from(activeTouchPointers.values());
                    const currentDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                    const currentMidX = (pts[0].x + pts[1].x) / 2;
                    const currentMidY = (pts[0].y + pts[1].y) / 2;
                    if (initialPinchDist > 0) {
                        const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialPinchZoom * (currentDist / initialPinchDist)));
                        const worldMid = {
                            x: (initialPinchMidX - initialPinchPanX) / initialPinchZoom,
                            y: (initialPinchMidY - initialPinchPanY) / initialPinchZoom
                        };
                        panX = Math.round(currentMidX - worldMid.x * targetZoom);
                        panY = Math.round(currentMidY - worldMid.y * targetZoom);
                        zoom = targetZoom;
                        clampPan();
                        updateZoomDisplay();
                    }
                    return;
                }

                // Smooth canvas dragging
                if (isDraggingCanvas) {
                    if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                    panX = dragStartPanX + (e.clientX - dragStartScreenX);
                    panY = dragStartPanY + (e.clientY - dragStartScreenY);
                    clampPan();
                    return;
                }

                const worldPos = screenToWorld(e.clientX, e.clientY);
                currentWorldX = worldPos.x;
                currentWorldY = worldPos.y;

                if (!isPointerDown) {
                    hoveredFlower = findFlowerAt(worldPos.x, worldPos.y);
                    hoveredAnimal = typeof findAnimalAt === 'function' ? findAnimalAt(worldPos.x, worldPos.y) : null;
                    if (isSpacePressed) {
                        worldCanvas.style.cursor = 'grab';
                    } else if (currentTool === 'hand') {
                        worldCanvas.style.cursor = (hoveredFlower || hoveredAnimal) ? 'pointer' : 'grab';
                    }
                    return;
                }

                if (currentTool === 'hand' && draggedAnimal) {
                    draggedAnimal.x = worldPos.x + draggedAnimalOffset.x;
                    draggedAnimal.y = worldPos.y + draggedAnimalOffset.y;
                    draggedAnimal.isBeingDragged = true;
                    draggedAnimal.state = 'scared';
                    worldCanvas.style.cursor = 'grabbing';
                } else if (currentTool === 'hand' && draggedFlower) {
                    draggedFlower.x = worldPos.x + draggedFlowerOffset.x;
                    draggedFlower.y = worldPos.y + draggedFlowerOffset.y;
                    draggedFlower.onGrass = isPointOnGrass(draggedFlower.x, draggedFlower.y);
                    flowers.sort((a, b) => a.y - b.y);
                } else if (currentTool === 'hand' && typeof draggedDecoration !== 'undefined' && draggedDecoration) {
                    draggedDecoration.x = worldPos.x + draggedDecorationOffset.x;
                    draggedDecoration.y = worldPos.y + draggedDecorationOffset.y;
                    worldCanvas.style.cursor = 'grabbing';
                } else if (currentTool === 'water') {
                    pourWaterAt(worldPos.x, worldPos.y);
                } else if (currentTool === 'land') {
                    modifyGrassTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, false);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'water-terrain') {
                    modifyWaterTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, false);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'grass') {
                    const grassStepDist = Math.hypot(worldPos.x - lastGrassPaintX, worldPos.y - lastGrassPaintY);
                    if (grassStepDist >= Math.max(26, terrainBrushSize * 0.65)) {
                        paintDecorativeGrass(lastGrassPaintX, lastGrassPaintY, worldPos.x, worldPos.y);
                        lastGrassPaintX = worldPos.x;
                        lastGrassPaintY = worldPos.y;
                    }
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'erase-grass') {
                    eraseGrassLine(lastWorldX, lastWorldY, worldPos.x, worldPos.y);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'erase-land') {
                    modifyGrassTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, true);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'erase-water') {
                    modifyWaterTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, true);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                } else if (currentTool === 'erase') {
                    const hit = findFlowerAt(worldPos.x, worldPos.y);
                    if (hit) {
                        flowers = flowers.filter(f => f.id !== hit.id);
                        triggerFallingFlower(hit, false);
                        updateStatusBadges();
                        scheduleAutoSave();
                    }
                    modifyGrassTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, true);
                    modifyWaterTerrain(lastWorldX, lastWorldY, worldPos.x, worldPos.y, true);
                    lastWorldX = worldPos.x;
                    lastWorldY = worldPos.y;
                }
            }

            worldCanvas.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointermove', (e) => {
                if (isDraggingCanvas) {
                    handlePointerMove(e);
                }
            });

            // Close tool dropdowns when clicking outside
            document.addEventListener('pointerdown', (e) => {
                const pWrapper = document.getElementById('pencilMenuWrapper');
                const eWrapper = document.getElementById('eraserMenuWrapper');
                const inPencil = pWrapper && pWrapper.contains(e.target);
                const inEraser = eWrapper && eWrapper.contains(e.target);
                if (!inPencil && !inEraser) {
                    closeAllToolDropdowns();
                }
            });

            function handlePointerUpOrCancel(e) {
                if (e && e.pointerId !== undefined) {
                    activeTouchPointers.delete(e.pointerId);
                }
                if (activeTouchPointers.size < 2) {
                    isPinching = false;
                }

                // Handle tap vs long-press on animal
                if (pendingPetAnimal) {
                    clearTimeout(animalLongPressTimer);
                    animalLongPressTimer = null;
                    if (!animalLongPressTriggered && typeof petAnimal === 'function') {
                        petAnimal(pendingPetAnimal);
                    }
                    pendingPetAnimal = null;
                    animalLongPressTriggered = false;
                }

                // Handle drop of dragged animal with habitat validation
                if (draggedAnimal) {
                    clearTimeout(animalLongPressTimer);
                    animalLongPressTimer = null;
                    const a = draggedAnimal;
                    draggedAnimal = null;
                    a.isBeingDragged = false;
                    worldCanvas.style.cursor = 'grab';

                    const isWater = typeof isPointOnWater === 'function' ? isPointOnWater(a.x, a.y) : false;
                    const isGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(a.x, a.y) : false;
                    const effectiveHabitat = a.habitat || (a.type === 'fish' ? 'water' : (a.type === 'butterfly' ? 'flying' : 'land'));

                    let isValid = false;
                    let reason = '';

                    const isBlockedByDecor = typeof isPointBlockedByDecoration === 'function' ? isPointBlockedByDecoration(a.x, a.y, 8) : false;
                    const isOnBridge = typeof isPointOnBridgeDeck === 'function' ? isPointOnBridgeDeck(a.x, a.y) : false;

                    if (isBlockedByDecor) {
                        isValid = false;
                        reason = 'Hewan tidak bisa ditaruh menembus objek dekorasi! 🌿';
                    } else if (effectiveHabitat === 'water') {
                        if (isWater) {
                            isValid = true;
                        } else {
                            isValid = false;
                            reason = 'Ikan hanya bisa berenang di medan air! 🐟💦';
                        }
                    } else if (effectiveHabitat === 'flying') {
                        if (isGrass || isWater || isOnBridge) {
                            isValid = true;
                        } else {
                            isValid = false;
                            reason = 'Hewan terbang harus berada di area kebun! 🌿';
                        }
                    } else { // land
                        if (isOnBridge) {
                            isValid = true;
                        } else if (isWater) {
                            isValid = false;
                            reason = 'Hewan darat takut air dan tidak bisa berenang! 🐾💦';
                        } else if (isGrass) {
                            isValid = true;
                        } else {
                            isValid = false;
                            reason = 'Hewan darat hanya bisa berada di tanah rumput! 🌿';
                        }
                    }

                    if (isValid) {
                        a.state = 'idle';
                        a.bubbleText = '(˶˃ ᵕ ˂˶)';
                        a.bubbleTimer = 2.5;
                        if (effectiveHabitat === 'water' && typeof playFishSound === 'function') {
                            playFishSound();
                        } else if (typeof playPetSound === 'function') {
                            playPetSound(a.type);
                        }
                        if (typeof createWaterSplash === 'function') {
                            createWaterSplash(a.x, a.y, isWater ? 5 : 2);
                        }
                        scheduleAutoSave();
                    } else {
                        a.x = draggedAnimalOrigX;
                        a.y = draggedAnimalOrigY;
                        a.state = 'idle';
                        a.bubbleText = '.·°՞(っ-ᯅ-ς)՞°·.';
                        a.bubbleTimer = 3.0;
                        showGardenNotice(reason);
                        if (typeof playErrorSound === 'function') playErrorSound();
                    }
                    updateToolbarUI();
                }

                if (isDraggingCanvas) {
                    isDraggingCanvas = false;
                    updateToolbarUI();
                }

                if (!isPointerDown && activeTouchPointers.size === 0) return;
                if (activeTouchPointers.size === 0) isPointerDown = false;

                try {
                    if (e && e.pointerId !== undefined && worldCanvas) {
                        worldCanvas.releasePointerCapture(e.pointerId);
                    }
                } catch (err) {}

                if (currentTool === 'land' || currentTool === 'water-terrain' || currentTool === 'grass' || currentTool === 'erase-grass' || currentTool === 'erase-land' || currentTool === 'erase-water' || currentTool === 'erase' || currentTool === 'water') {
                    if (currentTool === 'water' && typeof stopWateringSound === 'function') {
                        stopWateringSound();
                    }
                    if (currentTool === 'land' || currentTool === 'water-terrain' || currentTool === 'grass' || currentTool === 'erase-grass' || currentTool === 'erase-land' || currentTool === 'erase-water' || currentTool === 'erase') {
                        isPaintingTerrain = false;
                        cachedIslandBB = null;
                        if (pendingTerrainDirtyRect) {
                            const r = pendingTerrainDirtyRect;
                            pendingTerrainDirtyRect = null;
                            terrainNeedsRebuild = false;
                            rebuildTerrainDirtyRect(r);
                        } else if (terrainNeedsRebuild) {
                            rebuildTerrain3DLayer();
                        }
                        if (currentTool === 'water-terrain' || currentTool === 'land' || currentTool === 'erase-water' || currentTool === 'erase-land' || currentTool === 'erase') {
                            lakeSparklesInitialized = false;
                        }
                        refreshFlowersGrassStatus();
                        checkLandObjectsSurvival();
                        if (typeof checkDecorationsSurvival === 'function') checkDecorationsSurvival();
                    }
                    scheduleAutoSave();
                }

                if (typeof draggedDecoration !== 'undefined' && draggedDecoration) {
                    const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(draggedDecoration.x, draggedDecoration.y);
                    const onWater = typeof isPointOnWater === 'function' && isPointOnWater(draggedDecoration.x, draggedDecoration.y);
                    const valid = draggedDecoration.habitat === 'both' ? (onGrass || onWater) : (onGrass && !onWater);
                    if (!valid) {
                        draggedDecoration.x = draggedDecorationOrigX;
                        draggedDecoration.y = draggedDecorationOrigY;
                        showGardenNotice('Dekorasi darat hanya bisa ditaruh di atas tanah rumput! (Jembatan bisa di atas air) 🌿');
                        if (typeof playErrorSound === 'function') playErrorSound();
                    } else {
                        if (typeof playPlantSound === 'function') playPlantSound();
                        if (typeof resolveAnimalDecorationCollisions === 'function') resolveAnimalDecorationCollisions();
                        scheduleAutoSave();
                    }
                    draggedDecoration = null;
                    updateToolbarUI();
                }

                if (draggedFlower) {
                    const onGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(draggedFlower.x, draggedFlower.y);
                    const onWater = typeof isPointOnWater === 'function' && isPointOnWater(draggedFlower.x, draggedFlower.y);
                    const nearWater = typeof isNearWater === 'function' && isNearWater(draggedFlower.x, draggedFlower.y, 22);

                    if (onWater || nearWater) {
                        draggedFlower.x = draggedFlowerOrigX;
                        draggedFlower.y = draggedFlowerOrigY;
                        draggedFlower.onGrass = isPointOnGrass(draggedFlower.x, draggedFlower.y);
                        showGardenNotice('Bunga tidak bisa ditaruh di kolam air atau tepian air! 💧🌸');
                        if (typeof playErrorSound === 'function') playErrorSound();
                    } else if (!onGrass) {
                        draggedFlower.x = draggedFlowerOrigX;
                        draggedFlower.y = draggedFlowerOrigY;
                        draggedFlower.onGrass = isPointOnGrass(draggedFlower.x, draggedFlower.y);
                        showGardenNotice('Bunga hanya bisa ditaruh di atas tanah rumput! 🌿');
                        if (typeof playErrorSound === 'function') playErrorSound();
                    } else {
                        draggedFlower.onGrass = true;
                        if (typeof playPlantSound === 'function') playPlantSound();
                        scheduleAutoSave();
                    }
                    draggedFlower = null;
                    updateToolbarUI();
                }
            }

            window.addEventListener('pointerup', handlePointerUpOrCancel);
            window.addEventListener('pointercancel', handlePointerUpOrCancel);

            // Trackpad / Mouse Wheel smooth canvas pan & zoom
            function handleWheel(e) {
                if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                e.preventDefault();
                // Scroll to zoom towards pointer (or trackpad pinch with ctrlKey)
                if (e.ctrlKey || e.metaKey || (e.deltaX === 0 && !e.shiftKey)) {
                    const zoomFactor = Math.pow(0.9985, e.deltaY);
                    zoomBy(zoomFactor, e.clientX, e.clientY);
                } else {
                    // Horizontal / shift trackpad pan
                    panX -= e.deltaX;
                    panY -= e.deltaY;
                    clampPan();
                }
            }

            worldCanvas.addEventListener('wheel', handleWheel, { passive: false });

            // Prevent right-click context menu so right drag works cleanly
            worldCanvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });

            window.addEventListener('keydown', (e) => {
                // Ignore if typing inside contenteditable or text input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

                // Undo & Redo shortcuts for garden terrain
                if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
                    const flowerStudio = document.getElementById('flowerStudioModal');
                    const animalStudio = document.getElementById('animalStudioModal');
                    if ((!flowerStudio || flowerStudio.classList.contains('hidden')) &&
                        (!animalStudio || animalStudio.classList.contains('hidden'))) {
                        e.preventDefault();
                        undoTerrainAction();
                        return;
                    }
                }
                if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || ((e.key === 'z' || e.key === 'Z') && e.shiftKey))) {
                    const flowerStudio = document.getElementById('flowerStudioModal');
                    const animalStudio = document.getElementById('animalStudioModal');
                    if ((!flowerStudio || flowerStudio.classList.contains('hidden')) &&
                        (!animalStudio || animalStudio.classList.contains('hidden'))) {
                        e.preventDefault();
                        redoTerrainAction();
                        return;
                    }
                }

                if (e.code === 'Space') {
                    if (!isSpacePressed) {
                        isSpacePressed = true;
                        if (worldCanvas) worldCanvas.style.cursor = 'grab';
                    }
                    return;
                }

                if (e.key === 'Escape') {
                    const pencilMenu = document.getElementById('pencilDropdownMenu');
                    const eraserMenu = document.getElementById('eraserDropdownMenu');
                    if ((pencilMenu && !pencilMenu.classList.contains('hidden')) || (eraserMenu && !eraserMenu.classList.contains('hidden'))) {
                        closeAllToolDropdowns();
                        return;
                    }
                    if (typeof isAsmrFocusMode !== 'undefined' && isAsmrFocusMode && typeof toggleAsmrFocusMode === 'function') {
                        toggleAsmrFocusMode();
                        return;
                    }
                    const decorModal = document.getElementById('decorModal');
                    if (decorModal && !decorModal.classList.contains('hidden')) {
                        if (typeof closeDecorModal === 'function') closeDecorModal();
                        return;
                    }
                    const journalModal = document.getElementById('journalModal');
                    if (journalModal && !journalModal.classList.contains('hidden')) {
                        if (typeof closeJournalModal === 'function') closeJournalModal();
                        return;
                    }
                    if (followedAnimal) {
                        if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                        return;
                    }
                    if (currentTool === 'place-decor') {
                        if (typeof cancelPlacingDecoration === 'function') cancelPlacingDecoration();
                        return;
                    }
                    if (currentTool === 'plant') {
                        exitPlantingMode();
                    }
                    const photoModal = document.getElementById('photoStudioModal');
                    if (photoModal && !photoModal.classList.contains('hidden')) {
                        if (typeof closePhotoStudioModal === 'function') closePhotoStudioModal();
                        return;
                    }
                    const achModal = document.getElementById('achievementModal');
                    if (achModal && !achModal.classList.contains('hidden')) {
                        if (typeof closeAchievementModal === 'function') closeAchievementModal();
                        return;
                    }
                    const animalModal = document.getElementById('animalModal');
                    if (animalModal && !animalModal.classList.contains('hidden')) {
                        closeAnimalModal();
                        return;
                    }
                    const newWorldModal = document.getElementById('newWorldModal');
                    if (newWorldModal && !newWorldModal.classList.contains('hidden')) {
                        closeNewWorldModal();
                        return;
                    }
                    const worldModal = document.getElementById('worldManagerModal');
                    if (worldModal && !worldModal.classList.contains('hidden')) {
                        closeWorldManagerModal();
                        return;
                    }
                    const galleryModal = document.getElementById('flowerGalleryModal');
                    if (galleryModal && !galleryModal.classList.contains('hidden')) {
                        closeGalleryModal();
                        return;
                    }
                    const studioModal = document.getElementById('flowerStudioModal');
                    if (studioModal && !studioModal.classList.contains('hidden')) {
                        closeFlowerStudioModal();
                        return;
                    }
                    const helpModal = document.getElementById('helpModal');
                    if (helpModal && !helpModal.classList.contains('hidden')) {
                        closeHelpModal();
                        return;
                    }
                    const soundDropdown = document.getElementById('soundDropdown');
                    if (soundDropdown && !soundDropdown.classList.contains('hidden')) {
                        if (typeof closeSoundDropdown === 'function') closeSoundDropdown();
                        return;
                    }
                } else if (e.key === '1') {
                    setWorldTool('hand');
                } else if (e.key === '2') {
                    setWorldTool('land');
                } else if (e.key === '3') {
                    setWorldTool('water-terrain');
                } else if (e.key === '4') {
                    setWorldTool('grass');
                } else if (e.key === '5') {
                    setWorldTool('erase-land');
                } else if (e.key === '6') {
                    setWorldTool('erase-water');
                } else if (e.key === '7') {
                    setWorldTool('erase-grass');
                } else if (e.key === '8') {
                    setWorldTool('water');
                } else if (e.key === '+' || e.key === '=') {
                    zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    zoomOut();
                } else if (e.key === '0') {
                    resetZoom();
                }
            });

            window.addEventListener('keyup', (e) => {
                if (e.code === 'Space') {
                    isSpacePressed = false;
                    updateToolbarUI();
                }
            });
        }

        // Initialize immediately if worldCanvas is already present in DOM
        if (typeof document !== 'undefined' && document.getElementById('worldCanvas')) {
            initGardenEventListeners();
        }

        /********************************************************************
         * 8. MAIN ANIMATION & RENDERING LOOP
         ********************************************************************/

        function animateGarden(now) {
            requestAnimationFrame(animateGarden);
            try {
                const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
                lastFrameTime = now;

            // Rebuild 3D grass island directly in real-time as the user paints/edits terrain!
            if (terrainNeedsRebuild) {
                if (pendingTerrainDirtyRect) {
                    const r = pendingTerrainDirtyRect;
                    pendingTerrainDirtyRect = null;
                    terrainNeedsRebuild = false;
                    rebuildTerrainDirtyRect(r);
                } else {
                    rebuildTerrain3DLayer();
                }
            }

            // 1. Apply High-DPI backing scale so all drawings are crisp in Retina/HD
            ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Clear background with warm creamy paper tone (#FDFBF2) or night tone
            // Day/Night transition interpolation
            if (isNightMode) {
                nightTransition = Math.min(1, nightTransition + dt * 1.5);
            } else {
                nightTransition = Math.max(0, nightTransition - dt * 1.5);
            }

            if (nightTransition > 0.001) {
                // Background darkens into deep magical starry night navy (#141E28)
                ctx.fillStyle = '#FDFBF2';
                ctx.fillRect(0, 0, screenW, screenH);
                ctx.fillStyle = `rgba(18, 28, 42, ${nightTransition * 0.94})`;
                ctx.fillRect(0, 0, screenW, screenH);
            } else {
                ctx.fillStyle = '#FDFBF2';
                ctx.fillRect(0, 0, screenW, screenH);
            }

            // Smooth camera tracking if following an animal (respects manual zoom & dragging)
            if (followedAnimal) {
                const stillAlive = animals.some(a => a.id === followedAnimal.id);
                if (!stillAlive) {
                    if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
                    else followedAnimal = null;
                } else if (!isDraggingCanvas && !isPinching) {
                    const targetPanX = screenW / 2 - followedAnimal.x * zoom;
                    const targetPanY = screenH / 2 - (followedAnimal.y - 14) * zoom;

                    panX += (targetPanX - panX) * Math.min(1, dt * 5.0);
                    panY += (targetPanY - panY) * Math.min(1, dt * 5.0);
                    clampPan();
                }
            }

            // 2. Camera Viewport Translation & Scale (Pan & Zoom)
            ctx.save();
            ctx.translate(panX, panY);
            ctx.scale(zoom, zoom);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 3. Draw the 3D Grass Island Layer
            ctx.drawImage(terrainLayerCanvas, 0, 0);

            // 3b. Draw Animated Living Lake Water Surface (Sun Caustics, Shoreline Waves)
            if (typeof drawAnimatedLivingLake === 'function') {
                drawAnimatedLivingLake(ctx, now, dt);
            }

            // Draw Dynamic Rainbow in the sky if active
            if (typeof drawRainbowInWorld === 'function') {
                drawRainbowInWorld(ctx, now);
            }

            // Night ambiance tint over terrain layer
            if (nightTransition > 0.001) {
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(12, 24, 38, ${nightTransition * 0.42})`;
                ctx.fillRect(0, 0, WORLD_W, WORLD_H);
                ctx.restore();
            }

            // Update Dynamic Weather & Atmosphere cycle (Day/Night & Seasons)
            if (typeof updateDynamicWeather === 'function') {
                updateDynamicWeather(dt, now);
            }
            if (typeof updateAtmosphereSimulation === 'function') {
                updateAtmosphereSimulation(dt);
            }
            if (typeof updateContextualNatureAmbience === 'function') {
                updateContextualNatureAmbience(dt);
            }
            updateAnimals(dt, now);
            if (typeof updateAnimalSocialInteractions === 'function') {
                updateAnimalSocialInteractions(dt, now);
            }
            if (typeof updateAndDrawWildVisitors === 'function') {
                updateAndDrawWildVisitors(ctx, dt, now);
            }

            // 4. Update & Draw All Depth-Sorted Flowers, Decorations & Animal Companions
            const witherRate = witherModes[currentWitherModeIndex].rate;

            const renderables = [
                ...flowers.map(f => ({ type: 'flower', y: f.y, obj: f })),
                ...(typeof decorations !== 'undefined' ? decorations.map(d => ({ type: 'decor', y: d.y, obj: d })) : []),
                ...animals.map(a => ({ type: 'animal', y: a.y, obj: a })),
                ...(mysteryEgg ? [{ type: 'egg', y: mysteryEgg.y, obj: mysteryEgg }] : []),
                ...(Array.isArray(droppedSeeds) ? droppedSeeds.map(s => ({ type: 'seed', y: s.y, obj: s })) : [])
            ];
            renderables.sort((a, b) => a.y - b.y);

            for (const r of renderables) {
                if (r.type === 'egg') {
                    drawMysteryEgg(ctx, r.obj, now, dt);
                } else if (r.type === 'seed') {
                    drawDroppedSeed(ctx, r.obj, now, dt);
                } else if (r.type === 'decor') {
                    if (typeof drawDecorationInstance === 'function') {
                        drawDecorationInstance(ctx, r.obj, now, dt);
                    }
                } else if (r.type === 'flower') {
                    const f = r.obj;
                    // Smooth birth pop-in animation
                    if (f.birthScale < 1) {
                        f.birthScale = Math.min(1, f.birthScale + dt * 5.5);
                    }
                    if (f.waterBounce > 0) {
                        f.waterBounce = Math.max(0, f.waterBounce - dt * 3.2);
                    }

                    // Step-by-step flower growth (Biji -> Tunas -> Kuncup -> Mekar)
                    if (typeof updateFlowerGrowth === 'function') {
                        const seasonGrowthMult = (typeof SEASON_DEFINITIONS !== 'undefined' && typeof currentSeason !== 'undefined' && SEASON_DEFINITIONS[currentSeason])
                            ? SEASON_DEFINITIONS[currentSeason].growthMult
                            : 1.0;
                        updateFlowerGrowth(f, dt * seasonGrowthMult);
                    }

                    // Hydration update over time:
                    // Gerimis & hujan menyiram seluruh bunga dan mempercepat pertumbuhan!
                    const isRainingWeather = (typeof dynamicWeather !== 'undefined' && dynamicWeather === 'drizzle') || (typeof isRainingShower !== 'undefined' && isRainingShower);
                    if (isRainingWeather) {
                        f.hydration = Math.min(100, f.hydration + dt * 14.0);
                        if (typeof boostFlowerGrowthOnWater === 'function') {
                            boostFlowerGrowthOnWater(f, dt * 0.35);
                        }
                    } else if (witherRate > 0) {
                        const soilMultiplier = f.onGrass ? 0.55 : 1.45;
                        f.hydration = Math.max(0, f.hydration - dt * witherRate * soilMultiplier);
                    }

                    drawFlowerInstance(ctx, f, now);
                } else {
                    const a = r.obj;
                    if (a.type === 'cat') drawCat(ctx, a, now);
                    else if (a.type === 'dog') drawDog(ctx, a, now);
                    else if (a.type === 'rabbit') drawRabbit(ctx, a, now);
                    else if (a.type === 'butterfly') drawButterfly(ctx, a, now);
                    else if (a.type === 'fish') drawFish(ctx, a, now);
                    else if (a.type === 'custom') drawCustomAnimal(ctx, a, now);
                    if (typeof drawAnimalAccessory === 'function') {
                        drawAnimalAccessory(ctx, a, now);
                    }
                    drawAnimalBubble(ctx, a);
                    drawAnimalNameTag(ctx, a);
                }
            }

            // 4b. Update & Draw Falling Objects (Bunga & Hewan Darat Jatuh & Menghilang)
            updateAndDrawFallingObjects(ctx, dt, now);

            // 4c. Update & Draw 4-Season Effects (Sakura, Sunmotes, Autumn Leaves, Snowflakes)
            if (typeof updateAndDrawSeasonalEffects === 'function') {
                updateAndDrawSeasonalEffects(ctx, dt, now);
            }

            // 5. Update & Draw Fireflies (Kunang-Kunang Malam Hari)
            if (nightTransition > 0.05) {
                updateAndDrawFireflies(ctx, dt, now);
            }

            // 6. Update Rain Shower & Draw Water Droplets, Ripples & Sparkles
            updateRainShower(dt);
            updateAndDrawParticles(ctx, dt);

            // 7. Draw Tool Cursor Preview on Canvas (in World Coordinates)
            drawCursorPreview(ctx, now);

            ctx.restore();

            // 8. Atmospheric Rain Mist Overlay (in Screen Coordinates, drawn above world)
            if (isRainingShower && rainShowerTimer > 0) {
                const elapsed = rainShowerDuration - rainShowerTimer;
                let rainAlpha = 1.0;
                if (elapsed < 1.0) rainAlpha = elapsed;
                else if (rainShowerTimer < 1.8) rainAlpha = rainShowerTimer / 1.8;
                ctx.save();
                ctx.fillStyle = `rgba(130, 185, 215, ${rainAlpha * 0.09})`;
                ctx.fillRect(0, 0, screenW, screenH);
                ctx.restore();
            }

            // Screen Flash during Thunderstorm
            if (typeof lightningScreenFlash === 'number' && lightningScreenFlash > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.65, lightningScreenFlash)})`;
                ctx.fillRect(0, 0, screenW, screenH);
                ctx.restore();
            }

            // Periodically refresh top hydration badge & check achievements
            statusRefreshTimer += dt;
            if (statusRefreshTimer > 1.2) {
                statusRefreshTimer = 0;
                updateStatusBadges();
                if (typeof checkAllAchievements === 'function') {
                    checkAllAchievements();
                }
            }
            } catch (err) {
                console.error('Garden render loop frame error:', err);
            }
        }

        function drawFlowerInstance(targetCtx, f, now) {
            targetCtx.save();
            targetCtx.translate(f.x, f.y);

            // Calculate wilt factor (0 = healthy, 1 = fully wilted)
            const wiltFactor = f.hydration < 55 ? Math.min(1, (55 - f.hydration) / 45) : 0;

            // Gentle breeze sway when healthy; stronger in 'breeze' weather; drooping tilt when wilted
            const weatherSwayMult = (typeof dynamicWeather !== 'undefined' && dynamicWeather === 'breeze') ? 1.85 : 1.0;
            const breeze = Math.sin(now * 0.0022 + f.swayPhase) * 0.055 * weatherSwayMult * (1 - wiltFactor * 0.7);
            const droopAngle = wiltFactor * 0.48; // Tilts ~28 degrees downward when wilted
            targetCtx.rotate(breeze + droopAngle);

            // Bounce scale when watered or freshly planted
            const bounce = Math.sin(f.waterBounce * Math.PI) * 0.18;
            const wiltShrink = 1 - wiltFactor * 0.14;
            const sx = f.birthScale * (1 + bounce) * wiltShrink;
            const sy = f.birthScale * (1 - bounce * 0.4) * wiltShrink;
            targetCtx.scale(sx, sy);

            // If flower is still growing (Biji -> Tunas -> Kuncup), render its growth stage!
            if (typeof f.growthProgress === 'number' && f.growthProgress < 1.0 && typeof drawGrowingFlowerStage === 'function') {
                drawGrowingFlowerStage(targetCtx, f, now, wiltFactor);
                targetCtx.restore();
            } else {
                // Subtle ground shadow beneath full-grown flower stem
                targetCtx.fillStyle = f.onGrass ? 'rgba(43, 80, 32, 0.22)' : 'rgba(60, 55, 45, 0.12)';
                targetCtx.beginPath();
                targetCtx.ellipse(0, 2, f.width * 0.22, 4, 0, 0, Math.PI * 2);
                targetCtx.fill();

                // Draw healthy sprite
                const drawX = -f.width / 2;
                const drawY = -f.height + 6;

                if (wiltFactor < 0.99) {
                    targetCtx.globalAlpha = 1 - wiltFactor * 0.85;
                    targetCtx.drawImage(f.imgCanvas, drawX, drawY, f.width, f.height);
                }

                // Crossfade with desaturated/sepia wilted sprite as hydration drops
                if (wiltFactor > 0.02 && f.wiltedCanvas) {
                    targetCtx.globalAlpha = wiltFactor;
                    targetCtx.drawImage(f.wiltedCanvas, drawX, drawY, f.width, f.height);
                }

                targetCtx.restore();
            }

            // Show subtle hydration / thirst / growth indicator if flower is growing, thirsty/wilted, hovered, or holding Watering Can
            // (Hidden in ASMR Focus Mode so the view is completely clean and zen)
            const isGrowing = typeof f.growthProgress === 'number' && f.growthProgress < 1.0;
            const isFocusActive = typeof isAsmrFocusMode !== 'undefined' && isAsmrFocusMode;
            const showHydrationUI =
                !isFocusActive && (
                    isGrowing ||
                    f.hydration < 55 ||
                    hoveredFlower === f ||
                    draggedFlower === f ||
                    currentTool === 'water'
                );

            if (showHydrationUI) {
                drawFlowerHydrationIndicator(targetCtx, f, now);
            }
        }

        function drawFlowerHydrationIndicator(targetCtx, f, now) {
            targetCtx.save();
            const isGrowing = typeof f.growthProgress === 'number' && f.growthProgress < 1.0;
            const effectiveH = isGrowing ? Math.max(24, f.height * Math.max(0.35, f.growthProgress)) : f.height;
            const barW = 30;
            const barH = 4.5;
            const bx = f.x - barW / 2;
            const by = f.y - effectiveH - 6;

            // If growing and hovered or holding watering can, show cute stage pill
            if (isGrowing && (hoveredFlower === f || currentTool === 'water') && typeof getFlowerStageInfo === 'function') {
                const info = getFlowerStageInfo(f);
                const label = `${info.label} ${info.pct}%`;
                targetCtx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
                const tw = targetCtx.measureText(label).width;
                const pw = tw + 12;
                const ph = 16;
                const px = f.x - pw / 2;
                const py = by - 20;

                targetCtx.fillStyle = 'rgba(253, 251, 242, 0.94)';
                targetCtx.strokeStyle = '#7DB852';
                targetCtx.lineWidth = 1.2;
                targetCtx.beginPath();
                targetCtx.roundRect(px, py, pw, ph, 8);
                targetCtx.fill();
                targetCtx.stroke();

                targetCtx.fillStyle = '#2B5B35';
                targetCtx.textAlign = 'center';
                targetCtx.textBaseline = 'middle';
                targetCtx.fillText(label, f.x, py + ph / 2);
            }

            // If thirsty or wilted, float a little cute vector icon above
            if (f.hydration < 55) {
                const bob = Math.sin(now * 0.006 + f.swayPhase) * 2.5;
                const iy = by - 8 + bob;
                if (f.hydration < 25) {
                    // Cute soft red alert circle with exclamation point
                    targetCtx.fillStyle = '#E76F51';
                    targetCtx.beginPath();
                    targetCtx.arc(f.x, iy, 4.5, 0, Math.PI * 2);
                    targetCtx.fill();
                    targetCtx.fillStyle = '#ffffff';
                    targetCtx.font = 'bold 8px sans-serif';
                    targetCtx.textAlign = 'center';
                    targetCtx.textBaseline = 'middle';
                    targetCtx.fillText('!', f.x, iy);
                } else {
                    // Cute sky-blue water teardrop
                    targetCtx.fillStyle = '#4EA8DE';
                    targetCtx.beginPath();
                    targetCtx.arc(f.x, iy, 3.5, 0, Math.PI);
                    targetCtx.quadraticCurveTo(f.x + 3.5, iy - 2.5, f.x, iy - 6.5);
                    targetCtx.quadraticCurveTo(f.x - 3.5, iy - 2.5, f.x - 3.5, iy);
                    targetCtx.fill();
                }
            }

            // Mini hydration bar when holding Watering Can or hovering
            if (currentTool === 'water' || hoveredFlower === f || f.hydration < 45) {
                targetCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                targetCtx.beginPath();
                targetCtx.roundRect(bx - 1, by - 1, barW + 2, barH + 2, 3);
                targetCtx.fill();

                const pct = Math.max(0, Math.min(1, f.hydration / 100));
                targetCtx.fillStyle = pct > 0.55 ? '#52B788' : pct > 0.25 ? '#F4A261' : '#E76F51';
                targetCtx.beginPath();
                targetCtx.roundRect(bx, by, barW * pct, barH, 2.5);
                targetCtx.fill();
            }
            targetCtx.restore();
        }

        function updateAndDrawParticles(targetCtx, dt) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                if (p.type === 'rainStreak') {
                    p.x += p.vx;
                    p.y += p.vy;

                    targetCtx.save();
                    targetCtx.strokeStyle = `rgba(130, 195, 240, ${p.alpha})`;
                    targetCtx.lineWidth = 1.6;
                    targetCtx.beginPath();
                    targetCtx.moveTo(p.x, p.y);
                    targetCtx.lineTo(p.x - p.vx * 0.7, p.y - p.length);
                    targetCtx.stroke();
                    targetCtx.restore();

                    if (p.y >= p.targetY) {
                        const hitX = p.landingX !== undefined ? p.landingX : p.x;
                        const hitY = p.targetY;
                        const onWater = p.targetType === 'water' || (typeof isPointOnWater === 'function' && isPointOnWater(hitX, hitY));

                        if (onWater) {
                            particles.push({
                                type: 'ripple',
                                x: hitX,
                                y: hitY,
                                r: 2,
                                maxR: 12 + Math.random() * 8,
                                alpha: 0.65,
                                color: 'rgba(130, 195, 240, '
                            });
                            if (Math.random() < 0.28) {
                                particles.push({
                                    type: 'droplet',
                                    x: hitX + (Math.random() - 0.5) * 4,
                                    y: hitY - 2,
                                    vx: (Math.random() - 0.5) * 1.0,
                                    vy: -1.2 - Math.random() * 0.8,
                                    size: 2.0,
                                    targetY: hitY,
                                    alpha: 0.75
                                });
                            }
                        } else {
                            particles.push({
                                type: 'ripple',
                                x: hitX,
                                y: hitY,
                                r: 1.5,
                                maxR: 7 + Math.random() * 4,
                                alpha: 0.45,
                                color: 'rgba(165, 218, 175, '
                            });
                            if (Math.random() < 0.32) {
                                particles.push({
                                    type: 'sparkle',
                                    x: hitX,
                                    y: hitY - 2,
                                    vx: (Math.random() - 0.5) * 1.4,
                                    vy: -0.8 - Math.random() * 0.8,
                                    size: 2.0,
                                    color: Math.random() < 0.5 ? '#98E4B8' : '#7AC5F5',
                                    alpha: 0.8
                                });
                            }
                        }
                        particles.splice(i, 1);
                    }
                } else if (p.type === 'droplet') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.18;

                    targetCtx.save();
                    targetCtx.fillStyle = `rgba(78, 168, 222, ${p.alpha})`;
                    targetCtx.beginPath();
                    targetCtx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
                    targetCtx.fill();
                    targetCtx.restore();

                    if (p.y >= p.targetY) {
                        particles.push({
                            type: 'ripple',
                            x: p.x,
                            y: p.targetY,
                            r: 2,
                            maxR: 14,
                            alpha: 0.65
                        });
                        particles.splice(i, 1);
                    }
                } else if (p.type === 'ripple') {
                    p.r += dt * 38;
                    p.alpha -= dt * 1.4;
                    if (p.alpha <= 0 || p.r >= p.maxR) {
                        particles.splice(i, 1);
                        continue;
                    }
                    targetCtx.save();
                    targetCtx.strokeStyle = p.color ? `${p.color}${Math.max(0, p.alpha)})` : `rgba(78, 168, 222, ${Math.max(0, p.alpha)})`;
                    targetCtx.lineWidth = 1.5;
                    targetCtx.beginPath();
                    targetCtx.ellipse(p.x, p.y, p.r, p.r * 0.45, 0, 0, Math.PI * 2);
                    targetCtx.stroke();
                    targetCtx.restore();
                } else if (p.type === 'sparkle') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= dt * 1.3;
                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                    targetCtx.save();
                    targetCtx.globalAlpha = Math.max(0, p.alpha);
                    targetCtx.fillStyle = p.color;
                    targetCtx.beginPath();
                    targetCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    targetCtx.fill();
                    targetCtx.restore();
                } else if (p.type === 'heart') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha -= dt * 0.9;
                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                    targetCtx.save();
                    targetCtx.globalAlpha = Math.max(0, p.alpha);
                    targetCtx.font = `${Math.round(p.size)}px 'Patrick Hand', sans-serif`;
                    targetCtx.textAlign = 'center';
                    targetCtx.textBaseline = 'middle';
                    targetCtx.fillText('❤️', p.x, p.y);
                    targetCtx.restore();
                } else if (p.type === 'floatingText') {
                    p.x += (p.vx || 0);
                    p.y += (p.vy || -14) * dt;
                    p.alpha -= dt * (p.decay || 0.6);
                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                    targetCtx.save();
                    targetCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
                    targetCtx.font = `bold ${p.fontSize || 16}px 'Patrick Hand', sans-serif`;
                    targetCtx.textAlign = 'center';
                    targetCtx.textBaseline = 'middle';
                    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
                    targetCtx.lineWidth = 3;
                    targetCtx.strokeText(p.text, p.x, p.y);
                    targetCtx.fillStyle = p.color || '#FACC15';
                    targetCtx.fillText(p.text, p.x, p.y);
                    targetCtx.restore();
                } else if (p.type === 'petal') {
                    p.x += (p.vx || 0) * dt;
                    p.y += (p.vy || 0) * dt;
                    p.rotation = (p.rotation || 0) + (p.vRot || 2) * dt;
                    p.alpha -= dt * (p.decay || 0.5);
                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                    targetCtx.save();
                    targetCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
                    targetCtx.translate(p.x, p.y);
                    targetCtx.rotate(p.rotation);
                    targetCtx.fillStyle = p.color || '#F472B6';
                    targetCtx.beginPath();
                    targetCtx.ellipse(0, 0, p.size || 6, (p.size || 6) * 0.5, 0, 0, Math.PI * 2);
                    targetCtx.fill();
                    targetCtx.restore();
                }
            }
        }

        function drawCursorPreview(targetCtx) {
            if (currentWorldX <= 0 && currentWorldY <= 0) return;

            targetCtx.save();
            if (currentTool === 'land' || currentTool === 'water-terrain' || currentTool === 'grass' || currentTool === 'erase-grass' || currentTool === 'erase-land' || currentTool === 'erase-water' || currentTool === 'erase') {
                if (currentTool === 'water-terrain') {
                    targetCtx.strokeStyle = '#0284C7';
                    targetCtx.fillStyle = 'rgba(2, 132, 199, 0.08)';
                } else if (currentTool === 'erase-grass') {
                    targetCtx.strokeStyle = '#059669';
                    targetCtx.fillStyle = 'rgba(5, 150, 105, 0.08)';
                } else if (currentTool === 'erase-land') {
                    targetCtx.strokeStyle = '#D97706';
                    targetCtx.fillStyle = 'rgba(217, 119, 6, 0.12)';
                } else if (currentTool === 'erase-water') {
                    targetCtx.strokeStyle = '#0284C7';
                    targetCtx.fillStyle = 'rgba(2, 132, 199, 0.12)';
                } else if (currentTool === 'land') {
                    targetCtx.strokeStyle = '#2B5B35';
                    targetCtx.fillStyle = 'rgba(43, 91, 53, 0.08)';
                } else if (currentTool === 'grass') {
                    targetCtx.strokeStyle = '#16A34A';
                    targetCtx.fillStyle = 'rgba(22, 163, 74, 0.08)';
                } else {
                    targetCtx.strokeStyle = '#D9534F';
                    targetCtx.fillStyle = 'rgba(217, 83, 79, 0.08)';
                }
                targetCtx.lineWidth = 2;
                targetCtx.setLineDash([5, 5]);
                targetCtx.beginPath();
                targetCtx.arc(currentWorldX, currentWorldY, terrainBrushSize, 0, Math.PI * 2);
                targetCtx.fill();
                targetCtx.stroke();
            } else if (currentTool === 'water') {
                targetCtx.strokeStyle = 'rgba(78, 168, 222, 0.55)';
                targetCtx.fillStyle = 'rgba(78, 168, 222, 0.08)';
                targetCtx.lineWidth = 1.8;
                targetCtx.beginPath();
                targetCtx.arc(currentWorldX, currentWorldY, 55, 0, Math.PI * 2);
                targetCtx.fill();
                targetCtx.stroke();
                // Cute water droplet vector on cursor
                targetCtx.fillStyle = '#0284C7';
                targetCtx.beginPath();
                const dropX = currentWorldX + 12;
                const dropY = currentWorldY - 12;
                targetCtx.arc(dropX, dropY, 5, 0, Math.PI);
                targetCtx.quadraticCurveTo(dropX + 5, dropY - 3.5, dropX, dropY - 9);
                targetCtx.quadraticCurveTo(dropX - 5, dropY - 3.5, dropX - 5, dropY);
                targetCtx.fill();
            } else if (currentTool === 'plant' && pendingFlowerSprite) {
                const near = isNearGrass(currentWorldX, currentWorldY, 44);

                // Range indicator ring at base
                targetCtx.lineWidth = 2;
                targetCtx.setLineDash([4, 4]);
                targetCtx.strokeStyle = near ? '#477431' : '#D9534F';
                targetCtx.fillStyle = near ? 'rgba(71, 116, 49, 0.16)' : 'rgba(217, 83, 79, 0.16)';
                targetCtx.beginPath();
                targetCtx.ellipse(currentWorldX, currentWorldY, 26, 12, 0, 0, Math.PI * 2);
                targetCtx.fill();
                targetCtx.stroke();
                targetCtx.setLineDash([]);

                if (!near) {
                    targetCtx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
                    targetCtx.fillStyle = '#D9534F';
                    targetCtx.textAlign = 'center';
                    targetCtx.fillText('Terlalu jauh dari rumput', currentWorldX, currentWorldY + 22);
                } else {
                    targetCtx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
                    targetCtx.fillStyle = '#2B5B35';
                    targetCtx.textAlign = 'center';
                    targetCtx.fillText('Klik untuk menanam', currentWorldX, currentWorldY + 22);
                }

                targetCtx.globalAlpha = near ? 0.85 : 0.4;
                const maxDim = 68;
                let w = pendingFlowerSprite.width;
                let h = pendingFlowerSprite.height;
                if (w > maxDim || h > maxDim) {
                    const r = maxDim / Math.max(w, h);
                    w *= r;
                    h *= r;
                }
                targetCtx.drawImage(pendingFlowerSprite, currentWorldX - w / 2, currentWorldY - h + 6, w, h);
            } else if (currentTool === 'place-decor' && window.pendingDecorationSpec) {
                const spec = window.pendingDecorationSpec;
                const onGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(currentWorldX, currentWorldY) : true;
                const onWater = typeof isPointOnWater === 'function' ? isPointOnWater(currentWorldX, currentWorldY) : false;
                const nearWater = typeof isNearWater === 'function' ? isNearWater(currentWorldX, currentWorldY, 16) : false;
                const blocked = typeof isPointBlockedByDecoration === 'function' ? isPointBlockedByDecoration(currentWorldX, currentWorldY, 14) : false;

                let isValid = false;
                let reason = '';

                if (blocked) {
                    isValid = false;
                    reason = 'Terhalang dekorasi lain!';
                } else if (spec.habitat === 'both') {
                    isValid = true;
                    reason = 'Klik untuk memasang jembatan';
                } else if (!onGrass || onWater || nearWater) {
                    isValid = false;
                    reason = 'Dekorasi darat harus di atas rumput!';
                } else {
                    isValid = true;
                    reason = 'Klik untuk memasang';
                }

                // Range indicator ring at base
                const rw = (spec.width || 48) * 0.52;
                const rh = (spec.habitat === 'both' ? 12 : 9);
                targetCtx.lineWidth = 2.2;
                targetCtx.setLineDash([5, 4]);
                targetCtx.strokeStyle = isValid ? '#22C55E' : '#EF4444';
                targetCtx.fillStyle = isValid ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
                targetCtx.beginPath();
                targetCtx.ellipse(currentWorldX, currentWorldY, rw + 4, rh + 4, 0, 0, Math.PI * 2);
                targetCtx.fill();
                targetCtx.stroke();
                targetCtx.setLineDash([]);

                targetCtx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
                targetCtx.fillStyle = isValid ? '#2B5B35' : '#DC2626';
                targetCtx.textAlign = 'center';
                targetCtx.fillText(reason, currentWorldX, currentWorldY + rh + 18);

                // Draw holographic preview of decoration
                targetCtx.save();
                targetCtx.globalAlpha = isValid ? 0.8 : 0.42;
                const dummyDec = {
                    type: spec.type,
                    x: currentWorldX,
                    y: currentWorldY,
                    width: spec.width,
                    height: spec.height,
                    birthScale: 1
                };
                if (typeof drawDecorationInstance === 'function') {
                    drawDecorationInstance(targetCtx, dummyDec, performance.now(), 0);
                }
                targetCtx.restore();
            }
            targetCtx.restore();
        }


        /********************************************************************
         * 8.5. FIREFLIES (KUNANG-KUNANG MALAM HARI) & DAY/NIGHT TOGGLE
         ********************************************************************/
        function toggleDayNightMode() {
            setDayNightMode(!isNightMode, false);
            if (typeof resetDayCycleTimer === 'function') resetDayCycleTimer();
        }

        function setDayNightMode(nightState, silent = false) {
            isNightMode = !!nightState;
            const btn = document.getElementById('dayNightToggleBtn');
            const icon = document.getElementById('dayNightIcon');
            const label = document.getElementById('dayNightLabel');

            if (isNightMode) {
                if (icon) icon.innerHTML = '<svg class="w-3.5 h-3.5 text-amber-300 inline" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
                if (label) label.textContent = 'Malam';
                if (btn) {
                    btn.classList.add('bg-indigo-900', 'text-amber-200', 'border-indigo-700');
                    btn.classList.remove('bg-amber-100', 'text-amber-800', 'border-amber-300');
                }
                initFireflies();
                if (!silent && typeof showGardenNotice === 'function') {
                    showGardenNotice('Malam tiba... Kunang-kunang mulai menerangi kebun dengan syahdu. ✨🌙');
                }
                if (!silent && typeof playChimeSound === 'function') playChimeSound();
                if (typeof incrementStat === 'function') {
                    incrementStat('nightsVisited', 1);
                }
            } else {
                if (icon) icon.innerHTML = '<svg class="w-3.5 h-3.5 text-amber-600 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
                if (label) label.textContent = 'Siang';
                if (btn) {
                    btn.classList.remove('bg-indigo-900', 'text-amber-200', 'border-indigo-700');
                    btn.classList.add('bg-amber-100', 'text-amber-800', 'border-amber-300');
                }
                if (!silent && typeof showGardenNotice === 'function') {
                    showGardenNotice('Matahari terbit! Kebun kembali cerah dan hangat berseri. ☀️');
                }
            }

            if (!silent && typeof scheduleAutoSave === 'function') scheduleAutoSave();
        }

        function initFireflies() {
            fireflies = [];
            const count = 38;
            const cx = WORLD_W * 0.5;
            const cy = WORLD_H * 0.52;

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 380;
                fireflies.push({
                    x: cx + Math.cos(angle) * dist,
                    y: cy + Math.sin(angle) * (dist * 0.6) - 15 - Math.random() * 45,
                    vx: (Math.random() - 0.5) * 14,
                    vy: (Math.random() - 0.5) * 10,
                    size: 2.2 + Math.random() * 2.5,
                    glowSize: 18 + Math.random() * 16,
                    pulseSpeed: 2.2 + Math.random() * 2.8,
                    pulseOffset: Math.random() * Math.PI * 2,
                    hue: 52 + (Math.random() - 0.5) * 20 // Warm golden-green firefly glow
                });
            }
        }

        function updateAndDrawFireflies(targetCtx, dt, now) {
            const cx = WORLD_W * 0.5;
            const cy = WORLD_H * 0.52;

            for (const f of fireflies) {
                // Gentle floating wander
                f.x += f.vx * dt + Math.sin(now * 0.002 + f.pulseOffset) * 0.35;
                f.y += f.vy * dt + Math.cos(now * 0.0025 + f.pulseOffset) * 0.25;

                // Soft wander velocity steering
                f.vx += (Math.random() - 0.5) * 4 * dt;
                f.vy += (Math.random() - 0.5) * 3 * dt;
                f.vx = Math.max(-18, Math.min(18, f.vx));
                f.vy = Math.max(-14, Math.min(14, f.vy));

                // Tether gently near island center
                const dx = cx - f.x;
                const dy = cy - f.y;
                if (Math.hypot(dx, dy) > 420) {
                    f.vx += (dx * 0.0004);
                    f.vy += (dy * 0.0004);
                }

                // Breathing glow pulse
                const pulse = (Math.sin(now * 0.0035 * f.pulseSpeed + f.pulseOffset) + 1) * 0.5;
                const alpha = (0.25 + pulse * 0.75) * nightTransition;

                targetCtx.save();
                targetCtx.globalCompositeOperation = 'screen';

                // Outer ambient radial glow halo
                const rad = f.glowSize * (0.8 + pulse * 0.5);
                const glowGrad = targetCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
                glowGrad.addColorStop(0, `hsla(${f.hue}, 100%, 75%, ${alpha * 0.65})`);
                glowGrad.addColorStop(0.35, `hsla(${f.hue}, 95%, 65%, ${alpha * 0.28})`);
                glowGrad.addColorStop(1, `hsla(${f.hue}, 90%, 55%, 0)`);

                targetCtx.fillStyle = glowGrad;
                targetCtx.beginPath();
                targetCtx.arc(f.x, f.y, rad, 0, Math.PI * 2);
                targetCtx.fill();

                // Bright glowing core
                targetCtx.fillStyle = `rgba(255, 255, 220, ${alpha * 0.95})`;
                targetCtx.beginPath();
                targetCtx.arc(f.x, f.y, f.size * (0.8 + pulse * 0.3), 0, Math.PI * 2);
                targetCtx.fill();

                targetCtx.restore();
            }
        }

        /********************************************************************
         * 9. UI HELPERS: SNAPSHOT, RESET, MOBILE STUDIO TOGGLE & MODALS
         ********************************************************************/
        function focusTitle() {
            const el = document.getElementById('gardenTitle');
            el.focus();
            // Place caret at end
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function toggleFlowerStudio() {
            openFlowerStudioModal();
        }

        function openHelpModal() {
            document.getElementById('helpModal').classList.remove('hidden');
        }

        function closeHelpModal() {
            document.getElementById('helpModal').classList.add('hidden');
        }

        function resetToDefaultGarden() {
            createDefaultOvalIsland();
            createStarterFlowersMatchingReference();
            clearFlowerPad();
            centerGardenView();
            closeHelpModal();
            playPlantSound();
            scheduleAutoSave();
        }

        function downloadGardenSnapshot() {
            // Render a clean snapshot including the title at top
            const snapCanvas = document.createElement('canvas');
            snapCanvas.width = screenW;
            snapCanvas.height = screenH;
            const sCtx = snapCanvas.getContext('2d');

            // Background + World as currently visible on screen
            sCtx.drawImage(worldCanvas, 0, 0);

            // Title text at top center
            const titleText = document.getElementById('gardenTitle').innerText.trim() || "Fella's Garden";
            sCtx.font = 'bold 34px "Patrick Hand", cursive, sans-serif';
            sCtx.fillStyle = '#2B5B35';
            sCtx.textAlign = 'center';
            sCtx.fillText(titleText, screenW / 2, 46);

            const link = document.createElement('a');
            link.download = 'fellas-garden.png';
            link.href = snapCanvas.toDataURL('image/png');
            link.click();
        }

        /**
         * Responsive resize & orientation change handler
         * Seamlessly maintains view centering and auto-adapts zoom between portrait and landscape modes
         */
        function handleResponsiveResize() {
            const oldW = screenW;
            const oldH = screenH;
            const oldIsPortrait = oldH > oldW;
            const centerWorld = screenToWorld(oldW / 2, oldH / 2);

            initCanvases();

            const newIsPortrait = screenH > screenW;

            // If phone orientation switched between portrait and landscape, adjust zoom so the garden fits comfortably
            if (oldIsPortrait !== newIsPortrait && (screenW < 1000 || screenH < 1000)) {
                if (newIsPortrait) {
                    zoom = Math.max(MIN_ZOOM, Math.min(0.50, (screenW * 0.90) / 960));
                } else {
                    zoom = Math.max(MIN_ZOOM, Math.min(0.85, (screenH * 0.90) / 720));
                }
            }

            if (typeof followedAnimal !== 'undefined' && followedAnimal) {
                panX = Math.round(screenW / 2 - followedAnimal.x * zoom);
                panY = Math.round(screenH / 2 - followedAnimal.y * zoom);
            } else {
                panX = Math.round(screenW / 2 - centerWorld.x * zoom);
                panY = Math.round(screenH / 2 - centerWorld.y * zoom);
            }
            clampPan();
            updateZoomDisplay();
        }

        // Handle responsive resize & mobile orientation changes smoothly
        window.addEventListener('resize', handleResponsiveResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResponsiveResize, 60);
            setTimeout(handleResponsiveResize, 220);
        });
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                setTimeout(handleResponsiveResize, 60);
                setTimeout(handleResponsiveResize, 220);
            });
        }
        window.handleResponsiveResize = handleResponsiveResize;

        // Global function bindings on window for robust HTML onclick access
        window.zoomBy = zoomBy;
        window.zoomIn = zoomIn;
        window.zoomOut = zoomOut;
        window.resetZoom = resetZoom;
        window.updateZoomDisplay = updateZoomDisplay;
        window.clampPan = clampPan;
        window.centerGardenView = centerGardenView;
        window.screenToWorld = screenToWorld;
        window.worldToScreen = worldToScreen;
        window.setWorldTool = setWorldTool;
        window.updateToolbarUI = updateToolbarUI;
        window.initCanvases = initCanvases;
        window.initGardenEventListeners = initGardenEventListeners;
        window.animateGarden = animateGarden;
        window.downloadGardenSnapshot = downloadGardenSnapshot;
        window.resetToDefaultGarden = resetToDefaultGarden;
        window.openHelpModal = openHelpModal;
        window.closeHelpModal = closeHelpModal;
        window.focusTitle = focusTitle;
        window.toggleFlowerStudio = toggleFlowerStudio;
        window.plantFlowerAt = plantFlowerAt;
        window.exitPlantingMode = exitPlantingMode;
        window.cycleWitherSpeed = cycleWitherSpeed;
        window.rainShowerAll = rainShowerAll;
        window.getIslandBoundingBox = getIslandBoundingBox;
        window.getRainTargetOnTerrain = getRainTargetOnTerrain;
        window.toggleDayNightMode = toggleDayNightMode;
        window.isPointOnWater = isPointOnWater;
        window.modifyWaterTerrain = modifyWaterTerrain;
        window.eraseGrassAt = eraseGrassAt;
        window.eraseGrassLine = eraseGrassLine;
        window.updateStatusBadges = updateStatusBadges;
        window.updateWitherModeDisplay = updateWitherModeDisplay;
        function toggleZenMode() {
            const isZen = document.body.classList.toggle('zen-mode');
            const restorePill = document.getElementById('zenModeRestorePill');
            if (restorePill) {
                if (isZen) {
                    restorePill.classList.remove('hidden');
                    restorePill.classList.add('flex');
                } else {
                    restorePill.classList.add('hidden');
                    restorePill.classList.remove('flex');
                }
            }
            if (typeof showGardenNotice === 'function') {
                if (isZen) {
                    showGardenNotice('Mode Bersih aktif! Nikmati kebun layar penuh tanpa tombol. Ketuk "Tampilkan Menu" di pojok kanan atas kapan saja. ✨🌿');
                } else {
                    showGardenNotice('Menu dan alat berkebun ditampilkan kembali.');
                }
            }
        }

        function toggleSidebarDrawer() {
            const sb = document.getElementById('sidebarLaunchers');
            if (!sb) return;
            sb.classList.toggle('sidebar-collapsed');
        }

        window.toggleZenMode = toggleZenMode;
        window.toggleSidebarDrawer = toggleSidebarDrawer;
        window.togglePencilDropdown = togglePencilDropdown;
        window.toggleEraserDropdown = toggleEraserDropdown;
        window.closeAllToolDropdowns = closeAllToolDropdowns;
        window.selectPencilSubTool = selectPencilSubTool;
        window.selectEraserSubTool = selectEraserSubTool;
