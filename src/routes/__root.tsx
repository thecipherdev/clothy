import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { navLinks, NavKey } from '@/components/layout/navLinks'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/hooks/useAuth'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Clothy',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootComponent,
})
function RootComponent() {
  const location = useLocation()
  const pathname = location.pathname.split('/')
  const title = pathname[1] === 'products' && pathname.length === 3 ? 'Product Details' : navLinks[pathname[1] as NavKey]?.title

  return (
    <RootDocument>
      <AuthProvider>
        {pathname[1] === 'login' || pathname[1] === 'signup'
          ? <Outlet />
          : (
            <DashboardLayout title={title}>
              <Outlet />
            </DashboardLayout>
          )
        }
      </AuthProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
