 

import db from "@/lib/db/client";

export interface PolicyRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: Record<string, unknown>;
  active: boolean;
  updatedAt: string;
}

export function findActivePolicyByCategory(
  category: string,
): PolicyRecord | null {
  const policy = db
    .prepare(`
      SELECT
        id,
        name,
        category,
        description,
        rules_json AS rulesJson,
        active,
        updated_at AS updatedAt
      FROM policies
      WHERE category = ?
        AND active = 1
      ORDER BY updated_at DESC
      LIMIT 1
    `)
    .get(category) as
    | {
        id: string;
        name: string;
        category: string;
        description: string;
        rulesJson: string;
        active: number;
        updatedAt: string;
      }
    | undefined;

  if (!policy) {
    return null;
  }

  return {
    id: policy.id,
    name: policy.name,
    category: policy.category,
    description: policy.description,
    rules: JSON.parse(policy.rulesJson) as Record<
      string,
      unknown
    >,
    active: policy.active === 1,
    updatedAt: policy.updatedAt,
  };
}