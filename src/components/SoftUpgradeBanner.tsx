// import { ReactNode } from 'react'
import clsx from 'clsx'

interface SoftUpgradeBannerProps {
  className?: string
  onUpgrade: () => void
  onDismiss: () => void
}

/**
 * Small, dismissible banner that nudges the user to upgrade.
 */
export function SoftUpgradeBanner({
  className,
  onUpgrade,
  onDismiss
}: SoftUpgradeBannerProps) {
  return (
    <div
      className={clsx(
        'fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-3 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur-md sm:flex-row',
        className
      )}
    >
      <span className="text-sm">
        Save your progress across devices ↗
      </span>

      <div className="flex gap-2">
        <button
          className="rounded bg-primary px-4 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={onUpgrade}
        >
          Upgrade
        </button>
        <button
          className="rounded px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}