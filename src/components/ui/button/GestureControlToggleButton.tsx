"use client";

import { useGestureContext } from "@/contexts/GestureContext";
import IconButton from "./IconButton";
import { IoHandRight } from "react-icons/io5";

const GestureControlToggleButton: React.FC = () => {
  const { enabled, toggle } = useGestureContext();
  
  const icon = (
    <IoHandRight 
      className={`size-full transition-opacity ${enabled ? 'opacity-100' : 'opacity-50'}`} 
    />
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
