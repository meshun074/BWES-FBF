import { SortDirection } from '@bwes/contracts';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SortQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy?: string;

  @IsOptional()
  @IsIn(Object.values(SortDirection))
  sortDirection?: SortDirection;
}
