/********************************************************************
 * FELLA'S GARDEN - UNIFIED GALLERY SYSTEM (js/gallery.js)
 * Manages Favorite Flowers & Favorite Animals with Tab Navigation,
 * Re-planting, Animal Summoning, Storage & Renaming.
 ********************************************************************/

let galleryFlowers = [];
let galleryAnimals = [];
let currentGalleryTab = 'flowers'; // 'flowers' | 'animals'
const FLOWER_STORAGE_KEY = 'fellas_garden_flower_gallery_v1';
const ANIMAL_STORAGE_KEY = 'fellas_garden_animal_gallery_v1';
let pendingSaveSprite = null;

function saveGalleryFlowersToStorage() {
    try {
        localStorage.setItem(FLOWER_STORAGE_KEY, JSON.stringify(galleryFlowers));
    } catch (e) {
        console.warn('LocalStorage save error (flowers):', e);
    }
}

function saveGalleryAnimalsToStorage() {
    try {
        localStorage.setItem(ANIMAL_STORAGE_KEY, JSON.stringify(galleryAnimals));
    } catch (e) {
        console.warn('LocalStorage save error (animals):', e);
    }
}

function initGallery() {
    // 1. Initialize Flowers
    try {
        const rawF = localStorage.getItem(FLOWER_STORAGE_KEY);
        if (rawF) galleryFlowers = JSON.parse(rawF);
    } catch (e) {
        galleryFlowers = [];
    }

    // Default cute starter showcase flowers if first visit
    if (!galleryFlowers || galleryFlowers.length === 0) {
        galleryFlowers = [
            {
                id: 'starter_gal_tulip',
                name: 'Tulip Matahari',
                dataUrl: (typeof makeProceduralFlowerSprite === 'function') 
                    ? makeProceduralFlowerSprite({ type: 'tulip', petalColor: '#F29B4B', centerColor: '#F7CE68', innerDotColor: '#DF5645', stemColor: '#3A6A37', scale: 1.1 }).toDataURL('image/png')
                    : '',
                createdAt: 'Klasik Kebun'
            },
            {
                id: 'starter_gal_daisy',
                name: 'Daisy Pink Pastel',
                dataUrl: (typeof makeProceduralFlowerSprite === 'function')
                    ? makeProceduralFlowerSprite({ type: 'daisy', petalColor: '#EDA4BD', centerColor: '#DF5645', innerDotColor: '#F7CE68', stemColor: '#3A6A37', scale: 1.1 }).toDataURL('image/png')
                    : '',
                createdAt: 'Klasik Kebun'
            },
            {
                id: 'starter_gal_rosebud',
                name: 'Mawar Senja',
                dataUrl: (typeof makeProceduralFlowerSprite === 'function')
                    ? makeProceduralFlowerSprite({ type: 'rosebud', petalColor: '#DF5645', centerColor: '#F7CE68', innerDotColor: '#F29B4B', stemColor: '#3A6A37', scale: 1.15 }).toDataURL('image/png')
                    : '',
                createdAt: 'Klasik Kebun'
            }
        ];
        saveGalleryFlowersToStorage();
    }

    // 2. Initialize Animals
    try {
        const rawA = localStorage.getItem(ANIMAL_STORAGE_KEY);
        if (rawA) galleryAnimals = JSON.parse(rawA);
    } catch (e) {
        galleryAnimals = [];
    }

    // Default starter favorite animal companions
    if (!galleryAnimals || galleryAnimals.length === 0) {
        galleryAnimals = [
            {
                id: 'fav_anm_mimi',
                name: 'Mimi',
                type: 'cat',
                variant: 'ginger',
                sound: 'cat',
                createdAt: 'Sahabat Kebun'
            },
            {
                id: 'fav_anm_bobi',
                name: 'Bobi',
                type: 'dog',
                variant: 'golden',
                sound: 'dog',
                createdAt: 'Sahabat Kebun'
            },
            {
                id: 'fav_anm_bunbun',
                name: 'Bunbun',
                type: 'rabbit',
                variant: 'white',
                sound: 'rabbit',
                createdAt: 'Sahabat Kebun'
            },
            {
                id: 'fav_anm_kiki',
                name: 'Kiki',
                type: 'butterfly',
                variant: 'violet',
                sound: 'butterfly',
                createdAt: 'Sahabat Kebun'
            }
        ];
        saveGalleryAnimalsToStorage();
    }

    updateGalleryBadge();
}

