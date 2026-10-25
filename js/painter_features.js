/********************************************************************
 * FELLA'S GARDEN - PAINTER GAMEPLAY FEATURES (js/painter_features.js)
 *
 * Implements the 7 Approved Painter Features:
 * 1. Kuas Spesial (Pencil, Watercolor, Crayon, Glow)
 * 2. Pesanan Lukisan dari Hewan (Art Commissions + Live Animal Reaction)
 * 3. Timelapse Goresan saat Ditanam & Replay di Studio
 * 4. Pameran Lukisan di Kebun (Easel Decoration + Kritikus Profesor Hoot)
 * 5. Lukis Rasi Bintang di Langit Malam (Interactive Star Constellations)
 * 6. Tantangan Melukis Harian (Daily Painting Challenges)
 * 7. Cat yang Hidup Terkena Cuaca (Living Paint Weather Visuals)
 ********************************************************************/

(function () {
    'use strict';

    // =========================================================================
    // 1. SPECIAL BRUSHES ENGINE + STROKE TIMELAPSE RECORDING
    // =========================================================================
    var studioBrushType = 'pencil'; // 'pencil' | 'watercolor' | 'crayon' | 'glow'
    var recordedFlowerStrokes = [];
    var currentRecordingStroke = null;
    var isReplayingTimelapse = false;

    var currentPadEffects = {
        hasWatercolor: false,
        hasCrayon: false,
        hasGlowBrush: false,
        glowColor: '#F7CE68'
    };

    function resetPadPainterMetadata() {
        recordedFlowerStrokes = [];
        currentRecordingStroke = null;
        currentPadEffects = {
            hasWatercolor: false,
            hasCrayon: false,
            hasGlowBrush: false,
            glowColor: '#F7CE68'
        };
        liveStroke = null;
    }

    function setStudioBrushType(type) {
        studioBrushType = type;
        window.studioBrushType = type;

        if (typeof setStudioTool === 'function' && studioTool !== 'pencil') {
            setStudioTool('pencil');
        }

        // Update UI buttons
        const types = ['pencil', 'watercolor', 'crayon', 'glow'];
        types.forEach(t => {
            const btn = document.getElementById('brushTypeBtn-' + t);
            if (btn) {
                if (t === type) {
                    btn.className = 'brush-type-pill active px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2B5B35] text-white shadow-xs transition inline-flex items-center gap-1 cursor-pointer';
                } else {
                    btn.className = 'brush-type-pill px-2.5 py-1 rounded-full text-[11px] font-bold bg-white hover:bg-[#eef5e6] text-[#2B5B35] border border-[#c5d9b7] transition inline-flex items-center gap-1 cursor-pointer';
                }
            }
        });
    }

    // =========================================================================
    // SMOOTH STROKE ENGINE (Cat Air & Kuas Cahaya)
    // Each stroke is re-rendered from its full point list on a temporary layer
    // and then composited once over the pad snapshot taken at pointer-down.
    // This avoids the beads / dark joints that appear when semi-transparent
    // segments are stamped one after another.
    // =========================================================================
    var liveStroke = null;

    function hexToRgb(hex) {
        let h = String(hex || '#000000').replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const n = parseInt(h, 16);
        if (isNaN(n)) return { r: 0, g: 0, b: 0 };
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function rgba(c, a) {
        return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
    }

    function mixWithWhite(c, amt) {
        return {
            r: Math.round(c.r + (255 - c.r) * amt),
            g: Math.round(c.g + (255 - c.g) * amt),
            b: Math.round(c.b + (255 - c.b) * amt)
        };
    }

    function darken(c, amt) {
        return {
            r: Math.round(c.r * (1 - amt)),
            g: Math.round(c.g * (1 - amt)),
            b: Math.round(c.b * (1 - amt))
        };
    }

    // Trace a smooth curve through the points (midpoint quadratic smoothing)
    function traceSmoothPath(ctx, pts) {
        ctx.beginPath();
        if (pts.length === 1) {
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[0].x + 0.01, pts[0].y);
            return;
        }
        ctx.moveTo(pts[0].x, pts[0].y);
        if (pts.length === 2) {
            ctx.lineTo(pts[1].x, pts[1].y);
            return;
        }
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
    }

    // Light low-pass filter so shaky pointer input becomes a flowing line
    function relaxPoints(pts) {
        if (pts.length < 3) return pts;
        const out = [pts[0]];
        for (let i = 1; i < pts.length - 1; i++) {
            out.push({
                x: pts[i - 1].x * 0.25 + pts[i].x * 0.5 + pts[i + 1].x * 0.25,
                y: pts[i - 1].y * 0.25 + pts[i].y * 0.5 + pts[i + 1].y * 0.25
            });
        }
        out.push(pts[pts.length - 1]);
        return out;
    }

    function paintWatercolorLayer(lctx, pts, color, size) {
        const c = hexToRgb(color);
        const W = Math.max(6, size * 1.7);
        lctx.lineCap = 'round';
        lctx.lineJoin = 'round';

        // 1. Feathered wash: concentric soft strokes (alpha builds up toward the middle)
        const rings = 8;
        for (let i = 0; i < rings; i++) {
            const k = i / (rings - 1);
            lctx.lineWidth = W * (1.35 - k * 0.7);
            lctx.strokeStyle = rgba(c, 0.085);
            traceSmoothPath(lctx, pts);
            lctx.stroke();
        }

        // 2. Pigment body
        lctx.lineWidth = W * 0.66;
        lctx.strokeStyle = rgba(c, 0.26);
        traceSmoothPath(lctx, pts);
        lctx.stroke();
    }

    function paintGlowLayer(lctx, pts, color, size) {
        const c = hexToRgb(color);
        const core = Math.max(2.5, size * 0.95);
        lctx.lineCap = 'round';
        lctx.lineJoin = 'round';

        // 1. Soft halo: many wide, very faint strokes => smooth radial falloff
        const halo = 9;
        for (let i = 0; i < halo; i++) {
            const k = i / (halo - 1);
            lctx.lineWidth = core * (4.2 - k * 3.0);
            lctx.strokeStyle = rgba(c, 0.045);
            traceSmoothPath(lctx, pts);
            lctx.stroke();
        }

        // 2. Saturated colour core
        lctx.lineWidth = core * 1.15;
        lctx.strokeStyle = rgba(c, 0.85);
        traceSmoothPath(lctx, pts);
        lctx.stroke();

        // 3. Hot white-ish centre line
        lctx.lineWidth = Math.max(1.2, core * 0.5);
        lctx.strokeStyle = rgba(mixWithWhite(c, 0.82), 0.95);
        traceSmoothPath(lctx, pts);
        lctx.stroke();
    }

    function renderLiveStroke() {
        const s = liveStroke;
        if (!s) return;
        const ctx = s.ctx;
        const lctx = s.layerCtx;
        lctx.clearRect(0, 0, s.layer.width, s.layer.height);
        const pts = relaxPoints(s.points);
        if (s.type === 'watercolor') {
            paintWatercolorLayer(lctx, pts, s.color, s.size);
        } else {
            paintGlowLayer(lctx, pts, s.color, s.size);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(s.base, 0, 0);
        ctx.drawImage(s.layer, 0, 0);
        ctx.restore();
    }

    function beginLiveStroke(ctx, pos, brushType, color, size) {
        const cv = ctx.canvas;
        const base = document.createElement('canvas');
        base.width = cv.width;
        base.height = cv.height;
        base.getContext('2d').drawImage(cv, 0, 0);
        const layer = document.createElement('canvas');
        layer.width = cv.width;
        layer.height = cv.height;
        liveStroke = {
            ctx: ctx,
            type: brushType,
            color: color,
            size: size,
            base: base,
            layer: layer,
            layerCtx: layer.getContext('2d'),
            points: [{ x: pos.x, y: pos.y }]
        };
        if (brushType === 'watercolor') currentPadEffects.hasWatercolor = true;
        if (brushType === 'glow') {
            currentPadEffects.hasGlowBrush = true;
            currentPadEffects.glowColor = color;
        }
        renderLiveStroke();
    }

    function extendLiveStroke(ctx, fromPos, toPos, brushType, color, size) {
        if (!liveStroke || liveStroke.ctx !== ctx || liveStroke.type !== brushType) {
            beginLiveStroke(ctx, fromPos, brushType, color, size);
        }
        const pts = liveStroke.points;
        const last = pts[pts.length - 1];
        // Ignore sub-pixel jitter to keep the curve clean
        if (Math.hypot(toPos.x - last.x, toPos.y - last.y) < 1.2) return;
        pts.push({ x: toPos.x, y: toPos.y });
        renderLiveStroke();
    }

    // Specialized Brush Down Renderer
    function renderBrushDownOnCtx(ctx, pos, tool, brushType, color, size) {
        liveStroke = null;

        if (tool === 'eraser') {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(2, (size * 1.8) / 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (brushType === 'watercolor' || brushType === 'glow') {
            beginLiveStroke(ctx, pos, brushType, color, size);
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        if (brushType === 'crayon') {
            currentPadEffects.hasCrayon = true;
            ctx.fillStyle = color;
            const rad = Math.max(2, size * 0.65);
            for (let i = 0; i < 10; i++) {
                const ox = (Math.random() - 0.5) * rad * 1.5;
                const oy = (Math.random() - 0.5) * rad * 1.5;
                ctx.globalAlpha = 0.45 + Math.random() * 0.45;
                ctx.fillRect(pos.x + ox, pos.y + oy, 2.2, 2.2);
            }
        } else {
            // Classic Pencil
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(1, size / 2), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Specialized Brush Move Renderer
    function renderBrushMoveOnCtx(ctx, fromPos, toPos, tool, brushType, color, size) {
        if (tool === 'eraser') {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = size * 1.8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();
            ctx.restore();
            return;
        }

        if (brushType === 'watercolor' || brushType === 'glow') {
            extendLiveStroke(ctx, fromPos, toPos, brushType, color, size);
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (brushType === 'crayon') {
            currentPadEffects.hasCrayon = true;
            ctx.fillStyle = color;
            const dist = Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y);
            const steps = Math.max(1, Math.ceil(dist / 3));
            const rad = Math.max(2, size * 0.6);
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const cx = fromPos.x + (toPos.x - fromPos.x) * t;
                const cy = fromPos.y + (toPos.y - fromPos.y) * t;
                for (let i = 0; i < 6; i++) {
                    const ox = (Math.random() - 0.5) * rad * 1.4;
                    const oy = (Math.random() - 0.5) * rad * 1.4;
                    ctx.globalAlpha = 0.4 + Math.random() * 0.5;
                    ctx.fillRect(cx + ox, cy + oy, 2.1, 2.1);
                }
            }
        } else {
            // Classic Pencil
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Record stroke start & move
    function startRecordingStroke(pos, tool, brushType, color, size) {
        if (isReplayingTimelapse) return;
        currentRecordingStroke = {
            tool: tool,
            brushType: brushType,
            color: color,
            size: size,
            points: [{ x: Math.round(pos.x), y: Math.round(pos.y) }]
        };
        recordedFlowerStrokes.push(currentRecordingStroke);
        if (recordedFlowerStrokes.length > 120) {
            recordedFlowerStrokes.shift();
        }
    }

    function appendRecordingStrokePoint(pos) {
        if (isReplayingTimelapse || !currentRecordingStroke) return;
        const pts = currentRecordingStroke.points;
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(pos.x - last.x, pos.y - last.y) >= 2.5) {
            pts.push({ x: Math.round(pos.x), y: Math.round(pos.y) });
        }
    }

    function endRecordingStroke() {
        currentRecordingStroke = null;
        liveStroke = null;
    }

    // =========================================================================
    // 2. STUDIO TIMELAPSE REPLAY & GARDEN PLANTING TIMELAPSE
    // =========================================================================
    async function replayStudioTimelapse() {
        if (isReplayingTimelapse) return;
        const pad = document.getElementById('flowerPadCanvas');
        if (!pad) return;
        const ctx = pad.getContext('2d', { willReadFrequently: true });
        if (!recordedFlowerStrokes || recordedFlowerStrokes.length === 0) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Gambarlah beberapa goresan terlebih dahulu untuk memutar Timelapse! 🎨');
            }
            return;
        }

        isReplayingTimelapse = true;
        const snapshot = ctx.getImageData(0, 0, pad.width, pad.height);
        ctx.clearRect(0, 0, pad.width, pad.height);

        const strokesCopy = recordedFlowerStrokes.slice();
        const totalPoints = strokesCopy.reduce((acc, s) => acc + s.points.length, 0);
        const stepDelay = Math.max(4, Math.min(22, Math.floor(1100 / Math.max(1, totalPoints))));

        for (let s = 0; s < strokesCopy.length; s++) {
            const st = strokesCopy[s];
            if (!st.points || st.points.length === 0) continue;
            renderBrushDownOnCtx(ctx, st.points[0], st.tool, st.brushType, st.color, st.size);
            for (let p = 1; p < st.points.length; p++) {
                renderBrushMoveOnCtx(ctx, st.points[p - 1], st.points[p], st.tool, st.brushType, st.color, st.size);
                if (p % 2 === 0) {
                    await new Promise(r => setTimeout(r, stepDelay));
                }
            }
            await new Promise(r => setTimeout(r, stepDelay));
        }

        // Restore exact final pixel state
        ctx.putImageData(snapshot, 0, 0);
        isReplayingTimelapse = false;
        if (typeof playChimeSound === 'function') playChimeSound();
    }

    // Attach painter metadata & timelapse animation when planting a flower
    function attachPainterDataToNewFlower(newFlower, sourceCanvas) {
        if (!newFlower) return;
        newFlower.hasWatercolor = !!currentPadEffects.hasWatercolor;
        newFlower.hasCrayon = !!currentPadEffects.hasCrayon;
        newFlower.hasGlowBrush = !!currentPadEffects.hasGlowBrush;
        newFlower.glowColor = currentPadEffects.glowColor || '#F7CE68';

        // If hand-drawn strokes exist, trigger live stroke-by-stroke painting animation on the island!
        if (recordedFlowerStrokes && recordedFlowerStrokes.length > 0) {
            newFlower.timelapseActive = true;
            newFlower.timelapseProgress = 0.02; // 0.0 -> 1.0 over ~1.5 seconds
            newFlower.growthProgress = 1.0; // Skip seed stage so user watches their live painting timelapse!
        }

        // Verify Animal Commission & Daily Painter Challenge
        checkAnimalCommissionOnPlant(newFlower, sourceCanvas);
        checkDailyPainterChallengeOnPlant(newFlower, sourceCanvas);
    }

    // Analyze colors & coverage of a flower canvas
    function analyzeFlowerCanvasPixels(canvas) {
        const result = {
            warmRatio: 0,
            coolRatio: 0,
            yellowRatio: 0,
            colorBuckets: new Set(),
            pixelCount: 0,
            dominantHex: '#DF5645'
        };
        if (!canvas) return result;
        try {
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            const data = ctx.getImageData(0, 0, w, h).data;
            let warm = 0, cool = 0, yellow = 0, total = 0;

            for (let i = 0; i < data.length; i += 16) {
                const a = data[i + 3];
                if (a > 40) {
                    total++;
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    // Quantize color bucket for variety count
                    const br = Math.floor(r / 64);
                    const bg = Math.floor(g / 64);
                    const bb = Math.floor(b / 64);
                    result.colorBuckets.add(`${br}_${bg}_${bb}`);

                    if (r > 160 && g > 150 && b < 130) {
                        yellow++;
                        warm++;
                    } else if (r > b + 35 && r > 130) {
                        warm++;
                    } else if (b > r + 20 || (b > 130 && g > 110 && r < 140)) {
                        cool++;
                    }
                }
            }
            result.pixelCount = total;
            if (total > 0) {
                result.warmRatio = warm / total;
                result.coolRatio = cool / total;
                result.yellowRatio = yellow / total;
            }
        } catch (e) {}
        return result;
    }

    // =========================================================================
    // 3. PESANAN LUKISAN DARI HEWAN (ANIMAL ART COMMISSIONS)
    // =========================================================================
    const COMMISSION_TEMPLATES = [
        {
            id: 'comm_warm',
            title: 'Bunga Hangat Merona',
            desc: 'Lukis bunga bernuansa Merah, Pink, atau Jingga!',
            rewardStars: 3,
            check: (analysis) => analysis.warmRatio >= 0.25 || analysis.colorBuckets.size >= 2
        },
        {
            id: 'comm_cool',
            title: 'Bunga Biru Sejuk',
            desc: 'Lukis bunga dengan warna Biru atau Ungu yang menenangkan!',
            rewardStars: 3,
            check: (analysis) => analysis.coolRatio >= 0.18
        },
        {
            id: 'comm_sunny',
            title: 'Bunga Mentari Kuning',
            desc: 'Lukis bunga dengan sentuhan warna Kuning cerah!',
            rewardStars: 3,
            check: (analysis) => analysis.yellowRatio >= 0.15 || analysis.warmRatio >= 0.3
        },
        {
            id: 'comm_rainbow',
            title: 'Bunga Pelangi Ceria',
            desc: 'Gunakan minimal 3 warna berbeda dalam satu lukisan bunga!',
            rewardStars: 4,
            check: (analysis) => analysis.colorBuckets.size >= 3
        },
        {
            id: 'comm_glow',
            title: 'Bunga Cahaya Kunang-Kunang',
            desc: 'Lukis bunga menggunakan Kuas Cahaya (Glow)!',
            rewardStars: 4,
            check: (analysis, flw) => !!(flw && flw.hasGlowBrush)
        },
        {
            id: 'comm_watercolor',
            title: 'Lukisan Cat Air Lembut',
            desc: 'Gunakan Kuas Cat Air atau Krayon untuk melukis bungamu!',
            rewardStars: 3,
            check: (analysis, flw) => !!(flw && (flw.hasWatercolor || flw.hasCrayon))
        }
    ];

    var activeCommission = null;

    function generateNewAnimalCommission() {
        const tmpl = COMMISSION_TEMPLATES[Math.floor(Math.random() * COMMISSION_TEMPLATES.length)];
        let requesterName = 'Mochi';
        let requesterIcon = '🐱';
        let requesterAnimalId = null;

        if (typeof animals !== 'undefined' && Array.isArray(animals) && animals.length > 0) {
            const landAnimals = animals.filter(a => a.habitat !== 'water');
            const chosen = (landAnimals.length > 0 ? landAnimals : animals)[Math.floor(Math.random() * (landAnimals.length > 0 ? landAnimals.length : animals.length))];
            if (chosen) {
                requesterName = chosen.name || 'Mochi';
                requesterAnimalId = chosen.id;
                if (chosen.type === 'dog') requesterIcon = '🐶';
                else if (chosen.type === 'rabbit') requesterIcon = '🐰';
                else if (chosen.type === 'butterfly') requesterIcon = '🦋';
                else if (chosen.type === 'exclusive') requesterIcon = '✨';
                else requesterIcon = '🐱';

                chosen.hasArtCommission = true;
                chosen.bubbleText = '🎨 Aku punya pesanan lukisan!';
                chosen.bubbleTimer = 5.5;
            }
        }

        activeCommission = {
            ...tmpl,
            requesterName,
            requesterIcon,
            requesterAnimalId,
            completed: false
        };
        window.activeCommission = activeCommission;
        renderStudioPainterBanner();
        return activeCommission;
    }

    function cycleAnimalCommission() {
        generateNewAnimalCommission();
        if (typeof playPencilSound === 'function') playPencilSound();
    }

    function checkAnimalCommissionOnPlant(newFlower, sourceCanvas) {
        if (!activeCommission || activeCommission.completed) return;
        const analysis = analyzeFlowerCanvasPixels(sourceCanvas);
        const passed = activeCommission.check(analysis, newFlower);

        if (passed) {
            activeCommission.completed = true;
            const starsEarned = activeCommission.rewardStars || 3;

            // Award stars
            if (typeof dailyLoginState !== 'undefined' && dailyLoginState) {
                dailyLoginState.stars = (dailyLoginState.stars || 0) + starsEarned;
                if (typeof saveJournalToStorage === 'function') saveJournalToStorage();
            }

            // Make the ordering animal run to the flower and celebrate!
            if (typeof animals !== 'undefined' && Array.isArray(animals)) {
                let targetAnimal = animals.find(a => a.id === activeCommission.requesterAnimalId) || animals[0];
                if (targetAnimal) {
                    targetAnimal.hasArtCommission = false;
                    targetAnimal.targetX = newFlower.x + 18;
                    targetAnimal.targetY = newFlower.y + 6;
                    targetAnimal.state = 'walk';
                    targetAnimal.stateTimer = 4.0;
                    targetAnimal.friendship = Math.min(100, (targetAnimal.friendship || 20) + 25);
                    targetAnimal.bubbleText = `Wah indah sekali!! Makasih! +${starsEarned}⭐ 💕🎨`;
                    targetAnimal.bubbleTimer = 6.0;
                    targetAnimal.carryingFlowerTimer = 12.0;
                }
            }

            if (typeof showGardenNotice === 'function') {
                showGardenNotice(`🎉 Pesanan ${activeCommission.requesterIcon} ${activeCommission.requesterName} Selesai! Kamu dapat +${starsEarned} ⭐ Bintang & +25 ❤️!`);
            }
            if (typeof playChimeSound === 'function') playChimeSound();

            // Generate next commission after a short delay
            setTimeout(() => {
                generateNewAnimalCommission();
            }, 3500);
        }
    }

    // =========================================================================
    // 4. TANTANGAN MELUKIS HARIAN (DAILY PAINTING CHALLENGE)
    // =========================================================================
    const DAILY_PAINTER_CHALLENGES = [
        {
            id: 'dpc_multicolor',
            title: 'Kreasi Penuh Warna',
            desc: 'Lukis & tanam bunga dengan minimal 3 warna berbeda',
            rewardStars: 3,
            check: (analysis) => analysis.colorBuckets.size >= 3
        },
        {
            id: 'dpc_special_brush',
            title: 'Eksperimen Kuas Seni',
            desc: 'Gunakan Kuas Cat Air, Krayon, atau Cahaya',
            rewardStars: 3,
            check: (analysis, flw) => !!(flw && (flw.hasWatercolor || flw.hasCrayon || flw.hasGlowBrush))
        },
        {
            id: 'dpc_night_glow',
            title: 'Pelukis Cahaya Malam',
            desc: 'Gunakan Kuas Cahaya (Glow) untuk menerangi kebun',
            rewardStars: 4,
            check: (analysis, flw) => !!(flw && flw.hasGlowBrush)
        }
    ];

    var currentChallengeIndex = new Date().getDate() % DAILY_PAINTER_CHALLENGES.length;
    var dailyChallengeCompletedCount = 0;

    function getActiveDailyPainterChallenge() {
        return DAILY_PAINTER_CHALLENGES[currentChallengeIndex % DAILY_PAINTER_CHALLENGES.length];
    }

    function nextDailyPainterChallenge() {
        currentChallengeIndex = (currentChallengeIndex + 1) % DAILY_PAINTER_CHALLENGES.length;
        renderStudioPainterBanner();
    }

    function checkDailyPainterChallengeOnPlant(newFlower, sourceCanvas) {
        const ch = getActiveDailyPainterChallenge();
        if (!ch) return;
        const analysis = analyzeFlowerCanvasPixels(sourceCanvas);
        if (ch.check(analysis, newFlower)) {
            dailyChallengeCompletedCount++;
            const stars = ch.rewardStars || 3;
            if (typeof dailyLoginState !== 'undefined' && dailyLoginState) {
                dailyLoginState.stars = (dailyLoginState.stars || 0) + stars;
                if (typeof saveJournalToStorage === 'function') saveJournalToStorage();
            }
            setTimeout(() => {
                if (typeof showGardenNotice === 'function') {
                    showGardenNotice(`🏆 Tantangan Pelukis "${ch.title}" Tercapai! +${stars} ⭐ Bintang!`);
                }
            }, 1600);
            nextDailyPainterChallenge();
        }
    }

    function renderStudioPainterBanner() {
        const commEl = document.getElementById('studioCommissionBannerText');
        const chEl = document.getElementById('studioDailyChallengeText');

        if (!activeCommission) {
            generateNewAnimalCommission();
            return;
        }

        if (commEl && activeCommission) {
            commEl.innerHTML = `<span class="font-bold text-[#2B5B35]">${activeCommission.requesterIcon} Pesanan ${activeCommission.requesterName}:</span> <span>"${activeCommission.desc}"</span> <span class="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px]">+${activeCommission.rewardStars}⭐</span>`;
        }

        const ch = getActiveDailyPainterChallenge();
        if (chEl && ch) {
            chEl.innerHTML = `<span class="font-bold text-purple-800">🎯 Tantangan:</span> <span>${ch.desc}</span> <span class="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[10px]">+${ch.rewardStars}⭐</span>`;
        }
    }

    // =========================================================================
    // 5. PAMERAN LUKISAN DI KEBUN (EASEL & KRITIKUS PROFESOR HOOT)
    // =========================================================================
    var activeEaselDecor = null;
    var owlCritic = {
        active: false,
        state: 'hidden', // 'flying_in' | 'inspecting' | 'rating' | 'flying_out'
        x: 0,
        y: -120,
        targetX: 0,
        targetY: 0,
        timer: 0,
        bubbleText: '',
        starsRated: 3,
        wingPhase: 0
    };

    var easelImageCache = {};
    function getEaselCachedImage(dataUrl) {
        if (!dataUrl) return null;
        if (!easelImageCache[dataUrl]) {
            const img = new Image();
            img.src = dataUrl;
            easelImageCache[dataUrl] = img;
        }
        return easelImageCache[dataUrl];
    }

    // Draw Realistic 2.5D Wooden Art Easel with Framed Painting
    function drawRealisticEasel(ctx, d, now) {
        ctx.save();

        // Back Tripod Leg
        ctx.strokeStyle = '#6B4226';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -48);
        ctx.lineTo(0, 4);
        ctx.stroke();

        // Front Left & Right Tripod Legs
        ctx.strokeStyle = '#8B5A2B';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-4, -50);
        ctx.lineTo(-20, 6);
        ctx.moveTo(4, -50);
        ctx.lineTo(20, 6);
        ctx.stroke();

        // Canvas Frame Box (44x36)
        const fw = 46, fh = 38;
        const fx = -fw / 2, fy = -46;

        // Outer Wooden Gold Frame
        ctx.fillStyle = '#D97706';
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(fx - 3, fy - 3, fw + 6, fh + 6, 4);
        ctx.fill();
        ctx.stroke();

        // Canvas White/Cream Backing
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, 2);
        ctx.fill();

        // Draw Exhibited Painting if present
        if (d.paintingDataUrl) {
            const img = getEaselCachedImage(d.paintingDataUrl);
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(fx + 2, fy + 2, fw - 4, fh - 4, 2);
                ctx.clip();
                // Subtle pastel gallery backdrop inside frame
                ctx.fillStyle = '#F4FAEE';
                ctx.fillRect(fx + 2, fy + 2, fw - 4, fh - 4);
                ctx.drawImage(img, fx + 4, fy + 3, fw - 8, fh - 6);
                ctx.restore();
            }
        } else {
            // Empty easel prompt icon (palette + brush)
            ctx.fillStyle = '#9CA3AF';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎨', 0, fy + fh / 2 + 4);
        }

        // Horizontal Wooden Shelf Tray under canvas
        ctx.fillStyle = '#A0522D';
        ctx.strokeStyle = '#5C3317';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-26, fy + fh, 52, 5, 2);
        ctx.fill();
        ctx.stroke();

        // Top Clamp Peg
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(-5, fy - 7, 10, 5);

        // Floating title pill if painting exists
        if (d.paintingTitle) {
            const floatY = Math.sin(now * 0.003) * 2;
            ctx.font = 'bold 9.5px "Quicksand", sans-serif';
            const tw = ctx.measureText(d.paintingTitle).width + 12;
            ctx.fillStyle = 'rgba(253, 251, 242, 0.92)';
            ctx.strokeStyle = '#3a5a40';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(-tw / 2, fy - 22 + floatY, tw, 14, 7);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#2B5B35';
            ctx.textAlign = 'center';
            ctx.fillText(d.paintingTitle, 0, fy - 12 + floatY);
        }

        ctx.restore();
    }

    function openEaselModal(easelDecor) {
        if (!easelDecor) return;
        activeEaselDecor = easelDecor;
        const modal = document.getElementById('easelExhibitionModal');
        if (!modal) return;

        renderEaselArtworkChoices();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeEaselModal() {
        const modal = document.getElementById('easelExhibitionModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function renderEaselArtworkChoices() {
        const container = document.getElementById('easelArtworkGrid');
        if (!container) return;

        const items = [];
        // 1. Current studio pad if non-empty
        if (typeof extractTrimmedFlowerCanvas === 'function') {
            const trimmed = extractTrimmedFlowerCanvas();
            if (trimmed) {
                items.push({
                    title: 'Lukisan Studio Saat Ini',
                    dataUrl: trimmed.toDataURL('image/png'),
                    badge: 'Kanvas Baru'
                });
            }
        }
        // 2. Saved Gallery Flowers
        if (typeof galleryFlowers !== 'undefined' && Array.isArray(galleryFlowers)) {
            galleryFlowers.forEach(gf => {
                if (gf.dataUrl) {
                    items.push({
                        title: gf.name || 'Bunga Lukisan',
                        dataUrl: gf.dataUrl,
                        badge: 'Galeri Bunga'
                    });
                }
            });
        }
        // 3. Saved Gallery Animals
        if (typeof galleryAnimals !== 'undefined' && Array.isArray(galleryAnimals)) {
            galleryAnimals.forEach(ga => {
                if (ga.spriteDataUrl) {
                    items.push({
                        title: ga.name || 'Sahabat Lukisan',
                        dataUrl: ga.spriteDataUrl,
                        badge: 'Galeri Hewan'
                    });
                }
            });
        }
        // 4. Planted Flowers in Garden
        if (typeof flowers !== 'undefined' && Array.isArray(flowers)) {
            flowers.slice(0, 8).forEach((flw, idx) => {
                if (flw.imgCanvas) {
                    items.push({
                        title: `Bunga Kebun #${idx + 1}`,
                        dataUrl: flw.imgCanvas.toDataURL('image/png'),
                        badge: 'Di Kebun'
                    });
                }
            });
        }

        if (items.length === 0) {
            container.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-gray-500">Belum ada lukisan. Yuk gambar bunga di Studio Gambar terlebih dahulu!</div>`;
            return;
        }

        container.innerHTML = items.map((it, idx) => `
            <div onclick="selectEaselArtwork(${idx})" class="cursor-pointer bg-white hover:bg-[#f4faee] border-2 border-[#d2e0cb] hover:border-[#2B5B35] rounded-2xl p-2.5 flex flex-col items-center text-center transition shadow-xs group">
                <div class="w-16 h-16 rounded-xl bg-[#fbf9f3] border border-[#e2d5bc] flex items-center justify-center p-1.5 mb-1.5 group-hover:scale-105 transition">
                    <img src="${it.dataUrl}" class="max-w-full max-h-full object-contain" alt="${it.title}" />
                </div>
                <div class="font-hand font-bold text-xs text-[#2B5B35] truncate w-full">${it.title}</div>
                <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">${it.badge}</span>
            </div>
        `).join('');

        window._easelCandidateItems = items;
    }

    function selectEaselArtwork(idx) {
        const items = window._easelCandidateItems || [];
        const chosen = items[idx];
        if (!chosen || !activeEaselDecor) return;

        activeEaselDecor.paintingDataUrl = chosen.dataUrl;
        activeEaselDecor.paintingTitle = chosen.title;

        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`🖼️ Lukisan "${chosen.title}" dipajang di Kuda-kuda Pameran!`);
        }
        if (typeof playPlantSound === 'function') playPlantSound();
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();

        // Attract nearby animals to admire the painting!
        attractAnimalsToEasel(activeEaselDecor);
        closeEaselModal();
    }

    function attractAnimalsToEasel(easel) {
        if (!easel || typeof animals === 'undefined' || !Array.isArray(animals)) return;
        const admirers = animals.filter(a => a.habitat !== 'water').slice(0, 3);
        const comments = [
            'Wah, lukisannya indah sekali~ 🎨✨',
            'Warnanya bikin hati hangat! 💕',
            'Karya seni kebun terbaik! 🌟',
            'Aku suka goresan kuasnya~ 🐾'
        ];
        admirers.forEach((a, i) => {
            const angle = (i - 1) * 0.65;
            a.targetX = easel.x + Math.sin(angle) * 44;
            a.targetY = easel.y + 24 + Math.cos(angle) * 14;
            a.state = 'walk';
            a.stateTimer = 4.5;
            setTimeout(() => {
                a.facingLeft = a.x > easel.x;
                a.bubbleText = comments[i % comments.length];
                a.bubbleTimer = 5.0;
            }, 1800 + i * 600);
        });
    }

    // Invite Professor Hoot the Owl Art Critic!
    function inviteOwlArtCritic() {
        let targetEasel = activeEaselDecor;
        if (!targetEasel && typeof decorations !== 'undefined') {
            targetEasel = decorations.find(d => d.type === 'easel' && d.paintingDataUrl) || decorations.find(d => d.type === 'easel');
        }
        closeEaselModal();

        if (!targetEasel) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Pasang Kuda-kuda Lukis (Easel) di kebun terlebih dahulu!');
            }
            return;
        }
        if (!targetEasel.paintingDataUrl) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Pilih lukisan untuk dipajang di Kuda-kuda sebelum mengundang Profesor Hoot! 🎨');
            }
            return;
        }

        owlCritic.active = true;
        owlCritic.state = 'flying_in';
        owlCritic.targetX = targetEasel.x + 34;
        owlCritic.targetY = targetEasel.y - 6;
        owlCritic.x = targetEasel.x + 140;
        owlCritic.y = targetEasel.y - 240;
        owlCritic.timer = 0;
        owlCritic.bubbleText = '🦉 Hoo-hoo! Mari kita amati lukisan ini...';

        if (typeof showGardenNotice === 'function') {
            showGardenNotice('🦉 Profesor Hoot sang Kritikus Seni datang mengunjungi pameranmu!');
        }
        if (typeof playChimeSound === 'function') playChimeSound();
    }

    function updateAndDrawOwlCritic(ctx, dt, now) {
        if (!owlCritic.active) return;
        owlCritic.timer += dt;
        owlCritic.wingPhase += dt * 14;

        if (owlCritic.state === 'flying_in') {
            const dx = owlCritic.targetX - owlCritic.x;
            const dy = owlCritic.targetY - owlCritic.y;
            owlCritic.x += dx * Math.min(1, dt * 3.5);
            owlCritic.y += dy * Math.min(1, dt * 3.5);
            if (Math.hypot(dx, dy) < 4 || owlCritic.timer > 2.2) {
                owlCritic.state = 'inspecting';
                owlCritic.timer = 0;
                owlCritic.bubbleText = '🧐 Hmm... komposisi warna dan jiwa yang luar biasa!';
            }
        } else if (owlCritic.state === 'inspecting') {
            if (owlCritic.timer > 3.2) {
                owlCritic.state = 'rating';
                owlCritic.timer = 0;
                const praises = [
                    '⭐⭐⭐ Mahakarya Kebun! Sungguh memukau! (+2 ⭐)',
                    '⭐⭐⭐ Goresan penuh cinta & harmoni! (+2 ⭐)',
                    '⭐⭐⭐ Museum Hutan memberi nilai Sempurna! (+2 ⭐)'
                ];
                owlCritic.bubbleText = praises[Math.floor(Math.random() * praises.length)];

                // Award 2 stars
                if (typeof dailyLoginState !== 'undefined' && dailyLoginState) {
                    dailyLoginState.stars = (dailyLoginState.stars || 0) + 2;
                    if (typeof saveJournalToStorage === 'function') saveJournalToStorage();
                }
                if (typeof playChimeSound === 'function') playChimeSound();
            }
        } else if (owlCritic.state === 'rating') {
            if (owlCritic.timer > 4.2) {
                owlCritic.state = 'flying_out';
                owlCritic.timer = 0;
                owlCritic.bubbleText = '🦉 Sampai jumpa di pameran berikutnya, Pelukis Muda!';
            }
        } else if (owlCritic.state === 'flying_out') {
            owlCritic.x += 90 * dt;
            owlCritic.y -= 130 * dt;
            if (owlCritic.timer > 2.2) {
                owlCritic.active = false;
            }
        }

        // Render Professor Hoot (Chibi Owl with Painter Beret & Monocle)
        ctx.save();
        ctx.translate(owlCritic.x, owlCritic.y);

        const isFlying = owlCritic.state === 'flying_in' || owlCritic.state === 'flying_out';
        const bob = isFlying ? Math.sin(owlCritic.wingPhase) * 4 : Math.sin(now * 0.005) * 1.5;
        ctx.translate(0, bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Owl Body
        ctx.fillStyle = '#785233';
        ctx.beginPath();
        ctx.ellipse(0, -10, 13, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cream Belly with feather chevrons
        ctx.fillStyle = '#F5E6D3';
        ctx.beginPath();
        ctx.ellipse(0, -7, 9, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        const wingAng = isFlying ? Math.sin(owlCritic.wingPhase) * 0.55 : 0.1;
        ctx.fillStyle = '#5C3D24';
        ctx.save();
        ctx.translate(-11, -12);
        ctx.rotate(wingAng);
        ctx.beginPath();
        ctx.ellipse(-2, 4, 4, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(11, -12);
        ctx.rotate(-wingAng);
        ctx.beginPath();
        ctx.ellipse(2, 4, 4, 9, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Big Wise Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-5, -16, 4.5, 0, Math.PI * 2);
        ctx.arc(5, -16, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(-5, -16, 2.2, 0, Math.PI * 2);
        ctx.arc(5, -16, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Golden Critic Monocle on right eye
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(5, -16, 5.2, 0, Math.PI * 2);
        ctx.stroke();

        // Beak
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(-2.5, -13);
        ctx.lineTo(2.5, -13);
        ctx.lineTo(0, -9.5);
        ctx.closePath();
        ctx.fill();

        // Red Artist Beret Hat
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.ellipse(2, -25, 11, 4.5, 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9F1239';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(3, -29);
        ctx.lineTo(5, -32);
        ctx.stroke();

        // Speech Bubble
        if (owlCritic.bubbleText) {
            ctx.font = 'bold 10.5px "Quicksand", sans-serif';
            const bw = ctx.measureText(owlCritic.bubbleText).width + 16;
            ctx.fillStyle = '#FFFBEB';
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(-bw / 2, -52, bw, 18, 9);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#92400E';
            ctx.textAlign = 'center';
            ctx.fillText(owlCritic.bubbleText, 0, -40);
        }

        ctx.restore();
    }

    // =========================================================================
    // 6. LUKIS RASI BINTANG DI LANGIT MALAM (STAR CONSTELLATIONS)
    // =========================================================================
    var gardenConstellations = [];
    window.gardenConstellations = gardenConstellations;

    var constellationDraftNodes = [];
    var constellationBgStars = [];

    function initConstellationBgStars() {
        constellationBgStars = [];
        for (let i = 0; i < 28; i++) {
            constellationBgStars.push({
                nx: Number((0.06 + Math.random() * 0.88).toFixed(3)),
                ny: Number((0.10 + Math.random() * 0.80).toFixed(3)),
                r: Number((3 + Math.random() * 2.2).toFixed(1)),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function resizeConstellationPad() {
        const canvas = document.getElementById('constellationPadCanvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
        }
    }

    function openConstellationModal() {
        // Ensure Night Mode is enabled so the user can see their constellations in the sky too!
        if (typeof isNightMode !== 'undefined' && !isNightMode && typeof toggleDayNightMode === 'function') {
            toggleDayNightMode();
        }
        const modal = document.getElementById('constellationModal');
        if (!modal) return;
        if (constellationBgStars.length === 0) initConstellationBgStars();
        constellationDraftNodes = [];
        const nameInput = document.getElementById('constellationNameInput');
        if (nameInput) nameInput.value = '';

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            resizeConstellationPad();
            renderConstellationPad();
            renderSavedConstellationsList();
        });
    }

    function closeConstellationModal() {
        const modal = document.getElementById('constellationModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function clearConstellationDraft() {
        constellationDraftNodes = [];
        renderConstellationPad();
    }

    function renderConstellationPad() {
        const canvas = document.getElementById('constellationPadCanvas');
        if (!canvas) return;
        resizeConstellationPad();
        const rect = canvas.getBoundingClientRect();
        const cssW = rect.width;
        const cssH = rect.height;
        if (!cssW || !cssH) return;

        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Deep night sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, cssH);
        grad.addColorStop(0, '#090D16');
        grad.addColorStop(0.6, '#131C31');
        grad.addColorStop(1, '#1E293B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cssW, cssH);

        // Background selectable stars (1:1 aspect ratio, perfectly round stars)
        constellationBgStars.forEach(st => {
            const sx = (st.nx !== undefined ? st.nx : st.x / 500) * cssW;
            const sy = (st.ny !== undefined ? st.ny : st.y / 260) * cssH;
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(sx, sy, st.r || 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Connected glowing lines of current draft
        if (constellationDraftNodes.length > 1) {
            ctx.save();
            ctx.strokeStyle = '#FDE047';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#FDE047';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            const f = constellationDraftNodes[0];
            const fx = (f.nx !== undefined ? f.nx : f.x / 500) * cssW;
            const fy = (f.ny !== undefined ? f.ny : f.y / 260) * cssH;
            ctx.moveTo(fx, fy);
            for (let i = 1; i < constellationDraftNodes.length; i++) {
                const pt = constellationDraftNodes[i];
                const px = (pt.nx !== undefined ? pt.nx : pt.x / 500) * cssW;
                const py = (pt.ny !== undefined ? pt.ny : pt.y / 260) * cssH;
                ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.restore();
        }

        // Selected star nodes
        constellationDraftNodes.forEach((pt, idx) => {
            const sx = (pt.nx !== undefined ? pt.nx : pt.x / 500) * cssW;
            const sy = (pt.ny !== undefined ? pt.ny : pt.y / 260) * cssH;
            ctx.save();
            ctx.fillStyle = '#FEF08A';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(String(idx + 1), sx + 8, sy - 5);
            ctx.restore();
        });
    }

    function saveConstellationDraft() {
        if (constellationDraftNodes.length < 2) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Hubungkan minimal 2 titik bintang di langit untuk membuat Rasi Bintang! ✨');
            }
            return;
        }
        const nameInput = document.getElementById('constellationNameInput');
        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : `Rasi Bintang #${gardenConstellations.length + 1}`;

        // Normalize coordinates to 0..1
        const normalized = constellationDraftNodes.map(pt => ({
            nx: Number(((pt.nx !== undefined ? pt.nx : pt.x / 500)).toFixed(3)),
            ny: Number(((pt.ny !== undefined ? pt.ny : pt.y / 260)).toFixed(3))
        }));

        gardenConstellations.push({
            id: 'const_' + Date.now(),
            name: name,
            nodes: normalized
        });
        window.gardenConstellations = gardenConstellations;

        constellationDraftNodes = [];
        if (nameInput) nameInput.value = '';
        renderConstellationPad();
        renderSavedConstellationsList();

        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`🌌 Rasi Bintang "${name}" kini bersinar abadi di langit malam kebunmu!`);
        }
        if (typeof playChimeSound === 'function') playChimeSound();
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }

    function deleteConstellationById(id) {
        gardenConstellations = gardenConstellations.filter(c => c.id !== id);
        window.gardenConstellations = gardenConstellations;
        renderSavedConstellationsList();
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }

    function renderSavedConstellationsList() {
        const listEl = document.getElementById('savedConstellationsList');
        if (!listEl) return;
        if (!gardenConstellations || gardenConstellations.length === 0) {
            listEl.innerHTML = `<span class="text-[11px] text-slate-400">Belum ada rasi bintang tersimpan. Klik titik bintang di atas untuk menggambar!</span>`;
            return;
        }
        listEl.innerHTML = gardenConstellations.map(c => `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-amber-200 border border-slate-600 text-xs">
                <span>✨ ${c.name}</span>
                <button onclick="deleteConstellationById('${c.id}')" class="text-rose-400 hover:text-rose-300 font-bold ml-1" title="Hapus Rasi">✕</button>
            </div>
        `).join('');
    }

    // Draw saved constellations in the top sky area during Night Mode
    function drawGardenConstellationsInSky(ctx, screenW, screenH, nightAlpha, now) {
        if (nightAlpha <= 0.08 || !gardenConstellations || gardenConstellations.length === 0) return;

        ctx.save();
        ctx.globalAlpha = Math.min(0.85, nightAlpha * 0.9);

        gardenConstellations.forEach((c, cIdx) => {
            if (!c.nodes || c.nodes.length < 2) return;
            // Distribute constellations across upper sky
            const regionW = Math.min(340, screenW * 0.38);
            const regionH = Math.min(160, screenH * 0.25);
            const offsetX = ((cIdx % 3) * (screenW * 0.3)) + screenW * 0.08;
            const offsetY = 45 + (Math.floor(cIdx / 3) * 70);

            const shimmer = 0.75 + Math.sin(now * 0.0025 + cIdx) * 0.25;

            ctx.strokeStyle = `rgba(253, 224, 71, ${0.45 * shimmer})`;
            ctx.lineWidth = 1.6;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            c.nodes.forEach((nd, i) => {
                const sx = offsetX + nd.nx * regionW;
                const sy = offsetY + nd.ny * regionH;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            });
            ctx.stroke();
            ctx.setLineDash([]);

            // Star vertices
            let avgX = 0, avgY = 0;
            c.nodes.forEach(nd => {
                const sx = offsetX + nd.nx * regionW;
                const sy = offsetY + nd.ny * regionH;
                avgX += sx;
                avgY += sy;
                ctx.fillStyle = '#FEF08A';
                ctx.beginPath();
                ctx.arc(sx, sy, 2.8 * shimmer, 0, Math.PI * 2);
                ctx.fill();
            });
            avgX /= c.nodes.length;
            avgY /= c.nodes.length;

            // Constellation Name Label
            ctx.font = 'italic 10px "Quicksand", sans-serif';
            ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
            ctx.textAlign = 'center';
            ctx.fillText(`✦ ${c.name}`, avgX, avgY - 10);
        });

        ctx.restore();
    }

    // =========================================================================
    // 7. LIVING PAINT WEATHER EFFECTS & FLOWER TIMELAPSE RENDERER
    // =========================================================================
    function drawFlowerPainterEffects(targetCtx, f, now, dt) {
        if (!f) return;

        // A. Live Timelapse Stroke-by-Stroke Reveal when Newly Planted!
        if (f.timelapseActive && typeof f.timelapseProgress === 'number' && f.timelapseProgress < 1.0) {
            f.timelapseProgress = Math.min(1.0, f.timelapseProgress + (dt || 0.016) * 0.75);
            const prog = f.timelapseProgress;
            const drawX = -f.width / 2;
            const drawY = -f.height + 6;

            // Progressive bottom-to-top & stroke reveal clip
            targetCtx.save();
            targetCtx.beginPath();
            const revealH = f.height * prog;
            targetCtx.rect(drawX - 10, drawY + f.height - revealH, f.width + 20, revealH + 6);
            targetCtx.clip();
            targetCtx.drawImage(f.imgCanvas, drawX, drawY, f.width, f.height);
            targetCtx.restore();

            // Animated floating paintbrush tip drawing the flower
            const brushX = Math.sin(prog * Math.PI * 6) * (f.width * 0.28);
            const brushY = drawY + f.height * (1 - prog);
            targetCtx.save();
            targetCtx.translate(brushX, brushY);
            targetCtx.font = '14px sans-serif';
            targetCtx.fillText('🖌️', -4, 0);
            targetCtx.restore();

            if (f.timelapseProgress >= 1.0) {
                f.timelapseActive = false;
                f.waterBounce = 1.0;
            }
            return true; // Handled main sprite drawing via timelapse reveal
        }

        const drawY = -f.height + 6;

        // B. Night Mode Bioluminescent Glow for 'glow' brush flowers
        if (f.hasGlowBrush && typeof nightTransition !== 'undefined' && nightTransition > 0.1) {
            const pulse = 0.75 + Math.sin(now * 0.004 + (f.swayPhase || 0)) * 0.25;
            targetCtx.save();
            const rad = Math.max(f.width, f.height) * 0.65;
            const gGrad = targetCtx.createRadialGradient(0, drawY + f.height * 0.4, 2, 0, drawY + f.height * 0.4, rad);
            gGrad.addColorStop(0, (f.glowColor || '#FDE047') + '66');
            gGrad.addColorStop(1, 'rgba(255,255,255,0)');
            targetCtx.globalAlpha = nightTransition * pulse;
            targetCtx.fillStyle = gGrad;
            targetCtx.beginPath();
            targetCtx.arc(0, drawY + f.height * 0.4, rad, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();
        }

        // D. Living Paint Weather Reactions
        const isRaining = (typeof isRainingShower !== 'undefined' && isRainingShower) ||
                          (typeof dynamicWeather !== 'undefined' && (dynamicWeather === 'rain' || dynamicWeather === 'thunderstorm'));
        const isSnowing = (typeof currentSeason !== 'undefined' && currentSeason === 'winter') ||
                          (typeof dynamicWeather !== 'undefined' && dynamicWeather === 'blizzard');

        // Watercolor / Paint Drip during Rain
        if (isRaining) {
            const dropPhase = (now * 0.002 + (f.swayPhase || 0)) % 1;
            const dropX = Math.sin((f.swayPhase || 0) * 3) * (f.width * 0.22);
            const dropY = drawY + f.height * 0.35 + dropPhase * (f.height * 0.55);
            targetCtx.save();
            targetCtx.fillStyle = f.hasWatercolor ? 'rgba(132, 180, 232, 0.75)' : 'rgba(186, 230, 253, 0.65)';
            targetCtx.beginPath();
            targetCtx.arc(dropX, dropY, 2.0, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();
        }

        // Frosty Snow Cap on Flower Crown during Winter / Blizzard
        if (isSnowing) {
            targetCtx.save();
            targetCtx.fillStyle = 'rgba(255, 255, 255, 0.78)';
            targetCtx.beginPath();
            targetCtx.ellipse(0, drawY + 7, f.width * 0.26, 3.8, 0, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();
        }

        return false;
    }

    // Bind Constellation Canvas Click Listener on DOM Ready
    function initPainterDOMListeners() {
        const constCanvas = document.getElementById('constellationPadCanvas');
        if (constCanvas && !constCanvas._bound) {
            constCanvas._bound = true;
            constCanvas.addEventListener('pointerdown', (e) => {
                const rect = constCanvas.getBoundingClientRect();
                const cssW = rect.width;
                const cssH = rect.height;
                if (!cssW || !cssH) return;

                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Snap to nearest background star if close (24px snap radius)
                let chosenNx = clickX / cssW;
                let chosenNy = clickY / cssH;
                let minDist = 24;

                for (let st of constellationBgStars) {
                    const sx = (st.nx !== undefined ? st.nx : st.x / 500) * cssW;
                    const sy = (st.ny !== undefined ? st.ny : st.y / 260) * cssH;
                    const dist = Math.hypot(sx - clickX, sy - clickY);
                    if (dist < minDist) {
                        minDist = dist;
                        chosenNx = (st.nx !== undefined ? st.nx : st.x / 500);
                        chosenNy = (st.ny !== undefined ? st.ny : st.y / 260);
                    }
                }

                constellationDraftNodes.push({ nx: chosenNx, ny: chosenNy });
                if (typeof playPencilSound === 'function') playPencilSound();
                renderConstellationPad();
            });
        }

        window.addEventListener('resize', () => {
            const modal = document.getElementById('constellationModal');
            if (modal && !modal.classList.contains('hidden')) {
                renderConstellationPad();
            }
        });

        renderStudioPainterBanner();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPainterDOMListeners);
        } else {
            setTimeout(initPainterDOMListeners, 100);
        }
    }

    // Export functions to global window scope
    window.studioBrushType = studioBrushType;
    window.setStudioBrushType = setStudioBrushType;
    window.renderBrushDownOnCtx = renderBrushDownOnCtx;
    window.renderBrushMoveOnCtx = renderBrushMoveOnCtx;
    window.startRecordingStroke = startRecordingStroke;
    window.appendRecordingStrokePoint = appendRecordingStrokePoint;
    window.endRecordingStroke = endRecordingStroke;
    window.resetPadPainterMetadata = resetPadPainterMetadata;
    window.replayStudioTimelapse = replayStudioTimelapse;
    window.attachPainterDataToNewFlower = attachPainterDataToNewFlower;
    window.drawFlowerPainterEffects = drawFlowerPainterEffects;
    window.cycleAnimalCommission = cycleAnimalCommission;
    window.nextDailyPainterChallenge = nextDailyPainterChallenge;
    window.renderStudioPainterBanner = renderStudioPainterBanner;
    window.drawRealisticEasel = drawRealisticEasel;
    window.openEaselModal = openEaselModal;
    window.closeEaselModal = closeEaselModal;
    window.selectEaselArtwork = selectEaselArtwork;
    window.inviteOwlArtCritic = inviteOwlArtCritic;
    window.updateAndDrawOwlCritic = updateAndDrawOwlCritic;
    window.openConstellationModal = openConstellationModal;
    window.closeConstellationModal = closeConstellationModal;
    window.clearConstellationDraft = clearConstellationDraft;
    window.saveConstellationDraft = saveConstellationDraft;
    window.deleteConstellationById = deleteConstellationById;
    window.drawGardenConstellationsInSky = drawGardenConstellationsInSky;

})();

