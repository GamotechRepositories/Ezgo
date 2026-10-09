import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { PlatformMetricsView } from './components/PlatformMetricsView';
import { ProviderKycManager } from './components/ProviderKycManager';
import { EscrowDisputeManager } from './components/EscrowDisputeManager';
import { CategoryManager } from './components/CategoryManager';
import { OccasionManager } from './components/OccasionManager';
import { AuditLogViewer } from './components/AuditLogViewer';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { api, getToken, clearToken, emptyMetrics } from './services/api';
import type { AdminMetrics, Booking, Category, Occasion, User } from './types';

type AdminTab = 'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs';

const tabFromUrl = (): AdminTab => {
  const hash = window.location.hash.replace('#', '');
  if (['kyc', 'escrow', 'categories', 'occasions', 'logs', 'metrics'].includes(hash)) {
    return hash as AdminTab;
  }
  return 'metrics';
};

export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api.me()
      .then(setCurrentAdmin)
      .catch(() => clearToken())
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">Loading...</div>;
  }
  if (!currentAdmin) return <LoginPage onSuccess={setCurrentAdmin} />;
  return (
    <AdminApp
      currentAdmin={currentAdmin}
      onLogout={() => {
        clearToken();
        setCurrentAdmin(null);
      }}
    />
  );
}

