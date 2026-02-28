import { Plus, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserActions() {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">All Roles</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Admin</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Moderator</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Customer</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">All Status</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Active</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Inactive</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Banned</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>

      <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
        <Plus className="h-4 w-4" />
        Add User
      </Button>
    </div>
  );
}
