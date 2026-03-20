import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Hook để dispatch actions (có TypeScript)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook để lấy state (có TypeScript)
export const useAppSelector = useSelector.withTypes<RootState>();
