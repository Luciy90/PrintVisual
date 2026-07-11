export interface AppState {
  floatingToolbar: HTMLElement | null;
  allowLocalStorage: boolean;
  ipRecoveryBusy: boolean;
  disableAllStreamsBusy: boolean;
}

export interface PositionUpdateTask {
  notification: HTMLElement;
  top: number;
}

export const State: AppState = {
  floatingToolbar: null,
  allowLocalStorage: false,
  ipRecoveryBusy: false,
  disableAllStreamsBusy: false
};

export let suppressNotifications = false;
export let pendingRestores = 0;

export const TaskState = {
  positionUpdateQueue: [] as PositionUpdateTask[],
  isProcessingQueue: false,
  notificationHeight: 48,
  POSITION_UPDATE_DELAY: 100
};