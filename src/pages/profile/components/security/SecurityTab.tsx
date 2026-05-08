import { useState } from "react";
import {
  Shield,
  Key,
  History,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import ChangePasswordDialog from "./ChangePasswordDialog";

export default function SecurityTab() {
  const [showChangePassword, setShowChangePassword] = useState(false);


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

      <div className="grid gap-6">
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
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Set a strong password to protect your account from unauthorized access.
              </p>
            </div>
            <History className="h-4 w-4 text-slate-300 ml-4" />
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
    </div>
  );
}
