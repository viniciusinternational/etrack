import { MDA } from "@/types";

const STORAGE_KEY = "e-track-mdas-v1";

const MOCK_MDAS: MDA[] = [
  {
    id: "mda-1",
    name: "Ministry of Works",
    category: "Ministry",
    description: "Responsible for infrastructure and public works",
    headOfMda: "Engr. John Okafor",
    email: "info@works.gov.ng",
    phone: "+234-800-123-4567",
    address: "Plot 1, Shehu Shagari Way, Abuja",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "mda-2",
    name: "Ministry of Health",
    category: "Ministry",
    description: "Oversees healthcare delivery and public health",
    headOfMda: "Dr. Nneka Obi",
    email: "info@health.gov.ng",
    phone: "+234-800-234-5678",
    address: "Federal Secretariat, Abuja",
    isActive: true,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-10-14"),
  },
  {
    id: "mda-3",
    name: "Ministry of Education",
    category: "Ministry",
    description: "Manages education policy and implementation",
    headOfMda: "Prof. Adeyemi Adebayo",
    email: "info@education.gov.ng",
    phone: "+234-800-345-6789",
    address: "Shehu Shagari Way, Abuja",
    isActive: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-10-13"),
  },
];

function serialize(mdAs: MDA[]) {
  return JSON.stringify(
    mdAs.map((m) => ({
      ...m,
      createdAt: m.createdAt?.toISOString(),
      updatedAt: m.updatedAt?.toISOString(),
    }))
  );
}

function deserialize(raw: string | null): MDA[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{
      createdAt?: string;
      updatedAt?: string;
      [key: string]: unknown;
    }>;
    return parsed.map(
      (p) =>
        ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        } as MDA)
    );
  } catch {
    return [];
  }
}

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, serialize(MOCK_MDAS));
  }
}

export function getMdas(): MDA[] {
  if (typeof window === "undefined") return [];
  seedIfEmpty();
  const raw = localStorage.getItem(STORAGE_KEY);
  return deserialize(raw);
}

export function getMda(id: string): MDA | undefined {
  return getMdas().find((m) => m.id === id);
}

export function saveMdas(mdas: MDA[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, serialize(mdas));
}

export function saveMda(mda: MDA) {
  const mdas = getMdas();
  const idx = mdas.findIndex((m) => m.id === mda.id);
  if (idx === -1) {
    mdas.push(mda);
  } else {
    mdas[idx] = mda;
  }
  saveMdas(mdas);
}

export function deleteMda(id: string) {
  const mdas = getMdas().filter((m) => m.id !== id);
  saveMdas(mdas);
}
