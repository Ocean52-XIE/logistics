import { AdminShell } from "@/components/prototype/admin-shell";
import { getAdminUsers } from "@/lib/api-server";

export default async function AdminUsersPage() {
  const users = (await getAdminUsers()) ?? [];

  return (
    <AdminShell
      activeHref="/admin/users"
      title="人员查看"
      subtitle="用于培训计划指派前确认人员范围，首版仅提供基础查看。"
    >
      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">员工列表</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">姓名</th>
                <th className="pb-2">用户 ID</th>
                <th className="pb-2">角色</th>
                <th className="pb-2">组织</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.id}</td>
                  <td className="py-2">{user.role}</td>
                  <td className="py-2">{user.organizationName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
