/********************************************************************
 * FELLA'S GARDEN - APPLICATION ENTRY POINT & BOOTSTRAP (js/app.js)
 ********************************************************************/

var isAppBootstrapped = false;

/********************************************************************
 * SPLASH SCREEN CONTROLLER WITH DRAMATIC COZY FADE IN & FADE OUT
 ********************************************************************/
var isSplashDismissed = false;

function dismissSplashScreen() {
    if (isSplashDismissed) return;
    isSplashDismissed = true;
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    // Pause video to conserve memory/GPU
    const splashVid = document.getElementById('splashLogoVideo');
    if (splashVid) {
        try { splashVid.pause(); } catch (e) {}
    }

    splash.classList.add('splash-fade-out');
    setTimeout(() => {
        splash.style.display = 'none';
        if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
        }
    }, 900);
}
window.dismissSplashScreen = dismissSplashScreen;

function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    // Trigger video playback immediately if present
    const splashVid = document.getElementById('splashLogoVideo');
    if (splashVid) {
        splashVid.muted = true;
        const playPromise = splashVid.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay policy or fallback to poster/img
            });
        }
    }

    // Allow user to click or touch anywhere to dismiss early
    splash.addEventListener('click', dismissSplashScreen);
    splash.addEventListener('touchstart', dismissSplashScreen, { passive: true });

    // Allow pressing any key to dismiss
    window.addEventListener('keydown', () => {
        dismissSplashScreen();
    }, { once: true });

    // Minimum display duration for a cozy, dramatic presentation (1.8 seconds)
    const splashStartTime = Date.now();
    const minSplashDuration = 1800;

    const splashCheckInterval = setInterval(() => {
        const elapsed = Date.now() - splashStartTime;
        const worldReady = (typeof isWorldReady !== 'undefined') ? isWorldReady : true;
        if (elapsed >= minSplashDuration && worldReady) {
            clearInterval(splashCheckInterval);
            dismissSplashScreen();
        }
    }, 100);

    // Safety timeout: dismiss after 4.2s under all circumstances
    setTimeout(() => {
        clearInterval(splashCheckInterval);
        dismissSplashScreen();
    }, 4200);
}

// Start splash screen timing as early as DOM is available
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplashScreen);
    } else {
        initSplashScreen();
    }
}

async function bootstrapApp() {
    if (isAppBootstrapped) return;
    isAppBootstrapped = true;

    // Ensure splash screen is running
    initSplashScreen();

    // 1. Initialize canvas contexts & viewport dimensions
    if (typeof initCanvases === 'function') {
        initCanvases();
    }
    isInitialSetupComplete = true;

    // 2. Clear initial drawing pad in studio
    if (typeof clearFlowerPad === 'function') {
        clearFlowerPad();
    }

    // 3. Initialize flower gallery storage
    if (typeof initGallery === 'function') {
        initGallery();
    }

    // 4. Initialize multi-world database & load active world
    if (typeof initWorldManager === 'function') {
        await initWorldManager();
    }

    // 5. Start smooth 60fps garden animation & simulation loop
    if (typeof animateGarden === 'function') {
        requestAnimationFrame(animateGarden);
    }

    // 6. Initialize background music player
    if (typeof initBgmPlayer === 'function') {
        initBgmPlayer();
    }

    // 7. Initialize achievements, journal, seasons & dynamic weather
    if (typeof loadAchievementsFromStorage === 'function') {
        loadAchievementsFromStorage();
    }
    if (typeof syncAchievementsFromWorld === 'function') {
        syncAchievementsFromWorld();
    }
    if (typeof loadJournalFromStorage === 'function') {
        loadJournalFromStorage();
    }
    if (typeof setSeason === 'function') {
        const initialSeason = typeof currentSeason !== 'undefined' && currentSeason ? currentSeason : 'spring';
        setSeason(initialSeason, true);
    }
    if (typeof setDynamicWeather === 'function') {
        const initialWeather = typeof dynamicWeather !== 'undefined' && dynamicWeather ? dynamicWeather : 'clear';
        setDynamicWeather(initialWeather, null, false);
    }
    if (typeof updateSidebarScrollIndicators === 'function') {
        updateSidebarScrollIndicators();
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', bootstrapApp);
        window.addEventListener('load', bootstrapApp);
    } else {
        bootstrapApp();
    }
}
