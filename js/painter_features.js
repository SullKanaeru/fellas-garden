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
    // 6. OBSERVATORIUM RASI BINTANG & KOSMOS LUAR ANGKASA (PARALLAX COSMOS)
    // =========================================================================
    var gardenConstellations = (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations))
        ? window.gardenConstellations
        : [];
    window.gardenConstellations = gardenConstellations;

    var constellationDraftNodes = [];
    var constellationBgStars = [];
    var constellationDraftColor = 'gold';
    var constellationHoverStar = null;
    var constellationPointerPos = null;
    var constellationIsDragging = false;
    var constellationPadParticles = [];
    var constellationPadAnimId = null;
    var focusedConstellationId = null;
    var focusedConstellationTimer = 0;

    const CONSTELLATION_THEMES = {
        gold: {
            id: 'gold',
            name: 'Emas Bintang',
            core: '#FFFFFF',
            star: '#FEF08A',
            line: 'rgba(253, 224, 71, 0.82)',
            glow: 'rgba(250, 204, 21, 0.45)',
            nebula: 'rgba(250, 204, 21, 0.14)',
            label: '#FEF08A',
            badgeBg: 'rgba(120, 53, 15, 0.55)',
            badgeBorder: 'rgba(251, 191, 36, 0.55)'
        },
        cyan: {
            id: 'cyan',
            name: 'Biru Nebula',
            core: '#FFFFFF',
            star: '#BAE6FD',
            line: 'rgba(56, 189, 248, 0.85)',
            glow: 'rgba(14, 165, 233, 0.48)',
            nebula: 'rgba(56, 189, 248, 0.15)',
            label: '#BAE6FD',
            badgeBg: 'rgba(12, 74, 110, 0.55)',
            badgeBorder: 'rgba(56, 189, 248, 0.55)'
        },
        violet: {
            id: 'violet',
            name: 'Ungu Kosmik',
            core: '#FFFFFF',
            star: '#E9D5FF',
            line: 'rgba(192, 132, 252, 0.85)',
            glow: 'rgba(168, 85, 247, 0.48)',
            nebula: 'rgba(168, 85, 247, 0.16)',
            label: '#E9D5FF',
            badgeBg: 'rgba(88, 28, 135, 0.55)',
            badgeBorder: 'rgba(192, 132, 252, 0.55)'
        },
        rose: {
            id: 'rose',
            name: 'Aurora Merah Muda',
            core: '#FFFFFF',
            star: '#FBCFE8',
            line: 'rgba(244, 114, 182, 0.85)',
            glow: 'rgba(236, 72, 153, 0.48)',
            nebula: 'rgba(244, 114, 182, 0.15)',
            label: '#FBCFE8',
            badgeBg: 'rgba(131, 24, 67, 0.55)',
            badgeBorder: 'rgba(244, 114, 182, 0.55)'
        }
    };

    // Curated Celestial Halo Slots AROUND and OUTSIDE the Floating Oval Island
    // (Island semi-axes are rx=440, ry=280; every slot here sits in open outer space around the island!)
    const SKY_CONSTELLATION_SLOTS = [
        { dx: -435, dy: -185, label: 'Langit Barat Laut' },
        { dx:  435, dy: -185, label: 'Langit Timur Laut' },
        { dx:    0, dy: -365, label: 'Zenith Utara' },
        { dx: -560, dy:  -30, label: 'Ufuk Barat' },
        { dx:  560, dy:  -30, label: 'Ufuk Timur' },
        { dx: -250, dy: -340, label: 'Angkasa Utara-Barat' },
        { dx:  250, dy: -340, label: 'Angkasa Utara-Timur' },
        { dx: -465, dy:  195, label: 'Langit Barat Daya' },
        { dx:  465, dy:  195, label: 'Langit Tenggara' },
        { dx:    0, dy: -510, label: 'Kosmos Utara' },
        { dx: -680, dy: -165, label: 'Galaksi Barat' },
        { dx:  680, dy: -165, label: 'Galaksi Timur' }
    ];

    // Deep-Space Procedural Starfield & Nebulae (Cached for zero-GC 60fps rendering)
    var cosmicFieldInitialized = false;
    var cosmicBackgroundStars = [];
    var cosmicNebulaClouds = [];
    var cosmicShootingStars = [];
    var cosmicShootingTimer = 2.5;
    var cosmicSkyCanvas = null;
    var cosmicSkyCtx = null;

    function initCosmicStarfield() {
        if (cosmicFieldInitialized) return;
        cosmicFieldInitialized = true;
        cosmicBackgroundStars = [];

        const starColors = ['#FFFFFF', '#FEF08A', '#BAE6FD', '#E9D5FF', '#FBCFE8', '#FFFFFF'];
        // Deterministic pseudo-random generator so the cosmos feels consistent
        let seed = 133742;
        const rand = () => {
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            return seed / 4294967296;
        };

        // 135 multi-layered parallax stars spanning a wide celestial dome
        for (let i = 0; i < 135; i++) {
            const layer = i < 65 ? 0 : (i < 110 ? 1 : 2); // 0=deep, 1=mid, 2=bright foreground sky
            const parallax = layer === 0 ? 0.14 : (layer === 1 ? 0.28 : 0.42);
            const r = layer === 0 ? (0.8 + rand() * 0.9) : (layer === 1 ? (1.3 + rand() * 1.2) : (2.1 + rand() * 1.4));
            cosmicBackgroundStars.push({
                ox: (rand() - 0.5) * 2600,
                oy: (rand() - 0.5) * 1800,
                r: r,
                parallax: parallax,
                layer: layer,
                color: starColors[Math.floor(rand() * starColors.length)],
                phase: rand() * Math.PI * 2,
                speed: 0.0015 + rand() * 0.0028,
                flare: layer === 2 && rand() > 0.35
            });
        }

        cosmicNebulaClouds = [
            { ox: -380, oy: -220, rx: 420, ry: 240, color: 'rgba(139, 92, 246, 0.16)', parallax: 0.15, phase: 0.4 },
            { ox:  410, oy: -190, rx: 440, ry: 250, color: 'rgba(56, 189, 248, 0.14)',  parallax: 0.18, phase: 1.9 },
            { ox:    0, oy: -360, rx: 520, ry: 220, color: 'rgba(99, 102, 241, 0.15)',  parallax: 0.12, phase: 3.1 },
            { ox: -490, oy:  160, rx: 360, ry: 210, color: 'rgba(236, 72, 153, 0.11)',  parallax: 0.16, phase: 4.5 },
            { ox:  490, oy:  170, rx: 380, ry: 210, color: 'rgba(45, 212, 191, 0.11)',  parallax: 0.16, phase: 5.2 }
        ];
    }

    function playStarNodeChime(nodeIdx) {
        try {
            if (typeof getAudioCtx !== 'function') return;
            const actx = getAudioCtx();
            if (!actx) return;
            const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
            const freq = scale[nodeIdx % scale.length];
            const now = actx.currentTime;

            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.13, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(now);
            osc.stop(now + 0.46);

            // Harmonic overtone sparkle
            const osc2 = actx.createOscillator();
            const gain2 = actx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2, now + 0.02);
            gain2.gain.setValueAtTime(0.001, now + 0.02);
            gain2.gain.linearRampToValueAtTime(0.045, now + 0.04);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
            osc2.connect(gain2);
            gain2.connect(actx.destination);
            osc2.start(now + 0.02);
            osc2.stop(now + 0.34);
        } catch (e) {}
    }

    function initConstellationBgStars() {
        constellationBgStars = [];
        // Stratified grid distribution so stars in the drawing pad are evenly & pleasingly spaced
        const cols = 7;
        const rows = 4;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellW = 0.86 / cols;
                const cellH = 0.78 / rows;
                const nx = 0.07 + c * cellW + (0.18 + Math.random() * 0.64) * cellW;
                const ny = 0.08 + r * cellH + (0.18 + Math.random() * 0.64) * cellH;
                constellationBgStars.push({
                    nx: Number(nx.toFixed(3)),
                    ny: Number(ny.toFixed(3)),
                    r: Number((2.4 + Math.random() * 2.0).toFixed(1)),
                    phase: Math.random() * Math.PI * 2,
                    flare: Math.random() > 0.55
                });
            }
        }
    }

    function shuffleConstellationBgStars() {
        initConstellationBgStars();
        if (typeof playStarNodeChime === 'function') playStarNodeChime(4);
        renderConstellationPad();
    }

    function setConstellationDraftColor(colorKey) {
        if (!CONSTELLATION_THEMES[colorKey]) return;
        constellationDraftColor = colorKey;
        ['gold', 'cyan', 'violet', 'rose'].forEach(k => {
            const btn = document.getElementById('constColorBtn-' + k);
            if (!btn) return;
            if (k === colorKey) {
                btn.classList.add('ring-2', 'ring-white/80', 'scale-105');
            } else {
                btn.classList.remove('ring-2', 'ring-white/80', 'scale-105');
            }
        });
        if (typeof playStarNodeChime === 'function') playStarNodeChime(2);
        renderConstellationPad();
    }

    function undoConstellationDraftNode() {
        if (constellationDraftNodes.length > 0) {
            constellationDraftNodes.pop();
            if (typeof playStarNodeChime === 'function') playStarNodeChime(constellationDraftNodes.length);
            renderConstellationPad();
        }
    }

    function spawnPadStarBurst(x, y, colorHex) {
        for (let i = 0; i < 14; i++) {
            const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.3;
            const speed = 28 + Math.random() * 55;
            constellationPadParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: 1.5 + Math.random() * 2.0,
                life: 1.0,
                color: i % 2 === 0 ? '#FFFFFF' : colorHex
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

    function startConstellationPadLoop() {
        if (constellationPadAnimId) cancelAnimationFrame(constellationPadAnimId);
        let lastTime = performance.now();
        function step(now) {
            const modal = document.getElementById('constellationModal');
            if (!modal || modal.classList.contains('hidden')) {
                constellationPadAnimId = null;
                return;
            }
            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;
            renderConstellationPad(now, dt);
            constellationPadAnimId = requestAnimationFrame(step);
        }
        constellationPadAnimId = requestAnimationFrame(step);
    }

    function openConstellationModal() {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        // Ensure Night Mode is enabled so the user can see their constellations in the sky!
        if (typeof isNightMode !== 'undefined' && !isNightMode && typeof toggleDayNightMode === 'function') {
            toggleDayNightMode();
        }
        const modal = document.getElementById('constellationModal');
        if (!modal) return;
        if (constellationBgStars.length === 0) initConstellationBgStars();
        constellationDraftNodes = [];
        constellationPadParticles = [];
        const nameInput = document.getElementById('constellationNameInput');
        if (nameInput) nameInput.value = '';

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            resizeConstellationPad();
            setConstellationDraftColor(constellationDraftColor);
            renderSavedConstellationsList();
            startConstellationPadLoop();
        });
    }

    function closeConstellationModal() {
        const modal = document.getElementById('constellationModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (constellationPadAnimId) {
            cancelAnimationFrame(constellationPadAnimId);
            constellationPadAnimId = null;
        }
    }

    function clearConstellationDraft() {
        constellationDraftNodes = [];
        renderConstellationPad();
    }

    function drawFourPointStar(ctx, x, y, radius, color, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        const outer = radius * 2.2;
        const inner = radius * 0.42;
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const ang = (i * Math.PI) / 4;
            const px = x + Math.cos(ang) * r;
            const py = y + Math.sin(ang) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function renderConstellationPad(now = performance.now(), dt = 0.016) {
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

        const theme = CONSTELLATION_THEMES[constellationDraftColor] || CONSTELLATION_THEMES.gold;

        // 1. Deep Outer Space Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, cssH);
        grad.addColorStop(0, '#040711');
        grad.addColorStop(0.55, '#0B132B');
        grad.addColorStop(1, '#152238');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cssW, cssH);

        // 2. Soft Animated Nebula Glow in Pad
        const nebX = cssW * 0.5 + Math.sin(now * 0.0007) * 35;
        const nebY = cssH * 0.45 + Math.cos(now * 0.0005) * 15;
        const nebGrad = ctx.createRadialGradient(nebX, nebY, 10, nebX, nebY, cssW * 0.48);
        nebGrad.addColorStop(0, theme.nebula);
        nebGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.07)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, cssW, cssH);

        // 3. Subtle Silhouette of the Garden Island Horizon at the bottom edge
        ctx.save();
        ctx.fillStyle = 'rgba(16, 38, 28, 0.65)';
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cssW * 0.5, cssH + 34, cssW * 0.36, 46, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(167, 243, 208, 0.35)';
        ctx.font = '10px "Quicksand", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 Cakrawala Pulau Kebunmu', cssW * 0.5, cssH - 4);
        ctx.restore();

        // 4. Background Selectable Stars
        constellationBgStars.forEach(st => {
            const sx = (st.nx !== undefined ? st.nx : st.x / 500) * cssW;
            const sy = (st.ny !== undefined ? st.ny : st.y / 260) * cssH;
            const twinkle = 0.65 + 0.35 * Math.sin(now * 0.003 + (st.phase || 0));
            const isHovered = constellationHoverStar === st;

            ctx.save();
            if (isHovered) {
                ctx.strokeStyle = theme.star;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(sx, sy, 10 + Math.sin(now * 0.01) * 2, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = isHovered ? theme.star : `rgba(255, 255, 255, ${(0.55 + 0.35 * twinkle).toFixed(2)})`;
            ctx.shadowColor = isHovered ? theme.star : 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = isHovered ? 12 : 5;
            ctx.beginPath();
            ctx.arc(sx, sy, (st.r || 2.8) * (0.85 + 0.2 * twinkle), 0, Math.PI * 2);
            ctx.fill();

            if (st.flare || isHovered) {
                drawFourPointStar(ctx, sx, sy, (st.r || 2.8) * 0.9, isHovered ? theme.star : '#FFFFFF', 0.55 * twinkle);
            }
            ctx.restore();
        });

        // 5. Live Elastic Preview Thread from last node to pointer
        if (constellationDraftNodes.length > 0 && constellationPointerPos) {
            const last = constellationDraftNodes[constellationDraftNodes.length - 1];
            const lx = last.nx * cssW;
            const ly = last.ny * cssH;
            const tx = constellationHoverStar ? constellationHoverStar.nx * cssW : constellationPointerPos.x;
            const ty = constellationHoverStar ? constellationHoverStar.ny * cssH : constellationPointerPos.y;

            ctx.save();
            ctx.strokeStyle = theme.line;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.globalAlpha = 0.65;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.restore();
        }

        // 6. Connected Glowing Lines of Current Draft
        if (constellationDraftNodes.length > 1) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Outer soft glow pass
            ctx.strokeStyle = theme.glow;
            ctx.lineWidth = 6;
            ctx.beginPath();
            constellationDraftNodes.forEach((pt, i) => {
                const px = (pt.nx !== undefined ? pt.nx : pt.x / 500) * cssW;
                const py = (pt.ny !== undefined ? pt.ny : pt.y / 260) * cssH;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();

            // Inner bright starlight thread
            ctx.strokeStyle = theme.line;
            ctx.lineWidth = 2.2;
            ctx.shadowColor = theme.star;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.restore();
        }

        // 7. Selected Star Nodes
        constellationDraftNodes.forEach((pt, idx) => {
            const sx = (pt.nx !== undefined ? pt.nx : pt.x / 500) * cssW;
            const sy = (pt.ny !== undefined ? pt.ny : pt.y / 260) * cssH;
            const pulse = 1 + Math.sin(now * 0.005 + idx) * 0.15;

            ctx.save();
            drawFourPointStar(ctx, sx, sy, 4.2 * pulse, theme.star, 0.9);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = theme.star;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.label;
            ctx.font = 'bold 10px monospace';
            ctx.fillText(String(idx + 1), sx + 8, sy - 6);
            ctx.restore();
        });

        // 8. Update & Draw Stardust Burst Particles
        for (let i = constellationPadParticles.length - 1; i >= 0; i--) {
            const p = constellationPadParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.life -= dt * 2.1;
            if (p.life <= 0) {
                constellationPadParticles.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Smoothly glides the garden camera so the chosen constellation is framed in the sky
    function getConstellationSkySlotOffset(cIdx) {
        const slot = SKY_CONSTELLATION_SLOTS[cIdx % SKY_CONSTELLATION_SLOTS.length];
        const ringMult = 1 + Math.floor(cIdx / SKY_CONSTELLATION_SLOTS.length) * 0.28;
        const isPortrait = typeof screenH !== 'undefined' && typeof screenW !== 'undefined' && screenH > screenW;
        let dx = slot.dx * ringMult;
        let dy = slot.dy * ringMult;
        if (isPortrait) {
            dx *= 0.58;
            if (dy < 0) dy -= 140;
            else dy += 110;
        }
        return { dx, dy, label: slot.label };
    }

    function focusOnConstellationById(id) {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        const idx = gardenConstellations.findIndex(c => c.id === id);
        if (idx === -1) return;
        const c = gardenConstellations[idx];

        if (typeof isNightMode !== 'undefined' && !isNightMode && typeof toggleDayNightMode === 'function') {
            toggleDayNightMode();
        }
        closeConstellationModal();

        focusedConstellationId = c.id;
        focusedConstellationTimer = 4.5;

        if (typeof screenW !== 'undefined' && typeof screenH !== 'undefined' && typeof WORLD_W !== 'undefined') {
            const slot = getConstellationSkySlotOffset(idx);
            const curDx = (typeof c.dx === 'number') ? c.dx : slot.dx;
            const curDy = (typeof c.dy === 'number') ? c.dy : slot.dy;
            const isPortrait = screenH > screenW;
            const targetZoom = isPortrait ? Math.max(0.38, Math.min(0.50, zoom)) : Math.max(0.58, Math.min(0.70, zoom));
            const basePanX = (screenW - WORLD_W * targetZoom) / 2;
            const basePanY = (screenH - WORLD_H * targetZoom) / 2;
            // Gently tilt camera toward the constellation while keeping the lush island horizon anchored in view
            const maxShiftX = screenW * 0.26;
            const maxShiftY = screenH * 0.28;
            const shiftX = Math.max(-maxShiftX, Math.min(maxShiftX, -curDx * targetZoom * 0.52));
            const shiftY = Math.max(-maxShiftY, Math.min(maxShiftY, -curDy * targetZoom * 0.52));
            const targetPanX = basePanX + shiftX;
            const targetPanY = basePanY + shiftY;

            window.constellationCameraTarget = {
                panX: targetPanX,
                panY: targetPanY,
                zoom: targetZoom
            };
        }

        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`🔭 Mengamati rasi bintang "${c.name}" di angkasa malam!`);
        }
        if (typeof playChimeSound === 'function') playChimeSound();
    }

    function viewConstellationsInSky() {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        if (gardenConstellations.length > 0) {
            focusOnConstellationById(gardenConstellations[gardenConstellations.length - 1].id);
        } else {
            if (typeof isNightMode !== 'undefined' && !isNightMode && typeof toggleDayNightMode === 'function') {
                toggleDayNightMode();
            }
            closeConstellationModal();
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('🌌 Menatap angkasa malam di sekeliling pulau kebunmu...');
            }
        }
    }

    function saveConstellationDraft() {
        if (constellationDraftNodes.length < 2) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Hubungkan minimal 2 titik bintang untuk merangkai Rasi Bintang! ✨');
            }
            return;
        }
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        const nameInput = document.getElementById('constellationNameInput');
        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : `Rasi Bintang #${gardenConstellations.length + 1}`;

        // Normalize coordinates relative to their bounding box with comfortable padding so user drawings keep their exact proportions
        const normalized = constellationDraftNodes.map(pt => ({
            nx: Number(((pt.nx !== undefined ? pt.nx : pt.x / 500)).toFixed(3)),
            ny: Number(((pt.ny !== undefined ? pt.ny : pt.y / 260)).toFixed(3))
        }));

        const slot = getConstellationSkySlotOffset(gardenConstellations.length);
        const newConst = {
            id: 'const_' + Date.now(),
            name: name,
            color: constellationDraftColor || 'gold',
            nodes: normalized,
            dx: slot.dx,
            dy: slot.dy
        };

        gardenConstellations.push(newConst);
        window.gardenConstellations = gardenConstellations;

        constellationDraftNodes = [];
        if (nameInput) nameInput.value = '';
        renderConstellationPad();
        renderSavedConstellationsList();

        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();

        // Automatically glide camera to admire the newly created constellation in the outer space sky!
        focusOnConstellationById(newConst.id);
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`🌌 Rasi Bintang "${name}" kini bersinar di angkasa luar pulau kebunmu!`);
        }
    }

    function resetConstellationPositionById(id) {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        const idx = gardenConstellations.findIndex(c => c.id === id);
        if (idx === -1) return;
        const c = gardenConstellations[idx];
        const slot = getConstellationSkySlotOffset(idx);
        c.dx = slot.dx;
        c.dy = slot.dy;
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
        renderSavedConstellationsList();
        focusOnConstellationById(c.id);
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`✨ Posisi rasi "${c.name}" dikembalikan ke orbit awal!`);
        }
    }

    function deleteConstellationById(id) {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        gardenConstellations = gardenConstellations.filter(c => c.id !== id);
        window.gardenConstellations = gardenConstellations;
        renderSavedConstellationsList();
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    }

    function renderSavedConstellationsList() {
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }
        const listEl = document.getElementById('savedConstellationsList');
        if (!listEl) return;
        if (!gardenConstellations || gardenConstellations.length === 0) {
            listEl.innerHTML = `<span class="text-[11px] text-indigo-300/70">Belum ada rasi bintang. Ketuk atau seret bintang di atas untuk melukis angkasa!</span>`;
            return;
        }
        listEl.innerHTML = gardenConstellations.map(c => {
            const th = CONSTELLATION_THEMES[c.color] || CONSTELLATION_THEMES.gold;
            return `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/90 hover:bg-indigo-900 text-amber-100 border border-indigo-400/40 text-xs transition shadow-2xs">
                <button type="button" onclick="focusOnConstellationById('${c.id}')" class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition" title="Lihat rasi bintang ini di angkasa">
                    <span style="color:${th.star}">✦</span>
                    <span class="font-medium">${c.name}</span>
                </button>
                <button type="button" onclick="resetConstellationPositionById('${c.id}')" class="text-indigo-300 hover:text-indigo-100 font-bold ml-1 cursor-pointer" title="Kembalikan ke posisi orbit awal">↺</button>
                <button type="button" onclick="deleteConstellationById('${c.id}')" class="text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer" title="Hapus Rasi">✕</button>
            </div>
            `;
        }).join('');
    }

    /**
     * Renders the Deep Space Cosmos, Parallax Starfield, Shooting Stars, and Custom Constellations
     * onto the background sky layer (composited BEHIND the 3D Grass Island via destination-over).
     */
    function drawGardenConstellationsInSky(targetCtx, screenW, screenH, nightAlpha, now, dt = 0.016) {
        initCosmicStarfield();
        if (typeof window !== 'undefined' && Array.isArray(window.gardenConstellations)) {
            gardenConstellations = window.gardenConstellations;
        }

        const dpr = (typeof canvasDpr !== 'undefined' && canvasDpr) ? canvasDpr : 1;
        if (!cosmicSkyCanvas && typeof document !== 'undefined') {
            cosmicSkyCanvas = document.createElement('canvas');
            cosmicSkyCtx = cosmicSkyCanvas.getContext('2d');
        }
        if (!cosmicSkyCanvas || !cosmicSkyCtx) return;

        const targetW = Math.max(1, Math.round(screenW * dpr));
        const targetH = Math.max(1, Math.round(screenH * dpr));
        if (cosmicSkyCanvas.width !== targetW || cosmicSkyCanvas.height !== targetH) {
            cosmicSkyCanvas.width = targetW;
            cosmicSkyCanvas.height = targetH;
        }

        const sctx = cosmicSkyCtx;
        sctx.save();
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 1. Base Day/Night Sky Gradient
        sctx.fillStyle = '#FDFBF2';
        sctx.fillRect(0, 0, screenW, screenH);

        if (nightAlpha > 0.005) {
            sctx.save();
            sctx.globalAlpha = Math.min(1, nightAlpha);

            // Deep outer-space radial/linear gradient
            const skyGrad = sctx.createLinearGradient(0, 0, 0, screenH);
            skyGrad.addColorStop(0, '#040711');
            skyGrad.addColorStop(0.45, '#091124');
            skyGrad.addColorStop(0.85, '#101C35');
            skyGrad.addColorStop(1, '#162440');
            sctx.fillStyle = skyGrad;
            sctx.fillRect(0, 0, screenW, screenH);

            // Camera delta from centered island view for smooth multi-plane parallax
            const curZoom = (typeof zoom !== 'undefined') ? zoom : 1.0;
            const wW = (typeof WORLD_W !== 'undefined') ? WORLD_W : 4200;
            const wH = (typeof WORLD_H !== 'undefined') ? WORLD_H : 3200;
            const basePanX = (screenW - wW * curZoom) / 2;
            const basePanY = (screenH - wH * curZoom) / 2;
            const camDeltaX = ((typeof panX !== 'undefined' ? panX : basePanX) - basePanX);
            const camDeltaY = ((typeof panY !== 'undefined' ? panY : basePanY) - basePanY);
            const skyScale = Math.pow(curZoom, 0.55);

            // 2. Drifting Parallax Cosmic Nebulae
            cosmicNebulaClouds.forEach(nb => {
                const driftX = Math.sin(now * 0.00025 + nb.phase) * 28;
                const driftY = Math.cos(now * 0.0002 + nb.phase) * 18;
                const nx = screenW * 0.5 + camDeltaX * nb.parallax + (nb.ox + driftX) * skyScale;
                const ny = screenH * 0.48 + camDeltaY * nb.parallax + (nb.oy + driftY) * skyScale;
                const rad = nb.rx * skyScale;
                if (nx + rad < 0 || nx - rad > screenW || ny + rad < 0 || ny - rad > screenH) return;

                const g = sctx.createRadialGradient(nx, ny, rad * 0.05, nx, ny, rad);
                g.addColorStop(0, nb.color);
                g.addColorStop(0.55, nb.color.replace(/0\.\d+\)/, '0.04)'));
                g.addColorStop(1, 'rgba(0, 0, 0, 0)');
                sctx.fillStyle = g;
                sctx.beginPath();
                sctx.arc(nx, ny, rad, 0, Math.PI * 2);
                sctx.fill();
            });

            // 3. 3-Layer Parallax Twinkling Starfield
            cosmicBackgroundStars.forEach(st => {
                const sx = screenW * 0.5 + camDeltaX * st.parallax + st.ox * skyScale;
                const sy = screenH * 0.48 + camDeltaY * st.parallax + st.oy * skyScale;
                // Wrap stars seamlessly across a generous virtual sky box so panning infinitely reveals stars
                const wrapW = Math.max(screenW * 1.6, 1600);
                const wrapH = Math.max(screenH * 1.6, 1200);
                const wx = (((sx + wrapW * 0.5) % wrapW) + wrapW) % wrapW - wrapW * 0.5 + screenW * 0.5;
                const wy = (((sy + wrapH * 0.5) % wrapH) + wrapH) % wrapH - wrapH * 0.5 + screenH * 0.5;

                if (wx < -12 || wx > screenW + 12 || wy < -12 || wy > screenH + 12) return;

                const twinkle = 0.55 + 0.45 * Math.sin(now * st.speed + st.phase);
                const r = st.r * (0.8 + 0.25 * twinkle);

                sctx.fillStyle = st.color;
                sctx.globalAlpha = nightAlpha * (0.45 + 0.55 * twinkle);
                sctx.beginPath();
                sctx.arc(wx, wy, r, 0, Math.PI * 2);
                sctx.fill();

                if (st.flare && twinkle > 0.72) {
                    drawFourPointStar(sctx, wx, wy, r * 1.15, st.color, nightAlpha * (twinkle - 0.35));
                }
            });
            sctx.globalAlpha = Math.min(1, nightAlpha);

            // 4. Ambient Shooting Stars / Meteors in Deep Space
            cosmicShootingTimer -= dt;
            if (cosmicShootingTimer <= 0) {
                cosmicShootingTimer = 4.0 + Math.random() * 4.5;
                const startX = Math.random() * screenW * 0.85 + screenW * 0.08;
                const startY = Math.random() * screenH * 0.45 + 15;
                const angle = (Math.PI * 0.18) + (Math.random() - 0.5) * 0.25;
                const dir = Math.random() > 0.5 ? 1 : -1;
                const speed = 340 + Math.random() * 180;
                cosmicShootingStars.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * speed * dir,
                    vy: Math.sin(angle) * speed,
                    len: 65 + Math.random() * 45,
                    life: 1.0
                });
            }

            for (let i = cosmicShootingStars.length - 1; i >= 0; i--) {
                const ms = cosmicShootingStars[i];
                ms.x += ms.vx * dt;
                ms.y += ms.vy * dt;
                ms.life -= dt * 1.35;
                if (ms.life <= 0) {
                    cosmicShootingStars.splice(i, 1);
                    continue;
                }
                const speedMag = Math.hypot(ms.vx, ms.vy) || 1;
                const tailX = ms.x - (ms.vx / speedMag) * ms.len;
                const tailY = ms.y - (ms.vy / speedMag) * ms.len;

                const mg = sctx.createLinearGradient(ms.x, ms.y, tailX, tailY);
                mg.addColorStop(0, `rgba(255, 255, 255, ${(ms.life * nightAlpha).toFixed(2)})`);
                mg.addColorStop(0.3, `rgba(186, 230, 253, ${(ms.life * 0.65 * nightAlpha).toFixed(2)})`);
                mg.addColorStop(1, 'rgba(56, 189, 248, 0)');

                sctx.save();
                sctx.strokeStyle = mg;
                sctx.lineWidth = 2.0;
                sctx.lineCap = 'round';
                sctx.beginPath();
                sctx.moveTo(ms.x, ms.y);
                sctx.lineTo(tailX, tailY);
                sctx.stroke();
                drawFourPointStar(sctx, ms.x, ms.y, 2.6, '#FFFFFF', ms.life * nightAlpha);
                sctx.restore();
            }

            // 5. Player's Custom Constellations in Parallax Celestial Space around the Island
            if (focusedConstellationTimer > 0) {
                focusedConstellationTimer = Math.max(0, focusedConstellationTimer - dt);
                if (focusedConstellationTimer <= 0) focusedConstellationId = null;
            }

            if (gardenConstellations && gardenConstellations.length > 0) {
                const constParallax = 0.58;
                const skyCenterX = screenW * 0.5 + camDeltaX * constParallax;
                const skyCenterY = screenH * 0.52 + camDeltaY * constParallax;
                const boxW = 165 * Math.pow(curZoom, 0.65);
                const boxH = 105 * Math.pow(curZoom, 0.65);

                const islandWx = (typeof WORLD_W !== 'undefined') ? WORLD_W * 0.5 : 2100;
                const islandWy = (typeof WORLD_H !== 'undefined') ? WORLD_H * 0.52 : 1664;

                gardenConstellations.forEach((c, cIdx) => {
                    if (!c.nodes || c.nodes.length < 2) return;
                    const theme = CONSTELLATION_THEMES[c.color] || CONSTELLATION_THEMES.gold;
                    const slot = getConstellationSkySlotOffset(cIdx);
                    if (typeof c.dx !== 'number' || typeof c.dy !== 'number') {
                        c.dx = slot.dx;
                        c.dy = slot.dy;
                    }

                    const isBeingDragged = (typeof window !== 'undefined' && window.draggedConstellation === c);

                    // 1. Auto-evasion / drift away if expanding terrain covers or borders this constellation
                    const wx = islandWx + c.dx;
                    const wy = islandWy + c.dy;
                    const isNearTerrain = (typeof isNearGrass === 'function' && isNearGrass(wx, wy, 140)) ||
                                          (typeof isNearWater === 'function' && isNearWater(wx, wy, 140)) ||
                                          (typeof isPointOnGrass === 'function' && isPointOnGrass(wx, wy)) ||
                                          (typeof isPointOnWater === 'function' && isPointOnWater(wx, wy));

                    if (isNearTerrain && !isBeingDragged) {
                        let dirX = c.dx;
                        let dirY = c.dy;
                        let dist = Math.hypot(dirX, dirY);
                        if (dist < 10) {
                            dirX = 0;
                            dirY = -1;
                            dist = 1;
                        }
                        dirX /= dist;
                        dirY /= dist;

                        const driftSpeed = 360; // Smooth glide ~360px per second into clear outer space
                        c.dx += dirX * driftSpeed * dt;
                        c.dy += dirY * driftSpeed * dt;
                        c._wasAutoDrifting = true;

                        // Spawn drifting stardust sparkle trail
                        if (Math.random() < 0.4) {
                            if (!c._sparkles) c._sparkles = [];
                            c._sparkles.push({
                                x: (Math.random() - 0.5) * boxW * 0.8,
                                y: (Math.random() - 0.5) * boxH * 0.8,
                                vx: -dirX * 35 + (Math.random() - 0.5) * 18,
                                vy: -dirY * 35 + (Math.random() - 0.5) * 18,
                                life: 1.0,
                                size: 1.5 + Math.random() * 2
                            });
                        }
                    } else if (c._wasAutoDrifting && !isNearTerrain) {
                        c._wasAutoDrifting = false;
                        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
                    }

                    const cx = skyCenterX + c.dx * curZoom;
                    const cy = skyCenterY + c.dy * curZoom;

                    // Compute node screen coordinates centered around (cx, cy)
                    let minNx = 1, maxNx = 0, minNy = 1, maxNy = 0;
                    c.nodes.forEach(nd => {
                        if (nd.nx < minNx) minNx = nd.nx;
                        if (nd.nx > maxNx) maxNx = nd.nx;
                        if (nd.ny < minNy) minNy = nd.ny;
                        if (nd.ny > maxNy) maxNy = nd.ny;
                    });
                    const midNx = (minNx + maxNx) * 0.5;
                    const midNy = (minNy + maxNy) * 0.5;

                    const screenPts = c.nodes.map(nd => ({
                        x: cx + (nd.nx - midNx) * boxW,
                        y: cy + (nd.ny - midNy) * boxH
                    }));

                    const shimmer = 0.78 + Math.sin(now * 0.0024 + cIdx * 1.3) * 0.22;

                    // A. Soft Celestial Nebula Aura behind this Constellation
                    const auraRad = Math.max(boxW, boxH) * 0.78;
                    const auraGrad = sctx.createRadialGradient(cx, cy, 4, cx, cy, auraRad);
                    auraGrad.addColorStop(0, theme.nebula);
                    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    sctx.fillStyle = auraGrad;
                    sctx.beginPath();
                    sctx.arc(cx, cy, auraRad, 0, Math.PI * 2);
                    sctx.fill();

                    // Render stardust sparkle particles during drift
                    if (c._sparkles && c._sparkles.length > 0) {
                        for (let si = c._sparkles.length - 1; si >= 0; si--) {
                            const sp = c._sparkles[si];
                            sp.x += sp.vx * dt;
                            sp.y += sp.vy * dt;
                            sp.life -= dt * 1.5;
                            if (sp.life <= 0) {
                                c._sparkles.splice(si, 1);
                                continue;
                            }
                            sctx.save();
                            sctx.globalAlpha = sp.life * nightAlpha * 0.85;
                            sctx.fillStyle = theme.star;
                            sctx.beginPath();
                            sctx.arc(cx + sp.x, cy + sp.y, sp.size * sp.life, 0, Math.PI * 2);
                            sctx.fill();
                            sctx.restore();
                        }
                    }

                    // Pulsating Orbital Alignment Ring when dragged by player
                    if (isBeingDragged) {
                        sctx.save();
                        sctx.strokeStyle = theme.star;
                        sctx.lineWidth = 1.8;
                        sctx.setLineDash([6, 4]);
                        sctx.lineDashOffset = -(now * 0.02);
                        sctx.globalAlpha = nightAlpha * 0.95;
                        sctx.beginPath();
                        sctx.arc(cx, cy, auraRad * 1.05, 0, Math.PI * 2);
                        sctx.stroke();
                        sctx.restore();
                    }

                    // B. Highlight Ring if newly created or focused via Telescope
                    if (focusedConstellationId === c.id && focusedConstellationTimer > 0) {
                        const ringPulse = 1 + Math.sin(now * 0.006) * 0.08;
                        sctx.save();
                        sctx.strokeStyle = theme.star;
                        sctx.globalAlpha = Math.min(1, focusedConstellationTimer * 0.6) * nightAlpha;
                        sctx.lineWidth = 1.5;
                        sctx.setLineDash([6, 4]);
                        sctx.beginPath();
                        sctx.arc(cx, cy, auraRad * 0.85 * ringPulse, 0, Math.PI * 2);
                        sctx.stroke();
                        sctx.restore();
                    }

                    // C. Glowing Constellation Connecting Threads (Outer Glow + Crisp Starlight Core)
                    sctx.save();
                    sctx.lineCap = 'round';
                    sctx.lineJoin = 'round';

                    // Soft outer glow
                    sctx.strokeStyle = theme.glow;
                    sctx.lineWidth = isBeingDragged ? 5.5 : 4.5;
                    sctx.globalAlpha = nightAlpha * (isBeingDragged ? 0.9 : 0.65) * shimmer;
                    sctx.beginPath();
                    screenPts.forEach((pt, i) => {
                        if (i === 0) sctx.moveTo(pt.x, pt.y);
                        else sctx.lineTo(pt.x, pt.y);
                    });
                    sctx.stroke();

                    // Inner crisp celestial line
                    sctx.strokeStyle = theme.line;
                    sctx.lineWidth = 1.5;
                    sctx.globalAlpha = nightAlpha * 0.9 * shimmer;
                    sctx.setLineDash([5, 3]);
                    sctx.lineDashOffset = -(now * 0.012);
                    sctx.stroke();
                    sctx.setLineDash([]);
                    sctx.restore();

                    // D. Star Vertices with 4-Point Astronomical Spikes
                    let topY = Infinity;
                    screenPts.forEach((pt, nIdx) => {
                        if (pt.y < topY) topY = pt.y;
                        const nodeTwinkle = 0.75 + 0.25 * Math.sin(now * 0.004 + cIdx + nIdx * 0.9);
                        const starRad = (2.6 + (nIdx === 0 ? 0.6 : 0)) * nodeTwinkle;

                        drawFourPointStar(sctx, pt.x, pt.y, starRad * 1.15, theme.star, nightAlpha * 0.85 * nodeTwinkle);
                        sctx.save();
                        sctx.fillStyle = '#FFFFFF';
                        sctx.globalAlpha = nightAlpha;
                        sctx.beginPath();
                        sctx.arc(pt.x, pt.y, starRad * 0.68, 0, Math.PI * 2);
                        sctx.fill();
                        sctx.restore();
                    });

                    // E. Sleek Astronomical Constellation Caption
                    const labelY = Math.max(18, topY - 14);
                    sctx.save();
                    sctx.font = '600 10.5px "Quicksand", sans-serif';
                    sctx.textAlign = 'center';
                    sctx.textBaseline = 'middle';
                    const labelText = isBeingDragged ? `✥ Geser: ${c.name}` : `✦ ${c.name}`;
                    const textW = sctx.measureText(labelText).width;
                    const pillW = textW + 14;
                    const pillH = 18;

                    sctx.globalAlpha = nightAlpha * (isBeingDragged ? 0.96 : 0.82);
                    sctx.fillStyle = isBeingDragged ? 'rgba(30, 27, 75, 0.92)' : 'rgba(9, 14, 28, 0.68)';
                    sctx.strokeStyle = isBeingDragged ? theme.star : theme.badgeBorder;
                    sctx.lineWidth = isBeingDragged ? 1.5 : 1;
                    sctx.beginPath();
                    if (typeof sctx.roundRect === 'function') {
                        sctx.roundRect(cx - pillW / 2, labelY - pillH / 2, pillW, pillH, 9);
                    } else {
                        sctx.rect(cx - pillW / 2, labelY - pillH / 2, pillW, pillH);
                    }
                    sctx.fill();
                    sctx.stroke();

                    sctx.fillStyle = isBeingDragged ? '#FEF08A' : theme.label;
                    sctx.globalAlpha = nightAlpha * 0.95;
                    sctx.fillText(labelText, cx, labelY + 0.5);
                    sctx.restore();

                    // Store screen interaction bounds for interactive touch & drag
                    c._screenCx = cx;
                    c._screenCy = cy;
                    c._screenLabelY = labelY;
                    c._badgeBounds = {
                        x1: cx - pillW / 2 - 14,
                        x2: cx + pillW / 2 + 14,
                        y1: labelY - pillH / 2 - 12,
                        y2: labelY + pillH / 2 + 12
                    };
                    c._starsRadius = Math.max(boxW, boxH) * 0.65;
                });
            }

            sctx.restore();
        }

        sctx.restore();

        // Blit the completed Cosmic Sky Canvas onto targetCtx (which has destination-over set so it sits BEHIND the 3D Island!)
        targetCtx.drawImage(cosmicSkyCanvas, 0, 0, screenW, screenH);
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

            function getSnappedOrRawStar(e, snapRadius = 24) {
                const rect = constCanvas.getBoundingClientRect();
                const cssW = rect.width;
                const cssH = rect.height;
                if (!cssW || !cssH) return null;

                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                constellationPointerPos = { x: clickX, y: clickY };

                let chosenNx = Math.max(0.04, Math.min(0.96, clickX / cssW));
                let chosenNy = Math.max(0.05, Math.min(0.88, clickY / cssH));
                let minDist = snapRadius;
                let snappedStar = null;

                for (let st of constellationBgStars) {
                    const sx = (st.nx !== undefined ? st.nx : st.x / 500) * cssW;
                    const sy = (st.ny !== undefined ? st.ny : st.y / 260) * cssH;
                    const dist = Math.hypot(sx - clickX, sy - clickY);
                    if (dist < minDist) {
                        minDist = dist;
                        chosenNx = (st.nx !== undefined ? st.nx : st.x / 500);
                        chosenNy = (st.ny !== undefined ? st.ny : st.y / 260);
                        snappedStar = st;
                    }
                }
                constellationHoverStar = snappedStar;
                return { nx: chosenNx, ny: chosenNy, screenX: chosenNx * cssW, screenY: chosenNy * cssH, snappedStar };
            }

            function addStarNodeIfDistinct(pt) {
                if (!pt) return;
                const last = constellationDraftNodes[constellationDraftNodes.length - 1];
                if (last && Math.hypot(last.nx - pt.nx, last.ny - pt.ny) < 0.025) return;

                constellationDraftNodes.push({ nx: pt.nx, ny: pt.ny });
                const theme = CONSTELLATION_THEMES[constellationDraftColor] || CONSTELLATION_THEMES.gold;
                spawnPadStarBurst(pt.screenX, pt.screenY, theme.star);
                playStarNodeChime(constellationDraftNodes.length - 1);
                renderConstellationPad();
            }

            constCanvas.addEventListener('pointerdown', (e) => {
                constellationIsDragging = true;
                const pt = getSnappedOrRawStar(e, 26);
                addStarNodeIfDistinct(pt);
            });

            constCanvas.addEventListener('pointermove', (e) => {
                const pt = getSnappedOrRawStar(e, 22);
                if (constellationIsDragging && pt && pt.snappedStar) {
                    // When dragging across the sky, automatically chain snapped background stars!
                    const alreadyUsed = constellationDraftNodes.some(
                        n => Math.hypot(n.nx - pt.nx, n.ny - pt.ny) < 0.02
                    );
                    if (!alreadyUsed) {
                        addStarNodeIfDistinct(pt);
                    }
                }
            });

            window.addEventListener('pointerup', () => {
                constellationIsDragging = false;
            });

            constCanvas.addEventListener('pointerleave', () => {
                constellationHoverStar = null;
                constellationPointerPos = null;
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
    function findConstellationAtScreenPoint(sx, sy) {
        if (typeof window === 'undefined' || !Array.isArray(window.gardenConstellations)) return null;
        const constellations = window.gardenConstellations;
        // Check topmost drawn constellation first
        for (let i = constellations.length - 1; i >= 0; i--) {
            const c = constellations[i];
            if (!c) continue;
            // Badge hit area
            if (c._badgeBounds) {
                if (sx >= c._badgeBounds.x1 && sx <= c._badgeBounds.x2 &&
                    sy >= c._badgeBounds.y1 && sy <= c._badgeBounds.y2) {
                    return { constellation: c, hitType: 'badge' };
                }
            }
            // Star cluster radius
            if (typeof c._screenCx === 'number' && typeof c._screenCy === 'number') {
                const r = c._starsRadius || 75;
                if (Math.hypot(sx - c._screenCx, sy - c._screenCy) <= r) {
                    return { constellation: c, hitType: 'stars' };
                }
            }
        }
        return null;
    }

    window.inviteOwlArtCritic = inviteOwlArtCritic;
    window.updateAndDrawOwlCritic = updateAndDrawOwlCritic;
    window.openConstellationModal = openConstellationModal;
    window.closeConstellationModal = closeConstellationModal;
    window.clearConstellationDraft = clearConstellationDraft;
    window.undoConstellationDraftNode = undoConstellationDraftNode;
    window.setConstellationDraftColor = setConstellationDraftColor;
    window.shuffleConstellationBgStars = shuffleConstellationBgStars;
    window.focusOnConstellationById = focusOnConstellationById;
    window.viewConstellationsInSky = viewConstellationsInSky;
    window.saveConstellationDraft = saveConstellationDraft;
    window.resetConstellationPositionById = resetConstellationPositionById;
    window.deleteConstellationById = deleteConstellationById;
    window.drawGardenConstellationsInSky = drawGardenConstellationsInSky;
    window.findConstellationAtScreenPoint = findConstellationAtScreenPoint;

})();
