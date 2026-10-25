/********************************************************************
 * FELLA'S GARDEN - SOUND SYNTHESIS & ASSET AUDIO ENGINE (js/audio.js)
 ********************************************************************/

var audioInitialized = false;
var pluckSynth, waterSynth, popSynth;

// Sound file playlists from assets/sounds/
var catSoundFiles = [
  "assets/sounds/cat/cat-sound-1.mp3",
  "assets/sounds/cat/cat-sound-2.mp3",
  "assets/sounds/cat/cat-sound-3.mp3",
  "assets/sounds/cat/cat-sound-4.mp3",
  "assets/sounds/cat/cat-sound-5.mp3",
];

var dogSoundFiles = [
  "assets/sounds/dog/dog-sound-1.mp3",
  "assets/sounds/dog/dog-sound-2.mp3",
  "assets/sounds/dog/dog-sound-3.mp3",
  "assets/sounds/dog/dog-sound-4.mp3",
  "assets/sounds/dog/dog-sound-5.mp3",
];

var plantingSoundFiles = [
  "assets/sounds/planting/planting-sound-1.mp3",
  "assets/sounds/planting/planting-sound-2.mp3",
  "assets/sounds/planting/planting-sound-3.mp3",
];

// Sound files for Raining and Watering
var rainSoundFile = "assets/sounds/rain/raining.mp3";
var wateringSoundFile = "assets/sounds/watering/watering.mp3";
var clickSoundFile = "assets/sounds/click/click.mp3";
var rainAudio = null;
var wateringAudio = null;
var wateringStopTimer = null;

// ====================================================================
// BACKGROUND MUSIC PLAYLIST & SEQUENTIAL AUDIO ENGINE
// ====================================================================
var bgmPlaylist = [
  {
    id: "walk",
    title: "A Walk In The Park",
    file: "assets/sounds/background/A Walk In The Park.mp3",
    tag: "Acoustic Cozy",
  },
  {
    id: "zelda",
    title: "Cukies Zelda",
    file: "assets/sounds/background/Cukies Zelda.mp3",
    tag: "Whimsical Fantasy",
  },
  {
    id: "harp",
    title: "Harp In The Park",
    file: "assets/sounds/background/Harp In The Park Harp and Birds.mp3",
    tag: "Gentle Harp & Birds",
  },
  {
    id: "beat",
    title: "Beat Homework",
    file: "assets/sounds/background/Beat Homework.mp3",
    tag: "Cozy Lofi Beat",
  },
  {
    id: "calm",
    title: "Calm",
    file: "assets/sounds/background/Calm.mp3",
    tag: "Ambient Peace",
  },
  {
    id: "moonlight",
    title: "Moonlight Hush",
    file: "assets/sounds/background/Moonlight Hush.mp3",
    tag: "Nocturne Serenity",
  },
];

var currentBgmIndex = 0;
var bgmAudio = null;
var isBgmMuted = false;
var bgmVolume = 0.45;
var isBgmSeeking = false;
var isBgmStarted = false;

function initBgmPlayer() {
  if (bgmAudio) return;
  loadBgmTrack(currentBgmIndex, false);
}

function loadBgmTrack(index, autoplay = true) {
  if (index < 0 || index >= bgmPlaylist.length) index = 0;
  currentBgmIndex = index;
  const track = bgmPlaylist[index];

  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.preload = "auto";

    // Saat lagu selesai, putar lagu berikutnya secara berurutan (Sequential Looping)
    bgmAudio.addEventListener("ended", () => {
      playNextBgmTrack();
    });

    // Update progress slider & current time
    bgmAudio.addEventListener("timeupdate", () => {
      if (!isBgmSeeking) {
        updateBgmProgressUI();
      }
    });

    // Loaded metadata -> set total duration
    bgmAudio.addEventListener("loadedmetadata", () => {
      updateBgmDurationUI();
    });

    bgmAudio.addEventListener("play", () => {
      updateSoundIconUI(true);
    });

    bgmAudio.addEventListener("pause", () => {
      updateSoundIconUI(false);
    });
  }

  bgmAudio.src = track.file;
  bgmAudio.volume = isBgmMuted ? 0 : bgmVolume;

  updateBgmTrackInfoUI();
  renderBgmTracklist();

  if (autoplay && !isBgmMuted) {
    const p = bgmAudio.play();
    if (p !== undefined) {
      p.then(() => {
        isBgmStarted = true;
        updateSoundIconUI(true);
      }).catch(() => {
        // Autoplay policy prevented playback until user interaction
      });
    }
  }
}

