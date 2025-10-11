export interface INotificationValue {
  open: boolean;
  title: string;
  description: string;
  autoClose?: number;
  kind: 'danger' | 'success' | 'info';
}

export interface INotificationAction {
  setOpen: (open: boolean) => void;
  setTitle: (title: string) => void;
  setAutoClose: (autoClose?: number) => void;
  setDescription: (description: string) => void;
  setKind: (kind: INotificationValue['kind']) => void;
  setNotification: (notification: INotificationValue) => void;
}

export type TNotificationStore = INotificationValue & INotificationAction;
