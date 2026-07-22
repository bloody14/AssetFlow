import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem } from '../types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <div className="font-medium">{row.getValue('sku')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'categoryId',
    header: 'Category',
    cell: ({ row }) => {
      // In reality, this would be a join on the API side, or we use `category.name`
      const categoryId = row.getValue('categoryId') as string;
      return <Badge variant="secondary">{categoryId}</Badge>;
    },
  },
  {
    accessorKey: 'unitOfMeasure',
    header: 'UOM',
  },
  {
    accessorKey: 'reorderPoint',
    header: 'Reorder Point',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.sku)}
            >
              Copy SKU
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = `/inventory/items/${item.id}`}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>View Timeline</DropdownMenuItem>
            <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
