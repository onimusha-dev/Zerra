class Container {
    private static instance: Container | null = null;
    private services: Map<String, unknown> = new Map();
    private factories: Map<String, () => unknown> = new Map();

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    static resetInstance(): void {
        Container.instance = null;
    }

    register<T>(key: String, instance: T): this {
        this.services.set(key, instance);
        return this;
    }

    factoryRegister<T>(key: String, factory: () => T): this {
        this.factories.set(key, factory);
        return this;
    }

    resolve<T>(key: String): T {
        if (this.services.has(key)) {
            return this.services.get(key) as T;
        }

        if (this.factories.has(key)) {
            const factory = this.factories.get(key)!;
            const instance = factory();
            this.services.set(key, instance);
            return instance as T;
        }

        throw new Error(`Service not found. ${key}`);
    }

    tryResolve<T>(key: String): T | undefined {
        try {
            return this.resolve(key);
        } catch {
            return undefined;
        }
    }

    has(key: string): boolean {
        return this.services.has(key) || this.factories.has(key);
    }

    clear(): void {
        this.factories.clear();
        this.services.clear();
    }

    keys(): String[] {
        return [...new Set([...this.services.keys(), ...this.factories.keys()])];
    }
}

/**
 * service keys for dependency injection
 */
export const ServiceKeys = {
    CONFIG: 'config',
    LOGGER: 'logger',
    HTTP_SERVER: 'httpServer',
    DATABASE: 'database',
} as const;

export const container = Container.getInstance();