function playNextBgmTrack() {
  currentBgmIndex = (currentBgmIndex + 1) % bgmPlaylist.length;
  loadBgmTrack(currentBgmIndex, true);
}

function playPreviousBgmTrack() {
  currentBgmIndex =
    (currentBgmIndex - 1 + bgmPlaylist.length) % bgmPlaylist.length;
  loadBgmTrack(currentBgmIndex, true);
}

function selectBgmTrack(index) {
  loadBgmTrack(index, true);
  if (isBgmMuted) {
    toggleMusicMute(); // Otomatis unmute jika pemain memilih lagu
  }
}

function toggleMusicMute() {
  initBgmPlayer();
  isBgmMuted = !isBgmMuted;

  if (bgmAudio) {
    bgmAudio.volume = isBgmMuted ? 0 : bgmVolume;
    if (!isBgmMuted && (bgmAudio.paused || !isBgmStarted)) {
      const p = bgmAudio.play();
      if (p !== undefined) {
        p.then(() => {
          isBgmStarted = true;
        }).catch(() => {});
      }
    }
  }

  updateMuteUI();
}

function setBgmVolume(val) {
  initBgmPlayer();
  bgmVolume = Math.max(0, Math.min(1, parseFloat(val)));

  if (bgmVolume > 0 && isBgmMuted) {
    isBgmMuted = false;
  } else if (bgmVolume === 0) {
    isBgmMuted = true;
  }

  if (bgmAudio) {
    bgmAudio.volume = isBgmMuted ? 0 : bgmVolume;
    if (!isBgmMuted && bgmAudio.paused && !isBgmStarted) {
      bgmAudio
        .play()
        .then(() => {
          isBgmStarted = true;
        })
        .catch(() => {});
    }
  }

  updateMuteUI();
  const valText = document.getElementById("bgmVolumeValText");
  if (valText) {
    valText.textContent = `${Math.round(bgmVolume * 100)}%`;
  }
}

function seekBgm(percent) {
  if (!bgmAudio || !bgmAudio.duration) return;
  const targetTime = (parseFloat(percent) / 100) * bgmAudio.duration;
  bgmAudio.currentTime = targetTime;
  updateBgmProgressUI();
}

