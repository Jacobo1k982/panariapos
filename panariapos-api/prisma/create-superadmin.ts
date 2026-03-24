import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash   = await bcrypt.hash("SuperAdmin1234!", 12)
  const tenant = await prisma.tenant.findFirst()

  if (!tenant) {
    console.log("❌ No hay tenants registrados")
    return
  }

  await prisma.user.upsert({
    where:  { tenantId_email: { tenantId: tenant.id, email: "superadmin@panariapos.com" } },
    update: {},
    create: {
      tenantId:     tenant.id,
      name:         "Super Admin",
      email:        "superadmin@panariapos.com",
      passwordHash: hash,
      role:         "SUPER_ADMIN",
    },
  })

  console.log("✅ Super Admin creado")
  console.log("📧 Email:      superadmin@panariapos.com")
  console.log("🔑 Contraseña: SuperAdmin1234!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
