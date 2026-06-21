const STORAGE_KEY = 'selfcare_entries';
const DB_NAME     = 'selfcare_media';
const DB_VERSION  = 1;
let db;

// ── Hardcoded portfolio entries (always shown, no upload needed) ──
const HARDCODED_ENTRIES = [
  {
    id: 'hc-1', isHardcoded: true,
    craftType: 'Perler Beads', date: '2026-05-06',
    title: 'Priestess Perler Beads',
    caption: "I went to the Alala workshop with my friends for the first time. I chose Priestess from Identity V as my first piece because she matches my current vibe: calm, insightful, intuitive, and mysterious. This piece is very complicated, so I made a lot of mistakes. But I am proud of the results!",
    media: [
      { type: 'image', dataUrl: 'media/priestess-1.jpg' },
      { type: 'image', dataUrl: 'media/priestess-2.jpg' },
      { type: 'image', dataUrl: 'media/priestess-3.jpg' },
    ]
  },
  {
    id: 'hc-2', isHardcoded: true,
    craftType: 'Perler Beads', date: '2026-05-23',
    title: 'A Beadful Afternoon',
    caption: "I'm getting so much better at this. I was so focused and mindful. Very relaxing and fun.",
    media: [
      { type: 'image', dataUrl: 'media/beadful-1.jpg' },
      { type: 'image', dataUrl: 'media/beadful-2.jpg' },
      { type: 'image', dataUrl: 'media/beadful-3.jpg' },
    ]
  },
  {
    id: 'hc-3', isHardcoded: true,
    craftType: 'Sticker Art', date: '2026-06-07',
    title: 'Self Care Bookmark',
    caption: "Making this made me feel calm and grateful. I'm going to use this as a bookmark.",
    media: [
      { type: 'image', dataUrl: 'media/bookmark1-1.jpg' },
      { type: 'image', dataUrl: 'media/bookmark1-2.jpg' },
    ]
  },
  {
    id: 'hc-4', isHardcoded: true,
    craftType: 'Sticker Art', date: '2026-06-09',
    title: 'Card Case Decoration',
    caption: "Calm. Great affirmations.",
    media: [
      { type: 'image', dataUrl: 'media/cardcase-1.jpg' },
    ]
  },
  {
    id: 'hc-5', isHardcoded: true,
    craftType: 'Gratitude Stars', date: '2026-06-10',
    title: 'Lucky 7 Stars',
    caption: "I feel very bored and not motivated to do anything, but I feel peaceful inside.",
    media: [
      { type: 'image', dataUrl: 'media/luckystars-1.jpg' },
      { type: 'image', dataUrl: 'media/luckystars-2.jpg' },
      { type: 'image', dataUrl: 'media/luckystars-3.jpg' },
    ]
  },
  {
    id: 'hc-6', isHardcoded: true,
    craftType: 'Sticker Art', date: '2026-06-11',
    title: 'Star Price Sticker Art',
    caption: "Very satisfying and calming",
    media: [
      { type: 'image', dataUrl: 'media/starprice-1.jpg' },
    ]
  },
  {
    id: 'hc-7', isHardcoded: true,
    craftType: 'Diamond Art', date: '2026-06-15',
    title: 'Beautiful Deer Diamond Art',
    caption: "Very satisfying and easy. Made me reflect.",
    media: [
      { type: 'image', dataUrl: 'media/deer-1.jpg' },
      { type: 'image', dataUrl: 'media/deer-2.jpg' },
    ]
  },
  {
    id: 'hc-8', isHardcoded: true,
    craftType: 'Diamond Art', date: '2026-06-16',
    title: 'Diamond Art Completed',
    caption: "Satisfying. Calming.",
    media: [
      { type: 'image', dataUrl: 'media/diamondart2-1.jpg' },
    ]
  },
  {
    id: 'hc-9', isHardcoded: true,
    craftType: 'Gratitude Stars', date: '2026-06-17',
    title: '13 Stars',
    caption: "Calming and satisfying",
    media: [
      { type: 'image', dataUrl: 'media/13stars-1.jpg' },
    ]
  },
  {
    id: 'hc-10', isHardcoded: true,
    craftType: 'Sticker Art', date: '2026-06-19',
    title: 'Bookmark #2',
    caption: "Stress relief. Sense of accomplishment.",
    media: [
      { type: 'image', dataUrl: 'media/bookmark2-1.jpg' },
      { type: 'image', dataUrl: 'media/bookmark2-2.jpg' },
    ]
  },
];

