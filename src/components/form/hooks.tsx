import {
  createFormHook,
  createFormHookContexts,
} from '@tanstack/react-form-start'
import { FormInput } from './FormInput'
import { FormSelect } from './FormSelect'
import { FormTextarea } from './FormTextarea'
import { FormBadgeSelect } from './FormBadgeSelect'
import { FormSwitch } from './FormSwitch'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input: FormInput,
    Select: FormSelect,
    Textarea: FormTextarea,
    BadgeSelect: FormBadgeSelect,
    Switch: FormSwitch,
  },
  formComponents: {},
})

export { useAppForm }
