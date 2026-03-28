type AppHeaderProps = {
  userEmail?: string;
};

export default function AppHeader({ userEmail }: AppHeaderProps) {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">App Financiera</h1>
        <p className="text-sm text-gray-500">
          Gestión financiera del emprendimiento
        </p>
      </div>

      <div className="text-sm text-gray-600">
        {userEmail ? `Sesión: ${userEmail}` : "Sin usuario"}
      </div>
    </header>
  );
}