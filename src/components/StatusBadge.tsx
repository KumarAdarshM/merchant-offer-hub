
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type OfferStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface StatusBadgeProps {
  status: OfferStatus;
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline' as const,
          label: 'Pending',
          className: 'border-yellow-500 text-yellow-700 bg-yellow-50'
        };
      case 'APPROVED':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'outline' as const,
          label: 'Approved',
          className: 'border-green-500 text-green-700 bg-green-50'
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="h-3 w-3" />,
          variant: 'outline' as const,
          label: 'Rejected',
          className: 'border-red-500 text-red-700 bg-red-50'
        };
      default:
        return {
          icon: null,
          variant: 'outline' as const,
          label: status,
          className: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant} 
      className={cn('gap-1', config.className)}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
