import { prisma } from "@/lib/prisma";

export async function getAllCategoriesFlat() {
  return prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
}

export type CategoryTreeNode = Awaited<ReturnType<typeof getAllCategoriesFlat>>[number] & {
  depth: number;
};

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await getAllCategoriesFlat();
  const byParent = new Map<string | null, typeof categories>();

  for (const category of categories) {
    const key = category.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }

  const result: CategoryTreeNode[] = [];

  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      result.push({ ...child, depth });
      walk(child.id, depth + 1);
    }
  }

  walk(null, 0);
  return result;
}

export async function getCategoryDescendantIds(categoryId: string): Promise<Set<string>> {
  const categories = await getAllCategoriesFlat();
  const byParent = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const list = byParent.get(category.parentId) ?? [];
    list.push(category.id);
    byParent.set(category.parentId, list);
  }

  const descendants = new Set<string>();
  const queue = [...(byParent.get(categoryId) ?? [])];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || descendants.has(current)) continue;
    descendants.add(current);
    queue.push(...(byParent.get(current) ?? []));
  }

  return descendants;
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
