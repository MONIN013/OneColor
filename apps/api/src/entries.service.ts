import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ColorReaction,
  ColorReactionResponse,
  ColorReactionsResponse,
  DayEntry,
  EntryResponse,
  EntriesResponse,
  NearDay,
  NearDaysResponse,
  NearMode,
  SaveColorReactionRequest,
  SaveEntryRequest,
} from "@onecolor/shared";
import { findPaletteColor, isKnownColorName } from "@onecolor/shared";
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
      entries: entries.map(toDayEntry),
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
      entry: toDayEntry(entry),
    };
  }

  async save(
    userId: string,
    date: string,
    request: SaveEntryRequest,
  ): Promise<EntryResponse> {
    await this.ensureUser(userId);

    if (!isKnownColorName(request.colorName)) {
      throw new BadRequestException("Unknown colorName");
    }

    const color = findPaletteColor(request.colorName);
    const trimmedWords = request.words.map((word) => word.trim()) as [
      string,
      string,
      string,
    ];
    if (trimmedWords.some((word) => word.length === 0)) {
      throw new BadRequestException("words must not be empty");
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
        colorName: color.name,
        colorHex: color.hex,
        textColor: color.recommendedText,
      },
      create: {
        userId,
        date,
        word1: trimmedWords[0],
        word2: trimmedWords[1],
        word3: trimmedWords[2],
        colorName: color.name,
        colorHex: color.hex,
        textColor: color.recommendedText,
      },
    });

    return {
      entry: toDayEntry(entry),
    };
  }

  async nearDays(
    userId: string,
    date: string,
    mode: NearMode = "color",
  ): Promise<NearDaysResponse> {
    await this.ensureUser(userId);

    const baseEntry = await this.prisma.entry.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!baseEntry) {
      return { days: [] };
    }

    const candidates = await this.prisma.entry.findMany({
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
    });

    const days = candidates
      .map((entry) => ({
        day: toNearDay(
          entry,
          mode === "words"
            ? scoreWords(baseEntry, entry)
            : scoreColor(baseEntry.colorHex, entry.colorHex),
          entry.colorReactions[0],
        ),
      }))
      .filter(({ day }) => mode === "color" || day.closeness > 0)
      .sort((a, b) => {
        const closenessDelta = b.day.closeness - a.day.closeness;
        if (closenessDelta !== 0) {
          return closenessDelta;
        }

        const dateDelta = b.day.date.localeCompare(a.day.date);
        if (dateDelta !== 0) {
          return dateDelta;
        }

        return a.day.entryId.localeCompare(b.day.entryId);
      })
      .slice(0, 20)
      .map(({ day }) => day);

    return { days };
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

    if (!isKnownColorName(request.colorName)) {
      throw new BadRequestException("Unknown colorName");
    }

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

    const color = findPaletteColor(request.colorName);
    const reaction = await this.prisma.colorReaction.upsert({
      where: {
        entryId_userId: {
          entryId,
          userId,
        },
      },
      update: {
        colorName: color.name,
        colorHex: color.hex,
        textColor: color.recommendedText,
      },
      create: {
        entryId,
        userId,
        colorName: color.name,
        colorHex: color.hex,
        textColor: color.recommendedText,
      },
    });

    return {
      reaction: toColorReaction(reaction),
    };
  }
}

const toDayEntry = (entry: Entry): DayEntry => ({
  date: entry.date,
  words: [entry.word1, entry.word2, entry.word3],
  colorName: entry.colorName,
  colorHex: entry.colorHex,
  textColor: entry.textColor,
});

const toColorReaction = (reaction: ColorReactionRecord): ColorReaction => ({
  id: reaction.id,
  entryId: reaction.entryId,
  colorName: reaction.colorName,
  colorHex: reaction.colorHex,
  textColor: reaction.textColor,
  createdAt: reaction.createdAt.toISOString(),
  updatedAt: reaction.updatedAt.toISOString(),
});

const toNearDay = (
  entry: Entry,
  closeness: number,
  returnedColor?: ColorReactionRecord,
): NearDay => ({
  ...toDayEntry(entry),
  entryId: entry.id,
  closeness,
  returnedColor: returnedColor ? toColorReaction(returnedColor) : undefined,
});

const scoreWords = (baseEntry: Entry, candidate: Entry) => {
  const baseWords = new Set(normalizeWords(baseEntry));
  const candidateWords = new Set(normalizeWords(candidate));
  let overlap = 0;

  for (const word of candidateWords) {
    if (baseWords.has(word)) {
      overlap += 1;
    }
  }

  return Math.round((overlap / 3) * 100);
};

const normalizeWords = (entry: Entry) =>
  [entry.word1, entry.word2, entry.word3].map((word) => word.trim().toLocaleLowerCase());

const scoreColor = (baseHex: string, candidateHex: string) => {
  const base = hexToRgb(baseHex);
  const candidate = hexToRgb(candidateHex);
  const maxDistance = Math.sqrt(3 * 255 ** 2);
  const distance = Math.sqrt(
    (base.red - candidate.red) ** 2 +
      (base.green - candidate.green) ** 2 +
      (base.blue - candidate.blue) ** 2,
  );

  return Math.max(0, Math.round((1 - distance / maxDistance) * 100));
};

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "");
  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
};
