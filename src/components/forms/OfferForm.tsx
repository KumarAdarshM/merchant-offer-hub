
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Offer } from '@/types';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  discount: z.number().min(0).optional().or(z.string().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  })),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date({
    required_error: 'End date is required',
  }).refine(date => date > new Date(), {
    message: 'End date must be in the future',
  }),
  conditions: z.string().optional(),
});

type OfferFormValues = z.infer<typeof formSchema>;

interface OfferFormProps {
  offer?: Offer;
  merchantId?: string;
  onSuccess?: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ offer, merchantId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = !!offer;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: offer?.title || '',
      description: offer?.description || '',
      discount: offer?.discount || undefined,
      start_date: offer?.start_date ? new Date(offer.start_date) : new Date(),
      end_date: offer?.end_date ? new Date(offer.end_date) : new Date(),
      conditions: offer?.conditions || '',
    },
  });

  const onSubmit = async (data: OfferFormValues) => {
    try {
      setIsSubmitting(true);
      const finalMerchantId = merchantId || user?.merchant_id;

      if (!finalMerchantId) {
        throw new Error("Merchant ID is required");
      }

      const offerData = {
        title: data.title,
        description: data.description,
        discount: data.discount || null,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
        conditions: data.conditions || null,
        merchant_id: finalMerchantId,
        status: isEditing ? offer.status : 'PENDING',
      };

      if (isEditing) {
        const { error } = await supabase
          .from('offers')
          .update(offerData)
          .eq('id', offer.id);

        if (error) throw error;

        toast({
          title: "Offer updated",
          description: `Offer "${data.title}" has been updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('offers')
          .insert(offerData);

        if (error) throw error;

        toast({
          title: "Offer submitted",
          description: "Your offer has been submitted for approval.",
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({
        variant: "destructive",
        title: "Failed to save offer",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a catchy title for your offer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your offer in detail" 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 15" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  value={field.value === undefined ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= (form.getValues().start_date || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Must be after the start date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any terms and conditions for this offer" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Add any specific terms, conditions, or restrictions that apply to this offer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Offer' : 'Submit Offer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OfferForm;
