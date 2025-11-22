import React, { useState } from "react";
import { LogOut, Home, Calendar, User, Bell } from "lucide-react";
import EventListPage from "./pages/EventListPage";
import { useAuth } from "./authContext";
import { useNotifications } from "./notifications/NotificationsProvider"; // Assuming you expose useNotifications

// Dummy components for pages we haven't built yet
const HomePage = () => (
  <div className="p-8 text-center text-gray-600">
    Welcome to Volunthero! Find your next opportunity here.
  </div>
);
const ProfilePage = () => (
  <div className="p-8 text-center text-gray-600">
    User Profile (Details from AuthContext)
  </div>
);
const NotificationsPage = () => (
  <div className="p-8 text-center text-gray-600">
    Notifications List and History
  </div>
);

const NAV_ITEMS = [
  { name: "Home", path: "home", icon: Home },
  { name: "Events", path: "events", icon: Calendar },
  { name: "Profile", path: "profile", icon: User },
];

/**
 * Renders the primary application shell, including navigation and the current page.
 * Uses simple state-based routing.
 */
export default function MainLayout() {
  const { authedUser, handleLogout } = useAuth();
  // Assuming useNotifications is available (it is imported in NotificationsProvider.jsx)
  // NOTE: If useNotifications hook is not yet exported, this line will cause a crash.
  // For now, we will assume it is exported. If it crashes, we'll fix NotificationsProvider next.
  // const { unreadCount } = useNotifications();

  // Simple state-based routing
  const [currentPage, setCurrentPage] = useState("events"); // Start on the Events page for testing

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "events":
        return <EventListPage />; // The new page we implemented!
      case "profile":
        return <ProfilePage />;
      case "notifications":
        return <NotificationsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Navigation Bar */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-600">
            Volunthero
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => setCurrentPage(item.path)}
                className={`flex items-center text-lg font-medium transition-colors p-2 rounded-lg 
                                    ${
                                      currentPage === item.path
                                        ? "text-indigo-600 bg-indigo-50"
                                        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
                                    }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Actions and Notifications */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage("notifications")}
              className="p-3 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              {/* {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                            )} */}
            </button>

            <div className="text-sm font-semibold text-gray-700 hidden sm:block">
              Welcome, {authedUser?.name || authedUser?.email || "Volunteer"}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>

      {/* Mobile Navigation (Bottom Bar) */}
      <footer className="md:hidden sticky bottom-0 bg-white shadow-2xl z-20 border-t border-gray-200">
        <nav className="flex justify-around items-center h-16">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setCurrentPage(item.path)}
              className={`flex flex-col items-center text-xs transition-colors p-1 w-full
                                ${
                                  currentPage === item.path
                                    ? "text-indigo-600"
                                    : "text-gray-500 hover:text-indigo-600"
                                }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="mt-1">{item.name}</span>
            </button>
          ))}
          {/* Add notification icon for mobile */}
          <button
            onClick={() => setCurrentPage("notifications")}
            className={`flex flex-col items-center text-xs transition-colors p-1 w-full
                            ${
                              currentPage === "notifications"
                                ? "text-indigo-600"
                                : "text-gray-500 hover:text-indigo-600"
                            }`}
          >
            <Bell className="w-6 h-6" />
            <span className="mt-1">Alerts</span>
            {/* {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                        )} */}
          </button>
        </nav>
      </footer>
    </div>
  );
}
