"use client";

interface VideoMetaProps {
  title: string;
  description?: string | null;
}

export function VideoMeta({ title, description }: VideoMetaProps) {
  return (
    <div className="mt-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
