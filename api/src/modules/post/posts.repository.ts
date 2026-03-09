import { DatabaseService } from '@platform/database';
import { CreatePostSchema, UpdatePostSchema } from './posts.validator';

export class PostRepository {
    constructor(private readonly db: DatabaseService) {}

    get post() {
        return this.db.prisma.post;
    }

    async findAll() {
        return this.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findById(id: number) {
        return this.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async createPost(authorId: number, data: CreatePostSchema) {
        return this.post.create({
            data: {
                ...data,
                authorId,
            },
        });
    }

    async updatePost(id: number, data: UpdatePostSchema) {
        return this.post.update({
            where: { id },
            data,
        });
    }

    async deletePost(id: number) {
        return this.post.delete({
            where: { id },
        });
    }

    async findByAuthorId(authorId: number) {
        return this.post.findMany({
            where: { authorId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
