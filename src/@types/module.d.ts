declare namespace NodeJS {
    interface ProcessEnv {
        readonly DB_CONNECT: string
        readonly USER_DEFAULT_IMG: string
        readonly JWT_SECRET: string
    }
}