/********************************************************************
 * FELLA'S GARDEN - PAINTER GAMEPLAY FEATURES (js/painter_features.js)
 *
 * Implements the 7 Approved Painter Features:
 * 1. Kuas Spesial (Pencil, Watercolor, Crayon, Glitter, Glow, Stamp)
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
    // 1. SPECIAL BRUSHES & STAMP ENGINE + STROKE TIMELAPSE RECORDING
    // =========================================================================
    var studioBrushType = 'pencil'; // 'pencil' | 'watercolor' | 'crayon' | 'glitter' | 'glow' | 'stamp'
    var studioStampShape = 'petal'; // 'petal' | 'leaf' | 'star' | 'heart' | 'bud'
    var recordedFlowerStrokes = [];
    var currentRecordingStroke = null;
    var isReplayingTimelapse = false;

    var currentPadEffects = {
        hasWatercolor: false,
        hasCrayon: false,
        hasGlitter: false,
        hasGlowBrush: false,
        glowColor: '#F7CE68',
        stampCount: 0
    };

    function resetPadPainterMetadata() {
        recordedFlowerStrokes = [];
        currentRecordingStroke = null;
        currentPadEffects = {
            hasWatercolor: false,
            hasCrayon: false,
            hasGlitter: false,
            hasGlowBrush: false,
            glowColor: '#F7CE68',
            stampCount: 0
        };
    }

    function setStudioBrushType(type) {
        studioBrushType = type;
        window.studioBrushType = type;

        if (typeof setStudioTool === 'function' && studioTool !== 'pencil') {
            setStudioTool('pencil');
        }

        // Update UI buttons
        const types = ['pencil', 'watercolor', 'crayon', 'glitter', 'glow', 'stamp'];
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

        const stampSubBar = document.getElementById('studioStampSubBar');
        if (stampSubBar) {
            if (type === 'stamp') {
                stampSubBar.classList.remove('hidden');
                stampSubBar.classList.add('flex');
            } else {
                stampSubBar.classList.add('hidden');
                stampSubBar.classList.remove('flex');
            }
        }
    }

    function setStudioStampShape(shape) {
        studioStampShape = shape;
        const shapes = ['petal', 'leaf', 'star', 'heart', 'bud'];
        shapes.forEach(s => {
            const btn = document.getElementById('stampShapeBtn-' + s);
            if (btn) {
                if (s === shape) {
                    btn.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-2xs transition cursor-pointer';
                } else {
                    btn.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 transition cursor-pointer';
                }
            }
        });
    }

    // Draw a stamp shape at (x, y)
    function drawStampOnCtx(ctx, x, y, shape, color, size) {
        const r = Math.max(12, size * 2.2);
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1.2;

        if (shape === 'petal') {
            // 5-petal cute flower head
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI * 2) / 5);
                ctx.beginPath();
                ctx.ellipse(0, -r * 0.55, r * 0.36, r * 0.52, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = '#F7CE68';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
            ctx.fill();
        } else if (shape === 'leaf') {
            ctx.beginPath();
            ctx.moveTo(0, r * 0.7);
            ctx.quadraticCurveTo(r * 0.8, 0, 0, -r * 0.8);
            ctx.quadraticCurveTo(-r * 0.8, 0, 0, r * 0.7);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, r * 0.55);
            ctx.lineTo(0, -r * 0.55);
            ctx.stroke();
        } else if (shape === 'star') {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const rad = i % 2 === 0 ? r * 0.75 : r * 0.35;
                const ang = (i * Math.PI) / 5 - Math.PI / 2;
                if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
                else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
            }
            ctx.closePath();
            ctx.fill();
        } else if (shape === 'heart') {
            const s = r * 0.045;
            ctx.beginPath();
            ctx.moveTo(0, 4 * s);
            ctx.bezierCurveTo(0, 0, -12 * s, 0, -12 * s, 7 * s);
            ctx.bezierCurveTo(-12 * s, 14 * s, 0, 18 * s, 0, 22 * s);
            ctx.bezierCurveTo(0, 18 * s, 12 * s, 14 * s, 12 * s, 7 * s);
            ctx.bezierCurveTo(12 * s, 0, 0, 0, 0, 4 * s);
            ctx.fill();
        } else if (shape === 'bud') {
            // Tulip bud
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.55, 0, Math.PI, false);
            ctx.lineTo(-r * 0.55, -r * 0.45);
            ctx.lineTo(-r * 0.2, -r * 0.15);
            ctx.lineTo(0, -r * 0.55);
            ctx.lineTo(r * 0.2, -r * 0.15);
            ctx.lineTo(r * 0.55, -r * 0.45);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // Specialized Brush Down Renderer
    function renderBrushDownOnCtx(ctx, pos, tool, brushType, color, size, stampShape) {
        if (tool === 'eraser') {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(2, (size * 1.8) / 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (brushType === 'stamp') {
            drawStampOnCtx(ctx, pos.x, pos.y, stampShape || studioStampShape, color, size);
            currentPadEffects.stampCount++;
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        if (brushType === 'watercolor') {
            currentPadEffects.hasWatercolor = true;
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = size * 0.85;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(2, size * 0.75), 0, Math.PI * 2);
            ctx.fill();
        } else if (brushType === 'crayon') {
            currentPadEffects.hasCrayon = true;
            ctx.fillStyle = color;
            const rad = Math.max(2, size * 0.65);
            for (let i = 0; i < 10; i++) {
                const ox = (Math.random() - 0.5) * rad * 1.5;
                const oy = (Math.random() - 0.5) * rad * 1.5;
                ctx.globalAlpha = 0.45 + Math.random() * 0.45;
                ctx.fillRect(pos.x + ox, pos.y + oy, 2.2, 2.2);
            }
        } else if (brushType === 'glitter') {
            currentPadEffects.hasGlitter = true;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(1.5, size * 0.45), 0, Math.PI * 2);
            ctx.fill();
            // Sparkle dots
            ctx.fillStyle = '#FFFBEB';
            ctx.beginPath();
            ctx.arc(pos.x + (Math.random() - 0.5) * size, pos.y + (Math.random() - 0.5) * size, 1.8, 0, Math.PI * 2);
            ctx.fill();
        } else if (brushType === 'glow') {
            currentPadEffects.hasGlowBrush = true;
            currentPadEffects.glowColor = color;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = Math.max(10, size * 1.4);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(1.5, size * 0.5), 0, Math.PI * 2);
            ctx.fill();
            // Bright inner core
            ctx.fillStyle = 'rgba(255,255,255,0.65)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, Math.max(1, size * 0.22), 0, Math.PI * 2);
            ctx.fill();
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

        if (brushType === 'stamp') {
            // Stamps only place on pointerdown (or spaced intervals)
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (brushType === 'watercolor') {
            currentPadEffects.hasWatercolor = true;
            ctx.globalAlpha = 0.16;
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 1.35;
            ctx.shadowColor = color;
            ctx.shadowBlur = size * 0.7;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();
        } else if (brushType === 'crayon') {
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
        } else if (brushType === 'glitter') {
            currentPadEffects.hasGlitter = true;
            ctx.strokeStyle = color;
            ctx.lineWidth = size * 0.85;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();

            // Sprinkle glitter stars along path
            if (Math.random() < 0.75) {
                const gx = toPos.x + (Math.random() - 0.5) * size * 1.8;
                const gy = toPos.y + (Math.random() - 0.5) * size * 1.8;
                ctx.fillStyle = Math.random() < 0.5 ? '#FFFFFF' : '#FDE047';
                ctx.beginPath();
                ctx.arc(gx, gy, 1.5 + Math.random() * 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (brushType === 'glow') {
            currentPadEffects.hasGlowBrush = true;
            currentPadEffects.glowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.shadowColor = color;
            ctx.shadowBlur = Math.max(10, size * 1.4);
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();

            // Inner bright core line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.lineWidth = Math.max(1.5, size * 0.35);
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.stroke();
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
    function startRecordingStroke(pos, tool, brushType, color, size, stampShape) {
        if (isReplayingTimelapse) return;
        currentRecordingStroke = {
            tool: tool,
            brushType: brushType,
            color: color,
            size: size,
            stampShape: stampShape || studioStampShape,
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
            renderBrushDownOnCtx(ctx, st.points[0], st.tool, st.brushType, st.color, st.size, st.stampShape);
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
        newFlower.hasGlitter = !!currentPadEffects.hasGlitter;
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
            desc: 'Lukis bunga menggunakan Kuas Cahaya (Glow) atau Glitter!',
            rewardStars: 4,
            check: (analysis, flw) => !!(flw && (flw.hasGlowBrush || flw.hasGlitter))
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
            desc: 'Gunakan Kuas Cat Air, Krayon, Glitter, atau Cahaya',
            rewardStars: 3,
            check: (analysis, flw) => !!(flw && (flw.hasWatercolor || flw.hasCrayon || flw.hasGlitter || flw.hasGlowBrush))
        },
        {
            id: 'dpc_stamp',
            title: 'Master Stempel Bunga',
            desc: 'Padukan Stempel Kelopak/Daun/Bintang di dalam lukisanmu',
            rewardStars: 3,
            check: () => currentPadEffects.stampCount > 0
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
                x: 45 + Math.random() * 410,
                y: 35 + Math.random() * 210,
                r: 2.5 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2
            });
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
        renderConstellationPad();
        renderSavedConstellationsList();
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
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        // Deep night sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#090D16');
        grad.addColorStop(0.6, '#131C31');
        grad.addColorStop(1, '#1E293B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Background selectable stars
        constellationBgStars.forEach(st => {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
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
            ctx.moveTo(constellationDraftNodes[0].x, constellationDraftNodes[0].y);
            for (let i = 1; i < constellationDraftNodes.length; i++) {
                ctx.lineTo(constellationDraftNodes[i].x, constellationDraftNodes[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }

        // Selected star nodes
        constellationDraftNodes.forEach((pt, idx) => {
            ctx.save();
            ctx.fillStyle = '#FEF08A';
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(String(idx + 1), pt.x + 7, pt.y - 5);
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

        // Normalize coordinates to 0..1 relative to canvas (500x260)
        const normalized = constellationDraftNodes.map(pt => ({
            nx: Number((pt.x / 500).toFixed(3)),
            ny: Number((pt.y / 260).toFixed(3))
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

        // C. Twinkling Glitter Stars for 'glitter' brush flowers
        if (f.hasGlitter) {
            targetCtx.save();
            for (let i = 0; i < 3; i++) {
                const phase = now * 0.005 + i * 2.1 + (f.swayPhase || 0);
                const alpha = Math.max(0, Math.sin(phase));
                if (alpha > 0.2) {
                    const gx = Math.sin(i * 3.7 + (f.swayPhase || 0)) * (f.width * 0.3);
                    const gy = drawY + (0.2 + (i * 0.22)) * f.height;
                    targetCtx.fillStyle = `rgba(255, 251, 235, ${alpha * 0.9})`;
                    targetCtx.beginPath();
                    targetCtx.arc(gx, gy, 2.2 * alpha, 0, Math.PI * 2);
                    targetCtx.fill();
                }
            }
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
                const x = (e.clientX - rect.left) * (constCanvas.width / rect.width);
                const y = (e.clientY - rect.top) * (constCanvas.height / rect.height);

                // Snap to nearest background star if close
                let chosenX = x, chosenY = y;
                for (let st of constellationBgStars) {
                    if (Math.hypot(st.x - x, st.y - y) < 18) {
                        chosenX = st.x;
                        chosenY = st.y;
                        break;
                    }
                }
                constellationDraftNodes.push({ x: chosenX, y: chosenY });
                if (typeof playPencilSound === 'function') playPencilSound();
                renderConstellationPad();
            });
        }

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
    window.setStudioStampShape = setStudioStampShape;
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

