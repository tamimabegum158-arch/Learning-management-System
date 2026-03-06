"use client";

interface VideoMetaProps {
  title: string;
  description?: string | null;
}

export function VideoMeta({ title, description }: VideoMetaProps) {
  return (
    <div className="mt-4">
      <h1 className="text-xl font-semibold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
