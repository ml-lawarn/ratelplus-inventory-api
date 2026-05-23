// src/modules/brands/services/brands.service.ts

import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { CreateBrandDto } from '../dto/create-brand.dto';
import { BrandQueryDto } from '../dto/brand-query.dto';

import { BrandsRepository } from '../repositories/brands.repository';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  async createBrand(dto: CreateBrandDto) {
    const existingBrand = await this.brandsRepository.findByName(dto.name);

    if (existingBrand) {
      throw new ConflictException('Brand already exists');
    }

    const brand = await this.brandsRepository.create({
      name: dto.name,
      description: dto.description,
    });

    return {
      message: 'Brand created successfully',
      data: brand,
    };
  }

  async getBrands(query: BrandQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.BrandWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const [brands, total] = await Promise.all([
      this.brandsRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          _count: {
            select: {
              equipmentItems: true,
            },
          },
        },
      }),

      this.brandsRepository.count(where),
    ]);

    return {
      message: 'Brands retrieved successfully',

      data: {
        items: brands,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}
