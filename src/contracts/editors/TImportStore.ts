import type { Method } from 'axios';

export interface IHeader {
  key: string;
  value: string;
}

export interface IImportStoreValue {
  open: boolean;
  error?: Error;
  file?: File;
  url?: string;
  isUploading: 'non-dirty' | 'uploading' | 'upload-complete' | 'upload-fail';

  method: Method | 'search' | 'SEARCH';
  isFetching: 'non-dirty' | 'fetching' | 'fetch-complete' | 'fetch-fail';
  headers: IHeader[];
}

export interface IImportStoreAction {
  setOpen: (open: boolean) => void;
  setIsUploading: (isUploading: IImportStoreValue['isUploading']) => void;
  setIsFetching: (isFetching: IImportStoreValue['isFetching']) => void;
  setError: (error?: Error) => void;
  setFile: (file?: File) => void;
  setUrl: (url?: string) => void;
  setMethod: (method: IImportStoreValue['method']) => void;
  addHeader: (header: IHeader) => void;
  updateHeader: (index: number, header: IHeader) => void;
  removeHeader: (index: number) => void;
  reset: () => void;
}

export type TImportStore = IImportStoreValue & IImportStoreAction;
