import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, Calendar, DollarSign } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Student Management System</h1>
            <nav className="flex gap-4">
              <Link to="/students">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to Student Management</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Track admissions, manage payments, and monitor course renewals efficiently
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-primary" />
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add, edit, search, and manage student records with ease
              </p>
              <Link to="/students">
                <Button className="w-full">Manage Students</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 text-primary" />
              <CardTitle>Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Record payments and automatically calculate renewal dates
              </p>
              <Link to="/students">
                <Button className="w-full">View Payments</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-primary" />
              <CardTitle>Renewal Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Get notified about students whose courses are expiring
              </p>
              <Link to="/students">
                <Button className="w-full">Check Renewals</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-2 text-primary" />
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Configure course duration and fee amounts
              </p>
              <Link to="/settings">
                <Button className="w-full">Settings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/students">
              <Button size="lg">
                <Users className="h-5 w-5 mr-2" />
                View All Students
              </Button>
            </Link>
            <Link to="/settings">
              <Button size="lg" variant="outline">
                <Settings className="h-5 w-5 mr-2" />
                Configure System
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
