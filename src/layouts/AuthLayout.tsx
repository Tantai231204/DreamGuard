import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <main className="w-full max-w-md focus:outline-none" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    )
}
