
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Offer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CalendarIcon, Store, Tag, Clock, CheckCircle, XCircle } from 'lucide-react';

const OfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch offer details with merchant information
  const fetchOfferDetail = async (): Promise<Offer> => {
    if (!id) throw new Error("Offer ID is required");
    
    const { data, error } = await supabase
      .from('offers')
      .select('*, merchants(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      merchant_name: data.merchants?.name
    };
  };

  const { data: offer, isLoading, refetch } = useQuery({
    queryKey: ['offer-detail', id],
    queryFn: fetchOfferDetail,
  });

  const handleStatusUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      const action = status === 'APPROVED' ? 'approved' : 'rejected';
      
      toast({
        title: `Offer ${action}`,
        description: `The offer has been ${action} successfully.`,
      });

      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update offer status",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
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
            <p>Offer not found or has been removed.</p>
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

        {/* Merchant & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{offer.merchant_name || 'Unknown'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.status === 'PENDING' ? (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-success hover:bg-success/90">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Offer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve this offer?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will make the offer visible to customers and notify the merchant.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-success text-success-foreground"
                          onClick={() => handleStatusUpdate('APPROVED')}
                        >
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Offer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this offer?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reject the offer and notify the merchant. They may revise and resubmit.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground"
                          onClick={() => handleStatusUpdate('REJECTED')}
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <div className="text-center p-2">
                  {offer.status === 'APPROVED' ? (
                    <div className="text-success flex items-center justify-center">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      <span>This offer is approved</span>
                    </div>
                  ) : (
                    <div className="text-destructive flex items-center justify-center">
                      <XCircle className="mr-2 h-5 w-5" />
                      <span>This offer was rejected</span>
                    </div>
                  )}
                </div>
              )}
              
              <Separator />
              
              {offer.status !== 'PENDING' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Set as Pending
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset to pending?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will change the offer status back to pending for review.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleStatusUpdate('PENDING')}
                      >
                        Reset to Pending
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
