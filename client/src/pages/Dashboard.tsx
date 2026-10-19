import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { Button } from "../components/ui";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-blush-200/50">
        <div className="flex items-center gap-3">
          <Mascot size={44} />
          <div>
            <p className="text-lg font-extrabold text-blush-600">CalPal</p>
            <p className="text-sm font-semibold text-mist-500">Hi, {user?.name}!</p>
          </div>
        </div>
        <Button onClick={logout} className="!bg-mist-100 !text-mist-700 !shadow-none hover:!bg-mist-200">
          Log out
        </Button>
      </header>
      <p className="mt-6 text-center font-semibold text-mist-500">Dashboard coming next 🚀</p>
    </main>
  );
}