
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Offer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import OfferForm from '@/components/forms/OfferForm';
import { ArrowLeft, Edit, Trash2, CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';

const MerchantOfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch offer details
  const fetchOfferDetail = async (): Promise<Offer> => {
    if (!id || !user?.merchant_id) throw new Error("Required IDs missing");
    
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', user.merchant_id)
      .single();
    
    if (error) throw error;
    return data;
  };

  const { data: offer, isLoading, refetch } = useQuery({
    queryKey: ['merchant-offer-detail', id],
    queryFn: fetchOfferDetail,
    enabled: !!id && !!user?.merchant_id,
  });

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Offer deleted",
        description: "Your offer has been successfully deleted.",
      });

      navigate('/merchant/offers');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete offer",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return "Your offer is pending review by the admin. You'll be notified once it's approved or rejected.";
      case 'APPROVED':
        return "Your offer has been approved and is now active.";
      case 'REJECTED':
        return "Your offer was rejected. You may edit and resubmit it for approval.";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 mr-2 text-warning" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 mr-2 text-success" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 mr-2 text-destructive" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Offer not found or you don't have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{offer.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main offer details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
            <div className="flex items-center pt-2">
              <StatusBadge status={offer.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p className="mt-1">{offer.description}</p>
            </div>
            
            {offer.discount && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Discount Amount</h3>
                <p className="mt-1 text-xl font-bold">{offer.discount}%</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Validity Period</h3>
              <div className="flex items-center mt-1 text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(new Date(offer.start_date), 'MMM d, yyyy')} - {format(new Date(offer.end_date), 'MMM d, yyyy')}
              </div>
            </div>
            
            {offer.conditions && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Terms & Conditions</h3>
                <p className="mt-1 text-sm whitespace-pre-wrap">{offer.conditions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                {getStatusIcon(offer.status)}
                <p>{getStatusMessage(offer.status)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.status !== 'APPROVED' && (
                <Button 
                  className="w-full"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Offer
                </Button>
              )}
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Offer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this offer?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your offer
                      and remove it from our system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Make changes to your offer and submit for review
            </DialogDescription>
          </DialogHeader>
          <OfferForm 
            offer={offer} 
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

export default MerchantOfferDetail;
