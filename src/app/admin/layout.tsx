import { Toaster } from "sonner"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0A1628" }}>
      <AdminSidebar />
      <AdminTopbar />

      {/* Main content offset by sidebar width + topbar height */}
      <main
        className="min-h-screen"
        style={{
          marginLeft: "240px",
          paddingTop: "64px",
          background: "#0A1628",
        }}
      >
        <div className="p-8">
          {children}
        </div>
      </main>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#0D2137",
            border: "1px solid rgba(78,205,196,0.3)",
            color: "#E8F4F8",
          },
        }}
      />
    </div>
  )
}
