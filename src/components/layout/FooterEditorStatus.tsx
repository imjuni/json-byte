import { useEditorStore } from '#/stores/editorStore';
import { useThemeStore } from '#/stores/themeStore';

interface IFooterThemeStatusProps {
  compact: boolean;
}

export const FooterThemeStatus = ({ compact }: IFooterThemeStatusProps) => {
  const theme = useThemeStore((state) => state.theme);

  if (compact) {
    return <span className="font-bold">{theme}</span>;
  }

  return (
    <div className="flex gap-2">
      <span>Theme: </span>
      <span className="font-bold">{theme}</span>
    </div>
  );
};

export const FooterEditorStatus = () => {
  const { language, indent } = useEditorStore();

  return (
    <>
      <div className="hidden gap-6 md:flex">
        <div className="flex gap-2">
          <span>{`{}`}</span>
          <span className="font-bold">{language.toUpperCase()}</span>
        </div>

        <div className="flex gap-2">
          <span>Spaces: </span>
          <span className="font-bold">{indent}</span>
        </div>

        <FooterThemeStatus compact={false} />
      </div>

      <div className="flex gap-1 md:hidden">
        <span className="font-bold">
          {language.toUpperCase()}
          {' / '}
        </span>
        <span className="font-bold">
          {indent}
          {' / '}
        </span>
        <FooterThemeStatus compact />
      </div>
    </>
  );
};
