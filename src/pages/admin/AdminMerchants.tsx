
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Merchant } from '@/types';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import MerchantForm from '@/components/forms/MerchantForm';
import { Store, MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';

const AdminMerchants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all merchants
  const fetchMerchants = async (): Promise<Merchant[]> => {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const { data: merchants = [], isLoading, refetch } = useQuery({
    queryKey: ['merchants'],
    queryFn: fetchMerchants,
  });

  const handleEdit = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMerchant) return;

    try {
      // Get the user_id from the merchant
      const { data, error: fetchError } = await supabase
        .from('merchants')
        .select('user_id')
        .eq('id', selectedMerchant.id)
        .single();

      if (fetchError) throw fetchError;
      
      const userId = data.user_id;

      // Delete merchant record
      const { error: deleteError } = await supabase
        .from('merchants')
        .delete()
        .eq('id', selectedMerchant.id);

      if (deleteError) throw deleteError;

      // Delete the auth user
      if (userId) {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Could not delete user account, but merchant was deleted:', authError);
        }
      }

      toast({
        title: "Merchant deleted",
        description: `${selectedMerchant.name} has been successfully deleted.`,
      });

      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete merchant",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  const filteredMerchants = merchants.filter(merchant => 
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (merchant.category && merchant.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (merchant.address && merchant.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
        <Link to="/admin/merchants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Merchant
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search merchants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading merchants...
                </TableCell>
              </TableRow>
            ) : filteredMerchants.length > 0 ? (
              filteredMerchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">{merchant.name}</TableCell>
                  <TableCell>{merchant.category || '-'}</TableCell>
                  <TableCell>{merchant.address || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(merchant)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(merchant)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No merchants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Merchant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Merchant</DialogTitle>
            <DialogDescription>
              Update merchant details and save your changes
            </DialogDescription>
          </DialogHeader>
          {selectedMerchant && (
            <MerchantForm 
              merchant={selectedMerchant} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                refetch();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedMerchant?.name} and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMerchants;
