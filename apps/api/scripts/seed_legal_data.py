from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.legal import LawSection

SEED_FILE = Path(__file__).resolve().parents[3] / "data" / "seed" / "law_sections.json"


def main() -> None:
    items = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    with SessionLocal() as db:
        for item in items:
            existing = db.scalar(
                select(LawSection).where(
                    LawSection.act_name == item["act_name"],
                    LawSection.section_number == item["section_number"],
                )
            )
            if existing is None:
                db.add(LawSection(**item))
                continue

            for key, value in item.items():
                setattr(existing, key, value)

        db.commit()


if __name__ == "__main__":
    main()
