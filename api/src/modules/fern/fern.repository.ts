import { DatabaseService } from '@platform/database';
import { LoggerService } from '@platform/logger/logger.service';

export class FernRepository {
    private static instance: FernRepository | null = null;
    private static db: DatabaseService;
    private static logger: LoggerService;
    constructor(db: DatabaseService, logger: LoggerService) {
        FernRepository.db = db;
        FernRepository.logger = logger;
    }

    static getInstance(db: DatabaseService, logger: LoggerService): FernRepository {
        if (!FernRepository.instance) {
            FernRepository.instance = new FernRepository(db, logger);
        }
        return FernRepository.instance;
    }
    get fernChatSession() {
        return FernRepository.db.prisma.fernChatSession;
    }

    get fernChatMessage() {
        return FernRepository.db.prisma.fernChatMessage;
    }

    async findSession(sessionId: string) {
        return this.fernChatSession.findUnique({
            where: { id: sessionId },
        });
    }

    async createChatSession(userId: number) {
        return this.fernChatSession.create({
            data: {
                userId: userId,
                name: 'New Chat',
            },
        });
    }

    async saveMessage(data: {
        sessionId: string;
        role: string;
        userPrompt: string;
        aiResponse: string;
        reasoning?: string;
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
        totalDuration?: bigint;
        loadDuration?: bigint;
        promptEvalCount?: number;
        promptEvalDuration?: bigint;
        evalCount?: number;
        evalDuration?: bigint;
        metadata?: any;
    }) {
        return this.fernChatMessage.create({
            data: {
                sessionId: data.sessionId,
                role: data.role,
                userPrompt: data.userPrompt,
                aiResponse: data.aiResponse,
                reasoning: data.reasoning,
                promptTokens: data.promptTokens,
                completionTokens: data.completionTokens,
                totalTokens: data.totalTokens,
                totalDuration: data.totalDuration,
                loadDuration: data.loadDuration,
                promptEvalCount: data.promptEvalCount,
                promptEvalDuration: data.promptEvalDuration,
                evalCount: data.evalCount,
                evalDuration: data.evalDuration,
                metadata: data.metadata || {},
            },
        });
    }

    async getSessionMessages(sessionId: string) {
        return this.fernChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getAllSessions(userId: number) {
        return this.fernChatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async renameSession(sessionId: string, name: string) {
        return this.fernChatSession.update({
            where: { id: sessionId },
            data: { name },
        });
    }

    async deleteSession(sessionId: string) {
        return this.fernChatSession.delete({
            where: { id: sessionId },
        });
    }
}
