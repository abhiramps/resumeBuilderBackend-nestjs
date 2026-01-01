import { IsString, IsOptional, IsObject, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResumeDto {
    @ApiProperty({ example: 'My Resume' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Software Engineer Resume', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'template-1' })
    @IsString()
    templateId: string;

    @ApiProperty({ example: {} })
    @IsObject()
    content: any;
}

export class UpdateResumeDto {
    @ApiProperty({ example: 'My Updated Resume', required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    templateId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    content?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['draft', 'published'])
    status?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

export class ListResumesQueryDto {
    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    page?: number;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    limit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['draft', 'published'])
    status?: 'draft' | 'published';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    template?: string;

    @ApiProperty({ required: false, enum: ['updatedAt', 'createdAt', 'title'] })
    @IsOptional()
    @IsEnum(['updatedAt', 'createdAt', 'title'])
    sortBy?: 'updatedAt' | 'createdAt' | 'title';

    @ApiProperty({ required: false, enum: ['asc', 'desc'] })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}

export class SearchResumesQueryDto extends ListResumesQueryDto {
    @ApiProperty({ example: 'software engineer' })
    @IsString()
    q: string;
}
