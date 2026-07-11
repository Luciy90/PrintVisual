import type { Camera } from './cameras.js';

export type Cleanup = () => void;

export function reorderCameraList<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const reordered = [...items];
  const [moved] = reordered.splice(fromIndex, 1);
  if (moved === undefined) return reordered;
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

export function initializeCameraDragAndDrop(options: {
  container: HTMLElement;
  getCameras(): readonly Camera[];
  setCameras(cameras: Camera[]): void;
  onReordered(): void;
}): Cleanup {
  let dragged: HTMLElement | null = null;

  const onDragStart = (event: DragEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches('.camera-box')) return;
    dragged = target;
    target.classList.add('dragging');
    event.dataTransfer?.setData('text/plain', target.dataset.ip ?? '');
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (event: DragEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const camera = target.closest<HTMLElement>('.camera-box');
    if (!camera || !dragged || camera === dragged) return;
    event.preventDefault();
    camera.classList.add('drag-over');
  };

  const onDragLeave = (event: DragEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    target.closest<HTMLElement>('.camera-box')?.classList.remove('drag-over');
  };

  const onDrop = (event: DragEvent): void => {
    const target = event.target;
    if (!(target instanceof Element) || !dragged) return;
    const destination = target.closest<HTMLElement>('.camera-box');
    if (!destination || destination === dragged) return;
    event.preventDefault();
    destination.classList.remove('drag-over');

    const cards = Array.from(options.container.querySelectorAll<HTMLElement>('.camera-box'));
    const fromIndex = cards.indexOf(dragged);
    const toIndex = cards.indexOf(destination);
    const next = reorderCameraList(options.getCameras(), fromIndex, toIndex);
    options.container.insertBefore(dragged, destination);
    options.setCameras(next);
    options.onReordered();
  };

  const onDragEnd = (): void => {
    dragged?.classList.remove('dragging');
    options.container
      .querySelectorAll<HTMLElement>('.camera-box.drag-over')
      .forEach(card => card.classList.remove('drag-over'));
    dragged = null;
  };

  options.container.addEventListener('dragstart', onDragStart);
  options.container.addEventListener('dragover', onDragOver);
  options.container.addEventListener('dragleave', onDragLeave);
  options.container.addEventListener('drop', onDrop);
  options.container.addEventListener('dragend', onDragEnd);

  return () => {
    options.container.removeEventListener('dragstart', onDragStart);
    options.container.removeEventListener('dragover', onDragOver);
    options.container.removeEventListener('dragleave', onDragLeave);
    options.container.removeEventListener('drop', onDrop);
    options.container.removeEventListener('dragend', onDragEnd);
  };
}
