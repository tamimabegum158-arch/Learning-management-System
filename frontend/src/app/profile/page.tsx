"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { apiGet } from "@/lib/apiClient";

interface EnrollmentItem {
  subject_id: number;
  subject_title: string;
  subject_slug: string;
  enrolled_at: string;
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
  is_completed: boolean;
}

interface EnrollmentsResponse {
  total_enrolled: number;
  completed_count: number;
  not_completed_count: number;
  enrollments: EnrollmentItem[];
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [enrollments, setEnrollments] = useState<EnrollmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<EnrollmentsResponse>("/api/me/enrollments")
      .then(setEnrollments)
      .catch(() => setEnrollments({ total_enrolled: 0, completed_count: 0, not_completed_count: 0, enrollments: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Profile
        </h1>
        <p className="text-muted font-medium">
          {user?.name ?? "—"}
        </p>
        <p className="text-muted text-sm mt-1">
          {user?.email ?? "—"}
        </p>

        <section className="mt-8 p-4 rounded-lg border border-border bg-card">
          <h2 className="text-lg font-medium text-foreground mb-3">
            My enrolled courses
          </h2>
          {loading ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : enrollments?.enrollments && enrollments.enrollments.length > 0 ? (
            <ul className="space-y-3">
              {enrollments.enrollments.map((e) => (
                <li
                  key={e.subject_id}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <Link
                    href={`/subjects/${e.subject_id}`}
                    className="font-medium text-foreground hover:text-accent hover:underline"
                  >
                    {e.subject_title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span>
                      {e.completed_videos} / {e.total_videos} videos completed
                    </span>
                    <span className="text-neutral-400 dark:text-muted">·</span>
                    <span>{Math.round(e.percent_complete)}% complete</span>
                    {e.is_completed && (
                      <span className="text-muted font-medium">Completed</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-sm">You are not enrolled in any courses yet. Enroll from the home page.</p>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
