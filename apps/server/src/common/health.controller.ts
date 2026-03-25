import { Controller, Get } from "@nestjs/common";

@Controller("api/health")
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "yema-server",
      timestamp: new Date().toISOString(),
    };
  }
}
