/**
 * ===============================================
 * CONFIRM DIALOG - HƯỚNG DẪN SỬ DỤNG
 * ===============================================
 * 
 * Component có thể tái sử dụng cho popup xác nhận
 * 
 * --- CÁC PROPS ---
 * 
 * @param isOpen         - Boolean để hiển thị/ẩn dialog
 * @param onClose        - Callback khi đóng dialog
 * @param onConfirm      - Callback khi người dùng xác nhận
 * @param title          - Tiêu đề dialog (mặc định: "Xác nhận")
 * @param message        - Nội dung thông báo
 * @param confirmText    - Text nút xác nhận (mặc định: "Xác nhận")
 * @param cancelText     - Text nút hủy (mặc định: "Hủy")
 * @param confirmColor   - Màu nút xác nhận: "primary" | "danger" | "warning" | "success"
 * @param isLoading      - Hiển thị loading spinner trên nút confirm
 * 
 * 
 * --- VÍ DỤ 1: XÓA PHIM KHỎI WATCHLIST ---
 * 
 * ```tsx
 * import ConfirmDialog from "@/components/ui/confirm-dialog";
 * 
 * const [showDialog, setShowDialog] = useState(false);
 * const [movieToDelete, setMovieToDelete] = useState<{id: string, title: string} | null>(null);
 * 
 * const openDialog = (id: string, title: string) => {
 *   setMovieToDelete({ id, title });
 *   setShowDialog(true);
 * };
 * 
 * const handleConfirm = async () => {
 *   if (!movieToDelete) return;
 *   await removeFromWatchlist(movieToDelete.id);
 *   successToast("Đã xóa phim");
 * };
 * 
 * return (
 *   <>
 *     <Button onPress={() => openDialog("123", "Inception")}>Xóa</Button>
 *     
 *     <ConfirmDialog
 *       isOpen={showDialog}
 *       onClose={() => setShowDialog(false)}
 *       onConfirm={handleConfirm}
 *       title="Xác nhận xóa"
 *       message={`Bạn có chắc muốn xóa "${movieToDelete?.title}"?`}
 *       confirmText="Xóa"
 *       confirmColor="danger"
 *     />
 *   </>
 * );
 * ```
 * 
 * 
 * --- VÍ DỤ 2: ĐĂNG XUẤT ---
 * 
 * ```tsx
 * const [showLogoutDialog, setShowLogoutDialog] = useState(false);
 * 
 * const handleLogout = () => {
 *   dispatch(logout());
 *   router.push("/");
 * };
 * 
 * <ConfirmDialog
 *   isOpen={showLogoutDialog}
 *   onClose={() => setShowLogoutDialog(false)}
 *   onConfirm={handleLogout}
 *   title="Đăng xuất"
 *   message="Bạn có chắc chắn muốn đăng xuất?"
 *   confirmText="Đăng xuất"
 *   confirmColor="warning"
 * />
 * ```
 * 
 * 
 * --- VÍ DỤ 3: HỦY SUBSCRIPTION ---
 * 
 * ```tsx
 * const [isCancelling, setIsCancelling] = useState(false);
 * 
 * const handleCancelSubscription = async () => {
 *   setIsCancelling(true);
 *   try {
 *     await cancelSubscription();
 *     successToast("Đã hủy gói");
 *   } finally {
 *     setIsCancelling(false);
 *   }
 * };
 * 
 * <ConfirmDialog
 *   isOpen={showCancelDialog}
 *   onClose={() => setShowCancelDialog(false)}
 *   onConfirm={handleCancelSubscription}
 *   title="Hủy gói Premium"
 *   message="Bạn sẽ mất quyền truy cập Premium. Tiếp tục?"
 *   confirmText="Hủy gói"
 *   cancelText="Giữ gói"
 *   confirmColor="danger"
 *   isLoading={isCancelling}
 * />
 * ```
 * 
 * 
 * --- VÍ DỤ 4: XÁC NHẬN SUBMIT FORM ---
 * 
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showSubmitDialog}
 *   onClose={() => setShowSubmitDialog(false)}
 *   onConfirm={handleSubmitForm}
 *   title="Gửi đánh giá"
 *   message="Sau khi gửi, bạn không thể chỉnh sửa. Xác nhận gửi?"
 *   confirmText="Gửi"
 *   confirmColor="success"
 * />
 * ```
 * 
 * --- LƯU Ý ---
 * 
 * 1. Luôn đặt ConfirmDialog bên ngoài các vòng lặp/map
 * 2. Sử dụng state để lưu item cần xử lý (id, title, etc)
 * 3. Reset state sau khi xác nhận hoặc hủy
 * 4. Dùng isLoading=true khi đang xử lý async action
 * 
 */

// This is just a documentation file
// Import and use ConfirmDialog from @/components/ui/confirm-dialog
export {};

