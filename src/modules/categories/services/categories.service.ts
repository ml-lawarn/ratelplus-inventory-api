// src/modules/categories/services/categories.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryQueryDto } from '../dto/category-query.dto';

import { CategoriesRepository } from '../repositories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory(dto: CreateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findByName(
      dto.name,
    );

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    if (dto.parentCategoryId) {
      const parentCategory = await this.categoriesRepository.findById(
        dto.parentCategoryId,
      );

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.categoriesRepository.create({
      name: dto.name,
      description: dto.description,

      parentCategory: dto.parentCategoryId
        ? {
            connect: {
              id: dto.parentCategoryId,
            },
          }
        : undefined,
    });

    return {
      message: 'Category created successfully',

      data: category,
    };
  }

  async getCategories(query: CategoryQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.CategoryWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const [categories, total] = await Promise.all([
      this.categoriesRepository.findMany({
        where,
        skip,
        take,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          parentCategory: true,

          subcategories: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              equipmentItems: true,
            },
          },
        },
      }),

      this.categoriesRepository.count(where),
    ]);

    return {
      message: 'Categories retrieved successfully',

      data: {
        items: categories,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getCategoryById(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name && dto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findByName(
        dto.name,
      );

      if (existingCategory) {
        throw new ConflictException('Category already exists');
      }
    }

    if (dto.parentCategoryId) {
      if (dto.parentCategoryId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoriesRepository.findById(
        dto.parentCategoryId,
      );

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const updatedCategory = await this.categoriesRepository.update(id, {
      name: dto.name,
      description: dto.description,
      parentCategory: dto.parentCategoryId
        ? {
            connect: {
              id: dto.parentCategoryId,
            },
          }
        : undefined,
    });

    return {
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }
}
