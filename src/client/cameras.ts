import { Elements } from './elements.js';
import { normalizeMac } from './recovery.js';
import { animateHeight } from './ui.js';

export interface Camera {
  ip: string;
  stream: string;
  name: string;
  mac: string;
  lastSeenIp: string;
  lastMacCheckAt: string;
}

export let cameras: Camera[] = [];

export function normalizeCameraData(cam: any = {}): Camera {
  if (typeof cam === 'string') {
    return { ip: cam, stream: '', name: '', mac: '', lastSeenIp: '', lastMacCheckAt: '' };
  }
  return {
    ip: typeof (cam as any).ip === 'string' ? (cam as any).ip : '',
    stream: typeof (cam as any).stream === 'string' ? (cam as any).stream : '',
    name: typeof (cam as any).name === 'string' ? (cam as any).name : '',
    mac: normalizeMac((cam as any).mac || ''),
    lastSeenIp: typeof (cam as any).lastSeenIp === 'string' ? (cam as any).lastSeenIp : '',
    lastMacCheckAt: typeof (cam as any).lastMacCheckAt === 'string' ? (cam as any).lastMacCheckAt : ''
  };
}

export function loadCameras(initialCameras: any[]) {
  cameras = initialCameras.map(normalizeCameraData);
  renderCameraTable();
}

export function addCamera() {
  cameras.push(normalizeCameraData({ip: '', name: ''}));
  renderCameraTable();
  renderCameras();
}

export function addDammy() {
  cameras.push(normalizeCameraData({ip: 'dammy', name: ''}));
  renderCameraTable();
  renderCameras();
}

export function onInputChange(rowIdx: number, field: keyof Camera, value: any) {
  if (cameras[rowIdx]) {
    (cameras[rowIdx] as any)[field] = value;
  }
}

export function deleteRow(idx: number) {
  cameras.splice(idx, 1);
  renderCameraTable();
  renderCameras();
}

export function reorderRows(newOrderArray: Camera[]) {
  cameras = newOrderArray;
  renderCameraTable();
  renderCameras();
}

export function rowHTML(isDammy: boolean, ip = '', stream = '', name = ''){
  if(isDammy) return `
    <td class="p-2 text-center handle cursor-grab"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="grip-vertical" class="lucide lucide-grip-vertical w-4 h-4"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></td>
    <td colspan="2" class="p-2"><input disabled class="dynamic-input w-full rounded-xl px-3 py-2 text-center" value="— Пустой слот —"></td>
    <td class="p-2 border-l border-[rgb(var(--white)/0.1)]"><input disabled class="dynamic-input w-full rounded-xl px-3 py-2 text-center"></td>
    <td class="p-2 text-center animate-pulse-slow"><button class="remove-camera-btn rounded-xl p-2 htext-[rgb(var(--stickyHeader-rgb))] hover:text-[rgb(var(--tetrad1-light-rgb))] transition active:scale-90" aria-label="Удалить">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trash-2" class="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button></td>`;
  return `
    <td class="p-2 text-center handle cursor-grab"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="grip-vertical" class="lucide lucide-grip-vertical w-4 h-4"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg></td>
    <td class="ip-cell p-2 text-right"><input maxlength="22" class="dynamic-input w-[15ch] rounded-xl bg-transparent px-3 py-2 text-right" type="text" value="${ip||''}" placeholder="IP / URL"></td>
    <td class="p-2"><div class="relative group"><input class="peer dynamic-input stream-input w-full rounded-xl bg-transparent px-3 py-2 pr-10" type="text" value="${stream||''}" placeholder=":8080/?action=stream"><button type="button" class="stream-toggle absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-[rgb(var(--tetrad1-light-rgb)/0.1)] text-[rgb(var(--stickyHeader-rgb))] hover:bg-[rgb(var(--tetrad2-dark-rgb)/0.8)] hover:text-[rgb(var(--white))] transition opacity-0 pointer-events-none peer-focus:opacity-100 peer-focus:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto" aria-label="Переключить stream"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shuffle" class="lucide lucide-shuffle w-4 h-4"><path d="m18 14 4 4-4 4"></path><path d="m18 2 4 4-4 4"></path><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"></path><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"></path><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"></path></svg></button></div></td>
    <td class="p-2 border-l border-[rgb(var(--white)/0.1)]"><input class="dynamic-input w-full rounded-xl bg-transparent px-3 py-2" type="text" value="${name||''}" placeholder="Название"></td>
    <td class="p-2 text-center"><button class="remove-camera-btn rounded-xl p-2 text-[rgb(var(--stickyHeader-rgb))] hover:text-[rgb(var(--tetrad1-light-rgb))] transition active:scale-90" aria-label="Удалить"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trash-2" class="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg></button></td>`;
}

