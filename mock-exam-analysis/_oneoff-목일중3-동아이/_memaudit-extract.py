#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""본문암기 / 본문분석 PDF → 텍스트 덤프 (산출물 검수 입력 생성)

★ 함정 1: ghostscript txtwrite 로 뽑으면 암기장 정답면이 **2단 조판**이라
   좌우 단을 한 줄씩 번갈아 읽는다. 그러면 줄바꿈된 문장이 반대쪽 단 문장과
   뒤섞여 "정답면에 없음" 오탐이 무더기로 난다(PDF 내용은 멀쩡하다).
   그래서 x좌표로 단을 갈라 좌단 전체 → 우단 전체 순으로 잇는다.

★ 함정 2: 분석지 PDF 는 텍스트 레이어에서 영문이 `s c i e n t i f i c` 처럼
   자간 분리되어 추출된다. 대조할 때는 **공백을 모두 제거하고** 비교할 것.

  python _memaudit-extract.py        # L6·L7·L8
  python _memaudit-extract.py L7     # 한 과만
"""
import sys, os, io
import fitz

HERE = os.path.dirname(os.path.abspath(__file__))

COMBINED_PDF = {
    'L6': '목일중3_동아이병민_Lesson6_본문분석_합본.pdf',
    'L7': '목일중3_동아이병민_Lesson7_본문분석_합본.pdf',
    'L8': '목일중3_동아이병민_Lesson8_본문분석_합본.pdf',
}

OUT_PDF = {
    'L6': '목일중3_동아이병민_Lesson6_본문암기.pdf',
    'L7': '목일중3_동아이병민_Lesson7_본문암기.pdf',
    'L8': '목일중3_동아이병민_Lesson8_본문암기.pdf',
}

ALL = ['L6', 'L7', 'L8']


def page_text(page):
    """2단 조판을 좌단→우단 순으로 읽는다."""
    mid = page.rect.width / 2
    blocks = page.get_text('blocks')          # (x0,y0,x1,y1,text,bno,btype)
    left, right = [], []
    for b in blocks:
        if b[6] != 0:                          # 이미지 블록 제외
            continue
        (left if (b[0] + b[2]) / 2 < mid else right).append(b)
    left.sort(key=lambda b: (round(b[1], 1), b[0]))
    right.sort(key=lambda b: (round(b[1], 1), b[0]))
    return '\n'.join(b[4] for b in left + right)


def dump_analysis(L, a_dir):
    """본문분석 합본 + 챕터별 PDF 를 텍스트로 뽑는다(분석지는 1단이라 단 분리 불필요)."""
    rc = 0
    dist = os.path.join(HERE, 'dist', L)
    combined = os.path.join(dist, COMBINED_PDF[L])
    if os.path.exists(combined):
        doc = fitz.open(combined)
        txt = chr(10).join(pg.get_text() for pg in doc)
        doc.close()
        with io.open(os.path.join(a_dir, f'{L}-combined.txt'), 'w', encoding='utf-8') as f:
            f.write(txt)
        print(f'  OK {L}-combined -> dist/_audit/{L}-combined.txt')
    else:
        print(f'  X {L}: 합본 PDF 없음 — 먼저 combine.mjs')
        rc = 1

    n = 0
    while os.path.exists(os.path.join(dist, f'{n + 1}.pdf')):
        n += 1
        doc = fitz.open(os.path.join(dist, f'{n}.pdf'))
        txt = chr(10).join(pg.get_text() for pg in doc)
        doc.close()
        with io.open(os.path.join(a_dir, f'{L}-{n}.txt'), 'w', encoding='utf-8') as f:
            f.write(txt)
    print(f'  OK {L} 챕터 {n}개 -> dist/_audit/{L}-N.txt')
    return rc


def main():
    arg = (sys.argv[1] if len(sys.argv) > 1 else '').upper()
    targets = [arg] if arg else ALL
    unknown = [t for t in targets if t not in ALL]
    if unknown:
        print(f'알 수 없는 과: {", ".join(unknown)} (L6 / L7 / L8)')
        sys.exit(2)

    out_dir = os.path.join(HERE, 'dist', '_memaudit')
    os.makedirs(out_dir, exist_ok=True)
    rc = 0
    for L in targets:
        pdf = os.path.join(HERE, 'dist', L, OUT_PDF[L])
        if not os.path.exists(pdf):
            print(f'  X {L}: 암기장 PDF 없음 — 먼저 build-memorize.mjs')
            rc = 1
        else:
            doc = fitz.open(pdf)
            pages = [page_text(p) for p in doc]
            doc.close()
            with io.open(os.path.join(out_dir, f'{L}.txt'), 'w', encoding='utf-8') as f:
                f.write('\n<<<PAGE>>>\n'.join(pages))
            print(f'  OK {L}  {len(pages)}p -> dist/_memaudit/{L}.txt')

        a_dir = os.path.join(HERE, 'dist', '_audit')
        os.makedirs(a_dir, exist_ok=True)
        if dump_analysis(L, a_dir):
            rc = 1
    sys.exit(rc)


if __name__ == '__main__':
    main()
