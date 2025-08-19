"use client";

import AuthDebug from "@/components/AuthDebug";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>
        <div className="space-x-2">
          <Link href="/onboarding">
            <Button variant="outline">Go to Onboarding</Button>
          </Link>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This debug page helps you troubleshoot authentication and role assignment issues.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Common Issues & Solutions:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Missing Environment Variables:</strong> Check that all required environment variables are set</li>
              <li>• <strong>User Not in Database:</strong> Complete the onboarding process to create user record</li>
              <li>• <strong>No Role Assigned:</strong> Select a role during onboarding</li>
              <li>• <strong>Clerk Configuration:</strong> Verify Clerk domain and keys are correct</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AuthDebug />
    </div>
  );
}
