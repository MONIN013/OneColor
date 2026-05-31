import { Body, Controller, Get, Headers, Inject, Param, Put, Query } from "@nestjs/common";
import type { ColorReactionResponse, ColorReactionsResponse, PaletteResponse } from "@onecolor/shared";
import { dayPalette } from "@onecolor/shared";
import { DateParamDto, EntriesQueryDto, EntryIdParamDto, NearDaysQueryDto, SaveColorReactionDto, SaveEntryDto, assertAnonymousUserId } from "./dto.ts";
import { EntriesService } from "./entries.service.ts";

@Controller()
export class EntriesController {
  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
  ) {}

  @Get("palette")
  async palette(
    @Headers("x-anonymous-user-id") userId: string | undefined,
  ): Promise<PaletteResponse> {
    await this.entriesService.ensureUser(assertAnonymousUserId(userId));
    return { colors: dayPalette };
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

  @Get("near-days")
  nearDays(
    @Headers("x-anonymous-user-id") userId: string | undefined,
    @Query() query: NearDaysQueryDto,
  ) {
    return this.entriesService.nearDays(assertAnonymousUserId(userId), query.date, query.mode);
  }
}
