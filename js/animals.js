/********************************************************************
 * FELLA'S GARDEN - ANIMAL COMPANIONS (js/animals.js)
 * Includes Cats, Dogs, Rabbits, Fluttering Butterflies,
 * with 3 Distinct Adorable Variants for each species,
 * and Custom Player-Drawn Animals!
 ********************************************************************/

var animalVariants = {
    cat: [
        { id: 'ginger', name: 'Oyen', fullName: 'Kucing Oyen', emoji: '🐱', dot: '#FBBF24', desc: 'Hangat, ceria & suka berjemur' },
        { id: 'black', name: 'Kuro', fullName: 'Kucing Kuro', emoji: '🐈‍⬛', dot: '#2D3142', desc: 'Misterius anggun bermata zamrud' },
        { id: 'calico', name: 'Calico', fullName: 'Kucing Calico', emoji: '🐾', dot: '#FFFFFF', desc: 'Belang tiga warna pembawa hoki' },
        { id: 'sakura', name: 'Sakura', fullName: 'Kucing Sakura Langka 🌸', emoji: '🌸', dot: '#F472B6', desc: 'Bulu merah muda lembut dengan aroma kelopak sakura (varian telur)' }
    ],
    dog: [
        { id: 'golden', name: 'Golden', fullName: 'Anjing Golden', emoji: '🐕', dot: '#E6933A', desc: 'Ramah, setia & ekor bergoyang' },
        { id: 'choco', name: 'Choco', fullName: 'Anjing Choco', emoji: '🐶', dot: '#78350F', desc: 'Manis seperti cokelat hangat' },
        { id: 'dalmatian', name: 'Bintik', fullName: 'Anjing Bintik', emoji: '🐾', dot: '#27272A', desc: 'Bintik hitam lucu & lincah' },
        { id: 'starry', name: 'Bintang', fullName: 'Anjing Bintang Emas ⭐', emoji: '⭐', dot: '#FBBF24', desc: 'Bulu emas lembut bertabur kilau bintang (varian telur)' }
    ],
    rabbit: [
        { id: 'white', name: 'Salju', fullName: 'Kelinci Salju', emoji: '🐰', dot: '#FFFFFF', desc: 'Bulu putih selembut kapas' },
        { id: 'caramel', name: 'Karamel', fullName: 'Kelinci Karamel', emoji: '🐇', dot: '#C27838', desc: 'Dutch bunny manis berkaus kaki' },
        { id: 'grey', name: 'Abu', fullName: 'Kelinci Abu', emoji: '🐰', dot: '#9CA3AF', desc: 'Abu-abu silver lembut & pemalu' },
        { id: 'sakura_rabbit', name: 'Momo', fullName: 'Kelinci Kelopak Bunga 🌸', emoji: '🐰', dot: '#FBCFE8', desc: 'Telinga merah muda manis pembawa keberuntungan (varian telur)' }
    ],
    butterfly: [
        { id: 'violet', name: 'Ungu', fullName: 'Kupu Ungu', emoji: '🦋', dot: '#A855F7', desc: 'Sayap magenta anggun memesona' },
        { id: 'blue', name: 'Biru', fullName: 'Kupu Biru', emoji: '🦋', dot: '#0284C7', desc: 'Biru langit berkilau lembut' },
        { id: 'golden', name: 'Emas', fullName: 'Kupu Emas', emoji: '🦋', dot: '#F59E0B', desc: 'Sayap kuning keemasan bercahaya' },
        { id: 'aurora', name: 'Aurora', fullName: 'Kupu-Kupu Aurora Langka ✨', emoji: '✨', dot: '#38BDF8', desc: 'Sayap berkilau gradasi pelangi aurora borealis (varian telur)' }
    ],
    fish: [
        { id: 'koi', name: 'Koi', fullName: 'Ikan Koi Kohaku', emoji: '🎏', dot: '#F97316', desc: 'Koi anggun dengan corak oranye & putih' },
        { id: 'goldfish', name: 'Koki', fullName: 'Ikan Mas Koki', emoji: '🐟', dot: '#EF4444', desc: 'Perut bulat lucu dengan ekor berkibar' },
        { id: 'betta', name: 'Cupang', fullName: 'Ikan Cupang Biru', emoji: '🐠', dot: '#3B82F6', desc: 'Sirip megah melambai biru safir & ungu' },
        { id: 'golden_dragon', name: 'Ryu', fullName: 'Ikan Mas Mahkota Emas 👑', emoji: '👑', dot: '#F59E0B', desc: 'Sisik keemasan menyala dengan sirip panjang gemulai (varian telur)' }
    ]
};

var selectedAnimalVariants = {
    cat: 'ginger',
    dog: 'golden',
    rabbit: 'white',
    butterfly: 'violet',
    fish: 'koi'
};

function selectAnimalVariant(species, variantId, btnEl) {
    selectedAnimalVariants[species] = variantId;
    if (btnEl && btnEl.parentElement) {
        btnEl.parentElement.querySelectorAll('button').forEach(b => {
            b.classList.remove('active', 'scale-105', 'ring-2', 'ring-[#2B5B35]', 'font-bold', 'shadow-xs', 'bg-white');
            b.classList.add('opacity-60');
        });
        btnEl.classList.add('active', 'scale-105', 'ring-2', 'ring-[#2B5B35]', 'font-bold', 'shadow-xs', 'bg-white');
        btnEl.classList.remove('opacity-60');
    }
    const descEl = document.getElementById(species + 'VariantDesc');
    const vInfo = (animalVariants[species] || []).find(v => v.id === variantId);
    if (descEl && vInfo) {
        descEl.textContent = vInfo.desc;
    }
}
window.selectAnimalVariant = selectAnimalVariant;

var animalDefaultNames = {
    cat: {
        ginger: ['Mimi', 'Oyen', 'Milo', 'Sunny', 'Leo'],
        black: ['Kuro', 'Luna', 'Shadow', 'Midnight', 'Kiki'],
        calico: ['Belang', 'Mochi', 'Patch', 'Ciki', 'Daisy']
    },
    dog: {
        golden: ['Bobi', 'Lucky', 'Sunny', 'Goldie', 'Cupi'],
        choco: ['Choco', 'Brownie', 'Milo', 'Koko', 'Buster'],
        dalmatian: ['Dotty', 'Pongo', 'Oreo', 'Spot', 'Domino']
    },
    rabbit: {
        white: ['Bunbun', 'Snowy', 'Cimol', 'Fluffy', 'Mimi'],
        caramel: ['Mocha', 'Ciki', 'Caramel', 'Peanut', 'Toffee'],
        grey: ['Misty', 'Smoke', 'Lala', 'Silver', 'Pompom']
    },
    butterfly: {
        violet: ['Belle', 'Flora', 'Pipit', 'Violet'],
        blue: ['Morpho', 'Sky', 'Kiki', 'Azure'],
        golden: ['Sunny', 'Amber', 'Momo', 'Goldie']
    },
    fish: {
        koi: ['Kohaku', 'Taisho', 'Chibi', 'Nami', 'Ryuki'],
        goldfish: ['Bulu', 'Pompom', 'Gelembung', 'Koko', 'Mimi'],
        betta: ['Aura', 'Sapphire', 'Fluffy', 'Nemo', 'Finny']
    }
};

function updateAnimalsBadge() {
    const badge = document.getElementById('animalsCountBadge');
    if (badge) {
        badge.textContent = animals.length;
    }
    const pill = document.getElementById('modalAnimalCounterPill');
    if (pill) {
        pill.textContent = `${animals.length} Hewan`;
    }
}

function openAnimalModal() {
    const modal = document.getElementById('animalModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        renderActiveAnimalsList();
        updateAnimalsBadge();
    }
}

