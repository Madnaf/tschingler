// Default Jingles
const defaultJingles = [
    { name: "You Dreamer", url: "https://www.myinstants.com/media/sounds/you-dreamer.mp3", id: "1" },
    { name: "Cicada", url: "https://www.myinstants.com/media/sounds/grillen-zirpen.mp3", id: "2" },
    { name: "Works on my machine", url: "https://www.myinstants.com/media/sounds/works-on-my-machine.mp3", id: "3" }, // Placeholder, likely need real URL
    { name: "Computer says no", url: "https://www.myinstants.com/media/sounds/computer-says-no.mp3", id: "4" },
    { name: "Gugus", url: "https://www.myinstants.com/media/sounds/gugus-gsi-gugus-gebliebe-online-audio-converter.mp3", id: "4" }
];

// State
let jingles = JSON.parse(localStorage.getItem('jingles')) || defaultJingles;

// DOM Elements
const grid = document.getElementById('jingle-grid');
const addBtn = document.getElementById('add-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const dialog = document.getElementById('add-dialog');
const form = dialog.querySelector('form');
const nameInput = document.getElementById('jingle-name');
const urlInput = document.getElementById('jingle-url');

// Render
function render() {
    grid.innerHTML = '';
    jingles.forEach(jingle => {
        const card = document.createElement('div');
        card.className = 'jingle-card';
        card.onclick = (e) => {
            if (e.target.closest('.delete-btn')) return;
            playJingle(jingle.url);
            animateCard(card);
        };

        const name = document.createElement('div');
        name.className = 'jingle-name';
        name.textContent = jingle.name;

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '×';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            if(confirm(`Delete "${jingle.name}"?`)) {
                deleteJingle(jingle.id);
            }
        };

        card.appendChild(delBtn);
        card.appendChild(name);
        grid.appendChild(card);
    });
}

// Play Audio
function playJingle(url) {
    const audio = new Audio(url);
    audio.play().catch(e => {
        console.error("Audio error:", e);
        alert("Could not play audio. Check the URL or internet connection.\n\nURL: " + url);
    });
}

// Cache All Sounds
async function downloadAll() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳'; // Loading indicator
    
    let successCount = 0;
    let failCount = 0;
    
    const promises = jingles.map(async (jingle) => {
        try {
            // Fetching with 'no-cors' allows opaque responses which the SW can cache
            const response = await fetch(jingle.url, { mode: 'no-cors' });
            if (response) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (err) {
            console.error(`Failed to cache ${jingle.name}:`, err);
            failCount++;
        }
    });

    await Promise.allSettled(promises);
    
    if (failCount > 0) {
        alert(`Cached ${successCount} sounds.\nFailed: ${failCount}.`);
        downloadBtn.textContent = '⚠️';
    } else {
        downloadBtn.textContent = '✅';
    }
    
    setTimeout(() => {
        downloadBtn.textContent = '⬇️';
        downloadBtn.disabled = false;
    }, 2000);
}

// Animation
function animateCard(card) {
    card.style.transform = 'scale(0.95)';
    card.style.backgroundColor = '#BB86FC'; // Accent color
    setTimeout(() => {
        card.style.transform = 'scale(1)';
        card.style.backgroundColor = '';
    }, 150);
}

// Add Jingle
function addJingle(name, url) {
    const newJingle = {
        name,
        url,
        id: Date.now().toString()
    };
    jingles.push(newJingle);
    save();
    render();
}

// Delete Jingle
function deleteJingle(id) {
    jingles = jingles.filter(j => j.id !== id);
    save();
    render();
}

// Save to LocalStorage
function save() {
    localStorage.setItem('jingles', JSON.stringify(jingles));
}

// Event Listeners
addBtn.addEventListener('click', () => {
    dialog.showModal();
});

resetBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to reset all data? This will delete all custom jingles and restore the defaults.')) {
        localStorage.clear();
        window.location.reload();
    }
});

downloadBtn.addEventListener('click', downloadAll);

dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'default') {
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        if (name && url) {
            addJingle(name, url);
        }
    }
    // Reset form
    nameInput.value = '';
    urlInput.value = '';
});

// Initial Render
render();
