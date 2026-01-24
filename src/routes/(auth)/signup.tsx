import { Link, createFileRoute, useNavigate  } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'
import { Package } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppForm } from '@/components/form/hooks'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
})

const formSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  password: z.string().min(6, {
    error: (iss) => {
      return `Password must have ${iss.minimum} characters or more`
    },
  }),
})

type FormData = z.infer<typeof formSchema>

function RouteComponent() {
  const form = useAppForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    } satisfies FormData as FormData,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true)

      const { error } = await signUp(
        value.email,
        value.password,
        value.fullName,
      )

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created successfully!')
        navigate({
          to: '/dashboard',
        })
      }

      setLoading(false)
    },
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Package className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Get started with your inventory system
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <CardContent className="space-y-4">
            <form.AppField
              name="fullName"
              children={(field) => (
                <field.Input
                  formBaseProps={{ label: 'Full Name' }}
                  placeholder="John Doe"
                />
              )}
            />
            <form.AppField
              name="email"
              children={(field) => (
                <field.Input
                  formBaseProps={{ label: 'Email' }}
                  id={field.name}
                  placeholder="you@example.com"
                  type="email"
                />
              )}
            />
            <form.AppField
              name="password"
              children={(field) => (
                <field.Input
                  formBaseProps={{ label: 'Password' }}
                  type="password"
                  placeholder="••••••••"
                />
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
