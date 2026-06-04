import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ColorAlgorithmVersion,
  ColorReaction,
  ColorReactionResponse,
  ColorReactionsResponse,
  EntryResponse,
  EntriesResponse,
  FeedEntry,
  FeedResponse,
  PersistedDayEntry,
  ProfileStatsResponse,
  SaveColorReactionRequest,
  SaveEntryRequest,
} from "@onecolor/shared";
import { findGeneratedColor } from "@onecolor/shared";
import { PrismaService } from "./prisma.service.ts";
import type { ColorReaction as ColorReactionRecord, Entry } from "./generated/prisma/client.ts";

@Injectable()
export class EntriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async ensureUser(userId: string) {
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
  }

  async findByMonth(userId: string, month: string): Promise<EntriesResponse> {
    await this.ensureUser(userId);
    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        date: {
          startsWith: `${month}-`,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return {
      entries: entries.map(toPersistedDayEntry),
    };
  }

  async findOne(userId: string, date: string): Promise<EntryResponse> {
    await this.ensureUser(userId);
    const entry = await this.prisma.entry.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!entry) {
      throw new NotFoundException("Entry not found");
    }

    return {
      entry: toPersistedDayEntry(entry),
    };
  }

  async profileStats(userId: string): Promise<ProfileStatsResponse> {
    await this.ensureUser(userId);
    const totalEntries = await this.prisma.entry.count({
      where: {
        userId,
      },
    });

    return {
      stats: {
        totalEntries,
        totalWords: totalEntries * 3,
      },
    };
  }

  async save(
    userId: string,
    date: string,
    request: SaveEntryRequest,
  ): Promise<EntryResponse> {
    await this.ensureUser(userId);
    const trimmedWords = request.words.map((word) => word.trim()) as [
      string,
      string,
      string,
    ];
    if (trimmedWords.some((word) => word.length === 0)) {
      throw new BadRequestException("words must not be empty");
    }
    const color = assertGeneratedColor(date, trimmedWords, request.color);

    const existingEntry = await this.prisma.entry.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
    if (
      existingEntry &&
      request.baseUpdatedAt &&
      existingEntry.updatedAt.toISOString() !== request.baseUpdatedAt
    ) {
      throw new ConflictException({
        statusCode: 409,
        message: "Entry has changed on the server",
        entry: toPersistedDayEntry(existingEntry),
      });
    }

    const entry = await this.prisma.entry.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        word1: trimmedWords[0],
        word2: trimmedWords[1],
        word3: trimmedWords[2],
        colorLabel: color.label,
        colorHex: color.hex,
        textColor: color.textColor,
        colorIndex: color.index,
        colorAlgorithmVersion: color.algorithmVersion,
      },
      create: {
        userId,
        date,
        word1: trimmedWords[0],
        word2: trimmedWords[1],
        word3: trimmedWords[2],
        colorLabel: color.label,
        colorHex: color.hex,
        textColor: color.textColor,
        colorIndex: color.index,
        colorAlgorithmVersion: color.algorithmVersion,
      },
    });

    return {
      entry: toPersistedDayEntry(entry),
    };
  }

  async feed(
    userId: string,
    limit = 20,
  ): Promise<FeedResponse> {
    await this.ensureUser(userId);

    const ownEntryCount = await this.prisma.entry.count({
      where: {
        userId,
      },
    });

    if (ownEntryCount === 0) {
      return { entries: [], requiresEntry: true };
    }

    const entries = await this.prisma.entry.findMany({
      where: {
        userId: {
          not: userId,
        },
      },
      include: {
        colorReactions: {
          where: {
            userId,
          },
          take: 1,
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      take: limit,
    });

    return {
      entries: entries.map((entry) => toFeedEntry(entry, entry.colorReactions[0])),
      requiresEntry: false,
    };
  }

  async findReactions(userId: string, date: string): Promise<ColorReactionsResponse> {
    await this.ensureUser(userId);

    const entry = await this.prisma.entry.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      include: {
        colorReactions: {
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException("Entry not found");
    }

    return {
      reactions: entry.colorReactions.map(toColorReaction),
    };
  }

  async returnColor(
    userId: string,
    entryId: string,
    request: SaveColorReactionRequest,
  ): Promise<ColorReactionResponse> {
    await this.ensureUser(userId);

    const entry = await this.prisma.entry.findUnique({
      where: {
        id: entryId,
      },
    });

    if (!entry) {
      throw new NotFoundException("Entry not found");
    }

    if (entry.userId === userId) {
      throw new BadRequestException("Cannot return a color to your own entry");
    }

    const color = assertGeneratedColor(
      entry.date,
      [entry.word1, entry.word2, entry.word3],
      request.color,
    );
    const reaction = await this.prisma.colorReaction.upsert({
      where: {
        entryId_userId: {
          entryId,
          userId,
        },
      },
      update: {
        colorLabel: color.label,
        colorHex: color.hex,
        textColor: color.textColor,
        colorIndex: color.index,
        colorAlgorithmVersion: color.algorithmVersion,
      },
      create: {
        entryId,
        userId,
        colorLabel: color.label,
        colorHex: color.hex,
        textColor: color.textColor,
        colorIndex: color.index,
        colorAlgorithmVersion: color.algorithmVersion,
      },
    });

    return {
      reaction: toColorReaction(reaction),
    };
  }
}

const toPersistedDayEntry = (entry: Entry): PersistedDayEntry => ({
  id: entry.id,
  date: entry.date,
  words: [entry.word1, entry.word2, entry.word3],
  colorLabel: entry.colorLabel,
  colorHex: entry.colorHex,
  textColor: entry.textColor,
  colorIndex: entry.colorIndex,
  colorAlgorithmVersion: toColorAlgorithmVersion(entry.colorAlgorithmVersion),
  createdAt: entry.createdAt.toISOString(),
  updatedAt: entry.updatedAt.toISOString(),
});

const toColorReaction = (reaction: ColorReactionRecord): ColorReaction => ({
  id: reaction.id,
  entryId: reaction.entryId,
  colorLabel: reaction.colorLabel,
  colorHex: reaction.colorHex,
  textColor: reaction.textColor,
  colorIndex: reaction.colorIndex,
  colorAlgorithmVersion: toColorAlgorithmVersion(reaction.colorAlgorithmVersion),
  createdAt: reaction.createdAt.toISOString(),
  updatedAt: reaction.updatedAt.toISOString(),
});

const toFeedEntry = (
  entry: Entry,
  returnedColor?: ColorReactionRecord,
): FeedEntry => ({
  date: entry.date,
  words: [entry.word1, entry.word2, entry.word3],
  colorLabel: entry.colorLabel,
  colorHex: entry.colorHex,
  textColor: entry.textColor,
  colorIndex: entry.colorIndex,
  colorAlgorithmVersion: toColorAlgorithmVersion(entry.colorAlgorithmVersion),
  entryId: entry.id,
  createdAt: entry.createdAt.toISOString(),
  returnedColor: returnedColor ? toColorReaction(returnedColor) : undefined,
});

const assertGeneratedColor = (
  date: string,
  words: [string, string, string],
  color: SaveEntryRequest["color"],
) => {
  const generated = findGeneratedColor(
    { date, words, algorithmVersion: color.algorithmVersion },
    color,
  );
  if (!generated) {
    throw new BadRequestException("Color does not match generated palette");
  }
  return generated;
};

const toColorAlgorithmVersion = (value: string): ColorAlgorithmVersion => {
  if (value !== "rgb24-v1") {
    throw new BadRequestException("Unsupported color algorithm version");
  }
  return value;
};