export function renderCameraTable(camArr = cameras) {
  if (!Elements.tbody) return;
  Elements.tbody.innerHTML = '';
  camArr.forEach((cam, idx) => {
    const { ip, name, stream } = normalizeCameraData(cam);
    const tr = document.createElement('tr');
    tr.className = 'group animate-row-in3d' + (ip === 'dammy' ? ' dammy-slot' : '');
    tr.innerHTML = rowHTML(ip === 'dammy', ip, stream, name);

    if (typeof (window as any).lucide !== 'undefined') (window as any).lucide.createIcons();
    enableDrag(tr);
    initInputs(tr.querySelectorAll('.dynamic-input'));
    initStreamToggle(tr.querySelector('.stream-toggle') as HTMLElement);

    Elements.tbody!.appendChild(tr);
  });
}

function enableDrag(row: HTMLElement){
  const h = row.querySelector('.handle') as HTMLElement;
  if (!h) return;
  h.draggable = true;
  h.addEventListener('dragstart', e => {
    row.classList.add('draggingSet');
    if (Elements.indicator) {
        Elements.indicator.style.opacity = '1';
        Elements.indicator.style.transform = 'scaleX(1)';
    }
    const img = new Image();
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8/5+hHgAHggJ/lBcMtQAAAABJRU5ErkJggg==';
    (e as DragEvent).dataTransfer!.setDragImage(img, 0, 0);
  });
  h.addEventListener('dragend', () => {
    row.classList.remove('draggingSet');
    if (Elements.indicator) {
        Elements.indicator.style.opacity = '0';
        Elements.indicator.style.transform = 'scaleX(.6)';
    }
  });
}

function initInputs(list: NodeListOf<Element>) {
  list.forEach(i => {
    const input = i as HTMLInputElement;
    updateEmpty(input);
    input.addEventListener('focus', e => {
      const target = e.target as HTMLElement;
      const r = target.getBoundingClientRect();
      input.style.setProperty('--ix', (( (e as any).clientX - r.left) / r.width * 100).toFixed(0) + '%'); 
      input.style.setProperty('--iy', (( (e as any).clientY - r.top) / r.height * 100).toFixed(0) + '%');
      input.classList.add('is-focused');
    });
    input.addEventListener('blur', () => {
      input.classList.remove('is-focused');
    });
    input.addEventListener('input', () => {
      updateEmpty(input);
      const row = input.closest('tr');
      const idx = row ? Array.from(row.parentElement?.children || []).indexOf(row) : -1;
      if (row && idx !== -1 && cameras[idx]) {
        const cam = cameras[idx];
        if (input.classList.contains('stream-input')) cam.stream = input.value.trim();
        else if (input.closest('.ip-cell')) cam.ip = input.value.trim();
        else cam.name = input.value.trim();
      }
    });
  });
}

function updateEmpty(i: HTMLInputElement) {
  const td = i.closest('.ip-cell');
  if(td)td.classList.toggle('is-empty', !i.value.trim());
}

function initStreamToggle(btn: HTMLElement | null) {
  if (!btn) return;
  const input = btn.previousElementSibling as HTMLInputElement;
  const ORIGINAL = ':8080/?action=stream';
  const ALT = ':8080/stream';
  btn.addEventListener('click',() => {
    const c = input.value.trim();
    input.value = !c || c.endsWith(ALT) ? ORIGINAL : ALT;
    input.focus();
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  });
}

