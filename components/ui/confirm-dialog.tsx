"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success";
  isLoading?: boolean;
}

/**
 * Component confirm dialog có thể tái sử dụng
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <ConfirmDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Xác nhận xóa"
 *   message="Bạn có chắc chắn muốn xóa phim này?"
 *   confirmText="Xóa"
 *   confirmColor="danger"
 * />
 * ```
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      classNames={{
        base: "bg-gray-900 border border-gray-700",
        header: "border-b border-gray-700",
        footer: "border-t border-gray-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-300 text-sm">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onPress={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

