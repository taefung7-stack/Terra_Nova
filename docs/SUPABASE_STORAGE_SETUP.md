# Supabase Storage 설정 (샘플 PDF 배포)

## 1. 버킷 생성

Supabase 대시보드 > **Storage** > **New bucket**

### Public 버킷 (무료 샘플용)
- **Name**: `sample-pdfs`
- **Public bucket**: ✅ ON
- **File size limit**: 20 MB
- **Allowed MIME types**: `application/pdf`

### Private 버킷 (구독 회원 전용 교재)
- **Name**: `premium-pdfs`
- **Public bucket**: ❌ OFF (기본)
- **File size limit**: 50 MB
- **Allowed MIME types**: `application/pdf`

## 2. Storage RLS 정책

**Storage > premium-pdfs > Policies > New policy** 클릭:

### 정책 1: 구독 회원만 다운로드
```sql
-- Policy name: subscribers_can_read
-- Allowed operation: SELECT
-- Target roles: authenticated

(
  auth.uid() IN (
    SELECT user_id FROM public.subscriptions
    WHERE status = 'active' AND expires_at > now()
  )
)
```

### 정책 2: public 샘플은 누구나 조회 (이미 public bucket이라 자동)

## 3. PDF 업로드 (관리자)

### 방법 A: 대시보드
1. Storage > `sample-pdfs` > **Upload file**
2. 파일명 규칙 권장:
   - `sample_basic_vocab_01.pdf`
   - `sample_advanced_reading_01.pdf`
   - `sample_master_mock_01.pdf`

### 방법 B: CLI (대량 업로드)
```bash
supabase storage upload sample-pdfs ./samples/basic_vocab.pdf
```

## 4. 프론트엔드에서 PDF 링크 가져오기

### Public 파일 (샘플):
```javascript
const { data } = supabase.storage.from('sample-pdfs').getPublicUrl('sample_basic_vocab_01.pdf');
// data.publicUrl → 직접 다운로드 가능
```

### Private 파일 (구독자만 - 시간 제한 서명 URL):
```javascript
const { data, error } = await supabase.storage.from('premium-pdfs')
  .createSignedUrl('2026_04_intermediate.pdf', 300); // 5분 유효
// data.signedUrl → 개인화된 다운로드 링크
```

## 5. sample.html 연동 예시
sample.html의 "샘플 다운로드" 버튼을 다음과 같이 교체:

```html
<button class="btn-download" data-pdf="sample_basic_vocab_01.pdf">
  📥 BASIC 샘플 PDF 다운로드
</button>

<script type="module">
  import { supabase } from './supabase-client.js';
  document.querySelectorAll('[data-pdf]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fileName = btn.dataset.pdf;
      const { data } = supabase.storage.from('sample-pdfs').getPublicUrl(fileName);
      window.open(data.publicUrl, '_blank');
      // GA 이벤트 추적
      window.trackEvent?.('sample_download', { file: fileName });
    });
  });
</script>
```

## 6. 디렉토리 구조 권장

```
sample-pdfs/          (public)
├── starter_vocab_sample.pdf
├── junior_vocab_sample.pdf
├── basic_reading_sample.pdf
├── intermediate_reading_sample.pdf
├── advanced_mock_sample.pdf
└── master_mock_sample.pdf

premium-pdfs/         (private, 구독자만)
├── 2026/
│   ├── 01/
│   │   ├── basic.pdf
│   │   ├── intermediate.pdf
│   │   └── ...
│   └── 02/
└── ...
```
