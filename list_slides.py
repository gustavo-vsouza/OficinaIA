import re
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Since we want to find Capa, it might be an h1
for m in re.finditer(r'<section class="slide" data-index="(\d+)".*?<h[12] class="slide-title[^"]*">(.*?)</h[12]>', html, re.DOTALL):
    print(f'{m.group(1)}: {m.group(2).strip()}')
