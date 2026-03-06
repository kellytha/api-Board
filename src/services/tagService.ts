import { PrismaClient } from '@prisma/client';
import { ITag } from '../types/index.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const prisma = new PrismaClient();

export class TagService {
  /**
   * Create a new tag
   */
  static async createTag(name: string, color: string): Promise<ITag> {
    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      throw new ConflictError('Tag with this name already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
      },
    });

    return tag;
  }

  /**
   * Get all tags
   */
  static async getAllTags(): Promise<ITag[]> {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return tags;
  }

  /**
   * Get a tag by ID
   */
  static async getTagById(tagId: string): Promise<ITag> {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return tag;
  }

  /**
   * Get a tag by name
   */
  static async getTagByName(name: string): Promise<ITag> {
    const tag = await prisma.tag.findUnique({
      where: { name },
    });

    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return tag;
  }

  /**
   * Update a tag
   */
  static async updateTag(
    tagId: string,
    data: { name?: string; color?: string }
  ): Promise<ITag> {
    const tag = await this.getTagById(tagId);

    // Check if new name already exists
    if (data.name && data.name !== tag.name) {
      const existingTag = await prisma.tag.findUnique({
        where: { name: data.name },
      });

      if (existingTag) {
        throw new ConflictError('Tag with this name already exists');
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data,
    });

    return updatedTag;
  }

  /**
   * Delete a tag
   */
  static async deleteTag(tagId: string): Promise<void> {
    const tag = await this.getTagById(tagId);

    await prisma.tag.delete({
      where: { id: tagId },
    });
  }
}
