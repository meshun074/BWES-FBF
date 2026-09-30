import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  const metadata: ArgumentMetadata = {
    type: 'query',
    metatype: PaginationQueryDto,
    data: undefined,
  };

  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    });
  });

  it('uses the default pagination values', async () => {
    const result = (await pipe.transform({}, metadata)) as PaginationQueryDto;

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('explicitly converts valid query-string numbers', async () => {
    const result = (await pipe.transform(
      {
        page: '2',
        pageSize: '50',
      },
      metadata,
    )) as PaginationQueryDto;

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('rejects page zero', async () => {
    await expect(
      pipe.transform(
        {
          page: '0',
          pageSize: '20',
        },
        metadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects page sizes above the maximum', async () => {
    await expect(
      pipe.transform(
        {
          page: '1',
          pageSize: '101',
        },
        metadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