export function renderCameras() {
    // This function is usually defined in app.ts to handle the actual rendering of camera boxes
    // I'll leave it as a stub or move the logic here if I can.
}

// === DRAG AND DROP HELPER FUNCTIONS ===
export function recordPos(): Map<HTMLElement, number> {
  const m = new Map<HTMLElement, number>();
  const tbody = document.getElementById('cameraTableBody');
  if (!tbody) return m;
  
  tbody.querySelectorAll('tr').forEach(r => {
    m.set(r as HTMLElement, r.getBoundingClientRect().top);
  });
  return m;
}

export function playFLIP(prev: Map<HTMLElement, number>) {
  const tbody = document.getElementById('cameraTableBody');
  if (!tbody) return;
  
  tbody.querySelectorAll('tr').forEach(r => {
    const dy = prev.get(r as HTMLElement)! - r.getBoundingClientRect().top;
    if (dy) {
      (r as HTMLElement).style.transform = `translateY(${dy}px)`;
      (r as HTMLElement).style.transition = 'transform .3s cubic-bezier(.4,0,.2,1)';
      requestAnimationFrame(() => (r as HTMLElement).style.transform = '');
      r.addEventListener('transitionend', () => (r as HTMLElement).style.transition = '', { once: true });
    }
  });
}

export function addRow(isDammy: boolean) {
  // Import cameras from state or pass as parameter
  const { normalizeCameraData } = require('./cameras.js');
  const camData = isDammy 
    ? { ip: 'dammy', stream: '', name: '' } 
    : { ip: '', stream: '', name: '' };
  
  // This needs to be handled in app.ts where cameras array is accessible
  console.warn('addRow should be called from app.ts with cameras array');
}

export function updateEmpty(input: HTMLInputElement) {
  const td = input.closest('.ip-cell');
  if (td) td.classList.toggle('is-empty', !input.value.trim());
}

export function convertToDammy(row: HTMLElement) {
  // This needs cameras array access - should be handled in app.ts
  const idx = row.parentElement ? Array.from(row.parentElement.children).indexOf(row) : -1;
  console.warn('convertToDammy should be called from app.ts with cameras array');
}

// === ACCORDION FUNCTIONS ===
export function initAccordion() {
  document.querySelectorAll('.accordion').forEach((acc) => {
    const btn = acc.querySelector('.accordion-toggle');
    const content = acc.querySelector('.accordion-content');

    if (!btn || !content) return;

    content.style.maxHeight = '0';

    btn.addEventListener('click', (event) => {
      // Ignore clicks on custom checkbox
      if ((event.target as HTMLElement).closest('.custom-checkbox-container')) return;

      const isOpen = acc.classList.contains('accordion-open');

      if (isOpen) {
        closeAccordion(acc);
        updateAccordionCheckboxState(acc, false);
      } else {
        // Close other accordions
        document.querySelectorAll('.accordion.accordion-open').forEach(openAcc => {
          closeAccordion(openAcc);
          updateAccordionCheckboxState(openAcc, false);
        });

        // Open current
        acc.classList.add('accordion-open');
        content.style.display = 'block';
        const h = content.scrollHeight + 30;
        content.style.maxHeight = '0';
        setTimeout(() => {
          content.style.maxHeight = h + 'px';
          content.style.opacity = '1';
        }, 10);

        updateAccordionCheckboxState(acc, true);
      }
    });
  });
}

export function closeAccordion(acc: HTMLElement) {
  const content = acc.querySelector('.accordion-content') as HTMLElement;
  if (!content) return;
  
  acc.classList.remove('accordion-open');
  content.style.maxHeight = '0';
  content.style.opacity = '0';
  setTimeout(() => {
    content.style.display = 'none';
  }, 400);
}

export function updateAccordionCheckboxState(acc: HTMLElement, isChecked: boolean) {
  const checkbox = acc.querySelector('.accordion-checkbox') as HTMLInputElement;
  if (checkbox) {
    checkbox.checked = isChecked;
  }
}
