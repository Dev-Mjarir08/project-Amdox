import { useNavigate } from 'react-router-dom';

export default function PendingApprovals({ data = [] }) {
  const navigate = useNavigate();

  const getRoute = (label) => {
    if (label.includes("Leave")) return "/admin/leave-management";
    if (label.includes("Purchase")) return "/admin/purchase-orders";
    if (label.includes("Invoice")) return "/admin/sales";
    return "/admin/dashboard";
  };

  return (
    <article className="erp-panel rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-600">Pending Approvals</h3>
      <p className="mt-1 text-xs text-slate-400">Approve or reject items</p>

      <div className="mt-4 space-y-3">
        {data.length === 0 ? (
          <div className="text-sm text-slate-400 py-2">No pending approvals.</div>
        ) : (
          data.map((it) => (
            <div key={it.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-semibold">{it.label}</p>
                <p className="text-xs text-slate-400">{it.value} pending</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(getRoute(it.label))} 
                  className="text-sm text-primary font-bold hover:underline"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