// ── IndexedDB (for images/videos) ────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) { resolve(db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore('media', { keyPath: 'id' });
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function saveMedia(entryId, mediaItems) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('media', 'readwrite');
    tx.objectStore('media').put({ id: entryId, items: mediaItems });
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

async function loadMedia(entryId) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction('media').objectStore('media').get(entryId);
    req.onsuccess = e => resolve(e.target.result?.items || []);
    req.onerror   = e => reject(e.target.error);
  });
}

async function deleteMedia(entryId) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction('media', 'readwrite');
    tx.objectStore('media').delete(entryId);
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

// ── localStorage (for metadata only) ─────────────────────────
function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Tag helpers ───────────────────────────────────────────────
const tagClass = {
  'Sticker Art':    'tag-sticker',
  'Diamond Art':    'tag-diamond',
  'Perler Beads':   'tag-perler',
  'Gratitude Stars':'tag-gratitude',
};
const tagEmoji = {
  'Sticker Art':    '✦',
  'Diamond Art':    '💎',
  'Perler Beads':   '⬡',
  'Gratitude Stars':'⭐',
};
const craftPlaceholder = {
  'Sticker Art':    '✦',
  'Diamond Art':    '💎',
  'Perler Beads':   '⬡',
  'Gratitude Stars':'⭐',
};

// ── Render gallery ────────────────────────────────────────────
let currentFilter = 'all';

async function renderGallery() {
  const entries = [...HARDCODED_ENTRIES, ...loadEntries()];
  const grid    = document.getElementById('galleryGrid');
  const empty   = document.getElementById('emptyState');

  const filtered = currentFilter === 'all'
    ? entries
    : entries.filter(e => e.craftType === currentFilter);

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = '';

  if (sorted.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  for (const entry of sorted) {
    const items = entry.media || await loadMedia(entry.id);

    const card = document.createElement('div');
    card.className   = 'gallery-card';
    card.dataset.id  = entry.id;

    const mediaThumb = (m, cls = '') => m.type === 'video'
      ? `<div class="card-video-thumb ${cls}">
           ${m.thumbnail
             ? `<img src="${m.thumbnail}" alt="video thumbnail" />`
             : `<div class="card-video-no-thumb">🎬</div>`}
           <div class="card-play-btn"></div>
         </div>`
      : `<img class="${cls || 'card-media'}" src="${m.dataUrl}" alt="" loading="lazy" />`;

    let mediaHtml;
    if (items.length === 0) {
      mediaHtml = `<div class="card-media-placeholder">${craftPlaceholder[entry.craftType] || '✨'}</div>`;
    } else if (items.length === 1) {
      mediaHtml = mediaThumb(items[0]);
    } else {
      const thumbs = items.map(m => mediaThumb(m)).join('');
      mediaHtml = `<div class="card-media-grid card-media-grid--${items.length}">${thumbs}</div>`;
    }

    const dateFormatted = entry.date
      ? new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    card.innerHTML = `
      ${mediaHtml}
      <div class="card-body">
        <span class="card-tag ${tagClass[entry.craftType] || ''}">${tagEmoji[entry.craftType] || ''} ${entry.craftType}</span>
        ${entry.title ? `<h3 class="card-title">${entry.title}</h3>` : ''}
        <p class="card-date">${dateFormatted}</p>
        ${entry.caption ? `<p class="card-caption">${entry.caption}</p>` : ''}
        <div class="card-actions">
          ${items.length > 0 ? `<button type="button" class="btn-view-media">View Media</button>` : ''}
          ${!entry.isHardcoded ? `<button type="button" class="btn-edit-entry">Edit Entry</button>` : ''}
        </div>
      </div>
      ${!entry.isHardcoded ? `<button class="card-delete" title="Delete entry">✕</button>` : ''}
    `;

    if (!entry.isHardcoded) {
      card.querySelector('.card-delete').addEventListener('click', () => deleteEntry(entry.id));
      card.querySelector('.btn-edit-entry').addEventListener('click', () => openEditModal(entry));
    }
    if (items.length > 0) {
      card.querySelector('.btn-view-media').addEventListener('click', () => openLightbox(items));
    }

    grid.appendChild(card);
  }
}

async function deleteEntry(id) {
  if (!confirm('Remove this entry from your gallery?')) return;
  await deleteMedia(id);
  saveEntries(loadEntries().filter(e => e.id !== id));
  renderGallery();
}

// ── Filter buttons ────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderGallery();
  });
});

