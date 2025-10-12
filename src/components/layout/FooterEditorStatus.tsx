import { useEditorStore } from '#/stores/editorStore';

export const FooterEditorStatus = () => {
  const { language, indent, theme } = useEditorStore();
  return (
    <div className="flex gap-6">
      <div className="flex gap-2">
        <span>{`{}`}</span>
        <span className="font-bold">{language.toUpperCase()}</span>
      </div>

      <div className="flex gap-2">
        <span>Spaces: </span>
        <span className="font-bold">{indent}</span>
      </div>

      <div className="flex gap-2">
        <span>Theme: </span>
        <span className="font-bold">{theme}</span>
      </div>
    </div>
  );
};
