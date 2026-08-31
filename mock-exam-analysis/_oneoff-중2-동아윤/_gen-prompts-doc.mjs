#!/usr/bin/env node
/* JSON 의 illustration.prompt 를 읽어 _ILLUSTRATION_PROMPTS.md 를 생성한다.
   (저작은 JSON 에서 이뤄졌으므로 문서를 JSON 에 맞춘다.
    이후 문서를 고쳤다면 _sync-prompts.mjs 로 되밀어 넣을 것 — 양방향 일치.) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = [
  { id: 'L5', title: 'Street Art in London',
    desc: '교과서 소재: 런던 거리 예술 투어 → STIK(선과 점) → Banksy(초록 나무) → Ben Wilson(껌 그림).\n세 장이 **거리 벽화 / 공원 벽면 / 보도 바닥 접사**로 확실히 갈리게 구성했다.' },
  { id: 'L6', title: 'Dr. Schofield, a Foreigner Who Loved Korea',
    desc: '교과서 소재: 1919년 3·1 운동 촬영 → 석호필의 삶 → 기사 송고 → 귀환과 영면.\n실존 인물이므로 **인물 묘사 대신 사물·장소 중심 정물/풍경**으로 구성했다.\n네 장이 **창밖 군중 / 의학 강의실 / 타자기 책상 / 현충원 풍경**으로 갈린다.' },
];

let out = `# 중2 동아(윤정미) Lesson 5·6 — 삽화 프롬프트 (전 7장)

> 규격: **\`--ar 16:5 --v 8.1\`** (와이드 배너)
> 톤: **실사 사진(포토리얼)** — 여행·다큐멘터리 톤, 흐린 날 확산광.
>
> **밝기는 형용사가 아니라 조명 조건으로 지정한다.** \`bright\`·\`sunlit\`·\`luminous\`
> 같은 형용사는 실사에서 미드저니가 **황금빛 저녁 + 강한 역광**으로 해석해
> 오히려 어두워진다. 대신 다음을 쓴다 —
> \`natural soft diffused daylight\` · \`bright overcast sky\` · \`high-key exposure\`
> · \`low contrast\` · \`airy\` · \`clean bright background\`.
>
> \`cinematic\` \`golden hour\` \`dramatic lighting\` \`chiaroscuro\` \`moody\` \`neon\` \`night\`
> 는 **지시부에서 금지**. 단 \`NO ~\` 배제절 안에서는 오히려 명시해 밀어낸다.
>
> 인물은 **얼굴 클로즈업을 피하고** 손·뒷모습·소품 위주로 — 교재 삽화이므로
> 특정인 초상을 만들지 않는다. 중학생 대상이라 무겁거나 비장한 연출도 피한다.
> **Lesson 6 은 실존 인물(Frank W. Schofield)을 다루므로 인물을 그리지 않는다.**
>
> **7장이 서로 닮지 않도록** 각 프롬프트에 다른 챕터의 소재를 \`NO ~\` 로 배제했다.
>
> 생성한 이미지를 \`dist/{L5,L6}/assets/illust-{N}.png\` 로 저장한 뒤
> 분석지를 재빌드하면 자동 반영된다.
>
> \`\`\`bash
> cd mock-exam-analysis
> L=L5   # 또는 L6
> node builder/build.mjs "_oneoff-중2-동아윤/data/$L" "_oneoff-중2-동아윤/dist/$L" \
>   --styles="_oneoff-중2-동아윤/styles/analysis.css"
> node builder/pdf.mjs "_oneoff-중2-동아윤/dist/$L"
> node "_oneoff-중2-동아윤/combine.mjs" $L
> \`\`\`
`;

for (const L of LESSONS) {
  const { SOURCE } = await import(`./_SOURCE-${L.id}.js`);
  out += `\n---\n\n## ${L.id.replace('L','Lesson ')} — ${L.title}\n\n${L.desc}\n`;
  for (const ch of SOURCE) {
    const p = path.join(HERE, 'data', L.id, `${ch.no}.json`);
    if (!fs.existsSync(p)) { console.error(`  (건너뜀) ${L.id}/${ch.no} 없음`); continue; }
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const kw = (d.vocab || []).slice(0, 4).map(v => v.word).join(', ');
    out += `\n### Ch${ch.no} · ${ch.title} — ${ch.subtitle.split('—').pop().trim()}\n\n`;
    out += `- 저장 경로: \`dist/${L.id}/${d.illustration.file}\`\n`;
    out += `- 원문 ${ch.sentences.length}문장 · 키워드: ${kw}\n\n`;
    out += '```\n' + d.illustration.prompt + '\n```\n';
  }
}

fs.writeFileSync(path.join(HERE, '_ILLUSTRATION_PROMPTS.md'), out, 'utf8');
console.log('_ILLUSTRATION_PROMPTS.md 생성 완료');
