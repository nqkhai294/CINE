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
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody } from "@heroui/card";
import { useAppSelector } from "@/store/hooks";
import { errorToast, successToast } from "@/components/ui/toast";
import {
  getAllMoviesAdmin,
  updateMovieAdmin,
  deleteMovieAdmin,
} from "@/api/api";
import { IoSearch, IoPencil, IoTrash } from "react-icons/io5";

interface Movie {
  id: number | string;
  title: string;
  summary?: string;
  poster_url?: string | null;
  trailer_url?: string | null;
  release_year?: number | null;
  avg_rating?: number | null;
  created_at?: string;
}

export default function MoviesManagementPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Edit form states
  const [editForm, setEditForm] = useState({
    title: "",
    summary: "",
    poster_url: "",
    trailer_url: "",
    release_year: "",
  });

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 1) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Fetch movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await getAllMoviesAdmin(page, limit, searchQuery);
      if (response.data) {
        setMovies(response.data.movies);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      errorToast("Lỗi", "Không thể tải danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, limit, searchQuery]);

  const handleEditClick = (selectedMovie: Movie) => {
    setSelectedMovie(selectedMovie);
    setEditForm({
      title: selectedMovie.title,
      summary: selectedMovie.summary || "",
      poster_url: selectedMovie.poster_url || "",
      trailer_url: selectedMovie.trailer_url || "",
      release_year: selectedMovie.release_year?.toString() || "",
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (selectedMovie: Movie) => {
    setSelectedMovie(selectedMovie);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMovie) return;

    try {
      await updateMovieAdmin(selectedMovie.id, {
        title: editForm.title,
        summary: editForm.summary,
        poster_url: editForm.poster_url,
        trailer_url: editForm.trailer_url,
        release_year: editForm.release_year
          ? parseInt(editForm.release_year)
          : undefined,
      });

      setEditModalOpen(false);
      fetchMovies();
      successToast("Thành công", "Đã cập nhật thông tin phim");
    } catch (error) {
      console.error("Error updating movie:", error);
      errorToast("Lỗi", "Không thể cập nhật phim");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMovie) return;

    try {
      await deleteMovieAdmin(selectedMovie.id);
      setDeleteModalOpen(false);
      fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      errorToast("Lỗi", "Không thể xóa phim");
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
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Phim</h1>
          <p className="text-gray-400">Quản lý và cập nhật thông tin phim</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Tìm kiếm theo tên phim..."
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

        {/* Movies Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner color="warning" />
          </div>
        ) : (
          <>
            <Table
              aria-label="Movies management table"
              classNames={{
                base: "bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden",
                wrapper: "shadow-lg",
              }}
            >
              <TableHeader className="bg-white/10">
                <TableColumn className="text-black">ID</TableColumn>
                <TableColumn className="text-black">Tên phim</TableColumn>
                <TableColumn className="text-black">Năm phát hành</TableColumn>
                <TableColumn className="text-black">Đánh giá</TableColumn>
                <TableColumn className="text-black text-center">
                  Hành động
                </TableColumn>
              </TableHeader>
              <TableBody>
                {movies.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-white/5 hover:bg-white/5"
                  >
                    <TableCell className="text-black">{item.id}</TableCell>
                    <TableCell className="text-black font-semibold">
                      {item.title}
                    </TableCell>
                    <TableCell className="text-black">
                      {item.release_year || "-"}
                    </TableCell>
                    <TableCell className="text-black">
                      {item.avg_rating ? item.avg_rating.toFixed(1) : "-"}
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
          <ModalHeader>Sửa thông tin phim</ModalHeader>
          <ModalBody>
            <Input
              label="Tên phim"
              value={editForm.title}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, title: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
            <Input
              label="Mô tả"
              value={editForm.summary}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, summary: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
            <Input
              label="URL Poster"
              value={editForm.poster_url}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, poster_url: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
            <Input
              label="URL Trailer"
              value={editForm.trailer_url}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, trailer_url: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
            <Input
              label="Năm phát hành"
              type="number"
              value={editForm.release_year}
              onValueChange={(value: any) =>
                setEditForm({ ...editForm, release_year: value })
              }
              classNames={{
                input: "text-white",
                inputWrapper: "bg-white/10 border-white/20",
              }}
            />
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
          <ModalHeader>Xác nhận xóa phim</ModalHeader>
          <ModalBody>
            <p>
              Bạn có chắc chắn muốn xóa phim{" "}
              <span className="font-bold text-yellow-500">
                {selectedMovie?.title}
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
