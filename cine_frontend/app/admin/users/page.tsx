"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import { useAppSelector } from "@/store/hooks";
import { errorToast, successToast } from "@/components/ui/toast";
import { getAllUsers, updateUser, updateUserRole, deleteUser } from "@/api/api";
import { IoSearch, IoClose, IoPencil, IoTrash } from "react-icons/io5";

interface User {
  id: number | string;
  username: string;
  email: string;
  role: 0 | 1;
  avatar_url?: string | null;
  bio?: string | null;
  gender?: string | null;
  created_at?: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit form states
  const [editForm, setEditForm] = useState({
    display_name: "",
    role: 0,
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 1) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(page, limit, searchQuery);
      if (response.data) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      errorToast("Lỗi", "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchQuery]);

  const handleEditClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setEditForm({
      display_name: selectedUser.username,
      role: selectedUser.role,
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      // Update display_name if changed
      if (editForm.display_name !== selectedUser.username) {
        await updateUser(selectedUser.id, {
          display_name: editForm.display_name,
        });
      }

      // Update role if changed
      if (editForm.role !== selectedUser.role) {
        await updateUserRole(selectedUser.id, editForm.role as 0 | 1);
      }

      setEditModalOpen(false);
      fetchUsers();
      successToast("Thành công", "Đã cập nhật thông tin người dùng");
    } catch (error) {
      console.error("Error updating user:", error);
      errorToast("Lỗi", "Không thể cập nhật người dùng");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      errorToast("Lỗi", "Không thể xóa người dùng");
    }
  };

  if (!isAuthenticated || user?.role !== 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#0a0e17] flex items-center justify-center">
        <Card className="bg-red-500/10 border border-red-500">
          <CardBody>
            <p className="text-red-500">
              Bạn không có quyền truy cập trang này
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1419] to-[#0a0e17] pt-28 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Quản lý Người dùng
          </h1>
          <p className="text-gray-400">
            Quản lý thông tin và quyền hạn của người dùng
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<IoSearch />}
            className="max-w-md"
            classNames={{
              input: "text-white",
              inputWrapper: "bg-white/10 border-white/20",
            }}
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner color="warning" />
          </div>
        ) : (
          <>
            <Table
              aria-label="Users management table"
              classNames={{
                base: "bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden",
                wrapper: "shadow-lg",
              }}
            >
              <TableHeader className="bg-white/10">
                <TableColumn className="text-black">ID</TableColumn>
                <TableColumn className="text-black">Tên đăng nhập</TableColumn>
                <TableColumn className="text-black">Email</TableColumn>
                <TableColumn className="text-black">Vai trò</TableColumn>
                <TableColumn className="text-black">Ngày tạo</TableColumn>
                <TableColumn className="text-black text-center">
                  Hành động
                </TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-white/5 hover:bg-white/5"
                  >
                    <TableCell className="text-black">{item.id}</TableCell>
                    <TableCell className="text-black font-semibold">
                      {item.username}
                    </TableCell>
                    <TableCell className="text-black">{item.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.role === 1
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-blue-500/20 text-blue-500"
                        }`}
                      >
                        {item.role === 1 ? "Admin" : "User"}
                      </span>
                    </TableCell>
                    <TableCell className="text-black text-sm">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          isIconOnly
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400"
                          size="sm"
                          onPress={() => handleEditClick(item)}
                        >
                          <IoPencil size={18} />
                        </Button>
                        <Button
                          isIconOnly
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-400"
                          size="sm"
                          onPress={() => handleDeleteClick(item)}
                          isDisabled={item.id === user?.id}
                        >
                          <IoTrash size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-center mt-10">
              <Pagination
                total={Math.ceil(total / limit)}
                page={page}
                onChange={setPage}
                showControls
                color="warning"
                classNames={{
                  wrapper: "gap-1",
                  item: "bg-[#1a2332] text-white min-w-9 w-9 h-9",
                  cursor: "bg-yellow-500 text-black font-semibold",
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent className="bg-[#1e2a3a] text-white">
          <ModalHeader>Sửa thông tin người dùng</ModalHeader>
          <ModalBody>
            <Input
              label="Tên hiển thị"
              value={editForm.display_name}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, display_name: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
            <Select
              label="Vai trò"
              selectedKeys={[editForm.role.toString()]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                setEditForm({
                  ...editForm,
                  role: parseInt(String(selectedKey)) as 0 | 1,
                });
              }}
              classNames={{
                trigger: "bg-white/10 border-white/20 text-white",
              }}
            >
              <SelectItem key="0">User</SelectItem>
              <SelectItem key="1">Admin</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={() => setEditModalOpen(false)}>
              Hủy
            </Button>
            <Button color="primary" onPress={handleSaveEdit}>
              Lưu thay đổi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalContent className="bg-[#1e2a3a] text-white">
          <ModalHeader>Xác nhận xóa người dùng</ModalHeader>
          <ModalBody>
            <p>
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <span className="font-bold text-yellow-500">
                {selectedUser?.username}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" onPress={() => setDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleConfirmDelete}>
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
