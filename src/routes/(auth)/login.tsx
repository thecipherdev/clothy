import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form-start';
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shirt } from 'lucide-react';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

const formSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(6, "Password must at least 6 characters long.")
})

function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      setLoading(true);

      const { email, password } = value

      const { error } = await signIn(email, password);
      console.log('error', error)

      if (error) {
        alert(error)
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate({
          to: '/dashboard',
        });
      }

      setLoading(false);
    }
  });

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
        <form onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          form.handleSubmit()
        }}>
          <FieldGroup>
            <CardContent className="space-y-4 mb-4">
              <form.Field
                name="email"
                children={(field) => {
                  return (
                    <div className="space-y-2">
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        className="rounded"
                        name={field.name}
                        id={field.name}
                        value={field.state.value}
                        type="email"
                        placeholder="you@example.com"
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  return (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        className="rounded"
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="••••••••"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )
                }}
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
  );
}
