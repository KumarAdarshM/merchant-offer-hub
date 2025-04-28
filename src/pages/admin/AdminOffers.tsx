
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Offer } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/StatusBadge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminOffers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all offers with merchant names
  const fetchOffers = async (): Promise<Offer[]> => {
    const { data, error } = await supabase
      .from('offers')
      .select('*, merchants(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(offer => ({
      ...offer,
      merchant_name: offer.merchants?.name
    }));
  };

  const { data: offers = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: fetchOffers,
  });

  const handleApprove = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedOffer) return;

    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'APPROVED' })
        .eq('id', selectedOffer.id);

      if (error) throw error;

      toast({
        title: "Offer approved",
        description: `${selectedOffer.title} has been approved successfully.`,
      });

      setIsApproveDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to approve offer",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedOffer) return;

    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: 'REJECTED' })
        .eq('id', selectedOffer.id);

      if (error) throw error;

      toast({
        title: "Offer rejected",
        description: `${selectedOffer.title} has been rejected.`,
      });

      setIsRejectDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to reject offer",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.merchant_name && offer.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || offer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Offers</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Search offers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading offers...
                </TableCell>
              </TableRow>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>{offer.merchant_name || 'Unknown'}</TableCell>
                  <TableCell>
                    {format(new Date(offer.start_date), 'MMM d, yyyy')} - {format(new Date(offer.end_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={offer.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/offers/${offer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        
                        {offer.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(offer)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-success" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(offer)}>
                              <XCircle className="mr-2 h-4 w-4 text-destructive" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No offers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the offer "{selectedOffer?.title}" visible to customers. It can be changed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-success text-success-foreground">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the offer "{selectedOffer?.title}". The merchant will be notified. This can be changed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-destructive text-destructive-foreground">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOffers;
