"""Lossless PDF image recompression using PNG predictor + zopfli.

Pixel-identical to the source. Replaces FlateDecode raw streams with
FlateDecode + Predictor=15 (PNG Optimum) using zopfli-compressed IDAT.

Usage:
    python compress_pdf_lossless.py <src.pdf> <dst.pdf> [iterations]
"""
import sys, os, io, time
from concurrent.futures import ProcessPoolExecutor, as_completed
import pikepdf
from PIL import Image
from zopfli.zopfli import png_optimize


def extract_idat(png_bytes: bytes) -> bytes:
    pos = 8
    parts = []
    while pos < len(png_bytes):
        length = int.from_bytes(png_bytes[pos:pos+4], 'big')
        ctype = png_bytes[pos+4:pos+8]
        data = png_bytes[pos+8:pos+8+length]
        if ctype == b'IDAT':
            parts.append(data)
        pos += 8 + length + 4
        if ctype == b'IEND':
            break
    return b''.join(parts)


def recompress_image(args):
    raw_pixels, w, h, mode, iters_large = args
    img = Image.frombytes(mode, (w, h), raw_pixels)
    buf = io.BytesIO()
    img.save(buf, format='PNG', compress_level=9, optimize=True)
    pil_png = buf.getvalue()
    zopt = png_optimize(pil_png, num_iterations=15, num_iterations_large=iters_large)
    return extract_idat(zopt)


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]; dst = sys.argv[2]
    iters_large = int(sys.argv[3]) if len(sys.argv) > 3 else 5

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
    print(f'Found {len(images)} unique images to recompress')

    tasks = []
    meta = []
    for obj in images:
        w = int(obj['/Width']); h = int(obj['/Height'])
        cs = obj.get('/ColorSpace')
        bpc = int(obj.get('/BitsPerComponent', 8))
        if bpc != 8:
            print(f'  skip {obj.objgen}: {bpc} bpc not supported'); continue
        cs_str = str(cs)
        if 'DeviceGray' in cs_str:
            mode = 'L'; colors = 1
        elif 'DeviceCMYK' in cs_str:
            mode = 'CMYK'; colors = 4
        else:
            mode = 'RGB'; colors = 3
        try:
            raw = obj.read_bytes()
        except Exception as e:
            print(f'  skip {obj.objgen}: read error {e}'); continue
        expected = w * h * colors
        if len(raw) != expected:
            print(f'  skip {obj.objgen}: size mismatch ({len(raw)} vs {expected})'); continue
        tasks.append((raw, w, h, mode, iters_large))
        meta.append((obj, w, h, colors))

    print(f'Recompressing {len(tasks)} images with zopfli (iter={iters_large}) ...')

    results = [None] * len(tasks)
    with ProcessPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(recompress_image, t): i for i, t in enumerate(tasks)}
        done = 0
        for f in as_completed(futures):
            i = futures[f]
            try:
                results[i] = f.result()
                done += 1
                old = len(tasks[i][0])
                new = len(results[i])
                obj, w, h, c = meta[i]
                print(f'  [{done}/{len(tasks)}] {obj.objgen} {w}x{h} -> {new/1024:.0f}KB '
                      f'(raw {old/1024/1024:.1f}MB, {(1-new/old)*100:.0f}% vs raw)', flush=True)
            except Exception as e:
                print(f'  [{i}] FAILED: {e}'); results[i] = None

    print('Updating PDF object streams ...')
    for (obj, w, h, colors), idat in zip(meta, results):
        if idat is None: continue
        from pikepdf import Name, Dictionary
        # Replace stream content with IDAT-compatible data + Predictor=15
        obj.write(
            idat,
            filter=Name('/FlateDecode'),
            decode_parms=Dictionary({
                '/Predictor': 15,
                '/Columns': w,
                '/Colors': colors,
                '/BitsPerComponent': 8,
            }),
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
    print(f'Total time : {time.time() - t_start:.1f}s')


if __name__ == '__main__':
    main()
