import { useCallback } from 'react';

import { useEditorStore } from '#/stores/editorStore';

import type { TEditorLanguage } from '#/contracts/editors/IEditorStore';

export function useEditorConfiger() {
  const { editorInstance, monacoInstance } = useEditorStore();

  const handleChangeEditorLanguage = useCallback(
    (language: TEditorLanguage) => {
      if (editorInstance == null || monacoInstance == null) {
        return;
      }

      const model = editorInstance.getModel();

      if (model != null) {
        const monacoLanguage = language;

        // Update the model's language using monacoInstance
        monacoInstance.editor.setModelLanguage(model, monacoLanguage);

        // Configure JSON language options if switching to jsonc
        if (language === 'json') {
          monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: true,
            trailingCommas: 'ignore',
            schemas: [],
            enableSchemaRequest: false,
          });
        }
      }
    },
    [editorInstance, monacoInstance],
  );

  return {
    handleChangeEditorLanguage,
  };
}
