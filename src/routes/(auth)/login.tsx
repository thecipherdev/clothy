import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import * as z from 'zod'
import { toast } from 'sonner'
import { Shirt } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppForm } from '@/components/form/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6, 'Password must at least 6 characters long.'),
})

function RouteComponent() {
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true)

      const { email, password } = value

      const { error } = await signIn(email, password)
      console.log('error', error)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Welcome back!')
        navigate({
          to: '/dashboard',
        })
      }

      setLoading(false)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shirt className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your inventory account</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <CardContent className="space-y-4 mb-4">
              <form.AppField
                name="email"
                children={(field) => (
                  <field.Input
                    formBaseProps={{ label: 'Email' }}
                    placeholder="you@example.com"
                    type="email"
                    id={field.name}
                    className="rounded"
                  />
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.Input
                    formBaseProps={{ label: 'Password' }}
                    placeholder="••••••••"
                    type="password"
                    id={field.name}
                    className="rounded"
                  />
                )}
              />
            </CardContent>
          </FieldGroup>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full rounded" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
