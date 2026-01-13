import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/Reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/Reports"!</div>
}
