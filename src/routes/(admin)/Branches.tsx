import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/Branches')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/Branches"!</div>
}
