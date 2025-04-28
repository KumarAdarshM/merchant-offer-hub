
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Offer } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import { Tag, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';

const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOffers: 0,
    pendingOffers: 0,
    approvedOffers: 0,
    rejectedOffers: 0,
  });
  
  // Fetch merchant's offers
  const fetchMerchantOffers = async (): Promise<Offer[]> => {
    if (!user?.merchant_id) throw new Error("Merchant ID not found");
    
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('merchant_id', user.merchant_id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  };
  
  const { data: recentOffers = [], isLoading } = useQuery({
    queryKey: ['merchant-offers', user?.merchant_id],
    queryFn: fetchMerchantOffers,
    enabled: !!user?.merchant_id,
  });
  
  // Calculate stats from the offers
  useEffect(() => {
    const calculateStats = async () => {
      if (!user?.merchant_id) return;
      
      try {
        // Total offers
        const { count: totalOffers, error: totalError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', user.merchant_id);
        
        if (totalError) throw totalError;
        
        // Pending offers
        const { count: pendingOffers, error: pendingError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', user.merchant_id)
          .eq('status', 'PENDING');
        
        if (pendingError) throw pendingError;
        
        // Approved offers
        const { count: approvedOffers, error: approvedError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', user.merchant_id)
          .eq('status', 'APPROVED');
        
        if (approvedError) throw approvedError;
        
        // Rejected offers
        const { count: rejectedOffers, error: rejectedError } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', user.merchant_id)
          .eq('status', 'REJECTED');
        
        if (rejectedError) throw rejectedError;
        
        setStats({
          totalOffers: totalOffers || 0,
          pendingOffers: pendingOffers || 0,
          approvedOffers: approvedOffers || 0,
          rejectedOffers: rejectedOffers || 0,
        });
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    calculateStats();
  }, [user?.merchant_id]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Link to="/merchant/offers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Offer
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Offers"
          value={stats.totalOffers}
          icon={<Tag className="h-8 w-8" />}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pendingOffers}
          icon={<Clock className="h-8 w-8" />}
        />
        <StatsCard
          title="Approved Offers"
          value={stats.approvedOffers}
          icon={<CheckCircle className="h-8 w-8" />}
        />
        <StatsCard
          title="Rejected Offers"
          value={stats.rejectedOffers}
          icon={<XCircle className="h-8 w-8" />}
        />
      </div>
      
      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Offers</CardTitle>
          <CardDescription>
            Track your recent submissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentOffers.length > 0 ? (
            <div className="space-y-4">
              {recentOffers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{offer.title}</h3>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{offer.description}</p>
                  </div>
                  <Link to={`/merchant/offers/${offer.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You haven't created any offers yet</p>
              <Link to="/merchant/offers/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Offer
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        {recentOffers.length > 0 && (
          <CardFooter className="border-t px-6 py-4">
            <Link to="/merchant/offers" className="w-full">
              <Button variant="outline" className="w-full">
                View All Offers
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MerchantDashboard;
