import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AppRoute } from '../lib/constants'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { Button } from '../components/ui/button'

interface AppLayoutProps {
    variant?: 'home' | 'main'
}

export default function AppLayout({ variant = 'main' }: AppLayoutProps) {
    const { token, role, logout } = useAuthStore()
    const navigate = useNavigate()

    // Home variant with Header and Footer
    if (variant === 'home') {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 w-full">
                    <Outlet />
                </main>
                <Footer />
            </div>
        )
    }

    // Main variant with simple header
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link to={AppRoute.HOME} className="text-xl font-bold">
                            DreamGuard
                        </Link>
                        <nav className="hidden md:flex gap-4">
                            <Link to={AppRoute.HOME} className="text-sm hover:text-blue-600">Home</Link>
                            {token && (
                                <>
                                    <Link to={AppRoute.PROFILE} className="text-sm hover:text-blue-600">Profile</Link>
                                    {role === 'admin' && (
                                        <Link to={AppRoute.ADMIN} className="text-sm hover:text-blue-600">Admin</Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {token ? (
                            <>
                                <span className="text-sm text-gray-500 hidden md:inline capitalize">
                                    {role}
                                </span>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => navigate(AppRoute.LOGIN)}>
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full">
                <div className="container max-w-7xl mx-auto px-4 py-6">
                    <Outlet />
                </div>
            </main>

            <footer className="border-t bg-gray-50 w-full">
                <div className="container max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
                    © 2026 DreamGuard. Built with React + TypeScript + TanStack Query + Zustand.
                </div>
            </footer>
        </div>
    )
}