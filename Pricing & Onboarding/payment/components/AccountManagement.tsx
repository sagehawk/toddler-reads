import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Calendar, Settings, LogOut } from "lucide-react";

interface AccountManagementProps {
  userEmail: string;
  subscriptionStatus: "active" | "trial" | "cancelled" | "past_due";
  subscriptionPlan: "monthly" | "annual";
  trialEndsAt?: string;
  nextBillingDate?: string;
}

export function AccountManagement({
  userEmail,
  subscriptionStatus,
  subscriptionPlan,
  trialEndsAt,
  nextBillingDate
}: AccountManagementProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "trial":
        return <Badge variant="secondary">Free Trial</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleManageSubscription = () => {
    // This would typically open Stripe Customer Portal
    window.open('https://billing.stripe.com/p/login/test_mock_url', '_blank');
  };

  const handleCancelSubscription = () => {
    // Implement cancellation logic
    console.log("Cancel subscription");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Account
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">Account Management</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <p className="text-foreground">{userEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription
                </div>
                {getStatusBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Plan</span>
                  <p className="text-foreground capitalize">{subscriptionPlan}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <p className="text-foreground capitalize">{subscriptionStatus}</p>
                </div>
              </div>
              
              {trialEndsAt && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Trial Ends</span>
                  <p className="text-foreground">{new Date(trialEndsAt).toLocaleDateString()}</p>
                </div>
              )}
              
              {nextBillingDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Next Billing Date</span>
                  <p className="text-foreground">{new Date(nextBillingDate).toLocaleDateString()}</p>
                </div>
              )}

              <Separator />
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
                
                {subscriptionStatus === "active" && (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Download Usage Report
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}