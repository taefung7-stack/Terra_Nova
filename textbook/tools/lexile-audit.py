# -*- coding: utf-8 -*-
"""Lexile vs. measured-difficulty audit for 2026-07 highschool passages.

Reads page1.body (strips HTML markup tags), computes objective readability
metrics, derives a Lexile *estimate*, and compares against the declared
meta.lexile. Flags passages where declared and measured diverge.
"""
import json, glob, os, re, sys

CMU = {}  # syllable cache

def strip_markup(s):
    # remove inline tags <u> <mark> <blank> etc. and the literal "____"/<blank>
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("____", " ").replace("\n", " ")
    return re.sub(r"\s+", " ", s).strip()

def sentences(text):
    # split on . ? ! ; : that end clauses; keep it simple & consistent
    parts = re.split(r"[.!?]+", text)
    return [p.strip() for p in parts if p.strip()]

def words(text):
    return re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text)

def count_syllables(w):
    w = w.lower()
    if w in CMU:
        return CMU[w]
    # heuristic syllable counter
    w2 = re.sub(r"[^a-z]", "", w)
    if not w2:
        return 0
    vowels = "aeiouy"
    cnt = 0
    prev = False
    for ch in w2:
        isv = ch in vowels
        if isv and not prev:
            cnt += 1
        prev = isv
    if w2.endswith("e") and cnt > 1:
        cnt -= 1
    if cnt == 0:
        cnt = 1
    CMU[w] = cnt
    return cnt

# A small, common "easy word" list (Dale-Chall-style core) approximation:
# words a 4th grader knows. We approximate "hard word" = not in this set AND
# (long OR multisyllabic). Used only as a relative signal.
EASY = set("""a able about above across act add after again air all also always am an and animal answer any are around as ask at away back bad be because been before began begin being below best better between big bird black blue boat body book both box boy bring but buy by call came can car care carry cause change child children city close cold color come could country cut day did die different do does dog done door down draw drink drive each ear early earth east eat egg end enough even ever every eye face fact fall family far farm fast father feel feet few field find fire first fish five food foot for found four free friend from front full game gave get girl give go gold good got great green ground grow had hair half hand happen happy hard has have he head hear heard heart heat help her here high him his home hot house how hundred i ice idea if in into is it its job keep kind know land large last late learn leave left less let life light like line little live long look love made make man many may me mean men might mile milk mind miss money month moon more morning most mother mountain move much must my name near need never new next night no north not now number of off often oil old on once one only open or other our out over own page paper part people place plant play point put question rain ran read red rest right river road rock room round run said same saw say school sea second see seem set seven she ship short should show side since six sleep small so some song soon sound south space stand star start state stay still stop story study such summer sun take talk tell ten than that the their them then there these they thing think this those though three through time to today together too took top tree try turn two under until up upon us use very walk want warm was watch water way we week well went were west what wheel when where which while white who why will wind winter with without word work world would write year yet you young your""".split())

def estimate_lexile(text):
    sents = sentences(text)
    ws = words(text)
    if not sents or not ws:
        return None, {}
    n_sent = len(sents)
    n_word = len(ws)
    syl = sum(count_syllables(w) for w in ws)
    asl = n_word / n_sent                      # avg sentence length
    asw = syl / n_word                         # avg syllables/word
    # Flesch-Kincaid Grade
    fkg = 0.39 * asl + 11.8 * asw - 15.59
    # Flesch Reading Ease
    fre = 206.835 - 1.015 * asl - 84.6 * asw
    # "hard word" fraction (not in EASY core, >6 chars or >2 syllables)
    hard = [w for w in ws if w.lower() not in EASY and (len(w) > 6 or count_syllables(w) > 2)]
    pdw = 100.0 * len(hard) / n_word           # percent difficult words
    # Lexile estimate: blend of sentence-length & word-frequency proxies.
    # Calibrated rough mapping: Lexile ~ 100*FKG + 180 ... but FKG saturates,
    # so use a sentence/word model closer to the Lexile theory:
    #   higher ASL and higher hard-word% -> higher Lexile.
    lex_est = 30.0 * asl + 16.0 * pdw + 90.0 * asw - 40.0
    return lex_est, dict(n_sent=n_sent, n_word=n_word, asl=round(asl,2),
                         asw=round(asw,3), fkg=round(fkg,2), fre=round(fre,1),
                         pdw=round(pdw,1), lex_est=round(lex_est))

def declared(meta):
    raw = str(meta.get("lexile","")).upper().replace("L","").strip()
    try:
        return int(raw)
    except:
        return None

def main():
    folders = [("2026-07","고1/Saturn"),("2026-07-J","고2/Jupiter"),("2026-07-Sun","고3/Sun")]
    base = os.path.join(os.path.dirname(__file__), "..", "content", "passages")
    out = []
    for folder, label in folders:
        for f in sorted(glob.glob(os.path.join(base, folder, "*.json"))):
            d = json.load(open(f, encoding="utf-8"))
            meta = d.get("meta", {})
            body = strip_markup(d.get("page1",{}).get("body",""))
            dec = declared(meta)
            est, m = estimate_lexile(body)
            seq = meta.get("sequence", os.path.basename(f))
            out.append(dict(grade=label, folder=folder, seq=seq,
                            file=os.path.basename(f), declared=dec,
                            **m))
    # print table
    print(f"{'GRADE':14} {'#':>3} {'DECL':>5} {'EST':>5} {'DIFF':>6} {'ASL':>6} {'PDW%':>5} {'FKG':>5} {'FRE':>6} {'WORDS':>5}")
    for r in out:
        diff = (r['lex_est'] - r['declared']) if (r.get('lex_est') is not None and r['declared']) else None
        ds = f"{diff:+}" if diff is not None else "  ?"
        print(f"{r['grade']:14} {str(r['seq']):>3} {str(r['declared']):>5} "
              f"{str(r.get('lex_est')):>5} {ds:>6} {str(r.get('asl')):>6} "
              f"{str(r.get('pdw')):>5} {str(r.get('fkg')):>5} {str(r.get('fre')):>6} {str(r.get('n_word')):>5}")
    # write json for downstream
    with open(os.path.join(os.path.dirname(__file__), "lexile-audit-result.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
