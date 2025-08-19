"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { SignedIn, UserButton } from "@clerk/nextjs";
import DasboardBtn from "./DasboardBtn";
import Image from "next/image";
import { Button } from "./ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { CalendarPlusIcon } from "lucide-react";

function Navbar() {
  const { isInterviewer } = useUserRole();

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* LEFT SIDE -LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-2xl mr-6 font-mono hover:opacity-80 transition-opacity"
        >
          <Image 
            src="/cortexa-logo.svg" 
            alt="Cortexa Logo" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Cortexa
          </span>
        </Link>

        {/* RIGHT SIDE - ACTIONS */}
        <SignedIn>
          <div className="flex items-center space-x-4 ml-auto">
            {isInterviewer && (
              <Link href="/schedule">
                <Button className="gap-2 btn-primary" size="sm">
                  <CalendarPlusIcon className="h-4 w-4" />
                  Schedule Interview
                </Button>
              </Link>
            )}
            <DasboardBtn />
            <ModeToggle />
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}
export default Navbar;
