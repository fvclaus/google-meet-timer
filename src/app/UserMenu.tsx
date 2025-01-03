"use client";

import Link from "next/link";
import clsx from "clsx";
import { UserInfo } from "@/types";
import { useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";

type NextLinkArgs = Parameters<typeof Link>;

const userMenuLinkFactory = (setUserMenuVisible: (value: boolean) => void) =>
  React.forwardRef<HTMLAnchorElement, NextLinkArgs[0]>(
    ({ className, ...props }, ref) => {
      return (
        <Link
          onClick={() => {
            setUserMenuVisible(false);
          }}
          role="menuitem"
          prefetch={false}
          ref={ref}
          {...props}
          className={cn(
            className,
            "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100",
          )}
        />
      );
    },
  );

export default function UserMenu({ userinfo }: { userinfo: UserInfo }) {
  const [isUserMenuVisible, setUserMenuVisible] = useState<boolean>(false);
  const UserMenuLink = userMenuLinkFactory(setUserMenuVisible);

  return (
    <div className="relative">
      <button
        id="user-menu-button"
        aria-haspopup={isUserMenuVisible}
        aria-controls="user-menu"
        aria-label="User Menu"
        className="btn btn-ghost btn-circle avatar"
        onClick={() => {
          setUserMenuVisible(!isUserMenuVisible);
        }}
      >
        <div className="w-10 rounded-full">
          <img alt="Your profile picture" src={userinfo.picture} />
        </div>
      </button>
      <div
        id="user-menu"
        role="menu"
        aria-labelledby="user-menu-button"
        className={clsx(
          { invisible: !isUserMenuVisible },
          "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
        )}
      >
        <div className="py-1">
          <UserMenuLink href="/api/logout">Logout</UserMenuLink>
        </div>
      </div>
    </div>
  );
}
