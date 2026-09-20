'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminRoles,
  createAdminRole,
  deleteAdminRole,
} from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Trash2, UserPlus, ShieldPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AVAILABLE_PERMISSIONS = [
  { id: '/admin', label: 'Overview' },
  { id: '/admin/builder', label: 'Homepage builder' },
  { id: '/admin/content', label: 'Content library' },
  { id: '/admin/pages', label: 'Pages' },
  { id: '/admin/applications', label: 'Applications' },
  { id: '/admin/theme', label: 'Theme' },
  { id: '/admin/seo', label: 'SEO' },
  { id: '/admin/messages', label: 'Messages' },
  { id: '/admin/contact-settings', label: 'Contact Config' },
  { id: '/admin/ai-management', label: 'AI Management' },
  { id: '/admin/team', label: 'Team & Roles' },
];

export default function TeamPage() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');

  // Role form state
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([getAdminUsers(), getAdminRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'super_admin') {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Team & Roles</h1>
        <p className="text-muted-foreground">You do not have permission to manage team members.</p>
      </div>
    );
  }

  // --- Users Actions ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    try {
      await createAdminUser({ name, email, password, role: selectedRole });
      toast.success('User created successfully');
      setName('');
      setEmail('');
      setPassword('');
      setSelectedRole('editor');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteAdminUser(id);
      toast.success('User deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleUserRoleChange = async (id: string, newRole: string) => {
    try {
      await updateAdminUser(id, { role: newRole });
      toast.success('Role updated');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  // --- Roles Actions ---
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    try {
      await createAdminRole({ name: roleName, permissions: selectedPermissions });
      toast.success('Role created successfully');
      setRoleName('');
      setSelectedPermissions([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this role? Any users with this role will lose their custom permissions.'
      )
    )
      return;
    try {
      await deleteAdminRole(id);
      toast.success('Role deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Built-in plus custom roles
  const allRoleNames = Array.from(new Set(['super_admin', 'editor', ...roles.map((r) => r.name)]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team & Roles</h1>
      <p className="text-muted-foreground">Manage administrative users, roles, and permissions.</p>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* --- USERS TAB --- */}
        <TabsContent value="users" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
              <CardDescription>Create a new user with dashboard access.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreateUser}
                className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5"
              >
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Name</Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank for auto"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allRoleNames.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full sm:col-span-1">
                  <UserPlus className="mr-2 h-4 w-4" /> Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-card rounded-md border overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-4 py-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-4 py-6 text-center">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select
                          disabled={user.id === u.id}
                          value={u.role}
                          onValueChange={(val) => handleUserRoleChange(u.id, val)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allRoleNames.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={user.id === u.id}
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* --- ROLES TAB --- */}
        <TabsContent value="roles" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Role</CardTitle>
              <CardDescription>
                Define a new role and select which sections it can access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="max-w-sm space-y-3">
                  <Label>Role Name</Label>
                  <Input
                    required
                    value={roleName}
                    onChange={(e) =>
                      setRoleName(e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase())
                    }
                    placeholder="e.g. content_manager"
                  />
                  <p className="text-muted-foreground text-xs">
                    Only lowercase alphanumeric and underscores allowed.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="bg-muted/20 grid grid-cols-1 gap-4 rounded-md border p-4 sm:grid-cols-2 md:grid-cols-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <label
                          htmlFor={`perm-${perm.id}`}
                          className="cursor-pointer text-sm leading-none font-medium"
                        >
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit">
                  <ShieldPlus className="mr-2 h-4 w-4" /> Create Role
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="bg-card rounded-md border overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Role Name</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Show built-in roles */}
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">super_admin</td>
                  <td className="text-muted-foreground px-4 py-3">All Access</td>
                  <td className="text-muted-foreground px-4 py-3">Built-in</td>
                  <td className="px-4 py-3 text-right"></td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">editor</td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    Overview, Content, Pages, Builder, SEO, Messages
                  </td>
                  <td className="text-muted-foreground px-4 py-3">Built-in</td>
                  <td className="px-4 py-3 text-right"></td>
                </tr>
                {/* Show custom roles */}
                {loading
                  ? null
                  : roles.map((r) => {
                      let perms = [];
                      try {
                        perms = JSON.parse(r.permissions);
                      } catch (e) {}
                      return (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {perms.map((p: string) => (
                                <span
                                  key={p}
                                  className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                                >
                                  {AVAILABLE_PERMISSIONS.find((a) => a.id === p)?.label || p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRole(r.id)}
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
