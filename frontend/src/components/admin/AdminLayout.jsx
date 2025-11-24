import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-background-dark">
            {/* Desktop sidebar */}
            <div className="hidden md:block">
                <AdminSidebar variant="desktop" />
            </div>

            {/* Mobile sidebar */}
            <div className="md:hidden">
                <AdminSidebar variant="mobile" />
            </div>

            {/* Main content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {children}
            </main>
        </div>
    );
}

