import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';

class ExampleRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;
}

describe('Global validation configuration', () => {
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

  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: ExampleRequestDto,
    data: undefined,
  };

  it('accepts a valid DTO', async () => {
    const result = (await pipe.transform(
      {
        name: 'BWES',
      },
      metadata,
    )) as ExampleRequestDto;

    expect(result).toBeInstanceOf(ExampleRequestDto);
    expect(result).toEqual({
      name: 'BWES',
    });
  });

  it('rejects a missing required property', async () => {
    await expect(pipe.transform({}, metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an unexpected property', async () => {
    await expect(
      pipe.transform(
        {
          name: 'BWES',
          unauthorizedField: 'should-not-be-accepted',
        },
        metadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not implicitly convert incompatible values', async () => {
    await expect(
      pipe.transform(
        {
          name: 123,
        },
        metadata,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
