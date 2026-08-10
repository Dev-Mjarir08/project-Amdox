import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const actions = [
    { label: '+ Add Employee', path: '/admin/employees', modal: 'addEmployee' },
    { label: '+ Create Purchase Order', path: '/admin/purchase-orders', modal: 'createPO' },
    { label: '+ Generate Invoice', path: '/admin/accounts-receivable', modal: 'generateInvoice' },
    { label: '+ Create Project', path: '/admin/projects', modal: 'createProject' },
    { label: '+ Run Forecast', path: '/admin/dashboard', modal: 'runForecast' },
  ];

  const handleActionClick = (action) => {
    setActiveModal(action.modal);
    navigate(action.path);
  };

  return (
    <article className="erp-panel rounded-xl p-4">
      <h4 className="text-sm font-semibold text-slate-600">Quick Actions</h4>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleActionClick(action)}
            className="erp-focus rounded-md border px-3 py-2 text-sm text-slate-500 transition hover:border-primary/40 hover:text-primary"
          >
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}
