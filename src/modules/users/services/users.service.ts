// src/modules/users/services/users.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PrismaService } from '../../../core/database/prisma.service';
import { UserQueryDto } from '../dto/user-query.dto';
import { hashPassword } from '../../../shared/utils/password.util';
import { buildPagination } from '../../../shared/utils/pagination.util';
import { EmailService } from '../../../infrastructure/email/email.service';
import { userEmailTemplate } from '../../../infrastructure/email/templates/user-email.template';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private excludePassword<T extends { password?: string }>(
    user: T,
  ): Omit<T, 'password'> {
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.usersRepository.create({
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: dto.role,
      password: hashedPassword,

      department: dto.departmentId
        ? {
            connect: {
              id: dto.departmentId,
            },
          }
        : undefined,
    });

    this.emailService
      .sendEmail({
        to: user.email,
        subject: 'Welcome to RatelPlus',
        html: userEmailTemplate(
          `${user.firstName} ${user.lastName}`,
          'CREATED',
        ),
      })
      .catch((err) => {
        this.logger.error(
          'Background execution thread failed completely:',
          err,
        );
      });

    return {
      message: 'User created successfully',
      data: this.excludePassword(user),
    };
  }

  async getUsers(query: UserQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            {
              firstName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
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
            {
              employeeCode: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.usersRepository.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.usersRepository.count(where),
    ]);

    return {
      message: 'Users retrieved successfully',
      data: {
        items: users.map((u) => this.excludePassword(u)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.excludePassword(user);
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User retrieved successfully',
      data: this.excludePassword(user),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUpdateInput = {
      employeeCode: dto.employeeCode,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      role: dto.role,

      department: dto.departmentId
        ? {
            connect: {
              id: dto.departmentId,
            },
          }
        : undefined,
    };

    const updatedUser = await this.usersRepository.update(id, data);

    return {
      message: 'User updated successfully',
      data: this.excludePassword(updatedUser),
    };
  }

  async setUserActiveState(id: string, isActive: boolean) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!isActive) {
      // Check for active assignments before deactivation
      const activeAssignmentsCount =
        await this.prisma.equipmentAssignment.count({
          where: {
            assignedToUserId: id,
            assignmentStatus: 'ASSIGNED',
          },
        });

      if (activeAssignmentsCount > 0) {
        throw new ConflictException(
          `Cannot deactivate user with ${activeAssignmentsCount} active equipment assignments`,
        );
      }
    }

    const updatedUser = await this.usersRepository.update(id, { isActive });

    this.emailService
      .sendEmail({
        to: updatedUser.email,
        subject: `Account ${isActive ? 'Activated' : 'Deactivated'}`,
        html: userEmailTemplate(
          `${updatedUser.firstName} ${updatedUser.lastName}`,
          isActive ? 'ACTIVATED' : 'DEACTIVATED',
        ),
      })
      .catch((err) => {
        this.logger.error(
          'Background execution thread failed completely:',
          err,
        );
      });

    return {
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: this.excludePassword(updatedUser),
    };
  }
}
