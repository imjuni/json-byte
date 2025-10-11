import { useEffect, useState } from 'react';

import clsx from 'clsx';
import { Check, Info, TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { useNotificationStore } from '#/stores/notificationStore';

export const Notification = () => {
  const { open, title, description, kind, autoClose, setOpen, setAutoClose } = useNotificationStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (open && autoClose != null && autoClose > 0) {
      setRemainingTime(autoClose);

      const handle = setInterval(() => {
        setRemainingTime((prev) => {
          const next = prev - 1000;

          if (next <= 0) {
            setTimeout(() => {
              setOpen(false);
            }, 10);

            return 0;
          }
          return next;
        });
      }, 1000);

      return () => {
        clearInterval(handle);
        setRemainingTime(0);
        setAutoClose();
      };
    }

    return undefined;
  }, [open, autoClose, setAutoClose, setOpen]);

  return (
    <Alert
      variant="default"
      className={clsx(
        'fixed mt-12 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[40rem] transition-all duration-300 p-0',
        {
          'scale-0 opacity-0': !open,
          'scale-100 opacity-100 animate-in zoom-in-95': open,
        },
      )}
    >
      <div className="flex w-[40rem] px-4 py-2 gap-2 flex-row">
        <div
          className={clsx('flex flex-1 justify-center items-center', {
            'text-blue-800': kind === 'info',
            'dark:text-blue-500': kind === 'info',
            'text-green-600': kind === 'success',
            'dark:text-green-700': kind === 'success',
            'text-red-600': kind === 'danger',
            'dark:text-red-400': kind === 'danger',
          })}
        >
          {kind === 'danger' && <TriangleAlert />}
          {kind === 'info' && <Info />}
          {kind === 'success' && <Check />}
        </div>

        <div className="flex flex-12">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2">
              <div className={clsx('flex flex-1', { hidden: autoClose == null })}>
                <div
                  className={clsx('flex w-5 h-5 justify-center items-center rounded-md text-gray-300', {
                    'bg-blue-800': kind === 'info',
                    'dark:bg-blue-500': kind === 'info',
                    'bg-green-600': kind === 'success',
                    'dark:bg-green-700': kind === 'success',
                    'bg-red-600': kind === 'danger',
                    'dark:bg-red-400': kind === 'danger',
                  })}
                >
                  <span>{Math.ceil(remainingTime / 1000)}</span>
                </div>
              </div>
              <div className="flex flex-12">
                <AlertTitle
                  className={clsx('font-bold', {
                    'text-blue-800': kind === 'info',
                    'dark:text-blue-500': kind === 'info',
                    'text-green-600': kind === 'success',
                    'dark:text-green-700': kind === 'success',
                    'text-red-600': kind === 'danger',
                    'dark:text-red-400': kind === 'danger',
                  })}
                >
                  {title}
                </AlertTitle>
              </div>
            </div>
            <AlertDescription className="text-gray-500 dark:text-gray-400">{description}</AlertDescription>
          </div>
        </div>
      </div>
    </Alert>
  );
};
