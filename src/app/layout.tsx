import "./styles.css";
import { loadUserInfo } from "./loadUserInfo";
import Link from "next/link";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userinfo = await loadUserInfo();

  return (
    <html lang="en">
      <body className="flex-row">
        <div className="navbar bg-gray-100">
          <div className="flex-1">
            <Link className="btn btn-ghost text-xl" href="/">
              No Meeting Overtime
            </Link>
          </div>
          <div className="flex-none">
            {userinfo.authenticated && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full">
                    <img
                      alt="Tailwind CSS Navbar component"
                      src={userinfo.picture}
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                  <li>
                    <Link href="/api/logout" prefetch={false}>
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="grid justify-items-center mt-24">{children}</div>
      </body>
    </html>
  );
}
