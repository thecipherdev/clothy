import { useFieldContext } from './hooks'
import { FormBase } from './FormBase'
import type { FormBaseProps } from './FormBase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Items = {
  id: string
  name: string
}

type Props = {
  items: Array<Items>
  formBaseProps: FormBaseProps
  placeholder: string
}

export function FormSelect({ formBaseProps, items, placeholder }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...formBaseProps}>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger aria-invalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormBase>
  )
}
