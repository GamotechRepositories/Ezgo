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
} from 'lucide-react';
import type { User } from '../types';

interface UserManagerProps {
  users: User[];
  currentAdminId?: string;
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onRefresh: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentAdminId,
  onUpdateRole,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    userName: string;
    newRole: string;
  } | null>(null);

  // Aggregate stats
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin' || (u as any).roles?.includes('admin')).length;
  const totalVendors = users.filter((u) => u.role === 'provider' || (u as any).roles?.includes('provider')).length;
  const totalHosts = users.filter((u) => u.role === 'requester' || (u as any).roles?.includes('requester')).length;

  // Filter logic
  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL') {
      const matchRole = u.role === roleFilter || (u as any).roles?.includes(roleFilter);
      if (!matchRole) return false;
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Management</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div className="text-xs font-semibold text-[#f95724] uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Vendors</span>
          </div>
          <div className="text-2xl font-bold text-[#ea580c]">{totalVendors}</div>
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
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#f95724] focus:ring-2 focus:ring-[#f95724]/15"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
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
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User / Account</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Status & Trust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const isAdmin = user.role === 'admin' || (user as any).roles?.includes('admin');
                const isProvider = user.role === 'provider' || (user as any).roles?.includes('provider');

                return (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition">
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isAdmin
                              ? 'bg-rose-100 text-rose-700'
                              : isProvider
                              ? 'bg-orange-100 text-[#ea580c]'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                            <span>{user.name}</span>
                            {user._id === currentAdminId && (
                              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-normal">
                                You
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

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isProvider
                            ? 'bg-orange-50 text-[#ea580c] border border-orange-200'
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
                        {user.isVerified ? (
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
                          <span className="text-slate-400">Regular</span>
                        )}
                        {user.completedJobs !== undefined && user.completedJobs > 0 && (
                          <div className="text-[11px] text-slate-500">
                            {user.completedJobs} completed booking{user.completedJobs === 1 ? '' : 's'}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role changer dropdown */}
                    <td className="py-4 px-4 text-right">
                      <select
                        value={user.role}
                        disabled={updatingId === user._id}
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
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#f95724] cursor-pointer"
                      >
                        <option value="requester">Host</option>
                        <option value="provider">Vendor</option>
                        <option value="admin">Administrator</option>
                      </select>
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
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f95724] flex items-center justify-center border border-orange-200 shrink-0">
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
              <span className="font-bold text-[#f95724] uppercase">{confirmRoleChange.newRole}</span>?
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
                className="px-4 py-2 rounded-xl bg-[#f95724] hover:bg-[#e04818] text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                Apply Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
