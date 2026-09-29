import json,re,sys,fitz,html
# 사용: cd 이 폴더 && PYTHONIOENCODING=utf-8 python _xcheck.py
raw=open('_PDF-RAW.txt',encoding='utf8').read().splitlines()
chap={};cur=None;heads=[]
for ln in raw:
    if ln.startswith('@'): cur=tuple(ln[1:].split()); chap[cur]=[]; continue
    if ln.startswith('#H'): heads.append((cur,ln[3:])); continue
    chap[cur].append(ln)
ws=lambda s: re.sub(r'\s+',' ',s).strip()
def plain(h):
    h=re.sub(r'<span class="slash">\s*/\s*</span>',' ',h); h=re.sub(r'<[^>]+>','',h); return ws(html.unescape(h))
errs=0
def bad(m):
    global errs; errs+=1; print('   ❌',m)
def diff(a,b,label):
    if a==b: return True
    k=0
    while k<min(len(a),len(b)) and a[k]==b[k]: k+=1
    bad(f'{label} 불일치 @{k}\n      원본: …{a[max(0,k-50):k+50]}\n      대상: …{b[max(0,k-50):k+50]}')
    return False
PDF={'L5':('봉영여중3_비상김진완_Lesson5_본문분석_합본.pdf','봉영여중3_비상김진완_Lesson5_본문암기.pdf'),
     'L6':('봉영여중3_비상김진완_Lesson6_본문분석_합본.pdf','봉영여중3_비상김진완_Lesson6_본문암기.pdf'),
     'L7':('봉영여중3_비상김진완_Lesson7_본문분석_합본.pdf','봉영여중3_비상김진완_Lesson7_본문암기.pdf')}
def pdftext(p):
    t=' '.join(pg.get_text() for pg in fitz.open(p))
    t=ws(t); return re.sub(r'(\w)- (\w)',r'\1-\2',t)
total_chars=0;total_sent=0
for L in ['L5','L6','L7']:
    src=json.loads(__import__('subprocess').check_output(['node','-e',f"import('./_SOURCE-{L}.js').then(m=>console.log(JSON.stringify(m.SOURCE)))"],text=True,encoding='utf8'))
    comb=pdftext(f'dist/{L}/{PDF[L][0]}'); mem=pdftext(f'dist/{L}/{PDF[L][1]}')
    print(f'== {L}')
    for ch in src:
        n=ch['no']; R=ws(' '.join(chap[(L,str(n))]))
        S=ws(' '.join(ch['sentences']))
        d=json.load(open(f'data/{L}/{n}.json',encoding='utf8'))
        P=ws(' '.join(d['passage'])); C=ws(' '.join(plain(s['en_html']) for s in d['sentences']))
        ok=diff(R,S,f'Ch{n} 원본↔정본') & diff(R,P,f'Ch{n} 원본↔JSON passage') & diff(R,C,f'Ch{n} 원본↔분석카드')
        # 문자 집합·단어 수
        rw=R.split(); total_chars+=len(R); total_sent+=len(ch['sentences'])
        if len(d['passage_ko'])!=len(ch['sentences']) or any(not k.strip() for k in d['passage_ko']): bad(f'Ch{n} 해석 누락')
        miss=[]
        for s in ch['sentences']:
            s2=ws(s); c=comb.count(s2); m=mem.count(s2)
            if c<2 or m<1: miss.append((c,m,s2))
        for c,m,s2 in miss: bad(f'Ch{n} PDF 수록 부족(합본 {c}회·암기 {m}회): {s2}')
        print(f'   Ch{n}: 원본 {len(rw)}단어 {len(R)}자 · 문장 {len(ch["sentences"])} → 정본/JSON/카드 {"일치" if ok else "불일치"} · PDF 합본≥2·암기≥1 {"OK" if not miss else "부족"}')
    # 암기장: 한글 제시문 전수
    for ch in src:
        d=json.load(open(f'data/{L}/{ch["no"]}.json',encoding='utf8'))
        for k in d['passage_ko']:
            if ws(k) not in mem: bad(f'{L} 암기장 한글 누락: {k}')
print('\n제외된 비문장 요소(소제목·인물·후기 작성자·캡션):',len(heads))
for c,h in heads: print('   ',c[0],'Ch'+c[1],'|',h)
print(f'\n총 원문 {total_sent}문장 {total_chars}자 · 오류 {errs}')
