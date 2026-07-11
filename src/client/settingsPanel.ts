import { Elements } from './elements.js';
import type { AppElements } from './elements.js';

export type Cleanup = () => void;

export interface SettingsPanelController {
  open(): void;
  close(): void;
  setAccordionsDisabled(disabled: boolean): void;
  cleanup: Cleanup;
}

interface AccordionState {
  accordion: HTMLElement;
  content: HTMLElement;
  checkbox: HTMLInputElement | null;
  wasOpen: boolean;
}

function getAccordions(document: Document): AccordionState[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.accordion')).flatMap(accordion => {
    const content = accordion.querySelector<HTMLElement>('.accordion-content');
    if (!content) return [];
    return [{
      accordion,
      content,
      checkbox: accordion.querySelector<HTMLInputElement>('.accordion-checkbox'),
      wasOpen: false
    }];
  });
}

function setAccordionOpen(state: AccordionState, open: boolean): void {
  state.accordion.classList.toggle('accordion-open', open);
  state.checkbox && (state.checkbox.checked = open);
  if (!open) {
    state.content.style.maxHeight = '0px';
    state.content.style.opacity = '0';
    setTimeout(() => {
      if (!state.accordion.classList.contains('accordion-open')) {
        state.content.style.display = 'none';
      }
    }, 400);
    return;
  }

  state.content.style.display = 'block';
  state.content.style.maxHeight = '0px';
  requestAnimationFrame(() => {
    state.content.style.maxHeight = `${state.content.scrollHeight + 30}px`;
    state.content.style.opacity = '1';
  });
}

export function initializeSettingsPanel(
  elements: AppElements = Elements
): SettingsPanelController | null {
  const { settingsPanel, overlay, openSettingsBtn, closeSettingsBtn } = elements;
  if (!settingsPanel || !overlay || !openSettingsBtn || !closeSettingsBtn) return null;

  const document = settingsPanel.ownerDocument;
  const accordions = getAccordions(document);
  const cleanups: Cleanup[] = [];
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const isOpen = (): boolean => settingsPanel.style.display !== 'none';

  const setAccordionsDisabled = (disabled: boolean): void => {
    accordions.forEach(state => {
      if (disabled) {
        state.wasOpen = state.accordion.classList.contains('accordion-open');
        state.accordion.classList.add('accordion-disabled');
        setAccordionOpen(state, false);
        return;
      }

      state.accordion.classList.remove('accordion-disabled');
      if (state.wasOpen) setAccordionOpen(state, true);
      state.wasOpen = false;
    });
  };

  const showPanel = (): void => {
    settingsPanel.style.display = 'block';
    settingsPanel.classList.remove('panel-appear-active');
    settingsPanel.classList.add('panel-appear');

    const items = settingsPanel.querySelectorAll<HTMLElement>('.accordion, #importExportBtnBlock');
    items.forEach(item => {
      item.classList.remove('active');
      item.style.opacity = '0';
      item.style.transform = 'translateZ(30px)';
    });
    void settingsPanel.offsetWidth;
    overlay.style.pointerEvents = 'auto';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.transition =
      'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      settingsPanel.classList.add('panel-appear-active');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('active');
          item.style.opacity = '1';
          item.style.transform = 'translateZ(0)';
        }, 200 + index * 100);
      });
    });
  };

  const open = (): void => {
    if (openTimer !== null) clearTimeout(openTimer);
    accordions.forEach(state => setAccordionOpen(state, false));
    openTimer = setTimeout(showPanel, 400);
  };

  const close = (): void => {
    if (!isOpen()) return;
    if (closeTimer !== null) clearTimeout(closeTimer);
    const items = settingsPanel.querySelectorAll<HTMLElement>('.fade-slide-in');
    items.forEach(item => {
      item.classList.remove('active');
      item.style.opacity = '0';
      item.style.transform = 'translateZ(30px)';
    });
    closeTimer = setTimeout(() => {
      settingsPanel.classList.remove('panel-appear-active');
      settingsPanel.style.display = 'none';
      settingsPanel.classList.remove('panel-appear');
      items.forEach(item => {
        item.style.opacity = '';
        item.style.transform = '';
      });
      overlay.style.opacity = '0';
      overlay.style.backdropFilter = 'blur(0px)';
      overlay.style.pointerEvents = 'none';
      openSettingsBtn.focus();
    }, 300);
  };

  const onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && isOpen()) close();
  };

  openSettingsBtn.addEventListener('click', open);
  closeSettingsBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  settingsPanel.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('keydown', onDocumentKeydown);
  cleanups.push(() => openSettingsBtn.removeEventListener('click', open));
  cleanups.push(() => closeSettingsBtn.removeEventListener('click', close));
  cleanups.push(() => overlay.removeEventListener('click', close));
  cleanups.push(() => document.removeEventListener('keydown', onDocumentKeydown));

  accordions.forEach(state => {
    const toggle = state.accordion.querySelector<HTMLElement>('.accordion-toggle');
    if (!toggle) return;
    state.content.style.maxHeight = '0px';
    const onToggle = (event: MouseEvent): void => {
      const target = event.target;
      if (target instanceof Element && target.closest('.custom-checkbox-container')) return;
      if (state.accordion.classList.contains('accordion-disabled')) return;
      const willOpen = !state.accordion.classList.contains('accordion-open');
      if (willOpen) {
        accordions.forEach(other => {
          if (other !== state) setAccordionOpen(other, false);
        });
      }
      setAccordionOpen(state, willOpen);
    };
    toggle.addEventListener('click', onToggle);
    cleanups.push(() => toggle.removeEventListener('click', onToggle));

    if (state.checkbox) {
      const onCheckboxClick = (event: MouseEvent): void => {
        event.preventDefault();
        toggle.click();
      };
      state.checkbox.addEventListener('click', onCheckboxClick);
      cleanups.push(() => state.checkbox?.removeEventListener('click', onCheckboxClick));
    }
  });

  document.querySelectorAll<HTMLElement>('.panel-item').forEach(item => {
    const onEnter = (): void => {
      item.style.transform = 'translateZ(50px)';
    };
    const onLeave = (): void => {
      item.style.transform = 'translateZ(0)';
    };
    item.addEventListener('mouseenter', onEnter);
    item.addEventListener('mouseleave', onLeave);
    cleanups.push(() => item.removeEventListener('mouseenter', onEnter));
    cleanups.push(() => item.removeEventListener('mouseleave', onLeave));
  });

  return {
    open,
    close,
    setAccordionsDisabled,
    cleanup: () => {
      if (openTimer !== null) clearTimeout(openTimer);
      if (closeTimer !== null) clearTimeout(closeTimer);
      cleanups.forEach(cleanup => cleanup());
    }
  };
}
