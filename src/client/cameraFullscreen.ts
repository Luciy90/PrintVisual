export type Cleanup = () => void;

export interface CameraFullscreenController {
  enter(camera: HTMLElement): Promise<void>;
  exit(): Promise<void>;
  cleanup: Cleanup;
}

export function initializeCameraFullscreen(options: {
  document: Document;
  onExited?(): void;
  onError?(message: string): void;
}): CameraFullscreenController {
  let activeCamera: HTMLElement | null = null;

  const onFullscreenChange = (): void => {
    if (options.document.fullscreenElement) return;
    activeCamera?.classList.remove('fullscreen');
    activeCamera = null;
    options.onExited?.();
  };
  options.document.addEventListener('fullscreenchange', onFullscreenChange);

  const enter = async (camera: HTMLElement): Promise<void> => {
    try {
      camera.classList.add('fullscreen');
      await camera.requestFullscreen();
      activeCamera = camera;
    } catch {
      camera.classList.remove('fullscreen');
      options.onError?.('Не удалось войти в полноэкранный режим.');
    }
  };

  const exit = async (): Promise<void> => {
    if (!options.document.fullscreenElement) return;
    await options.document.exitFullscreen();
  };

  return {
    enter,
    exit,
    cleanup: () => options.document.removeEventListener('fullscreenchange', onFullscreenChange)
  };
}
