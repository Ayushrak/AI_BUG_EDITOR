import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateDeveloperDto } from "./dto/create-developer.dto";
import { AnalyticsService } from "./analytics.service";

@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("analytics/overview")
  getOverview() {
    return this.analytics.getOverview();
  }

  @Get("developers")
  listDevelopers() {
    return this.analytics.listDevelopers();
  }

  @Post("developers")
  createDeveloper(@Body() body: CreateDeveloperDto) {
    return this.analytics.createDeveloper(body);
  }

  @Get("developers/:id")
  getDeveloper(@Param("id") id: string) {
    return this.analytics.getDeveloper(id);
  }

  @Get("developers/:id/analytics")
  getDeveloperAnalytics(@Param("id") id: string) {
    return this.analytics.getDeveloperAnalytics(id);
  }
}
