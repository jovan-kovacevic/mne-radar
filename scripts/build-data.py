#!/usr/bin/env python3
"""Turn extraction-workflow output into src/data/radars.json.

Reads every `result` line of a workflow journal (or an explicit records JSON),
normalises the printed Montenegrin values into the app's enums, and refuses to
emit a record whose coordinates it cannot trust.
"""
import json, re, sys, unicodedata
from pathlib import Path

TYPE_MAP = {
    "INTERSECTION ENFORCEMENT": "INTERSECTION_ENFORCEMENT",
    "ROAD ENFORCEMENT POINT": "ROAD_ENFORCEMENT_POINT",
    "AVERAGE SPEED CONTROL POINT A": "SECTION_START",
    "AVERAGE SPEED CONTROL POINT B": "SECTION_END",
}
BBOX = (41.75, 43.60, 18.40, 20.40)


def norm_type(raw):
    if not raw:
        return None
    s = raw.replace("·", " ").replace("·", " ").replace("-", " ")
    s = re.sub(r"\s+", " ", s).strip().upper()
    return TYPE_MAP.get(s)


def norm_status(raw):
    if not raw:
        return None
    s = unicodedata.normalize("NFD", raw)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").strip().upper()
    if s.startswith("ZAVRSEN"):
        return "ZAVRSENO"
    if s.startswith("NIJE OBRA"):
        return "NIJE_OBRADENA"
    return None


def num(v):
    if v is None:
        return None
    s = str(v).strip().replace(",", ".")
    m = re.search(r"-?\d+\.?\d*", s)
    return float(m.group()) if m else None


def collect(journal):
    pages = {}
    for line in journal.read_text().splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if row.get("type") != "result":
            continue
        val = row.get("value") or row.get("result") or {}
        for p in (val.get("pages") or []):
            pages[int(p["page"])] = p
        for r in (val.get("resolved") or []):
            pg = pages.get(int(r["page"]), {})
            pg.update({k: v for k, v in r.items() if v not in (None, "")})
            pages[int(r["page"])] = pg
    return pages


def main():
    journal = Path(sys.argv[1])
    out = Path(sys.argv[2])
    pages = collect(journal)

    locations, rejected = [], []
    seen = set()
    for page in sorted(pages):
        p = pages[page]
        if p.get("kind") != "location":
            continue
        lid = (p.get("id") or "").strip()
        if not re.fullmatch(r"\d{3}", lid) or lid in seen:
            rejected.append({"page": page, "id": lid, "why": "bad or duplicate id"})
            continue
        lat, lon = num(p.get("lat")), num(p.get("lon"))
        latp, lonp = num(p.get("latPanel")), num(p.get("lonPanel"))
        if lat is None or lon is None:
            rejected.append({"page": page, "id": lid, "why": "unreadable coordinates"})
            continue
        # The header GPS and the panel Koordinate are the document's own redundancy.
        if latp is not None and abs(latp - lat) > 1e-6:
            rejected.append({"page": page, "id": lid, "why": f"lat header {lat} vs panel {latp}"})
            continue
        if lonp is not None and abs(lonp - lon) > 1e-6:
            rejected.append({"page": page, "id": lid, "why": f"lon header {lon} vs panel {lonp}"})
            continue
        if not (BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lon <= BBOX[3]):
            rejected.append({"page": page, "id": lid, "why": f"outside Montenegro {lat},{lon}"})
            continue
        typ, status = norm_type(p.get("tip")), norm_status(p.get("status"))
        if typ is None:
            rejected.append({"page": page, "id": lid, "why": f"unmapped type {p.get('tip')!r}"})
            continue
        if status is None:
            rejected.append({"page": page, "id": lid, "why": f"unmapped status {p.get('status')!r}"})
            continue
        seen.add(lid)
        locations.append({
            "id": lid,
            "name": (p.get("name") or "").strip(),
            "city": (p.get("city") or "").strip(),
            "lat": lat, "lon": lon,
            "type": typ, "status": status,
            "functions": [f.strip() for f in (p.get("functions") or []) if f and f.strip()],
            "sectionId": None,
            "sectionRole": "A" if typ == "SECTION_START" else "B" if typ == "SECTION_END" else None,
        })

    locations.sort(key=lambda l: l["id"])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "vintage": "2026-09-01",
        "source": "SAT-TRAKT · Idejno tehnicko rjesenje · AI Traffic Monitoring V8 (official government document)",
        "locations": locations,
    }, ensure_ascii=False, indent=2) + "\n")

    by_type = {}
    for l in locations:
        by_type[l["type"]] = by_type.get(l["type"], 0) + 1
    print(f"pages seen      : {len(pages)}")
    print(f"locations kept  : {len(locations)}")
    for k, v in sorted(by_type.items()):
        print(f"  {k:<26} {v}")
    print(f"built           : {sum(1 for l in locations if l['status']=='ZAVRSENO')}")
    print(f"rejected        : {len(rejected)}")
    for r in rejected[:25]:
        print("   -", r)
    if rejected:
        Path("EXTRACTION_ISSUES.json").write_text(json.dumps(rejected, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
