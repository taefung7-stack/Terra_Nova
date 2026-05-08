"""Compress PDF images to JPEG q=98 with no chroma subsampling.

Visually indistinguishable from the source PNG (200% zoom OK).
Replaces FlateDecode pixel streams with DCTDecode (JPEG) streams.

Usage:
    python compress_pdf_jpeg98.py <src.pdf> <dst.pdf>
"""
import sys, os, io, time
from concurrent.futures import ProcessPoolExecutor, as_completed
import pikepdf
from PIL import Image


def encode_jpeg(args):
    raw_pixels, w, h, mode, quality = args
    img = Image.frombytes(mode, (w, h), raw_pixels)
    buf = io.BytesIO()
    img.save(
        buf,
        format='JPEG',
        quality=quality,
        subsampling=0,        # 4:4:4 full chroma
        optimize=True,
        progressive=False,    # baseline JPEG required by PDF DCTDecode
    )
    return buf.getvalue()


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]
    quality = int(sys.argv[3]) if len(sys.argv) > 3 else 98

    t_start = time.time()
    pdf = pikepdf.open(src)

    images = []
    seen = set()
    for page in pdf.pages:
        if '/Resources' not in page: continue
        if '/XObject' not in page['/Resources']: continue
        for _name, obj in page['/Resources']['/XObject'].items():
            if obj.get('/Subtype') != '/Image': continue
            if obj.objgen in seen: continue
            seen.add(obj.objgen)
            images.append(obj)

    print(f'Source: {src}  ({os.path.getsize(src)/1024/1024:.1f} MB)')
    print(f'Found {len(images)} unique images, target JPEG q={quality} (subsampling 4:4:4)')

    tasks = []
    meta = []
    for obj in images:
        w, h = int(obj['/Width']), int(obj['/Height'])
        bpc = int(obj.get('/BitsPerComponent', 8))
        if bpc != 8:
            print(f'  skip {obj.objgen}: bpc {bpc}'); continue
        cs_str = str(obj.get('/ColorSpace'))
        if 'DeviceGray' in cs_str:
            mode, colors = 'L', 1
        elif 'DeviceCMYK' in cs_str:
            mode, colors = 'CMYK', 4
        else:
            mode, colors = 'RGB', 3
        try:
            raw = obj.read_bytes()
        except Exception as e:
            print(f'  skip {obj.objgen}: {e}'); continue
        if len(raw) != w * h * colors:
            print(f'  skip {obj.objgen}: size mismatch'); continue
        tasks.append((raw, w, h, mode, quality))
        meta.append((obj, w, h, colors))

    print(f'Encoding {len(tasks)} images in parallel ...')
    results = [None] * len(tasks)
    with ProcessPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(encode_jpeg, t): i for i, t in enumerate(tasks)}
        done = 0
        for f in as_completed(futures):
            i = futures[f]
            results[i] = f.result()
            done += 1
            obj, w, h, c = meta[i]
            print(f'  [{done}/{len(tasks)}] {obj.objgen} {w}x{h} -> {len(results[i])/1024:.0f}KB',
                  flush=True)

    print('Replacing PDF image streams with JPEG (DCTDecode) ...')
    from pikepdf import Name
    for (obj, w, h, colors), jpg in zip(meta, results):
        if jpg is None: continue
        # Write JPEG bytes as already-encoded DCTDecode stream
        obj.write(
            jpg,
            filter=Name('/DCTDecode'),
        )

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
    print(f'Time       : {time.time() - t_start:.1f}s')


if __name__ == '__main__':
    main()
