import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AppRoute } from "../lib/constants";

export default function Login() {
    const navigate = useNavigate();
    const setToken = useAuthStore((state) => state.setToken);

    const handleLogin = (role: 'user' | 'admin') => {
        setToken(`demo-token-${Date.now()}`, role);
        navigate(AppRoute.PROFILE);
    };

    return (
        <div className="container mx-auto max-w-md px-4 py-16">
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Choose your role to continue</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => handleLogin('user')}
                        className="w-full btn-primary py-3 rounded-lg font-semibold"
                    >
                        Login as User
                    </button>
                    <button
                        onClick={() => handleLogin('admin')}
                        className="w-full border border-[var(--color-border)] py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
                    >
                        Login as Admin
                    </button>
                </div>
            </div>
        </div>
    );
}