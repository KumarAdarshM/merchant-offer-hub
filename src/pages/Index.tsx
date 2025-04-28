
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after a brief delay
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-7xl px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4 text-primary">OfferHub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Merchant and Offer Management System
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>
                Manage merchants and review offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Onboard new merchants</li>
                <li>Monitor all merchant activities</li>
                <li>Review and approve offers</li>
                <li>Access comprehensive dashboard</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Login as Admin
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Merchant Portal</CardTitle>
              <CardDescription>
                Create and manage your offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Create promotional offers</li>
                <li>Track approval status</li>
                <li>Manage your merchant profile</li>
                <li>View offer performance</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => navigate('/login')}>
                Login as Merchant
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Redirecting to login page...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