function closeAnimalModal() {
    const modal = document.getElementById('animalModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function renderActiveAnimalsList() {
    const container = document.getElementById('activeAnimalsContainer');
    if (!container) return;

    if (animals.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center bg-[#fdfbf7] rounded-xl border border-dashed border-[#d2e0cb]">
                <p class="text-sm font-hand text-gray-500">Belum ada hewan di kebun ini.</p>
                <p class="text-xs text-gray-400 mt-1">Pilih kucing, anjing, kelinci, kupu-kupu, atau gambar hewan custom di atas untuk meramaikan kebunmu!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = animals.map(a => {
        let label = 'Hewan Kebun';
        let emoji = '🐾';
        if (a.type === 'custom') {
            label = 'Hewan Ciptaanmu';
            emoji = '✨';
        } else if (a.type === 'exclusive' || (typeof isExclusivePetType === 'function' && isExclusivePetType(a.variant || a.type))) {
            const exInfo = (typeof getExclusivePetDef === 'function') ? getExclusivePetDef(a.variant || a.type) : null;
            if (exInfo) {
                label = `${exInfo.tierEmoji} ${exInfo.fullName}`;
                emoji = exInfo.emoji;
            } else {
                label = 'Pet Misterius Eksklusif';
                emoji = '🥚';
            }
        } else if (animalVariants[a.type]) {
            const vInfo = animalVariants[a.type].find(v => v.id === a.variant) || animalVariants[a.type][0];
            label = vInfo.fullName || vInfo.name;
            emoji = vInfo.emoji;
        }

        const isCurrentlyFollowed = followedAnimal && followedAnimal.id === a.id;
        const isFav = (typeof isAnimalFavorited === 'function') ? isAnimalFavorited(a) : false;
        const friendTier = (typeof getAnimalFriendshipTier === 'function') ? getAnimalFriendshipTier(a) : { label: 'Kenal 🌱', pct: 20 };
        const persInfo = (typeof getAnimalPersonalityInfo === 'function') ? getAnimalPersonalityInfo(a) : { label: 'Ceria ⚡' };
        const accList = (typeof ANIMAL_ACCESSORIES !== 'undefined') ? ANIMAL_ACCESSORIES : [{ id: 'none', icon: '✖️', name: 'Polos' }];
        const curAcc = accList.find(ac => ac.id === (a.accessory || 'none')) || accList[0];

        return `
            <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#fdfbf7] hover:bg-white rounded-xl border border-[#e2d5bc] transition shadow-xs ${isCurrentlyFollowed ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : ''}">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-lg overflow-hidden shrink-0">
                        ${a.customImg ? `<img src="${a.spriteDataUrl}" class="w-full h-full object-contain">` : emoji}
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <h4 onclick="promptRenameAnimal('${a.id}')" class="font-hand font-bold text-sm text-[#2B5B35] leading-tight cursor-pointer hover:underline" title="Klik untuk mengubah nama">${a.name}</h4>
                            <button onclick="promptRenameAnimal('${a.id}')" class="p-0.5 rounded hover:bg-emerald-100 text-emerald-700 transition" title="Beri Nama / Ubah Nama">
                                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold" title="Level Kedekatan (Elus atau beri Teh Bunga untuk menaikkan)">${friendTier.label} (${friendTier.pct}%)</span>
                            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">${persInfo.label}</span>
                        </div>
                        <span class="text-[11px] text-gray-400">${label}</span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <!-- Costume / Accessory Cycle Button -->
                    <button onclick="cycleAnimalAccessory('${a.id}')" class="px-2 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-hand font-bold flex items-center gap-1 transition active:scale-95" title="Ganti Kostum / Aksesori (${curAcc.name})">
                        <span>${curAcc.id === 'none' ? '🎩' : curAcc.icon}</span>
                        <span class="hidden sm:inline">${curAcc.name}</span>
                    </button>
                    <!-- Favorite Toggle Button -->
                    <button onclick="toggleFavoriteAnimalById('${a.id}')" class="w-7 h-7 rounded-full ${isFav ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-white hover:bg-amber-50 border-gray-200 text-gray-400 hover:text-amber-500'} border flex items-center justify-center transition active:scale-95 shadow-xs" title="${isFav ? 'Hapus dari Hewan Favorit' : 'Simpan ke Hewan Favorit'}">
                        <svg class="w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <!-- Follow Button -->
                    <button onclick="startFollowingAnimalById('${a.id}'); closeAnimalModal();" class="px-2.5 py-1 rounded-full ${isCurrentlyFollowed ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} text-xs font-hand font-bold flex items-center gap-1 transition active:scale-95 shadow-sm" title="Perhatikan dan ikuti hewan ini">
                        <span>${isCurrentlyFollowed ? '👁️ Diperhatikan' : '👁️ Perhatikan'}</span>
                    </button>
                    <!-- Dismiss Button -->
                    <button onclick="dismissAnimal('${a.id}')" class="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 flex items-center justify-center transition active:scale-95" title="Lepaskan hewan kembali ke alam">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Reaksi teks kaomoji saat hewan ditekan (murni ekspresi emoji teks tanpa kalimat)
var animalKaomojiReactions = [
    '(˶˃ ᵕ ˂˶)',
    '𐔌՞ ܸ.ˬ.ܸ՞𐦯',
    '(˶˃𐃷˂˶)',
    '(˶ˆᗜˆ˵)',
    '(˶˃ᆺ˂˶)',
    '.·°՞(っ-ᯅ-ς)՞°·.',
    '(๑•᎑•๑)',
    'ᕙ(  •̀ ᗜ •́  )ᕗ',
    '( ˶˘ ³˘)♡',
    '(⸝⸝๑﹏๑⸝⸝)'
];

function getRandomAnimalKaomoji() {
    return animalKaomojiReactions[Math.floor(Math.random() * animalKaomojiReactions.length)];
}

/**
 * Memulai mode perhatikan: kamera terzoom in dan mengikuti gerak langkah hewan
 */
function startFollowingAnimal(a) {
    if (!a) return;
    followedAnimal = a;
    updateFollowBanner();

    a.petAnim = 0.9;
    a.state = 'happy';
    a.stateTimer = 3.5;

    // Bunyikan suara khas hewan yang ditekan / diperhatikan
    playAnimalSoundEffect(a);

    a.bubbleText = getRandomAnimalKaomoji();
    a.bubbleTimer = 3.2;

    for (let i = 0; i < 5; i++) {
        particles.push({
            type: 'heart',
            x: a.x + (Math.random() - 0.5) * 24,
            y: a.y - 18 - Math.random() * 16,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1.2 - Math.random() * 1.0,
            size: 15 + Math.random() * 8,
            alpha: 1.0
        });
    }

    if (typeof showGardenNotice === 'function') {
        showGardenNotice(`Memperhatikan ${a.name}! Kamera mengikuti gerakannya.`);
    }
}

function startFollowingAnimalById(id) {
    const a = animals.find(item => item.id === id);
    if (a) {
        startFollowingAnimal(a);
    }
}

function stopFollowingAnimal() {
    if (!followedAnimal) return;
    followedAnimal = null;
    updateFollowBanner();
}

function updateFollowBanner() {
    const banner = document.getElementById('animalFollowBanner');
    if (!banner) return;
    if (!followedAnimal) {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
    } else {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
        const emojiEl = document.getElementById('followAnimalEmoji');
        const nameEl = document.getElementById('followAnimalNameText');
        const favBtn = document.getElementById('followAnimalFavBtn');
        if (emojiEl) {
            const emojis = { cat: '🐱', dog: '🐶', rabbit: '🐰', butterfly: '🦋', custom: '✨' };
            emojiEl.textContent = emojis[followedAnimal.type] || '🐾';
        }
        if (nameEl) {
            nameEl.textContent = followedAnimal.name;
        }
        if (favBtn) {
            const isFav = (typeof isAnimalFavorited === 'function') ? isAnimalFavorited(followedAnimal) : false;
            favBtn.innerHTML = isFav 
                ? `<svg class="w-3 h-3 text-amber-500 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>Favorit</span>`
                : `<svg class="w-3 h-3 text-gray-400 group-hover:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>+ Favorit</span>`;
            favBtn.className = isFav
                ? 'group px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-bold font-hand flex items-center gap-1 transition active:scale-95 shadow-2xs'
                : 'group px-2 py-0.5 rounded-full bg-white hover:bg-amber-50 border border-gray-300 text-gray-600 text-[11px] font-bold font-hand flex items-center gap-1 transition active:scale-95';
        }
    }
}

async function promptRenameAnimal(id) {
    const a = animals.find(item => item.id === id);
    if (!a) return;
    const speciesName = a.type === 'cat' ? 'kucing' : (a.type === 'dog' ? 'anjing' : (a.type === 'rabbit' ? 'kelinci' : (a.type === 'butterfly' ? 'kupu-kupu' : (a.type === 'fish' ? 'ikan' : 'hewan'))));
    
    let newName;
    if (typeof cutePrompt === 'function') {
        newName = await cutePrompt(`Beri nama baru untuk ${speciesName} ini:`, a.name, 'Ganti Nama Hewan', 'Nama panggilan...', '🐾');
    } else {
        newName = prompt(`Beri nama baru untuk ${speciesName} ini:`, a.name);
    }

    if (newName !== null && newName !== undefined) {
        const trimmed = newName.trim();
        if (trimmed.length > 0 && trimmed !== a.name) {
            a.name = trimmed;
            updateAnimalsBadge();
            renderActiveAnimalsList();
            updateFollowBanner();
            if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
            if (typeof showGardenNotice === 'function') showGardenNotice(`Nama diubah menjadi "${a.name}"!`);
        }
    }
}

async function promptRenameCurrentFollowedAnimal() {
    if (!followedAnimal) return;
    await promptRenameAnimal(followedAnimal.id);
}

function playAnimalSoundEffect(a) {
    if (!a) return;
    if (a.type === 'cat' && typeof playCatMeowSound === 'function') playCatMeowSound();
    else if (a.type === 'dog' && typeof playDogBarkSound === 'function') playDogBarkSound();
    else if (a.type === 'rabbit' && typeof playRabbitSound === 'function') playRabbitSound();
    else if (a.type === 'butterfly' && typeof playButterflySound === 'function') playButterflySound();
    else if (a.type === 'fish' && typeof playFishSound === 'function') playFishSound();
    else if (a.type === 'exclusive' || (typeof isExclusivePetType === 'function' && isExclusivePetType(a.variant || a.type))) {
        if (typeof playChimeSound === 'function') playChimeSound();
    }
    else if (a.type === 'custom') {
        if (a.sound === 'cat' && typeof playCatMeowSound === 'function') playCatMeowSound();
        else if (a.sound === 'dog' && typeof playDogBarkSound === 'function') playDogBarkSound();
        else if (a.sound === 'rabbit' && typeof playRabbitSound === 'function') playRabbitSound();
        else if (a.sound === 'butterfly' && typeof playButterflySound === 'function') playButterflySound();
        else if (a.sound === 'fish' && typeof playFishSound === 'function') playFishSound();
        else if (typeof playChimeSound === 'function') playChimeSound();
    }
}

function spawnAnimal(species, customName, variantId) {
    const cx = WORLD_W * 0.5;
    const cy = WORLD_H * 0.52;
    let sx = cx;
    let sy = cy;

    let habitat = 'land';
    if (species === 'fish') habitat = 'water';
    else if (species === 'butterfly') habitat = 'flying';

    if (species === 'fish') {
        let foundWater = false;
        for (let attempt = 0; attempt < 80; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 450;
            const testX = cx + Math.cos(angle) * dist;
            const testY = cy + Math.sin(angle) * (dist * 0.55);
            if (typeof isPointOnWater === 'function' && isPointOnWater(testX, testY)) {
                sx = testX;
                sy = testY;
                foundWater = true;
                break;
            }
        }
        if (!foundWater) {
            // Scan garden grid for any water spot
            if (typeof isPointOnWater === 'function') {
                for (let rx = 300; rx < WORLD_W - 300; rx += 70) {
                    for (let ry = 300; ry < WORLD_H - 300; ry += 70) {
                        if (isPointOnWater(rx, ry)) {
                            sx = rx;
                            sy = ry;
                            foundWater = true;
                            break;
                        }
                    }
                    if (foundWater) break;
                }
            }
        }
        if (!foundWater) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Gunakan pensil air 🌊 untuk membuat kolam bagi ikan terlebih dahulu!');
            }
            if (typeof playErrorSound === 'function') playErrorSound();
            return null;
        }
    } else {
        for (let attempt = 0; attempt < 50; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 340;
            const testX = cx + Math.cos(angle) * dist;
            const testY = cy + Math.sin(angle) * (dist * 0.55);
            const onGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(testX, testY) : true;
            const onWater = typeof isPointOnWater === 'function' ? isPointOnWater(testX, testY) : false;
            if (onGrass && (species === 'butterfly' || !onWater)) {
                sx = testX;
                sy = testY;
                break;
            }
        }
    }

    const chosenVariant = variantId || selectedAnimalVariants[species] || (animalVariants[species] ? animalVariants[species][0].id : 'default');

    let name = customName;
    if (!name) {
        const namesObj = animalDefaultNames[species];
        let pool = ['Sahabat'];
        if (namesObj && typeof namesObj === 'object') {
            if (namesObj[chosenVariant] && Array.isArray(namesObj[chosenVariant])) {
                pool = namesObj[chosenVariant];
            } else if (Array.isArray(namesObj)) {
                pool = namesObj;
            }
        }
        name = pool[Math.floor(Math.random() * pool.length)];
    }

    const animal = {
        id: 'animal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: species,
        habitat: habitat,
        variant: chosenVariant,
        name: name,
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        targetX: sx,
        targetY: sy,
        state: 'idle',
        stateTimer: 1 + Math.random() * 2,
        facingLeft: Math.random() < 0.5,
        hopPhase: 0,
        tailPhase: Math.random() * Math.PI,
        swimPhase: Math.random() * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 16 + Math.random() * 8,
        perchedFlowerId: null,
        perchTimer: 0,
        petAnim: 0,
        bubbleText: '',
        bubbleTimer: 0,
        colorHue: Math.random() * 360
    };

    animals.push(animal);
    updateAnimalsBadge();
    renderActiveAnimalsList();

    // Spawn sound when placed!
    playAnimalSoundEffect(animal);

    // Spawn cheerful heart particles
    for (let i = 0; i < 4; i++) {
        particles.push({
            type: 'heart',
            x: sx + (Math.random() - 0.5) * 20,
            y: sy - 15 - Math.random() * 15,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2 - Math.random() * 0.8,
            size: 14 + Math.random() * 6,
            alpha: 1.0
        });
    }

    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    const vInfo = (animalVariants[species] || []).find(v => v.id === chosenVariant);
    const label = vInfo ? vInfo.fullName : (species === 'cat' ? 'Kucing' : species === 'dog' ? 'Anjing' : species === 'rabbit' ? 'Kelinci' : species === 'fish' ? 'Ikan' : 'Kupu-Kupu');
    if (typeof showGardenNotice === 'function') {
        showGardenNotice(`${name} sang ${label} menyapa kebunmu!`);
    }
    return animal;
}

function spawnCustomAnimalInstance(options) {
    const cx = WORLD_W * 0.5;
    const cy = WORLD_H * 0.52;
    let sx = cx;
    let sy = cy;
    const habitat = options.habitat || 'land';

    if (habitat === 'water') {
        let foundWater = false;
        for (let attempt = 0; attempt < 80; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 450;
            const testX = cx + Math.cos(angle) * dist;
            const testY = cy + Math.sin(angle) * (dist * 0.55);
            if (typeof isPointOnWater === 'function' && isPointOnWater(testX, testY)) {
                sx = testX;
                sy = testY;
                foundWater = true;
                break;
            }
        }
        if (!foundWater && typeof isPointOnWater === 'function') {
            for (let rx = 300; rx < WORLD_W - 300; rx += 70) {
                for (let ry = 300; ry < WORLD_H - 300; ry += 70) {
                    if (isPointOnWater(rx, ry)) {
                        sx = rx;
                        sy = ry;
                        foundWater = true;
                        break;
                    }
                }
                if (foundWater) break;
            }
        }
        if (!foundWater) {
            if (typeof showGardenNotice === 'function') {
                showGardenNotice('Hewan air membutuhkan medan air 🌊! Buatlah kolam terlebih dahulu.');
            }
            if (typeof playErrorSound === 'function') playErrorSound();
            return null;
        }
    } else {
        for (let attempt = 0; attempt < 50; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 320;
            const testX = cx + Math.cos(angle) * dist;
            const testY = cy + Math.sin(angle) * (dist * 0.55);
            const onGrass = typeof isPointOnGrass === 'function' ? isPointOnGrass(testX, testY) : true;
            const onWater = typeof isPointOnWater === 'function' ? isPointOnWater(testX, testY) : false;
            if (onGrass && (habitat === 'flying' || !onWater)) {
                sx = testX;
                sy = testY;
                break;
            }
        }
    }

    const img = new Image();
    img.src = options.spriteDataUrl;

    const animal = {
        id: 'animal_custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: 'custom',
        habitat: habitat,
        name: options.name || 'Hewan Custom',
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        targetX: sx,
        targetY: sy,
        width: options.width || 48,
        height: options.height || 48,
        spriteDataUrl: options.spriteDataUrl,
        customImg: img,
        sound: options.sound || 'chime',
        state: 'idle',
        stateTimer: 1 + Math.random() * 2,
        facingLeft: Math.random() < 0.5,
        hopPhase: 0,
        tailPhase: 0,
        swimPhase: Math.random() * Math.PI * 2,
        petAnim: 0,
        bubbleText: '',
        bubbleTimer: 0
    };

    animals.push(animal);
    updateAnimalsBadge();
    renderActiveAnimalsList();
    if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
    return animal;
}

function spawnStarterAnimals() {
    animals = [];
    spawnAnimal('cat', 'Mimi', 'ginger');
    spawnAnimal('dog', 'Bobi', 'golden');
    spawnAnimal('rabbit', 'Bunbun', 'white');
    spawnAnimal('butterfly', 'Kiki', 'violet');
}

async function dismissAnimal(id) {
    const a = animals.find(item => item.id === id);
    if (!a) return;

    let confirmed = true;
    if (typeof cuteConfirm === 'function') {
        confirmed = await cuteConfirm(`Lepaskan ${a.name} kembali ke alam bebas?`, 'Lepaskan Hewan', true, 'Ya, Lepaskan', '🕊️');
    }

    if (!confirmed) return;

    const idx = animals.findIndex(item => item.id === id);
    if (idx !== -1) {
        const removed = animals.splice(idx, 1)[0];
        if (followedAnimal && followedAnimal.id === id) {
            stopFollowingAnimal();
        }
        updateAnimalsBadge();
        renderActiveAnimalsList();
        if (typeof scheduleAutoSave === 'function') scheduleAutoSave();
        if (typeof showGardenNotice === 'function') {
            showGardenNotice(`${removed.name} telah berpamitan dengan ramah.`);
        }
    }
}

function focusAnimal(id) {
    startFollowingAnimalById(id);
    closeAnimalModal();
}

function petAnimal(a) {
    if (!a) return;
    a.sleepingOnPillowId = null;
    a.targetPillowId = null;
    a.petAnim = 1.0;
    a.state = 'happy';
    a.stateTimer = 3.5;

    // Tampilkan reaksi kaomoji murni tanpa teks kalimat
    a.bubbleText = getRandomAnimalKaomoji();
    a.bubbleTimer = 2.8;

    // Suara hewan asli dari assets atau synth
    playAnimalSoundEffect(a);

    if (typeof incrementStat === 'function') {
        incrementStat('animalsPetted', 1);
    }
    if (typeof incrementQuestProgress === 'function') {
        incrementQuestProgress('pet_animals', 1);
    }
    if (typeof boostAnimalFriendship === 'function') {
        boostAnimalFriendship(a, 7);
    }

    for (let i = 0; i < 5; i++) {
        particles.push({
            type: 'heart',
            x: a.x + (Math.random() - 0.5) * 24,
            y: a.y - 18 - Math.random() * 16,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -1.2 - Math.random() * 1.0,
            size: 15 + Math.random() * 8,
            alpha: 1.0
        });
    }
}

function findAnimalAt(wx, wy) {
    for (let i = animals.length - 1; i >= 0; i--) {
        const a = animals[i];
        const dx = wx - a.x;
        const dy = wy - (a.y - 12);
        if (Math.hypot(dx, dy) < 32) {
            return a;
        }
    }
    return null;
}

// Helper: Memastikan titik berada di daratan rumput kering (atau di atas jembatan) untuk hewan darat
function isLandWalkable(x, y) {
    if (typeof isPointBlockedByDecoration === 'function' && isPointBlockedByDecoration(x, y, 9)) return false;
    const onBridge = typeof isPointOnBridgeDeck === 'function' && isPointOnBridgeDeck(x, y);
    if (onBridge) return true;
    if (typeof isPointOnGrass === 'function' && !isPointOnGrass(x, y)) return false;
    if (typeof isPointOnWater === 'function' && isPointOnWater(x, y)) return false;
    if (typeof isNearWater === 'function' && isNearWater(x, y, 16)) return false;
    return true;
}

// Helper: Memastikan titik berada di air untuk hewan air / ikan
function isWaterSwimmable(x, y) {
    if (typeof isPointBlockedByDecoration === 'function' && isPointBlockedByDecoration(x, y, 8)) return false;
    if (typeof isPointOnWater === 'function') {
        return isPointOnWater(x, y);
    }
    return false;
}

// Helper: Memeriksa apakah jalur garis lurus bebas dari medan air & void (untuk hewan darat)
function isPathClearOfWater(x1, y1, x2, y2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(3, Math.floor(dist / 10));
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        if (!isLandWalkable(px, py)) return false;
    }
    return true;
}

