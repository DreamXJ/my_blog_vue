#!/usr/bin/env python3
"""Read a docx file and print its text content."""
import sys
import zipfile
import xml.etree.ElementTree as ET

docx_path = sys.argv[1]
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    root = ET.fromstring(xml_content)
    paragraphs = root.findall('.//w:p', ns)
    for p in paragraphs:
        texts = []
        for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if t.text:
                texts.append(t.text)
        line = ''.join(texts)
        if line.strip():
            print(line)
