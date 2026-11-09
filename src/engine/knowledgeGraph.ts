import type {
  HabitatProperties,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  SpeciesRule,
} from '../types/knowledge';

interface PhBucket {
  id: string;
  label: string;
  sublabel: string;
  min: number;
  max: number;
}

const PH_BUCKETS: PhBucket[] = [
  { id: 'ph:acidic', label: 'Stark sauer', sublabel: 'pH < 4,8', min: 3.0, max: 4.79 },
  { id: 'ph:moderate', label: 'Mäßig sauer', sublabel: 'pH 4,8–5,9', min: 4.8, max: 5.99 },
  { id: 'ph:neutral', label: 'Neutral', sublabel: 'pH 6,0–6,7', min: 6.0, max: 6.79 },
  { id: 'ph:calcareous', label: 'Kalkhaltig', sublabel: 'pH ≥ 6,8', min: 6.8, max: 8.5 },
];

function getHabitatPhBucketId(soilPh: number): string {
  for (const b of PH_BUCKETS) {
    if (soilPh >= b.min && soilPh <= b.max) return b.id;
  }
  return 'ph:moderate';
}

function normalizeIndicator(raw: string): string {
  return raw.split(' (')[0]!.trim();
}

export function buildKnowledgeGraph(
  speciesList: SpeciesRule[],
  selectedSpeciesId: string,
  selectedHabitat: HabitatProperties | null,
  focusedNodeId: string | null,
): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
  const activeFocusId = focusedNodeId ?? `sp:${selectedSpeciesId}`;
  const habitatPhId = selectedHabitat ? getHabitatPhBucketId(selectedHabitat.soilPh) : null;
  const habitatTrees = new Set(selectedHabitat?.dominantTrees ?? []);

  const treeNames = Array.from(new Set(speciesList.flatMap((s) => s.symbioticTrees)));
  const indicatorNames = Array.from(
    new Set(speciesList.flatMap((s) => s.indicatorPlants.map(normalizeIndicator))),
  ).slice(0, 8);

  const rawEdges: Array<{ id: string; sourceId: string; targetId: string; relationLabel: string }> =
    [];

  for (const sp of speciesList) {
    const spNodeId = `sp:${sp.id}`;
    for (const b of PH_BUCKETS) {
      if (sp.phOptimalMin <= b.max && sp.phOptimalMax >= b.min) {
        rawEdges.push({
          id: `${b.id}->${spNodeId}`,
          sourceId: b.id,
          targetId: spNodeId,
          relationLabel: 'pH-Optimum',
        });
      }
    }
    for (const tree of sp.symbioticTrees) {
      rawEdges.push({
        id: `tree:${tree}->${spNodeId}`,
        sourceId: `tree:${tree}`,
        targetId: spNodeId,
        relationLabel: 'Mykorrhiza',
      });
    }
    for (const ind of sp.indicatorPlants.map(normalizeIndicator)) {
      if (indicatorNames.includes(ind)) {
        rawEdges.push({
          id: `${spNodeId}->ind:${ind}`,
          sourceId: spNodeId,
          targetId: `ind:${ind}`,
          relationLabel: 'Zeigerpflanze',
        });
      }
    }
  }

  const connectedNodeIds = new Set<string>([activeFocusId]);
  for (const edge of rawEdges) {
    if (edge.sourceId === activeFocusId || edge.targetId === activeFocusId) {
      connectedNodeIds.add(edge.sourceId);
      connectedNodeIds.add(edge.targetId);
    }
  }

  const distributeY = (index: number, total: number): number => {
    const top = 34;
    const bottom = 236;
    if (total <= 1) return (top + bottom) / 2;
    return Math.round(top + (index * (bottom - top)) / (total - 1));
  };

  const nodes: KnowledgeGraphNode[] = [
    ...PH_BUCKETS.map((b, i) => ({
      id: b.id,
      label: b.label,
      sublabel: b.sublabel,
      category: 'soil_ph' as const,
      x: 90,
      y: distributeY(i, PH_BUCKETS.length),
      isSelectedSpecies: false,
      isConnectedToActive: connectedNodeIds.has(b.id),
      isPresentInHabitat: habitatPhId === b.id,
    })),
    ...treeNames.map((t, i) => ({
      id: `tree:${t}`,
      label: t,
      category: 'tree' as const,
      x: 295,
      y: distributeY(i, treeNames.length),
      isSelectedSpecies: false,
      isConnectedToActive: connectedNodeIds.has(`tree:${t}`),
      isPresentInHabitat: habitatTrees.has(t),
    })),
    ...speciesList.map((sp, i) => ({
      id: `sp:${sp.id}`,
      label: sp.germanName,
      sublabel: `pH ${sp.phOptimalMin}–${sp.phOptimalMax}`,
      category: 'species' as const,
      x: 525,
      y: distributeY(i, speciesList.length),
      isSelectedSpecies: sp.id === selectedSpeciesId,
      isConnectedToActive: connectedNodeIds.has(`sp:${sp.id}`),
      isPresentInHabitat: sp.id === selectedSpeciesId,
    })),
    ...indicatorNames.map((ind, i) => ({
      id: `ind:${ind}`,
      label: ind,
      category: 'indicator' as const,
      x: 755,
      y: distributeY(i, indicatorNames.length),
      isSelectedSpecies: false,
      isConnectedToActive: connectedNodeIds.has(`ind:${ind}`),
      isPresentInHabitat: false,
    })),
  ];

  const nodePresence = new Map(nodes.map((n) => [n.id, n.isPresentInHabitat]));
  const edges: KnowledgeGraphEdge[] = rawEdges.map((e) => {
    const isHighlighted = e.sourceId === activeFocusId || e.targetId === activeFocusId;
    const isSatisfiedInHabitat =
      Boolean(nodePresence.get(e.sourceId)) && e.targetId === `sp:${selectedSpeciesId}`;
    return { ...e, isHighlighted, isSatisfiedInHabitat };
  });

  return { nodes, edges };
}

export function doesHabitatMatchGraphNode(
  habitat: HabitatProperties,
  nodeId: string | null,
  speciesList: SpeciesRule[],
): boolean {
  if (!nodeId) return false;
  if (nodeId.startsWith('ph:')) {
    return getHabitatPhBucketId(habitat.soilPh) === nodeId;
  }
  if (nodeId.startsWith('tree:')) {
    const tree = nodeId.replace('tree:', '');
    return habitat.dominantTrees.includes(tree);
  }
  if (nodeId.startsWith('sp:')) {
    const spId = nodeId.replace('sp:', '');
    const sp = speciesList.find((s) => s.id === spId);
    if (!sp) return false;
    return (
      habitat.soilPh >= sp.phMin &&
      habitat.soilPh <= sp.phMax &&
      habitat.dominantTrees.some((t) => sp.symbioticTrees.includes(t))
    );
  }
  if (nodeId.startsWith('ind:')) {
    const ind = nodeId.replace('ind:', '');
    const relatedSpecies = speciesList.filter((s) =>
      s.indicatorPlants.some((p) => normalizeIndicator(p) === ind),
    );
    return relatedSpecies.some(
      (sp) =>
        habitat.soilPh >= sp.phOptimalMin &&
        habitat.soilPh <= sp.phOptimalMax &&
        habitat.dominantTrees.some((t) => sp.symbioticTrees.includes(t)),
    );
  }
  return false;
}
