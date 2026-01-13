import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/Dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/Dashboard"!</div>
}
