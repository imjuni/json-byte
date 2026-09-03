import { useCallback, useState } from 'react';

import { useIntl } from 'react-intl';

import { useImportStore } from '#/stores/importStore';

import type { TImportStore } from '#/contracts/editors/TImportStore';

export function useImportProgressHookBuilder() {
  const intl = useIntl();
  const { setIsUploading, setIsFetching } = useImportStore();
  const [fileUploadButtonTitle, setFileUploadButtonTitle] = useState<string>(
    intl.$t({ id: 'graph.import-dialog.file-upload' }),
  );
  const [apiFetchButtonTitle, setApiFetchButtonTitle] = useState<string>(
    intl.$t({ id: 'graph.import-dialog.api-fetch' }),
  );

  const handleUploadProgress = useCallback(
    (isUploadingValue: TImportStore['isUploading']) => {
      switch (isUploadingValue) {
        case 'upload-complete':
          setIsUploading('upload-complete');
          setFileUploadButtonTitle(intl.$t({ id: 'graph.import-dialog.file-uploaded' }));
          break;
        case 'upload-fail':
          setIsUploading('upload-fail');
          setFileUploadButtonTitle(intl.$t({ id: 'graph.import-dialog.file-upload' }));
          break;
        case 'uploading':
          setIsUploading('uploading');
          setFileUploadButtonTitle(intl.$t({ id: 'graph.import-dialog.file-uploading' }));
          break;
        default:
          setIsUploading('non-dirty');
          setFileUploadButtonTitle(intl.$t({ id: 'graph.import-dialog.file-upload' }));
      }
    },
    [intl, setIsUploading, setFileUploadButtonTitle],
  );

  const handleFetchProgress = useCallback(
    (isUploadingValue: TImportStore['isFetching']) => {
      switch (isUploadingValue) {
        case 'fetch-complete':
          setIsFetching('fetch-complete');
          setApiFetchButtonTitle(intl.$t({ id: 'graph.import-dialog.api-fetched' }));
          break;
        case 'fetch-fail':
          setIsFetching('fetch-fail');
          setApiFetchButtonTitle(intl.$t({ id: 'graph.import-dialog.api-fetch' }));
          break;
        case 'fetching':
          setIsFetching('fetching');
          setApiFetchButtonTitle(intl.$t({ id: 'graph.import-dialog.api-fetching' }));
          break;
        default:
          setIsFetching('non-dirty');
          setApiFetchButtonTitle(intl.$t({ id: 'graph.import-dialog.api-fetch' }));
      }
    },
    [intl, setIsFetching, setApiFetchButtonTitle],
  );

  return {
    fileUploadButtonTitle,
    apiFetchButtonTitle,
    handleUploadProgress,
    handleFetchProgress,
  };
}