// Helper: Memeriksa apakah jalur garis lurus sepenuhnya di air (untuk ikan & hewan air)
function isPathClearOfLand(x1, y1, x2, y2) {
    if (typeof isPointOnWater !== 'function') return true;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(3, Math.floor(dist / 12));
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        if (!isPointOnWater(px, py)) return false;
    }
    return true;
}

function updateAnimals(dt, now) {
    const cx = WORLD_W * 0.5;
    const cy = WORLD_H * 0.52;

    for (let i = animals.length - 1; i >= 0; i--) {
        const a = animals[i];
        if (!a) continue;
        if (a.bubbleTimer > 0) {
            a.bubbleTimer -= dt;
            if (a.bubbleTimer <= 0) {
                a.bubbleText = '';
            }
        }

        if (a.petAnim > 0) {
            a.petAnim = Math.max(0, a.petAnim - dt * 2.2);
        }

        // If currently being dragged by player: stays terrified!
        if (a.isBeingDragged) {
            a.sleepingOnPillowId = null;
            a.targetPillowId = null;
            a.state = 'scared';
            a.bubbleText = '(⸝⸝๑﹏๑⸝⸝)';
            a.bubbleTimer = 0.5;
            continue;
        }

        const habitat = a.habitat || (a.type === 'fish' ? 'water' : (a.type === 'butterfly' ? 'flying' : 'land'));

        // ==========================================
        // 1. FISH & AQUATIC ANIMALS AI (HEWAN AIR)
        // Ikan HANYA bisa ada di medan air!
        // ==========================================
        if (habitat === 'water' || a.type === 'fish') {
            a.swimPhase = (a.swimPhase || 0) + dt * 5.5;

            // Occasional bubble popping from mouth
            if (Math.random() < 0.04) {
                particles.push({
                    type: 'bubble',
                    x: a.x + (a.facingLeft ? -10 : 10),
                    y: a.y - 2,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -0.9 - Math.random() * 0.6,
                    size: 3 + Math.random() * 3,
                    alpha: 0.8
                });
            }

            const inWaterNow = typeof isPointOnWater === 'function' && isPointOnWater(a.x, a.y);
            if (!inWaterNow) {
                // Stranded on land! Scared flopping towards nearest water!
                a.state = 'scared';
                a.bubbleText = '.·°՞(っ-ᯅ-ς)՞°·.';
                a.bubbleTimer = 2.0;

                let foundWater = false;
                for (let r = 16; r <= 240; r += 20) {
                    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 8) {
                        const sx = a.x + Math.cos(ang) * r;
                        const sy = a.y + Math.sin(ang) * r;
                        if (isWaterSwimmable(sx, sy)) {
                            a.targetX = sx;
                            a.targetY = sy;
                            a.stateTimer = 5.0;
                            a.facingLeft = sx < a.x;
                            foundWater = true;
                            break;
                        }
                    }
                    if (foundWater) break;
                }
            }

            a.stateTimer = (a.stateTimer || 0) - dt;
            if (a.stateTimer <= 0 && inWaterNow) {
                // Pick another spot inside water body
                let foundSpot = false;
                for (let t = 0; t < 20; t++) {
                    const ang = Math.random() * Math.PI * 2;
                    const dist = 30 + Math.random() * 110;
                    const tx = a.x + Math.cos(ang) * dist;
                    const ty = a.y + Math.sin(ang) * dist * 0.6;
                    if (isWaterSwimmable(tx, ty) && isPathClearOfLand(a.x, a.y, tx, ty)) {
                        a.targetX = tx;
                        a.targetY = ty;
                        a.state = 'walking';
                        a.stateTimer = 3.5 + Math.random() * 3.5;
                        a.facingLeft = tx < a.x;
                        foundSpot = true;
                        break;
                    }
                }
                if (!foundSpot) {
                    a.state = 'idle';
                    a.stateTimer = 1.5 + Math.random() * 2.0;
                }
            }

            // Move smoothly in water
            const dx = a.targetX - a.x;
            const dy = a.targetY - a.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4) {
                a.x = a.targetX;
                a.y = a.targetY;
                a.state = 'idle';
            } else {
                const speed = 28;
                const step = Math.min(dist, speed * dt);
                const nx = a.x + (dx / dist) * step;
                const ny = a.y + (dy / dist) * step;
                if (isWaterSwimmable(nx, ny) || !inWaterNow) {
                    a.x = nx;
                    a.y = ny + Math.sin(now * 0.003 + (a.swimPhase || 0)) * 0.25;
                    a.facingLeft = dx < 0;
                } else {
                    a.stateTimer = 0;
                }
            }
            continue;
        }

        // ==========================================
        // 2. BUTTERFLY & FLYING ANIMALS AI (HEWAN TERBANG)
        // Bisa terbang melintasi darat & perairan, tetap di batas kebun
        // ==========================================
        if (habitat === 'flying' || a.type === 'butterfly') {
            a.wingPhase += dt * (a.wingSpeed || 20);

            if (a.state === 'perched') {
                a.perchTimer -= dt;
                a.wingSpeed = 5;
                // Feature 6: Butterfly Pollination sparkles while perched
                if (Math.random() < 0.16 && typeof particles !== 'undefined') {
                    particles.push({
                        type: 'sparkle',
                        x: a.x + (Math.random() - 0.5) * 16,
                        y: a.y + (Math.random() - 0.5) * 12,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: -0.6 - Math.random() * 0.8,
                        size: 3.2,
                        color: '#FACC15',
                        alpha: 1.0
                    });
                }
                if (a.perchTimer <= 0) {
                    a.state = 'flying';
                    // 35% chance to drop pollinated organic seed!
                    if (a.perchedFlowerId && typeof spawnDroppedSeedFromPollination === 'function' && Math.random() < 0.40) {
                        spawnDroppedSeedFromPollination(a.x, a.y + 12, a.perchedFlowerId);
                    }
                    a.perchedFlowerId = null;
                }
            } else {
                const tSec = now * 0.001;
                a.wingSpeed = 14 + Math.sin(tSec * 2.5) * 3;
                a.hopPhase = (a.hopPhase || 0) + dt * 5.2;
                a.tailPhase = (a.tailPhase || 0) + dt * 2.4;
                a.stateTimer = (a.stateTimer || 0) - dt;

                if (a.stateTimer <= 0) {
                    a.stateTimer = 2.5 + Math.random() * 3.0;

                    let targetedFlower = false;
                    if (flowers.length > 0 && Math.random() < 0.45) {
                        const candidate = flowers[Math.floor(Math.random() * flowers.length)];
                        if (candidate) {
                            a.targetX = candidate.x + (Math.random() - 0.5) * 8;
                            a.targetY = candidate.y - candidate.height * 0.75;
                            a.perchedFlowerId = candidate.id;
                            targetedFlower = true;
                        }
                    }

                    if (!targetedFlower) {
                        // Wander across land and water (within garden)
                        for (let t = 0; t < 15; t++) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = 40 + Math.random() * 140;
                            const tx = a.x + Math.cos(angle) * dist;
                            const ty = a.y + Math.sin(angle) * dist * 0.6;
                            const onG = typeof isPointOnGrass === 'function' && isPointOnGrass(tx, ty);
                            const onW = typeof isPointOnWater === 'function' && isPointOnWater(tx, ty);
                            if (onG || onW) {
                                a.targetX = tx;
                                a.targetY = ty;
                                break;
                            }
                        }
                    }
                }

                const dx = a.targetX - a.x;
                const dy = a.targetY - a.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 6) {
                    if (a.perchedFlowerId) {
                        a.state = 'perched';
                        a.perchTimer = 2.5 + Math.random() * 4.0;
                    } else {
                        a.stateTimer = 0;
                    }
                } else {
                    const speed = a.type === 'exclusive' ? 34 : 42;
                    a.vx = (dx / dist) * speed;
                    a.vy = (dy / dist) * speed;
                    a.x += a.vx * dt;
                    a.y += a.vy * dt + Math.sin(now * 0.0035 + (a.colorHue || 0)) * 0.35;
                    a.facingLeft = dx < 0;
                }

                // If strayed outside garden island, steer back to center
                const curGrass = typeof isPointOnGrass === 'function' && isPointOnGrass(a.x, a.y);
                const curWater = typeof isPointOnWater === 'function' && isPointOnWater(a.x, a.y);
                if (!curGrass && !curWater) {
                    a.targetX = cx;
                    a.targetY = cy;
                    a.stateTimer = 3.0;
                }
            }
            continue;
        }

        // ==========================================
        // 3. CAT, DOG, RABBIT & CUSTOM LAND ANIMALS (HEWAN DARAT)
        // Hewan darat TIDAK BISA melintasi daerah air (kecuali di atas jembatan) atau menembus dekorasi
        // ==========================================
        const onBridgeNow = typeof isPointOnBridgeDeck === 'function' && isPointOnBridgeDeck(a.x, a.y);
        const currentlyOnWater = !onBridgeNow && typeof isPointOnWater === 'function' && isPointOnWater(a.x, a.y);
        const currentlyOffGrass = !onBridgeNow && typeof isPointOnGrass === 'function' && !isPointOnGrass(a.x, a.y);

        if (currentlyOnWater || currentlyOffGrass) {
            // Coba selamatkan hewan ke rumput kering terdekat bila tanahnya baru saja diganti air
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
                a.stateTimer = 2.0;
                a.bubbleText = '💦 (⊙_⊙;) !';
                a.bubbleTimer = 2.2;
                if (typeof createWaterSplash === 'function') {
                    createWaterSplash(a.x, a.y, 4);
                }
                continue;
            }

            // Bila tidak ada rumput sama sekali di sekitar -> Animasi jatuh dan menghilang
            if (typeof triggerFallingLandAnimal === 'function') {
                triggerFallingLandAnimal(a, currentlyOnWater);
            }
            animals.splice(i, 1);
            if (typeof followedAnimal !== 'undefined' && followedAnimal === a) {
                if (typeof stopFollowingAnimal === 'function') stopFollowingAnimal();
            }
            if (typeof showGardenNotice === 'function') {
                showGardenNotice(`${a.name} terjatuh dan kembali beristirahat! 🐾`);
            }
            if (typeof updateAnimalsBadge === 'function') {
                updateAnimalsBadge();
            }
            continue;
        }

        a.stateTimer -= dt;

        // Bridge crossing waypoints check
        if (a.stateTimer <= 0 && a.bridgeWaypoints && a.bridgeWaypoints.length > 0) {
            const nextWp = a.bridgeWaypoints.shift();
            a.targetX = nextWp.x;
            a.targetY = nextWp.y;
            a.state = 'walking';
            a.stateTimer = 5.0;
            a.facingLeft = nextWp.x < a.x;
        } else if (a.stateTimer <= 0 && !currentlyOnWater && !currentlyOffGrass) {
            if (a.state === 'walking') {
                a.state = Math.random() < 0.25 ? 'sleeping' : 'idle';
                a.stateTimer = 2.0 + Math.random() * 4.0;
            } else {
                let targetedBridge = false;
                // If near bridge, chance to cross bridge across river/pond!
                if (typeof decorations !== 'undefined' && Math.random() < 0.45) {
                    const bridges = decorations.filter(d => d.type === 'bridge');
                    for (const b of bridges) {
                        const distToBridge = Math.hypot(a.x - b.x, a.y - b.y);
                        if (distToBridge < 160 && typeof getBridgeCrossingWaypoints === 'function') {
                            const wps = getBridgeCrossingWaypoints(b, a.x, a.y);
                            if (wps && wps.length > 0) {
                                a.bridgeWaypoints = wps.slice();
                                const firstWp = a.bridgeWaypoints.shift();
                                a.targetX = firstWp.x;
                                a.targetY = firstWp.y;
                                a.state = 'walking';
                                a.stateTimer = 6.0;
                                a.facingLeft = firstWp.x < a.x;
                                targetedBridge = true;
                                break;
                            }
                        }
                    }
                }

                let targetedPillow = false;
                if (!targetedBridge && typeof decorations !== 'undefined' && Array.isArray(decorations)) {
                    const emptyPillows = decorations.filter(d => {
                        if (d.type !== 'pet_pillow') return false;
                        const occupied = animals.some(other => other !== a && (other.sleepingOnPillowId === d.id || Math.hypot(other.x - d.x, other.y - d.y) < 16) && other.state === 'sleeping');
                        return !occupied;
                    });
                    if (emptyPillows.length > 0 && Math.random() < 0.45) {
                        const pil = emptyPillows[Math.floor(Math.random() * emptyPillows.length)];
                        a.targetX = pil.x;
                        a.targetY = pil.y - 1;
                        a.targetPillowId = pil.id;
                        a.state = 'walking';
                        a.stateTimer = 9.0;
                        a.facingLeft = pil.x < a.x;
                        targetedPillow = true;
                    }
                }

                if (!targetedBridge && !targetedPillow) {
                    const wanderChance = a.type === 'dog' ? 0.8 : (a.type === 'cat' ? 0.6 : 0.7);
                    if (Math.random() < wanderChance) {
                        let foundTarget = false;
                        for (let tries = 0; tries < 24; tries++) {
                            const ang = Math.random() * Math.PI * 2;
                            const dist = 45 + Math.random() * 130;
                            const tx = a.x + Math.cos(ang) * dist;
                            const ty = a.y + Math.sin(ang) * dist * 0.6;
                            if (isLandWalkable(tx, ty) && isPathClearOfWater(a.x, a.y, tx, ty)) {
                                a.targetX = tx;
                                a.targetY = ty;
                                a.state = 'walking';
                                a.stateTimer = 6.0;
                                a.facingLeft = tx < a.x;
                                foundTarget = true;
                                break;
                            }
                        }
                        if (!foundTarget) {
                            a.state = 'idle';
                            a.stateTimer = 1.5 + Math.random() * 2.0;
                        }
                    } else {
                        a.state = Math.random() < 0.3 ? 'sleeping' : 'idle';
                        a.stateTimer = 2.0 + Math.random() * 3.5;
                    }
                }
            }
        }

        if (a.state === 'walking') {
            const dx = a.targetX - a.x;
            const dy = a.targetY - a.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 6) {
                a.x = a.targetX;
                a.y = a.targetY;
                if (a.targetPillowId && typeof decorations !== 'undefined') {
                    const pil = decorations.find(d => d.id === a.targetPillowId);
                    if (pil && Math.hypot(a.x - pil.x, a.y - pil.y) < 16) {
                        a.x = pil.x;
                        a.y = pil.y - 1;
                        a.state = 'sleeping';
                        a.sleepingOnPillowId = pil.id;
                        a.stateTimer = 16.0 + Math.random() * 12.0; // Sweet peaceful nap!
                        a.targetPillowId = null;
                        a.bubbleText = '💤';
                        a.bubbleTimer = 2.5;
                        continue;
                    }
                }
                if (a.bridgeWaypoints && a.bridgeWaypoints.length > 0) {
                    const nextWp = a.bridgeWaypoints.shift();
                    a.targetX = nextWp.x;
                    a.targetY = nextWp.y;
                    a.stateTimer = 5.0;
                    a.facingLeft = nextWp.x < a.x;
                } else {
                    a.state = 'idle';
                    a.stateTimer = 1.5 + Math.random() * 3.0;
                }
            } else {
                const baseSpeed = a.type === 'cat' ? 32 : (a.type === 'dog' ? 44 : 36);
                const moveStep = Math.min(dist, baseSpeed * dt);
                const stepX = (dx / dist) * moveStep;
                const stepY = (dy / dist) * moveStep;
                const nextX = a.x + stepX;
                const nextY = a.y + stepY;

                const nextOnBridge = typeof isPointOnBridgeDeck === 'function' && isPointOnBridgeDeck(nextX, nextY);
                const nextBlockedDecor = typeof isPointBlockedByDecoration === 'function' && isPointBlockedByDecoration(nextX, nextY, 9);
                const stepIntoWater = !nextOnBridge && typeof isPointOnWater === 'function' && isPointOnWater(nextX, nextY);
                const stepNearWater = !nextOnBridge && typeof isNearWater === 'function' && isNearWater(nextX, nextY, 14);
                const stepOffGrass = !nextOnBridge && typeof isPointOnGrass === 'function' && !isPointOnGrass(nextX, nextY);

                if (nextBlockedDecor || stepIntoWater || stepNearWater || stepOffGrass) {
                    a.targetX = a.x;
                    a.targetY = a.y;
                    a.bridgeWaypoints = null;
                    a.state = 'idle';
                    a.stateTimer = 1.2 + Math.random() * 2.0;
                } else {
                    a.x = nextX;
                    a.y = nextY;

                    const hopSpeed = a.type === 'rabbit' ? 7.5 : (a.type === 'exclusive' ? 7.2 : 6.0);
                    a.hopPhase += dt * hopSpeed;
                    a.tailPhase += dt * (a.type === 'dog' ? 2.5 : (a.type === 'exclusive' ? 2.8 : 1.8));
                }
            }
        } else if (a.state === 'idle' || a.state === 'happy') {
            const wagRate = a.state === 'happy' ? (a.type === 'dog' ? 3.8 : 2.8) : (a.type === 'dog' ? 1.2 : 1.0);
            a.tailPhase += dt * wagRate;
        } else if (a.state === 'sleeping') {
            if (a.stateTimer <= 0) {
                a.sleepingOnPillowId = null;
                a.state = 'idle';
                a.stateTimer = 2.0 + Math.random() * 2.0;
            } else if (Math.random() < 0.035 && typeof particles !== 'undefined') {
                particles.push({
                    type: 'zzz',
                    x: a.x + (Math.random() - 0.5) * 8,
                    y: a.y - (a.type === 'exclusive' ? 18 : 14),
                    vx: (Math.random() - 0.5) * 0.4 + (a.facingLeft ? -0.4 : 0.4),
                    vy: -15 - Math.random() * 6,
                    size: 11 + Math.random() * 4,
                    alpha: 0.95,
                    text: Math.random() < 0.4 ? 'Z' : 'z',
                    color: a.sleepingOnPillowId ? '#EC4899' : '#A855F7'
                });
            }
        }
    }
}

