/**
 * src/schemas/zodResolver.ts
 *
 * Adaptador de validação Zod para Mantine Forms (@mantine/form).
 * Compatível de forma transparente com Zod v3 e Zod v4 (usando safeParse e issues).
 */

import type { z } from 'zod';

export function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return (values: unknown) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return {};
    }

    const results: Record<string, string> = {};
    if ('error' in parsed && parsed.error) {
      const issues = parsed.error.issues ?? (parsed.error as unknown as { errors?: Array<{ path: (string | number)[]; message: string }> }).errors ?? [];
      for (const issue of issues) {
        const path = issue.path.join('.');
        if (path && !results[path]) {
          results[path] = issue.message;
        }
      }
    }
    return results;
  };
}

export default zodResolver;
