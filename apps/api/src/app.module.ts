import { Module } from "@nestjs/common";
import { EntriesController } from "./entries.controller.ts";
import { EntriesService } from "./entries.service.ts";
import { HealthController } from "./health.controller.ts";
import { PrismaService } from "./prisma.service.ts";

@Module({
  controllers: [EntriesController, HealthController],
  providers: [EntriesService, PrismaService],
})
export class AppModule {}
