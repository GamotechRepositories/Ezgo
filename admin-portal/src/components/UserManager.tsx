import React, { useState } from 'react';
import {
  Search,
  Shield,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  MapPin,
  Ban,
  Unlock,
} from 'lucide-react';
import type { User } from '../types';

interface UserManagerProps {
  users: User[];
  currentAdminId?: string;
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onToggleBan: (userId: string, isBanned: boolean, banReason?: string) => Promise<void>;
  onRefresh: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentAdminId,
  onUpdateRole,
  onToggleBan,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    userName: string;
    newRole: string;
  } | null>(null);

  const [banModal, setBanModal] = useState<{
    user: User;
    action: 'BAN' | 'UNBAN';
    reason: string;
  } | null>(null);

  // Aggregate stats
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin' || (u as any).roles?.includes('admin')).length;
  const totalVendors = users.filter((u) => u.role === 'provider' || (u as any).roles?.includes('provider')).length;
  const totalHosts = users.filter((u) => u.role === 'requester' || (u as any).roles?.includes('requester')).length;
  const totalBanned = users.filter((u) => u.isBanned).length;

  // Extract cities
  const userCities = Array.from(
    new Set(
      users
        .map((u) => u.serviceArea || (u.kycDocuments as any)?.businessAddress)
        .filter((c): c is string => Boolean(c && typeof c === 'string'))
    )
  );

  // Filter logic
  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL') {
      const matchRole = u.role === roleFilter || (u as any).roles?.includes(roleFilter);
      if (!matchRole) return false;
    }
    if (statusFilter === 'BANNED' && !u.isBanned) return false;
    if (statusFilter === 'ACTIVE' && u.isBanned) return false;

    if (cityFilter !== 'ALL') {
      const userLoc = (u.serviceArea || (u.kycDocuments as any)?.businessAddress || '').toLowerCase();
      const filterKey = cityFilter.toLowerCase().split(' ')[0];
      if (!userLoc.includes(filterKey)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const phoneMatch = u.phone?.toLowerCase().includes(q);
      const bizMatch = u.businessName?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !bizMatch) return false;
    }
    return true;
  });

  const handleApplyRole = async () => {
    if (!confirmRoleChange) return;
    setUpdatingId(confirmRoleChange.userId);
    try {
      await onUpdateRole(confirmRoleChange.userId, confirmRoleChange.newRole);
      setConfirmRoleChange(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmBanToggle = async () => {
    if (!banModal) return;
    setUpdatingId(banModal.user._id);
    try {
      const shouldBan = banModal.action === 'BAN';
      await onToggleBan(banModal.user._id, shouldBan, banModal.reason);
      setBanModal(null);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management & Access Control</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Directory of all registered hosts, vendors, and administrators across the EzzyGo marketplace.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          Refresh Directory
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</div>
          <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
          <div className="text-xs text-slate-400">All registered users</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrators</span>
          </div>
          <div className="text-2xl font-bold text-rose-700">{totalAdmins}</div>
          <div className="text-xs text-slate-400">Full platform privileges</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-[#ff5c28] uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Vendors</span>
          </div>
          <div className="text-2xl font-bold text-[#ff5c28]">{totalVendors}</div>
          <div className="text-xs text-slate-400">Service providers</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5" />
            <span>Hosts</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{totalHosts}</div>
          <div className="text-xs text-slate-400">Event hosts / requesters</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" />
            <span>Suspended</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{totalBanned}</div>
          <div className="text-xs text-slate-400">Banned accounts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or business..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff5c28] focus:ring-2 focus:ring-[#ff5c28]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            {(['ALL', 'ACTIVE', 'BANNED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Suspended'}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            {(['ALL', 'admin', 'provider', 'requester'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All' : r === 'admin' ? 'Admins' : r === 'provider' ? 'Vendors' : 'Hosts'}
              </button>
            ))}
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#ff5c28]"
          >
            <option value="ALL">All Cities ({users.length})</option>
            {userCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User / Account</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">City / Region</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Status & Trust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const isAdmin = user.role === 'admin' || (user as any).roles?.includes('admin');
                const isProvider = user.role === 'provider' || (user as any).roles?.includes('provider');
                const isSelf = user._id === currentAdminId;

                return (
                  <tr key={user._id} className={`hover:bg-slate-50/60 transition ${user.isBanned ? 'bg-red-50/40' : ''}`}>
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            user.isBanned
                              ? 'bg-red-100 text-red-700'
                              : isAdmin
                              ? 'bg-rose-100 text-rose-700'
                              : isProvider
                              ? 'bg-orange-100 text-[#ff5c28]'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-normal">
                                You
                              </span>
                            )}
                            {user.isBanned && (
                              <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                Suspended
                              </span>
                            )}
                          </div>
                          {user.businessName && (
                            <div className="text-xs text-slate-500 truncate">{user.businessName}</div>
                          )}
                          <div className="text-[11px] text-slate-400">
                            Joined {new Date((user as any).createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-xs">
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No email</span>
                        )}
                        {user.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </div>
                    </td>

                    {/* City / Region */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {user.serviceArea || (user.kycDocuments as any)?.businessAddress || 'All Regions'}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isProvider
                            ? 'bg-orange-50 text-[#ff5c28] border border-orange-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isAdmin ? <Shield className="w-3 h-3" /> : isProvider ? <Briefcase className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>

                    {/* Status & Trust */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-xs">
                        {user.isBanned ? (
                          <div className="text-red-700 font-semibold flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5 text-red-600" />
                            <span>Account Banned</span>
                          </div>
                        ) : user.isVerified ? (
                          <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified KYC</span>
                          </div>
                        ) : isProvider ? (
                          <div className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unverified</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">Active</span>
                        )}
                        {user.isBanned && user.banReason && (
                          <div className="text-[11px] text-red-600 truncate max-w-[160px]" title={user.banReason}>
                            Reason: {user.banReason}
                          </div>
                        )}
                        {!user.isBanned && user.completedJobs !== undefined && user.completedJobs > 0 && (
                          <div className="text-[11px] text-slate-500">
                            {user.completedJobs} completed booking{user.completedJobs === 1 ? '' : 's'}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions: Role Changer & Ban Toggle */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <select
                          value={user.role}
                          disabled={updatingId === user._id || isSelf}
                          onChange={(e) => {
                            const nextRole = e.target.value;
                            if (nextRole !== user.role) {
                              setConfirmRoleChange({
                                userId: user._id,
                                userName: user.name,
                                newRole: nextRole,
                              });
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#ff5c28] cursor-pointer disabled:opacity-50"
                        >
                          <option value="requester">Host</option>
                          <option value="provider">Vendor</option>
                          <option value="admin">Administrator</option>
                        </select>

                        {!isSelf && (
                          user.isBanned ? (
                            <button
                              type="button"
                              onClick={() => setBanModal({ user, action: 'UNBAN', reason: '' })}
                              disabled={updatingId === user._id}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                              title="Unban account"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBanModal({ user, action: 'BAN', reason: '' })}
                              disabled={updatingId === user._id}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                              title="Suspend / Ban account"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Ban</span>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirmation Modal */}
      {confirmRoleChange && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-[#ff5c28] flex items-center justify-center border border-slate-200 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Role Change</h3>
                <p className="text-xs text-slate-500">Admin Permission Adjustment</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to change the role of{' '}
              <strong className="text-slate-900">{confirmRoleChange.userName}</strong> to{' '}
              <span className="font-bold text-[#ff5c28] uppercase">{confirmRoleChange.newRole}</span>?
            </p>

            {confirmRoleChange.newRole === 'admin' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>
                  Granting administrator privileges gives this user full control over escrow releases, vendor verification, disputes, and all platform settings.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRoleChange(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRole}
                className="px-4 py-2 rounded-xl bg-[#ff5c28] hover:bg-[#e64814] text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                Apply Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Ban / Unban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                banModal.action === 'BAN' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }`}>
                {banModal.action === 'BAN' ? <Ban className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {banModal.action === 'BAN' ? 'Suspend User Account' : 'Restore User Account'}
                </h3>
                <p className="text-xs text-slate-500">Security & Enforcement Action</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {banModal.action === 'BAN' ? (
                <>
                  Are you sure you want to suspend <strong className="text-slate-900">{banModal.user.name}</strong> ({banModal.user.email || banModal.user.phone})? They will be immediately blocked from logging in, bidding, or posting requirements.
                </>
              ) : (
                <>
                  Are you sure you want to lift the suspension for <strong className="text-slate-900">{banModal.user.name}</strong>? They will regain full account access.
                </>
              )}
            </p>

            {banModal.action === 'BAN' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Reason for Suspension (visible to user):</label>
                <textarea
                  value={banModal.reason}
                  onChange={(e) => setBanModal({ ...banModal, reason: e.target.value })}
                  placeholder="e.g. Fraudulent behavior, repeated cancellations, violation of safety guidelines..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBanModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBanToggle}
                className={`px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-xs cursor-pointer ${
                  banModal.action === 'BAN' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {banModal.action === 'BAN' ? 'Confirm Ban' : 'Confirm Unban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
