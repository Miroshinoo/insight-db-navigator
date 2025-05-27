
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your database connections and application settings</p>
        </div>
        
        <Card className="max-w-md mx-auto mt-16">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Construction className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Database configuration and settings panel is currently under development.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Check back soon for database connection management, user preferences, and more configuration options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
