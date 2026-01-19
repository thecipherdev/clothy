import { useFieldContext } from "./hooks";
import { FormBase, FormBaseProps } from "./FormBase";
import { Switch } from "@/components/ui/switch";


export function FormSwitch(props: FormBaseProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Switch
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
      />
    </FormBase>
  )
}
