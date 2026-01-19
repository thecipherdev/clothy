import { useFieldContext } from './hooks';
import { FormBase, FormBaseProps } from './FormBase';
import { Textarea } from '@/components/ui/textarea';

export function FormTextarea(props: FormBaseProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Textarea
        name={field.name}
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        aria-invalid={isInvalid}
        rows={3}
      />
    </FormBase>
  )
}
