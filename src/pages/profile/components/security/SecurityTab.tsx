import { useState } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import {
  Shield,
  Key,
  Smartphone,
  AlertTriangle,
  History,
  LogOut,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function SecurityTab() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const loginHistory = [
    { id: 1, device: "Chrome on Windows", location: "Hanoi, VN", time: "Active Now", current: true },
    { id: 2, device: "Safari on iPhone", location: "Hanoi, VN", time: "2 hours ago", current: false },
    { id: 3, device: "Firefox on macOS", location: "Ho Chi Minh, VN", time: "3 days ago", current: false },
  ];


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage your account security and authentication methods.</p>
      </div>

      {/* Security Status Card */}
      <div className="group relative rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden p-6 transition-all">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-900">Account Secured</h3>
              <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border-none px-2 py-0.5 rounded-lg">Protected</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Your account is currently protected by multi-layer security protocols.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Password</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Password</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePassword(true)}
              className="h-8 px-4 rounded-lg text-xs font-bold border-slate-200 hover:border-[#4988c4] hover:text-[#4988c4] transition-all"
            >
              Update
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[11px] font-bold text-slate-700 uppercase">30 Days Ago</p>
              </div>
            </div>
            <History className="h-4 w-4 text-slate-300" />
          </div>
        </div>

        {/* 2FA Card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Two-Factor Auth</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Security</p>
              </div>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} className="data-[state=checked]:bg-[#4988c4]" />
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
            Protect your account with an extra layer of security by requiring a code from your phone.
          </p>
          {twoFactor && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <CheckCircledIcon className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden p-6 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Login Activity</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Sessions</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {loginHistory.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${session.current
                ? "bg-[#4988c4]/5 border border-[#4988c4]/10 shadow-sm"
                : "bg-slate-50/50 border border-slate-100/50"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.current ? "bg-white text-[#4988c4]" : "bg-white text-slate-300"}`}>
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 leading-none">{session.device}</p>
                    {session.current && (
                      <Badge className="bg-[#4988c4] text-white text-[8px] font-bold uppercase tracking-wider border-none px-2 h-4 rounded-md">Current</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{session.location} • {session.time}</p>
                </div>
              </div>
              {!session.current && (
                <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 hover:border-rose-100 bg-white">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-xs">Delete Account</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed max-w-sm">Permanently delete your account and all associated data. This action cannot be reversed.</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 px-6 rounded-xl text-rose-500 font-black text-[10px] uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all duration-300 border-rose-100 bg-white hover:border-transparent shadow-sm hover:shadow-rose-100"
        >
          Delete My Account
        </Button>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
    </div>
  );
}