function formatAudioTime(seconds) {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updateBgmProgressUI() {
  if (!bgmAudio) return;
  const curTime = bgmAudio.currentTime || 0;
  const dur = bgmAudio.duration || 0;

  const curText = document.getElementById("bgmCurrentTimeText");
  if (curText) curText.textContent = formatAudioTime(curTime);

  const slider = document.getElementById("bgmSeekSlider");
  if (slider && dur > 0) {
    slider.value = ((curTime / dur) * 100).toFixed(1);
  }
}

function updateBgmDurationUI() {
  if (!bgmAudio) return;
  const durText = document.getElementById("bgmTotalTimeText");
  if (durText) durText.textContent = formatAudioTime(bgmAudio.duration || 0);
}

function updateBgmTrackInfoUI() {
  const track = bgmPlaylist[currentBgmIndex];
  if (!track) return;

  const headerLabel = document.getElementById("soundCurrentTrackLabel");
  if (headerLabel) headerLabel.textContent = track.title;

  const dropdownTitle = document.getElementById("bgmTrackTitlePlaying");
  if (dropdownTitle) dropdownTitle.textContent = track.title;
}

function updateMuteUI() {
  const muteIcon = document.getElementById("muteStatusIcon");
  const muteText = document.getElementById("muteStatusText");
  const muteBtn = document.getElementById("muteToggleBtn");
  const volSlider = document.getElementById("bgmVolumeSlider");
  const volText = document.getElementById("bgmVolumeValText");

  if (isBgmMuted) {
    if (muteIcon)
      muteIcon.innerHTML =
        '<svg class="w-3.5 h-3.5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>';
    if (muteText) muteText.textContent = "Mute";
    if (muteBtn) {
      muteBtn.classList.remove(
        "bg-white",
        "text-[#2B5B35]",
        "border-[#b5cca3]",
      );
      muteBtn.classList.add("bg-rose-50", "text-rose-700", "border-rose-300");
    }
    if (volText) volText.textContent = "0%";
    if (volSlider) volSlider.value = 0;
  } else {
    if (muteIcon)
      muteIcon.innerHTML =
        '<svg class="w-3.5 h-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    if (muteText) muteText.textContent = "Aktif";
    if (muteBtn) {
      muteBtn.classList.add("bg-white", "text-[#2B5B35]", "border-[#b5cca3]");
      muteBtn.classList.remove(
        "bg-rose-50",
        "text-rose-700",
        "border-rose-300",
      );
    }
    if (volText) volText.textContent = `${Math.round(bgmVolume * 100)}%`;
    if (volSlider) volSlider.value = Math.round(bgmVolume * 100);
  }

  updateSoundIconUI(bgmAudio && !bgmAudio.paused && !isBgmMuted);
}

function updateSoundIconUI(isPlaying) {
  const playingIcon = document.getElementById("soundIconPlaying");
  const mutedIcon = document.getElementById("soundIconMuted");
  if (!playingIcon || !mutedIcon) return;

  if (isBgmMuted || !isPlaying) {
    playingIcon.classList.add("hidden");
    mutedIcon.classList.remove("hidden");
  } else {
    playingIcon.classList.remove("hidden");
    mutedIcon.classList.add("hidden");
  }
}

function renderBgmTracklist() {
  const container = document.getElementById("bgmTracklistContainer");
  if (!container) return;

  container.innerHTML = bgmPlaylist
    .map((track, idx) => {
      const isCurrent = idx === currentBgmIndex;
      return `
            <button onclick="selectBgmTrack(${idx})" class="w-full flex items-center justify-between px-2 py-1 rounded-xl text-left transition active:scale-98 ${isCurrent ? "bg-[#2B5B35] text-white shadow-xs font-bold" : "bg-white hover:bg-[#eef5e6] text-[#2B5B35] border border-[#d2e0cb]"}">
                <div class="flex items-center gap-1.5 truncate pr-1.5 min-w-0">
                    <span class="text-[11px] shrink-0">${isCurrent ? (isBgmMuted ? "⏸️" : "▶️") : "🎵"}</span>
                    <div class="truncate">
                        <div class="text-[11px] font-hand truncate leading-tight">${track.title}</div>
                        <div class="text-[9px] ${isCurrent ? "text-emerald-100 font-normal" : "text-gray-400"} truncate leading-none">${track.tag}</div>
                    </div>
                </div>
                ${isCurrent ? '<span class="text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-full bg-white/20 text-white shrink-0">Putar</span>' : '<span class="text-[9px] text-gray-400 shrink-0">#' + (idx + 1) + "</span>"}
            </button>
        `;
    })
    .join("");
}

function toggleSoundDropdown(e) {
  if (e) {
    e.stopPropagation();
    if (typeof playClickSound === "function") playClickSound();
  }
  const dropdown = document.getElementById("soundDropdown");
  if (!dropdown) return;

  const isHidden = dropdown.classList.contains("hidden");
  if (isHidden) {
    initBgmPlayer();
    // Coba putar jika belum mulai saat pemain mengklik tombol suara
    if (bgmAudio && bgmAudio.paused && !isBgmMuted) {
      bgmAudio
        .play()
        .then(() => {
          isBgmStarted = true;
        })
        .catch(() => {});
    }
    dropdown.classList.remove("hidden");
    dropdown.classList.add("block");
    renderBgmTracklist();
    updateBgmTrackInfoUI();
    updateMuteUI();
    updateBgmProgressUI();
    updateBgmDurationUI();
  } else {
    closeSoundDropdown();
  }
}

function closeSoundDropdown() {
  const dropdown = document.getElementById("soundDropdown");
  if (dropdown) {
    dropdown.classList.add("hidden");
    dropdown.classList.remove("block");
  }
}

// Screen Wake Lock API to prevent device from sleeping while garden tab is open
var screenWakeLockSentinel = null;

async function requestScreenWakeLock() {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
  try {
    if (document.visibilityState === "visible" && !screenWakeLockSentinel) {
      screenWakeLockSentinel = await navigator.wakeLock.request("screen");
      screenWakeLockSentinel.addEventListener("release", () => {
        screenWakeLockSentinel = null;
      });
    }
  } catch (err) {
    // Battery saver or system policy may reject wake lock silently
  }
}
window.requestScreenWakeLock = requestScreenWakeLock;

// Menutup dropdown sound saat mengklik area di luar sound widget
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const container = document.getElementById("soundWidgetContainer");
    if (container && !container.contains(e.target)) {
      closeSoundDropdown();
    }
  });

  // Mulai memutar musik saat interaksi pertama pemain (pointerdown) jika belum berjalan
  const startBgmOnFirstGesture = () => {
    initBgmPlayer();
    if (bgmAudio && bgmAudio.paused && !isBgmMuted) {
      bgmAudio
        .play()
        .then(() => {
          isBgmStarted = true;
          updateSoundIconUI(true);
        })
        .catch(() => {});
    }
    requestScreenWakeLock();
    document.removeEventListener("pointerdown", startBgmOnFirstGesture);
  };
  document.addEventListener("pointerdown", startBgmOnFirstGesture);

  // Mute / Pause musik saat tab disembunyikan atau browser diminimalkan / ditutup
  var wasBgmPlayingBeforeHidden = false;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // 1. Tab disembunyikan / pindah tab / aplikasi di-minimize: matikan/pause audio
      if (bgmAudio && !bgmAudio.paused && isBgmStarted && !isBgmMuted) {
        wasBgmPlayingBeforeHidden = true;
        try {
          bgmAudio.pause();
        } catch (e) {}
        updateSoundIconUI(false);
      } else {
        wasBgmPlayingBeforeHidden = false;
      }
      // Lepas wake lock saat tab disembunyikan agar baterai hemat
      if (screenWakeLockSentinel) {
        try {
          screenWakeLockSentinel.release();
        } catch (e) {}
        screenWakeLockSentinel = null;
      }
    } else if (document.visibilityState === "visible") {
      // 2. Tab dibuka kembali: lanjutkan lagu jika sebelumnya sedang berputar
      if (wasBgmPlayingBeforeHidden && bgmAudio && !isBgmMuted) {
        try {
          const p = bgmAudio.play();
          if (p !== undefined) {
            p.then(() => {
              isBgmStarted = true;
              updateSoundIconUI(true);
            }).catch(() => {});
          }
        } catch (e) {}
      }
      // 3. Minta kembali Wake Lock agar perangkat tidak tidur/mati selama tab ini terbuka
      requestScreenWakeLock();
    }
  });

  // Pastikan lagu dimatikan saat halaman/tab ditutup (close tab / browser exit)
  window.addEventListener("pagehide", () => {
    if (bgmAudio) {
      try {
        bgmAudio.pause();
      } catch (e) {}
    }
    if (screenWakeLockSentinel) {
      try {
        screenWakeLockSentinel.release();
      } catch (e) {}
    }
  });

  window.addEventListener("beforeunload", () => {
    if (bgmAudio) {
      try {
        bgmAudio.pause();
      } catch (e) {}
    }
  });

  if (document.readyState === "complete" || document.readyState === "interactive") {
    requestScreenWakeLock();
  } else {
    document.addEventListener("DOMContentLoaded", requestScreenWakeLock);
  }
}

