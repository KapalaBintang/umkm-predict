

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Home,
  Loader2,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  UserData
} from "@/lib/services/user-service"

// Role options yang tersedia
const roleOptions = ["user", "admin"]

export default function AdminPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  // Ambil semua data user saat component di-mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const usersData = await getAllUsers()
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter berdasarkan pencarian
  const filteredUsers = users.filter(user => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm)
    )
  })

  // Format tanggal
  const formatDate = (date: Date | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle perubahan role
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedUser.uid || !selectedRole) return

    try {
      setIsLoading(true)
      await updateUserRole(selectedUser.uid, selectedRole)

      // Update data di state
      setUsers(users.map(user => {
        if (user.uid === selectedUser.uid) {
          return { ...user, role: selectedRole }
        }
        return user
      }))

      toast({
        title: "Berhasil",
        description: `Role ${selectedUser.name} telah diubah menjadi ${selectedRole}`,
      })

      setIsRoleDialogOpen(false)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Gagal mengubah role pengguna",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle hapus user
  const handleDeleteUser = async () => {
    if (!selectedUser || !selectedUser.uid) return

    try {
      setIsLoading(true)
      await deleteUser(selectedUser.uid)

      // Update data di state
      setUsers(users.filter(user => user.uid !== selectedUser.uid))

      toast({
        title: "Berhasil",
        description: `Pengguna ${selectedUser.name} telah dihapus`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus pengguna",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar untuk desktop */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Menu Admin</h3>
            <div className="space-y-1">
              <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                <Link href="/admin">
                  <Users className="h-4 w-4" />
                  Kelola Pengguna
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/admin/prediksi">
                  <ShieldAlert className="h-4 w-4" />
                  Kelola Prediksi
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Kelola Bahan Pokok
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Kelola Notifikasi
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Pengaturan
              </Button>
            </div>
          </div>
          <div className="px-4 py-2">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Navigasi</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <a href="/">
                  <Home className="h-4 w-4" />
                  Kembali ke Beranda
                </a>
              </Button>
            </div>
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">admin@umkmpredict.com</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Menu Admin</h3>
              <div className="space-y-1">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsSidebarOpen(false)}
                  asChild
                >
                  <Link href="/admin">
                    <Users className="h-4 w-4" />
                    Kelola Pengguna
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)} asChild>
                  <Link href="/admin/prediksi">
                    <ShieldAlert className="h-4 w-4" />
                    Kelola Prediksi
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Package className="h-4 w-4" />
                  Kelola Bahan Pokok
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Bell className="h-4 w-4" />
                  Kelola Notifikasi
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => setIsSidebarOpen(false)}>
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </Button>
              </div>
            </div>
            <div className="px-4 py-2">
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Navigasi</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setIsSidebarOpen(false)}
                  asChild
                >
                  <a href="/">
                    <Home className="h-4 w-4" />
                    Kembali ke Beranda
                  </a>
                </Button>
              </div>
            </div>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@umkmpredict.com</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Konten utama */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-2 sm:gap-4 border-b bg-muted/40 px-2 sm:px-4 lg:px-6">
          <div className="md:hidden">
            {/* SheetTrigger is rendered outside this div */}
          </div>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Panel Admin</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                <UserIcon className="h-4 w-4" />
                <span className="sr-only">Profil</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Konten halaman admin */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="grid gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kelola Pengguna</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Lihat, edit dan hapus data pengguna aplikasi
                </p>
              </div>
            </div>

            {/* Pencarian */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama, email, atau role..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabel data pengguna */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
                <CardDescription>
                  Daftar pengguna terdaftar dalam sistem ({filteredUsers.length} pengguna)
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-2">
                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Memuat data pengguna...</span>
                  </div>
                )}

                {!isLoading && filteredUsers.length === 0 && (
                  <div className="py-8 text-center">
                    <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-semibold">Tidak ada pengguna</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Tidak ada pengguna yang sesuai dengan pencarian" : "Belum ada pengguna yang terdaftar"}
                    </p>
                  </div>
                )}

                {!isLoading && filteredUsers.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="pr-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px] px-2 sm:px-4">Nama</TableHead>
                            <TableHead className="px-2 sm:px-4">Email</TableHead>
                            <TableHead className="px-2 sm:px-4">Role</TableHead>
                            <TableHead className="px-2 sm:px-4">Terdaftar pada</TableHead>
                            <TableHead className="px-2 sm:px-4 text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.uid}>
                              <TableCell className="font-medium px-2 sm:px-4">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} />
                                    <AvatarFallback>
                                      {user.name?.slice(0, 2) || user.email?.slice(0, 2) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.name || "(Tidak ada nama)"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-2 sm:px-4">{user.email}</TableCell>
                              <TableCell className="px-2 sm:px-4">
                                <Badge
                                  variant={user.role === "admin" ? "default" : "outline"}
                                  className="text-xs px-2 py-0.5"
                                >
                                  {user.role === "admin" ? "Admin" : "User"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 sm:px-4 text-xs text-muted-foreground">
                                {formatDate(user.createdAt as Date)}
                              </TableCell>
                              <TableCell className="px-2 sm:px-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setSelectedRole(user.role || "");
                                      setIsRoleDialogOpen(true);
                                    }}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Hapus</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              <CardFooter className="flex justify-between px-6 py-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Menampilkan {filteredUsers.length} dari {users.length} pengguna
                </div>
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} disabled={!searchQuery}>
                  Reset Filter
                </Button>
              </CardFooter>
            </Card>

            {/* Dialog untuk edit role */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Ubah Role Pengguna</DialogTitle>
                  <DialogDescription>
                    Ubah role pengguna {selectedUser?.name || selectedUser?.email}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Role Pengguna</SelectLabel>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role === "admin" ? "Admin" : "User"}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedRole === "admin"
                        ? "Admin memiliki akses ke semua fitur, termasuk panel admin"
                        : "User reguler hanya memiliki akses ke fitur standar"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleRoleChange} disabled={isLoading || selectedRole === selectedUser?.role}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog konfirmasi hapus */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Hapus Pengguna</DialogTitle>
                  <DialogDescription>
                    Apakah Anda yakin ingin menghapus pengguna {selectedUser?.name || selectedUser?.email}?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Alert variant="destructive">
                    <AlertTitle>Peringatan</AlertTitle>
                    <AlertDescription>
                      Tindakan ini tidak dapat dibatalkan. Semua data terkait pengguna ini juga akan dihapus.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Hapus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Informasi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Panduan Role Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-1.5">
                      <UserIcon className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Role User</p>
                      <p className="text-muted-foreground">
                        Pengguna biasa dengan akses ke fitur dasar aplikasi seperti melihat prediksi dan menggunakan fitur umum.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-1.5">
                      <ShieldAlert className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Role Admin</p>
                      <p className="text-muted-foreground">
                        Administrator dengan akses penuh ke panel admin dan semua fitur pengelolaan sistem.
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md bg-muted p-3">
                    <p className="text-xs font-medium">Catatan:</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hati-hati saat memberikan role admin kepada pengguna karena mereka akan memiliki akses penuh ke sistem.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
