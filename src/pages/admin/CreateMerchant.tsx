
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MerchantForm from '@/components/forms/MerchantForm';

const CreateMerchant: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/admin/merchants');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Merchant</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Merchant Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new merchant account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MerchantForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMerchant;
