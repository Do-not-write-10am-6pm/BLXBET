import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AssetIdsPipe implements PipeTransform<string, number[]> {
  transform(value: string, metadata: ArgumentMetadata): number[] {
    const val = value.split('+');
    if (val.length === 0) {
      throw new BadRequestException({ error: 'Validation failed' });
    }
    const result = val.map((e) => {
      const num = parseInt(e);
      if (isNaN(num)) {
        throw new BadRequestException({ error: 'Validation failed' });
      }
      return num;
    });
    return result;
  }
}
