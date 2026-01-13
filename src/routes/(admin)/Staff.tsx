import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/Staff')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/Staff"!</div>
}
