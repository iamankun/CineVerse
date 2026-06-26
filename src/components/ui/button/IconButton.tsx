import { Tooltip, Button, ButtonProps, TooltipProps } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

export interface IconButtonProps extends Omit<ButtonProps, "isIconOnly"> {
  icon: string | React.ReactNode;
  tooltip?: string;
  iconSize?: number;
  tooltipProps?: Omit<TooltipProps, "isDisabled" | "content" | "children">;
}

const IconButton: React.FC<IconButtonProps> = ({
  as,
  icon,
  tooltip,
  iconSize = 24,
  tooltipProps,
  ...props
}) => {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <Tooltip isDisabled={!tooltip} content={tooltip} {...tooltipProps}>
      <Button as={as || (props.href ? Link : "button")} isIconOnly {...props}>
        {typeof icon === "string" ? (
          isClient ? <Icon icon={icon} fontSize={iconSize} /> : <div style={{ width: iconSize, height: iconSize }} />
        ) : (
          icon
        )}
      </Button>
    </Tooltip>
  );
};

export default IconButton;
