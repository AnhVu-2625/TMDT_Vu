with open(r'D:\Năm 3\HK225\TMDT1\MAIN.doc', 'rb') as f:
    data = f.read()

print('Total size:', len(data))
print('First 32 hex:', data[:32].hex())
print('First 128 raw repr:', repr(data[:128]))

# Check for common magic bytes
if data[:2] == b'PK':
    print('This is a ZIP/DOCX file')
elif data[:8] == b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1':
    print('This is an OLE2/CFB file (old .doc format)')
else:
    print('Unknown format')

# Search for readable unicode text in the file
import struct

# Try to find "WordDocument" stream (old .doc format)
if b'WordDocument' in data:
    print('Contains WordDocument stream reference')

# Try to find any Vietnamese text
text_chunks = []
i = 0
while i < len(data) - 1:
    # Try UTF-16LE decoding of two bytes
    char = struct.unpack_from('<H', data, i)[0]
    if 0x0020 <= char <= 0x1EF9 and char != 0xFFFE and char != 0xFFFF:
        text_chunks.append(chr(char))
        i += 2
    else:
        if len(text_chunks) > 20:
            chunk = ''.join(text_chunks)
            if any(ord(c) > 127 for c in chunk):
                print('Found text:', chunk[:300])
        text_chunks = []
        i += 2

if len(text_chunks) > 20:
    chunk = ''.join(text_chunks)
    if any(ord(c) > 127 for c in chunk):
        print('Found text:', chunk[:300])
