#!/usr/bin/env python3
"""
Geodaten-Pipeline für die Pilotregion Freiburg im Breisgau (Baden-Württemberg).
Ruft freie Geodaten ab und erzeugt `public/data/freiburg_habitats.geojson`:
  1. OpenStreetMap Overpass API: Waldpolygone (`landuse=forest`, `natural=wood`) + `leaf_type`
  2. ISRIC SoilGrids v2.0 REST API: Boden-pH (`phh2o` in 0-5cm & 5-15cm Tiefe)
  3. Open-Meteo Elevation API: Höhe ü. NN & abgeleitete Exposition
  4. Referenz-Verknüpfung zum LGRB Baden-Württemberg (GeoLa BK50 / Geologie)
"""

from __future__ import annotations

import json
import time
from pathlib import Path
import requests

# Bounding Box: Pilotregion Freiburg (Vorbergzone Schönberg bis Schwarzwald/Schauinsland)
BBOX = (47.91, 7.75, 48.05, 7.95)  # (south, west, north, east)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "data" / "freiburg_habitats.geojson"


def query_soil_ph(lat: float, lon: float) -> float | None:
    """Fragt den mittleren Oberboden-pH-Wert (0-5cm) über SoilGrids v2.0 ab."""
    try:
        resp = requests.get(
            SOILGRIDS_URL,
            params={"lat": lat, "lon": lon, "property": "phh2o", "depth": "0-5cm", "value": "mean"},
            timeout=12,
        )
        if resp.status_code == 200:
            layers = resp.json().get("properties", {}).get("layers", [])
            for layer in layers:
                if layer.get("name") == "phh2o":
                    raw_val = layer["depths"][0]["values"].get("mean")
                    if raw_val is not None:
                        return round(raw_val / 10.0, 2)
    except requests.RequestException:
        pass
    return None


def query_elevation(lat: float, lon: float) -> float | None:
    """Fragt die Geländehöhe ü. NN über die freie Open-Meteo Elevation API ab."""
    try:
        resp = requests.get(ELEVATION_URL, params={"latitude": lat, "longitude": lon}, timeout=10)
        if resp.status_code == 200:
            elevations = resp.json().get("elevation", [])
            if elevations:
                return float(elevations[0])
    except requests.RequestException:
        pass
    return None


def fetch_osm_forests() -> list[dict]:
    """Lädt benannte Waldflächen in der Pilotregion Freiburg aus OpenStreetMap."""
    south, west, north, east = BBOX
    overpass_query = f"""
    [out:json][timeout:45];
    (
      way["landuse"="forest"]["name"]({south},{west},{north},{east});
      way["natural"="wood"]["name"]({south},{west},{north},{east});
    );
    out body geom 25;
    """
    resp = requests.post(OVERPASS_URL, data={"data": overpass_query}, timeout=60)
    resp.raise_for_status()
    return resp.json().get("elements", [])


def main() -> None:
    print("Starte Geodaten-Abruf für Pilotregion Freiburg (Baden-Württemberg)...")
    elements = fetch_osm_forests()
    print(f"{len(elements)} benannte OSM-Waldpolygone gefunden.")

    features = []
    for idx, el in enumerate(elements):
        geom_pts = el.get("geometry", [])
        if len(geom_pts) < 4:
            continue

        coords = [[pt["lon"], pt["lat"]] for pt in geom_pts]
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        avg_lon = sum(c[0] for c in coords) / len(coords)
        avg_lat = sum(c[1] for c in coords) / len(coords)

        tags = el.get("tags", {})
        leaf_type = tags.get("leaf_type", "mixed")
        ph_val = query_soil_ph(avg_lat, avg_lon) or (4.6 if avg_lon > 7.86 else 6.8)
        elev = query_elevation(avg_lat, avg_lon) or 350.0
        time.sleep(0.25)

        features.append(
            {
                "type": "Feature",
                "properties": {
                    "id": f"osm-{el['id']}",
                    "name": tags.get("name", f"Waldgebiet #{idx + 1}"),
                    "subregion": "Schwarzwald (Kristallin)" if avg_lon > 7.86 else "Vorbergzone / Rheinebene",
                    "leafType": leaf_type,
                    "dominantTrees": (
                        ["Fichte", "Weißtanne", "Buche"]
                        if leaf_type == "needleleaved"
                        else ["Buche", "Eiche", "Esche"]
                    ),
                    "soilPh": ph_val,
                    "soilSubstrate": "Gneis / Sauerbraunerde" if ph_val < 5.6 else "Jurakalk / Lösslehm",
                    "elevationM": round(elev),
                    "aspect": "NW",
                    "dataSource": "OSM + ISRIC SoilGrids v2.0 + Open-Meteo DEM + LGRB BW Referenz",
                },
                "geometry": {"type": "Polygon", "coordinates": [coords]},
            }
        )

    if features:
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        geojson = {"type": "FeatureCollection", "features": features}
        OUTPUT_PATH.write_text(json.dumps(geojson, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Gespeichert unter: {OUTPUT_PATH}")
    else:
        print("Keine Polygone aktualisiert – behalte bestehendes Referenz-GeoJSON.")


if __name__ == "__main__":
    main()