// Preloaded Audio Pool for UI Clicks (Instant response, zero lag)
var clickAudioPool = [];
var clickPoolIndex = 0;
var CLICK_POOL_SIZE = 6;

function initClickAudioPool() {
  if (clickAudioPool.length > 0) return;
  for (let i = 0; i < CLICK_POOL_SIZE; i++) {
    const aud = new Audio(clickSoundFile);
    aud.preload = "auto";
    aud.volume = 0.65;
    clickAudioPool.push(aud);
  }
}
initClickAudioPool();
window.clickAudioPool = clickAudioPool;

/**
 * Memainkan suara klik instan dari assets/sounds/click/click.mp3
 * dengan kompensasi delay awal 0.12s agar respon klik seketika (zero latency).
 */
function playClickSound() {
  initAudio();
  initClickAudioPool();
  try {
    const aud = clickAudioPool[clickPoolIndex];
    clickPoolIndex = (clickPoolIndex + 1) % CLICK_POOL_SIZE;
    // Skip leading 0.12s silence for ultra-crisp responsive tactile click
    aud.currentTime = 0.12;
    aud.volume = 0.65;
    const p = aud.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
  } catch (e) {}
}

// Global listener: mainkan suara klik setiap kali menekan tools atau button apapun
if (typeof document !== "undefined") {
  document.addEventListener(
    "pointerdown",
    (e) => {
      const target = e.target;
      if (!target) return;
      // Periksa apakah yang diklik adalah tombol, alat dock, tab, kartu, atau slider
      const clickable = target.closest(
        'button, .tool-btn, .launcher-btn, .plant-btn, .color-dot, input[type="range"], [role="button"]',
      );
      if (clickable) {
        playClickSound();
      }
    },
    true,
  );
}

