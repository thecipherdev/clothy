import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import type { NavKey } from '@/components/layout/navLinks'

import type { QueryClient } from '@tanstack/react-query'
import { navLinks } from '@/components/layout/navLinks'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/sonner'
import { GlobalContextProvider } from '@/context/GlobalContext'

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
  const title =
    pathname[1] === 'products' && pathname.length === 3
      ? 'Product Details'
      : navLinks[pathname[1] as NavKey]?.title

  return (
    <RootDocument>
      <AuthProvider>
        <GlobalContextProvider>
          {pathname[1] === 'login' || pathname[1] === 'signup' ? (
            <Outlet />
          ) : (
            <DashboardLayout title={title}>
              <Outlet />
            </DashboardLayout>
          )}
        </GlobalContextProvider>
      </AuthProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Tanstack Form',
              render: <FormDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
