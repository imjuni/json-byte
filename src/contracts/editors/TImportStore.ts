export interface IImportStoreValue {
  open: boolean;
  error?: Error;
  file?: File;
  isUploading: 'non-dirty' | 'uploading' | 'upload-complete' | 'upload-fail';
}

export interface IImportStoreAction {
  setOpen: (open: boolean) => void;
  setIsUploading: (isUploading: IImportStoreValue['isUploading']) => void;
  setError: (error?: Error) => void;
  setFile: (file?: File) => void;
  reset: () => void;
}

export type TImportStore = IImportStoreValue & IImportStoreAction;
