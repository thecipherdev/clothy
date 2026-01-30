import { useFieldContext } from './hooks'
import { FormBase } from './FormBase'
import type { FormBaseProps } from './FormBase';
import { Badge } from '@/components/ui/badge'

type Props = FormBaseProps & { items: Array<string>; handleClick: (i: string) => void }

export function FormBadgeSelect({ items, handleClick, ...props }: Props) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant={field.state.value.includes(item) ? 'default' : 'outline'}
            className="cursor-pointer"
            aria-invalid={isInvalid}
            onClick={() => handleClick(item)}
          >
            {item}
          </Badge>
        ))}
      </div>
    </FormBase>
  )
}
