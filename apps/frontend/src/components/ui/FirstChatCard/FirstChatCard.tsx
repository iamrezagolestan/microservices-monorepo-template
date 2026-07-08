import { Code02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export type FirstChatCardProps = {
  className?: string;
  description?: string;
  title?: string;
};

const defaultTitle = "کدنویسی";
const defaultDescription = "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ";

export function FirstChatCard({
  className,
  description = defaultDescription,
  title = defaultTitle,
}: FirstChatCardProps) {
  return (
    <article
      className={cx(
        "flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg border border-white bg-primary_hover px-4 pt-4 pb-5 dark:border-black dark:bg-secondary",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center rounded-sm bg-primary_hover p-2 dark:bg-tertiary">
          <Code02 className="size-4 text-fg-primary" aria-hidden="true" />
        </div>

        <h3 className="bg-gradient-to-b from-fg-primary via-fg-primary to-bg-primary bg-clip-text text-lg font-bold text-transparent">
          {title}
        </h3>
      </div>

      <div className="h-13 w-full overflow-hidden rounded-sm bg-primary_hover px-2.5 py-1.5 dark:bg-tertiary">
        <p className="text-right text-xs font-regular text-tertiary dark:text-secondary">
          {description}
        </p>
      </div>
    </article>
  );
}

FirstChatCard.displayName = "FirstChatCard";
