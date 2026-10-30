import { useState, useEffect, useCallback } from 'react';
import { AdminSidebar, type AdminTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { PlatformMetricsView } from './components/PlatformMetricsView';
import { RequirementManager } from './components/RequirementManager';
import { ProviderKycManager } from './components/ProviderKycManager';
import { UserManager } from './components/UserManager';
import { EscrowDisputeManager } from './components/EscrowDisputeManager';
import { CategoryManager } from './components/CategoryManager';
import { OccasionManager } from './components/OccasionManager';
import { BannerManager } from './components/BannerManager';
import { AuditLogViewer } from './components/AuditLogViewer';
import { AdminAccountModal } from './components/AdminAccountModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { LoginPage } from './components/LoginPage';
import { api, getToken, clearToken, emptyMetrics } from './services/api';
import { getSocket } from './services/socket';
import type { AdminMetrics, Booking, Category, Occasion, User, AuditLog, Banner } from './types';

const VALID_TABS: AdminTab[] = [
  'metrics',
  'requirements',
  'escrow',
  'kyc',
  'users',
  'categories',
  'occasions',
  'banners',
  'logs',
];

const tabFromUrl = (): AdminTab => {
  const hash = window.location.hash.replace('#', '') as AdminTab;
  if (VALID_TABS.includes(hash)) {
    return hash;
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
      onUpdateAdmin={setCurrentAdmin}
      onLogout={async () => {
        await api.logout();
        setCurrentAdmin(null);
      }}
    />
  );
}

function AdminApp({
  currentAdmin,
  onUpdateAdmin,
  onLogout,
}: {
  currentAdmin: User;
  onUpdateAdmin?: (u: User) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetrics>(emptyMetrics);
  const [providers, setProviders] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRefreshLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const [logs, m] = await Promise.all([
        api.getAuditLogs(),
        api.getMetrics(),
      ]);
      setAuditLogs(logs);
      setMetrics(m);
      addToast('info', 'Logs Refreshed', 'Latest audit entries and ledger transactions loaded.');
    } catch (err: any) {
      addToast('error', 'Could not refresh logs', err.message);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadData = async () => {
    const results = await Promise.allSettled([
      api.getMetrics(),
      api.getProviders(),
      api.getBookings(),
      api.getCategories(),
      api.getOccasions(),
      api.getBanners({ all: true }),
      api.getAuditLogs(),
      api.getRequirements(),
      api.getAllUsers(),
    ]);
    const [m, p, b, c, o, bn, l, reqs, users] = results;
    if (m.status === 'fulfilled') setMetrics(m.value);
    if (p.status === 'fulfilled') setProviders(p.value);
    if (b.status === 'fulfilled') setBookings(b.value);
    if (c.status === 'fulfilled') setCategories(c.value);
    if (o.status === 'fulfilled') setOccasions(o.value);
    if (bn.status === 'fulfilled') setBanners(bn.value);
    if (l && l.status === 'fulfilled') setAuditLogs(l.value);
    if (reqs && reqs.status === 'fulfilled') setRequirements(reqs.value);
    if (users && users.status === 'fulfilled') setAllUsers(users.value);

    const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    setLoadError(failed ? (failed.reason as Error).message : '');
  };

  useEffect(() => {
    loadData();

    // Auto-sync every 12s so admin sees live vendor reminders & KYC updates without manual reload
    const pollInterval = setInterval(() => {
      Promise.allSettled([
        api.getProviders(),
        api.getMetrics(),
        api.getAuditLogs(),
      ]).then(([p, m, l]) => {
        if (p.status === 'fulfilled') setProviders(p.value);
        if (m.status === 'fulfilled') setMetrics(m.value);
        if (l && l.status === 'fulfilled') setAuditLogs(l.value);
      });
    }, 12000);

    const onWindowFocus = () => {
      Promise.allSettled([
        api.getProviders(),
        api.getMetrics(),
        api.getAuditLogs(),
      ]).then(([p, m, l]) => {
        if (p.status === 'fulfilled') setProviders(p.value);
        if (m.status === 'fulfilled') setMetrics(m.value);
        if (l && l.status === 'fulfilled') setAuditLogs(l.value);
      });
    };

    window.addEventListener('focus', onWindowFocus);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  // Real-time WebSocket connection for live Admin alerts & instant desk updates
  useEffect(() => {
    if (!currentAdmin?._id) return;
    const socket = getSocket();

    socket.emit('join:admin');
    socket.emit('join:user', currentAdmin._id);

    const handleReqCreated = (newReq: any) => {
      setRequirements((prev) => {
        if (prev.some((r) => String(r._id) === String(newReq._id))) return prev;
        return [newReq, ...prev];
      });
      addToast('info', 'New Request Posted', `${newReq.title} (${newReq.location?.city || 'India'})`);
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleReqUpdated = (updatedReq: any) => {
      setRequirements((prev) =>
        prev.map((r) => {
          if (String(r._id) === String(updatedReq._id)) {
            return {
              ...r,
              ...updatedReq,
              bids: updatedReq.bids ?? r.bids,
              lowestBid: updatedReq.lowestBid !== undefined ? updatedReq.lowestBid : r.lowestBid,
              bidsCount: updatedReq.bidsCount !== undefined ? updatedReq.bidsCount : r.bidsCount,
            };
          }
          return r;
        })
      );
    };

    const handleBidPlaced = (data: { requirementId: string; bid: any; lowestBid: number; bidsCount: number }) => {
      setRequirements((prev) =>
        prev.map((req) => {
          if (String(req._id) === String(data.requirementId)) {
            const existingBids = req.bids || [];
            const filteredBids = existingBids.filter((b: any) => String(b._id) !== String(data.bid?._id));
            const newBids = data.bid ? [data.bid, ...filteredBids] : existingBids;
            const computedLowest = data.lowestBid ?? (newBids.length > 0 ? Math.min(...newBids.map((b: any) => b.amount)) : req.lowestBid);
            return {
              ...req,
              lowestBid: computedLowest,
              bidsCount: data.bidsCount ?? newBids.length,
              bids: newBids,
            };
          }
          return req;
        })
      );
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleBookingCreated = (newBooking: Booking) => {
      setBookings((prev) => {
        if (prev.some((b) => String(b._id) === String(newBooking._id))) return prev;
        return [newBooking, ...prev];
      });
      addToast('success', 'New Booking Created', `₹${newBooking.totalPaid?.toLocaleString()} — ${newBooking.requirementId?.title || 'Event'}`);
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleBookingUpdated = (updatedBooking: Booking) => {
      setBookings((prev) =>
        prev.map((b) => (String(b._id) === String(updatedBooking._id) ? { ...b, ...updatedBooking } : b))
      );
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleDisputeRaised = (data: { booking: Booking; disputeReason: string }) => {
      if (data.booking) {
        setBookings((prev) =>
          prev.map((b) => (String(b._id) === String(data.booking._id) ? { ...b, ...data.booking } : b))
        );
      }
      addToast('warning', '⚠️ Dispute Raised!', `Booking #${String(data.booking?._id || '').slice(-6)}: ${data.disputeReason || 'Action required'}`);
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleDisputeResolved = (data: { booking: Booking; action: string }) => {
      if (data.booking) {
        setBookings((prev) =>
          prev.map((b) => (String(b._id) === String(data.booking._id) ? { ...b, ...data.booking } : b))
        );
      }
      addToast('info', 'Dispute Resolved', `Action: ${data.action}`);
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    const handleKycUpdated = (data: { providerId: string; isVerified: boolean; provider?: User }) => {
      if (data.provider) {
        setProviders((prev) =>
          prev.map((p) => (String(p._id) === String(data.providerId) ? { ...p, ...data.provider! } : p))
        );
        setAllUsers((prev) =>
          prev.map((u) => (String(u._id) === String(data.providerId) ? { ...u, ...data.provider! } : u))
        );
      } else {
        api.getProviders().then(setProviders).catch(() => {});
      }
      api.getMetrics().then(setMetrics).catch(() => {});
    };

    socket.on('requirement:created', handleReqCreated);
    socket.on('requirement:updated', handleReqUpdated);
    socket.on('bid:placed', handleBidPlaced);
    socket.on('booking:created', handleBookingCreated);
    socket.on('booking:updated', handleBookingUpdated);
    socket.on('dispute:raised', handleDisputeRaised);
    socket.on('dispute:resolved', handleDisputeResolved);
    socket.on('kyc:updated', handleKycUpdated);

    return () => {
      socket.off('requirement:created', handleReqCreated);
      socket.off('requirement:updated', handleReqUpdated);
      socket.off('bid:placed', handleBidPlaced);
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:updated', handleBookingUpdated);
      socket.off('dispute:raised', handleDisputeRaised);
      socket.off('dispute:resolved', handleDisputeResolved);
      socket.off('kyc:updated', handleKycUpdated);
    };
  }, [currentAdmin?._id]);

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

  const handleToggleVerify = async (providerId: string, isVerified: boolean, notes?: string, rejectionReason?: string) => {
    try {
      const updated = await api.verifyProvider(providerId, isVerified, notes, rejectionReason);
      setProviders((prev) =>
        prev.map((p) =>
          p._id === providerId
            ? {
                ...p,
                isVerified,
                bankDetails: p.bankDetails
                  ? { ...p.bankDetails, isKycCompleted: isVerified }
                  : undefined,
                kycDocuments: p.kycDocuments
                  ? { ...p.kycDocuments, rejectionReason: isVerified ? '' : (rejectionReason || notes || '') }
                  : undefined,
                verificationAudit: updated.verificationAudit || p.verificationAudit,
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
        isVerified ? 'Vendor approved' : (rejectionReason ? 'Verification rejected' : 'Approval removed'),
        isVerified ? 'This vendor is now marked as verified.' : (rejectionReason ? `Reason sent to vendor: "${rejectionReason}"` : 'This vendor is no longer marked as verified.')
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

  const handleResolveDispute = async (bookingId: string, action: 'PAYOUT_VENDOR' | 'REFUND_HOST' | 'DISMISS', note?: string) => {
    try {
      await api.resolveDispute(bookingId, action, note);
      await refreshMoney();
      addToast(
        'success',
        'Dispute Resolved',
        action === 'PAYOUT_VENDOR'
          ? 'Escrow released to vendor.'
          : action === 'REFUND_HOST'
          ? 'Escrow refunded to host.'
          : 'Dispute dismissed. Booking returned to active.'
      );
    } catch (err: any) {
      addToast('error', 'Could not resolve dispute', err.message);
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

  const handleAddBanner = async (data: Partial<Banner>) => {
    try {
      const created = await api.addBanner(data);
      setBanners((prev) => [created, ...prev]);
      addToast('success', 'Ad Banner Published', 'Your promotional ad is now live on the user portal.');
    } catch (err: any) {
      addToast('error', 'Failed to publish ad', err.message);
    }
  };

  const handleUpdateBanner = async (id: string, data: Partial<Banner>) => {
    try {
      const updated = await api.updateBanner(id, data);
      setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
      addToast('success', 'Ad Banner Updated', 'Changes applied to promotional ad.');
    } catch (err: any) {
      addToast('error', 'Failed to update ad', err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await api.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      addToast('info', 'Ad Banner Removed', 'Advertisement banner deleted.');
    } catch (err: any) {
      addToast('error', 'Failed to delete ad', err.message);
    }
  };

  const handleDeleteRequirement = async (id: string) => {
    try {
      await api.deleteRequirement(id);
      setRequirements((prev) => prev.filter((r) => r._id !== id));
      addToast('success', 'Requirement removed', 'Event requirement and bids deleted.');
    } catch (err: any) {
      addToast('error', 'Could not delete requirement', err.message);
    }
  };

  const handleUpdateRequirement = async (id: string, data: Partial<any>) => {
    try {
      const res = await api.updateRequirement(id, data);
      const updated = res.data || res;
      setRequirements((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...updated, bids: updated.bids ?? r.bids } : r))
      );
      addToast('success', 'Price Updated', 'Requirement budget and ceiling updated successfully.');
    } catch (err: any) {
      addToast('error', 'Could not update requirement', err.message);
      throw err;
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: updated.role, roles: updated.roles } : u))
      );
      addToast('success', 'Role updated', `User permissions changed to ${newRole}.`);
    } catch (err: any) {
      addToast('error', 'Could not update role', err.message);
    }
  };

  const pendingKycCount = (providers || []).filter((p) => !p.isVerified).length;
  const activeEscrowCount = (bookings || []).filter((b) => b.status === 'ACTIVE').length;
  const openRequirementsCount = (requirements || []).filter((r) => r.status === 'OPEN').length;
  const reminderCount = (providers || []).filter(
    (p) =>
      !p.isVerified &&
      Boolean(
        p.kycDocuments?.reviewRequestedAt ||
        p.verificationAudit?.some((a) => a.reviewedByName === 'Vendor Reminder' || a.action === 'PROVIDER_REVIEW_REMINDER')
      )
  ).length;

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
        openRequirementsCount={openRequirementsCount}
        reminderCount={reminderCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          admin={currentAdmin}
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          pendingKycCount={pendingKycCount}
          activeEscrowCount={activeEscrowCount}
          reminderCount={reminderCount}
          onTabChange={handleTabChange}
          onLogout={onLogout}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
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
            <PlatformMetricsView
              metrics={metrics}
              providers={providers}
              bookings={bookings}
              requirements={requirements}
              currentAdmin={currentAdmin}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'requirements' && (
            <RequirementManager
              requirements={requirements}
              onDeleteRequirement={handleDeleteRequirement}
              onUpdateRequirement={handleUpdateRequirement}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'kyc' && (
            <ProviderKycManager
              providers={providers}
              onToggleVerify={handleToggleVerify}
            />
          )}

          {activeTab === 'users' && (
            <UserManager
              users={allUsers}
              currentAdminId={currentAdmin._id}
              onUpdateRole={handleUpdateUserRole}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'escrow' && (
            <EscrowDisputeManager
              bookings={bookings}
              onReleasePayout={handleReleasePayout}
              onIssueRefund={handleIssueRefund}
              onResolveDispute={handleResolveDispute}
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

          {activeTab === 'banners' && (
            <BannerManager
              banners={banners}
              onAddBanner={handleAddBanner}
              onUpdateBanner={handleUpdateBanner}
              onDeleteBanner={handleDeleteBanner}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogViewer
              logs={auditLogs}
              transactions={metrics.recentTransactions || []}
              onRefresh={handleRefreshLogs}
              isLoading={isLoadingLogs}
            />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50">
          EzzyGo Event Marketplace &bull; Operations & Administration Panel
        </footer>
      </div>

      <AdminAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        admin={currentAdmin}
        onUpdateAdmin={(updated) => {
          if (onUpdateAdmin) onUpdateAdmin(updated);
        }}
        onLogout={onLogout}
        onShowToast={addToast}
      />
    </div>
  );
}