// Cache Audio elements for instant, low-latency playback
var audioPool = {};

function playRandomAudioFile(files, fallbackFn, volume = 0.8) {
  if (!files || files.length === 0) {
    if (typeof fallbackFn === "function") fallbackFn();
    return;
  }
  const path = files[Math.floor(Math.random() * files.length)];
  try {
    const audio = new Audio(path);
    audio.volume = Math.max(0, Math.min(1, volume));
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // If audio file playback is blocked or fails, use Web Audio synthetic fallback
        if (typeof fallbackFn === "function") fallbackFn();
      });
    }
  } catch (e) {
    if (typeof fallbackFn === "function") fallbackFn();
  }
}

function initAudio() {
  if (audioInitialized || typeof Tone === "undefined") return;
  try {
    Tone.start();
    pluckSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.015, decay: 0.2, sustain: 0.05, release: 0.4 },
    }).toDestination();
    pluckSynth.volume.value = -14;

    waterSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.15 },
    }).toDestination();
    waterSynth.volume.value = -16;

    audioInitialized = true;
  } catch (e) {
    // Silent fallback if audio blocked
  }
}

function getAudioCtx() {
  initAudio();
  if (typeof Tone !== "undefined" && Tone.context && Tone.context.rawContext) {
    const c = Tone.context.rawContext;
    if (c.state === "suspended") c.resume();
    return c;
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (AudioCtx) {
    if (!window._gardenAudioCtx) {
      window._gardenAudioCtx = new AudioCtx();
    }
    if (window._gardenAudioCtx.state === "suspended") {
      window._gardenAudioCtx.resume();
    }
    return window._gardenAudioCtx;
  }
  return null;
}

/**
 * Suara Kucing: Menggunakan audio asli dari assets/sounds/cat (random), fallback ke synth
 */
function playCatMeowSound() {
  playRandomAudioFile(catSoundFiles, playCatMeowSynth, 0.85);
}

function playCatMeowSynth() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(880, now);
    filter.frequency.exponentialRampToValueAtTime(1180, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(720, now + 0.42);
    filter.Q.setValueAtTime(3.2, now);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.44);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  } catch (e) {}
}

/**
 * Suara Anjing: Menggunakan audio asli dari assets/sounds/dog (random), fallback ke synth
 */
function playDogBarkSound() {
  playRandomAudioFile(dogSoundFiles, playDogBarkSynth, 0.85);
}

function playDogBarkSynth() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(115, now + 0.14);

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.13);

    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(210, now);
    osc2.frequency.exponentialRampToValueAtTime(75, now + 0.13);

    gain2.gain.setValueAtTime(0.01, now);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.025);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.15);
  } catch (e) {}
}

/**
 * Suara Kelinci: "Pip / Chuu~" cicitan lembut tinggi nan menggemaskan
 */
function playRabbitSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1150, now);
    osc.frequency.linearRampToValueAtTime(1750, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {}
}

/**
 * Suara Kupu-Kupu: Kepakan sayap lembut dan gemerincing magis
 */
function playButterflySound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Gentle fluttering chime (soft high sine wave harp notes)
    const notes = [1318.51, 1567.98, 1760.0, 2093.0]; // E6, G6, A6, C7
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.26);
    });
  } catch (e) {}
}

/**
 * Suara Ikan: Kecipak air lembut & gelembung akuatik "Bloop~ Bloop~"
 */
function playFishSound() {
  playFishSynth();
}

function playFishSynth() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    // Aquatic water "bloop / bubble pop"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1350, now + 0.12);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Suara Menanam / Memindahkan Tanaman: Menggunakan audio asli dari assets/sounds/planting (random), fallback ke synth
 */
function playPlantSound() {
  playRandomAudioFile(plantingSoundFiles, playPlantSynth, 0.9);
}

function playPlantSynth() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = "sine";
    thudOsc.frequency.setValueAtTime(175, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    thudGain.gain.setValueAtTime(0.01, now);
    thudGain.gain.linearRampToValueAtTime(0.32, now + 0.015);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.12);

    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = "triangle";
    chimeOsc.frequency.setValueAtTime(587.33, now + 0.02);
    chimeOsc.frequency.setValueAtTime(880.0, now + 0.07);

    chimeGain.gain.setValueAtTime(0.001, now + 0.02);
    chimeGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(now + 0.02);
    chimeOsc.stop(now + 0.24);
  } catch (e) {
    if (typeof pluckSynth !== "undefined" && pluckSynth) {
      try {
        pluckSynth.triggerAttackRelease("C5", "16n");
      } catch (err) {}
    }
  }
}

/**
 * Suara Hujan Alami dari assets/sounds/rain/raining.mp3
 * dengan durasi yang bisa diatur serta fade in & fade out yang halus.
 */
function playRainSound(durationSec = 8.0) {
  try {
    if (!rainAudio) {
      rainAudio = new Audio(rainSoundFile);
    }
    clearTimeout(rainAudio._fadeTimer);
    clearInterval(rainAudio._fadeInterval);

    rainAudio.currentTime = 0;
    rainAudio.volume = 0.85;
    const p = rainAudio.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.log("Audio autoplay prevented or blocked", err);
      });
    }

    // Schedule smooth fade-out towards the end of the shower
    const fadeStartTime = Math.max(1000, (durationSec - 1.8) * 1000);
    rainAudio._fadeTimer = setTimeout(() => {
      if (!rainAudio || rainAudio.paused) return;
      let currentVol = rainAudio.volume;
      rainAudio._fadeInterval = setInterval(() => {
        currentVol = Math.max(0, currentVol - 0.05);
        if (rainAudio) rainAudio.volume = currentVol;
        if (currentVol <= 0.01) {
          clearInterval(rainAudio._fadeInterval);
          if (rainAudio) {
            rainAudio.pause();
            rainAudio.currentTime = 0;
            rainAudio.volume = 0.85;
          }
        }
      }, 60);
    }, fadeStartTime);
  } catch (e) {
    console.warn("Error playing rain audio:", e);
  }
}

function stopRainSound() {
  if (rainAudio) {
    clearTimeout(rainAudio._fadeTimer);
    clearInterval(rainAudio._fadeInterval);
    try {
      rainAudio.pause();
      rainAudio.currentTime = 0;
      rainAudio.volume = 0.85;
    } catch (e) {}
  }
}

/**
 * Suara Menyiram Alami dari assets/sounds/watering/watering.mp3
 * dimainkan saat pemain menyiram kebun dengan alat penyiram (water can).
 * Dimulai langsung pada detik ke-0.82 untuk memangkas jeda hening file asli,
 * sehingga suara gemericik air terdengar seketika saat ditekan!
 */
