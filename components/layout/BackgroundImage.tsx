import { DIMENSIONS, Z_INDEX } from "../../constants/ui";

interface BackgroundImageProps {
  isVisible: boolean;
  imagePath?: string;
}

/**
 * BackgroundImage Component
 * Following P4: Design Deep Modules - encapsulates background image display logic
 * Following P10: Pull Complexity Downwards - handles responsive sizing internally
 */
export default function BackgroundImage({
  isVisible,
  imagePath = "/background.png",
}: BackgroundImageProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 flex items-start justify-center pt-16"
      style={{ zIndex: Z_INDEX.BACKGROUND }}
    >
      <div
        className="w-90 h-90 md:w-160 md:h-160 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url('${imagePath}')`,
          filter: "brightness(0.9) contrast(1.1)",
          width: `${DIMENSIONS.BACKGROUND_SMALL.width}px`,
          height: `${DIMENSIONS.BACKGROUND_SMALL.height}px`,
        }}
      />
    </div>
  );
}
