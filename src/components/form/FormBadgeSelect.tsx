import { useFieldContext } from "./hooks";
import { FormBase, FormBaseProps } from './FormBase';
import { Badge } from '@/components/ui/badge';

type Props = FormBaseProps & { items: string[], onClick: (i: string) => void }

export function FormBadgeSelect({
  items,
  onClick,
  ...props
}: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;


  return (
    <FormBase {...props}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant={field.state.value.includes(item) ? 'default' : 'outline'}
            className="cursor-pointer"
            aria-invalid={isInvalid}
            onClick={() => onClick(item)}
          >
            {item}
          </Badge>
        ))}
      </div>
    </FormBase>
  )
}