function startWateringSound() {
  try {
    if (!wateringAudio) {
      wateringAudio = new Audio(wateringSoundFile);
      wateringAudio.preload = "auto";
    }

    // If paused, not started, or near the end, restart immediately at audible point (0.82s)
    if (
      wateringAudio.paused ||
      wateringAudio.ended ||
      wateringAudio.currentTime > 7.0
    ) {
      wateringAudio.currentTime = 0.82;
      wateringAudio.volume = 0.85;
      const p = wateringAudio.play();
      if (p !== undefined) {
        p.catch((e) => {
          playWaterSynth();
        });
      }
    }

    clearTimeout(wateringStopTimer);
    // If no new watering action occurs in 380ms, smoothly stop
    wateringStopTimer = setTimeout(() => {
      stopWateringSound();
    }, 380);
  } catch (e) {
    playWaterSynth();
  }
}

function stopWateringSound() {
  clearTimeout(wateringStopTimer);
  if (wateringAudio && !wateringAudio.paused) {
    try {
      let vol = wateringAudio.volume;
      const fadeInt = setInterval(() => {
        vol = Math.max(0, vol - 0.2);
        if (wateringAudio) wateringAudio.volume = vol;
        if (vol <= 0.05) {
          clearInterval(fadeInt);
          if (wateringAudio) {
            wateringAudio.pause();
            wateringAudio.currentTime = 0.82;
            wateringAudio.volume = 0.85;
          }
        }
      }, 30);
    } catch (e) {
      try {
        wateringAudio.pause();
        wateringAudio.currentTime = 0.82;
      } catch (err) {}
    }
  }
}

function playWaterSynth() {
  initAudio();
  if (!audioInitialized) return;
  try {
    const notes = ["D5", "F#5", "A5", "B5", "D6", "E6"];
    const note = notes[Math.floor(Math.random() * notes.length)];
    waterSynth.triggerAttackRelease(note, "32n");
  } catch (e) {}
}

function playWaterSound() {
  startWateringSound();
}

function playErrorSound() {
  try {
    if (!audioInitialized || typeof Tone === "undefined") return;
    const synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.0, release: 0.1 },
    }).toDestination();
    synth.volume.value = -12;
    synth.triggerAttackRelease("D3", "16n");
  } catch (e) {}
}

function playChimeSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.36);
    });
  } catch (e) {}
}

function playThunderSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 2.5);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(65, now + 2.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 2.5);
  } catch (e) {}
}

var currentAudioAtmosphere = { isNight: false, weather: "clear", season: "spring" };

function adaptAudioAtmosphere(isNight, weather, season) {
  currentAudioAtmosphere = { isNight: !!isNight, weather: weather || "clear", season: season || "spring" };
  if (weather === "rain" || weather === "thunderstorm" || weather === "drizzle") {
    if (!rainAudio || rainAudio.paused) {
      playRainSound(12.0);
    }
  }
}

// Global function bindings on window
window.initAudio = initAudio;
window.playCatMeowSound = playCatMeowSound;
window.playDogBarkSound = playDogBarkSound;
window.playRabbitSound = playRabbitSound;
window.playButterflySound = playButterflySound;
window.playFishSound = playFishSound;
window.playPlantSound = playPlantSound;
window.playWaterSound = playWaterSound;
window.playWaterSynth = playWaterSynth;
window.playClickSound = playClickSound;
window.startWateringSound = startWateringSound;
window.stopWateringSound = stopWateringSound;
window.playRainSound = playRainSound;
window.stopRainSound = stopRainSound;
window.playErrorSound = playErrorSound;
window.playChimeSound = playChimeSound;
window.playThunderSound = playThunderSound;
window.adaptAudioAtmosphere = adaptAudioAtmosphere;
window.initBgmPlayer = initBgmPlayer;
window.loadBgmTrack = loadBgmTrack;
window.playNextBgmTrack = playNextBgmTrack;
window.playPreviousBgmTrack = playPreviousBgmTrack;
window.selectBgmTrack = selectBgmTrack;
window.toggleMusicMute = toggleMusicMute;
window.setBgmVolume = setBgmVolume;
window.seekBgm = seekBgm;
window.toggleSoundDropdown = toggleSoundDropdown;
window.closeSoundDropdown = closeSoundDropdown;
