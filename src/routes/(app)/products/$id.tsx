import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/products/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/Products/$slug"!</div>
}
