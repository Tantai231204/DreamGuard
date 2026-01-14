import { Link } from "react-router-dom";
import { AppRoute } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";

export default function Admin() {
    const role = useAuthStore((state) => state.role);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome, {role}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-[var(--color-border)] rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-primary">1,234</p>
                    </div>
                    <div className="border border-[var(--color-border)] rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-primary">567</p>
                    </div>
                    <div className="border border-[var(--color-border)] rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Revenue</h3>
                        <p className="text-3xl font-bold text-primary">$89K</p>
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