function AdminApp({ currentAdmin, onLogout }: { currentAdmin: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [providers, setProviders] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loadError, setLoadError] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    const results = await Promise.allSettled([
      api.getMetrics(),
      api.getProviders(),
      api.getBookings(),
      api.getCategories(),
      api.getOccasions(),
    ]);
    const [m, p, b, c, o] = results;
    if (m.status === 'fulfilled') setMetrics(m.value);
    if (p.status === 'fulfilled') setProviders(p.value);
    if (b.status === 'fulfilled') setBookings(b.value);
    if (c.status === 'fulfilled') setCategories(c.value);
    if (o.status === 'fulfilled') setOccasions(o.value);
    const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    setLoadError(failed ? (failed.reason as Error).message : '');
  };

  useEffect(() => {
    loadData();
  }, []);

  const closeModals = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Handle Browser Back / Forward via popstate
  useEffect(() => {
    const onPopState = () => {
      closeModals();
      setActiveTab(tabFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [closeModals]);

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModals();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModals]);

  const handleTabChange = (tab: AdminTab) => {
    closeModals();
    if (tab !== tabFromUrl()) {
      window.history.pushState(null, '', `#${tab}`);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleVerify = async (providerId: string, isVerified: boolean) => {
    try {
      await api.verifyProvider(providerId, isVerified);
      setProviders((prev) =>
        prev.map((p) =>
          p._id === providerId
            ? {
                ...p,
                isVerified,
                bankDetails: p.bankDetails
                  ? { ...p.bankDetails, isKycCompleted: isVerified }
                  : undefined,
              }
            : p
        )
      );
      setMetrics((prev) => ({
        ...prev,
        pendingVerificationCount: Math.max(0, prev.pendingVerificationCount + (isVerified ? -1 : 1)),
      }));
      addToast(
        'success',
        isVerified ? 'Vendor approved' : 'Approval removed',
        isVerified ? 'This vendor is now marked as verified.' : 'This vendor is no longer marked as verified.'
      );
    } catch (err: any) {
      addToast('error', 'Update failed', err.message);
    }
  };

  const refreshMoney = async () => {
    const [m, b] = await Promise.all([api.getMetrics(), api.getBookings()]);
    setMetrics(m);
    setBookings(b);
  };

  const handleReleasePayout = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking && !window.confirm(`Pay ₹${booking.bidAmount.toLocaleString()} to the vendor? This cannot be undone.`)) return;
    try {
      await api.completeBooking(bookingId);
      await refreshMoney();
      addToast('success', 'Vendor paid', 'The event is marked done and the vendor gets their full bid.');
    } catch (err: any) {
      addToast('error', 'Could not pay vendor', err.message);
    }
  };

  const handleIssueRefund = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    const wasPaid = booking?.status === 'ACTIVE' || booking?.status === 'DISPUTED';
    const question = wasPaid
      ? `Cancel this booking and refund ₹${booking!.totalPaid.toLocaleString()} to the host?`
      : 'Cancel this booking? The host can then choose another vendor.';
    if (!window.confirm(question)) return;
    try {
      await api.cancelBooking(bookingId, 'Cancelled by admin');
      await refreshMoney();
      addToast(
        'info',
        wasPaid ? 'Cancelled and refunded' : 'Booking cancelled',
        wasPaid ? 'The host gets back everything they paid. The request is open for bids again.' : 'The request is open for bids again.'
      );
    } catch (err: any) {
      addToast('error', 'Could not cancel booking', err.message);
    }
  };

  const handleAddCategory = async (catData: Partial<Category>) => {
    try {
      const newCat = await api.addCategory(catData);
      setCategories((prev) => [...prev, newCat]);
      addToast('success', 'Category added', `${newCat.name} is now available.`);
    } catch (err: any) {
      addToast('error', 'Could not add category', err.message);
    }
  };

  const handleUpdateCategory = async (id: string, catData: Partial<Category>) => {
    try {
      const updated = await api.updateCategory(id, catData);
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
      addToast('success', 'Photo changed', `${updated.name} has a new photo.`);
    } catch (err: any) {
      addToast('error', 'Could not change photo', err.message);
    }
  };

  const handleAddOccasion = async (occData: Partial<Occasion>) => {
    try {
      const newOcc = await api.addOccasion(occData);
      setOccasions((prev) => [...prev, newOcc]);
      addToast('success', 'Occasion added', `${newOcc.name} now shows in the host app.`);
    } catch (err: any) {
      addToast('error', 'Could not add occasion', err.message);
    }
  };

  const handleUpdateOccasion = async (id: string, occData: Partial<Occasion>) => {
    try {
      const updated = await api.updateOccasion(id, occData);
      setOccasions((prev) => prev.map((o) => (o._id === id ? updated : o)));
      addToast('success', 'Photo changed', `${updated.name} has a new photo.`);
    } catch (err: any) {
      addToast('error', 'Could not change photo', err.message);
    }
  };

  const handleDeleteOccasion = async (id: string) => {
    try {
      await api.deleteOccasion(id);
      setOccasions((prev) => prev.filter((o) => o._id !== id));
      addToast('info', 'Occasion removed', 'It no longer shows in the host app.');
    } catch (err: any) {
      addToast('error', 'Could not remove occasion', err.message);
    }
  };

  const pendingKycCount = (providers || []).filter((p) => !p.isVerified).length;
  const activeEscrowCount = (bookings || []).filter((b) => b.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Left Sidebar */}
      <AdminSidebar
        admin={currentAdmin}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingKycCount={pendingKycCount}
        activeEscrowCount={activeEscrowCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          admin={currentAdmin}
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          pendingKycCount={pendingKycCount}
          activeEscrowCount={activeEscrowCount}
          onTabChange={handleTabChange}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loadError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm">{loadError} Some numbers below may be missing.</p>
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-full bg-white border border-rose-200 text-sm font-semibold hover:bg-rose-100 transition cursor-pointer shrink-0"
              >
                Try again
              </button>
            </div>
          )}

          {activeTab === 'metrics' && (
            <PlatformMetricsView metrics={metrics} />
          )}

          {activeTab === 'kyc' && (
            <ProviderKycManager
              providers={providers}
              onToggleVerify={handleToggleVerify}
            />
          )}

          {activeTab === 'escrow' && (
            <EscrowDisputeManager
              bookings={bookings}
              onReleasePayout={handleReleasePayout}
              onIssueRefund={handleIssueRefund}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          )}

          {activeTab === 'occasions' && (
            <OccasionManager
              occasions={occasions}
              onAddOccasion={handleAddOccasion}
              onUpdateOccasion={handleUpdateOccasion}
              onDeleteOccasion={handleDeleteOccasion}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogViewer transactions={metrics.recentTransactions || []} />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50">
          EzzyGo admin
        </footer>
      </div>
    </div>
  );
}