import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";

export default function Profile() {
    const { token, role } = useAuthStore();

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-8 space-y-6">
                <h1 className="text-3xl font-bold">Profile</h1>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <p className="text-lg font-semibold capitalize">{role}</p>
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Token</label>
                        <p className="text-sm font-mono bg-muted p-2 rounded truncate">{token}</p>
                    </div>
                </div>

                <Link 
                    to={AppRoute.HOME}
                    className="inline-block btn-primary px-6 py-2 rounded-lg font-semibold"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}