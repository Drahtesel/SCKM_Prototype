import { useMemo } from 'react';
import { buildKnowledgeGraph, doesHabitatMatchGraphNode } from '../engine/knowledgeGraph';
import type { HabitatProperties, KnowledgeGraphNode, SpeciesRule } from '../types/knowledge';

interface KnowledgeGraphPanelProps {
  speciesList: SpeciesRule[];
  selectedSpeciesId: string;
  onSelectSpecies: (speciesId: string) => void;
  selectedHabitat: HabitatProperties | null;
  habitats: HabitatProperties[];
  focusedNodeId: string | null;
  onFocusNode: (nodeId: string | null) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  soil_ph: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e3a8a' },
  tree: { fill: '#f0fdf4', stroke: '#16a34a', text: '#14532d' },
  species: { fill: '#fefce8', stroke: '#ca8a04', text: '#713f12' },
  indicator: { fill: '#faf5ff', stroke: '#9333ea', text: '#581c87' },
};

export function KnowledgeGraphPanel({
  speciesList,
  selectedSpeciesId,
  onSelectSpecies,
  selectedHabitat,
  habitats,
  focusedNodeId,
  onFocusNode,
  isExpanded,
  onToggleExpanded,
}: KnowledgeGraphPanelProps) {
  const { nodes, edges } = useMemo(
    () => buildKnowledgeGraph(speciesList, selectedSpeciesId, selectedHabitat, focusedNodeId),
    [speciesList, selectedSpeciesId, selectedHabitat, focusedNodeId],
  );

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const focusedNode = focusedNodeId ? nodeMap.get(focusedNodeId) ?? null : null;

  const matchingHabitatCount = useMemo(() => {
    if (!focusedNodeId) return 0;
    return habitats.filter((h) => doesHabitatMatchGraphNode(h, focusedNodeId, speciesList)).length;
  }, [habitats, focusedNodeId, speciesList]);

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    if (node.category === 'species') {
      const spId = node.id.replace('sp:', '');
      onSelectSpecies(spId);
      onFocusNode(focusedNodeId === node.id ? null : node.id);
    } else {
      onFocusNode(focusedNodeId === node.id ? null : node.id);
    }
  };

  return (
    <section
      aria-label="Interaktiver Wissensgraph"
      className="border-t border-slate-200 bg-white shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Ontologie & Wissensgraph (DIKW Knowledge Layer)
          </h2>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            ● Grün markiert = Vorhanden in {selectedHabitat?.name.split(' (')[0] ?? 'Standort'}
          </span>
          {focusedNode && (
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-900">
              Filter „{focusedNode.label}“: {matchingHabitatCount} / {habitats.length} Parzellen auf
              Karte markiert
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {focusedNodeId && (
            <button
              type="button"
              onClick={() => onFocusNode(null)}
              className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Knoten-Filter zurücksetzen
            </button>
          )}
          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {isExpanded ? 'Graph einklappen' : 'Graph aufklappen'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="w-full overflow-x-auto px-3 py-1.5">
          <svg
            viewBox="0 0 860 258"
            className="h-[242px] w-full min-w-[720px] select-none"
            role="group"
            aria-label="Beziehungsnetzwerk zwischen Boden-pH, Bäumen, Pilzarten und Zeigerpflanzen"
          >
            <g className="text-[10px] font-bold uppercase tracking-wider fill-slate-400">
              <text x="90" y="14" textAnchor="middle">
                1. Boden-Milieu (pH)
              </text>
              <text x="295" y="14" textAnchor="middle">
                2. Symbiose-Baum
              </text>
              <text x="525" y="14" textAnchor="middle">
                3. Pilzart (Regelwerk)
              </text>
              <text x="755" y="14" textAnchor="middle">
                4. Zeigerpflanze (Vor Ort)
              </text>
            </g>

            {edges.map((edge) => {
              const src = nodeMap.get(edge.sourceId);
              const dst = nodeMap.get(edge.targetId);
              if (!src || !dst) return null;
              const x1 = src.x + 68;
              const y1 = src.y;
              const x2 = dst.x - 68;
              const y2 = dst.y;
              const cx = (x1 + x2) / 2;

              const stroke = edge.isSatisfiedInHabitat
                ? '#16a34a'
                : edge.isHighlighted
                  ? '#0284c7'
                  : '#e2e8f0';
              const strokeWidth = edge.isSatisfiedInHabitat ? 2.5 : edge.isHighlighted ? 2 : 1;
              const opacity = edge.isHighlighted ? 0.95 : 0.35;

              return (
                <path
                  key={edge.id}
                  d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
              );
            })}

            {nodes.map((node) => {
              const palette = CATEGORY_COLORS[node.category]!;
              const isFocused = focusedNodeId === node.id || node.isSelectedSpecies;
              const opacity = node.isConnectedToActive ? 1 : 0.38;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - 68}, ${node.y - 13})`}
                  onClick={() => handleNodeClick(node)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ontologie-Knoten ${node.label}`}
                  className="cursor-pointer"
                  opacity={opacity}
                >
                  <rect
                    width="136"
                    height="26"
                    rx="6"
                    fill={node.isPresentInHabitat ? '#dcfce7' : palette.fill}
                    stroke={isFocused ? '#0f172a' : node.isPresentInHabitat ? '#16a34a' : palette.stroke}
                    strokeWidth={isFocused ? 2.4 : 1.3}
                  />
                  <text
                    x="68"
                    y={node.sublabel ? '11' : '16'}
                    textAnchor="middle"
                    fill={palette.text}
                    className="text-[10.5px] font-semibold"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x="68"
                      y="21"
                      textAnchor="middle"
                      fill="#475569"
                      className="text-[8.5px]"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
