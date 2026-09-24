import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { effectiveTier, requireAdmin } from "@/lib/auth";
import { updateUserAccess } from "@/lib/actions/admin";

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(500);
  const tiers = await Promise.all(rows.map((u) => effectiveTier(u)));
  return (
    <div>
      <h1 className="section-title">Members</h1>
      <p className="mt-2 text-sm text-muted">Premium normally follows an active subscription. An override forces a tier regardless of billing.</p>
      <div className="card mt-6 overflow-x-auto !p-0">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Current tier</th><th>Access</th></tr></thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td className="whitespace-nowrap">{u.createdAt.toLocaleDateString("en-US")}</td>
                <td>{tiers[i] === "PREMIUM" ? "Premium" : "Basic"}</td>
                <td>
                  <form action={updateUserAccess} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="tierOverride" defaultValue={u.tierOverride ?? ""} className="field !w-auto !py-1" aria-label="Tier override">
                      <option value="">Follow billing</option><option value="BASIC">Force basic</option><option value="PREMIUM">Force premium</option>
                    </select>
                    <select name="role" defaultValue={u.role} className="field !w-auto !py-1" aria-label="Role" disabled={u.id === me.id}>
                      <option value="MEMBER">Member</option><option value="ADMIN">Admin</option>
                    </select>
                    {u.id === me.id && <input type="hidden" name="role" value="ADMIN" />}
                    <button className="btn-navy !px-3 !py-1">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
