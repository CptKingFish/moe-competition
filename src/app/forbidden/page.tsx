import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription>
            You are not authorized to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-600">
            Your email address does not match the required pattern. Only email
            addresses ending with @students.edu.sg or @moe.edu.sg are allowed.
          </p>
          <p className="text-gray-600">
            If you believe this is an error, please contact the administrator.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Return to Login Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
