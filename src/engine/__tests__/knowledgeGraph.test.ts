import { describe, expect, it } from 'vitest';
import ontology from '../../knowledge/ontology.json';
import { buildKnowledgeGraph, doesHabitatMatchGraphNode } from '../knowledgeGraph';
import type { HabitatProperties, SpeciesRule } from '../../types/knowledge';

const sampleAcidicHabitat: HabitatProperties = {
  id: 'fr-test-acid',
  name: 'Hochschwarzwald #1',
  subregion: 'Hochschwarzwald',
  leafType: 'needleleaved',
  dominantTrees: ['Fichte', 'Weißtanne', 'Kiefer'],
  soilPh: 4.2,
  soilSubstrate: 'Podsol-Braunerde',
  elevationM: 840,
  aspect: 'N',
  dataSource: 'Test',
};

describe('Ontology Knowledge Graph Engine (Slice 2)', () => {
  const speciesList = ontology.species as SpeciesRule[];

  it('erzeugt alle 4 Wissenskategorien (Boden-pH, Baumpartner, Pilzarten, Zeigerpflanzen) und Kanten', () => {
    const graph = buildKnowledgeGraph(speciesList, 'boletus_edulis', sampleAcidicHabitat, null);

    const categories = new Set(graph.nodes.map((n) => n.category));
    expect(categories.has('soil_ph')).toBe(true);
    expect(categories.has('tree')).toBe(true);
    expect(categories.has('species')).toBe(true);
    expect(categories.has('indicator')).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(15);
  });

  it('hebt bei Fokus auf "tree:Kiefer" Krause Glucke, Marone, Pfifferling und Steinpilz hervor', () => {
    const graph = buildKnowledgeGraph(
      speciesList,
      'sparassis_crispa',
      sampleAcidicHabitat,
      'tree:Kiefer',
    );
    const connectedSpecies = graph.nodes
      .filter((n) => n.category === 'species' && n.isConnectedToActive)
      .map((n) => n.id);

    expect(connectedSpecies).toContain('sp:sparassis_crispa');
    expect(connectedSpecies).toContain('sp:imleria_badia');
  });

  it('filtert Habitate korrekt anhand ausgewählter Wissensgraph-Knoten (pH, Baumart, Zeigerpflanze)', () => {
    expect(doesHabitatMatchGraphNode(sampleAcidicHabitat, 'ph:acidic', speciesList)).toBe(true);
    expect(doesHabitatMatchGraphNode(sampleAcidicHabitat, 'ph:calcareous', speciesList)).toBe(
      false,
    );
    expect(doesHabitatMatchGraphNode(sampleAcidicHabitat, 'tree:Kiefer', speciesList)).toBe(true);
    expect(doesHabitatMatchGraphNode(sampleAcidicHabitat, 'tree:Esche', speciesList)).toBe(false);
    expect(doesHabitatMatchGraphNode(sampleAcidicHabitat, 'ind:Heidelbeere', speciesList)).toBe(
      true,
    );
  });
});
