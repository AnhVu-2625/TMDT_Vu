import struct, re

with open(r'D:\Năm 3\HK225\TMDT1\MAIN.doc', 'rb') as f:
    data = f.read()

out = []
results = []
i = 0
while i < len(data) - 1:
    b = struct.unpack_from('<H', data, i)[0]
    if 0x20 <= b <= 0x1EF9 and b not in (0xFFFE, 0xFFFF):
        out.append(chr(b))
        i += 2
    else:
        if len(out) > 20:
            chunk = ''.join(out)
            results.append(chunk)
        out = []
        i += 1

if len(out) > 20:
    results.append(''.join(out))

with open(r'D:\Năm 3\HK225\TMDT1\doc_output.txt', 'w', encoding='utf-8') as f:
    for r in results:
        f.write(r + '\n---\n')

print(f'Extracted {len(results)} text chunks')
print('First few:')
for r in results[:30]:
    print(r[:200])
    print('---')
