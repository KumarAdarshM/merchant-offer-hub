
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OfferForm from '@/components/forms/OfferForm';

const CreateOffer: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/merchant/offers');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Offer</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new offer. Your offer will be submitted for approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OfferForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOffer;
