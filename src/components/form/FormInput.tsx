import { Input } from "@/components/ui/input"
import { FormBase, FormBaseProps } from "./FormBase";
import { useFieldContext } from "./hooks"


type Props = {
  formBaseProps: FormBaseProps
} & React.ComponentProps<"input">


export function FormInput({ formBaseProps, ...props }: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...formBaseProps}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        aria-invalid={isInvalid}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
    </FormBase>
  )
}