/********************************************************************
 * ANIMAL RENDERING: CAT, DOG, RABBIT, BUTTERFLY & CUSTOM DRAWN
 ********************************************************************/

function drawCat(ctx, a, now) {
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const dragLift = a.isBeingDragged ? -16 : 0;
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;

    // Ground shadow
    ctx.fillStyle = 'rgba(20, 40, 15, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2 - dragLift, isScared ? 12 : 17, isScared ? 3.5 : 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;
    const walkHop = a.state === 'walking' ? Math.abs(Math.sin(a.hopPhase || 0)) * 3.5 : 0;
    const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;
    ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const variant = a.variant || 'ginger';
    let bodyColor = '#FBBF24';
    let bellyColor = '#FFFDF0';
    let strokeColor = '#2B3B24';
    let earInnerColor = '#FBCFE8';
    let eyeColor = '#232B2B';
    let noseColor = '#F472B6';

    if (variant === 'black') {
        bodyColor = '#2D3142';
        bellyColor = '#3F4458';
        strokeColor = '#181924';
        earInnerColor = '#4F5D75';
        eyeColor = '#10B981'; // Emerald radiant eyes
    } else if (variant === 'calico') {
        bodyColor = '#FFFFFF';
        bellyColor = '#FFFDF0';
        strokeColor = '#2B3B24';
        earInnerColor = '#FBCFE8';
    } else if (variant === 'sakura') {
        bodyColor = '#FBCFE8';
        bellyColor = '#FFF5F8';
        strokeColor = '#9D174D';
        earInnerColor = '#F472B6';
        eyeColor = '#DB2777';
    }

    const outlineWidth = 2.0;

    // 1. Tail (curved and playful)
    const tailWag = Math.sin((a.tailPhase || 0)) * (isScared ? 0.45 : 0.25);
    ctx.save();
    ctx.translate(-10, -7);
    ctx.rotate(tailWag);
    ctx.lineWidth = outlineWidth + 2.5;
    ctx.strokeStyle = (variant === 'calico') ? '#E68A00' : bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-6, -4, -10, -12);
    ctx.quadraticCurveTo(-14, -18, -8, -20);
    ctx.stroke();
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();

    // 2. Back Paw
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(-7, -2, 6, 4.2, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Body
    ctx.beginPath();
    ctx.ellipse(0, -9, 13.5, 10.5, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Calico Patches
    if (variant === 'calico') {
        ctx.fillStyle = '#E68A00';
        ctx.beginPath();
        ctx.ellipse(-4, -13, 6, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.ellipse(3, -14, 4.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Belly patch
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(3, -7.5, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Front Paws
    const legSwing = isScared ? (Math.sin(now * 20) * 4) : (a.state === 'walking' ? Math.sin((a.hopPhase || 0)) * 3.5 : 0);
    ctx.fillStyle = (variant === 'black') ? '#FFFFFF' : bellyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(5 + legSwing, -1.2, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(10 - legSwing, -1.2, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(8, -17.5, 10.5, 9.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (variant === 'calico') {
        ctx.fillStyle = '#E68A00';
        ctx.beginPath();
        ctx.ellipse(12, -22, 5, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 6. Ears
    ctx.beginPath();
    ctx.moveTo(1.5, -21.5);
    ctx.quadraticCurveTo(3, -29, 6.5, -28.5);
    ctx.quadraticCurveTo(8.5, -24, 10, -22.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = earInnerColor;
    ctx.beginPath();
    ctx.moveTo(3, -22.5);
    ctx.lineTo(6, -27);
    ctx.lineTo(8.5, -23);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = (variant === 'calico') ? '#E68A00' : bodyColor;
    ctx.beginPath();
    ctx.moveTo(9, -23.5);
    ctx.quadraticCurveTo(12, -29.5, 15, -28);
    ctx.quadraticCurveTo(16, -23, 16.5, -19.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = earInnerColor;
    ctx.beginPath();
    ctx.moveTo(10.5, -23.5);
    ctx.lineTo(13.5, -27);
    ctx.lineTo(15, -21.5);
    ctx.closePath();
    ctx.fill();

    // 7. Face: Eyes, Nose, Mouth
    if (isScared) {
        // Scared wide shaking eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(6, -17, 3.2, 0, Math.PI * 2);
        ctx.arc(12, -17, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(6 + Math.sin(now * 25) * 0.6, -17, 1.4, 0, Math.PI * 2);
        ctx.arc(12 + Math.sin(now * 25) * 0.6, -17, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Trembling wavy mouth
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = (variant === 'black') ? '#8E9AA8' : strokeColor;
        ctx.beginPath();
        ctx.moveTo(7.5, -11.5);
        ctx.quadraticCurveTo(9.2, -13, 11, -11.5);
        ctx.stroke();

        // Sweat drop near ear
        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(14.5, -25);
        ctx.quadraticCurveTo(17.5, -24, 16.5, -21);
        ctx.arc(15, -20.5, 1.6, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (a.state === 'sleeping') {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(6, -16.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(12, -16.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
    } else {
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(6, -17, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -17, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(5.2, -18, 0.9, 0, Math.PI * 2);
        ctx.arc(11.2, -18, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    // Nose
    ctx.fillStyle = noseColor;
    ctx.beginPath();
    ctx.moveTo(8.2, -13.8);
    ctx.lineTo(10.2, -13.8);
    ctx.lineTo(9.2, -12.4);
    ctx.closePath();
    ctx.fill();

    if (!isScared) {
        // Cute cat mouth (‿‿)
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = (variant === 'black') ? '#8E9AA8' : strokeColor;
        ctx.beginPath();
        ctx.arc(8.2, -11.8, 1.3, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10.4, -11.8, 1.3, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
    }

    // Soft pink blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.arc(3.5, -14.5, 2.0, 0, Math.PI * 2);
    ctx.arc(14.5, -14.5, 2.0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = (variant === 'black') ? '#71788E' : '#B8A48B';
    ctx.beginPath();
    ctx.moveTo(1, -14.5); ctx.lineTo(-4, -16);
    ctx.moveTo(1, -12.5); ctx.lineTo(-4, -12.5);
    ctx.moveTo(16, -14.5); ctx.lineTo(21, -16);
    ctx.moveTo(16, -12.5); ctx.lineTo(21, -12.5);
    ctx.stroke();

    ctx.restore();
}

function drawDog(ctx, a, now) {
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const dragLift = a.isBeingDragged ? -16 : 0;
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;

    // Ground shadow
    ctx.fillStyle = 'rgba(20, 40, 15, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2 - dragLift, isScared ? 13 : 18, isScared ? 3.5 : 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;
    const walkHop = a.state === 'walking' ? Math.abs(Math.sin(a.hopPhase || 0)) * 3.8 : 0;
    const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;
    ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const variant = a.variant || 'golden';
    let bodyColor = '#E6933A';
    let muzzleColor = '#FFFDF0';
    let earColor = '#E6933A';
    let earInnerColor = '#D97D29';
    let strokeColor = '#3A2814';

    if (variant === 'choco') {
        bodyColor = '#78350F';
        muzzleColor = '#FEF3C7';
        earColor = '#78350F';
        earInnerColor = '#5C2809';
        strokeColor = '#280F02';
    } else if (variant === 'dalmatian') {
        bodyColor = '#FFFFFF';
        muzzleColor = '#FFFFFF';
        earColor = '#27272A';
        earInnerColor = '#3F3F46';
        strokeColor = '#18181B';
    } else if (variant === 'starry') {
        bodyColor = '#FBBF24';
        muzzleColor = '#FEF08A';
        earColor = '#F59E0B';
        earInnerColor = '#D97706';
        strokeColor = '#78350F';
    }

    const outlineWidth = 2.0;

    // 1. Tail
    const tailWag = Math.sin(a.tailPhase || 0) * (isScared ? 0.40 : (a.state === 'happy' ? 0.20 : 0.12));
    ctx.save();
    ctx.translate(-10, -9);
    ctx.rotate(tailWag);
    ctx.lineWidth = outlineWidth + 2.5;
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-5, -5, -9, -15);
    ctx.stroke();
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();

    // 2. Back Paw
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(-7.5, -2, 6.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Body
    ctx.beginPath();
    ctx.ellipse(0, -9.5, 14, 11, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (variant === 'dalmatian') {
        ctx.fillStyle = '#27272A';
        ctx.beginPath();
        ctx.arc(-4, -13, 2.2, 0, Math.PI * 2);
        ctx.arc(3, -14, 1.8, 0, Math.PI * 2);
        ctx.arc(-2, -6, 2.0, 0, Math.PI * 2);
        ctx.arc(-8, -4, 1.6, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = muzzleColor;
        ctx.beginPath();
        ctx.ellipse(2, -7.5, 7.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Front Paws
    const legSwing = isScared ? (Math.sin(now * 22) * 4) : (a.state === 'walking' ? Math.sin((a.hopPhase || 0)) * 4 : 0);
    ctx.fillStyle = muzzleColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(5 + legSwing, -1.2, 4, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(10.5 - legSwing, -1.2, 4, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Far Ear
    ctx.fillStyle = earColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.moveTo(1.5, -23.5);
    ctx.quadraticCurveTo(-3, -24, -4, -17);
    ctx.quadraticCurveTo(-4, -12, -1.5, -13);
    ctx.quadraticCurveTo(0.5, -14, 2, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6. Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(8, -17.5, 10.5, 9.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Snout
    ctx.fillStyle = muzzleColor;
    ctx.beginPath();
    ctx.ellipse(12.5, -14.5, 5.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#8E6740';
    ctx.stroke();

    // Near Ear
    ctx.fillStyle = earColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.moveTo(4.5, -24.5);
    ctx.quadraticCurveTo(0.5, -22, -0.5, -15.5);
    ctx.quadraticCurveTo(-0.5, -10.5, 2.5, -11.5);
    ctx.quadraticCurveTo(5, -13.5, 5.5, -19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = earInnerColor;
    ctx.beginPath();
    ctx.ellipse(2, -16, 1.6, 3.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Face: Eyes, Nose, Mouth
    if (isScared) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(8, -17.5, 3.4, 0, Math.PI * 2);
        ctx.arc(13.8, -17.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#232B2B';
        ctx.beginPath();
        ctx.arc(8 + Math.sin(now * 25) * 0.6, -17.5, 1.5, 0, Math.PI * 2);
        ctx.arc(13.8 + Math.sin(now * 25) * 0.6, -17.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.4;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(11.5, -12);
        ctx.quadraticCurveTo(13.2, -13.5, 15, -12);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(16, -24);
        ctx.quadraticCurveTo(19, -23, 18, -20);
        ctx.arc(16.5, -19.5, 1.6, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (a.state === 'sleeping') {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(8, -17.5, 2.5, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(13.8, -17.5, 2.5, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#232B2B';
        ctx.beginPath();
        ctx.ellipse(8, -17.5, 2.3, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(13.8, -17.5, 2.1, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(7.2, -18.3, 0.9, 0, Math.PI * 2);
        ctx.arc(13.2, -18.3, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    // Button nose
    ctx.fillStyle = '#232B2B';
    ctx.beginPath();
    ctx.ellipse(14.8, -14.8, 2.2, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(14.2, -15.3, 0.6, 0, Math.PI * 2);
    ctx.fill();

    if (!isScared) {
        if (a.state === 'happy' || a.state === 'walking' || (a.petAnim || 0) > 0) {
            ctx.fillStyle = '#FB7185';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(13.5, -11.5, 2.0, 2.8, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.arc(13, -12.8, 2, 0.2 * Math.PI, 0.9 * Math.PI, false);
            ctx.stroke();
        }
    }

    // Pink blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
    ctx.beginPath();
    ctx.arc(6.8, -14.2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawRabbit(ctx, a, now) {
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const dragLift = a.isBeingDragged ? -16 : 0;
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;

    // Ground shadow
    ctx.fillStyle = 'rgba(20, 40, 15, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2 - dragLift, isScared ? 11 : 15, isScared ? 3.2 : 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 12;
    const walkHop = a.state === 'walking' ? Math.abs(Math.sin((a.hopPhase || 0))) * 7.5 : 0;
    const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;
    ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const variant = a.variant || 'white';
    let bodyColor = '#FFFFFF';
    let shadowWhite = '#F3F4F6';
    let earInnerColor = '#FCE7F3';
    let strokeColor = '#374151';

    if (variant === 'caramel') {
        bodyColor = '#C27838';
        shadowWhite = '#9A5018';
        earInnerColor = '#FDE2E4';
        strokeColor = '#3A1E06';
    } else if (variant === 'grey') {
        bodyColor = '#9CA3AF';
        shadowWhite = '#6B7280';
        earInnerColor = '#FBCFE8';
        strokeColor = '#1F2937';
    } else if (variant === 'sakura_rabbit') {
        bodyColor = '#FFF5F8';
        shadowWhite = '#FBCFE8';
        earInnerColor = '#F472B6';
        strokeColor = '#831843';
    }

    const outlineWidth = 2.0;

    // 1. Tail
    ctx.fillStyle = (variant === 'caramel') ? '#FFFFFF' : bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.arc(-11, -8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Hind Leg
    ctx.fillStyle = shadowWhite;
    ctx.beginPath();
    ctx.ellipse(-5, -4, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = (variant === 'caramel') ? '#FFFFFF' : bodyColor;
    ctx.beginPath();
    ctx.ellipse(-2, -1, 5.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -9, 12.5, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (variant === 'caramel') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(3, -7.5, 6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Front Paws
    const legSwing = isScared ? (Math.sin(now * 24) * 4) : (a.state === 'walking' ? Math.sin((a.hopPhase || 0)) * 5 : 0);
    ctx.fillStyle = (variant === 'caramel') ? '#FFFFFF' : bodyColor;
    ctx.beginPath();
    ctx.ellipse(6 + legSwing, -1.5, 3.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(10 - legSwing, -1.5, 3.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Ears
    const earHopDrag = isScared ? (Math.sin(now * 25) * 0.08) : (a.state === 'walking' ? Math.sin(a.hopPhase || 0) * -0.025 : 0);
    ctx.save();
    ctx.translate(4, -22);
    ctx.rotate(earHopDrag);
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(-3, -11, 4, 11, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = earInnerColor;
    ctx.beginPath();
    ctx.ellipse(-3, -11, 2.2, 8.5, -0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(4, -10, 4, 11, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = earInnerColor;
    ctx.beginPath();
    ctx.ellipse(4, -10, 2.2, 8.5, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Head
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    ctx.ellipse(8, -17.5, 10, 9, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (variant === 'caramel') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(8, -25);
        ctx.lineTo(6, -14);
        ctx.lineTo(12, -14);
        ctx.lineTo(9.5, -25);
        ctx.closePath();
        ctx.fill();
    }

    // 7. Face
    if (isScared) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(6, -17, 3.2, 0, Math.PI * 2);
        ctx.arc(12, -17, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#232B2B';
        ctx.beginPath();
        ctx.arc(6 + Math.sin(now * 25) * 0.6, -17, 1.4, 0, Math.PI * 2);
        ctx.arc(12 + Math.sin(now * 25) * 0.6, -17, 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.3;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(7.5, -10.5);
        ctx.quadraticCurveTo(9, -12, 10.5, -10.5);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(14, -25);
        ctx.quadraticCurveTo(17, -24, 16, -21);
        ctx.arc(14.5, -20.5, 1.6, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (a.state === 'sleeping') {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(6, -16.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(11.5, -16.5, 2.4, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#232B2B';
        ctx.beginPath();
        ctx.ellipse(6, -17, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -17, 2.2, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(5.2, -18, 0.9, 0, Math.PI * 2);
        ctx.arc(11.2, -18, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pink nose
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.ellipse(9, -13.5, 1.8, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isScared) {
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = (variant === 'caramel') ? '#371C06' : strokeColor;
        ctx.beginPath();
        ctx.moveTo(9, -12.2); ctx.lineTo(9, -11.2);
        ctx.arc(7.6, -10.8, 1.4, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10.4, -10.8, 1.4, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();
    }

    // Pink blush
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.arc(3.5, -14.5, 2.2, 0, Math.PI * 2);
    ctx.arc(14.5, -14.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawButterfly(ctx, a, now) {
    if (!a) return;
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const dragLift = a.isBeingDragged ? -16 : 0;
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;

    // Floating shadow
    ctx.fillStyle = 'rgba(25, 45, 20, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 16 - dragLift, isScared ? 5 : 7, isScared ? 1.8 : 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    const variant = a.variant || 'violet';
    let wingTopColor = '#A855F7';
    let wingBottomColor = '#EC4899';
    let strokeColor = '#3B0764';

    if (variant === 'blue') {
        wingTopColor = '#0284C7';
        wingBottomColor = '#38BDF8';
        strokeColor = '#082F49';
    } else if (variant === 'golden') {
        wingTopColor = '#F59E0B';
        wingBottomColor = '#FBBF24';
        strokeColor = '#451A03';
    } else if (variant === 'aurora') {
        wingTopColor = '#38BDF8';
        wingBottomColor = '#EC4899';
        strokeColor = '#0F172A';
    }

    const wingFlap = Math.cos(a.wingPhase || 0) * 0.95;

    // Helper to draw a full wing pair (forewing + hindwing) on one side
    function drawWingSide(flip) {
        ctx.save();
        ctx.scale(flip * Math.max(0.12, Math.abs(wingFlap)), 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Top Forewing
        ctx.fillStyle = wingTopColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.bezierCurveTo(-8, -20, -19, -15, -13, -3);
        ctx.bezierCurveTo(-10, 0, -2, -2, 0, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom Hindwing
        ctx.fillStyle = wingBottomColor;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.bezierCurveTo(-8, 2, -15, 6, -10, 11);
        ctx.bezierCurveTo(-6, 12, -2, 4, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White accent spots
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-11, -10, 1.5, 0, Math.PI * 2);
        ctx.arc(-7, 7, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Draw both Right wing (behind/flipped) and Left wing (front)!
    drawWingSide(-1);
    drawWingSide(1);

    // Body
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.0, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-1, -10);
    ctx.quadraticCurveTo(-3, -15, -6, -14);
    ctx.moveTo(1, -10);
    ctx.quadraticCurveTo(3, -15, 6, -14);
    ctx.stroke();

    if (isScared) {
        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(5, -16);
        ctx.quadraticCurveTo(7.5, -15, 6.5, -13);
        ctx.arc(5.5, -12.5, 1.3, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

function drawFish(ctx, a, now) {
    if (!a) return;
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;
    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 10;
    const dragLift = a.isBeingDragged ? -15 : 0;

    // 1. Realistic pond bed depth shadow (soft and deep underwater)
    ctx.fillStyle = 'rgba(8, 35, 52, 0.28)';
    ctx.beginPath();
    ctx.ellipse(-2, 8 - dragLift, isScared ? 12 : 16, isScared ? 4.5 : 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Trailing concentric water wake ripples behind fish
    if (!a.isBeingDragged) {
        const ripplePhase = (now * 0.0035 + (a.x * 0.01)) % 1;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.32 * (1 - ripplePhase)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-14, 1, 6 + ripplePhase * 10, 3 + ripplePhase * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.translate(0, -petBounce + dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const variant = a.variant || 'koi';
    // Smooth natural tail wave without hyper-speed millisecond glitch!
    const swimWave = Math.sin(a.swimPhase || 0) * (isScared ? 0.45 : 0.22);

    let bodyColor = '#FFFFFF';
    let spotColor = '#EA580C';
    let finColor = 'rgba(255, 255, 255, 0.85)';
    let strokeColor = '#3A2814';

    if (variant === 'goldfish') {
        bodyColor = '#F97316';
        spotColor = '#EF4444';
        finColor = 'rgba(254, 215, 170, 0.85)';
        strokeColor = '#431407';
    } else if (variant === 'betta') {
        bodyColor = '#2563EB';
        spotColor = '#7C3AED';
        finColor = 'rgba(168, 85, 247, 0.8)';
        strokeColor = '#1E1B4B';
    } else if (variant === 'golden_dragon') {
        bodyColor = '#FBBF24';
        spotColor = '#F59E0B';
        finColor = 'rgba(253, 224, 71, 0.9)';
        strokeColor = '#78350F';
    }

    const outlineWidth = 2.0;

    // Tail Fin
    ctx.save();
    ctx.translate(-10, 0);
    ctx.rotate(swimWave);
    ctx.fillStyle = finColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.6;

    if (variant === 'betta') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-14, -13, -24, -6);
        ctx.quadraticCurveTo(-17, 0, -24, 6);
        ctx.quadraticCurveTo(-14, 13, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (variant === 'goldfish') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-12, -11, -19, -4);
        ctx.quadraticCurveTo(-11, 0, -19, 4);
        ctx.quadraticCurveTo(-12, 11, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-8, -8, -15, -3);
        ctx.quadraticCurveTo(-11, 0, -15, 3);
        ctx.quadraticCurveTo(-8, 8, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();

    // Dorsal Fin
    ctx.fillStyle = finColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.quadraticCurveTo(0, -13, 6, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fish Body
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = outlineWidth;
    ctx.beginPath();
    if (variant === 'goldfish') {
        ctx.ellipse(0, 0, 11, 8.5, 0, 0, Math.PI * 2);
    } else {
        ctx.ellipse(0, 0, 12.5, 7, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Spots / patterns
    if (variant === 'koi') {
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.ellipse(-2, -2, 5, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, -1, 3.5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Cute barbels
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(11, 2);
        ctx.quadraticCurveTo(14, 5, 16, 4);
        ctx.stroke();
    } else if (variant === 'betta') {
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.ellipse(-1, 0, 7, 4, 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pectoral Fin (smooth rotation tied to swim phase)
    ctx.save();
    ctx.translate(1, 2);
    ctx.rotate(Math.sin((a.swimPhase || 0) * 1.6) * 0.25);
    ctx.fillStyle = finColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Eye
    if (isScared) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(6.5, -2, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1E1B4B';
        ctx.beginPath();
        ctx.arc(6.5 + (Math.sin(now * 25) * 0.6), -2, 1.6, 0, Math.PI * 2);
        ctx.fill();
    } else if (a.state === 'sleeping') {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(6.5, -2, 2.2, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#1E1B4B';
        ctx.beginPath();
        ctx.arc(6.5, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(5.8, -2.8, 0.9, 0, Math.PI * 2);
        ctx.fill();
    }

    // Mouth
    if (isScared) {
        ctx.fillStyle = '#FB7185';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(12, 1, 1.8, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(11, 0.5, 1.5, 0.1 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();
    }

    // 3. Submerged Crystal Water Sheen & Surface Refraction over Fish
    if (!a.isBeingDragged) {
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.20)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water caustic light gleam along fish back
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.quadraticCurveTo(1, -7.5, 7, -3);
        ctx.stroke();
        ctx.restore();
    }

    // Sweat drop if scared
    if (isScared) {
        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(3, -11);
        ctx.quadraticCurveTo(5.5, -10, 4.5, -7.5);
        ctx.arc(3.5, -7, 1.4, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

function drawCustomAnimal(ctx, a, now) {
    ctx.save();
    ctx.translate(a.x, a.y);

    const isScared = a.isBeingDragged || a.state === 'scared';
    const dragLift = a.isBeingDragged ? -16 : 0;
    const tremble = isScared ? (Math.sin(now * 30) * 1.5) : 0;

    // Ground shadow
    const w = a.width || 44;
    const h = a.height || 44;
    ctx.fillStyle = 'rgba(25, 45, 20, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 2 - dragLift, (isScared ? w * 0.28 : w * 0.35), (isScared ? 3.5 : 5), 0, 0, Math.PI * 2);
    ctx.fill();

    const petBounce = Math.sin((a.petAnim || 0) * Math.PI) * 14;
    const walkHop = a.state === 'walking' ? Math.abs(Math.sin(a.hopPhase || 0)) * 3 : 0;
    const bridgeLift = (!a.isBeingDragged && typeof getBridgeDeckElevation === 'function') ? getBridgeDeckElevation(a.x, a.y) : 0;
    ctx.translate(0, -petBounce - walkHop - bridgeLift + dragLift + tremble);

    if (a.facingLeft) ctx.scale(-1, 1);

    // Render the custom hand-drawn canvas image
    if (a.customImg && a.customImg.complete) {
        ctx.drawImage(a.customImg, -w / 2, -h, w, h);
    } else if (a.spriteDataUrl) {
        if (!a.customImg) {
            a.customImg = new Image();
            a.customImg.src = a.spriteDataUrl;
        }
        if (a.customImg.complete) {
            ctx.drawImage(a.customImg, -w / 2, -h, w, h);
        }
    }

    // Scared cartoon sweat drop
    if (isScared) {
        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(w * 0.25, -h - 6);
        ctx.quadraticCurveTo(w * 0.25 + 3, -h - 5, w * 0.25 + 2, -h - 2);
        ctx.arc(w * 0.25, -h - 1.5, 1.6, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}

function drawAnimalBubble(ctx, a) {
    if (!a.bubbleText || a.bubbleTimer <= 0) return;

    ctx.save();
    const alpha = Math.min(1, a.bubbleTimer * 2.5);
    ctx.globalAlpha = alpha;

    const bx = a.x;
    const by = a.y - 48;

    // Font stack khusus agar karakter kaomoji Unicode (seperti 𐔌, ՞, 𐦯, ᯅ, ᎑) dirender dengan presisi tinggi
    ctx.font = 'bold 14px "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Patrick Hand", sans-serif';
    const metrics = ctx.measureText(a.bubbleText);
    const padX = 14;
    const padY = 6;
    const bw = Math.max(52, metrics.width + padX * 2);
    const bh = 26;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2B5B35';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 13);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bx - 4, by + bh / 2);
    ctx.lineTo(bx, by + bh / 2 + 6);
    ctx.lineTo(bx + 4, by + bh / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + bh / 2);
    ctx.lineTo(bx, by + bh / 2 + 6);
    ctx.lineTo(bx + 4, by + bh / 2);
    ctx.stroke();

    ctx.fillStyle = '#2B5B35';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.bubbleText, bx, by);

    ctx.restore();
}

function drawAnimalNameTag(ctx, a) {
    const isFollowed = followedAnimal && followedAnimal.id === a.id;
    const isHovered = hoveredAnimal && hoveredAnimal.id === a.id;
    if (!isFollowed && !isHovered) return;

    ctx.save();
    const nx = a.x;
    const ny = (a.bubbleText && a.bubbleTimer > 0) ? a.y - 74 : a.y - 42;

    const emojis = { cat: '🐱', dog: '🐶', rabbit: '🐰', butterfly: '🦋', custom: '✨' };
    const emoji = emojis[a.type] || '🐾';
    const label = `${emoji} ${a.name}`;

    ctx.font = 'bold 13px "Patrick Hand", sans-serif';
    const metrics = ctx.measureText(label);
    const nw = metrics.width + 16;
    const nh = 22;

    // Soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Name pill background
    ctx.fillStyle = isFollowed ? '#FEF9C3' : '#FDFBF2';
    ctx.strokeStyle = isFollowed ? '#CA8A04' : '#2B5B35';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(nx - nw / 2, ny - nh / 2, nw, nh, 8);
    ctx.fill();
    ctx.stroke();

    // Downward pointer arrow
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(nx - 4, ny + nh / 2);
    ctx.lineTo(nx, ny + nh / 2 + 4);
    ctx.lineTo(nx + 4, ny + nh / 2);
    ctx.fillStyle = isFollowed ? '#FEF9C3' : '#FDFBF2';
    ctx.fill();
    ctx.stroke();

    // Name text
    ctx.fillStyle = '#2B5B35';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, nx, ny);

    ctx.restore();
}

// Global function bindings on window for robust HTML onclick access
window.startFollowingAnimal = startFollowingAnimal;
window.startFollowingAnimalById = startFollowingAnimalById;
window.stopFollowingAnimal = stopFollowingAnimal;
window.updateFollowBanner = updateFollowBanner;
window.promptRenameCurrentFollowedAnimal = promptRenameCurrentFollowedAnimal;
window.openAnimalModal = openAnimalModal;
window.closeAnimalModal = closeAnimalModal;
window.renderActiveAnimalsList = renderActiveAnimalsList;
window.spawnAnimal = spawnAnimal;
window.spawnCustomAnimalInstance = spawnCustomAnimalInstance;
window.dismissAnimal = dismissAnimal;
window.focusAnimal = focusAnimal;
window.promptRenameAnimal = promptRenameAnimal;
window.updateAnimalsBadge = updateAnimalsBadge;
window.petAnimal = petAnimal;
window.findAnimalAt = findAnimalAt;
window.spawnStarterAnimals = spawnStarterAnimals;
window.updateAnimals = updateAnimals;
window.drawFish = drawFish;
window.isWaterSwimmable = isWaterSwimmable;
window.isPathClearOfLand = isPathClearOfLand;
window.drawCat = drawCat;
window.drawDog = drawDog;
window.drawRabbit = drawRabbit;
window.drawButterfly = drawButterfly;
window.drawCustomAnimal = drawCustomAnimal;
window.drawAnimalBubble = drawAnimalBubble;
window.drawAnimalNameTag = drawAnimalNameTag;
window.isLandWalkable = isLandWalkable;
window.isPathClearOfWater = isPathClearOfWater;
