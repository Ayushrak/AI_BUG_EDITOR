"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDeveloper, getDeveloperAnalytics } from "@/lib/api";
import type { Developer, DeveloperAnalytics } from "@/lib/types";

export default function DeveloperDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [analytics, setAnalytics] = useState<DeveloperAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [dev, stats] = await Promise.all([
          getDeveloper(id),
          getDeveloperAnalytics(id),
        ]);
        setDeveloper(dev);
        setAnalytics(stats);
      } finally {
        setLoading(false);
      }
    };
    if (id) void run();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-sm text-muted-foreground">Loading developer...</div>
      </AppLayout>
    );
  }

  if (!developer) {
    return (
      <AppLayout>
        <div className="text-sm text-destructive">Developer not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link href="/developers" className="text-sm text-primary hover:underline">
          Back to team
        </Link>
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold">{developer.name}</h1>
            <p className="text-muted-foreground mt-1">{developer.email}</p>
            <Badge className="mt-3" variant="secondary">
              {developer.role}
            </Badge>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Stat label="Avg Quality" value={developer.avgQualityScore.toFixed(1)} />
              <Stat label="Total PRs" value={String(developer.totalPrs)} />
              <Stat label="Bugs Fixed" value={String(developer.bugsFixed)} />
              <Stat label="Bugs Introduced" value={String(developer.bugsIntroduced)} />
            </div>
          </CardContent>
        </Card>
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quality Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52 flex items-end gap-2">
                  {analytics.qualityTrend.map((point, idx) => (
                    <div key={point.date} className="flex-1">
                      <div
                        className="bg-primary/70 rounded-t w-full"
                        style={{ height: `${Math.max(8, point.qualityScore * 10)}%` }}
                      />
                      {idx % 2 === 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 text-center">
                          {new Date(point.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Improvement Areas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.improvementAreas.map((item) => (
                  <p key={item} className="text-sm text-muted-foreground">
                    - {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