// ── Drop zone / file preview ──────────────────────────────────
const mediaInput = document.getElementById('mediaInput');
const dropZone   = document.getElementById('dropZone');
const dropContent = document.getElementById('dropZoneContent');
const dropPreview = document.getElementById('dropPreview');

let selectedFiles = [];

function showPreviews(files) {
  selectedFiles = Array.from(files).slice(0, 4);
  dropContent.style.display = selectedFiles.length ? 'none' : 'block';
  dropPreview.innerHTML = '';

  selectedFiles.forEach((file, i) => {
    const url  = URL.createObjectURL(file);
    const wrap = document.createElement('div');
    wrap.className = 'preview-thumb';
    wrap.innerHTML = file.type.startsWith('video/')
      ? `<video src="${url}" muted></video>`
      : `<img src="${url}" alt="preview ${i + 1}" />`;

    const removeBtn = document.createElement('button');
    removeBtn.type      = 'button';
    removeBtn.className = 'preview-remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => {
      selectedFiles.splice(i, 1);
      showPreviews(selectedFiles);
    });

    wrap.appendChild(removeBtn);
    dropPreview.appendChild(wrap);
  });
}

mediaInput.addEventListener('change', () => {
  if (mediaInput.files.length) showPreviews(mediaInput.files);
});
dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) showPreviews(e.dataTransfer.files);
});

// ── Form submit ───────────────────────────────────────────────
document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault();

  try {
    const craftType = document.querySelector('input[name="craftType"]:checked')?.value;
    const date      = document.getElementById('entryDate').value;
    const title     = document.getElementById('entryTitle').value.trim();
    const caption   = document.getElementById('entryCaption').value.trim();

    if (!date)      { alert('Please choose a date.'); return; }
    if (!craftType) { alert('Please select a craft type.'); return; }

    // Convert files to base64, generate thumbnails for videos
    const mediaItems = [];
    for (const file of selectedFiles) {
      try {
        const isVideo   = file.type.startsWith('video/');
        const thumbnail = isVideo ? await generateVideoThumbnail(file) : null;
        const dataUrl   = await fileToDataUrl(file);
        mediaItems.push({ dataUrl, type: isVideo ? 'video' : 'image', thumbnail });
      } catch (err) {
        console.warn('Could not read file:', file.name, err);
      }
    }

    const entries = loadEntries();

    if (editingId) {
      // Update existing entry
      const idx = entries.findIndex(e => e.id === editingId);
      if (idx !== -1) entries[idx] = { ...entries[idx], craftType, date, title, caption };
      // Only replace media if new files were selected
      if (selectedFiles.length > 0) await saveMedia(editingId, mediaItems);
      saveEntries(entries);
    } else {
      // New entry
      const entryId = Date.now().toString();
      await saveMedia(entryId, mediaItems);
      entries.push({ id: entryId, craftType, date, title, caption });
      saveEntries(entries);
    }

    // Reset form
    e.target.reset();
    document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
    selectedFiles = [];
    dropContent.style.display = 'block';
    dropPreview.innerHTML = '';

    // Close modal and refresh gallery
    closeModal();
    currentFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    renderGallery();
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error('Failed to save entry:', err);
    alert('Something went wrong saving your entry. Please try again.');
  }
});

// ── Lightbox ──────────────────────────────────────────────────
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

let lightboxItems = [];
let lightboxIndex = 0;

function openLightbox(items, startIndex = 0) {
  lightboxItems = items;
  lightboxIndex = startIndex;
  renderLightboxSlide();
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
  lightboxContent.innerHTML = ''; // stop any playing video
}

function canPlayDataUrl(dataUrl) {
  const mime = dataUrl.split(';')[0].replace('data:', '');
  const t = document.createElement('video').canPlayType(mime);
  return t === 'probably' || t === 'maybe';
}

