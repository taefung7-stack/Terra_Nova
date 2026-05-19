"""Re-compress already-JPEG-encoded PDF images at a lower quality.

Unlike compress_pdf_jpeg98.py (which expects raw pixel streams), this script
handles PDFs whose images are already DCTDecode (JPEG) — it decodes via PIL,
then re-encodes at the target quality with chroma subsampling 4:4:4.

Usage:
    python recompress_pdf_jpeg.py <src.pdf> <dst.pdf> [quality=85]
"""
import sys, os, io, time
from concurrent.futures import ProcessPoolExecutor, as_completed
import pikepdf
from PIL import Image
from pikepdf import Name


def recompress(args):
    """Decode an image and re-encode at the given JPEG quality."""
    jpeg_bytes, quality, mode_hint = args
    try:
        img = Image.open(io.BytesIO(jpeg_bytes))
        img.load()
        if img.mode not in ('RGB', 'L', 'CMYK'):
            img = img.convert('RGB')
        buf = io.BytesIO()
        img.save(
            buf,
            format='JPEG',
            quality=quality,
            subsampling=0,        # 4:4:4 chroma — no color smearing
            optimize=True,
            progressive=False,
        )
        return buf.getvalue(), img.mode
    except Exception as e:
        return None, str(e)


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]
    dst = sys.argv[2]
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 85

    t0 = time.time()
    pdf = pikepdf.open(src)

    tasks = []
    meta = []  # (obj, original_size)
    seen = set()
    for page in pdf.pages:
        if '/Resources' not in page: continue
        if '/XObject' not in page['/Resources']: continue
        for _name, obj in page['/Resources']['/XObject'].items():
            if obj.get('/Subtype') != '/Image': continue
            if obj.objgen in seen: continue
            seen.add(obj.objgen)

            filt = obj.get('/Filter')
            filt_str = str(filt) if filt is not None else ''
            # Only handle DCTDecode (already JPEG) — the most common large image
            if 'DCTDecode' not in filt_str:
                continue
            try:
                raw = obj.read_raw_bytes()
            except Exception:
                continue
            mode_hint = 'RGB'
            cs = str(obj.get('/ColorSpace', ''))
            if 'DeviceGray' in cs:
                mode_hint = 'L'
            elif 'DeviceCMYK' in cs:
                mode_hint = 'CMYK'
            tasks.append((raw, quality, mode_hint))
            meta.append((obj, len(raw)))

    print(f'Source: {src}  ({os.path.getsize(src)/1024/1024:.1f} MB)')
    print(f'Found {len(tasks)} DCTDecode images, target JPEG q={quality}')

    if not tasks:
        print('No DCTDecode images found — nothing to recompress.')
        return

    results = [None] * len(tasks)
    with ProcessPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(recompress, t): i for i, t in enumerate(tasks)}
        done = 0
        saved_total = 0
        for f in as_completed(futures):
            i = futures[f]
            data, info = f.result()
            results[i] = data
            done += 1
            obj, orig = meta[i]
            if data is None:
                print(f'  [{done}/{len(tasks)}] {obj.objgen}  FAIL: {info}', flush=True)
            else:
                saved = orig - len(data)
                saved_total += saved
                print(f'  [{done}/{len(tasks)}] {obj.objgen}  {orig/1024:.0f}KB → {len(data)/1024:.0f}KB  ({(1-len(data)/orig)*100:+.0f}%)',
                      flush=True)
        print(f'Total inline image savings: {saved_total/1024/1024:.1f} MB')

    print('Replacing PDF image streams ...')
    for (obj, _), data in zip(meta, results):
        if data is None: continue
        obj.write(data, filter=Name('/DCTDecode'))

    print('Saving optimized PDF ...')
    pdf.save(dst,
             linearize=True,
             compress_streams=True,
             stream_decode_level=pikepdf.StreamDecodeLevel.specialized,
             object_stream_mode=pikepdf.ObjectStreamMode.generate,
             recompress_flate=False)
    pdf.close()

    old_sz = os.path.getsize(src) / 1024 / 1024
    new_sz = os.path.getsize(dst) / 1024 / 1024
    print('-' * 60)
    print(f'Source     : {old_sz:.1f} MB')
    print(f'Optimized  : {new_sz:.1f} MB')
    print(f'Saved      : {old_sz - new_sz:.1f} MB  ({(1 - new_sz/old_sz)*100:.1f}%)')
    print(f'Time       : {time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
