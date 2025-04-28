
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Merchant } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import MerchantForm from '@/components/forms/MerchantForm';
import { Store, MapPin, Tag, Edit } from 'lucide-react';

const MerchantProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch merchant profile
  const fetchMerchantProfile = async (): Promise<Merchant> => {
    if (!user?.merchant_id) throw new Error("Merchant ID not found");
    
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', user.merchant_id)
      .single();
    
    if (error) throw error;
    return data;
  };

  const { data: merchant, isLoading, refetch } = useQuery({
    queryKey: ['merchant-profile', user?.merchant_id],
    queryFn: fetchMerchantProfile,
    enabled: !!user?.merchant_id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Profile</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Profile information not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Merchant Profile</h1>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{merchant.name}</CardTitle>
          {merchant.category && (
            <CardDescription className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {merchant.category}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {merchant.address && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
              <p className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                {merchant.address}
              </p>
            </div>
          )}
          
          {(merchant.latitude !== null && merchant.longitude !== null) && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Coordinates</h3>
              <p className="text-sm">
                Latitude: {merchant.latitude}, Longitude: {merchant.longitude}
              </p>
            </div>
          )}
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Account Information</h3>
            <p className="text-sm">Email: {user?.email}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your merchant profile information
            </DialogDescription>
          </DialogHeader>
          <MerchantForm 
            merchant={merchant} 
            onSuccess={() => {
              setIsEditDialogOpen(false);
              refetch();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantProfile;
