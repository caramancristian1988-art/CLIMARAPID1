import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csvData =
    "Email,Data abonarii\n" +
    subscribers
      .map((s) => `${s.email},${new Date(s.createdAt).toLocaleDateString("ro-RO")}`)
      .join("\n");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminPageHeader title="Newsletter" subtitle={`${subscribers.length} abonat${subscribers.length !== 1 ? "ți" : ""}`} />

      {subscribers.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
          Niciun abonat încă.
        </div>
      ) : (
        <>
          <div className="mt-6 flex justify-end">
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`}
              download="abonati-newsletter.csv"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c7092b] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
          </div>

          <div className="mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{subscribers.length - i}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{s.email}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
