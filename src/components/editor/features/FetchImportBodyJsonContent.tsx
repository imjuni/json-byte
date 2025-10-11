import { Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Textarea } from '#/components/ui/textarea';

import type { UseFormReturn } from 'react-hook-form';

import type { TApiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';

export const FetchImportBodyJsonContent = ({ form }: { form: UseFormReturn<TApiFetchFormSchema> }) => {
  const intl = useIntl();

  return (
    <Controller
      control={form.control}
      name="body"
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor="body-input">Body</FieldLabel>
          <Textarea
            {...field}
            className="min-h-[8rem] max-h-[12rem] font-mono text-sm"
            id="body-input"
            placeholder='{"key": "value"}'
          />
          <div className="text-xs text-muted-foreground">{field.value?.length ?? 0} / 10000 characters</div>
          {fieldState.invalid && fieldState.error?.message ? (
            <FieldError
              errors={[
                {
                  message: intl.$t({ id: fieldState.error.message }),
                },
              ]}
            />
          ) : null}
        </Field>
      )}
    />
  );
};
