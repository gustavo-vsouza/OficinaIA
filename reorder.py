import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

parts = re.split(r'(<section class=\"slide\" data-index=\"\d+\")', html)
starts = [m.start() for m in re.finditer(r'<section class=\"slide\" data-index=\"\d+\"', html)]
starts.append(html.find('</div>\n  </main>'))

before = html[:starts[0]]
after = html[starts[-1]:]

slides = {}
for i in range(len(starts) - 1):
    slide_html = html[starts[i]:starts[i+1]]
    m = re.search(r'data-index=\"(\d+)\"', slide_html)
    if m:
        slides[int(m.group(1))] = slide_html

# Slide 11: Remove Timer
s11 = slides[11]
s11 = s11.replace('grid lg:grid-cols-5 gap-6', 'max-w-4xl mx-auto')
s11 = s11.replace('lg:col-span-3 ', '')
idx = s11.find('<!-- Cronômetro -->')
if idx != -1:
    s11 = s11[:idx] + '  </div>\n          </div>\n        </div>\n      </section>\n\n      '
slides[11] = s11

# Slide 12: Add Timer
s12 = slides[12]
timer_html = '''
              <!-- Cronômetro -->
              <div class=\"rounded-2xl border border-line bg-surface p-6 flex flex-col\">
                <p class=\"text-xs font-semibold text-ink/50 mb-4\">Cronômetro da dinâmica</p>
                <div class=\"flex-1 flex flex-col items-center justify-center text-center gap-4\">
                  <p id=\"timerDisplay\" class=\"timer-display text-5xl sm:text-6xl text-brand-deep dark:text-brand-glow\">
                    15:00</p>
                  <div class=\"timer-track w-full max-w-[220px]\">
                    <div id=\"timerFill\" class=\"timer-fill\"></div>
                  </div>
                  <div class=\"flex flex-wrap gap-2 justify-center\" id=\"timerPresets\">
                    <button class=\"timer-preset\" data-mins=\"10\">10 min</button>
                    <button class=\"timer-preset is-active\" data-mins=\"15\">15 min</button>
                    <button class=\"timer-preset\" data-mins=\"20\">20 min</button>
                  </div>
                  <div class=\"flex flex-wrap gap-2 mt-2 justify-center\">
                    <button id=\"timerStart\" class=\"timer-ctrl bg-brand text-white\">Iniciar</button>
                    <button id=\"timerPause\" class=\"timer-ctrl bg-brand-light dark:bg-brand-deep/25 text-brand\" disabled>Pausar</button>
                    <button id=\"timerReset\" class=\"timer-ctrl bg-surface text-ink/60\"
                      style=\"border:1px solid var(--c-line);\">Resetar</button>
                  </div>
                </div>
              </div>
'''

s12 = s12.replace('grid lg:grid-cols-2 gap-6', 'grid lg:grid-cols-3 gap-6')
s12 = re.sub(r'(<div id=\"scoreboardList\".*?</div>\s*<p id=\"scoreboardEmpty\".*?</p>\s*<button id=\"resetScoreboard\".*?</button>\s*</div>)', r'\1' + timer_html, s12, flags=re.DOTALL)
slides[12] = s12

new_order = [0, 1, 2, 6, 4, 7, 8, 9, 10, 12, 3, 14, 15, 11, 16]

final_slides_html = ''
for i, idx in enumerate(new_order):
    slide = slides[idx]
    slide = re.sub(r'data-index=\"\d+\"', f'data-index=\"{i}\"', slide)
    slide = re.sub(r'aria-label=\"Slide \d+ de \d+', f'aria-label=\"Slide {i+1} de {len(new_order)}', slide)
    final_slides_html += slide

after = re.sub(r'01 / \d+', f'01 / {len(new_order)}', after)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(before + final_slides_html + after)
