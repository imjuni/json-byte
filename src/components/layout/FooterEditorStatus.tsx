import { useEditorStore } from '#/stores/editorStore';

export const FooterEditorStatus = () => {
  const { language } = useEditorStore();
  return (
    <div>
      <div className="flex gap-2">
        <span>{`{}`}</span>
        <span className="font-bold">{language.toUpperCase()}</span>
      </div>
    </div>
  );
};
