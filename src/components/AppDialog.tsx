import type { PropsWithChildren } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useGlobalContext } from '@/context/GlobalContext'

interface AppDialogProps {
  trigger: React.ReactNode
}

export function AppDialog({
  trigger,
  children,
}: PropsWithChildren<AppDialogProps>) {
  const { isDialogOpen, setIsDialogOpen } = useGlobalContext()

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </DialogContent>
    </Dialog>
  )
}
