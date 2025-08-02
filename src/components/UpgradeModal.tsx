import * as Dialog from '@radix-ui/react-dialog'
import { ReactNode } from 'react'

interface UpgradeModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onUpgrade: () => void
  /**
   * If `true`, the modal cannot be dismissed without upgrading (shown at 100 messages).
   */
  required?: boolean
}

export function UpgradeModal({
  open,
  onOpenChange,
  onUpgrade,
  required = false
}: UpgradeModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={required ? undefined : onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-xl">
          <Dialog.Title className="mb-2 text-lg font-semibold">
            Create a free account
          </Dialog.Title>
          <Dialog.Description className="mb-4 text-sm text-muted-foreground">
            Sign up with your email to sync conversations across devices,
            unlock a higher daily limit, and never lose your progress.
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            {!required && (
              <Dialog.Close asChild>
                <button className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent">
                  Maybe later
                </button>
              </Dialog.Close>
            )}
            <button
              className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={onUpgrade}
            >
              Upgrade with Email
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}