import { Injectable, NotFoundException } from "@nestjs/common";
import { ScansService } from "../scans/scans.service";

type DevRole = "junior" | "mid" | "senior" | "lead";

export interface DeveloperRecord {
  id: string;
  name: string;
  email: string;
  role: DevRole;
  avatarUrl?: string;
  avgQualityScore: number;
  totalPrs: number;
  bugsFixed: number;
  bugsIntroduced: number;
}

@Injectable()
export class AnalyticsService {
  private readonly developers: DeveloperRecord[] = [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@company.com",
      role: "lead",
      avgQualityScore: 9.2,
      totalPrs: 156,
      bugsFixed: 89,
      bugsIntroduced: 3,
    },
    {
      id: "2",
      name: "Marcus Webb",
      email: "marcus@company.com",
      role: "senior",
      avgQualityScore: 8.5,
      totalPrs: 132,
      bugsFixed: 67,
      bugsIntroduced: 8,
    },
    {
      id: "3",
      name: "Priya Nair",
      email: "priya@company.com",
      role: "senior",
      avgQualityScore: 8.8,
      totalPrs: 145,
      bugsFixed: 72,
      bugsIntroduced: 5,
    },
    {
      id: "4",
      name: "Alex Johnson",
      email: "alex@company.com",
      role: "mid",
      avgQualityScore: 7.4,
      totalPrs: 98,
      bugsFixed: 45,
      bugsIntroduced: 12,
    },
    {
      id: "5",
      name: "Jamie Lee",
      email: "jamie@company.com",
      role: "mid",
      avgQualityScore: 7.8,
      totalPrs: 87,
      bugsFixed: 38,
      bugsIntroduced: 9,
    },
    {
      id: "6",
      name: "Ryan Park",
      email: "ryan@company.com",
      role: "junior",
      avgQualityScore: 6.5,
      totalPrs: 42,
      bugsFixed: 15,
      bugsIntroduced: 18,
    },
  ];

  constructor(private readonly scans: ScansService) {}

  listDevelopers() {
    return this.developers;
  }

  createDeveloper(payload: {
    name: string;
    email: string;
    role: DevRole;
    avatarUrl?: string;
  }) {
    const id = String(this.developers.length + 1);
    const dev: DeveloperRecord = {
      id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      avatarUrl: payload.avatarUrl,
      avgQualityScore: 7.5,
      totalPrs: 0,
      bugsFixed: 0,
      bugsIntroduced: 0,
    };
    this.developers.unshift(dev);
    return dev;
  }

  getDeveloper(id: string) {
    const dev = this.developers.find((d) => d.id === id);
    if (!dev) {
      throw new NotFoundException(`Developer ${id} not found`);
    }
    return dev;
  }

  getDeveloperAnalytics(id: string) {
    const dev = this.getDeveloper(id);
    const base = dev.avgQualityScore;
    const qualityTrend = Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - (9 - i) * 86400000).toISOString(),
      qualityScore: Number((base - 0.7 + i * 0.12).toFixed(2)),
    }));

    return {
      qualityTrend,
      strengths: this.getStrengths(dev),
      improvementAreas: this.getImprovementAreas(dev),
      recentPrs: Array.from({ length: 5 }, (_, i) => ({
        id: `${id}-pr-${i + 1}`,
        title: `Refactor module ${i + 1} for better reliability`,
        repository: "ai-bug-detector/core",
        status: i % 2 === 0 ? "merged" : "open",
        qualityScore: Number((Math.max(5.5, base - 0.4 + i * 0.2)).toFixed(1)),
        updatedAt: new Date(Date.now() - i * 172800000).toISOString(),
      })),
    };
  }

  getOverview() {
    const recent = this.scans.list(100);
    const completed = recent.filter((s) => s.status === "completed" && s.result);
    const avg = (vals: number[]) =>
      vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

    const quality = Number(
      avg(completed.map((s) => s.result!.scores.quality)).toFixed(1),
    );
    const security = Number(
      avg(completed.map((s) => s.result!.scores.security)).toFixed(1),
    );
    const performance = Number(
      avg(completed.map((s) => s.result!.scores.performance)).toFixed(1),
    );

    const findingCounts = completed.flatMap((s) => s.result!.findings).reduce(
      (acc, f) => {
        acc[f.severity] = (acc[f.severity] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const qualityTrend = Array.from({ length: 10 }, (_, i) => {
      const value = quality > 0 ? quality - 4 + i * 0.6 : 65 + i * 1.3;
      return { day: `Day ${i + 1}`, qualityScore: Number(value.toFixed(1)) };
    });

    return {
      metrics: {
        codeQualityScore: quality > 0 ? quality : 78,
        bugsDetected: completed.reduce(
          (n, s) => n + (s.result?.findings.length ?? 0),
          0,
        ),
        securityIssues:
          (findingCounts.critical ?? 0) +
          (findingCounts.high ?? 0) +
          (findingCounts.medium ?? 0),
        codeScans: recent.length,
        security,
        performance,
      },
      qualityTrend,
      issueBreakdown: [
        {
          label: "Critical",
          count: findingCounts.critical ?? 8,
          pct: 15,
        },
        {
          label: "High",
          count: findingCounts.high ?? 45,
          pct: 42,
        },
        {
          label: "Medium",
          count: findingCounts.medium ?? 89,
          pct: 65,
        },
        {
          label: "Low",
          count: findingCounts.low ?? 205,
          pct: 100,
        },
      ],
      teamPerformance: this.developers.slice(0, 5).map((d) => ({
        name: d.name,
        score: Number((d.avgQualityScore * 10).toFixed(0)),
        scans: d.totalPrs,
      })),
    };
  }

  private getStrengths(dev: DeveloperRecord): string[] {
    if (dev.avgQualityScore >= 8.5) {
      return [
        "Strong architectural decisions in large PRs",
        "Low defect rate in merged code",
        "Consistent review quality and mentorship",
      ];
    }
    return ["Delivers steadily and collaborates well with peers"];
  }

  private getImprovementAreas(dev: DeveloperRecord): string[] {
    if (dev.bugsIntroduced > 10) {
      return [
        "Increase unit test coverage for edge-case paths",
        "Use stricter input validation in service handlers",
      ];
    }
    return ["Push performance-focused refactors for critical paths"];
  }
}
