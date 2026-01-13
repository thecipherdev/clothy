import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/Categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/Categories"!</div>
}
