"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    userId: string;
    firstLetter: string;
  } | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me");
      const data = await res.json();
      console.log("User data:", data); // Debugging line

      if (data.user) {
        setUser({
          email: data.user.email,
          userId: data.user.userId,
          firstLetter: data.user.email[0].toUpperCase(),
        });
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setDropdownOpen(false);
    router.refresh(); // Refresh the page to update UI
  };

  return (
    <header className="w-full border-b shadow-sm bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          MyBlog
        </Link>

        <div className="relative flex items-center space-x-2">
          {user ? (
            <>
              <div
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {user.firstLetter}
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 bg-white shadow-md rounded-lg border z-50 w-40">
                  <Link
                    href="/create-post"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Create Post
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
