// src/modules/vendors/services/vendors.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { buildPagination } from '../../../shared/utils/pagination.util';

import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { VendorQueryDto } from '../dto/vendor-query.dto';

import { VendorsRepository } from '../repositories/vendors.repository';

import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class VendorsService {
  constructor(
    private readonly vendorsRepository: VendorsRepository,
    private readonly auditService: AuditService,
  ) {}

  async createVendor(dto: CreateVendorDto, userId: string) {
    const existingVendor = await this.vendorsRepository.findByName(
      dto.companyName,
    );

    if (existingVendor) {
      throw new ConflictException('Vendor already exists');
    }

    const vendor = await this.vendorsRepository.create({
      companyName: dto.companyName,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      website: dto.website,
      isActive: dto.isActive,
    });

    await this.auditService.logActivity({
      action: 'CREATE_VENDOR',
      entityType: 'Vendor',
      entityId: vendor.id,
      description: `Vendor ${vendor.companyName} created`,
      newValues: vendor,
      performedById: userId,
    });

    return {
      message: 'Vendor created successfully',
      data: vendor,
    };
  }

  async getVendors(query: VendorQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.VendorWhereInput = query.search
      ? {
          OR: [
            {
              companyName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },

            {
              contactPerson: {
                contains: query.search,
                mode: 'insensitive',
              },
            },

            {
              email: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const [vendors, total] = await Promise.all([
      this.vendorsRepository.findMany({
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
              maintenanceRecords: true,
            },
          },
        },
      }),

      this.vendorsRepository.count(where),
    ]);

    return {
      message: 'Vendors retrieved successfully',

      data: {
        items: vendors,

        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getVendorById(id: string) {
    const vendor = await this.vendorsRepository.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return {
      message: 'Vendor retrieved successfully',
      data: vendor,
    };
  }

  async updateVendor(id: string, dto: UpdateVendorDto, userId: string) {
    const vendor = await this.vendorsRepository.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (dto.companyName && dto.companyName !== vendor.companyName) {
      const existingVendor = await this.vendorsRepository.findByName(
        dto.companyName,
      );

      if (existingVendor) {
        throw new ConflictException('Vendor already exists');
      }
    }

    const updatedVendor = await this.vendorsRepository.update(id, {
      companyName: dto.companyName,
      contactPerson: dto.contactPerson,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      website: dto.website,
      isActive: dto.isActive,
    });

    await this.auditService.logActivity({
      action: 'UPDATE_VENDOR',
      entityType: 'Vendor',
      entityId: updatedVendor.id,
      description: `Vendor ${updatedVendor.companyName} updated`,
      oldValues: vendor,
      newValues: updatedVendor,
      performedById: userId,
    });

    return {
      message: 'Vendor updated successfully',
      data: updatedVendor,
    };
  }
}
