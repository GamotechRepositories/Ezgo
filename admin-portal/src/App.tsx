import { useState, useEffect } from 'react';
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
import { api, mockAdminUser, mockMetrics, mockProviders, mockCategories } from './services/api';
import type { AdminMetrics, Booking, Category, Occasion, User } from './types';

export default function App() {
  const [currentAdmin, setCurrentAdmin] = useState<User>(mockAdminUser);
  const [activeTab, setActiveTab] = useState<'metrics' | 'kyc' | 'escrow' | 'categories' | 'occasions' | 'logs'>('metrics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [metrics, setMetrics] = useState<AdminMetrics>(mockMetrics);
  const [providers, setProviders] = useState<User[]>(mockProviders);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      const [m, p, b, c, u, o] = await Promise.allSettled([
        api.getMetrics(),
        api.getProviders(),
        api.getBookings(),
        api.getCategories(),
        api.getAdminUser(),
        api.getOccasions(),
      ]);
      if (m.status === 'fulfilled' && m.value) setMetrics(m.value);
      if (p.status === 'fulfilled' && p.value && p.value.length > 0) setProviders(p.value);
      if (b.status === 'fulfilled' && b.value) setBookings(b.value);
      if (c.status === 'fulfilled' && c.value && c.value.length > 0) setCategories(c.value);
      if (u.status === 'fulfilled' && u.value) setCurrentAdmin(u.value);
      if (o.status === 'fulfilled' && o.value && o.value.length > 0) setOccasions(o.value);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
  }, []);

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
        isVerified ? 'KYC Verification Approved' : 'KYC Verification Revoked',
        `Provider KYC credentials have been ${isVerified ? 'verified & activated' : 'revoked'}.`
      );
    } catch (_) {
      addToast('error', 'Update Failed', 'Could not update provider KYC status.');
    }
  };

  const handleReleasePayout = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: 'PAYOUT_RELEASED' } : b))
    );
    addToast('success', 'Escrow Released to Vendor', `Payout dispatched for booking ID: ${bookingId.substring(0, 8)}.`);
  };

  const handleIssueRefund = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );
    addToast('info', 'Refund Processed', `100% refund initiated to host for booking ID: ${bookingId.substring(0, 8)}.`);
  };

  const handleAddCategory = async (catData: Partial<Category>) => {
    try {
      const newCat = await api.addCategory(catData);
      setCategories((prev) => [...prev, newCat]);
      addToast('success', 'Category Created', `${newCat.name} is now available platform-wide.`);
    } catch (_) {}
  };

  const handleAddOccasion = async (occData: Partial<Occasion>) => {
    try {
      const newOcc = await api.addOccasion(occData);
      setOccasions((prev) => {
        const filtered = prev.filter(o => o.slug !== newOcc.slug && (o._id ? o._id !== newOcc._id : true));
        return [...filtered, newOcc];
      });
      addToast('success', 'Occasion Card Added', `${newOcc.name} is now live in the 3D gallery.`);
    } catch (err: any) {
      addToast('error', 'Failed to Add Occasion', err.message);
    }
  };

  const handleDeleteOccasion = async (id: string) => {
    try {
      await api.deleteOccasion(id);
      setOccasions((prev) => prev.filter((o) => o._id !== id && o.id !== id && o.slug !== id));
      addToast('info', 'Occasion Removed', 'The occasion card has been removed.');
    } catch (_) {}
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
        onTabChange={setActiveTab}
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
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
            />
          )}

          {activeTab === 'occasions' && (
            <OccasionManager
              occasions={occasions}
              onAddOccasion={handleAddOccasion}
              onDeleteOccasion={handleDeleteOccasion}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogViewer />
          )}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-400 bg-white/50">
          EzGo Admin Operations Control Center • Protected by Smart Escrow Vault Custody
        </footer>
      </div>
    </div>
  );
}