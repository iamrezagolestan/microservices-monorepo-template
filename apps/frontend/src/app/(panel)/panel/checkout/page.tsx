"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// Cross-service mutation (ADR-0006, ADR-0014). The orders service returns
// 202 + a workflow handle; we poll it with the shared helper instead of
// hand-rolling fetch loops.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/base/buttons/button";
import { createBrowserClient } from "@/lib/server-fetch/client";
import { pollWorkflow, type WorkflowHandle } from "@/lib/server-fetch/workflow-handle";
import { panel } from "@/strings/panel";

const schema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

type FormValues = z.infer<typeof schema>;

type OrdersPaths = {
  "/orders": {
    post: {
      requestBody: { content: { "application/json": FormValues } };
      responses: { 202: { content: { "application/json": WorkflowHandle } } };
    };
  };
};

export default function Checkout() {
  const [status, setStatus] = useState<string>(panel.checkout.idle);
  const orders = createBrowserClient<OrdersPaths>("orders");

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { product_id: "", quantity: 1 },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus(panel.checkout.starting);
    const { data, error } = await orders.POST("/orders", { body: values });
    if (error || !data) {
      setStatus(panel.checkout.error);
      return;
    }
    setStatus(panel.checkout.running(data.id));
    const result = await pollWorkflow(data);
    setStatus(result.status);
  });

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">{panel.checkout.title}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          {...register("product_id")}
          placeholder={panel.checkout.productPlaceholder}
          className="w-full rounded-lg border border-primary bg-primary px-3 py-2 text-primary shadow-xs outline-brand placeholder:text-placeholder"
        />
        <Button type="submit" isLoading={formState.isSubmitting}>
          {panel.checkout.buy}
        </Button>
      </form>
      <p className="mt-3 text-sm text-tertiary">{status}</p>
    </main>
  );
}
