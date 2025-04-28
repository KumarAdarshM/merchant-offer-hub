
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { DashboardStats, Offer } from '@/types';
import { Store, Tag, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    totalOffers: 0,
    pendingOffers: 0,
    approvedOffers: 0,
  });
  
  // Fetch dashboard stats
  const fetchStats = async (): Promise<DashboardStats> => {
    // Get total merchants
    const { count: merchantCount, error: merchantError } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true });
    
    if (merchantError) throw merchantError;
    
    // Get total offers
    const { count: offerCount, error: offerError } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true });
    
    if (offerError) throw offerError;
    
    // Get pending offers count
    const { count: pendingCount, error: pendingError } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');
    
    if (pendingError) throw pendingError;
    
    // Get approved offers count
    const { count: approvedCount, error: approvedError } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'APPROVED');
    
    if (approvedError) throw approvedError;
    
    return {
      totalMerchants: merchantCount || 0,
      totalOffers: offerCount || 0,
      pendingOffers: pendingCount || 0,
      approvedOffers: approvedCount || 0,
    };
  };
  
  // Fetch recent offers
  const fetchRecentOffers = async (): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from('offers')
      .select('*, merchants(name)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    return data.map(offer => ({
      ...offer,
      merchant_name: offer.merchants?.name
    }));
  };
  
  const { data: recentOffers, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['recentOffers'],
    queryFn: fetchRecentOffers,
  });
  
  // Fetch stats on load
  useEffect(() => {
    fetchStats()
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching dashboard stats:', error));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Link to="/admin/merchants/new">
            <Button>
              <Store className="mr-2 h-4 w-4" />
              Add Merchant
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Merchants"
          value={stats.totalMerchants}
          icon={<Store className="h-8 w-8" />}
        />
        <StatsCard
          title="Total Offers"
          value={stats.totalOffers}
          icon={<Tag className="h-8 w-8" />}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pendingOffers}
          icon={<Clock className="h-8 w-8" />}
          description="Offers requiring review"
        />
        <StatsCard
          title="Approved Offers"
          value={stats.approvedOffers}
          icon={<CheckCircle className="h-8 w-8" />}
          description="Active in the system"
        />
      </div>
      
      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
          <CardDescription>
            The latest offers submitted by merchants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOffers ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentOffers && recentOffers.length > 0 ? (
            <div className="space-y-4">
              {recentOffers.map((offer) => (
                <div key={offer.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{offer.title}</h3>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By {offer.merchant_name || 'Unknown Merchant'}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Link to={`/admin/offers/${offer.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No recent offers found</p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Link to="/admin/offers" className="w-full">
            <Button variant="outline" className="w-full">
              View All Offers
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboard;
