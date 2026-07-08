import Image from "next/image";
import mainLogo from "@/assets/main-logo.svg";
import mainLogoLight from "@/assets/main-logo-light.svg";
import { cx } from "@/utils/cx";

export type MainLogoProps = {
  className?: string;
  title?: string;
};

const defaultTitle = "بنویس تا شروع کنیم";

export function MainLogo({ className, title = defaultTitle }: MainLogoProps) {
  return (
    <div className={cx("flex w-full flex-col items-center gap-6", className)}>
      <div className="size-16 shrink-0">
        <Image
          alt=""
          aria-hidden="true"
          className="size-16 dark:hidden"
          height={64}
          priority
          src={mainLogoLight}
          width={64}
        />
        <Image
          alt=""
          aria-hidden="true"
          className="hidden size-16 dark:block"
          height={64}
          priority
          src={mainLogo}
          width={64}
        />
      </div>

      <h3
        className="w-full bg-gradient-to-b from-fg-primary via-fg-primary to-bg-primary bg-clip-text text-center text-display-md font-bold text-transparent"
        dir="auto"
      >
        {title}
      </h3>
    </div>
  );
}

MainLogo.displayName = "MainLogo";
