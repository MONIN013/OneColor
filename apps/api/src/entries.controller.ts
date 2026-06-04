import { Body, Controller, Get, Headers, Inject, Param, Put, Query } from "@nestjs/common";
import type { ColorReactionResponse, ColorReactionsResponse, FeedResponse, ProfileStatsResponse } from "@onecolor/shared";
import { DateParamDto, EntriesQueryDto, EntryIdParamDto, FeedQueryDto, SaveColorReactionDto, SaveEntryDto, assertAnonymousUserId } from "./dto.ts";
import { EntriesService } from "./entries.service.ts";

@Controller()
export class EntriesController {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
  ) {}

  @Get("profile/stats")
  profileStats(
    @Headers("x-anonymous-user-id") userId: string | undefined,
  ): Promise<ProfileStatsResponse> {
    return this.entriesService.profileStats(assertAnonymousUserId(userId));
  }

  @Get("entries")
  entries(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Query() query: EntriesQueryDto,
  ) {
    return this.entriesService.findByMonth(assertAnonymousUserId(userId), query.month);
  }

  @Get("entries/:date")
  entry(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Param() params: DateParamDto,
  ) {
    return this.entriesService.findOne(assertAnonymousUserId(userId), params.date);
  }

  @Put("entries/:date")
  saveEntry(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Param() params: DateParamDto,
    @Body() body: SaveEntryDto,
  ) {
    return this.entriesService.save(assertAnonymousUserId(userId), params.date, body);
  }

  @Get("entries/:date/reactions")
  entryReactions(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Param() params: DateParamDto,
  ): Promise<ColorReactionsResponse> {
    return this.entriesService.findReactions(assertAnonymousUserId(userId), params.date);
  }

  @Put("entries/:entryId/reactions/color")
  returnColor(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Param() params: EntryIdParamDto,
    @Body() body: SaveColorReactionDto,
  ): Promise<ColorReactionResponse> {
    return this.entriesService.returnColor(assertAnonymousUserId(userId), params.entryId, body);
  }

  @Get("feed")
  feed(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Query() query: FeedQueryDto,
  ): Promise<FeedResponse> {
    return this.entriesService.feed(assertAnonymousUserId(userId), query.limit);
  }
}
