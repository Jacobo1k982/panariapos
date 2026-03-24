// panariapos-api/prisma/prisma.config.ts
export default {
    migrate: {
        url: process.env.DATABASE_URL,
    },
}