"use client";

import { TypeBox } from "@/components/ui";

const typeBoxText =
  "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.";

function TypeBoxPreview({ testId }: { testId: string }) {
  return (
    <div className="w-full max-w-[903px]" data-testid={testId}>
      <TypeBox defaultValue={typeBoxText} />
    </div>
  );
}

export function TypeBoxKitchenExamples() {
  return (
    <div className="w-full">
      <TypeBoxPreview testId="typebox-default" />
    </div>
  );
}
