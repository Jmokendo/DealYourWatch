import type { PrismaClient } from "@prisma/client";
import type { ListingStatus } from "@/lib/api/contracts";
import { toAdminListing } from "@/lib/api/admin-queries";
import { serviceFail, serviceOk, type ServiceResult } from "@/lib/services/types";

type AdminListingDto = ReturnType<typeof toAdminListing>;

interface AdminUserDto {
  id: string;
  email: string;
  isBanned: boolean;
  role: string;
}

export async function adminApproveListing(
  db: PrismaClient,
  listingId: string,
  status: ListingStatus,
): Promise<ServiceResult<AdminListingDto>> {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) return serviceFail("Not found", 404);

  const updated = await db.listing.update({
    where: { id: listingId },
    data: { status },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return serviceOk(toAdminListing(updated));
}

export async function adminBanUser(
  db: PrismaClient,
  targetId: string,
  isBanned: boolean,
): Promise<ServiceResult<AdminUserDto>> {
  const target = await db.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });
  if (!target) return serviceFail("User not found", 404);
  if (target.role === "SUPER_ADMIN") return serviceFail("Cannot modify a SUPER_ADMIN user", 403);

  const updated = await db.user.update({
    where: { id: targetId },
    data: { isBanned },
    select: { id: true, email: true, isBanned: true, role: true },
  });

  return serviceOk(updated);
}
