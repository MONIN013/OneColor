import { ArrayMaxSize, ArrayMinSize, IsArray, IsISO8601, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateBy, validateSync } from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import { BadRequestException } from "@nestjs/common";

const dateIdPattern = /^\d{4}-\d{2}-\d{2}$/;
const monthIdPattern = /^\d{4}-\d{2}$/;

const isValidDateId = (value: unknown) => {
  if (typeof value !== "string" || !dateIdPattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isValidMonthId = (value: unknown) => {
  if (typeof value !== "string" || !monthIdPattern.test(value)) {
    return false;
  }

  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
};

const IsDateId = () =>
  ValidateBy({
    name: "isDateId",
    validator: {
      validate: isValidDateId,
      defaultMessage: () => "date must be a valid date in YYYY-MM-DD format",
    },
  });

const IsMonthId = () =>
  ValidateBy({
    name: "isMonthId",
    validator: {
      validate: isValidMonthId,
      defaultMessage: () => "month must be a valid month in YYYY-MM format",
    },
  });

export class AnonymousUserHeaderDto {
  @IsUUID("4")
  userId!: string;
}

export function assertAnonymousUserId(value: string | undefined) {
  const dto = plainToInstance(AnonymousUserHeaderDto, {
    userId: value,
  });
  const errors = validateSync(dto, {
    whitelist: true,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    throw new BadRequestException("X-Anonymous-User-Id must be a UUID v4");
  }

  return dto.userId;
}

export class DateParamDto {
  @IsDateId()
  date!: string;
}

export class EntryIdParamDto {
  @IsUUID("4")
  entryId!: string;
}

export class EntriesQueryDto {
  @IsMonthId()
  month!: string;
}

export class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}

export class SaveEntryDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(8, { each: true })
  words!: [string, string, string];

  @IsString()
  @IsNotEmpty()
  colorName!: string;

  @IsOptional()
  @IsISO8601()
  baseUpdatedAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clientMutationId?: string;
}

export class SaveColorReactionDto {
  @IsString()
  @IsNotEmpty()
  colorName!: string;
}
