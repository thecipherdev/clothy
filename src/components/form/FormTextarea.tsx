import { useFieldContext } from './hooks'
import { FormBase } from './FormBase'
import type { FormBaseProps } from './FormBase'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  formBaseProps: FormBaseProps
} & React.ComponentProps<'textarea'>

export function FormTextarea({ formBaseProps, ...props }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...formBaseProps}>
      <Textarea
        name={field.name}
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        aria-invalid={isInvalid}
        rows={3}
        {...props}
      />
    </FormBase>
  )
}