function renderLightboxSlide() {
  const m = lightboxItems[lightboxIndex];

  if (m.type === 'video') {
    if (canPlayDataUrl(m.dataUrl) || !m.dataUrl.startsWith('data:')) {
      lightboxContent.innerHTML =
        `<video src="${m.dataUrl}" controls autoplay style="max-width:90vw;max-height:80vh;border-radius:10px;"></video>`;
    } else {
      // Unsupported format (e.g. .mov in Chrome) — offer download
      const a = document.createElement('a');
      a.href     = m.dataUrl;
      a.download = 'video.mov';
      a.className = 'lightbox-download';
      a.innerHTML = `<span style="font-size:2.5rem;">🎬</span>
        <p>This video format can't be played in this browser.</p>
        <span class="lightbox-download-btn">⬇ Download to view</span>`;
      lightboxContent.innerHTML = '';
      lightboxContent.appendChild(a);
    }
  } else {
    lightboxContent.innerHTML =
      `<img src="${m.dataUrl}" style="max-width:90vw;max-height:80vh;border-radius:10px;object-fit:contain;" />`;
  }

  lightboxCounter.textContent = lightboxItems.length > 1
    ? `${lightboxIndex + 1} / ${lightboxItems.length}`
    : '';

  lightboxPrev.style.display = lightboxItems.length > 1 ? 'flex' : 'none';
  lightboxNext.style.display = lightboxItems.length > 1 ? 'flex' : 'none';
}

lightboxPrev.addEventListener('click', () => {
  lightboxContent.innerHTML = '';
  lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
  renderLightboxSlide();
});
lightboxNext.addEventListener('click', () => {
  lightboxContent.innerHTML = '';
  lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
  renderLightboxSlide();
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', e => { if (e.target === lightboxOverlay) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightboxOverlay.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   lightboxPrev.click();
  if (e.key === 'ArrowRight')  lightboxNext.click();
});

// ── Modal ─────────────────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle   = document.getElementById('modalTitle');
const submitBtn    = document.querySelector('#uploadForm button[type="submit"]');
let editingId = null; // null = new entry, string = editing existing

function openModal() {
  editingId = null;
  modalTitle.textContent = 'Add New Entry';
  submitBtn.textContent  = 'Add to Gallery ✦';

  // Reset all form fields
  document.getElementById('uploadForm').reset();
  document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[name="craftType"]').forEach(r => r.checked = false);
  selectedFiles = [];
  dropContent.style.display = 'block';
  dropPreview.innerHTML = '';

  openModalOverlay();
}

function openEditModal(entry) {
  editingId = entry.id;
  modalTitle.textContent = 'Update Entry';
  submitBtn.textContent  = 'Save Changes ✦';

  // Pre-fill fields
  document.getElementById('entryDate').value    = entry.date || '';
  document.getElementById('entryTitle').value   = entry.title || '';
  document.getElementById('entryCaption').value = entry.caption || '';
  const radio = document.querySelector(`input[name="craftType"][value="${entry.craftType}"]`);
  if (radio) radio.checked = true;

  // Show existing media previews (read-only indicator)
  loadMedia(entry.id).then(items => {
    if (items.length > 0) {
      dropContent.style.display = 'none';
      dropPreview.innerHTML = items.map((m, i) =>
        `<div class="preview-thumb preview-thumb--existing">
          ${m.type === 'video'
            ? `<video src="${m.dataUrl}" muted></video>`
            : `<img src="${m.dataUrl}" alt="existing ${i+1}" />`}
          <span class="preview-existing-label">saved</span>
        </div>`
      ).join('');
    }
  });

  openModalOverlay();
}

function openModalOverlay() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
  modalTitle.textContent = 'Add New Entry';
  submitBtn.textContent  = 'Add to Gallery ✦';
}

document.getElementById('openModalHero').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Helpers ───────────────────────────────────────────────────
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateVideoThumbnail(file) {
  return new Promise(resolve => {
    const url   = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted       = true;
    video.playsInline = true;
    video.preload     = 'auto';
    video.src         = url;

    video.addEventListener('seeked', () => {
      try {
        const canvas  = document.createElement('canvas');
        canvas.width  = video.videoWidth  || 320;
        canvas.height = video.videoHeight || 240;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (e) {
        console.warn('Canvas capture failed:', e);
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    }, { once: true });

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(0.5, video.duration || 0.1);
    }, { once: true });

    video.addEventListener('error', () => { URL.revokeObjectURL(url); resolve(null); }, { once: true });
    setTimeout(() => { URL.revokeObjectURL(url); resolve(null); }, 8000);
  });
}

// ── Init ──────────────────────────────────────────────────────
document.getElementById('entryDate').value = new Date().toISOString().split('T')[0];
renderGallery();