function updateGalleryBadge() {
    const fCount = galleryFlowers.length;
    const aCount = galleryAnimals.length;
    const totalCount = fCount + aCount;

    // Badge in the sidebar button
    const badge = document.getElementById('galleryCountBadge');
    if (badge) badge.textContent = totalCount;

    // Badges on the modal tabs
    const fTabBadge = document.getElementById('galFlowersCount');
    if (fTabBadge) fTabBadge.textContent = fCount;
    const aTabBadge = document.getElementById('galAnimalsCount');
    if (aTabBadge) aTabBadge.textContent = aCount;

    // Modal subtitle pill
    const pill = document.getElementById('galleryCounterPill');
    if (pill) {
        pill.textContent = (currentGalleryTab === 'flowers') 
            ? `${fCount} Bunga` 
            : `${aCount} Hewan`;
    }
}

function openGalleryModal(initialTab = null) {
    const modal = document.getElementById('flowerGalleryModal') || document.getElementById('galleryModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        if (initialTab && (initialTab === 'flowers' || initialTab === 'animals')) {
            switchGalleryTab(initialTab);
        } else {
            renderGalleryGrid();
            updateGalleryBadge();
        }
    }
}

function closeGalleryModal() {
    const modal = document.getElementById('flowerGalleryModal') || document.getElementById('galleryModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function switchGalleryTab(tabName) {
    currentGalleryTab = tabName;

    const flowerTabBtn = document.getElementById('galTabFlowers');
    const animalTabBtn = document.getElementById('galTabAnimals');
    const searchInput = document.getElementById('gallerySearchInput');
    const tipText = document.getElementById('galleryTipText');
    const headerActionBtn = document.getElementById('galleryHeaderActionBtn');

    if (tabName === 'flowers') {
        if (flowerTabBtn) {
            flowerTabBtn.className = 'px-4 py-2 rounded-t-xl font-hand font-bold text-xs sm:text-sm flex items-center gap-2 transition bg-white text-[#2B5B35] border-t-2 border-x-2 border-[#2B5B35] shadow-xs active';
        }
        if (animalTabBtn) {
            animalTabBtn.className = 'px-4 py-2 rounded-t-xl font-hand font-bold text-xs sm:text-sm flex items-center gap-2 transition bg-[#e1ecd9] text-gray-600 hover:text-[#2B5B35] border-t-2 border-x-2 border-transparent';
        }
        if (searchInput) {
            searchInput.placeholder = 'Cari nama bunga...';
            searchInput.value = '';
        }
        if (tipText) {
            tipText.innerHTML = 'Tips: Klik <b>Tanam</b> untuk langsung menanam bunga ke kebun!';
        }
        if (headerActionBtn) {
            headerActionBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Gambar Bunga Baru</span>
            `;
            headerActionBtn.onclick = () => { closeGalleryModal(); openFlowerStudioModal(); };
        }
    } else {
        if (animalTabBtn) {
            animalTabBtn.className = 'px-4 py-2 rounded-t-xl font-hand font-bold text-xs sm:text-sm flex items-center gap-2 transition bg-white text-[#2B5B35] border-t-2 border-x-2 border-[#2B5B35] shadow-xs active';
        }
        if (flowerTabBtn) {
            flowerTabBtn.className = 'px-4 py-2 rounded-t-xl font-hand font-bold text-xs sm:text-sm flex items-center gap-2 transition bg-[#e1ecd9] text-gray-600 hover:text-[#2B5B35] border-t-2 border-x-2 border-transparent';
        }
        if (searchInput) {
            searchInput.placeholder = 'Cari nama sahabat hewan...';
            searchInput.value = '';
        }
        if (tipText) {
            tipText.innerHTML = 'Tips: Klik <b>Panggil</b> untuk menghadirkan hewan favorit ke kebun!';
        }
        if (headerActionBtn) {
            headerActionBtn.innerHTML = `
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Gambar Hewan Baru</span>
            `;
            headerActionBtn.onclick = () => { closeGalleryModal(); openAnimalStudioModal(); };
        }
    }

    updateGalleryBadge();
    renderGalleryGrid();
}

function renderGalleryGrid(filterQuery = '') {
    const container = document.getElementById('galleryGridContainer');
    if (!container) return;

    if (currentGalleryTab === 'flowers') {
        renderFlowersGrid(container, filterQuery);
    } else {
        renderAnimalsGrid(container, filterQuery);
    }
}

function renderFlowersGrid(container, filterQuery = '') {
    const q = filterQuery.toLowerCase().trim();
    const list = q ? galleryFlowers.filter(f => f.name.toLowerCase().includes(q)) : galleryFlowers;

    if (list.length === 0) {
        if (galleryFlowers.length === 0) {
            container.innerHTML = `
                <div class="py-12 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center mb-3 shadow-inner text-2xl">
                        🌸
                    </div>
                    <h4 class="font-hand font-bold text-xl text-[#2B5B35] mb-1">Galeri Bunga Masih Kosong</h4>
                    <p class="text-xs sm:text-sm text-[#477431] max-w-sm mb-4">Yuk gambar bunga cantik di Studio Gambar, lalu klik <b>Simpan ke Galeri</b> untuk mengoleksinya!</p>
                    <button onclick="closeGalleryModal(); openFlowerStudioModal();" class="px-5 py-2 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 2 6.5 5 8 1.5.8 3 .5 3-1 0-.8-.7-1.5-1-2.2-.4-.8-.5-1.8.2-2.5.8-.8 2-.8 3-.8h1c4.5 0 8-3.5 8-8 0-4.5-3.5-7.5-9.2-7.5z"/></svg>
                        <span>Buka Studio Gambar Bunga</span>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="py-12 flex flex-col items-center justify-center text-center">
                    <p class="font-hand font-bold text-lg text-gray-500">Tidak ada bunga dengan nama "${filterQuery}"</p>
                </div>
            `;
        }
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            ${list.map(item => `
                <div class="bg-white/95 rounded-2xl border-2 border-[#d7e2ce] hover:border-[#7DB852] p-2.5 sm:p-3 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition duration-200 group">
                    <!-- Preview Box -->
                    <div class="w-full aspect-square rounded-xl bg-gradient-to-b from-[#fbfdf9] to-[#edf4e8] border border-[#e3ecdc] flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-[1.02] transition">
                        <img src="${item.dataUrl}" class="max-w-[85%] max-h-[85%] object-contain drop-shadow-md" alt="${item.name}">
                        <span class="absolute top-1.5 left-2 text-[10px] text-[#477431]/75 font-mono">${item.createdAt || ''}</span>
                    </div>

                    <!-- Name with inline rename -->
                    <div class="w-full mt-2 text-center">
                        <div class="flex items-center justify-center gap-1 group/title">
                            <span class="font-hand font-bold text-base sm:text-lg text-[#2B5B35] truncate max-w-[130px]" title="${item.name}">
                                ${item.name}
                            </span>
                            <button onclick="renameFlowerInGallery('${item.id}')" title="Ubah Nama Bunga" class="opacity-0 group-hover/title:opacity-100 hover:text-[#2B5B35] text-gray-400 transition">
                                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="w-full mt-2.5 flex items-center gap-1.5">
                        <button onclick="plantFlowerFromGallery('${item.id}')" class="flex-1 py-1.5 px-2 rounded-xl bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 transition active:scale-95" title="Tanam Bunga Ini ke Kebun">
                            <svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-13"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z"/></svg>
                            <span>Tanam</span>
                        </button>
                        <button onclick="loadFlowerIntoStudio('${item.id}')" class="w-7 h-7 rounded-xl bg-[#eef5e6] hover:bg-[#dfeed0] text-[#2B5B35] flex items-center justify-center transition border border-[#c5d9b7]" title="Buka & Edit di Studio">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button onclick="deleteFlowerFromGallery('${item.id}')" class="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition border border-rose-200" title="Hapus dari Galeri">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAnimalsGrid(container, filterQuery = '') {
    const q = filterQuery.toLowerCase().trim();
    const list = q ? galleryAnimals.filter(a => a.name.toLowerCase().includes(q)) : galleryAnimals;

    if (list.length === 0) {
        if (galleryAnimals.length === 0) {
            container.innerHTML = `
                <div class="py-12 flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center mb-3 shadow-inner text-2xl">
                        🐾
                    </div>
                    <h4 class="font-hand font-bold text-xl text-[#2B5B35] mb-1">Belum Ada Hewan Favorit</h4>
                    <p class="text-xs sm:text-sm text-[#477431] max-w-sm mb-4">Kamu bisa memberi tanda ⭐ pada hewan yang sedang kamu perhatikan atau di menu Hewan untuk menyimpannya di sini!</p>
                    <div class="flex items-center gap-2">
                        <button onclick="closeGalleryModal(); openAnimalModal();" class="px-4 py-2 rounded-full bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-1.5">
                            <span>🐾 Buka Menu Hewan</span>
                        </button>
                        <button onclick="closeGalleryModal(); openAnimalStudioModal();" class="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-1.5">
                            <span>🎨 Gambar Hewan Sendiri</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="py-12 flex flex-col items-center justify-center text-center">
                    <p class="font-hand font-bold text-lg text-gray-500">Tidak ada hewan dengan nama "${filterQuery}"</p>
                </div>
            `;
        }
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            ${list.map(item => {
                let badgeText = 'Sahabat';
                let avatarEmoji = '🐾';
                let dotColor = '#2B5B35';

                if (item.type === 'custom') {
                    badgeText = 'Hewan Ciptaanmu';
                    avatarEmoji = '🎨';
                } else if (typeof animalVariants !== 'undefined' && animalVariants[item.type]) {
                    const vInfo = animalVariants[item.type].find(v => v.id === item.variant) || animalVariants[item.type][0];
                    badgeText = vInfo.fullName || vInfo.name;
                    avatarEmoji = vInfo.emoji;
                    dotColor = vInfo.dot || '#2B5B35';
                }

                return `
                    <div class="bg-white/95 rounded-2xl border-2 border-[#d7e2ce] hover:border-[#7DB852] p-2.5 sm:p-3 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition duration-200 group">
                        <!-- Preview Box -->
                        <div class="w-full aspect-square rounded-xl bg-gradient-to-b from-[#fbfdf9] to-[#edf4e8] border border-[#e3ecdc] flex flex-col items-center justify-center p-2 relative overflow-hidden group-hover:scale-[1.02] transition">
                            ${item.spriteDataUrl ? `
                                <img src="${item.spriteDataUrl}" class="max-w-[80%] max-h-[80%] object-contain drop-shadow-md" alt="${item.name}">
                            ` : `
                                <div class="w-16 h-16 rounded-full bg-white border-2 border-[#d2e0cb] shadow-sm flex items-center justify-center text-3xl relative">
                                    <span>${avatarEmoji}</span>
                                    <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-xs" style="background-color: ${dotColor};"></span>
                                </div>
                            `}
                            <span class="absolute top-1.5 left-2 text-[10px] text-[#477431]/75 font-mono">${item.createdAt || ''}</span>
                            <span class="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/90 border border-[#d2e0cb] text-[#2B5B35] font-bold">
                                ${badgeText}
                            </span>
                        </div>

                        <!-- Name with inline rename -->
                        <div class="w-full mt-2 text-center">
                            <div class="flex items-center justify-center gap-1 group/title">
                                <span class="font-hand font-bold text-base sm:text-lg text-[#2B5B35] truncate max-w-[130px]" title="${item.name}">
                                    ${item.name}
                                </span>
                                <button onclick="renameAnimalInGallery('${item.id}')" title="Ubah Nama Hewan" class="opacity-0 group-hover/title:opacity-100 hover:text-[#2B5B35] text-gray-400 transition">
                                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="w-full mt-2.5 flex items-center gap-1.5">
                            <button onclick="summonAnimalFromGallery('${item.id}')" class="flex-1 py-1.5 px-2 rounded-xl bg-[#2B5B35] hover:bg-[#1f4627] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 transition active:scale-95" title="Panggil Hewan Ini ke Kebun">
                                <svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                <span>Panggil</span>
                            </button>
                            <button onclick="deleteAnimalFromGallery('${item.id}')" class="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition border border-rose-200" title="Hapus dari Hewan Favorit">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Check if an animal is currently in the favorites gallery
function isAnimalFavorited(a) {
    if (!a) return false;
    return galleryAnimals.some(item => {
        if (item.id === a.id) return true;
        if (a.type === 'custom' && item.spriteDataUrl && item.spriteDataUrl === a.spriteDataUrl) return true;
        if (a.type !== 'custom' && item.type === a.type && item.variant === a.variant && item.name === a.name) return true;
        return false;
    });
}

// Toggle favorite status for an animal
function toggleFavoriteAnimal(a) {
    if (!a) return;
    const existingIndex = galleryAnimals.findIndex(item => {
        if (item.id === a.id) return true;
        if (a.type === 'custom' && item.spriteDataUrl && item.spriteDataUrl === a.spriteDataUrl) return true;
        if (a.type !== 'custom' && item.type === a.type && item.variant === a.variant && item.name === a.name) return true;
        return false;
    });

    if (existingIndex >= 0) {
        const removed = galleryAnimals.splice(existingIndex, 1)[0];
        saveGalleryAnimalsToStorage();
        updateGalleryBadge();
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`"${removed.name}" dihapus dari Hewan Favorit.`);
        }
    } else {
        const newEntry = {
            id: 'fav_anm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name: a.name || 'Sahabat',
            type: a.type || 'rabbit',
            variant: a.variant || 'default',
            sound: a.sound || 'chime',
            habitat: a.habitat || (a.type === 'fish' ? 'water' : (a.type === 'butterfly' ? 'flying' : 'land')),
            spriteDataUrl: a.spriteDataUrl || null,
            createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        };
        galleryAnimals.unshift(newEntry);
        saveGalleryAnimalsToStorage();
        updateGalleryBadge();
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`"${newEntry.name}" ditambahkan ke Hewan Favorit! ⭐`);
        }
        if (typeof playChimeSound === 'function') playChimeSound();
    }

    // Refresh UI elements that display favorite state
    if (typeof renderActiveAnimalsList === 'function') renderActiveAnimalsList();
    if (typeof updateFollowBanner === 'function') updateFollowBanner();
    if (!document.getElementById('flowerGalleryModal')?.classList.contains('hidden') || 
        !document.getElementById('galleryModal')?.classList.contains('hidden')) {
        renderGalleryGrid();
    }
}

function toggleFavoriteAnimalById(animalId) {
    // Look first in active world animals
    if (typeof animals !== 'undefined' && Array.isArray(animals)) {
        const active = animals.find(a => a.id === animalId);
        if (active) {
            toggleFavoriteAnimal(active);
            return;
        }
    }
    // Otherwise look in gallery animals
    const inGal = galleryAnimals.find(a => a.id === animalId);
    if (inGal) {
        toggleFavoriteAnimal(inGal);
    }
}

function toggleFavoriteFollowedAnimal() {
    if (typeof followedAnimal !== 'undefined' && followedAnimal) {
        toggleFavoriteAnimal(followedAnimal);
    }
}

function summonAnimalFromGallery(id) {
    const item = galleryAnimals.find(a => a.id === id);
    if (!item) return;

    let spawned = null;
    if (item.type === 'custom' && item.spriteDataUrl) {
        if (typeof spawnCustomAnimalInstance === 'function') {
            spawned = spawnCustomAnimalInstance({
                name: item.name,
                spriteDataUrl: item.spriteDataUrl,
                sound: item.sound || 'chime',
                habitat: item.habitat || 'land'
            });
        }
    } else if (typeof spawnAnimal === 'function') {
        spawned = spawnAnimal(item.type, item.name, item.variant);
    }

    closeGalleryModal();

    if (spawned && typeof startFollowingAnimal === 'function') {
        startFollowingAnimal(spawned);
    } else if (typeof showGardenNotice === 'function') {
        showGardenNotice(`"${item.name}" telah dipanggil ke kebun!`);
    }
}

async function renameAnimalInGallery(id) {
    const item = galleryAnimals.find(a => a.id === id);
    if (!item) return;
    let newName;
    if (typeof cutePrompt === 'function') {
        newName = await cutePrompt('Beri nama baru untuk hewan ini:', item.name, 'Ganti Nama Hewan', 'Nama hewan...', '🐾');
    } else {
        newName = prompt('Beri nama baru untuk hewan ini:', item.name);
    }
    if (newName && newName.trim()) {
        item.name = newName.trim();
        saveGalleryAnimalsToStorage();
        renderGalleryGrid();
        showGardenNotice(`Nama hewan favorit diubah menjadi "${item.name}"`);
    }
}

async function deleteAnimalFromGallery(id) {
    const item = galleryAnimals.find(a => a.id === id);
    if (!item) return;
    let confirmed = true;
    if (typeof cuteConfirm === 'function') {
        confirmed = await cuteConfirm(`Hapus "${item.name}" dari daftar Hewan Favorit?`, 'Hapus Hewan Favorit', true, 'Ya, Hapus', '🗑️');
    } else {
        confirmed = confirm(`Hapus "${item.name}" dari daftar Hewan Favorit?`);
    }
    if (confirmed) {
        galleryAnimals = galleryAnimals.filter(a => a.id !== id);
        saveGalleryAnimalsToStorage();
        updateGalleryBadge();
        renderGalleryGrid();
        if (typeof renderActiveAnimalsList === 'function') renderActiveAnimalsList();
        if (typeof updateFollowBanner === 'function') updateFollowBanner();
        showGardenNotice(`"${item.name}" telah dihapus dari Hewan Favorit.`);
    }
}

// Helper to convert base64 dataUrl into an offscreen canvas
function dataUrlToCanvas(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const cCtx = c.getContext('2d');
        cCtx.drawImage(img, 0, 0);
        callback(c);
    };
    img.src = dataUrl;
}

function plantFlowerFromGallery(id) {
    const item = galleryFlowers.find(f => f.id === id);
    if (!item) return;
    dataUrlToCanvas(item.dataUrl, (canvas) => {
        pendingFlowerSprite = canvas;
        closeGalleryModal();
        activatePlantingMode();
        showGardenNotice(`Bunga "${item.name}" siap ditanam!`);
    });
}

function loadFlowerIntoStudio(id) {
    const item = galleryFlowers.find(f => f.id === id);
    if (!item) return;
    const img = new Image();
    img.onload = () => {
        saveFlowerPadState();
        flowerPadCtx.clearRect(0, 0, flowerPadCanvas.width, flowerPadCanvas.height);
        const maxDim = flowerPadCanvas.width * 0.72;
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (flowerPadCanvas.width - w) / 2;
        const y = (flowerPadCanvas.height - h) / 2;
        flowerPadCtx.drawImage(img, x, y, w, h);
        updatePendingSpriteFromPad();
        updateDraftBadge();
        const hint = document.getElementById('drawBoxHint');
        if (hint) hint.style.opacity = '0';
        closeGalleryModal();
        openFlowerStudioModal();
        showGardenNotice(`Bunga "${item.name}" dimuat ke studio!`);
    };
    img.src = item.dataUrl;
}

async function renameFlowerInGallery(id) {
    const item = galleryFlowers.find(f => f.id === id);
    if (!item) return;
    let newName;
    if (typeof cutePrompt === 'function') {
        newName = await cutePrompt('Beri nama baru untuk bunga ini:', item.name, 'Ganti Nama Bunga', 'Nama bunga...', '🌸');
    } else {
        newName = prompt('Beri nama baru untuk bunga ini:', item.name);
    }
    if (newName && newName.trim()) {
        item.name = newName.trim();
        saveGalleryFlowersToStorage();
        renderGalleryGrid();
        showGardenNotice(`Nama bunga diubah menjadi "${item.name}"`);
    }
}

async function deleteFlowerFromGallery(id) {
    const item = galleryFlowers.find(f => f.id === id);
    if (!item) return;
    let confirmed = true;
    if (typeof cuteConfirm === 'function') {
        confirmed = await cuteConfirm(`Hapus bunga "${item.name}" dari galeri?`, 'Hapus Bunga', true, 'Ya, Hapus', '🗑️');
    } else {
        confirmed = confirm(`Hapus bunga "${item.name}" dari galeri?`);
    }
    if (confirmed) {
        galleryFlowers = galleryFlowers.filter(f => f.id !== id);
        saveGalleryFlowersToStorage();
        renderGalleryGrid();
        updateGalleryBadge();
        showGardenNotice(`Bunga "${item.name}" telah dihapus.`);
    }
}

// Save Dialog handlers
function promptSaveToGallery() {
    const trimmed = extractTrimmedFlowerCanvas();
    if (!trimmed) {
        showGardenNotice('Silakan gambar bungamu di kanvas terlebih dahulu!');
        playErrorSound();
        return;
    }
    pendingSaveSprite = trimmed;
    const previewImg = document.getElementById('savePreviewImg');
    if (previewImg) {
        previewImg.src = trimmed.toDataURL('image/png');
    }
    const nameInput = document.getElementById('flowerNameInput');
    if (nameInput) {
        nameInput.value = `Bunga Cantik #${galleryFlowers.length + 1}`;
    }
    document.getElementById('saveToGalleryModal').classList.remove('hidden');
    setTimeout(() => {
        if (nameInput) {
            nameInput.focus();
            nameInput.select();
        }
    }, 60);
}

function closeSaveToGalleryDialog() {
    const modal = document.getElementById('saveToGalleryModal');
    if (modal) modal.classList.add('hidden');
    pendingSaveSprite = null;
}

function confirmSaveToGallery() {
    if (!pendingSaveSprite) return;
    const nameInput = document.getElementById('flowerNameInput');
    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : `Bunga #${galleryFlowers.length + 1}`;

    const newEntry = {
        id: 'gal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: name,
        dataUrl: pendingSaveSprite.toDataURL('image/png'),
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        width: pendingSaveSprite.width,
        height: pendingSaveSprite.height
    };

    galleryFlowers.unshift(newEntry);
    saveGalleryFlowersToStorage();
    updateGalleryBadge();
    closeSaveToGalleryDialog();
    if (typeof incrementStat === 'function') {
        incrementStat('customCreations', 1);
    }
    showGardenNotice(`Bunga "${name}" berhasil disimpan ke Galeri!`);
    playPlantSound();
}

// Allow pressing Enter in flowerNameInput to save
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('flowerNameInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmSaveToGallery();
        });
    }
});

function activatePlantingMode() {
    const trimmed = extractTrimmedFlowerCanvas();
    if (!trimmed) {
        showGardenNotice('Gambar bungamu di studio terlebih dahulu!');
        playErrorSound();
        return;
    }
    pendingFlowerSprite = trimmed;
    currentTool = 'plant';
    updateToolbarUI();
    document.getElementById('plantingBanner').classList.remove('hidden');
    worldCanvas.style.cursor = 'copy';
}

function exitPlantingMode() {
    document.getElementById('plantingBanner').classList.add('hidden');
    setWorldTool('hand');
}

// Global function bindings on window for robust HTML access
window.initGallery = initGallery;
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;
window.switchGalleryTab = switchGalleryTab;
window.renderGalleryGrid = renderGalleryGrid;
window.renderFlowersGrid = renderFlowersGrid;
window.renderAnimalsGrid = renderAnimalsGrid;
window.isAnimalFavorited = isAnimalFavorited;
window.toggleFavoriteAnimal = toggleFavoriteAnimal;
window.toggleFavoriteAnimalById = toggleFavoriteAnimalById;
window.toggleFavoriteFollowedAnimal = toggleFavoriteFollowedAnimal;
window.summonAnimalFromGallery = summonAnimalFromGallery;
window.renameAnimalInGallery = renameAnimalInGallery;
window.deleteAnimalFromGallery = deleteAnimalFromGallery;
window.plantFlowerFromGallery = plantFlowerFromGallery;
window.loadFlowerIntoStudio = loadFlowerIntoStudio;
window.renameFlowerInGallery = renameFlowerInGallery;
window.deleteFlowerFromGallery = deleteFlowerFromGallery;
window.promptSaveToGallery = promptSaveToGallery;
window.closeSaveToGalleryDialog = closeSaveToGalleryDialog;
window.confirmSaveToGallery = confirmSaveToGallery;
window.activatePlantingMode = activatePlantingMode;
window.exitPlantingMode = exitPlantingMode;
window.updateGalleryBadge = updateGalleryBadge;
