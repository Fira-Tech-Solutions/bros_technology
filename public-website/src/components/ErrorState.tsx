import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      )}
    </div>
  );
}
