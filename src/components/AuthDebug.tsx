"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AuthDebug() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const testAuthMutation = useMutation(api.users.testAuth);
  const createUserWithRoleMutation = useMutation(api.users.createUserWithRole);
  const createTestUserMutation = useMutation(api.users.createTestUser);
  const testEnvAndAuthMutation = useMutation(api.users.testEnvAndAuth);
  const simpleTestMutation = useMutation(api.users.simpleTest);

  const handleTestAuth = async () => {
    setIsTesting(true);
    try {
      const result = await testAuthMutation({});
      setTestResult(result);
      toast.success("Authentication test successful!");
    } catch (error) {
      console.error("Auth test failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" });
      toast.error("Authentication test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestEnvAndAuth = async () => {
    setIsTesting(true);
    try {
      const result = await testEnvAndAuthMutation({});
      setTestResult(result);
      toast.success("Environment and auth test completed!");
    } catch (error) {
      console.error("Env and auth test failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" });
      toast.error("Environment and auth test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimpleTest = async () => {
    setIsTesting(true);
    try {
      const result = await simpleTestMutation({});
      setTestResult(result);
      toast.success("Simple test successful!");
    } catch (error) {
      console.error("Simple test failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" });
      toast.error("Simple test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleAssignRole = async (role: "candidate" | "interviewer") => {
    if (!user) {
      toast.error("No user found");
      return;
    }

    setIsTesting(true);
    try {
      const result = await createUserWithRoleMutation({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        fullName: user.fullName || "",
        image: user.imageUrl,
        role: role,
      });
      
      setTestResult(result);
      toast.success(`Role assigned successfully: ${role}`);
      
      // Refresh the page to update the user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Role assignment failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" });
      toast.error("Role assignment failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestUserCreation = async () => {
    if (!user) {
      toast.error("No user found");
      return;
    }

    setIsTesting(true);
    try {
      const result = await createTestUserMutation({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || "Test User",
        role: "interviewer",
      });
      
      setTestResult(result);
      toast.success("Test user created successfully!");
      
      // Refresh the page to update the user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Test user creation failed:", error);
      setTestResult({ error: error instanceof Error ? error.message : "Unknown error" });
      toast.error("Test user creation failed");
    } finally {
      setIsTesting(false);
    }
  };

  if (!isUserLoaded) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Clerk User Status</h3>
          <div className="space-y-2 text-sm">
            <div>User Loaded: <Badge variant={isUserLoaded ? "default" : "destructive"}>{isUserLoaded ? "Yes" : "No"}</Badge></div>
            <div>User ID: <code className="bg-gray-100 px-2 py-1 rounded">{user?.id || "Not available"}</code></div>
            <div>Email: <code className="bg-gray-100 px-2 py-1 rounded">{user?.emailAddresses[0]?.emailAddress || "Not available"}</code></div>
            <div>Name: <code className="bg-gray-100 px-2 py-1 rounded">{user?.fullName || "Not available"}</code></div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Database User Status</h3>
          <div className="space-y-2 text-sm">
            <div>User Data Loaded: <Badge variant={userData !== undefined ? "default" : "destructive"}>{userData !== undefined ? "Yes" : "No"}</Badge></div>
            <div>User Exists: <Badge variant={userData ? "default" : "destructive"}>{userData ? "Yes" : "No"}</Badge></div>
            {userData && (
              <>
                <div>Database ID: <code className="bg-gray-100 px-2 py-1 rounded">{userData._id}</code></div>
                <div>Role: <Badge variant={userData.role === "interviewer" ? "default" : "secondary"}>{userData.role}</Badge></div>
                <div>Name: <code className="bg-gray-100 px-2 py-1 rounded">{userData.name}</code></div>
                <div>Email: <code className="bg-gray-100 px-2 py-1 rounded">{userData.email}</code></div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          <div className="space-y-2 text-sm">
            <div>Convex URL: <Badge variant={process.env.NEXT_PUBLIC_CONVEX_URL ? "default" : "destructive"}>{process.env.NEXT_PUBLIC_CONVEX_URL ? "Set" : "Missing"}</Badge></div>
            <div>Clerk Key: <Badge variant={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "default" : "destructive"}>{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Missing"}</Badge></div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Authentication Tests</h3>
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSimpleTest} 
                disabled={isTesting}
                variant="outline"
                size="sm"
              >
                {isTesting ? "Testing..." : "Simple Test"}
              </Button>
              <Button 
                onClick={handleTestAuth} 
                disabled={isTesting}
                variant="outline"
                size="sm"
              >
                {isTesting ? "Testing..." : "Test Auth"}
              </Button>
              <Button 
                onClick={handleTestEnvAndAuth} 
                disabled={isTesting}
                variant="outline"
                size="sm"
              >
                {isTesting ? "Testing..." : "Test Env & Auth"}
              </Button>
            </div>
            {testResult && (
              <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {!userData && user?.id && (
          <div>
            <h3 className="font-semibold mb-2">Manual Role Assignment</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Since the user doesn't exist in the database, you can manually assign a role:</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleAssignRole("interviewer")} 
                  disabled={isTesting}
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isTesting ? "Assigning..." : "Assign Interviewer Role"}
                </Button>
                <Button 
                  onClick={() => handleAssignRole("candidate")} 
                  disabled={isTesting}
                  variant="outline"
                >
                  {isTesting ? "Assigning..." : "Assign Candidate Role"}
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">If the above fails, try this test (no authentication required):</p>
                <Button 
                  onClick={handleTestUserCreation} 
                  disabled={isTesting}
                  variant="outline"
                  size="sm"
                >
                  {isTesting ? "Creating..." : "Create Test User (No Auth)"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!userData && user?.id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ User Not Found in Database</h4>
            <p className="text-yellow-700 text-sm">
              The user exists in Clerk but not in the database. This usually means the user hasn't completed the onboarding process or there was an error during role assignment.
            </p>
          </div>
        )}

        {userData && !userData.role && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">⚠️ User Has No Role</h4>
            <p className="text-orange-700 text-sm">
              The user exists in the database but has no role assigned. Please complete the onboarding process.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
