import json
import random
import shutil
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PASSAGES = ROOT / "content" / "passages"
BACKUP_ROOT = ROOT / "tmp" / "answer-rebalance-backup"

BOOKS = {
    "Jupiter": "2026-06-J",
    "Saturn": "2026-06",
    "Sun": "2026-06-Sun",
}


def build_targets(book: str, total: int) -> list[int]:
    if total % 5:
        raise ValueError(f"{book}: objective question count is not divisible by 5: {total}")
    pool = [i for i in range(5) for _ in range(total // 5)]
    rng = random.Random(f"terra-nova-{book}-2026-06-answer-balance")
    targets: list[int] = []
    for idx in range(total):
        passage_slot = idx % 3
        used_in_passage = set(targets[-passage_slot:]) if passage_slot else set()
        candidates = [p for p in set(pool) if p not in used_in_passage]
        if not candidates:
            candidates = list(set(pool))
        # Prefer numbers that still have the largest remaining quota, then shuffle ties.
        counts = Counter(pool)
        max_remaining = max(counts[c] for c in candidates)
        top = [c for c in candidates if counts[c] == max_remaining]
        choice = rng.choice(top)
        targets.append(choice)
        pool.remove(choice)
    return targets


def stable_move_order(size: int, old_correct: int, new_correct: int) -> list[int]:
    order = [i for i in range(size) if i != old_correct]
    order.insert(new_correct, old_correct)
    return order


def rebalance_book(book: str, folder: str) -> None:
    src_dir = PASSAGES / folder
    files = sorted(src_dir.glob("*.json"))
    objective_refs = []

    for path in files:
        data = json.loads(path.read_text(encoding="utf-8"))
        for q_idx, q in enumerate(data.get("page2", {}).get("questions", [])):
            if q.get("type") == "mock_objective":
                objective_refs.append((path, q_idx))

    targets = build_targets(book, len(objective_refs))
    before = Counter()
    after = Counter()
    changed_files: set[Path] = set()
    target_by_ref = dict(zip(objective_refs, targets))

    for path in files:
        data = json.loads(path.read_text(encoding="utf-8"))
        questions = data.get("page2", {}).get("questions", [])
        explanations = data.get("answers", {}).get("explanations", [])
        exp_by_q = {e.get("q_index"): e for e in explanations}
        modified = False

        for q_idx, q in enumerate(questions):
            if q.get("type") != "mock_objective":
                continue

            old_correct = q.get("answer_index")
            if not isinstance(old_correct, int):
                raise ValueError(f"{path.name} Q{q_idx + 1}: invalid answer_index {old_correct!r}")
            if not isinstance(q.get("choices"), list) or len(q["choices"]) != 5:
                raise ValueError(f"{path.name} Q{q_idx + 1}: choices must have 5 items")

            new_correct = target_by_ref[(path, q_idx)]
            before[old_correct + 1] += 1
            after[new_correct + 1] += 1
            if new_correct == old_correct:
                continue

            order = stable_move_order(len(q["choices"]), old_correct, new_correct)
            q["choices"] = [q["choices"][i] for i in order]
            q["answer_index"] = new_correct

            exp = exp_by_q.get(q_idx)
            if exp is None:
                raise ValueError(f"{path.name} Q{q_idx + 1}: missing answer explanation")
            exp["correct"] = new_correct
            if isinstance(exp.get("rationales"), list) and len(exp["rationales"]) == len(order):
                exp["rationales"] = [exp["rationales"][i] for i in order]
            modified = True

        if modified:
            backup_path = BACKUP_ROOT / folder / path.name
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            if not backup_path.exists():
                shutil.copy2(path, backup_path)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            changed_files.add(path)

    print(f"{book}: changed {len(changed_files)} files")
    print(f"  before: {dict(sorted(before.items()))}")
    print(f"  after : {dict(sorted(after.items()))}")


def main() -> None:
    for book, folder in BOOKS.items():
        rebalance_book(book, folder)


if __name__ == "__main__":
    main()
