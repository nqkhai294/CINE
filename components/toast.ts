import { addToast } from "@heroui/toast";

export const successToast = (title: string, message: string) => {
  addToast({
    title: title,
    description: message,
    color: "success",
    timeout: 3000,
  });
};

export const errorToast = (title: string, message: string) => {
  addToast({
    title: title,
    description: message,
    color: "danger",
    timeout: 3000,
  });
};
