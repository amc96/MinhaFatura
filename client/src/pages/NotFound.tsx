import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive font-bold text-2xl justify-center items-center">
            <AlertCircle className="w-8 h-8" />
            404 Page Not Found
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The page you are looking for does not exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
