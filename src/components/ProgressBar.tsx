interface ProgressBarProps {
  progress: number
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  return (
    <div className="w-full space-y-1">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
