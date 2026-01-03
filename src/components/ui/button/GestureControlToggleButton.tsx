"use client";

import { useGestureContext } from "@/contexts/GestureContext";
import IconButton from "./IconButton";
import { MdPanTool, MdPanToolAlt } from "react-icons/md";

const GestureControlToggleButton: React.FC = () => {
  const { enabled, toggle } = useGestureContext();
  
  const icon = enabled ? (
    <MdPanTool className="size-full" />
  ) : (
    <MdPanToolAlt className="size-full opacity-50" />
  );
  
  const tooltip = enabled ? "Tắt điều khiển cử chỉ" : "Bật điều khiển cử chỉ";

  return (
    <IconButton
      tooltip={tooltip}
      tooltipProps={{ placement: "left" }}
      className="p-2"
      icon={icon}
      onPress={toggle}
      variant="light"
    />
  );
};

export default GestureControlToggleButton;
