
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Merchant } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  address: z.string().optional(),
  category: z.string().optional(),
  latitude: z.number().optional().or(z.string().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  })),
  longitude: z.number().optional().or(z.string().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  })),
});

type MerchantFormValues = z.infer<typeof formSchema>;

interface MerchantFormProps {
  merchant?: Merchant;
  onSuccess?: () => void;
}

const MerchantForm: React.FC<MerchantFormProps> = ({ merchant, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!merchant;

  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: merchant?.name || '',
      email: '',
      password: '',
      address: merchant?.address || '',
      category: merchant?.category || '',
      latitude: merchant?.latitude || undefined,
      longitude: merchant?.longitude || undefined,
    },
  });

  const onSubmit = async (data: MerchantFormValues) => {
    try {
      setIsSubmitting(true);

      if (isEditing) {
        // Update existing merchant
        const { error } = await supabase
          .from('merchants')
          .update({
            name: data.name,
            address: data.address || null,
            category: data.category || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
          })
          .eq('id', merchant.id);

        if (error) throw error;

        toast({
          title: "Merchant updated",
          description: `Merchant ${data.name} has been updated successfully.`,
        });
      } else {
        // Create a new merchant (involves creating a user and a merchant record)
        
        // 1. Create user in auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: 'merchant',
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // 2. Create merchant record
        const { error: merchantError } = await supabase
          .from('merchants')
          .insert({
            name: data.name,
            address: data.address || null,
            category: data.category || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            user_id: authData.user.id,
          });

        if (merchantError) throw merchantError;

        toast({
          title: "Merchant created",
          description: `Merchant ${data.name} has been created successfully.`,
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast({
        variant: "destructive",
        title: "Failed to save merchant",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Merchant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter merchant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="merchant@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be used as the merchant's login ID.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a secure password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 6 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter merchant's address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Restaurant, Retail, Services" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="e.g., 37.7749" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    value={field.value === undefined ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="e.g., -122.4194" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    value={field.value === undefined ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Merchant' : 'Create Merchant'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MerchantForm;
