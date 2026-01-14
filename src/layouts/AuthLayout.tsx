import { Outlet, Link } from 'react-router-dom'
import { AppRoute } from '../lib/constants'

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to={AppRoute.HOME} className="text-3xl font-bold text-blue-600">
                        DreamGuard
                    </Link>
                    <p className="text-gray-600 mt-2">Secure Authentication System</p>
                </div>

                <Outlet />

                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 DreamGuard. All rights reserved.
                </p>
            </div>
        </div>
    )
}
